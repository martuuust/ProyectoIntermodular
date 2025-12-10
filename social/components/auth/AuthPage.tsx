import React, { useState, useRef, useEffect } from 'react';
import Logo from '../Logo';
import { CloseIcon, GoogleIcon } from '../icons/Icons';
import { useTranslations } from '../../context/LanguageContext';
import { GoogleGenAI } from "@google/genai";
import { User } from '../../types';

// Extend window type to include google accounts
declare global {
  interface Window {
    google: any;
  }
}

interface GoogleUserPayload {
  name: string;
  email: string;
  avatar: string;
}

interface AuthPageProps {
  onClose: () => void;
  onRegister: (user: User) => void;
  onLogin: (name: string) => boolean;
  onGoogleLogin: (payload: GoogleUserPayload) => void;
  initialView?: 'login' | 'signup';
}

type AuthView = 'login' | 'signup' | 'verify';

// --- JWT DECODER UTILITY ---
function decodeJwtResponse(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Error decoding JWT", e);
    return null;
  }
}

// --- SHARED INPUT COMPONENT ---
const AuthInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input {...props} className="w-full px-4 py-3 bg-slate-100 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8EB8BA] transition text-slate-800 placeholder:text-slate-500 font-medium" />
);

// --- SIGNUP FORM ---
const SignupForm: React.FC<{ onSwitchToLogin: () => void, onSignup: (email: string, fullName: string) => void, isLoading: boolean }> = ({ onSwitchToLogin, onSignup, isLoading }) => {
  const { t } = useTranslations();
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSignup(email, fullName);
  }
  return (
    <div className="p-8 w-full">
      <Logo className="mb-4" />
      <h2 className="text-3xl font-bold text-slate-800 mb-6">{t('auth.createAccountTitle')}</h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <AuthInput type="text" placeholder={t('auth.fullName')} required value={fullName} onChange={(e) => setFullName(e.target.value)} />
        <AuthInput type="email" placeholder={t('auth.email')} required value={email} onChange={(e) => setEmail(e.target.value)} />
        <AuthInput type="password" placeholder={t('auth.password')} required />
        <button type="submit" className="w-full bg-[#8EB8BA] text-white py-3 mt-2 rounded-lg hover:bg-teal-500 transition font-semibold text-base disabled:bg-slate-400" disabled={isLoading}>
          {isLoading ? t('auth.registering') : t('auth.register')}
        </button>
      </form>
      <p className="text-xs text-slate-500 mt-4 text-center">{t('auth.terms')}</p>
      <p className="text-sm text-slate-600 mt-6 text-center">
        {t('auth.alreadyHaveAccount')} <button onClick={onSwitchToLogin} className="font-semibold text-[#8EB8BA] hover:underline">{t('auth.login')}</button>
      </p>
    </div>
  );
};

// --- LOGIN FORM ---
const LoginForm: React.FC<{ 
    onSwitchToSignup: () => void; 
    onLogin: (name: string) => boolean;
    onGoogleCredentialResponse: (response: any) => void;
}> = ({ onSwitchToSignup, onLogin, onGoogleCredentialResponse }) => {
    const { t } = useTranslations();
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // NOTE: This is a public client ID for testing purposes.
        const GOOGLE_CLIENT_ID = "990339599427-cvga0ho3rq61n5i2mo76d3s5g1fgk6s2.apps.googleusercontent.com";

        if (window.google?.accounts?.id) {
            window.google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: onGoogleCredentialResponse
            });

            window.google.accounts.id.renderButton(
                document.getElementById("googleSignInDiv"),
                { theme: "outline", size: "large", type: "standard", text: "signin_with", shape: "rectangular", logo_alignment: "left" }
            );
        }
    }, [onGoogleCredentialResponse]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        const success = onLogin(name);
        if (!success) {
            setError(t('auth.loginFailed'));
        }
    }
    return (
     <div className="p-8 w-full">
      <Logo className="mb-4" />
      <h2 className="text-3xl font-bold text-slate-800 mb-6">{t('auth.loginTitle')}</h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <AuthInput type="text" placeholder={t('auth.username')} required value={name} onChange={(e) => setName(e.target.value)} />
        <AuthInput type="password" placeholder={t('auth.password')} required value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button type="submit" className="w-full bg-[#8EB8BA] text-white py-3 mt-2 rounded-lg hover:bg-teal-500 transition font-semibold text-base">{t('auth.login')}</button>
      </form>

        <div className="flex items-center my-6">
            <div className="flex-grow border-t border-slate-300"></div>
            <span className="flex-shrink mx-4 text-slate-500 text-sm">{t('auth.orDivider')}</span>
            <div className="flex-grow border-t border-slate-300"></div>
        </div>
        
        <div id="googleSignInDiv" className="flex justify-center"></div>

      <p className="text-sm text-slate-600 mt-6 text-center">
        {t('auth.noAccount')} <button onClick={onSwitchToSignup} className="font-semibold text-[#8EB8BA] hover:underline">{t('auth.registerHere')}</button>
      </p>
    </div>
    );
};

