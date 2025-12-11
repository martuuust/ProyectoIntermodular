import React, { useState, useMemo, useEffect } from 'react';
import { CAMPS_DATA } from '../../constants';
import { Camp, User } from '../../types';
import { SearchIcon, HeartIcon } from '../icons/Icons';
import { useTranslations } from '../../context/LanguageContext';
import { logEvent } from '../../utils/logging';

interface FavoriteCampsProps {
    user: User;
}

const FavoriteCamps: React.FC<FavoriteCampsProps> = ({ user }) => {
  const { t } = useTranslations();
  const storageKey = `vlcCampFavorites_${user.email}`;

  const [camps, setCamps] = useState<Camp[]>(() => {
    try {
        const favoriteIds: number[] = JSON.parse(localStorage.getItem(storageKey) || '[]');
        return CAMPS_DATA.map(camp => ({
          ...camp,
          isFavorite: favoriteIds.includes(camp.id),
        }));
    } catch (error) {
        console.error("Failed to load favorites from localStorage", error);
        return CAMPS_DATA.map(camp => ({...camp, isFavorite: false}));
    }
  });

  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const favoriteIds = camps.filter(c => c.isFavorite).map(c => c.id);
    localStorage.setItem(storageKey, JSON.stringify(favoriteIds));
  }, [camps, storageKey]);

  const toggleFavorite = (id: number) => {
    let campName = '';
    let isBecomingFavorite = false;

    setCamps(prevCamps =>
      prevCamps.map(camp => {
        if (camp.id === id) {
          campName = camp.name;
          isBecomingFavorite = !camp.isFavorite;
          return { ...camp, isFavorite: !camp.isFavorite };
        }
        return camp;
      })
    );

    if (campName) {
        if (isBecomingFavorite) {
            logEvent('updates', { 
                action: 'Add Favorite', 
                camp: campName, 
                user: user.email 
            });
        } else {
            logEvent('updates', { 
                action: 'Remove Favorite', 
                camp: campName, 
                user: user.email 
            });
        }
    }
  };

  const searchedCamps = useMemo(() =>
    camps.filter(camp =>
      camp.name.toLowerCase().includes(searchTerm.toLowerCase())
    ), [camps, searchTerm]);

  const campsToShow = searchTerm
    ? searchedCamps
    : camps.filter(c => c.isFavorite);

  return (
    <div className="bg-white/80 p-8 rounded-xl shadow-inner animate-fade-in">
      <h3 className="text-xl font-bold text-slate-700 mb-6">{t('favorites.title')}</h3>

      <div className="relative mb-6">
        <input
          type="text"
          placeholder={t('favorites.searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 pl-10 bg-slate-100 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8EB8BA] transition-shadow text-slate-900 font-medium placeholder:text-slate-600"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon />
        </div>
      </div>

      <div className="space-y-4">
        {campsToShow.length > 0 ? (
          campsToShow.map(camp => (
            <div key={camp.id} className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img src={`${camp.mainImage.replace('/800/250', '/200/200')}`} alt={camp.name} className="w-12 h-12 rounded-md object-cover" />
                <div>
                  <p className="font-semibold text-slate-800">{camp.name}</p>
                  <p className="text-sm text-slate-500">{camp.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button 
                    onClick={() => toggleFavorite(camp.id)} 
                    className={`${camp.isFavorite ? 'text-red-500 hover:text-red-600' : 'text-slate-400 hover:text-red-500'} transition-colors`}
                    aria-label={t(camp.isFavorite ? 'favorites.remove' : 'favorites.add')}
                >
                  <HeartIcon filled={camp.isFavorite} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-slate-500 py-4">
            {searchTerm ? t('favorites.noResults') : t('favorites.noFavoritesPrompt')}
          </p>
        )}
      </div>
    </div>
  );
};

export default FavoriteCamps;
