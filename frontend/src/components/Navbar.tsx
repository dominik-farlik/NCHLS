import { useState, useEffect, useRef } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { logout, getStoredUsername } from "../utils/auth";

function Navbar() {
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    });

    const [username, setUsername] = useState(getStoredUsername());
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const dropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const root = document.documentElement;
        if (darkMode) {
            root.classList.add('dark');
            localStorage.theme = 'dark';
        } else {
            root.classList.remove('dark');
            localStorage.theme = 'light';
        }
    }, [darkMode]);

    useEffect(() => {
        const onAuthChange = () => setUsername(getStoredUsername());
        window.addEventListener("auth-token-changed", onAuthChange);
        window.addEventListener("storage", onAuthChange);
        return () => {
            window.removeEventListener("auth-token-changed", onAuthChange);
            window.removeEventListener("storage", onAuthChange);
        };
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = async () => {
        setIsDropdownOpen(false);
        await logout();
        navigate("/login");
    };

    const navLinkClass = ({ isActive }: { isActive: boolean }) =>
        `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors h-full ${
            isActive
                ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-700 dark:hover:text-slate-200"
        }`;

    const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
        `block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors ${
            isActive
                ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 text-indigo-700 dark:text-indigo-400"
                : "border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 hover:text-slate-800 dark:hover:text-slate-200"
        }`;

    return (
        <nav className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <Link to="/" className="hover:opacity-80 transition-opacity">
                                <img
                                    src="/favicon.png"
                                    alt="Logo"
                                    className="h-10 w-auto object-contain"
                                />
                            </Link>
                        </div>
                        <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                            <NavLink to="/substances" className={navLinkClass}>Látky</NavLink>
                            <NavLink to="/records" className={navLinkClass}>Záznamy</NavLink>
                            <NavLink to="/departments" className={navLinkClass}>Inventura</NavLink>
                        </div>
                    </div>

                    <div className="hidden sm:flex sm:items-center sm:gap-4">
                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                            aria-label="Přepnout motiv"
                        >
                            {darkMode ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                </svg>
                            )}
                        </button>

                        {username ? (
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 focus:outline-none transition-colors p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900"
                                >
                                    <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                                        {username.charAt(0).toUpperCase()}
                                    </div>
                                    <span>{username}</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {isDropdownOpen && (
                                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-xl shadow-lg bg-white dark:bg-slate-900 ring-1 ring-black ring-opacity-5 border border-slate-200 dark:border-slate-800 focus:outline-none overflow-hidden">
                                        <div className="py-1">
                                            <button
                                                onClick={handleLogout}
                                                className="w-full text-left px-4 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors flex items-center gap-2"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                </svg>
                                                Odhlásit
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-indigo-700 bg-indigo-100 hover:bg-indigo-200 dark:text-indigo-300 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 transition-colors"
                            >
                                Přihlásit
                            </Link>
                        )}
                    </div>

                    <div className="flex items-center sm:hidden gap-2">
                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                        >
                            {darkMode ? "☀️" : "🌙"}
                        </button>
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                        >
                            <span className="sr-only">Otevřít hlavní menu</span>
                            {isMobileMenuOpen ? (
                                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {isMobileMenuOpen && (
                <div className="sm:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                    <div className="pt-2 pb-3 space-y-1">
                        <NavLink to="/substances" onClick={() => setIsMobileMenuOpen(false)} className={mobileNavLinkClass}>Látky</NavLink>
                        <NavLink to="/records" onClick={() => setIsMobileMenuOpen(false)} className={mobileNavLinkClass}>Záznamy</NavLink>
                        <NavLink to="/departments" onClick={() => setIsMobileMenuOpen(false)} className={mobileNavLinkClass}>Inventura</NavLink>
                    </div>
                    <div className="pt-4 pb-3 border-t border-slate-200 dark:border-slate-800">
                        {username ? (
                            <>
                                <div className="flex items-center px-4 mb-3">
                                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-lg">
                                        {username.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="ml-3">
                                        <div className="text-base font-medium text-slate-800 dark:text-slate-200">{username}</div>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <button
                                        onClick={handleLogout}
                                        className="block w-full text-left px-4 py-2 text-base font-medium text-rose-600 dark:text-rose-400 hover:text-rose-800 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                                    >
                                        Odhlásit
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="px-4 py-2">
                                <Link
                                    to="/login"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                                >
                                    Přihlásit
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}

export default Navbar;