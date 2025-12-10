import React, { useState, useEffect } from 'react';
import { Camp, FormData, DateRange, View, User, UserReview } from './types';
import { CAMPS_DATA } from './constants';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import AuthPage from './components/auth/AuthPage';
import CampDetailPage from './components/CampDetailPage';
import RegistrationForm from './components/RegistrationForm';
import SummaryPage from './components/SummaryPage';
import InfoModal from './components/InfoModal';
import AccountPage from './components/account/AccountPage';
import Chatbot from './components/chatbot/Chatbot';
import ChatbotFab from './components/chatbot/ChatbotFab';
import { useTranslations } from './context/LanguageContext';
import { logEvent } from './utils/logging';
import { supabase } from './supabaseClient';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
import Logo from './components/Logo';

// --- ComingSoonPage Component ---
const ComingSoonPage: React.FC = () => {
    const { t } = useTranslations();
    return (
        <div className="flex items-center justify-center min-h-full text-center animate-fade-in py-16">
            <div className="bg-white/50 backdrop-blur-md p-8 sm:p-12 rounded-2xl shadow-lg max-w-2xl mx-auto">
                <Logo width={80} height={80} className="mx-auto mb-4" />
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4">{t('community.comingSoonTitle')}</h1>
                <p className="text-slate-600">{t('community.comingSoonText')}</p>
            </div>
        </div>
    );
};


