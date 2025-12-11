import React, { useState } from 'react';
import { Camp, FormData, DateRange } from '../types';
import { BackArrowIcon, CalendarIcon } from './icons/Icons';
import { useTranslations } from '../context/LanguageContext';

interface RegistrationFormProps {
  camp: Camp;
  selectedDateRange: DateRange;
  onSubmit: (data: FormData) => void;
  onBack: () => void;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ camp, selectedDateRange, onSubmit, onBack }) => {
  const { t, lang } = useTranslations();
  const [formState, setFormState] = useState<FormData>({
    childFirstName: '', childLastName: '', childEmail: '', childOtherInfo: '',
    parentFirstName: '', parentLastName: '', parentDni: '', parentEmail: '', parentPhone: '',
    cardNumber: '', cardCvc: '', cardExpiry: '',
    photoPermission: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormState({ ...formState, [name]: checked });
    } else {
        setFormState({ ...formState, [name]: value });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formState);
  };

  const formatDate = (date: Date) => date.toLocaleDateString(lang);
  const formattedDateRange = `${formatDate(selectedDateRange.start)} - ${formatDate(selectedDateRange.end)}`;

  
  const inputFieldClasses = "w-full p-3 bg-slate-100 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8EB8BA] transition-shadow text-slate-900 font-medium placeholder:text-slate-600";

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-[#8EB8BA] mb-6 transition-colors">
            <BackArrowIcon />
            {t('form.backToDetails')}
        </button>
      <div className="bg-white/90 text-slate-800 p-8 rounded-2xl shadow-2xl">
        <h1 className="text-3xl font-bold text-center text-slate-700 mb-2">{t('form.title')}</h1>
        <p className="text-center text-slate-600 mb-8">{t('form.campLabel')}: <span className="font-semibold">{camp.name}</span></p>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          
          <div className="p-6 border border-slate-300 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-slate-700">{t('form.childInfoTitle')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" name="childFirstName" placeholder={t('form.firstName')} onChange={handleChange} className={`${inputFieldClasses}`} required />
                <input type="text" name="childLastName" placeholder={t('form.lastName')} onChange={handleChange} className={`${inputFieldClasses}`} required />
                <input type="email" name="childEmail" placeholder={t('form.email')} onChange={handleChange} className={`${inputFieldClasses} col-span-1 md:col-span-2`} />
                <textarea name="childOtherInfo" placeholder={t('form.otherInfo')} onChange={handleChange} className={`${inputFieldClasses} col-span-1 md:col-span-2 h-24`}></textarea>
            </div>
          </div>
          
          <div className="p-6 border border-slate-300 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-slate-700">{t('form.parentInfoTitle')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" name="parentFirstName" placeholder={t('form.firstName')} onChange={handleChange} className={`${inputFieldClasses}`} required />
                <input type="text" name="parentLastName" placeholder={t('form.lastName')} onChange={handleChange} className={`${inputFieldClasses}`} required />
                <input type="text" name="parentDni" placeholder={t('form.dni')} onChange={handleChange} className={`${inputFieldClasses}`} required />
                <input type="email" name="parentEmail" placeholder={t('form.email')} onChange={handleChange} className={`${inputFieldClasses}`} required />
                <input type="tel" name="parentPhone" placeholder={t('form.phone')} onChange={handleChange} className={`${inputFieldClasses}`} required />
            </div>
          </div>
          
          <div className="p-6 border border-slate-300 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-slate-700">{t('form.paymentTitle')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <input type="text" name="cardNumber" placeholder={t('form.cardNumber')} onChange={handleChange} className={`${inputFieldClasses}`} required />
                <div className="grid grid-cols-2 gap-4">
                    <input type="text" name="cardExpiry" placeholder={t('form.expiryDate')} onChange={handleChange} className={`${inputFieldClasses}`} required />
                    <input type="text" name="cardCvc" placeholder="CVC" onChange={handleChange} className={`${inputFieldClasses}`} required />
                </div>
                <div className="relative col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium text-slate-600 mb-1">{t('form.selectedWeek')}</label>
                    <input type="text" readOnly value={formattedDateRange} className={`${inputFieldClasses} w-full bg-slate-200 cursor-not-allowed`} />
                     <div className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center pointer-events-none">
                       <CalendarIcon />
                    </div>
                </div>
            </div>
          </div>
          
          <div className="flex items-start gap-3 mt-2 p-4 bg-slate-100 rounded-lg border border-slate-300">
                <input
                    type="checkbox"
                    name="photoPermission"
                    id="photoPermission"
                    checked={formState.photoPermission}
                    onChange={handleChange}
                    className="mt-1 h-5 w-5 rounded border-gray-300 text-[#8EB8BA] focus:ring-[#8EB8BA] flex-shrink-0"
                />
                <div>
                    <label htmlFor="photoPermission" className="font-medium text-slate-800">{t('form.photoPermissionLabel')}</label>
                    <p className="text-sm text-slate-600">{t('form.photoPermissionText')}</p>
                </div>
            </div>

          <div className="text-center pt-4">
            <button type="submit" className="bg-[#8EB8BA] text-white font-bold py-3 px-10 rounded-lg hover:bg-teal-500 transition-all duration-300 shadow-md transform hover:scale-105">
              {t('form.submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;
