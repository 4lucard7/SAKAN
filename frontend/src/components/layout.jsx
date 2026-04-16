import { useAuth } from '../context/AuthContext.jsx';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import NotificationDropdown from './NotificationDropdown';
import { Sun, Moon, LogOut, LayoutDashboard, Users, Wallet, Car, Wrench, FileText, Bell } from 'lucide-react';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    // Update document direction and lang attribute when language changes
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);



  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Sidebar navigation items based on your design
  const navItems = [
    { path: '/dashboard', label: t('common.dashboard'), icon: LayoutDashboard },
    { path: '/tiers', label: t('common.tiers'), icon: Users },
    { path: '/debts', label: t('common.debts'), icon: Wallet },
    { path: '/voiture', label: t('common.voiture'), icon: Car },
    { path: '/voiture_maintenance', label: t('common.maintenance'), icon: Wrench },
    { path: '/charges', label: t('common.charges'), icon: FileText },
    { path: '/notifications', label: t('common.notifications'), icon: Bell },
  ];

  const languages = [
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ar', name: 'العربية', flag: '🇲🇦' },
  ];

  return (
    <div className={`flex h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300 ${i18n.language === 'ar' ? 'font-arabic' : ''}`} dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      {/* 📱 Sidebar */}
      <aside className={`w-64 bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 flex flex-col transition-colors duration-300 ${i18n.language === 'ar' ? 'border-l' : 'border-r'}`}>
        {/* Logo */}

          <div className="flex items-center justify-center gap-2 mb-6 mt-5">
          <div className="w-9 h-9 rounded-full bg-[#2196F3] flex items-center justify-center shadow">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M10 2L18 10L10 18L2 10L10 2Z"
                fill="white"
                stroke="white"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <path d="M10 6L14 10L10 14L6 10L10 6Z" fill="#2196F3" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="text-[#2196F3] font-extrabold text-xl tracking-widest uppercase">Sakan</span>
        </div>
        

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-[#2196F3]  text-dark font-bold shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white font-medium'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button at bottom */}
        <div className="p-4 border-t border-gray-100 dark:border-slate-800">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-red-500 font-medium hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors"
          >
            <LogOut size={18} className="mr-2" />
            {t('common.logout')}
          </button>
        </div>
      </aside>

      {/* 💻 Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* Top Header */}
        <header className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 px-8 py-4 flex justify-between items-center shadow-sm transition-colors duration-300">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              {t('common.welcome')} {user?.name || 'User'}
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-gray-400 hover:text-sakan transition-colors shadow-inner"
              title={darkMode ? 'Light Mode' : 'Dark Mode'}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Language Selector */}
            <div className="flex items-center gap-1 bg-gray-50 dark:bg-slate-800 p-1 rounded-lg shadow-inner">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    i18n.language === lang.code
                      ? 'bg-white dark:bg-slate-700 text-sakan shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'
                  }`}
                  title={lang.name}
                >
                  <span className={i18n.language === 'ar' ? 'font-arabic' : ''}>
                    {lang.code.toUpperCase()}
                  </span>
                </button>
              ))}
            </div>

            {/* Notification Dropdown */}
            <NotificationDropdown />
            
            <div className="h-8 w-px bg-gray-200 dark:bg-slate-800 mx-1"></div>

            {/* User Avatar */}
            <div className="w-10 h-10 bg-sakan rounded-full flex items-center justify-center text-white font-bold shadow-md ring-2 ring-white dark:ring-slate-800">
              {user?.name?.charAt(0) || 'U'}
            </div>
          </div>
        </header>

        {/* Dynamic Page Content injected here */}
        <div className="flex-1 overflow-auto p-8 dark:text-gray-200">
          {children}
        </div>
      </main>
    </div>
  );
}