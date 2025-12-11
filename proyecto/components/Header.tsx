import React, { useState, useRef, useEffect } from 'react';
import Logo from './Logo';
import { HomeIcon, PhoneIcon, UserIcon, EditIcon, SwitchUserIcon, LogoutIcon, CommunityIcon } from './icons/Icons';
import { useTranslations } from '../context/LanguageContext';

interface HeaderProps {
    onHomeClick: () => void;
    onAuthClick: () => void;
    isAuthenticated: boolean;
    onLogout: () => void;
    onAccountClick: () => void;
    onSwitchAccount: () => void;
    onCommunityClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onHomeClick, onAuthClick, isAuthenticated, onLogout, onAccountClick, onSwitchAccount, onCommunityClick }) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const { t, setLang, lang } = useTranslations();

  const languages = {
    en: 'English',
    es: 'Español',
    va: 'Valencià'
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUserIconClick = () => {
    if (isAuthenticated) {
      setIsUserMenuOpen(prev => !prev);
    } else {
      onAuthClick();
    }
  };

  const handleLangChange = (langKey: 'en' | 'es' | 'va') => {
    setLang(langKey);
    setIsLangMenuOpen(false);
  };

  return (
    <header className="bg-white/30 backdrop-blur-sm shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        <div className="cursor-pointer" onClick={onHomeClick}>
           <Logo width={40} height={40}/>
        </div>
        <nav className="flex items-center space-x-4 md:space-x-6 text-slate-600">
          <button onClick={onHomeClick} className="hover:text-[#8EB8BA] transition-colors" title={t('footer.home')}>
            <HomeIcon />
          </button>
          <button onClick={onCommunityClick} className="hover:text-[#8EB8BA] transition-colors" title={t('header.community')}>
            <CommunityIcon />
          </button>
          <a href="tel:+34123456789" className="hover:text-[#8EB8BA] transition-colors" title={t('footer.phone')}>
            <PhoneIcon />
          </a>
          <div className="relative" ref={userMenuRef}>
            <button onClick={handleUserIconClick} className="hover:text-[#8EB8BA] transition-colors" title={t('account.title')}>
              <UserIcon />
            </button>
            {isAuthenticated && isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 animate-fade-in-fast">
                <button onClick={() => { onAccountClick(); setIsUserMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2">
                  <EditIcon /> {t('header.editAccount')}
                </button>
                <button onClick={() => { onSwitchAccount(); setIsUserMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2">
                  <SwitchUserIcon /> {t('header.switchAccount')}
                </button>
                <button onClick={() => { onLogout(); setIsUserMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-slate-100 flex items-center gap-2">
                 <LogoutIcon /> {t('header.logout')}
                </button>
              </div>
            )}
          </div>
          <div className="relative" ref={langMenuRef}>
            <button onClick={() => setIsLangMenuOpen(prev => !prev)} className="flex items-center cursor-pointer hover:text-[#8EB8BA] transition-colors">
              <span className="text-sm font-semibold">{lang.toUpperCase()}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            {isLangMenuOpen && (
               <div className="absolute right-0 mt-2 w-28 bg-white rounded-md shadow-lg py-1 z-50 animate-fade-in-fast">
                {(Object.keys(languages) as Array<keyof typeof languages>).map((key) => (
                  <button key={key} onClick={() => handleLangChange(key)} className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">
                    {languages[key]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};
const style = document.createElement('style');
style.innerHTML = `
  @keyframes fade-in-fast {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in-fast {
    animation: fade-in-fast 0.2s ease-out forwards;
  }
`;
document.head.appendChild(style);

export default Header;