// --- VERIFICATION FORM ---
const VerificationForm: React.FC<{ onVerifySuccess: () => void, email: string, generatedCode: string | null }> = ({ onVerifySuccess, email, generatedCode }) => {
    const { t } = useTranslations();
    const [code, setCode] = useState(new Array(6).fill(""));
    const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        inputsRef.current[0]?.focus();
    }, []);

    const handleChange = (element: HTMLInputElement, index: number) => {
        if (isNaN(Number(element.value))) return false;

        const newCode = [...code];
        newCode[index] = element.value;
        setCode(newCode);

        if (element.nextSibling && element.value) {
            (element.nextSibling as HTMLInputElement).focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputsRef.current[index - 1]?.focus();
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const enteredCode = code.join("");
        if(enteredCode === generatedCode) {
           alert(t('auth.verificationSuccess'));
           onVerifySuccess();
        } else {
            alert(t('auth.invalidCode'));
            setCode(new Array(6).fill(""));
            inputsRef.current[0]?.focus();
        }
    }

    return (
        <div className="p-8 text-center w-full">
             <h2 className="text-2xl font-bold text-slate-700 mb-2">{t('auth.verifyTitle')}</h2>
             <p className="text-slate-600 mb-6" dangerouslySetInnerHTML={{ __html: t('auth.verifyInstruction', { email }) }} />
             
             <form onSubmit={handleSubmit}>
                <div className="flex justify-center gap-2 mb-6">
                    {code.map((data, index) => (
                        <input
                            key={index}
                            ref={el => { inputsRef.current[index] = el; }}
                            type="text"
                            maxLength={1}
                            value={data}
                            onChange={e => handleChange(e.target, index)}
                            onKeyDown={e => handleKeyDown(e, index)}
                            className="w-12 h-14 text-center text-2xl font-semibold bg-slate-100 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8EB8BA] text-slate-800"
                        />
                    ))}
                </div>
                <button type="submit" className="w-full bg-[#8EB8BA] text-white py-2 rounded-md hover:bg-teal-500 transition font-semibold" disabled={!generatedCode}>
                    {generatedCode ? t('auth.verifyButton') : t('auth.generatingCode')}
                </button>
             </form>
             <div className="text-sm text-slate-500 mt-6 bg-slate-100 p-2 rounded-md">
                <p>{t('auth.demoHint', { code: generatedCode })}</p>
             </div>
        </div>
    );
}


const AuthPage: React.FC<AuthPageProps> = ({ onClose, onRegister, onLogin, onGoogleLogin, initialView = 'signup' }) => {
  const [view, setView] = useState<AuthView>(initialView);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [generatedAvatar, setGeneratedAvatar] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleGoogleCredentialResponse = (response: any) => {
    const payload = decodeJwtResponse(response.credential);
    if (payload) {
      onGoogleLogin({
        name: payload.name,
        email: payload.email,
        avatar: payload.picture,
      });
    } else {
        console.error("Failed to decode Google credential response.");
    }
  };
  
  const generateAvatar = async (): Promise<string> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: 'A realistic, friendly profile picture of a person, suitable for a camp registration website. The person should look happy and approachable, like a camp counselor or a parent. Neutral, soft-focus background.',
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/png',
              aspectRatio: '1:1',
            },
        });
        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        return `data:image/png;base64,${base64ImageBytes}`;
    } catch (error) {
        console.error("Error generating avatar:", error);
        return 'https://i.pravatar.cc/150'; // Fallback avatar
    }
  };

  const handleSignupSubmit = async (email: string, fullName: string) => {
    setIsLoading(true);
    setVerificationEmail(email);
    setUserName(fullName);
    
    const avatar = await generateAvatar();
    setGeneratedAvatar(avatar);
    
    // Simulate code generation
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    
    setView('verify');
    setIsLoading(false);
  };
  
  const handleVerificationSuccess = () => {
    onRegister({ name: userName, avatar: generatedAvatar, email: verificationEmail });
    setView('login');
  }

  const renderView = () => {
    switch(view) {
        case 'login':
            return <LoginForm onSwitchToSignup={() => setView('signup')} onLogin={onLogin} onGoogleCredentialResponse={handleGoogleCredentialResponse} />;
        case 'verify':
            return <VerificationForm onVerifySuccess={handleVerificationSuccess} email={verificationEmail} generatedCode={generatedCode} />;
        case 'signup':
        default:
            return <SignupForm onSwitchToLogin={() => setView('login')} onSignup={handleSignupSubmit} isLoading={isLoading} />;
    }
  }

  const getImageForView = () => {
      switch(view) {
          case 'login': return 'https://picsum.photos/seed/login/400/600';
          case 'signup': return 'https://picsum.photos/seed/signup/400/600';
          case 'verify': return 'https://picsum.photos/seed/verify/400/600';
      }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
        <div 
          className="bg-white rounded-xl shadow-2xl w-full max-w-4xl m-4 flex overflow-hidden animate-slide-up"
          onClick={(e) => e.stopPropagation()}
        >
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 transition-colors z-10">
            <CloseIcon />
          </button>
          <div className="w-full md:w-1/2 flex items-center justify-center">
              {renderView()}
          </div>
          <div className="hidden md:block md:w-1/2">
              <img src={getImageForView()} alt="Inspiración" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthPage;