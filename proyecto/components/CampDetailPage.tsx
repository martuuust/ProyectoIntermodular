import React, { useState, useMemo } from 'react';
import { Camp, DateRange, Review, UserReview } from '../types';
import Calendar from './Calendar';
import { useTranslations } from '../context/LanguageContext';
import { CAMPS_LONG_DESC } from '../translations';
import { NatureIcon, AdventureIcon, WaterIcon, SportsIcon, ArtsIcon, PriceTagIcon, ExternalLinkIcon, ChevronLeftIcon, ChevronRightIcon, StarIcon } from './icons/Icons';

interface CampDetailPageProps {
  camp: Camp;
  onSelectDateRange: (range: DateRange) => void;
  userReviews: UserReview[];
}

const StarRating: React.FC<{ rating: number; className?: string }> = ({ rating, className = 'h-5 w-5' }) => (
    <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
            <StarIcon key={i} className={`${className} ${rating > i ? 'text-amber-400' : 'text-slate-300'}`} filled />
        ))}
    </div>
);

const CampDetailPage: React.FC<CampDetailPageProps> = ({ camp, onSelectDateRange, userReviews }) => {
  const { t, lang } = useTranslations();
  const longDescription = CAMPS_LONG_DESC[lang][camp.id] || camp.longDescription;
  const [selectedRange, setSelectedRange] = useState<DateRange | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const allReviews = useMemo(() => {
    const campUserReviews = userReviews.filter(review => review.campId === camp.id);
    return [...(camp.reviews || []), ...campUserReviews];
  }, [camp.reviews, userReviews, camp.id]);


  const allImages = [camp.mainImage.replace('/800/250', '/800/600'), ...camp.images];

  const handleRegisterClick = () => {
    if (selectedRange) {
      onSelectDateRange(selectedRange);
    }
  };

  const prevImage = () => {
    setCurrentImageIndex(i => (i === 0 ? allImages.length - 1 : i - 1));
  };
  const nextImage = () => {
    setCurrentImageIndex(i => (i === allImages.length - 1 ? 0 : i + 1));
  };

  const highlightDetails: { [key: string]: { icon: React.FC<{ className?: string }>, desc: string } } = {
    Nature: { icon: NatureIcon, desc: t('campDetail.highlightNatureDesc') },
    Adventure: { icon: AdventureIcon, desc: t('campDetail.highlightAdventureDesc') },
    Water: { icon: WaterIcon, desc: t('campDetail.highlightWaterDesc') },
    Sports: { icon: SportsIcon, desc: t('campDetail.highlightSportsDesc') },
    Arts: { icon: ArtsIcon, desc: t('campDetail.highlightArtsDesc') },
  };

  const reviewStats = useMemo(() => {
    if (allReviews.length === 0) return { average: 0, total: 0, breakdown: [0, 0, 0, 0, 0] };
    const total = allReviews.length;
    const sum = allReviews.reduce((acc, review) => acc + review.rating, 0);
    const average = sum / total;
    const breakdown = [5, 4, 3, 2, 1].map(stars => {
        const count = allReviews.filter(r => r.rating === stars).length;
        return (count / total) * 100;
    });
    return { average, total, breakdown };
  }, [allReviews]);

  return (
    <div className="animate-fade-in">
        <div className="relative rounded-xl overflow-hidden shadow-2xl mb-8">
            <img src={camp.mainImage} alt={`Banner de ${camp.name}`} className="w-full h-48 md:h-64 object-cover"/>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-6 left-8">
                <h1 className="text-4xl lg:text-5xl font-brand text-white" style={{textShadow: '0 2px 4px rgba(0,0,0,0.5)'}}>{camp.name}</h1>
                <p className="text-lg text-white/90 font-semibold" style={{textShadow: '0 1px 3px rgba(0,0,0,0.5)'}}>{camp.location}</p>
            </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-12">
                <section>
                    <h2 className="text-3xl font-bold text-slate-800 mb-4 border-b-2 border-teal-200 pb-2">{t('campDetail.aboutTitle')}</h2>
                    <p className="text-slate-700 leading-relaxed whitespace-pre-line">{longDescription}</p>
                </section>

                <section>
                    <h2 className="text-3xl font-bold text-slate-800 mb-6 border-b-2 border-teal-200 pb-2">{t('campDetail.activitiesTitle')}</h2>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                         {camp.highlights.map(highlight => {
                             const HighlightIcon = highlightDetails[highlight]?.icon;
                             return (
                                 <div key={highlight} className="flex items-start gap-4">
                                     <div className="flex-shrink-0 bg-teal-100 text-[#8EB8BA] p-3 rounded-full">
                                         {HighlightIcon && <HighlightIcon className="h-6 w-6" />}
                                     </div>
                                     <div>
                                         <h3 className="font-bold text-slate-800 text-lg">{t(`campDetail.highlight${highlight}`)}</h3>
                                         <p className="text-slate-600 text-sm">{highlightDetails[highlight]?.desc}</p>
                                     </div>
                                 </div>
                             );
                         })}
                    </div>
                </section>

                <section>
                    <h2 className="text-3xl font-bold text-slate-800 mb-4 border-b-2 border-teal-200 pb-2">{t('campDetail.galleryTitle')}</h2>
                    <div className="relative">
                        <div className="aspect-video relative rounded-lg overflow-hidden shadow-lg bg-slate-200">
                            <img src={allImages[currentImageIndex]} alt={`Foto del campamento ${currentImageIndex + 1}`} className="w-full h-full object-cover transition-opacity duration-300" key={currentImageIndex} />
                            <div className="absolute inset-0 flex justify-between items-center px-2 sm:px-4">
                                <button onClick={prevImage} aria-label="Previous image" className="bg-black/40 text-white rounded-full p-2 hover:bg-black/60 transition-colors focus:outline-none focus:ring-2 focus:ring-white"><ChevronLeftIcon /></button>
                                <button onClick={nextImage} aria-label="Next image" className="bg-black/40 text-white rounded-full p-2 hover:bg-black/60 transition-colors focus:outline-none focus:ring-2 focus:ring-white"><ChevronRightIcon /></button>
                            </div>
                        </div>
                        <div className="flex gap-2 mt-4 overflow-x-auto p-1">
                            {allImages.map((img, index) => (
                                <button key={index} onClick={() => setCurrentImageIndex(index)} className="flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8EB8BA] rounded-md">
                                    <img src={img} alt={`Thumbnail ${index + 1}`} className={`w-20 h-14 object-cover rounded-md cursor-pointer border-2 ${currentImageIndex === index ? 'border-[#8EB8BA]' : 'border-transparent'} hover:opacity-80 transition`} />
                                </button>
                            ))}
                        </div>
                    </div>
                </section>
                
                <section>
                    <h2 className="text-3xl font-bold text-slate-800 mb-6 border-b-2 border-teal-200 pb-2">{t('campDetail.reviewsTitle')}</h2>
                    {allReviews.length > 0 ? (
                        <div className="space-y-8">
                            <div className="bg-white/50 p-6 rounded-lg flex flex-col sm:flex-row items-center gap-6">
                                <div className="text-center">
                                    <p className="text-5xl font-bold text-slate-800">{reviewStats.average.toFixed(1)}</p>
                                    <StarRating rating={reviewStats.average} />
                                    <p className="text-sm text-slate-600 mt-1">{t('campDetail.basedOn', { count: reviewStats.total.toString() })}</p>
                                </div>
                                <div className="w-full sm:flex-1">
                                    {reviewStats.breakdown.map((percent, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-slate-600">{5 - i} {t('campDetail.stars')}</span>
                                            <div className="w-full bg-slate-200 rounded-full h-2.5">
                                                <div className="bg-amber-400 h-2.5 rounded-full" style={{ width: `${percent}%` }}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                             <div className="space-y-6">
                                {allReviews.map((review, index) => (
                                    <div key={index} className="flex items-start gap-4 p-4 border-t border-slate-200">
                                        <img src={review.authorAvatar} alt={review.authorName} className="w-12 h-12 rounded-full object-cover"/>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h4 className="font-bold text-slate-800">{review.authorName}</h4>
                                                <StarRating rating={review.rating} className="h-4 w-4" />
                                            </div>
                                            <p className="text-slate-600 leading-relaxed">{review.text}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <p className="text-slate-600 text-center py-4">{t('campDetail.noReviews')}</p>
                    )}
                </section>
            </div>

            <div className="lg:col-span-1">
                <div className="sticky top-24 bg-white/60 backdrop-blur-md p-6 rounded-xl shadow-lg space-y-6">
                    {camp.price && (
                        <div className="flex items-center gap-4 p-4 bg-teal-50 rounded-lg border border-teal-200">
                            <PriceTagIcon className="h-8 w-8 text-teal-600 flex-shrink-0" />
                            <div>
                                <p className="text-2xl font-bold text-slate-800">{t('campDetail.pricePerWeek', { price: camp.price.toString() })}</p>
                            </div>
                        </div>
                    )}
                    <div>
                        <h3 className="text-xl font-bold text-center text-slate-800 mb-4">{t('campDetail.selectDate')}</h3>
                        <Calendar onRangeSelect={setSelectedRange} />
                    </div>
                    <button
                        onClick={handleRegisterClick}
                        disabled={!selectedRange}
                        className="w-full bg-[#8EB8BA] text-white font-bold py-3 px-8 rounded-lg hover:bg-teal-500 transition-all duration-300 shadow-md transform hover:scale-105 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:scale-100"
                    >
                        {t('campDetail.registerButton')}
                    </button>
                    <a
                        href={camp.officialSite || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 bg-white text-slate-700 font-bold py-3 px-4 rounded-lg hover:bg-slate-100 transition-all duration-300 shadow-md transform hover:scale-105 border border-slate-300"
                    >
                        <ExternalLinkIcon />
                        {t('campDetail.visitWebsite')}
                    </a>
                </div>
            </div>
        </div>
    </div>
  );
};

export default CampDetailPage;