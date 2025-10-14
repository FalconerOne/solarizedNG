// /types/supabase.ts
export interface UserProfile {
  id: string; // UUID
  email: string;
  full_name?: string;
  username?: string;
  role: "admin" | "supervisor" | "user";
  created_at?: string;
}

export interface Giveaway {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  prize?: string;
  status: "active" | "ended" | "draft";
  start_date?: string;
  end_date?: string;
  created_by: string; // user_id (UUID)
  created_at?: string;
}

export interface Entry {
  id: string;
  user_id: string;
  giveaway_id: string;
  referral_code?: string;
  referred_by?: string;
  created_at?: string;
}

export interface Winner {
  id: string;
  giveaway_id: string;
  user_id: string;
  position: number;
  prize?: string;
  announced_at?: string;
}

export interface Notification {
  id: string;
  message: string;
  is_read?: boolean;
  created_at?: string;
  user_id?: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  role: string;
  action_type: string;
  description: string;
  source?: string;
  created_at?: string;
}

// Optional — bundle all for convenience
export interface Database {
  profiles: UserProfile;
  giveaways: Giveaway;
  entries: Entry;
  winners: Winner;
  notifications: Notification;
  activity_log: ActivityLog;
}

