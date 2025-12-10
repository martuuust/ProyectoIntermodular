import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslations } from '../context/LanguageContext';
import { CommunityUserRole, Post, Story, User, Comment, PollOption } from '../types';
import { HeartIcon, CommentIcon, PlusCircleIcon, CloseIcon, ChevronLeftIcon, ChevronRightIcon, SwitchUserIcon, TrashIcon, UserIcon, PollIcon, TextIcon } from './icons/Icons';
import { CAMPS_DATA } from '../constants';
import { supabase } from '../supabaseClient';


// --- SUB-COMPONENTS ---

const StoryBubbles: React.FC<{ 
    stories: Story[],
    role: CommunityUserRole,
    currentUser: User,
    onViewStory: (storyId: number) => void,
    onAddStoryClick: () => void
}> = ({ stories, role, currentUser, onViewStory, onAddStoryClick }) => {
    const { t } = useTranslations();
    return (
        <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-700 mb-3 px-4">{t('community.stories')}</h2>
            <div className="flex space-x-4 overflow-x-auto p-4 -m-4">
                {role === 'monitor' && (
                    <div onClick={onAddStoryClick} className="flex-shrink-0 text-center w-20 cursor-pointer group">
                        <div className="relative">
                            <div className="w-16 h-16 rounded-full p-0.5 bg-slate-200 mx-auto flex items-center justify-center group-hover:bg-slate-300 transition-colors">
                                <PlusCircleIcon className="h-8 w-8 text-slate-500"/>
                            </div>
                        </div>
                        <p className="text-xs mt-1.5 truncate text-slate-600 font-semibold">{t('community.addStory')}</p>
                    </div>
                )}
                {stories.map(story => (
                    <div key={story.id} onClick={() => onViewStory(story.id)} className="flex-shrink-0 text-center w-20 cursor-pointer">
                        <div className="relative">
                             <div className={`w-16 h-16 rounded-full p-0.5 mx-auto transition-all ${story.viewed ? 'bg-slate-300' : 'bg-gradient-to-br from-amber-400 via-red-500 to-violet-600'}`}>
                                <div className="bg-white p-0.5 rounded-full">
                                    <img src={story.monitorAvatar} alt={story.monitorName} className={`w-full h-full object-cover rounded-full transition-opacity ${story.viewed ? 'opacity-70' : ''}`} />
                                </div>
                            </div>
                        </div>
                        <p className="text-xs mt-1.5 truncate text-slate-600">{story.monitorName}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

const StoryViewer: React.FC<{
    stories: Story[];
    startIndex: number;
    onClose: () => void;
    onViewed: (storyId: number) => void;
    onReact: (storyId: number, emoji: string) => void;
}> = ({ stories, startIndex, onClose, onViewed, onReact }) => {
    const [currentIndex, setCurrentIndex] = useState(startIndex);
    const [progress, setProgress] = useState(0);
    const story = stories[currentIndex];

    useEffect(() => {
        onViewed(story.id);
        setProgress(0);
        const timer = setTimeout(() => {
            handleNext();
        }, 5000);

        const interval = setInterval(() => {
            setProgress(p => p + (100 / (5000 / 50)));
        }, 50);

        return () => {
            clearTimeout(timer);
            clearInterval(interval);
        };
    }, [currentIndex, stories, onClose, onViewed]);
    
    const handleNext = () => {
        if (currentIndex < stories.length - 1) {
            setCurrentIndex(i => i + 1);
        } else {
            onClose();
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(i => i - 1);
        }
    };
    
    if (!story) return null;

    return (
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center animate-fade-in" onClick={onClose}>
            <div className="relative w-full max-w-sm h-[90vh] bg-slate-900 rounded-lg overflow-hidden flex flex-col justify-center" onClick={e => e.stopPropagation()}>
                <div className="absolute top-2 left-2 right-2 h-1 flex gap-1">
                    {stories.map((s, index) => (
                        <div key={s.id} className="flex-1 bg-white/30 rounded-full overflow-hidden">
                           <div 
                                className="h-full bg-white transition-all" 
                                style={{ transitionDuration: '50ms', width: `${index < currentIndex ? 100 : (index === currentIndex ? progress : 0)}%` }}
                           />
                        </div>
                    ))}
                </div>
                
                <img src={story.imageUrl} className="w-full h-auto object-contain" />
                
                <div className="absolute top-5 left-4 flex items-center gap-3">
                    <img src={story.monitorAvatar} alt={story.monitorName} className="w-10 h-10 rounded-full border-2 border-white"/>
                    <p className="text-white font-bold text-sm shadow-text">{story.monitorName}</p>
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                    {story.caption && <p className="text-white text-center mb-4 shadow-text">{story.caption}</p>}
                    <div className="flex justify-center items-center gap-4">
                        {['❤️', '😂', '👍', '🥰'].map(emoji => (
                            <button key={emoji} onClick={() => onReact(story.id, emoji)} className="text-3xl transform hover:scale-125 transition-transform">
                                {emoji}
                            </button>
                        ))}
                    </div>
                </div>

                <button onClick={onClose} className="absolute top-4 right-4 text-white hover:opacity-70 transition"><CloseIcon /></button>
                <button onClick={handlePrev} className="absolute left-2 top-1/2 -translate-y-1/2 text-white bg-black/20 rounded-full p-1 hover:bg-black/40 transition disabled:opacity-0"><ChevronLeftIcon /></button>
                <button onClick={handleNext} className="absolute right-2 top-1/2 -translate-y-1/2 text-white bg-black/20 rounded-full p-1 hover:bg-black/40 transition disabled:opacity-0"><ChevronRightIcon /></button>
            </div>
            <style>{`.shadow-text { text-shadow: 0 1px 3px rgba(0,0,0,0.5); }`}</style>
        </div>
    );
};

const PostCard: React.FC<{ 
    post: Post; 
    role: CommunityUserRole; 
    currentUser: User; 
    onLike: (postId: number) => void;
    onAddComment: (postId: number, commentText: string) => void;
    onDeletePost: (postId: number) => void;
    onVote: (postId: number, optionId: number) => void;
}> = ({ post, role, currentUser, onLike, onAddComment, onDeletePost, onVote }) => {
    const { t } = useTranslations();
    const [comment, setComment] = useState('');
    const hasLiked = useMemo(() => post.likedBy.includes(currentUser.email), [post.likedBy, currentUser.email]);
    const userVote = post.type === 'poll' ? post.poll?.votedBy[currentUser.email] : undefined;
    const totalVotes = post.type === 'poll' ? post.poll?.options?.reduce((sum, opt) => sum + opt.votes, 0) : 0;
    const camp = useMemo(() => CAMPS_DATA.find(c => c.id === post.campId), [post.campId]);

    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(comment.trim()) {
            onAddComment(post.id, comment);
            setComment('');
        }
    }

    return (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md overflow-hidden">
            <div className="p-4 flex items-center justify-between gap-3 border-b border-slate-200">
                <div className="flex items-center gap-3">
                    <img src={post.monitorAvatar} alt={post.monitorName} className="w-10 h-10 rounded-full object-cover" />
                     <div>
                        <span className="font-bold text-slate-800">{post.monitorName}</span>
                        {camp && <p className="text-xs text-slate-500">en {camp.name}</p>}
                    </div>
                </div>
                 {role === 'monitor' && post.monitorName === currentUser.name && (
                    <button onClick={() => onDeletePost(post.id)} className="text-slate-500 hover:text-red-500 transition-colors" title={t('community.deletePost')}>
                        <TrashIcon className="w-5 h-5"/>
                    </button>
                )}
            </div>
            
            {post.type === 'photo' && post.imageUrl && <img src={post.imageUrl} alt={post.caption} className="w-full h-auto" />}
            
            <div className="p-4">
                 <p className={`text-slate-700 mb-4 whitespace-pre-wrap ${post.type === 'text' ? 'text-base leading-relaxed' : 'text-sm'}`}>
                    {post.type !== 'text' && <span className="font-bold mr-1.5">{post.monitorName}</span>}
                    {post.caption}
                </p>

                {post.type === 'poll' && post.poll && (
                    <div className="space-y-2 my-4">
                        <h3 className="font-semibold text-slate-800 mb-3">{post.poll.question}</h3>
                        {post.poll.options?.map(option => {
                            const percentage = totalVotes && totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
                            const hasVotedThis = userVote === option.id;
                            
                            return (
                                <div key={option.id}>
                                    {userVote !== undefined ? (
                                        <div className="relative w-full bg-slate-200 rounded-full p-2 text-sm">
                                            <div className="absolute top-0 left-0 h-full bg-teal-200 rounded-full" style={{ width: `${percentage}%` }}></div>
                                            <div className="relative flex justify-between px-2">
                                                <span className={`font-semibold ${hasVotedThis ? 'text-teal-900' : 'text-slate-700'}`}>{option.text}</span>
                                                <span className={`font-semibold ${hasVotedThis ? 'text-teal-900' : 'text-slate-600'}`}>{percentage.toFixed(0)}%</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <button onClick={() => onVote(post.id, option.id)} className="w-full text-left p-2 border border-slate-300 rounded-full hover:bg-slate-100 transition text-slate-700 font-medium">
                                            {option.text}
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}


                <div className="flex items-center gap-4">
                    <button onClick={() => onLike(post.id)} className={`transition-colors duration-200 ${hasLiked ? 'text-red-500' : 'text-slate-500 hover:text-slate-700'}`}>
                        <HeartIcon filled={hasLiked} className="h-7 w-7"/>
                    </button>
                    <button className="text-slate-500 hover:text-slate-700">
                        <CommentIcon className="h-7 w-7"/>
                    </button>
                </div>

                <p className="font-semibold text-slate-800 my-2 text-sm">
                    {t('community.likes', { count: post.likes.toString() })}
                </p>

                <div className="mt-2 space-y-2 text-sm">
                    {Array.isArray(post.comments) && post.comments.length > 2 && (
                        <p className="text-slate-500 cursor-pointer hover:underline mb-2">
                            {t('community.viewAllComments', { count: post.comments.length.toString() })}
                        </p>
                    )}
                    {Array.isArray(post.comments) && post.comments.slice(-2).map((comment) => (
                        <div key={comment.id} className="flex items-start gap-2.5">
                            <img src={comment.authorAvatar} alt={comment.authorName} className="w-7 h-7 rounded-full object-cover"/>
                            <p className="flex-1 bg-slate-100 px-3 py-1.5 rounded-lg">
                                <span className="font-bold text-slate-800 mr-1.5">{comment.authorName}</span>
                                {comment.text}
                            </p>
                        </div>
                    ))}
                </div>
                
                <form onSubmit={handleCommentSubmit} className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-200">
                    <img src={currentUser.avatar} alt="You" className="w-7 h-7 rounded-full object-cover"/>
                    <input 
                        type="text" 
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder={t('community.addComment')}
                        className="w-full bg-transparent text-sm focus:outline-none text-slate-800 placeholder:text-slate-500"
                    />
                    <button type="submit" className="text-[#8EB8BA] font-semibold text-sm disabled:text-slate-400" disabled={!comment.trim()}>
                        {t('community.post')}
                    </button>
                </form>
            </div>
        </div>
    );
};

const CreatePostModal: React.FC<{ onClose: () => void; onAddPost: (postData: { type: 'photo' | 'poll' | 'text', caption: string, imageBase64?: string | null, poll?: { question: string, options: string[] } }) => void }> = ({ onClose, onAddPost }) => {
    const { t } = useTranslations();
    const [postType, setPostType] = useState<'photo' | 'poll' | 'text'>('photo');
    const [caption, setCaption] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [pollQuestion, setPollQuestion] = useState('');
    const [pollOptions, setPollOptions] = useState<string[]>(['', '']);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onloadend = () => setImage(reader.result as string);
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handlePollOptionChange = (index: number, value: string) => {
        const newOptions = [...pollOptions];
        newOptions[index] = value;
        setPollOptions(newOptions);
    };

    const addPollOption = () => {
        if (pollOptions.length < 4) {
            setPollOptions([...pollOptions, '']);
        }
    };

    const handleSubmit = () => {
        if (postType === 'photo' && caption.trim() && image) {
            onAddPost({ type: 'photo', caption, imageBase64: image });
        } else if (postType === 'poll' && caption.trim() && pollQuestion.trim() && pollOptions.every(opt => opt.trim())) {
            onAddPost({ type: 'poll', caption, poll: { question: pollQuestion, options: pollOptions.filter(opt => opt.trim()) } });
        } else if (postType === 'text' && caption.trim()) {
            onAddPost({ type: 'text', caption });
        }
    };
    
    const canSubmit = 
        (postType === 'photo' && !!caption.trim() && !!image) ||
        (postType === 'poll' && !!caption.trim() && !!pollQuestion.trim() && pollOptions.filter(o => o.trim()).length >= 2) ||
        (postType === 'text' && !!caption.trim());

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60] animate-fade-in" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg m-4 animate-slide-up" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-lg font-bold text-slate-800">{t('community.createPostTitle')}</h2>
                    <button onClick={onClose}><CloseIcon /></button>
                </div>
                <div className="p-6 space-y-4">
                     <div className="flex border border-slate-200 rounded-lg p-1">
                        <button onClick={() => setPostType('photo')} className={`w-1/3 p-2 rounded-md font-semibold text-sm transition flex items-center justify-center gap-2 ${postType === 'photo' ? 'bg-slate-200 text-slate-800' : 'text-slate-500 hover:bg-slate-100'}`}>Foto</button>
                        <button onClick={() => setPostType('poll')} className={`w-1/3 p-2 rounded-md font-semibold text-sm transition flex items-center justify-center gap-2 ${postType === 'poll' ? 'bg-slate-200 text-slate-800' : 'text-slate-500 hover:bg-slate-100'}`}><PollIcon className="w-5 h-5"/> Encuesta</button>
                        <button onClick={() => setPostType('text')} className={`w-1/3 p-2 rounded-md font-semibold text-sm transition flex items-center justify-center gap-2 ${postType === 'text' ? 'bg-slate-200 text-slate-800' : 'text-slate-500 hover:bg-slate-100'}`}><TextIcon className="w-5 h-5"/> Texto</button>
                    </div>

                    <textarea value={caption} onChange={e => setCaption(e.target.value)} placeholder={postType === 'text' ? '¿Qué está pasando?' : t('community.captionPlaceholder')} className="w-full h-24 p-3 bg-slate-100 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8EB8BA] text-slate-900 placeholder:text-slate-600" />
                    
                    {postType === 'photo' ? (
                        <>
                            <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
                            {image ? (
                                <div className="relative">
                                    <img src={image} alt="Preview" className="w-full h-auto max-h-60 object-contain rounded-md" />
                                    <button onClick={() => { setImage(null); if(fileInputRef.current) fileInputRef.current.value = ""; }} className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1"><CloseIcon /></button>
                                </div>
                            ) : (
                                <button onClick={() => fileInputRef.current?.click()} className="w-full p-4 border-2 border-dashed rounded-md text-slate-500 hover:bg-slate-50 transition">{t('community.uploadImage')}</button>
                            )}
                        </>
                    ) : postType === 'poll' ? (
                        <div className="space-y-3">
                            <input type="text" value={pollQuestion} onChange={e => setPollQuestion(e.target.value)} placeholder="Tu pregunta..." className="w-full p-3 bg-slate-100 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8EB8BA] text-slate-900 placeholder:text-slate-600" />
                            {pollOptions.map((opt, i) => (
                                <input key={i} type="text" value={opt} onChange={e => handlePollOptionChange(i, e.target.value)} placeholder={`Opción ${i + 1}`} className="w-full p-3 bg-slate-100 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8EB8BA] text-slate-900 placeholder:text-slate-600" />
                            ))}
                            {pollOptions.length < 4 && <button onClick={addPollOption} className="text-sm font-semibold text-[#8EB8BA] hover:underline">Añadir opción</button>}
                        </div>
                    ) : null}
                </div>
                <div className="p-4 border-t text-right">
                    <button onClick={handleSubmit} className="bg-[#8EB8BA] text-white font-bold py-2 px-6 rounded-lg hover:bg-teal-500 transition-all shadow-md disabled:bg-slate-400" disabled={!canSubmit}>{t('community.publish')}</button>
                </div>
            </div>
        </div>
    );
};

const CreateStoryModal: React.FC<{ onClose: () => void; onAddStory: (data: { imageBase64: string, caption: string }) => void }> = ({ onClose, onAddStory }) => {
    const { t } = useTranslations();
    const [image, setImage] = useState<string | null>(null);
    const [caption, setCaption] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onloadend = () => setImage(reader.result as string);
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleSubmit = () => { if (image) { onAddStory({ imageBase64: image, caption }); } };
    
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60] animate-fade-in" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg m-4 animate-slide-up" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-lg font-bold text-slate-800">{t('community.createStoryTitle')}</h2>
                    <button onClick={onClose}><CloseIcon /></button>
                </div>
                <div className="p-6 space-y-4">
                     <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
                    {image ? (
                        <div className="relative">
                            <img src={image} alt="Preview" className="w-full h-auto max-h-80 object-contain rounded-md" />
                            <button onClick={() => { setImage(null); if(fileInputRef.current) fileInputRef.current.value = ""; }} className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1"><CloseIcon /></button>
                        </div>
                    ) : (
                        <button onClick={() => fileInputRef.current?.click()} className="w-full p-4 border-2 border-dashed rounded-md text-slate-500 hover:bg-slate-50 transition">{t('community.uploadImage')}</button>
                    )}
                     <textarea value={caption} onChange={e => setCaption(e.target.value)} placeholder={t('community.captionPlaceholder')} className="w-full h-20 p-3 bg-slate-100 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8EB8BA] text-slate-900 placeholder:text-slate-600" />
                </div>
                <div className="p-4 border-t text-right">
                    <button onClick={handleSubmit} className="bg-[#8EB8BA] text-white font-bold py-2 px-6 rounded-lg hover:bg-teal-500 transition-all shadow-md disabled:bg-slate-400" disabled={!image}>{t('community.publishStory')}</button>
                </div>
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---

interface CommunityPageProps {
    currentUser: User;
    onSwitchAccount: () => void;
    onAccountClick: () => void;
}

const CommunityPage: React.FC<CommunityPageProps> = ({ currentUser, onSwitchAccount, onAccountClick }) => {
    const { t } = useTranslations();
    const [role, setRole] = useState<CommunityUserRole | null>('parent');
    const [posts, setPosts] = useState<Post[]>([]);
    const [stories, setStories] = useState<Story[]>([]);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isCreateStoryModalOpen, setIsCreateStoryModalOpen] = useState(false);
    const [viewingStoryIndex, setViewingStoryIndex] = useState<number | null>(null);

    useEffect(() => {
      const loadCommunityData = async () => {
        try {
          const { data: postsData, error: postsError } = await supabase
            .from('community_posts')
            .select('*')
            .order('created_at', { ascending: false });

          if (!postsError && postsData) {
            const mappedPosts: Post[] = (postsData as any[]).map((p) => ({
              id: p.id,
              campId: p.camp_id,
              type: p.type,
              monitorId: p.monitor_id ?? 0,
              monitorName: p.monitor_name,
              monitorAvatar: p.monitor_avatar,
              caption: p.caption,
              imageUrl: p.image_url || undefined,
              poll: p.poll as any,
              likes: p.likes ?? 0,
              likedBy: p.liked_by ?? [],
              comments: p.comments ?? [],
              timestamp: p.created_at,
            }));
            setPosts(mappedPosts);
          }

          const { data: storiesData, error: storiesError } = await supabase
            .from('community_stories')
            .select('*')
            .order('created_at', { ascending: false });

          if (!storiesError && storiesData) {
            const mappedStories: Story[] = (storiesData as any[]).map((s) => ({
              id: s.id,
              monitorName: s.monitor_name,
              monitorAvatar: s.monitor_avatar,
              imageUrl: s.image_url,
              caption: s.caption ?? undefined,
              reactions: s.reactions ?? [],
              viewed: false,
            }));
            setStories(mappedStories);
          }
        } catch (error) {
          console.error('Error al cargar datos de comunidad desde Supabase', error);
        }
      };

      loadCommunityData();
    }, [currentUser.email]);

    const handleLike = (postId: number) => {
        if (!currentUser) return;
        setPosts(prevPosts => prevPosts.map(p => {
            if (p.id === postId) {
                const alreadyLiked = p.likedBy.includes(currentUser.email);
                if (alreadyLiked) return { ...p, likes: p.likes - 1, likedBy: p.likedBy.filter(email => email !== currentUser.email) };
                else return { ...p, likes: p.likes + 1, likedBy: [...p.likedBy, currentUser.email] };
            }
            return p;
        }));
        try {
          const target = posts.find(p => p.id === postId);
          if (!target) return;
          await supabase
            .from('community_posts')
            .update({
              likes: target.likes,
              liked_by: target.likedBy,
            })
            .eq('id', postId);
        } catch (error) {
          console.error('Error al actualizar likes en Supabase', error);
        }
    };

    const handleAddComment = (postId: number, commentText: string) => {
        if (!currentUser) return;
        const newComment: Comment = { id: Date.now(), authorName: currentUser.name, authorAvatar: currentUser.avatar, text: commentText };
        setPosts(prevPosts => prevPosts.map(p => {
            if (p.id === postId) {
                const existingComments = Array.isArray(p.comments) ? p.comments : [];
                return { ...p, comments: [...existingComments, newComment] };
            }
            return p;
        }));
        try {
          const target = posts.find(p => p.id === postId);
          if (!target) return;
          await supabase
            .from('community_posts')
            .update({
              comments: target.comments,
            })
            .eq('id', postId);
        } catch (error) {
          console.error('Error al actualizar comentarios en Supabase', error);
        }
    };

    const handleAddPost = (postData: { type: 'photo' | 'poll' | 'text', caption: string, imageBase64?: string | null, poll?: { question: string, options: string[] } }) => {
        try {
            if (!currentUser) return;
            const basePayload: any = {
              camp_id: CAMPS_DATA[0]?.id ?? 1,
              type: postData.type,
              monitor_name: currentUser.name,
              monitor_avatar: currentUser.avatar,
              caption: postData.caption,
              image_url: null,
              poll: null,
              likes: 0,
              liked_by: [],
              comments: [],
            };

            if (postData.type === 'photo' && postData.imageBase64) {
              basePayload.image_url = postData.imageBase4;
            } else if (postData.type === 'poll' && postData.poll) {
              basePayload.poll = {
                question: postData.poll.question,
                options: postData.poll.options.map((opt, i) => ({ id: i + 1, text: opt, votes: 0 })),
                votedBy: {},
              };
            }

            const { data, error } = await supabase
              .from('community_posts')
              .insert([basePayload])
              .select('*')
              .single();

            if (error) {
              console.error('Failed to add post in Supabase:', error);
              return;
            }

            const newPost: Post = {
              id: data.id,
              campId: data.camp_id,
              type: data.type,
              monitorId: data.monitor_id ?? 0,
              monitorName: data.monitor_name,
              monitorAvatar: data.monitor_avatar,
              caption: data.caption,
              imageUrl: data.image_url || undefined,
              poll: data.poll,
              likes: data.likes ?? 0,
              likedBy: data.liked_by ?? [],
              comments: data.comments ?? [],
              timestamp: data.created_at,
            };

            setPosts(prevPosts => [newPost, ...prevPosts]);
        } catch (error) {
            console.error("Failed to add post:", error);
        } finally {
            setIsCreateModalOpen(false);
        }
    };
    
    const handleAddStory = (data: { imageBase64: string, caption: string }) => {
        try {
            if (!currentUser) return;
            const payload = {
              monitor_name: currentUser.name,
              monitor_avatar: currentUser.avatar,
              image_url: data.imageBase64,
              caption: data.caption,
              reactions: [],
            };
            const { data: inserted, error } = await supabase
              .from('community_stories')
              .insert([payload])
              .select('*')
              .single();
            if (error) {
              console.error('Failed to add story in Supabase:', error);
            } else {
              const newStory: Story = {
                id: inserted.id,
                monitorName: inserted.monitor_name,
                monitorAvatar: inserted.monitor_avatar,
                imageUrl: inserted.image_url,
                caption: inserted.caption ?? undefined,
                reactions: inserted.reactions ?? [],
                viewed: false,
              };
              setStories(prevStories => [newStory, ...prevStories]);
            }
        } catch (error) {
            console.error("Failed to add story:", error);
        } finally {
            setIsCreateStoryModalOpen(false);
        }
    };

    const handleDeletePost = (postId: number) => {
        if (window.confirm(t('community.deletePostConfirmation'))) {
            setPosts(prevPosts => prevPosts.filter(p => p.id !== postId));
            try {
              await supabase
                .from('community_posts')
                .delete()
                .eq('id', postId);
            } catch (error) {
              console.error('Failed to delete post in Supabase:', error);
            }
        }
    };
    
    const handleVote = (postId: number, optionId: number) => {
        if (!currentUser) return;
        setPosts(prevPosts => prevPosts.map(p => {
            if (p.id === postId && p.type === 'poll' && p.poll && !p.poll.votedBy[currentUser.email]) {
                const newPoll = { ...p.poll };
                newPoll.options = newPoll.options.map(opt => opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt);
                newPoll.votedBy = { ...newPoll.votedBy, [currentUser.email]: optionId };
                return { ...p, poll: newPoll };
            }
            return p;
        }));
        try {
          const target = posts.find(p => p.id === postId);
          if (!target || !target.poll) return;
          await supabase
            .from('community_posts')
            .update({
              poll: target.poll,
            })
            .eq('id', postId);
        } catch (error) {
          console.error('Failed to update poll in Supabase:', error);
        }
    };

    const handleViewStory = (storyId: number) => {
        const storyIndex = stories.findIndex(s => s.id === storyId);
        if (storyIndex > -1) setViewingStoryIndex(storyIndex);
    };
    
    const handleStoryViewed = (storyId: number) => {
        setStories(prevStories => prevStories.map(s => s.id === storyId ? { ...s, viewed: true } : s));
    };
    
    const handleReactToStory = (storyId: number, emoji: string) => {
        if (!currentUser) return;
        setStories(prevStories => prevStories.map(s => {
            if (s.id === storyId) {
                const existingReactionIndex = s.reactions?.findIndex(r => r.userEmail === currentUser.email) ?? -1;
                let newReactions = [...(s.reactions || [])];
                if (existingReactionIndex !== -1) {
                    if (newReactions[existingReactionIndex].emoji === emoji) {
                        newReactions.splice(existingReactionIndex, 1);
                    } else {
                        newReactions[existingReactionIndex] = { userEmail: currentUser.email, emoji };
                    }
                } else {
                    newReactions.push({ userEmail: currentUser.email, emoji });
                }
                return { ...s, reactions: newReactions };
            }
            return s;
        }));
    };

    if (!currentUser || !role) return null;

    return (
        <div className="max-w-2xl mx-auto animate-fade-in">
            <header className="flex justify-between items-center mb-4 px-4">
                 <h1 className="text-3xl font-brand text-[#2E4053]">{t('community.title')}</h1>
                 <div className="flex items-center gap-4">
                    {role === 'monitor' && (
                        <button onClick={() => setIsCreateModalOpen(true)} className="text-[#8EB8BA] hover:text-teal-600 transition-colors" title={t('community.createPost')}>
                            <PlusCircleIcon className="w-8 h-8" />
                        </button>
                    )}
                     <button onClick={onAccountClick} className="text-slate-600 hover:text-[#8EB8BA] transition-colors" title={t('account.title')}>
                        <UserIcon />
                    </button>
                    <button onClick={onSwitchAccount} className="text-slate-600 hover:text-[#8EB8BA] transition-colors" title={t('header.switchAccount')}>
                        <SwitchUserIcon />
                    </button>
                 </div>
            </header>

            <StoryBubbles stories={stories} role={role} currentUser={currentUser} onViewStory={handleViewStory} onAddStoryClick={() => setIsCreateStoryModalOpen(true)} />

            <main className="space-y-6">
                {posts.map(post => (
                    <PostCard key={post.id} post={post} role={role} currentUser={currentUser} onLike={handleLike} onAddComment={handleAddComment} onDeletePost={handleDeletePost} onVote={handleVote} />
                ))}
                 {posts.length === 0 && (
                    <div className="text-center py-10 px-4">
                        <p className="text-slate-500">El feed está un poco silencioso ahora mismo.</p>
                        {role === 'monitor' && <p className="text-slate-500 mt-2">¡Anímate a ser el primero en publicar algo!</p>}
                        {role === 'parent' && <p className="text-slate-500 mt-2">Pronto los monitores compartirán fotos y novedades del campamento.</p>}
                    </div>
                )}
            </main>

            {isCreateModalOpen && role === 'monitor' && (<CreatePostModal onClose={() => setIsCreateModalOpen(false)} onAddPost={handleAddPost} />)}
            {isCreateStoryModalOpen && role === 'monitor' && (<CreateStoryModal onClose={() => setIsCreateStoryModalOpen(false)} onAddStory={handleAddStory} />)}
            {viewingStoryIndex !== null && (<StoryViewer stories={stories} startIndex={viewingStoryIndex} onClose={() => setViewingStoryIndex(null)} onViewed={handleStoryViewed} onReact={handleReactToStory} />)}
        </div>
    );
};

export default CommunityPage;