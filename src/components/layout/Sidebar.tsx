import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileBox,
  FileText,
  Receipt,
  BarChart3,
  Zap,
  Settings,
  Database,
  Users,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: FileBox, label: 'Jobs', path: '/jobs' },
  { icon: FileText, label: 'Documents', path: '/documents' },
  { icon: Receipt, label: 'Billing', path: '/billing' },
  { icon: BarChart3, label: 'Reports', path: '/reports' },
];

const mastersItems = [
  { icon: Users, label: 'Customers', path: '/masters/customers' },
];

export function Sidebar() {
  const location = useLocation();
  const [mastersOpen, setMastersOpen] = useState(
    location.pathname.startsWith('/masters')
  );

  const isMastersActive = location.pathname.startsWith('/masters');

  return (
    <aside className="w-64 bg-sidebar min-h-screen flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-sidebar-foreground">BoostEntry</h1>
            <p className="text-xs text-sidebar-muted">Document Automation</p>
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

          {/* Masters Dropdown */}
          <li>
            <button
              onClick={() => setMastersOpen(!mastersOpen)}
              className={cn(
                'nav-item w-full justify-between',
                isMastersActive && 'nav-item-active'
              )}
            >
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5" />
                <span>Masters</span>
              </div>
              {mastersOpen ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>

            {/* Masters Sub-items */}
            {mastersOpen && (
              <ul className="mt-1 ml-4 pl-4 border-l border-sidebar-border space-y-1">
                {mastersItems.map((item) => {
                  const isSubActive = location.pathname === item.path;
                  return (
                    <li key={item.path}>
                      <NavLink
                        to={item.path}
                        className={cn(
                          'nav-item text-sm py-2',
                          isSubActive && 'nav-item-active'
                        )}
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            )}
          </li>
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
