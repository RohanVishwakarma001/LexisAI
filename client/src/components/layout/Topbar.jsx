import React, { useEffect, useRef, useState } from 'react';
import { 
  Search, ChevronRight, Bell, Menu, Settings, LogOut, 
  FileText, Scale, Calendar, AlertCircle, Check
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import io from 'socket.io-client';

export default function Topbar({ onMenuClick }) {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Dropdown states
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  
  // Refs
  const dropdownRef = useRef(null);
  const notificationsRef = useRef(null);
  const searchInputRef = useRef(null);

  // Compute breadcrumb dynamically based on the current active pathname
  const getBreadcrumbName = () => {
    const path = location.pathname;
    if (path.endsWith('/cases')) return 'Case Files';
    if (path.endsWith('/research')) return 'Research';
    if (path.endsWith('/analytics')) return 'Analytics';
    if (path.endsWith('/documents')) return 'Documents';
    if (path.endsWith('/settings')) return 'Settings';
    if (path.endsWith('/admin')) return 'Admin Panel';
    return 'Dashboard';
  };

  // Fetch initial notifications
  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications?limit=20');
      if (response.data?.status === 'success') {
        setNotifications(response.data.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  // Keyboard shortcut listener for Cmd + K or Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Listeners for click-outside to auto-close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Socket.io for Realtime Notifications
  useEffect(() => {
    if (!user) return;

    fetchNotifications();

    const socketUrl = 'http://localhost:5000';
    const socket = io(socketUrl, {
      withCredentials: true,
    });

    socket.emit('join_user', user.id);

    socket.on('notification:new', (newNotification) => {
      setNotifications((prev) => [newNotification, ...prev]);
      toast.success(newNotification.title || 'New notification', {
        icon: '🔔',
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const handleMarkAsRead = async (id) => {
    try {
      const res = await api.patch(`/notifications/${id}/read`);
      if (res.data?.status === 'success') {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
      }
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await api.patch('/notifications/read-all');
      if (res.data?.status === 'success') {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        toast.success('All notifications marked as read');
      }
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'DOCUMENT':
        return <FileText size={14} className="text-primary" />;
      case 'HEARING':
        return <Calendar size={14} className="text-secondary" />;
      case 'CASE':
        return <Scale size={14} className="text-tertiary" />;
      default:
        return <AlertCircle size={14} className="text-on-surface-variant" />;
    }
  };

  const userInitials = `${(user?.firstName || 'R').charAt(0)}${(user?.lastName || 'N').charAt(0)}`.toUpperCase();
  const unreadNotifications = notifications.filter((n) => !n.isRead);
  const unreadCount = unreadNotifications.length;

  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-outline-variant/45 px-lg py-md flex justify-between items-center transition-all duration-300">
      
      {/* Mobile Menu & Dynamic Breadcrumbs */}
      <div className="flex items-center gap-sm md:gap-md">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-full transition-colors cursor-pointer mr-xs"
          aria-label="Open Navigation Drawer"
        >
          <Menu size={22} />
        </button>

        <nav className="flex items-center text-on-surface-variant font-label-md gap-xs md:gap-sm select-none">
          <span className="text-[12px] md:text-[13px] hover:text-on-surface transition-colors cursor-pointer">
            {user?.firstName ? `${user.firstName} Legal` : 'Proton Legal'}
          </span>
          <ChevronRight size={14} className="text-on-surface-variant/50" />
          <span className="text-on-surface font-semibold text-[12px] md:text-[13px]">{getBreadcrumbName()}</span>
        </nav>
      </div>

      {/* Global Actions */}
      <div className="flex items-center gap-md md:gap-lg">
        {/* Search Bar - Collapsed on smaller mobile, expanded on md */}
        <div className="relative hidden md:block w-[280px] lg:w-[400px]">
          <input 
            ref={searchInputRef}
            type="text"
            className="w-full h-10 pl-11 pr-16 bg-surface-container-low border border-outline-variant/50 rounded-lg text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-premium text-[13px]"
            placeholder="Search cases, docs, or ask AI (Cmd + K)" 
          />
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/60">
            <Search size={18} />
          </div>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1 pointer-events-none select-none opacity-85">
            <kbd className="px-1.5 py-0.5 rounded bg-surface-container border border-outline-variant text-[10px] text-on-surface-variant font-mono">⌘</kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-surface-container border border-outline-variant text-[10px] text-on-surface-variant font-mono">K</kbd>
          </div>
        </div>

        {/* Notifications & Avatar */}
        <div className="flex items-center gap-sm md:gap-md">
          
          {/* Notifications Bell Dropdown */}
          <div className="relative" ref={notificationsRef}>
            <button 
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-highest/50 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
              aria-label="View notifications log"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-primary text-on-primary text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold animate-pulse scale-90 border border-background">
                  {unreadCount}
                </span>
              )}
            </button>
            
            {notificationsOpen && (
              <div className="absolute right-0 mt-sm w-[320px] sm:w-[360px] rounded-lg border border-outline-variant bg-surface-container-high/95 backdrop-blur-md shadow-2xl p-sm z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between px-md py-sm border-b border-outline-variant/30">
                  <h3 className="font-label-lg text-on-surface font-bold text-[14px]">System Notifications</h3>
                  {unreadCount > 0 && (
                    <button 
                      onClick={handleMarkAllRead}
                      className="text-[11px] text-primary hover:underline font-semibold"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                
                <div className="max-h-[300px] overflow-y-auto divide-y divide-outline-variant/20 scrollbar-thin py-xs">
                  {notifications.map((n) => (
                    <div 
                      key={n.id} 
                      onClick={() => !n.isRead && handleMarkAsRead(n.id)}
                      className={`flex gap-sm p-md transition-colors cursor-pointer hover:bg-surface-container-highest/40 ${
                        !n.isRead ? 'bg-primary/5' : ''
                      }`}
                    >
                      <div className="w-7 h-7 rounded-full bg-surface-container border border-outline-variant/55 flex items-center justify-center shrink-0 mt-0.5">
                        {getNotificationIcon(n.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <p className={`text-[12px] truncate ${!n.isRead ? 'font-bold text-on-surface' : 'text-on-surface-variant'}`}>
                            {n.title}
                          </p>
                          {!n.isRead && (
                            <span className="w-2 h-2 rounded-full bg-primary shrink-0 ml-sm mt-1.5" />
                          )}
                        </div>
                        <p className="text-[11px] text-on-surface-variant leading-normal mt-0.5 break-words">
                          {n.body}
                        </p>
                        <p className="text-[9px] text-on-surface-variant font-mono mt-1 opacity-70">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {notifications.length === 0 && (
                    <div className="p-xl text-center text-on-surface-variant font-body-md text-[13px] select-none">
                      No notifications to display.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Dynamically Styled Avatar Bubble */}
          <div className="relative" ref={dropdownRef}>
            <div 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-10 h-10 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center select-none cursor-pointer hover:border-primary/80 transition-colors overflow-hidden"
            >
              {user?.avatar ? (
                <img src={user.avatar} className="w-full h-full object-cover" alt="User Profile Avatar" />
              ) : (
                <span className="font-label-md text-primary font-bold text-[14px]">
                  {userInitials}
                </span>
              )}
            </div>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-sm w-[220px] rounded-lg border border-outline-variant bg-surface-container-high/95 backdrop-blur-md shadow-2xl p-sm z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                {/* User Info */}
                <div className="px-md py-sm">
                  <p className="font-label-md text-on-surface font-semibold truncate text-[13px]">
                    {user?.firstName || 'Rohan'} {user?.lastName || 'Kumar'}
                  </p>
                  <p className="text-[11px] text-on-surface-variant font-mono truncate">
                    {user?.email}
                  </p>
                  <span className="inline-block mt-xs px-xs py-0.5 bg-primary/15 text-primary text-[9px] uppercase tracking-wider rounded font-bold">
                    {user?.role || 'USER'}
                  </span>
                </div>
                
                <div className="my-sm border-t border-outline-variant/30" />

                {/* Actions */}
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    navigate('/dashboard/settings');
                  }}
                  className="w-full flex items-center gap-sm px-md py-sm text-xs text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-md transition-colors cursor-pointer text-left"
                >
                  <Settings size={14} />
                  Account Settings
                </button>

                <button
                  onClick={async () => {
                    setDropdownOpen(false);
                    const toastId = toast.loading('Logging out...');
                    try {
                      await logout();
                      toast.success('Logged out successfully', { id: toastId });
                      navigate('/sign-in');
                    } catch (err) {
                      toast.error('Logout failed', { id: toastId });
                    }
                  }}
                  className="w-full flex items-center gap-sm px-md py-sm text-xs text-error hover:bg-error/10 rounded-md transition-colors cursor-pointer text-left mt-xs"
                >
                  <LogOut size={14} />
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
