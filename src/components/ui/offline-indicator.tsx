
import React from 'react';
import { Wifi, WifiOff, CloudOff } from 'lucide-react';
import { useOffline } from '@/context/OfflineContext';
import { Button } from './button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';
import { Badge } from './badge';

export function OfflineIndicator() {
  const { 
    isOnline, 
    hasPendingChanges, 
    pendingReportsCount, 
    syncChanges, 
    syncInProgress 
  } = useOffline();

  if (isOnline && !hasPendingChanges) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center">
              <Wifi className="h-4 w-4 text-green-500" />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>You are online</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (!isOnline) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center">
              <WifiOff className="h-4 w-4 text-yellow-500 mr-1" />
              <span className="text-xs text-yellow-500">Offline</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>You are currently offline. Changes will sync when you reconnect.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 px-2 text-xs"
            disabled={syncInProgress}
            onClick={() => syncChanges()}
          >
            <CloudOff className="h-4 w-4 text-yellow-500 mr-1" />
            <span>Sync</span>
            <Badge variant="secondary" className="ml-1">
              {pendingReportsCount}
            </Badge>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>You have {pendingReportsCount} reports waiting to be synced. Click to sync now.</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