const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedCamp, setSelectedCamp] = useState<Camp | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange | null>(null);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [userReviews, setUserReviews] = useState<UserReview[]>([]);
  const { t } = useTranslations();
  const [authInitialView, setAuthInitialView] = useState<'login' | 'signup'>('signup');

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Cargar usuarios desde Supabase
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('name, email, avatar');

        if (profilesError) {
          console.error('Error al cargar perfiles desde Supabase', profilesError);
        } else if (profiles) {
          setUsers(profiles as User[]);
        }

        // TODO: integrar autenticación real de Supabase.
        // De momento, no se restaura sesión automáticamente para evitar usar localStorage.

        // Cargar reseñas de usuarios desde Supabase
        const { data: reviews, error: reviewsError } = await supabase
          .from('reviews')
          .select('camp_id, author_name, author_avatar, author_email, rating, comment');

        if (reviewsError) {
          console.error('Error al cargar reseñas desde Supabase', reviewsError);
        } else if (reviews) {
          const mappedReviews: UserReview[] = reviews.map((r: any) => ({
            campId: r.camp_id,
            authorName: r.author_name,
            authorAvatar: r.author_avatar,
            authorEmail: r.author_email,
            rating: r.rating,
            text: r.comment,
          }));
          setUserReviews(mappedReviews);
        }
      } catch (error) {
        console.error('Error al cargar datos iniciales desde Supabase', error);
      }
    };

    loadInitialData();
  }, []);


  const handleSelectCamp = (camp: Camp) => {
    setSelectedCamp(camp);
    if (isAuthenticated) {
      setCurrentView('info');
    } else {
      setAuthInitialView('signup');
      setCurrentView('auth');
    }
  };
  
  const handleShowAuth = () => {
    if (!isAuthenticated) {
      setAuthInitialView('login');
      setCurrentView('auth');
    }
  };
  
  const handleShowAccount = () => {
    setCurrentView('account');
  }

  const handleCommunityClick = () => {
    setCurrentView('coming-soon');
  }

  const handleRegister = async (newUser: User) => {
    if (users.some(u => u.email.toLowerCase() === newUser.email.toLowerCase())) {
      logEvent('signup', { status: 'ERROR', error: 'User already exists', email: newUser.email });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert([{ name: newUser.name, email: newUser.email, avatar: newUser.avatar }])
        .select('name, email, avatar')
        .single();

      if (error) {
        console.error('Error al registrar usuario en Supabase', error);
        logEvent('signup', { status: 'ERROR', error: error.message, email: newUser.email });
        return;
      }

      const createdUser: User = {
        name: data.name,
        email: data.email,
        avatar: data.avatar,
      };

      setUsers(prev => [...prev, createdUser]);
      logEvent('signup', { status: 'OK', name: createdUser.name, email: createdUser.email });
    } catch (error: any) {
      console.error('Error inesperado al registrar usuario', error);
      logEvent('signup', { status: 'ERROR', error: error?.message ?? 'unknown', email: newUser.email });
    }
  };

  const handleLogin = (name: string): boolean => {
    const user = users.find(u => u.name.toLowerCase() === name.toLowerCase());
    if (user) {
        setIsAuthenticated(true);
        setCurrentUser(user);
        
        logEvent('login', { status: 'OK', user: user.name, email: user.email });

        if (selectedCamp) {
            setCurrentView('info');
        } else {
            setCurrentView('home');
        }
        return true;
    }
    logEvent('login', { status: 'ERROR', error: 'Invalid credentials', name });
    return false;
  };
  
  const handleGoogleLogin = async (googleUserData: { name: string; email: string; avatar: string }) => {
    let user = users.find(u => u.email.toLowerCase() === googleUserData.email.toLowerCase());
    
    if (!user) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .insert([{
              name: googleUserData.name,
              email: googleUserData.email,
              avatar: googleUserData.avatar
            }])
            .select('name, email, avatar')
            .single();

          if (error) {
            console.error('Error al registrar usuario Google en Supabase', error);
            logEvent('signup', { status: 'ERROR', error: error.message, email: googleUserData.email, method: 'Google' });
            return;
          }

          user = {
            name: data.name,
            email: data.email,
            avatar: data.avatar
          };

          setUsers(prev => [...prev, user as User]);
          logEvent('signup', { status: 'OK', name: user.name, email: user.email, method: 'Google' });
        } catch (error: any) {
          console.error('Error inesperado al registrar usuario Google', error);
          logEvent('signup', { status: 'ERROR', error: error?.message ?? 'unknown', email: googleUserData.email, method: 'Google' });
          return;
        }
    }

    setIsAuthenticated(true);
    setCurrentUser(user);
    logEvent('login', { status: 'OK', user: user.name, email: user.email, method: 'Google' });

    if (selectedCamp) {
        setCurrentView('info');
    } else {
        setCurrentView('home');
    }
  };

  const handleCloseAuth = () => {
    setCurrentView('home');
    setSelectedCamp(null);
  };
  
  const handleLogout = () => {
    logEvent('logout', { user: currentUser?.name, email: currentUser?.email });
    setIsAuthenticated(false);
    setCurrentUser(null);
    setCurrentView('home');
    setSelectedCamp(null);
  };

  const handleSwitchAccount = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setAuthInitialView('login');
    setCurrentView('auth');
    setSelectedCamp(null);
  };

  const handleUpdateUser = async (updatedUser: User) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          name: updatedUser.name,
          avatar: updatedUser.avatar
        })
        .eq('email', updatedUser.email)
        .select('name, email, avatar')
        .single();

      if (error) {
        console.error('Error al actualizar usuario en Supabase', error);
        logEvent('updates', {
          action: 'Personal Data Update',
          status: 'ERROR',
          user: updatedUser.name,
          email: updatedUser.email,
          error: error.message
        });
        return;
      }

      const savedUser: User = {
        name: data.name,
        email: data.email,
        avatar: data.avatar,
      };

      setCurrentUser(savedUser);
      setUsers(prevUsers => prevUsers.map(u => u.email === savedUser.email ? savedUser : u));

      logEvent('updates', { 
          action: 'Personal Data Update', 
          status: 'OK',
          user: savedUser.name, 
          email: savedUser.email, 
          newData: savedUser
      });
    } catch (error: any) {
      console.error('Error inesperado al actualizar usuario', error);
      logEvent('updates', { 
          action: 'Personal Data Update', 
          status: 'ERROR',
          user: updatedUser.name, 
          email: updatedUser.email, 
          error: error?.message ?? 'unknown'
      });
    }
  };

  const handleSelectDateRange = (range: DateRange) => {
    setSelectedDateRange(range);
    setCurrentView('form');
  };

  const handleFormSubmit = (data: FormData) => {
    setFormData(data);
    setCurrentView('summary');
  };
  
  const handleAddReview = async (newReview: UserReview) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .insert([{
          camp_id: newReview.campId,
          author_name: newReview.authorName,
          author_avatar: newReview.authorAvatar,
          author_email: newReview.authorEmail,
          rating: newReview.rating,
          comment: newReview.text
        }]);

      if (error) {
        console.error('Error al guardar reseña en Supabase', error);
        return;
      }

      setUserReviews(prev => [...prev, newReview]);
    } catch (error) {
      console.error('Error inesperado al guardar reseña en Supabase', error);
    }
  };

  const handleConfirmRegistration = () => {
    const registerEnrollment = async () => {
      if (selectedCamp && selectedDateRange && formData && currentUser) {
        const payload = {
          user_id: currentUser.email,
          camp_id: selectedCamp.id,
          start_date: selectedDateRange.start.toISOString(),
          end_date: selectedDateRange.end.toISOString(),
          form_data: formData,
        };

        logEvent('enrollments', { 
            action: 'New Enrollment',
            status: 'PENDING',
            camp: selectedCamp.name, 
            user: currentUser.name, 
            email: currentUser.email, 
            photoPermission: formData.photoPermission 
        });

        try {
          const response = await fetch(`${API_BASE_URL}/api/enrollments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

          if (!response.ok) {
            const errorBody = await response.json().catch(() => ({}));
            throw new Error(errorBody.error || 'Error al crear la inscripción');
          }

          logEvent('enrollments', { 
              action: 'New Enrollment',
              status: 'OK',
              camp: selectedCamp.name, 
              user: currentUser.name, 
              email: currentUser.email, 
              photoPermission: formData.photoPermission 
          });
        } catch (error: any) {
          console.error('Error al crear inscripción en backend', error);
          logEvent('enrollments', { 
              action: 'New Enrollment',
              status: 'ERROR',
              error: error?.message ?? 'unknown',
              camp: selectedCamp.name, 
              user: currentUser.name, 
              email: currentUser.email,
          });
        }
      }

      alert('¡Inscripción confirmada! Recibirás un correo con los detalles.');
      setCurrentView('home');
      setSelectedCamp(null);
      setSelectedDateRange(null);
      setFormData(null);
    };

    registerEnrollment();
  };

  const renderContent = () => {
    switch (currentView) {
      case 'info':
        return selectedCamp && <InfoModal camp={selectedCamp} onClose={() => { setCurrentView('home'); setSelectedCamp(null); }} onMoreInfo={() => setCurrentView('detail')} />;
      case 'detail':
        return selectedCamp && <CampDetailPage camp={selectedCamp} onSelectDateRange={handleSelectDateRange} userReviews={userReviews} />;
      case 'form':
        return selectedCamp && selectedDateRange && <RegistrationForm camp={selectedCamp} selectedDateRange={selectedDateRange} onSubmit={handleFormSubmit} onBack={() => setCurrentView('detail')} />;
      case 'summary':
        return selectedCamp && selectedDateRange && formData && <SummaryPage camp={selectedCamp} dateRange={selectedDateRange} formData={formData} onConfirm={handleConfirmRegistration} />;
      case 'account':
        return currentUser && <AccountPage user={currentUser} onUpdateUser={handleUpdateUser} onAddReview={handleAddReview} userReviews={userReviews} />;
      case 'coming-soon':
        return <ComingSoonPage />;
      case 'home':
      default:
        return <HomePage camps={CAMPS_DATA} onSelectCamp={handleSelectCamp} />;
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#E0F2F1] to-[#B2DFDB] min-h-screen text-slate-800 font-sans flex flex-col">
      <Header 
        onHomeClick={() => setCurrentView('home')} 
        onAuthClick={handleShowAuth}
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
        onAccountClick={handleShowAccount}
        onSwitchAccount={handleSwitchAccount}
        onCommunityClick={handleCommunityClick}
      />
      <main className="container mx-auto px-4 py-8 flex-grow">
        {renderContent()}
      </main>
      <Footer onHomeClick={() => setCurrentView('home')} onAuthClick={handleShowAuth} />
      {currentView === 'auth' && <AuthPage onClose={handleCloseAuth} onRegister={handleRegister} onLogin={handleLogin} onGoogleLogin={handleGoogleLogin} initialView={authInitialView} />}
      <ChatbotFab onToggle={() => setIsChatOpen(prev => !prev)} />
      <Chatbot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
};

export default App;