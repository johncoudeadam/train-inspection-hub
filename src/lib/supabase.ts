
import { createClient } from '@supabase/supabase-js';
import { supabase as supabaseClient } from '@/integrations/supabase/client';

// This file is kept for backward compatibility
// We'll use the auto-generated client from integrations/supabase/client.ts
export const supabase = supabaseClient;

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
