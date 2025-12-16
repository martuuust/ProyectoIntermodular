export interface Camp {
  id: number;
  name: string;
  location: string;
  description: string;
  longDescription: string;
  mainImage: string;
  images: string[];
  isFavorite?: boolean;
  officialSite?: string;
  contactPhone?: string;
  contactEmail?: string;
  highlights: string[];
  price?: number;
  reviews?: Review[];
}

export interface FormData {
  childFirstName: string;
  childLastName: string;
  childEmail: string;
  childOtherInfo: string;
  parentFirstName: string;
  parentLastName: string;
  parentDni: string;
  parentEmail: string;
  parentPhone: string;
  cardNumber: string;
  cardCvc: string;
  cardExpiry: string;
  photoPermission: boolean;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export type View = 'home' | 'detail' | 'form' | 'summary' | 'auth' | 'info' | 'account' | 'coming-soon' | 'community';

export interface User {
  name: string;
  avatar: string;
  email: string;
}

export interface Message {
  sender: 'user' | 'bot';
  text: string;
}

export interface Enrollment {
  campId: number;
  startDate: string; // ISO string
  endDate: string; // ISO string
  formData: FormData;
}

// Fix: Add missing community-related type definitions
export type CommunityUserRole = 'parent' | 'monitor';

export interface PollOption {
  id: number;
  text: string;
  votes: number;
}

export interface Poll {
  question: string;
  options: PollOption[];
  votedBy: Record<string, number>; // { [userEmail]: optionId }
}

export interface Comment {
  id: number;
  authorName: string;
  authorAvatar: string;
  text: string;
}

export interface Post {
  id: number;
  campId: number;
  type: 'photo' | 'poll' | 'text';
  monitorId: number;
  monitorName: string;
  monitorAvatar: string;
  caption: string;
  imageUrl?: string;
  poll?: Poll;
  likes: number;
  likedBy: string[]; // array of user emails
  comments: Comment[];
  timestamp: string; // ISO string
}

export interface Story {
  id: number;
  monitorName: string;
  monitorAvatar: string;
  imageUrl: string;
  caption?: string;
  reactions: { userEmail: string; emoji: string }[];
  viewed: boolean;
}

export interface Review {
  authorName: string;
  authorAvatar: string;
  rating: number; // 1-5
  text: string;
}

export interface UserReview extends Review {
  campId: number;
  authorEmail: string;
}
