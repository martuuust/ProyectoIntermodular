import React from 'react';
import { Camp } from '../types';
import { CloseIcon, PhoneIcon, EmailIcon } from './icons/Icons';
import { useTranslations } from '../context/LanguageContext';

interface InfoModalProps {
  camp: Camp;
  onClose: () => void;
  onMoreInfo: () => void;
}

const InfoModal: React.FC<InfoModalProps> = ({ camp, onClose, onMoreInfo }) => {
  const { t } = useTranslations();
  
  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-slate-50 rounded-2xl shadow-2xl w-full max-w-md m-4 p-8 relative animate-slide-up text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-slate-900 transition-colors">
          <CloseIcon />
        </button>

        <h2 className="text-4xl font-brand text-slate-800 mb-2">{camp.name}</h2>
        <p className="font-semibold text-slate-500 mb-6">{camp.location}</p>

        <div className="rounded-lg overflow-hidden shadow-lg mb-6 border-4 border-white">
          <img src="https://i.imgur.com/O6fI32p.png" alt={`Map of ${camp.name}`} className="w-full h-auto object-cover"/>
        </div>
        
        <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-slate-200">
          <h4 className="font-bold text-slate-700 mb-4">{t('infoModal.contactTitle')}</h4>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 text-sm">
              {camp.contactPhone && (
                  <a href={`tel:${camp.contactPhone}`} className="flex items-center gap-2 text-slate-700 hover:text-[#8EB8BA] transition-colors font-medium">
                      <PhoneIcon />
                      <span>{camp.contactPhone}</span>
                  </a>
              )}
              {camp.contactEmail && (
                  <a href={`mailto:${camp.contactEmail}`} className="flex items-center gap-2 text-slate-700 hover:text-[#8EB8BA] transition-colors font-medium">
                      <EmailIcon />
                      <span>{camp.contactEmail}</span>
                  </a>
              )}
          </div>
        </div>

        <div className="mt-8">
          <button
            onClick={onMoreInfo}
            className="bg-[#8EB8BA] text-white font-bold py-3 px-8 rounded-full hover:bg-teal-500 transition-all duration-300 shadow-lg transform hover:scale-105"
          >
            {t('infoModal.moreInfo')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InfoModal;