import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileBox, 
  FileText, 
  Receipt, 
  BarChart3,
  Ship,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: FileBox, label: 'Jobs', path: '/jobs' },
  { icon: FileText, label: 'Documents', path: '/documents' },
  { icon: Receipt, label: 'Billing', path: '/billing' },
  { icon: BarChart3, label: 'Reports', path: '/reports' },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 bg-sidebar min-h-screen flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-sidebar-primary rounded-lg flex items-center justify-center">
            <Ship className="w-6 h-6 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-sidebar-foreground">ClearPort</h1>
            <p className="text-xs text-sidebar-muted">Operations Portal</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path !== '/' && location.pathname.startsWith(item.path));
            
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={cn(
                    'nav-item',
                    isActive && 'nav-item-active'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <NavLink
          to="/settings"
          className={cn(
            'nav-item',
            location.pathname === '/settings' && 'nav-item-active'
          )}
        >
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </NavLink>
      </div>
    </aside>
  );
}
