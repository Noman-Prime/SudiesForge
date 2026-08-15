"use client";

import { useEvent } from "@/context/EventContext";
import { useUser } from "@/context/userContext";
import axios from "axios";
import { ChevronDown, LayoutDashboard, LogIn, LogOut, Menu, UserPlus, UserRound, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

const toastOptions = {
    autoClose: 3000,
    pauseOnHover: false,
    pauseOnFocusLoss: false,
    closeOnClick: true,
};

const Navbar = () => {
    const navbarRef = useRef(null);
    const pathname = usePathname();
    const { event } = useEvent();
    const { user, setUser } = useUser();
    const [showMenu, setShowMenu] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const events = Array.isArray(event) ? event : [];
    const accountName = user ? `${user.firstname || ""} ${user.lastname || ""}`.trim() || "User" : "";
    const profileImage = user?.profileimage?.url;
    const userInitial = user?.firstname?.charAt(0)?.toUpperCase() || "U";

    const closeMenus = () => {
        setShowMenu(false);
        setShowUserMenu(false);
    };

    const toggleMenu = () => {
        setShowMenu((previous) => !previous);
        setShowUserMenu(false);
    };

    const toggleUserMenu = () => {
        setShowUserMenu((previous) => !previous);
        setShowMenu(false);
    };

    const logout = async () => {
        if (!user || isLoggingOut) {
            return;
        }

        try {
            setIsLoggingOut(true);

            const result = await axios.post("/api/logout", {}, {
                withCredentials: true,
            });

            if (!result.data?.success) {
                toast.dismiss();
                toast.error(result.data?.message || "Logout failed", toastOptions);
                return;
            }

            setUser(null);
            closeMenus();
            toast.dismiss();
            toast.success("User is logged out", toastOptions);
        } catch (error) {
            console.log(error);
            toast.dismiss();
            toast.error(error.response?.data?.message || error.message || "Logout failed", toastOptions);
        } finally {
            setIsLoggingOut(false);
        }
    };

    useEffect(() => {
        closeMenus();
    }, [pathname]);

    useEffect(() => {
        if (!showMenu && !showUserMenu) {
            return;
        }

        const handleOutsideClick = (event) => {
            if (navbarRef.current && !navbarRef.current.contains(event.target)) {
                closeMenus();
            }
        };

        const handleEscape = (event) => {
            if (event.key === "Escape") {
                closeMenus();
            }
        };

        document.addEventListener("pointerdown", handleOutsideClick);
        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("pointerdown", handleOutsideClick);
            document.removeEventListener("keydown", handleEscape);
        };
    }, [showMenu, showUserMenu]);

    useEffect(() => {
        const desktopBreakpoint = window.matchMedia("(min-width: 768px)");

        const handleBreakpoint = (event) => {
            if (event.matches) {
                closeMenus();
            }
        };

        desktopBreakpoint.addEventListener("change", handleBreakpoint);

        return () => {
            desktopBreakpoint.removeEventListener("change", handleBreakpoint);
        };
    }, []);

    return (
        <header ref={navbarRef} className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-xl">
            <nav className="relative mx-auto flex h-16 w-full max-w-[1300px] items-center px-3 sm:px-6 lg:px-8">
                <Link href="/" aria-label="Studies Forge homepage" onClick={closeMenus} className="flex shrink-0 items-center">
                    <Image src="/logo.png" alt="Studies Forge" width={180} height={60} priority className="h-9 w-auto object-contain sm:h-10" />
                </Link>

                <div className="ml-auto hidden min-w-0 items-center gap-1 md:flex">
                    <Link href="/" aria-current={pathname === "/" ? "page" : undefined} className={`rounded-lg px-3 py-2 text-sm font-bold transition ${pathname === "/" ? "bg-blue-50 text-blue-700" : "text-[#102a63] hover:bg-slate-50 hover:text-blue-700"}`}>
                        Home
                    </Link>

                    {events.map((item) => {
                        const eventPath = `/events/${item._id}`;
                        const isActive = pathname.startsWith(eventPath);

                        return (
                            <Link key={item._id} href={eventPath} aria-current={isActive ? "page" : undefined} className={`max-w-32 truncate rounded-lg px-3 py-2 text-sm font-bold transition ${isActive ? "bg-blue-50 text-blue-700" : "text-[#102a63] hover:bg-slate-50 hover:text-blue-700"}`}>
                                {item.name}
                            </Link>
                        );
                    })}
                </div>

                <div className="ml-auto flex items-center gap-2 md:ml-3">
                    <button type="button" onClick={toggleMenu} aria-label={showMenu ? "Close navigation menu" : "Open navigation menu"} aria-expanded={showMenu} className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-[#102a63] transition hover:border-blue-200 hover:bg-blue-50 active:scale-95 md:hidden">
                        {showMenu ? <X size={22} strokeWidth={2.3} /> : <Menu size={22} strokeWidth={2.3} />}
                    </button>

                    <div className="relative">
                        <button type="button" onClick={toggleUserMenu} aria-label="Open account menu" aria-expanded={showUserMenu} aria-haspopup="menu" className={`flex h-10 items-center gap-2 rounded-xl border px-2 transition active:scale-95 ${showUserMenu ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-[#102a63] hover:border-blue-200 hover:bg-blue-50"}`}>
                            {profileImage ? (
                                <Image src={profileImage} alt={accountName || "User profile"} width={32} height={32} unoptimized className="h-8 w-8 rounded-lg object-cover sm:h-7 sm:w-7 sm:rounded-full" />
                            ) : user ? (
                                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-xs font-extrabold text-blue-700 sm:h-7 sm:w-7 sm:rounded-full">
                                    {userInitial}
                                </span>
                            ) : (
                                <UserRound size={19} strokeWidth={2.2} />
                            )}

                            {user && <span className="hidden max-w-24 truncate text-xs font-bold sm:block">{user.firstname || accountName}</span>}
                            <ChevronDown size={14} className={`hidden shrink-0 transition-transform duration-200 sm:block ${showUserMenu ? "rotate-180" : ""}`} />
                        </button>

                        <div role="menu" className={`absolute right-0 top-full z-50 w-64 origin-top-right pt-2 transition duration-200 ${showUserMenu ? "visible pointer-events-auto translate-y-0 opacity-100" : "invisible pointer-events-none translate-y-2 opacity-0"}`}>
                            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                                {user ? (
                                    <>
                                        <Link href="/me" onClick={closeMenus} role="menuitem" className="block border-b border-slate-100 p-4 transition hover:bg-blue-50">
                                            <div className="flex items-center gap-3">
                                                {profileImage ? (
                                                    <Image src={profileImage} alt={accountName} width={42} height={42} unoptimized className="h-10 w-10 shrink-0 rounded-lg object-cover sm:rounded-full" />
                                                ) : (
                                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-sm font-extrabold text-blue-700 sm:rounded-full">
                                                        {userInitial}
                                                    </span>
                                                )}

                                                <div className="min-w-0">
                                                    <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">Account</p>
                                                    <p className="mt-1 truncate text-sm font-extrabold text-[#071a4a]">{accountName}</p>
                                                    <p className="mt-0.5 truncate text-[10px] text-slate-500">{user.email}</p>
                                                </div>
                                            </div>
                                        </Link>

                                        {user.role === "admin" && (
                                            <Link href="/admin" onClick={closeMenus} role="menuitem" className="flex items-center gap-3 border-b border-slate-100 px-4 py-3 text-xs font-bold text-blue-700 transition hover:bg-blue-50">
                                                <LayoutDashboard size={17} />
                                                Admin Dashboard
                                            </Link>
                                        )}

                                        <button type="button" onClick={logout} disabled={isLoggingOut} role="menuitem" className="flex w-full items-center gap-3 px-4 py-3 text-left text-xs font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60">
                                            {isLoggingOut ? (
                                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-200 border-t-red-600" />
                                            ) : (
                                                <LogOut size={17} />
                                            )}
                                            {isLoggingOut ? "Logging out..." : "Logout"}
                                        </button>
                                    </>
                                ) : (
                                    <div className="p-3">
                                        <div className="px-1 pb-3">
                                            <p className="text-sm font-extrabold text-[#071a4a]">Welcome to Studies Forge</p>
                                            <p className="mt-1 text-[10px] leading-5 text-slate-500">Sign in to access your account and learning resources.</p>
                                        </div>

                                        <Link href="/login" onClick={closeMenus} role="menuitem" className="flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-bold text-white transition hover:bg-blue-700">
                                            <LogIn size={16} />
                                            Sign In
                                        </Link>

                                        <Link href="/signup" onClick={closeMenus} role="menuitem" className="mt-2 flex h-10 items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 text-xs font-bold text-blue-700 transition hover:bg-blue-100">
                                            <UserPlus size={16} />
                                            Create Account
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className={`absolute left-3 right-3 top-full z-40 pt-2 transition duration-200 md:hidden ${showMenu ? "visible pointer-events-auto translate-y-0 opacity-100" : "invisible pointer-events-none -translate-y-2 opacity-0"}`}>
                    <div className="max-h-[calc(100vh-80px)] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
                        <Link href="/" onClick={closeMenus} aria-current={pathname === "/" ? "page" : undefined} className={`flex items-center rounded-xl px-4 py-3 text-sm font-bold transition ${pathname === "/" ? "bg-blue-600 text-white" : "bg-slate-50 text-[#102a63] hover:bg-blue-50 hover:text-blue-700"}`}>
                            Home
                        </Link>

                        <div className="mt-2 space-y-2">
                            {events.map((item) => {
                                const eventPath = `/events/${item._id}`;
                                const isActive = pathname.startsWith(eventPath);

                                return (
                                    <Link key={item._id} href={eventPath} onClick={closeMenus} aria-current={isActive ? "page" : undefined} className={`flex items-center rounded-xl px-4 py-3 text-sm font-bold transition ${isActive ? "bg-blue-600 text-white" : "bg-slate-50 text-[#102a63] hover:bg-blue-50 hover:text-blue-700"}`}>
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Navbar;