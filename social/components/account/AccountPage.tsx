import React, { useState } from 'react';
import PersonalData from './PersonalData';
import FavoriteCamps from './FavoriteCamps';
import EnrollmentsPage from './EnrollmentsPage';
import { useTranslations } from '../../context/LanguageContext';
import { User, UserReview } from '../../types';

type AccountView = 'data' | 'favs' | 'enrollments';

interface AccountPageProps {
    user: User;
    onUpdateUser: (user: User) => void;
    onAddReview: (review: UserReview) => void;
    userReviews: UserReview[];
}

const AccountPage: React.FC<AccountPageProps> = ({ user, onUpdateUser, onAddReview, userReviews }) => {
  const [view, setView] = useState<AccountView>('data');
  const { t } = useTranslations();

  const renderContent = () => {
      switch(view) {
          case 'data':
              return <PersonalData user={user} onUpdateUser={onUpdateUser} />;
          case 'favs':
              return <FavoriteCamps user={user} />;
          case 'enrollments':
              return <EnrollmentsPage user={user} onAddReview={onAddReview} userReviews={userReviews} />;
      }
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <h1 className="text-4xl font-bold text-slate-800 mb-8">{t('account.title')}</h1>
      
      <div className="bg-white/50 backdrop-blur-md p-4 md:p-8 rounded-2xl shadow-lg">
        <div className="flex flex-col items-center text-center border-b border-slate-300 pb-8 mb-8">
            <h2 className="text-2xl font-bold text-slate-700">{t('account.welcome', { name: user.name })}</h2>
        </div>

        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-8">
            <button 
                onClick={() => setView('data')}
                className={`px-4 sm:px-6 py-2 rounded-lg font-semibold transition-all duration-300 text-sm sm:text-base ${view === 'data' ? 'bg-[#8EB8BA] text-white shadow-md' : 'bg-white/50 text-slate-600 hover:bg-white'}`}
            >
                {t('account.personalInfo')}
            </button>
            <button 
                onClick={() => setView('favs')}
                className={`px-4 sm:px-6 py-2 rounded-lg font-semibold transition-all duration-300 text-sm sm:text-base ${view === 'favs' ? 'bg-[#8EB8BA] text-white shadow-md' : 'bg-white/50 text-slate-600 hover:bg-white'}`}
            >
                {t('account.myFavorites')}
            </button>
            <button 
                onClick={() => setView('enrollments')}
                className={`px-4 sm:px-6 py-2 rounded-lg font-semibold transition-all duration-300 text-sm sm:text-base ${view === 'enrollments' ? 'bg-[#8EB8BA] text-white shadow-md' : 'bg-white/50 text-slate-600 hover:bg-white'}`}
            >
                {t('account.myEnrollments')}
            </button>
        </div>

        <div>
            {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AccountPage;