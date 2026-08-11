"use client";

import { useEvent } from "@/context/EventContext";
import { useUser } from "@/context/userContext";
import axios from "axios";
import {
    ChevronDown,
    LayoutDashboard,
    LogIn,
    LogOut,
    Menu,
    UserPlus,
    UserRound,
    X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
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

    const [show, setShow] = useState(false);
    const [showUser, setShowUser] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const { event } = useEvent();
    const { user, setUser } = useUser();

    const closeMenu = () => {
        setShow(false);
        setShowUser(false);
    };

    const toggleMenu = () => {
        setShow((previousValue) => !previousValue);
        setShowUser(false);
    };

    const toggleUserMenu = () => {
        setShowUser((previousValue) => !previousValue);
        setShow(false);
    };

    useEffect(() => {
        if (!show && !showUser) return;

        const handleOutsideClick = (e) => {
            if (navbarRef.current && !navbarRef.current.contains(e.target)) {
                setShow(false);
                setShowUser(false);
            }
        };

        const handleEscape = (e) => {
            if (e.key === "Escape") {
                setShow(false);
                setShowUser(false);
            }
        };

        document.addEventListener("pointerdown", handleOutsideClick);
        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("pointerdown", handleOutsideClick);
            document.removeEventListener("keydown", handleEscape);
        };
    }, [show, showUser]);

    useEffect(() => {
        const desktopBreakpoint = window.matchMedia("(min-width: 768px)");

        const closeMenusOnDesktop = (e) => {
            if (e.matches) {
                setShow(false);
                setShowUser(false);
            }
        };

        closeMenusOnDesktop(desktopBreakpoint);
        desktopBreakpoint.addEventListener("change", closeMenusOnDesktop);

        return () => {
            desktopBreakpoint.removeEventListener("change", closeMenusOnDesktop);
        };
    }, []);

    const logout = async () => {
        if (!user || isLoggingOut) return;

        setIsLoggingOut(true);

        try {
            const result = await axios.post(
                "/api/logout",
                {},
                {
                    withCredentials: true,
                },
            );

            if (!result.data?.success) {
                toast.dismiss();
                toast.error(result.data?.message || "Logout failed", toastOptions);
                return;
            }

            setUser(null);
            setShow(false);
            setShowUser(false);

            toast.dismiss();
            toast.success("User is logged out", toastOptions);
        } catch (error) {
            toast.dismiss();
            toast.error(
                error.response?.data?.message || error.message || "Logout failed",
                toastOptions,
            );
        } finally {
            setIsLoggingOut(false);
        }
    };

    const accountName = user
        ? `${user.firstname || ""} ${user.lastname || ""}`.trim()
        : "";

    const profileImage = user?.profileimage?.url;

    return (
        <header
            ref={navbarRef}
            className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm"
        >
            <nav className="relative mx-auto flex min-h-[64px] max-w-7xl items-center px-4 sm:px-6 lg:px-8">
                <Link href="/" aria-label="Studies Forge homepage" onClick={closeMenu}>
                    <Image
                        src="/logo.png"
                        alt="Studies Forge"
                        width={180}
                        height={60}
                        priority
                        className="h-11 w-auto object-contain"
                    />
                </Link>

                <div className="ml-auto flex items-center gap-2.5">
                    <div className="hidden items-center gap-1 md:flex">
                        <Link
                            href="/"
                            onClick={closeMenu}
                            className="rounded-lg px-3 py-2 text-lg font-semibold text-[#1E3A8A] transition hover:bg-blue-50"
                        >
                            Home
                        </Link>

                        {event?.map((item) => (
                            <Link
                                key={item._id}
                                href={`/events/${item._id}`}
                                onClick={closeMenu}
                                className="rounded-lg px-3 py-2 text-lg font-semibold text-[#1E3A8A] transition hover:bg-blue-50"
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={toggleMenu}
                        aria-label={show ? "Close menu" : "Open menu"}
                        aria-expanded={show}
                        className="flex h-10 w-10 items-center justify-center rounded-lg text-[#1E3A8A] transition hover:bg-blue-50 active:scale-95 md:hidden"
                    >
                        {show ? (
                            <X size={25} strokeWidth={2.5} />
                        ) : (
                            <Menu size={25} strokeWidth={2.5} />
                        )}
                    </button>

                    <div className="relative">
                        <button
                            type="button"
                            onClick={toggleUserMenu}
                            aria-label="User account menu"
                            aria-expanded={showUser}
                            aria-haspopup="menu"
                            className="flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 text-[#1E3A8A] transition hover:border-blue-200 hover:bg-blue-50 active:scale-95"
                        >
                            {profileImage ? (
                                <Image
                                    src={profileImage}
                                    alt={accountName || "User profile"}
                                    width={32}
                                    height={32}
                                    unoptimized
                                    className="h-8 w-8 rounded-md object-cover sm:h-6 sm:w-6 sm:rounded-full"
                                />
                            ) : (
                                <UserRound size={20} strokeWidth={2.2} />
                            )}

                            {user && (
                                <span className="hidden max-w-24 truncate text-xs font-semibold sm:block">
                                    {user.firstname}
                                </span>
                            )}

                            <ChevronDown
                                size={15}
                                className={`hidden transition-transform duration-200 sm:block ${showUser ? "rotate-180" : "rotate-0"
                                    }`}
                            />
                        </button>

                        <div
                            role="menu"
                            className={`absolute right-0 top-full z-50 w-64 origin-top-right pt-2 transition-all duration-200 ${showUser
                                    ? "visible pointer-events-auto translate-y-0 opacity-100"
                                    : "invisible pointer-events-none translate-y-2 opacity-0"
                                }`}
                        >
                            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                                {user ? (
                                    <>
                                        <Link
                                            href="/me"
                                            onClick={closeMenu}
                                            role="menuitem"
                                            className="block border-b border-slate-100 p-4 transition hover:bg-blue-50"
                                        >
                                            <div className="flex items-center gap-3">
                                                {profileImage ? (
                                                    <Image
                                                        src={profileImage}
                                                        alt={accountName || "User profile"}
                                                        width={40}
                                                        height={40}
                                                        unoptimized
                                                        className="h-10 w-10 shrink-0 rounded-lg object-cover sm:rounded-full"
                                                    />
                                                ) : (
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-sm font-bold uppercase text-blue-700 sm:rounded-full">
                                                        {user.firstname?.charAt(0) || "U"}
                                                    </div>
                                                )}

                                                <div className="min-w-0">
                                                    <p className="m-0 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                                        Account
                                                    </p>

                                                    <p className="mb-0 mt-0.5 truncate text-sm font-semibold text-slate-900">
                                                        {accountName || "User"}
                                                    </p>

                                                    <p className="mb-0 mt-0.5 truncate text-xs text-slate-500">
                                                        {user.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </Link>

                                        {user.role === "admin" && (
                                            <Link
                                                href="/admin"
                                                onClick={closeMenu}
                                                role="menuitem"
                                                className="flex items-center gap-3 border-b border-slate-100 px-4 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
                                            >
                                                <LayoutDashboard size={18} />
                                                Admin Dashboard
                                            </Link>
                                        )}

                                        <button
                                            type="button"
                                            onClick={logout}
                                            disabled={isLoggingOut}
                                            role="menuitem"
                                            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            <LogOut size={18} />
                                            {isLoggingOut ? "Logging out..." : "Logout"}
                                        </button>
                                    </>
                                ) : (
                                    <div className="p-3">
                                        <div className="mb-3 px-1">
                                            <p className="m-0 text-sm font-semibold text-slate-900">
                                                Welcome to Studies Forge
                                            </p>

                                            <p className="mb-0 mt-1 text-xs leading-5 text-slate-500">
                                                Sign in to access your learning resources.
                                            </p>
                                        </div>

                                        <Link
                                            href="/login"
                                            onClick={closeMenu}
                                            role="menuitem"
                                            className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                                        >
                                            <LogIn size={17} />
                                            Sign in
                                        </Link>

                                        <Link
                                            href="/signup"
                                            onClick={closeMenu}
                                            role="menuitem"
                                            className="mt-2 flex items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                                        >
                                            <UserPlus size={17} />
                                            Create account
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {show && (
                    <div className="absolute left-4 right-4 top-[72px] z-40 flex max-h-[calc(100vh-88px)] flex-col gap-2 overflow-y-auto rounded-xl border border-slate-200 bg-white p-4 shadow-xl md:!hidden">
                        <Link
                            href="/"
                            onClick={closeMenu}
                            className="rounded-lg bg-blue-50 px-4 py-3 font-semibold text-[#1E3A8A] transition hover:bg-blue-100"
                        >
                            Home
                        </Link>

                        {event?.map((item) => (
                            <Link
                                key={item._id}
                                href={`/events/${item._id}`}
                                onClick={closeMenu}
                                className="rounded-lg bg-slate-50 px-4 py-3 font-semibold text-[#1E3A8A] transition hover:bg-blue-50"
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>
                )}
            </nav>
        </header>
    );
};

export default Navbar;