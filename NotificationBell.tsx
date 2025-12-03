import React, { useState, useEffect, useRef } from 'react';
import { Notification } from '../types';
import { useAppContext } from '../App';

interface NotificationBellProps {
    notifications: Notification[];
    onOpen: () => void;
    onClear: () => void;
}

const timeSince = (dateString: string): string => {
    const date = new Date(dateString);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return Math.floor(seconds) + "s ago";
};


const NotificationBell: React.FC<NotificationBellProps> = ({ notifications, onOpen, onClear }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { t } = useAppContext();
    const unreadCount = notifications.filter(n => !n.read).length;
    const panelRef = useRef<HTMLDivElement>(null);

    const togglePanel = () => {
        if (!isOpen) {
            onOpen(); // Mark as read when opening
        }
        setIsOpen(!isOpen);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="relative" ref={panelRef}>
            <button
                onClick={togglePanel}
                className="relative p-1 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-colors duration-300"
                aria-label={`Notifications (${unreadCount} unread)`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-black">{unreadCount}</span>
                )}
            </button>

            <div className={`notification-panel absolute top-full right-0 mt-3 w-80 max-w-sm bg-slate-900/90 backdrop-blur-lg border border-gray-700 rounded-2xl shadow-2xl z-50 ${isOpen ? 'open' : ''}`}>
                <div className="flex justify-between items-center p-4 border-b border-white/10">
                    <h3 className="font-bold text-white">Notifications</h3>
                    {notifications.length > 0 && (
                         <button onClick={onClear} className="text-sm text-orange-300 hover:text-white">Clear All</button>
                    )}
                </div>
                <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                        <p className="text-center text-orange-200 p-6">You have no new notifications.</p>
                    ) : (
                        notifications.map(n => (
                            <div key={n.id} className="flex gap-3 p-4 border-b border-white/10 last:border-b-0 hover:bg-white/5">
                                <div className="w-8 h-8 rounded-full bg-black/20 flex-shrink-0 flex items-center justify-center text-lg">{n.icon}</div>
                                <div className="flex-grow">
                                    <p className="font-semibold text-white leading-tight">{t(n.title as any)}</p>
                                    <p className="text-sm text-orange-200 leading-snug">{n.message.startsWith('आपकी') ? n.message : t(n.message as any)}</p>
                                    <p className="text-xs text-orange-400 mt-1">{timeSince(n.timestamp)}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationBell;