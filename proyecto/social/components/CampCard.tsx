import React from 'react';
import { Camp } from '../types';

interface CampCardProps {
  camp: Camp;
  onClick: () => void;
}

const CampCard: React.FC<CampCardProps> = ({ camp, onClick }) => {
  return (
    <div 
      className="bg-white/40 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg transform hover:-translate-y-2 transition-transform duration-300 cursor-pointer group"
      onClick={onClick}
    >
      <div className="p-5">
        <h3 className="text-2xl font-brand text-center text-slate-700 mb-4">{camp.name}</h3>
        <div className="relative overflow-hidden rounded-lg">
           <img src={`${camp.mainImage.replace('/800/250', '/400/300')}`} alt={camp.name} className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110" />
           <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
        </div>
      </div>
    </div>
  );
};

export default CampCard;