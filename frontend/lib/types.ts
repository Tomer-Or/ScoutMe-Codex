export type UserRole = "player" | "scout";

export interface User {
  id: number;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Comment {
  id: number;
  author_user_id: number;
  author_email: string;
  content: string;
  created_at: string;
}

export interface ClubHistory {
  id: number;
  club_name: string;
  start_date: string;
  end_date?: string | null;
  position?: string | null;
  notes?: string | null;
}

export interface PlayerStats {
  id: number;
  matches_played: number;
  goals: number;
  assists: number;
  minutes_played: number;
  clean_sheets: number;
  custom_notes?: string | null;
}

export interface Achievement {
  id: number;
  title: string;
  year: number;
  description?: string | null;
}

export interface HighlightVideo {
  id: number;
  title: string;
  description?: string | null;
  video_url: string;
  thumbnail_url?: string | null;
  created_at: string;
}

export interface FeedItem {
  id: string;
  item_type: "post" | "highlight";
  title: string;
  content?: string | null;
  post_type?: string | null;
  created_at: string;
  video_url?: string | null;
  thumbnail_url?: string | null;
  author_user_id: number;
  author_name: string;
  author_role: UserRole;
  author_avatar_url?: string | null;
  author_position?: string | null;
  author_location?: string | null;
  player_profile_id?: number | null;
}

export interface PostRecord {
  id: number;
  title: string;
  content: string;
  post_type: string;
  created_at: string;
  highlight_video_id?: number | null;
  video_url?: string | null;
  thumbnail_url?: string | null;
  author_user_id: number;
  author_name: string;
  author_role: UserRole;
  author_avatar_url?: string | null;
  author_position?: string | null;
  author_location?: string | null;
  player_profile_id?: number | null;
}

export interface PlayerCard {
  id: number;
  user_id: number;
  full_name: string;
  phone?: string | null;
  city?: string | null;
  country?: string | null;
  profile_image_url?: string | null;
  primary_position: string;
  secondary_position?: string | null;
  age: number;
  height?: number | null;
  weight?: number | null;
  dominant_foot?: string | null;
  bio?: string | null;
  created_at: string;
  updated_at: string;
  endorsement_count: number;
  comments_count: number;
  matches_played: number;
  goals: number;
  assists: number;
}

export interface PlayerProfile extends PlayerCard {
  clubs: ClubHistory[];
  stats?: PlayerStats | null;
  achievements: Achievement[];
  highlights: HighlightVideo[];
  comments: Comment[];
}
