import React, { useState } from 'react';
import { Leaf, User, LogOut, MoreVertical, Database, TreePine, Apple, Stethoscope } from 'lucide-react';
import logo from '../assets/logo2.png';

interface HeaderProps {
  user?: any;
  onSignOut?: () => void;
  onMenuItemClick?: (section: 'dataset') => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onSignOut, onMenuItemClick }) => {
  const [showMenu, setShowMenu] = useState(false);

  const handleMenuClick = (section: 'dataset') => {
    if (onMenuItemClick) {
      onMenuItemClick(section);
    }
    setShowMenu(false);
  };

  return (
    <header className="bg-gradient-to-r from-[#06542A] via-[#0B6B38] to-[#128C4E] text-white py-8 px-4 shadow-lg">
      <div className="max-w-7xl mx-auto">
        {/* User Menu - Top Right Only */}
        {user && (
          <div className="flex justify-end mb-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-green-100">
                <User className="w-4 h-4" />
                <span className="text-sm">{user.email}</span>
              </div>

              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2.5 hover:bg-white/20 rounded-lg transition-colors duration-200"
                >
                  <MoreVertical className="w-5 h-5 text-white" />
                </button>

                {showMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
                    <button
                      onClick={() => handleMenuClick('dataset')}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center space-x-2 border-b border-gray-200 text-gray-700"
                    >
                      <Database className="w-4 h-4" />
                      <span className="text-sm font-medium">Dataset Management</span>
                    </button>

                    <button
                      onClick={onSignOut}
                      className="w-full text-left px-4 py-3 hover:bg-red-50 flex items-center space-x-2 text-red-600 font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm">Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Main Title */}
        <div className="flex flex-col items-center justify-center mb-6">
          {/* Logo - Commented out for now */}
          {/* <div className="flex justify-center mb-6">
            <img 
              src={logo} 
              alt="AppleKul Logo" 
              className="w-80 h-60 object-contain"
            />
          </div> */}
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white drop-shadow-2xl" style={{
              textShadow: '0 2px 4px rgba(0,0,0,0.1), 0 4px 8px rgba(16, 185, 129, 0.2)'
            }}>
             AppleKul™ Skyinsights
            </h1>
            <div className="flex items-center justify-center space-x-2 mt-1">
              <div className="h-px w-8 bg-green-200"></div>
              <span className="text-green-100 text-sm font-medium tracking-wider"></span>
              <div className="h-px w-8 bg-green-200"></div>
            </div>
          </div>
        </div>
        
        <p className="text-center text-green-50 text-xl md:text-2xl max-w-4xl mx-auto leading-relaxed mb-0 font-light">
           Smart Farming, Data Driven Decision 
        </p>
        
      </div>
    </header>
  );
};
