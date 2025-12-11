import React, { useState, useEffect, useRef } from 'react';
import { EditIcon } from '../icons/Icons';
import { useTranslations } from '../../context/LanguageContext';
import { User } from '../../types';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
}

const InputField: React.FC<InputFieldProps> = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
        <input 
            {...props}
            className="w-full p-3 bg-slate-100 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8EB8BA] transition-shadow text-slate-900 font-medium placeholder:text-slate-600 disabled:bg-slate-200 disabled:cursor-not-allowed"
        />
    </div>
);


interface PersonalDataProps {
    user: User;
    onUpdateUser: (user: User) => void;
}

const PersonalData: React.FC<PersonalDataProps> = ({ user, onUpdateUser }) => {
  const { t } = useTranslations();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
      firstName: '',
      lastName: '',
      email: user.email,
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const defaultAvatar = `https://i.pravatar.cc/150?u=${user.email}`;


  useEffect(() => {
    const nameParts = user.name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    setFormData({
        firstName,
        lastName,
        email: user.email
    });
    setAvatarPreview(null);
  }, [user]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setAvatarPreview(reader.result as string);
        };
        reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSave = () => {
    const updatedUser: User = {
        ...user,
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        avatar: avatarPreview || user.avatar,
    };
    onUpdateUser(updatedUser);
    setIsEditing(false);
  };

  const handleCancel = () => {
      setIsEditing(false);
      const nameParts = user.name.split(' ');
      setFormData({
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          email: user.email
      });
      setAvatarPreview(null);
  };
  
  return (
    <div className="bg-white/80 p-4 sm:p-8 rounded-xl shadow-inner animate-fade-in">
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-700">{t('personalData.title')}</h3>
            {!isEditing && (
                <button onClick={() => setIsEditing(true)} className="text-slate-500 hover:text-[#8EB8BA] transition-colors flex items-center gap-2">
                    <EditIcon />
                    <span className="text-sm font-semibold">{t('personalData.edit')}</span>
                </button>
            )}
        </div>

        <div className="flex flex-col items-center gap-4 mb-8">
            <img 
                src={avatarPreview || user.avatar || defaultAvatar}
                alt={t('account.profileAlt')} 
                className="w-24 h-24 rounded-full shadow-md border-4 border-white object-cover"
            />
             {isEditing && (
                <>
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 text-sm rounded-md bg-slate-200 text-slate-700 font-semibold hover:bg-slate-300 transition"
                    >
                       {t('personalData.changePhoto')}
                    </button>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleAvatarChange} 
                        className="hidden" 
                        accept="image/*" 
                    />
                </>
            )}
        </div>


        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label={t('personalData.firstName')} type="text" name="firstName" value={formData.firstName} onChange={handleChange} disabled={!isEditing} />
                <InputField label={t('personalData.lastName')} type="text" name="lastName" value={formData.lastName} onChange={handleChange} disabled={!isEditing} />
            </div>
            <InputField label={t('personalData.email')} type="email" name="email" value={formData.email} onChange={handleChange} disabled={!isEditing} />
            <InputField label={t('personalData.dob')} type="text" value="" placeholder="01/01/1990" disabled={!isEditing} />

            {isEditing && (
                <div className="flex justify-end gap-4 pt-4">
                    <button onClick={handleCancel} className="px-4 py-2 rounded-md bg-slate-200 text-slate-700 font-semibold hover:bg-slate-300 transition">
                        {t('personalData.cancel')}
                    </button>
                    <button onClick={handleSave} className="px-4 py-2 rounded-md bg-[#8EB8BA] text-white font-semibold hover:bg-teal-500 transition">
                        {t('personalData.save')}
                    </button>
                </div>
            )}
        </div>
    </div>
  );
};

export default PersonalData;