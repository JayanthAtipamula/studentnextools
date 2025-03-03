import React, { useState } from 'react';
import { Menu, Home, FileText, Linkedin, Github, BookOpen, X, User, Video, ChevronDown, ChevronUp, Bot, Lightbulb, Globe } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/AuthContext';
import ProfileMenu from '../ui/ProfileMenu';

interface SidebarProps {
  onClose?: () => void;
}

const Sidebar = ({ onClose }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, setIsLoginModalOpen, setPendingPath, pendingPath } = useAuth();
  const [aiToolsOpen, setAiToolsOpen] = useState(false);
  
  const navItems = [
    { name: 'Dashboard', icon: Home, path: '/' },
    { name: 'Projects', icon: Video, path: '/projects' },
  ];

  const aiTools = [
    { name: 'Project DOC Writer', icon: FileText, path: '/doc-maker' },
    { name: 'LinkedIn Analyzer', icon: Linkedin, path: '/linkedin-analyzer' },
    { name: 'LinkedIn Summary', icon: Linkedin, path: '/linkedin-summary' },
    { name: 'GitHub Profile', icon: Github, path: '/github-profile' },
    { name: 'Notes Writer', icon: BookOpen, path: '/notes-writer' },
    { name: 'Website GPT', icon: Globe, path: '/website-gpt' },
  ];

  const handleNavClick = (path: string) => {
    if (!user && path !== '/') {
      setIsLoginModalOpen(true);
      setPendingPath(path);
    } else {
      navigate(path);
      onClose?.();
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const toggleAiTools = () => {
    setAiToolsOpen(!aiToolsOpen);
  };

  return (
    <>
      <div className="h-full flex flex-col bg-white border-l border-gray-200">
        <div className="flex items-center justify-between gap-2 p-8">
          <div className="flex items-center justify-center flex-1">
            <img src="/assets/STUDENTNESTLOGO.png" alt="Student Nest" className="h-16 w-auto" />
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden absolute top-4 left-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close menu"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto">
          <ul className="px-4 space-y-1">
            {navItems.map((item) => (
              <li key={item.path}>
                <button
                  onClick={() => handleNavClick(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    location.pathname === item.path
                      ? 'bg-blue-50 text-blue-600'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </button>
              </li>
            ))}
            
            {/* AI Tools Dropdown */}
            <li>
              <button
                onClick={toggleAiTools}
                className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-colors ${
                  aiTools.some(tool => location.pathname === tool.path)
                    ? 'bg-blue-50 text-blue-600'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Bot className="w-5 h-5" />
                  <span>AI Tools</span>
                </div>
                {aiToolsOpen ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
              {aiToolsOpen && (
                <ul className="mt-1 ml-4 space-y-1">
                  {aiTools.map((tool) => (
                    <li key={tool.path}>
                      <button
                        onClick={() => handleNavClick(tool.path)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                          location.pathname === tool.path
                            ? 'bg-blue-50 text-blue-600'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <tool.icon className="w-5 h-5" />
                        <span>{tool.name}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>

            {/* Suggest AI Tool - External Link */}
            <li>
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLSfAcyk_zLEvKXsFor5X_zRJtsbXNpB46M4A_lpba_4p5fMmHA/viewform"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-gray-50"
              >
                <Lightbulb className="w-5 h-5" />
                <span>Suggest AI Tool</span>
              </a>
            </li>
            
            {user && (
              <li>
                <button
                  onClick={() => handleNavClick('/profile')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    location.pathname === '/profile'
                      ? 'bg-blue-50 text-blue-600'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span>Profile</span>
                </button>
              </li>
            )}
          </ul>
        </nav>

        {user && (
          <div className="p-4 border-t">
            <div className="px-4 py-2">
              <div className="text-sm font-medium">{user.email}</div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Sidebar;