
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Clipboard, 
  BarChart, 
  Settings, 
  Home, 
  FileText, 
  Users,
  Building,
  LogOut,
  CheckSquare
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  count?: number;
  hideLabel?: boolean;
}

const SidebarLink = ({ to, icon, label, count, hideLabel = false }: SidebarLinkProps) => {
  const location = useLocation();
  const isActive = location.pathname === to || location.pathname.startsWith(`${to}/`);

  return (
    <Link
      to={to}
      className={cn(
        'flex items-center px-3 py-3 my-1 rounded-md transition-colors relative',
        isActive 
          ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
          : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
      )}
    >
      <div className={cn('flex items-center', !hideLabel && 'w-full')}>
        <span className="flex-shrink-0 mr-3 h-5 w-5">{icon}</span>
        {!hideLabel && <span className="flex-1">{label}</span>}
        {count !== undefined && (
          <Badge variant="secondary" className="ml-auto">
            {count}
          </Badge>
        )}
      </div>
    </Link>
  );
};

interface SidebarProps {
  userRole?: 'Technician' | 'Manager' | 'Admin';
  collapsed?: boolean;
}

const Sidebar = ({ userRole = 'Technician', collapsed = false }: SidebarProps) => {
  return (
    <aside className="bg-sidebar text-sidebar-foreground flex flex-col h-full border-r border-sidebar-border">
      <div className="p-4 flex items-center">
        <h1 className={cn("font-bold text-lg text-sidebar-foreground", collapsed && "sr-only")}>
          Train Inspection
        </h1>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        <SidebarLink to="/" icon={<Home />} label="Dashboard" hideLabel={collapsed} />
        <SidebarLink to="/reports" icon={<Clipboard />} label="Reports" count={3} hideLabel={collapsed} />
        <SidebarLink to="/analytics" icon={<BarChart />} label="Analytics" hideLabel={collapsed} />
        
        {(userRole === 'Manager' || userRole === 'Admin') && (
          <div className="pt-4 mt-4 border-t border-sidebar-border">
            <h2 className={cn("px-3 mb-2 text-xs uppercase text-sidebar-foreground/60", collapsed && "sr-only")}>
              Management
            </h2>
            <SidebarLink to="/reviews" icon={<CheckSquare />} label="Review Reports" count={5} hideLabel={collapsed} />
          </div>
        )}
        
        {userRole === 'Admin' && (
          <div className="pt-4 mt-4 border-t border-sidebar-border">
            <h2 className={cn("px-3 mb-2 text-xs uppercase text-sidebar-foreground/60", collapsed && "sr-only")}>
              Administration
            </h2>
            <SidebarLink to="/users" icon={<Users />} label="Users" hideLabel={collapsed} />
            <SidebarLink to="/projects" icon={<Building />} label="Projects" hideLabel={collapsed} />
            <SidebarLink to="/settings" icon={<Settings />} label="Settings" hideLabel={collapsed} />
          </div>
        )}
      </nav>

      <div className="p-4 mt-auto border-t border-sidebar-border">
        <SidebarLink to="/logout" icon={<LogOut />} label="Logout" hideLabel={collapsed} />
      </div>
    </aside>
  );
};

export default Sidebar;
