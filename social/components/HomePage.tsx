import React from 'react';
import { Camp } from '../types';
import CampCard from './CampCard';
import { useTranslations } from '../context/LanguageContext';

interface HomePageProps {
  camps: Camp[];
  onSelectCamp: (camp: Camp) => void;
}

const HomePage: React.FC<HomePageProps> = ({ camps, onSelectCamp }) => {
  const { t } = useTranslations();
  return (
    <div className="animate-fade-in">
      <section className="text-center mb-12">
        <h1 className="text-6xl font-brand text-[#2E4053] mb-4">vlcCamp</h1>
        <p className="max-w-4xl mx-auto text-slate-600 leading-relaxed">
          {t('home.intro1')}
        </p>
        <p className="max-w-4xl mx-auto text-slate-600 leading-relaxed mt-4">
          {t('home.intro2')}
        </p>
      </section>

      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {camps.map((camp) => (
            <CampCard key={camp.id} camp={camp} onClick={() => onSelectCamp(camp)} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;