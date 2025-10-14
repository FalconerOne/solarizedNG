// /lib/types.ts

export interface Giveaway {
  id?: string;
  title: string;
  description?: string;
  image_url?: string;
  start_date?: string;
  end_date?: string;
  prize?: string;
  is_active?: boolean;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}
