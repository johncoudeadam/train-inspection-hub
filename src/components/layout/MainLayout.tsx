
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from '@/components/ui/select';

const MainLayout = () => {
  const isMobile = useIsMobile();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(isMobile);
  const [userRole, setUserRole] = useState<'Technician' | 'Manager' | 'Admin'>('Technician');

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <div 
        className={`${sidebarCollapsed ? 'w-16' : 'w-64'} flex-shrink-0 transition-all duration-300 ease-in-out`}
      >
        <Sidebar userRole={userRole} collapsed={sidebarCollapsed} />
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuToggle={toggleSidebar} userRole={userRole} />
        
        {/* Dev controls - will be removed in production */}
        <div className="bg-black/5 p-2 flex items-center space-x-2 border-b">
          <span className="text-xs text-muted-foreground">Demo Controls:</span>
          <Select 
            defaultValue={userRole} 
            onValueChange={(value) => setUserRole(value as 'Technician' | 'Manager' | 'Admin')}
          >
            <SelectTrigger className="h-8 w-40">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Technician">Technician</SelectItem>
              <SelectItem value="Manager">Manager</SelectItem>
              <SelectItem value="Admin">Admin</SelectItem>
            </SelectContent>
          </Select>
          <div className="ml-auto">
            <Button variant="secondary" size="sm">
              <span className="text-xs">
                Demo Mode
              </span>
            </Button>
          </div>
        </div>
        
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
