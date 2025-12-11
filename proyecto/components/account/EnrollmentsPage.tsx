import React, { useEffect, useState } from 'react';
import { User, Enrollment, Camp, UserReview } from '../../types';
import { CAMPS_DATA } from '../../constants';
import { useTranslations } from '../../context/LanguageContext';
import AddReviewModal from './AddReviewModal';
import { supabase } from '../../supabaseClient';

interface EnrollmentsPageProps {
  user: User;
  onAddReview: (review: UserReview) => void;
  userReviews: UserReview[];
}

interface EnrichedEnrollment extends Enrollment {
    camp: Camp;
}

const EnrollmentsPage: React.FC<EnrollmentsPageProps> = ({ user, onAddReview, userReviews }) => {
  const [enrollments, setEnrollments] = useState<EnrichedEnrollment[]>([]);
  const { t, lang } = useTranslations();
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedCampForReview, setSelectedCampForReview] = useState<Camp | null>(null);

  useEffect(() => {
    const loadEnrollments = async () => {
      try {
        const { data, error } = await supabase
          .from('enrollments')
          .select('id, camp_id, start_date, end_date, form_data')
          .eq('user_id', user.email)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Failed to load enrollments from Supabase', error);
          return;
        }

        const mapped: EnrichedEnrollment[] = (data ?? [])
          .map((e: any) => {
            const camp = CAMPS_DATA.find(c => c.id === e.camp_id);
            if (!camp) return null;
            const enrollment: Enrollment = {
              campId: e.camp_id,
              startDate: e.start_date,
              endDate: e.end_date,
              formData: e.form_data,
            };
            return { ...enrollment, camp };
          })
          .filter((e: EnrichedEnrollment | null): e is EnrichedEnrollment => e !== null);

        setEnrollments(mapped);
      } catch (error) {
        console.error('Failed to load enrollments from Supabase', error);
      }
    };

    loadEnrollments();
  }, [user.email]);
  
  const handleWriteReviewClick = (camp: Camp) => {
    setSelectedCampForReview(camp);
    setIsReviewModalOpen(true);
  };

  const handleCloseReviewModal = () => {
    setIsReviewModalOpen(false);
    setSelectedCampForReview(null);
  };

  const handleSubmitReview = ({ rating, text }: { rating: number, text: string }) => {
    if (!selectedCampForReview) return;

    const newReview: UserReview = {
        campId: selectedCampForReview.id,
        authorEmail: user.email,
        authorName: user.name,
        authorAvatar: user.avatar,
        rating,
        text,
    };
    
    onAddReview(newReview);
    handleCloseReviewModal();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(lang, { day: 'numeric', month: 'long', year: 'numeric' });
  };
  
  const hasUserReviewed = (campId: number) => {
    return userReviews.some(review => review.campId === campId && review.authorEmail === user.email);
  }

  return (
    <>
    <div className="bg-white/80 p-8 rounded-xl shadow-inner animate-fade-in">
      <h3 className="text-xl font-bold text-slate-700 mb-6">{t('enrollments.title')}</h3>
      {enrollments.length > 0 ? (
        <div className="space-y-4">
          {enrollments.map((enrollment, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <img src={`${enrollment.camp.mainImage.replace('/800/250', '/200/200')}`} alt={enrollment.camp.name} className="w-full sm:w-24 h-24 rounded-md object-cover" />
              <div className="flex-grow">
                <p className="font-semibold text-slate-800 text-lg">{enrollment.camp.name}</p>
                <p className="text-sm text-slate-500">{enrollment.camp.location}</p>
                <p className="text-sm text-slate-600 mt-1 font-medium bg-teal-100/60 inline-block px-2 py-1 rounded">
                    {t('enrollments.enrolledOn')} {formatDate(enrollment.startDate)} - {formatDate(enrollment.endDate)}
                </p>
              </div>
              <div>
                  {hasUserReviewed(enrollment.camp.id) ? (
                    <p className="text-sm font-semibold text-green-600 px-3 py-2 bg-green-100 rounded-md">{t('enrollments.reviewSubmitted')}</p>
                  ) : (
                    <button 
                        onClick={() => handleWriteReviewClick(enrollment.camp)}
                        className="bg-[#8EB8BA] text-white font-bold py-2 px-4 rounded-lg hover:bg-teal-500 transition-all duration-300 shadow-sm text-sm"
                    >
                        {t('enrollments.writeReview')}
                    </button>
                  )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-slate-500 py-4">{t('enrollments.noEnrollments')}</p>
      )}
    </div>
    {isReviewModalOpen && selectedCampForReview && (
        <AddReviewModal 
            campName={selectedCampForReview.name}
            onClose={handleCloseReviewModal}
            onSubmit={handleSubmitReview}
        />
    )}
    </>
  );
};

export default EnrollmentsPage;