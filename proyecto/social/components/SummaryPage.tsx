import React from 'react';
import { Camp, FormData, DateRange } from '../types';
import { useTranslations } from '../context/LanguageContext';

interface SummaryPageProps {
  formData: FormData;
  camp: Camp;
  dateRange: DateRange;
  onConfirm: () => void;
}

const SummaryItem: React.FC<{ label: string; value?: string }> = ({ label, value }) => (
    <div className="py-2">
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-md text-slate-800 font-medium">{value || '-'}</p>
    </div>
);

const SummaryPage: React.FC<SummaryPageProps> = ({ formData, camp, dateRange, onConfirm }) => {
  const { t, lang } = useTranslations();
    
  const formatDate = (date: Date) => date.toLocaleDateString(lang, { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="bg-white/95 text-slate-800 p-8 rounded-2xl shadow-2xl">
        <h1 className="text-3xl font-bold text-center text-slate-700 mb-2">{t('summary.title')}</h1>
        <p className="text-center text-slate-600 mb-8">{t('summary.subtitle')}</p>
        
        <div className="space-y-6">
            <div className="bg-slate-100 p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-4 text-slate-700">{t('summary.campTitle')}</h2>
                <SummaryItem label={t('summary.campLabel')} value={camp.name} />
                <SummaryItem label={t('summary.datesLabel')} value={`${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}`} />
            </div>

            <div className="bg-slate-100 p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-4 text-slate-700">{t('summary.participantTitle')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                    <SummaryItem label={t('summary.firstName')} value={formData.childFirstName} />
                    <SummaryItem label={t('summary.lastName')} value={formData.childLastName} />
                    <SummaryItem label={t('summary.email')} value={formData.childEmail} />
                    <SummaryItem label={t('summary.additionalInfo')} value={formData.childOtherInfo} />
                    <SummaryItem 
                        label={t('summary.photoPermission')} 
                        value={formData.photoPermission ? t('summary.permissionGranted') : t('summary.permissionDenied')} 
                    />
                </div>
            </div>

            <div className="bg-slate-100 p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-4 text-slate-700">{t('summary.guardianTitle')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                    <SummaryItem label={t('summary.guardianName')} value={`${formData.parentFirstName} ${formData.parentLastName}`} />
                    <SummaryItem label={t('summary.dni')} value={formData.parentDni} />
                    <SummaryItem label={t('summary.contactEmail')} value={formData.parentEmail} />
                    <SummaryItem label={t('summary.contactPhone')} value={formData.parentPhone} />
                </div>
            </div>
        </div>

        <div className="text-center pt-8 mt-4">
          <button onClick={onConfirm} className="bg-[#8EB8BA] text-white font-bold py-3 px-10 rounded-lg hover:bg-teal-500 transition-all duration-300 shadow-md transform hover:scale-105">
            {t('summary.confirmButton')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SummaryPage;
