import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Clock, Calendar, FileText, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface MobileNavbarProps {
  onMenuClick: () => void;
}

const MobileNavbar = ({ onMenuClick }: MobileNavbarProps) => {
  const location = useLocation();
  const { user } = useAuth();

  if (!user) return null;

  const dashboardPath =
    user.role === 'SUPER_ADMIN'
      ? '/dashboard/super-admin'
      : user.role === 'COMPANY_ADMIN'
        ? '/dashboard/admin'
        : user.role === 'HR_MANAGER' || user.role === 'HR_ASSISTANT'
          ? '/dashboard/hr'
          : '/dashboard/employee';

  const navItems = [
    { icon: LayoutDashboard, label: 'Accueil', path: dashboardPath },
    { icon: Clock, label: 'Pointage', path: '/attendance' },
    { icon: Calendar, label: 'Congés', path: '/leaves' },
    { icon: FileText, label: 'Doc', path: '/documents' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-50 pb-safe">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path.startsWith('/dashboard') && location.pathname.startsWith('/dashboard'));
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${
                isActive ? 'text-orange-500' : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'fill-orange-500/10' : ''}`} />
              <span className="text-[10px] font-bold uppercase tracking-tight">{item.label}</span>
            </Link>
          );
        })}
        <button
          onClick={onMenuClick}
          className="flex flex-col items-center justify-center flex-1 h-full gap-1 text-gray-500 dark:text-gray-400"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-tight">Plus</span>
        </button>
      </div>
    </div>
  );
};

export default MobileNavbar;
