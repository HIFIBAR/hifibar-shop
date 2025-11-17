import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Product = {
  id: string;
  ide: string;
  code: string;
  type_carte: string;
  marque_tv: string;
  modele_tv: string;
  num1: string;
  num2: string;
  compat_tv_models: string[] | null;
  taille_tv: string | null;
  etat_piece: string;
  etat_enregistrement: string;
  source: string | null;
  prix: number;
  poids_gr: number;
  stock_qty: number;
  est_visible: boolean;
  commentaire: string | null;
  ebay_id: string | null;
  created_at: string;
  updated_at: string;
};

export type ProductImage = {
  id: string;
  product_id: string;
  url: string;
  alt: string | null;
  is_main: boolean;
  created_at: string;
};

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  created_at: string;
  updated_at: string;
};
