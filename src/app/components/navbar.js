"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronDown, LogIn, LogOut, Menu, UserPlus, UserRound, X } from "lucide-react";
import { useState } from "react";
import { useEvent } from "@/context/EventContext";
import { useUser } from "@/context/userContext";
import axios from "axios";
import { toast } from "react-toastify";

const Navbar = () => {
    const [show, setShow] = useState(false);

    const { event } = useEvent();
    const { user, setUser } = useUser();

    const closeMenu = () => {
        setShow(false);
    };

    const toggleMenu = () => {
        setShow((prev) => !prev);
    };

    const logout = async () => {
        try {
            const result = await axios.post("/api/logout")
            if (result) {
                setUser(null)
                toast.success("User is logout")
            }
        } catch (error) {
            toast.error(error.response?.data?.error)
        }
    };

    const accountName = user ? `${user.firstname || ""} ${user.lastname || ""}`.trim() : "";
    const profileImage = user?.profileimage?.url;

    return (
        <header className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm">
            <nav className="relative mx-auto flex min-h-[64px] max-w-7xl items-center px-4 sm:px-6 lg:px-8">
                <Link href="/" aria-label="Studies Forge homepage" onClick={closeMenu}>
                    <Image src="/logo.png" alt="Studies Forge" width={180} height={60} priority className="h-11 w-auto object-contain" />
                </Link>

                <div className="ml-auto flex items-center gap-2.5">
                    <div className="hidden items-center gap-1 md:flex">
                        <Link href="/" className="rounded-lg px-3 py-2 text-lg font-semibold text-[#1E3A8A] transition hover:bg-blue-50">
                            Home
                        </Link>

                        {event?.map((e) => (
                            <Link key={e._id} href={`/events/${e._id}`} className="rounded-lg px-3 py-2 text-lg font-semibold text-[#1E3A8A] transition hover:bg-blue-50">
                                {e.name}
                            </Link>
                        ))}
                    </div>

                    <button onClick={toggleMenu} type="button" aria-label={show ? "Close menu" : "Open menu"} aria-expanded={show} className="flex h-10 w-10 items-center justify-center rounded-lg text-[#1E3A8A] transition hover:bg-blue-50 active:scale-95 md:hidden">
                        {show ? <X size={25} strokeWidth={2.5} /> : <Menu size={25} strokeWidth={2.5} />}
                    </button>

                    <div className="group relative">
                        <div className="flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 text-[#1E3A8A] transition hover:border-blue-200 hover:bg-blue-50">
                            {profileImage ? (
                                <Image src={profileImage} alt={accountName || "User profile"} width={24} height={24} unoptimized className="h-6 w-6 rounded-full object-cover" />
                            ) : (
                                <UserRound size={20} strokeWidth={2.2} />
                            )}

                            {user && (
                                <span className="hidden max-w-24 truncate text-xs font-semibold sm:block">
                                    {user.firstname}
                                </span>
                            )}

                            <ChevronDown size={15} className="hidden transition-transform group-hover:rotate-180 sm:block" />
                        </div>

                        <div role="menu" className="invisible absolute right-0 top-full z-50 w-64 translate-y-2 pt-2 opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                                {user ? (
                                    <>
                                        <Link href="/me" onClick={closeMenu} role="menuitem" className="block border-b border-slate-100 p-4 transition hover:bg-blue-50">
                                            <div className="flex items-center gap-3">
                                                {profileImage ? (
                                                    <Image src={profileImage} alt={accountName || "User profile"} width={40} height={40} unoptimized className="h-10 w-10 shrink-0 rounded-full object-cover" />
                                                ) : (
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold uppercase text-blue-700">
                                                        {user.firstname?.charAt(0) || "U"}
                                                    </div>
                                                )}

                                                <div className="min-w-0">
                                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                                        Account
                                                    </p>

                                                    <p className="truncate text-sm font-semibold text-slate-900">
                                                        {accountName || "User"}
                                                    </p>

                                                    <p className="truncate text-xs text-slate-500">
                                                        {user.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </Link>

                                        <button onClick={logout} type="button" role="menuitem" className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50">
                                            <LogOut size={18} />
                                            Logout
                                        </button>
                                    </>
                                ) : (
                                    <div className="p-3">
                                        <div className="mb-3 px-1">
                                            <p className="text-sm font-semibold text-slate-900">
                                                Welcome to Studies Forge
                                            </p>

                                            <p className="mt-1 text-xs leading-5 text-slate-500">
                                                Sign in to access your learning resources.
                                            </p>
                                        </div>

                                        <Link href="/login" onClick={closeMenu} role="menuitem" className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700">
                                            <LogIn size={17} />
                                            Sign in
                                        </Link>

                                        <Link href="/user" onClick={closeMenu} role="menuitem" className="mt-2 flex items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-100">
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
                    <div className="absolute left-4 right-4 top-[72px] z-40 flex max-h-[calc(100vh-88px)] flex-col gap-2 overflow-y-auto rounded-xl border border-slate-200 bg-white p-4 shadow-xl md:hidden">
                        <Link href="/" onClick={closeMenu} className="rounded-lg bg-blue-50 px-4 py-3 font-semibold text-[#1E3A8A] transition hover:bg-blue-100">
                            Home
                        </Link>

                        {event?.map((e) => (
                            <Link key={e._id} href={`/events/${e._id}`} onClick={closeMenu} className="rounded-lg bg-slate-50 px-4 py-3 font-semibold text-[#1E3A8A] transition hover:bg-blue-50">
                                {e.name}
                            </Link>
                        ))}
                    </div>
                )}
            </nav>
        </header>
    );
};

export default Navbar;