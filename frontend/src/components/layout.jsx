import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear token and redirect to login
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Sidebar navigation items based on your design
  const navItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/tiers', label: 'Tiers' },
    { path: '/debts', label: 'Debts' },
    { path: '/voiture', label: 'Voiture' },
    { path: '/voiture_maintenance', label: 'Maintenance' },
    { path: '/charges', label: 'Charges' },
    { path: '/notifications', label: 'Notifications' },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 📱 Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col">
        <div className="p-6">
          <div className="bg-sakan text-white px-4 py-2 rounded-lg inline-block mb-2">
            <span className="font-bold text-2xl tracking-wide">SAKAN</span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 rounded-xl transition-colors ${
                  isActive
                    ? 'bg-sky-50 text-sakan font-bold'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 font-medium'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button at bottom */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-red-500 font-medium hover:bg-red-50 rounded-xl transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* 💻 Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* Top Header */}
        <header className="bg-white border-b border-gray-100 px-8 py-4 flex justify-between items-center shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Welcome back, User</h2>
          </div>
          
          <div className="flex items-center gap-5">
            {/* Notification Bell */}
            <Link to="/notifications" className="relative p-2 text-gray-400 hover:text-sakan transition-colors">
              <div className="w-2.5 h-2.5 bg-red-500 rounded-full absolute top-1 right-1 border-2 border-white"></div>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </Link>
            
            {/* User Avatar */}
            <div className="w-10 h-10 bg-sakan rounded-full flex items-center justify-center text-white font-bold shadow-md">
              U
            </div>
          </div>
        </header>

        {/* Dynamic Page Content injected here */}
        <div className="flex-1 overflow-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}