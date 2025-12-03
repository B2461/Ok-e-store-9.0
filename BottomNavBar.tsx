import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppContext } from '../App';

const HomeIcon: React.FC<{ isActive: boolean }> = ({ isActive }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isActive ? 2.5 : 2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
);

const StoreIcon: React.FC<{ isActive: boolean }> = ({ isActive }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isActive ? 2.5 : 2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
);

const SupportIcon: React.FC<{ isActive: boolean }> = ({ isActive }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isActive ? 2.5 : 2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

const AdminIcon: React.FC<{ isActive: boolean }> = ({ isActive }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isActive ? 2.5 : 2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066 2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);


interface BottomNavBarProps {
    cartItemCount: number;
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({ cartItemCount }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { language, t, isAuthenticated, showAuth } = useAppContext();
    
    const handleProtectedLink = (path: string) => {
        if (isAuthenticated) {
            navigate(path);
        } else {
            showAuth(() => navigate(path));
        }
    };

    const navItems = [
        { path: '/home', label: language === 'hi' ? 'होम' : 'Home', Icon: HomeIcon },
        { path: '/store', label: language === 'hi' ? 'स्टोर' : 'Store', Icon: StoreIcon },
        { path: '/support', label: t('support_and_help'), Icon: SupportIcon, isProtected: true },
        { path: '/admin', label: t('admin'), Icon: AdminIcon },
    ];

    return (
        <nav className="fixed bottom-4 left-0 right-0 max-w-md mx-auto bg-gradient-to-r from-purple-900 via-black to-orange-900 backdrop-blur-md rounded-2xl shadow-[0_0_20px_rgba(249,115,22,0.5)] border border-orange-700/50 z-40">
            <div className="flex justify-around items-center h-20">
                {navItems.map(({ path, label, Icon, isProtected }) => {
                    const isActive = (() => {
                        if (path === '/home') return location.pathname === '/home' || location.pathname === '/';
                        if (path === '/store') return ['/store', '/product', '/cart', '/checkout'].some(p => location.pathname.startsWith(p));
                        if (path === '/support') return location.pathname.startsWith('/support');
                        if (path === '/admin') return location.pathname.startsWith('/admin');
                        return location.pathname.startsWith(path);
                    })();

                    const className = `relative flex flex-col items-center justify-center gap-1 w-20 h-full transition-colors duration-200 ${isActive ? 'text-white' : 'text-white/70 hover:text-white'}`;

                    const content = (
                        <>
                            <Icon isActive={isActive} />
                            <span className="text-xs font-bold">{label}</span>
                            {path === '/store' && cartItemCount > 0 && (
                                <span className="absolute top-2 right-3 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-black">
                                    {cartItemCount > 9 ? '9+' : cartItemCount}
                                </span>
                            )}
                        </>
                    );

                    if (isProtected) {
                        return (
                             <button key={path} onClick={() => handleProtectedLink(path)} className={className}>
                                {content}
                            </button>
                        );
                    }

                    return (
                        <Link
                            key={path}
                            to={path}
                            className={className}
                        >
                           {content}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
};

export default BottomNavBar;