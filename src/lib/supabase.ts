
import { createClient } from '@supabase/supabase-js';

// Set default values in case environment variables are not available
// Using dummy values that indicate configuration is needed
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://missing-url-configure-environment-variables.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'missing-key-configure-environment-variables';

// Still log the error for debugging purposes, but use default values to prevent runtime errors
if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.error('Missing Supabase credentials. Please check your environment variables.');
  console.info('The application will use placeholder values but functionality will be limited.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types based on our database schema
export type ReportStatus = 'Draft' | 'Submitted' | 'Approved' | 'Rejected';

export interface Report {
  id: string;
  train_number: string;
  subsystem: string;
  location: string;
  notes?: string;
  status: ReportStatus;
  created_at: string;
  updated_at: string;
  created_by: string;
  reviewed_by?: string;
  has_photos?: boolean;
}

export interface Photo {
  id: string;
  report_id: string;
  url: string;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  role: 'Technician' | 'Manager' | 'Admin';
  full_name?: string;
  created_at: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  created_by: string;
}
