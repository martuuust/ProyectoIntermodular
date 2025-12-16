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
import CommunityPage from './components/CommunityPage';
import Chatbot from './components/chatbot/Chatbot';
import ChatbotFab from './components/chatbot/ChatbotFab';
import { useTranslations } from './context/LanguageContext';
import { logEvent } from './utils/logging';
import { supabase } from './supabaseClient';
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
  const [currentView, setCurrentView] = useState<View>('community');
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

        // Cargar usuario actual desde localStorage (sesión local)
        const savedCurrentUser = localStorage.getItem('vlcCampCurrentUser');
        if (savedCurrentUser) {
            const user = JSON.parse(savedCurrentUser);
            // Verificar que el usuario existe en Supabase
            const userExists = profiles?.some(p => p.email === user.email);
            if (userExists) {
              setCurrentUser(user);
              setIsAuthenticated(true);
              // Asegurar que el usuario tenga un rol asignado
              const roleKey = `vlcCampCommunityRole_${user.email}`;
              if (!localStorage.getItem(roleKey)) {
                localStorage.setItem(roleKey, 'parent');
              }
            } else {
              // Si el usuario no existe en Supabase, limpiar localStorage
              localStorage.removeItem('vlcCampCurrentUser');
            }
        }

        // Cargar reseñas desde localStorage (temporal, hasta migrar a Supabase)
        const savedReviews = localStorage.getItem('vlcCampUserReviews');
        if (savedReviews) {
            setUserReviews(JSON.parse(savedReviews));
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
    if (isAuthenticated && currentUser) {
      setCurrentView('community');
    } else {
      setAuthInitialView('login');
      setCurrentView('auth');
    }
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
      
      // Establecer rol por defecto para el nuevo usuario
      const roleKey = `vlcCampCommunityRole_${createdUser.email}`;
      localStorage.setItem(roleKey, 'parent');
      
      logEvent('signup', { status: 'OK', name: createdUser.name, email: createdUser.email });
      
      // Auto-login después del registro
      setIsAuthenticated(true);
      setCurrentUser(createdUser);
      localStorage.setItem('vlcCampCurrentUser', JSON.stringify(createdUser));
      setCurrentView('community');
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
        localStorage.setItem('vlcCampCurrentUser', JSON.stringify(user));
        
        logEvent('login', { status: 'OK', user: user.name, email: user.email });

        // Establecer rol por defecto si no existe
        const roleKey = `vlcCampCommunityRole_${user.email}`;
        if (!localStorage.getItem(roleKey)) {
          localStorage.setItem(roleKey, 'parent');
        }
        
        if (selectedCamp) {
            setCurrentView('info');
        } else {
            setCurrentView('community');
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
    localStorage.setItem('vlcCampCurrentUser', JSON.stringify(user));
    
    // Establecer rol por defecto si no existe
    const roleKey = `vlcCampCommunityRole_${user.email}`;
    if (!localStorage.getItem(roleKey)) {
      localStorage.setItem(roleKey, 'parent');
    }
    
    logEvent('login', { status: 'OK', user: user.name, email: user.email, method: 'Google' });

    if (selectedCamp) {
        setCurrentView('info');
    } else {
        setCurrentView('community');
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
    localStorage.removeItem('vlcCampCurrentUser');
    setCurrentView('home');
    setSelectedCamp(null);
  };

  const handleSwitchAccount = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('vlcCampCurrentUser');
    setAuthInitialView('login');
    setCurrentView('auth');
    setSelectedCamp(null);
  };

  const handleUpdateUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('vlcCampCurrentUser', JSON.stringify(updatedUser));
    setUsers(prevUsers => {
      const updatedUsers = prevUsers.map(u => u.email === updatedUser.email ? updatedUser : u);
      localStorage.setItem('vlcCampUsers', JSON.stringify(updatedUsers));
      return updatedUsers;
    });
    logEvent('updates', { 
        action: 'Personal Data Update', 
        user: updatedUser.name, 
        email: updatedUser.email, 
        newData: updatedUser, 
        storage: 'localStorage' 
    });
  };

  const handleSelectDateRange = (range: DateRange) => {
    setSelectedDateRange(range);
    setCurrentView('form');
  };

  const handleFormSubmit = (data: FormData) => {
    setFormData(data);
    setCurrentView('summary');
  };
  
  const handleAddReview = (newReview: UserReview) => {
    setUserReviews(prevReviews => {
        const updatedReviews = [...prevReviews, newReview];
        try {
            localStorage.setItem('vlcCampUserReviews', JSON.stringify(updatedReviews));
        } catch (error) {
            console.error("Failed to save reviews to localStorage", error);
        }
        return updatedReviews;
    });
  };

  const handleConfirmRegistration = () => {
    if (selectedCamp && selectedDateRange && formData && currentUser) {
      const newEnrollment = {
        campId: selectedCamp.id,
        startDate: selectedDateRange.start.toISOString(),
        endDate: selectedDateRange.end.toISOString(),
        formData: formData,
      };

      logEvent('enrollments', { 
          action: 'New Enrollment',
          status: 'OK',
          camp: selectedCamp.name, 
          user: currentUser.name, 
          email: currentUser.email, 
          photoPermission: formData.photoPermission 
      });

      try {
        const allEnrollmentsData = localStorage.getItem('vlcCampEnrollments') || '{}';
        const allEnrollments = JSON.parse(allEnrollmentsData);
        const userEnrollments = allEnrollments[currentUser.email] || [];
        userEnrollments.push(newEnrollment);
        allEnrollments[currentUser.email] = userEnrollments;
        localStorage.setItem('vlcCampEnrollments', JSON.stringify(allEnrollments));
      } catch (error) {
        console.error("Failed to save enrollment", error);
        logEvent('enrollments', { 
            action: 'New Enrollment',
            status: 'ERROR',
            error: 'Failed to save to localStorage',
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
      case 'community':
        if (currentUser) {
          // Asegurar que el usuario tenga un rol asignado
          const roleKey = `vlcCampCommunityRole_${currentUser.email}`;
          if (!localStorage.getItem(roleKey)) {
            localStorage.setItem(roleKey, 'parent');
          }
          return <CommunityPage currentUser={currentUser} onSwitchAccount={handleSwitchAccount} onAccountClick={handleShowAccount} />;
        } else {
          // Si no hay usuario, mostrar página de autenticación
          return null; // Se mostrará el AuthPage fuera del switch
        }
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
      {(currentView === 'auth' || (currentView === 'community' && !currentUser)) && (
        <AuthPage 
          onClose={() => { setCurrentView('home'); setSelectedCamp(null); }} 
          onRegister={handleRegister} 
          onLogin={handleLogin} 
          onGoogleLogin={handleGoogleLogin} 
          initialView={authInitialView} 
        />
      )}
      <ChatbotFab onToggle={() => setIsChatOpen(prev => !prev)} />
      <Chatbot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
};

export default App;