
import { useState, useEffect } from 'react';
import { registerSW } from 'virtual:pwa-register';
import { useToast } from './use-toast';

export function usePWA() {
  const [offlineReady, setOfflineReady] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const updateSW = registerSW({
      onNeedRefresh() {
        setUpdateAvailable(true);
        toast({
          title: "Update available",
          description: "A new version is available. Click here to update.",
          action: () => {
            updateSW();
          },
        });
      },
      onOfflineReady() {
        setOfflineReady(true);
        toast({
          title: "App ready for offline use",
          description: "You can now use the app without an internet connection",
        });
      },
    });
  }, []);

  return { offlineReady, updateAvailable };
}
