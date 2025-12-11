import React, { useState } from 'react';
import { CloseIcon, StarIcon } from '../icons/Icons';
import { useTranslations } from '../../context/LanguageContext';

interface AddReviewModalProps {
  campName: string;
  onClose: () => void;
  onSubmit: (data: { rating: number; text: string }) => void;
}

const AddReviewModal: React.FC<AddReviewModalProps> = ({ campName, onClose, onSubmit }) => {
  const { t } = useTranslations();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating > 0 && text.trim()) {
      onSubmit({ rating, text });
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-slate-50 rounded-2xl shadow-2xl w-full max-w-lg m-4 relative animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-slate-900 transition-colors">
          <CloseIcon />
        </button>
        
        <div className="p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-2 text-center">{t('addReviewModal.title', { campName })}</h2>
            <p className="text-center text-slate-600 mb-6">{t('addReviewModal.subtitle')}</p>
        
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-center text-sm font-medium text-slate-700 mb-2">{t('addReviewModal.ratingLabel')}</label>
                    <div className="flex justify-center items-center gap-2" onMouseLeave={() => setHoverRating(0)}>
                        {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onMouseEnter={() => setHoverRating(star)}
                            onClick={() => setRating(star)}
                            className="transition-transform transform hover:scale-110 focus:outline-none"
                        >
                             <StarIcon 
                                filled={(hoverRating || rating) >= star} 
                                className={`w-10 h-10 ${(hoverRating || rating) >= star ? 'text-amber-400' : 'text-slate-300'}`} 
                            />
                        </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label htmlFor="reviewText" className="block text-sm font-medium text-slate-700 mb-1">{t('addReviewModal.commentLabel')}</label>
                    <textarea
                        id="reviewText"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder={t('addReviewModal.commentPlaceholder')}
                        className="w-full h-32 p-3 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8EB8BA] transition-shadow text-slate-900 placeholder:text-slate-500"
                        required
                    />
                </div>
                
                <div className="flex justify-end gap-4 pt-2">
                    <button type="button" onClick={onClose} className="px-5 py-2 rounded-md bg-slate-200 text-slate-700 font-semibold hover:bg-slate-300 transition">
                        {t('addReviewModal.cancel')}
                    </button>
                    <button
                        type="submit"
                        disabled={rating === 0 || !text.trim()}
                        className="px-5 py-2 rounded-md bg-[#8EB8BA] text-white font-semibold hover:bg-teal-500 transition disabled:bg-slate-400 disabled:cursor-not-allowed"
                    >
                        {t('addReviewModal.submit')}
                    </button>
                </div>

            </form>
        </div>
      </div>
    </div>
  );
};

export default AddReviewModal;