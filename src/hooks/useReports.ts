
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, Report, ReportStatus } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

interface ReportFormData {
  trainNumber: string;
  subsystem: string;
  location: string;
  notes?: string;
}

export function useReports() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useState({
    trainNumber: '',
    status: 'all',
    subsystem: '',
    location: '',
  });

  // Fetch all reports
  const { data: reports, isLoading, error } = useQuery({
    queryKey: ['reports', searchParams],
    queryFn: async () => {
      let query = supabase
        .from('reports')
        .select('*');
      
      // Apply filters if they exist
      if (searchParams.trainNumber) {
        query = query.ilike('train_number', `%${searchParams.trainNumber}%`);
      }
      
      if (searchParams.status !== 'all') {
        // Ensure we're passing a valid ReportStatus enum value
        const status = searchParams.status as ReportStatus;
        query = query.eq('status', status);
      }
      
      if (searchParams.subsystem) {
        query = query.eq('subsystem', searchParams.subsystem);
      }
      
      if (searchParams.location) {
        query = query.eq('location', searchParams.location);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Report[];
    },
    enabled: !!user,
  });

  // Create a new report
  const createReport = useMutation({
    mutationFn: async (formData: ReportFormData) => {
      const newReport = {
        train_number: formData.trainNumber,
        subsystem: formData.subsystem,
        location: formData.location,
        notes: formData.notes || '',
        status: 'Draft' as ReportStatus,
        created_by: user?.id,
      };
      
      const { data, error } = await supabase
        .from('reports')
        .insert([newReport])
        .select();
        
      if (error) throw error;
      return data[0] as Report;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast({
        title: "Report created",
        description: "Your report has been saved as a draft",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create report",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Submit a report for review
  const submitReport = useMutation({
    mutationFn: async (reportId: string) => {
      const { data, error } = await supabase
        .from('reports')
        .update({ status: 'Submitted' })
        .eq('id', reportId)
        .select();
        
      if (error) throw error;
      return data[0] as Report;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast({
        title: "Report submitted",
        description: "Your report has been submitted for review",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to submit report",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update report status (approve/reject)
  const updateReportStatus = useMutation({
    mutationFn: async ({ reportId, status }: { reportId: string, status: ReportStatus }) => {
      const { data, error } = await supabase
        .from('reports')
        .update({ 
          status,
          reviewed_by: user?.id 
        })
        .eq('id', reportId)
        .select();
        
      if (error) throw error;
      return data[0] as Report;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      const action = data.status === 'Approved' ? 'approved' : 'rejected';
      toast({
        title: `Report ${action}`,
        description: `The report has been ${action}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update report",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Upload photos for a report
  const uploadPhoto = useMutation({
    mutationFn: async ({ reportId, file }: { reportId: string, file: File }) => {
      // Upload to Storage
      const fileExt = file.name.split('.').pop();
      const filePath = `${reportId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('report-photos')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('report-photos')
        .getPublicUrl(filePath);
      
      // Save photo reference in the database
      const { data, error } = await supabase
        .from('photos')
        .insert([{
          report_id: reportId,
          url: publicUrlData.publicUrl
        }])
        .select();
        
      if (error) throw error;
      
      // Update report to indicate it has photos
      await supabase
        .from('reports')
        .update({ has_photos: true })
        .eq('id', reportId);
        
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to upload photo",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    reports,
    isLoading,
    error,
    createReport,
    submitReport,
    updateReportStatus,
    uploadPhoto,
    searchParams,
    setSearchParams,
  };
}
