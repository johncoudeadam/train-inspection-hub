
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { 
  getPendingReports, 
  getPendingPhotos, 
  removePendingReport, 
  removePendingPhoto 
} from '@/lib/offlineDb';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface OfflineContextType {
  isOnline: boolean;
  hasPendingChanges: boolean;
  pendingReportsCount: number;
  pendingPhotosCount: number;
  syncChanges: () => Promise<void>;
  syncInProgress: boolean;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export const OfflineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isOnline } = useNetworkStatus();
  const [hasPendingChanges, setHasPendingChanges] = useState(false);
  const [pendingReportsCount, setPendingReportsCount] = useState(0);
  const [pendingPhotosCount, setPendingPhotosCount] = useState(0);
  const [syncInProgress, setSyncInProgress] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check for pending changes
  const checkPendingChanges = async () => {
    const pendingReports = await getPendingReports();
    setPendingReportsCount(pendingReports.length);
    
    let totalPendingPhotos = 0;
    for (const report of pendingReports) {
      const photos = await getPendingPhotos(report.id);
      totalPendingPhotos += photos.length;
    }
    setPendingPhotosCount(totalPendingPhotos);
    
    setHasPendingChanges(pendingReports.length > 0 || totalPendingPhotos > 0);
  };

  // Check for pending changes on mount and when coming back online
  useEffect(() => {
    checkPendingChanges();
    
    if (isOnline && hasPendingChanges) {
      toast({
        title: "You're back online",
        description: `You have ${pendingReportsCount} pending reports to sync.`,
        action: () => syncChanges(),
      });
    }
  }, [isOnline]);

  // Sync pending changes to the server
  const syncChanges = async () => {
    if (!isOnline || syncInProgress) return;

    setSyncInProgress(true);
    
    try {
      const pendingReports = await getPendingReports();
      
      // Process reports in chronological order
      const sortedReports = pendingReports.sort((a, b) => a.timestamp - b.timestamp);
      
      for (const pendingReport of sortedReports) {
        const { id, data, action } = pendingReport;
        
        try {
          if (action === 'create') {
            await supabase.from('reports').insert([data]);
          } else if (action === 'update') {
            await supabase
              .from('reports')
              .update(data)
              .eq('id', id);
          }
          
          // Process pending photos for this report
          const pendingPhotos = await getPendingPhotos(id);
          
          for (const pendingPhoto of pendingPhotos) {
            const { file } = pendingPhoto;
            
            // Upload to Storage
            const fileExt = file.name.split('.').pop();
            const filePath = `${id}/${Date.now()}.${fileExt}`;
            
            const { error: uploadError } = await supabase.storage
              .from('report-photos')
              .upload(filePath, file);
              
            if (!uploadError) {
              // Get public URL
              const { data: publicUrlData } = supabase.storage
                .from('report-photos')
                .getPublicUrl(filePath);
              
              // Save photo reference in the database
              await supabase
                .from('photos')
                .insert([{
                  report_id: id,
                  url: publicUrlData.publicUrl
                }]);
                
              // Update report to indicate it has photos
              await supabase
                .from('reports')
                .update({ has_photos: true })
                .eq('id', id);
              
              await removePendingPhoto(pendingPhoto.id);
            }
          }
          
          // Remove the report from pending after all photos are processed
          await removePendingReport(id);
        } catch (error) {
          console.error('Error syncing report:', error);
        }
      }
      
      // Refresh the cache
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      
      await checkPendingChanges();
      
      toast({
        title: "Sync complete",
        description: "All pending changes have been synchronized.",
      });
    } catch (error) {
      console.error('Error during sync:', error);
      toast({
        title: "Sync failed",
        description: "There was an error synchronizing your changes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSyncInProgress(false);
    }
  };
  
  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && hasPendingChanges && !syncInProgress) {
      syncChanges();
    }
  }, [isOnline, hasPendingChanges]);

  return (
    <OfflineContext.Provider
      value={{
        isOnline,
        hasPendingChanges,
        pendingReportsCount,
        pendingPhotosCount,
        syncChanges,
        syncInProgress,
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
};

export const useOffline = () => {
  const context = useContext(OfflineContext);
  if (context === undefined) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
};
