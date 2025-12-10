import React from 'react';
import { InstagramIcon } from './icons/Icons';
import Logo from './Logo';
import { useTranslations } from '../context/LanguageContext';

interface FooterProps {
  onAuthClick: () => void;
  onHomeClick: () => void;
}


const Footer: React.FC<FooterProps> = ({ onAuthClick, onHomeClick }) => {
  const { t } = useTranslations();
  return (
    <footer className="bg-slate-800/10 text-slate-600 mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">{t('footer.quickLinks')}</h3>
            <ul className="space-y-2">
              <li><button onClick={onHomeClick} className="hover:text-[#8EB8BA] transition-colors">{t('footer.home')}</button></li>
              <li><button onClick={onAuthClick} className="hover:text-[#8EB8BA] transition-colors">{t('footer.createAccount')}</button></li>
            </ul>
            <div className="mt-4 flex justify-center md:justify-start">
              <a href="#" className="hover:text-[#8EB8BA] transition-colors">
                <InstagramIcon />
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">{t('footer.contact')}</h3>
            <p>{t('footer.email')}: <a href="mailto:info.campvlc@gmail.com" className="hover:text-[#8EB8BA] transition-colors">info.campvlc@gmail.com</a></p>
            <p>{t('footer.phone')}: <a href="tel:+34123456789" className="hover:text-[#8EB8BA] transition-colors">+34 123 456 789</a></p>
          </div>
          <div className="flex items-center justify-center md:justify-end">
             <Logo />
          </div>
        </div>
        <div className="border-t border-slate-400/50 mt-8 pt-6 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} {t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
