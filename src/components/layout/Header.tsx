
import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Bell, 
  Menu,
  PlusCircle,
  User
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  onMenuToggle: () => void;
  userRole?: 'Technician' | 'Manager' | 'Admin';
}

const Header = ({ onMenuToggle, userRole = 'Technician' }: HeaderProps) => {
  const [notifications, setNotifications] = React.useState(3);
  
  return (
    <header className="bg-background border-b border-border h-16 flex items-center px-4 sticky top-0 z-10">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onMenuToggle}
        className="mr-4"
      >
        <Menu className="h-5 w-5" />
      </Button>
      
      <div className="flex-1">
        <div className="relative w-full max-w-md hidden md:block">
          <h1 className="text-lg font-semibold">
            {userRole === 'Technician' && 'Technician Portal'}
            {userRole === 'Manager' && 'Manager Portal'}
            {userRole === 'Admin' && 'Admin Portal'}
          </h1>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        {userRole === 'Technician' && (
          <Button asChild variant="default" size="sm" className="hidden md:flex">
            <Link to="/reports/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Report
            </Link>
          </Button>
        )}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {notifications > 0 && (
                <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0">
                  {notifications}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications > 0 ? (
              <>
                <DropdownMenuItem className="py-3 cursor-pointer">
                  <div>
                    <p className="font-medium">Report #TR-2023-05 submitted</p>
                    <p className="text-sm text-muted-foreground">A new report has been submitted for review</p>
                    <p className="text-xs text-muted-foreground mt-1">5 minutes ago</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="py-3 cursor-pointer">
                  <div>
                    <p className="font-medium">Report #TR-2023-04 approved</p>
                    <p className="text-sm text-muted-foreground">Your report has been approved by Manager</p>
                    <p className="text-xs text-muted-foreground mt-1">1 hour ago</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="py-3 cursor-pointer">
                  <div>
                    <p className="font-medium">System maintenance</p>
                    <p className="text-sm text-muted-foreground">Scheduled maintenance this weekend</p>
                    <p className="text-xs text-muted-foreground mt-1">1 day ago</p>
                  </div>
                </DropdownMenuItem>
              </>
            ) : (
              <div className="py-4 text-center text-muted-foreground">
                No new notifications
              </div>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center" asChild>
              <Link to="/notifications">View all notifications</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar>
                <AvatarImage src="" alt="User" />
                <AvatarFallback>
                  <User className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <div>
                <p>John Doe</p>
                <p className="text-xs text-muted-foreground">
                  {userRole}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
