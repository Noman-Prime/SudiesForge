"use client";

import { useUser } from "@/context/userContext";
import axios from "axios";
import Link from "next/link";
import {
    ArrowRight,
    CalendarDays,
    ChevronDown,
    CircleAlert,
    ExternalLink,
    GraduationCap,
    Mail,
    RefreshCw,
    Search,
    Settings2,
    ShieldCheck,
    UserRound,
    Users,
    X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";

const toastOptions = {
    autoClose: 3000,
    pauseOnHover: false,
    pauseOnFocusLoss: false,
    closeOnClick: true,
};

const UsersPage = () => {
    const { user: currentUser } = useUser();

    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [sortBy, setSortBy] = useState("newest");
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    const getUsers = useCallback(async () => {
        try {
            setLoading(true);
            setErrorMessage("");

            const result = await axios.get("/api/user/all", {
                withCredentials: true,
            });

            if (!result.data?.success) {
                setUsers([]);
                setErrorMessage(result.data?.message || "Users could not be loaded");
                return;
            }

            const responseUsers = result.data.users || [];

            setUsers(Array.isArray(responseUsers) ? responseUsers : []);
        } catch (error) {
            console.log(error);

            setUsers([]);

            const message =
                error.response?.data?.message ||
                "Users could not be loaded";

            setErrorMessage(message);
            toast.error(message, toastOptions);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        getUsers();
    }, [getUsers]);

    const filteredUsers = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase();

        const availableUsers = users.filter((member) => {
            const fullName = getFullName(member).toLowerCase();
            const email = String(member.email || "").toLowerCase();
            const role = String(member.role || "user").toLowerCase();

            const matchesSearch =
                !normalizedSearch ||
                fullName.includes(normalizedSearch) ||
                email.includes(normalizedSearch);

            const matchesRole =
                roleFilter === "all" ||
                role === roleFilter;

            return matchesSearch && matchesRole;
        });

        return [...availableUsers].sort((first, second) => {
            if (sortBy === "oldest") {
                return getDateValue(first.createdAt) - getDateValue(second.createdAt);
            }

            if (sortBy === "name") {
                return getFullName(first).localeCompare(getFullName(second));
            }

            return getDateValue(second.createdAt) - getDateValue(first.createdAt);
        });
    }, [roleFilter, search, sortBy, users]);

    const adminCount = users.filter(
        (member) => String(member.role || "").toLowerCase() === "admin",
    ).length;

    const regularUserCount = users.length - adminCount;

    const recentUserCount = users.filter((member) => {
        const joinedDate = new Date(member.createdAt);

        if (Number.isNaN(joinedDate.getTime())) {
            return false;
        }

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        return joinedDate >= thirtyDaysAgo;
    }).length;

    const clearFilters = () => {
        setSearch("");
        setRoleFilter("all");
        setSortBy("newest");
    };

    return (
        <div className="min-h-screen bg-[#f5f7fb]">
            <AdminHeader user={currentUser} />

            <main className="mx-auto w-full max-w-[1300px] px-3 py-5 sm:px-6 sm:py-7 lg:px-8">
                <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
                    <div className="min-w-0">
                        <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-blue-600">
                            Account management
                        </p>

                        <h1 className="mt-1.5 text-xl font-extrabold tracking-tight text-[#071a4a] sm:text-2xl">
                            Manage Users
                        </h1>

                        <p className="mt-1.5 max-w-2xl text-xs leading-5 text-slate-500 sm:text-sm">
                            View every registered account and manage user information and permissions.
                        </p>
                    </div>

                    <button type="button" onClick={getUsers} disabled={loading} className="flex h-10 w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 text-xs font-bold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto">
                        <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
                        Refresh Users
                    </button>
                </section>

                <section className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
                    <StatCard label="Total users" value={users.length} icon={Users} color="blue" />
                    <StatCard label="Administrators" value={adminCount} icon={ShieldCheck} color="violet" />
                    <StatCard label="Regular users" value={regularUserCount} icon={UserRound} color="emerald" />
                    <StatCard label="Joined recently" value={recentUserCount} icon={CalendarDays} color="orange" />
                </section>

                <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 p-4 sm:p-5">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                                <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-blue-600">
                                    Registered accounts
                                </p>

                                <h2 className="mt-1 text-base font-extrabold text-[#071a4a] sm:text-lg">
                                    Users Directory
                                </h2>

                                <p className="mt-1 text-[10px] leading-5 text-slate-500 sm:text-xs">
                                    {loading
                                        ? "Loading users..."
                                        : `${users.length} ${users.length === 1 ? "user is" : "users are"} registered`}
                                </p>
                            </div>

                            <div className="grid gap-2.5 sm:grid-cols-[minmax(0,1fr)_150px_150px] lg:w-[680px]">
                                <div className="relative">
                                    <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />

                                    <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name or email..." className="h-10 w-full rounded-xl border border-slate-300 bg-white pl-9 pr-9 text-xs text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100" />

                                    {search && (
                                        <button type="button" onClick={() => setSearch("")} aria-label="Clear search" className="absolute right-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-600">
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>

                                <FilterSelect value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} ariaLabel="Filter users by role" options={[{ value: "all", label: "All roles" }, { value: "admin", label: "Administrators" }, { value: "user", label: "Regular users" }]} />

                                <FilterSelect value={sortBy} onChange={(event) => setSortBy(event.target.value)} ariaLabel="Sort users" options={[{ value: "newest", label: "Newest first" }, { value: "oldest", label: "Oldest first" }, { value: "name", label: "Name A-Z" }]} />
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <UsersLoading />
                    ) : errorMessage ? (
                        <UsersError message={errorMessage} retry={getUsers} />
                    ) : users.length === 0 ? (
                        <UsersEmpty title="No users are available" description="The API returned no registered user accounts." />
                    ) : filteredUsers.length === 0 ? (
                        <UsersEmpty title="No matching users" description="No account matches the currently selected filters." showClear clearFilters={clearFilters} />
                    ) : (
                        <div className="grid grid-cols-1 gap-3 bg-slate-50/70 p-3 sm:grid-cols-2 sm:gap-4 sm:p-5 lg:grid-cols-3 xl:grid-cols-4">
                            {filteredUsers.map((member) => (
                                <UserCard key={member._id} user={member} isCurrentUser={String(member._id) === String(currentUser?._id)} />
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

const UserCard = ({ user, isCurrentUser }) => {
    const fullName = getFullName(user);
    const role = String(user.role || "user").toLowerCase();

    return (
        <article className="group flex min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md">
            <div className="flex items-start justify-between gap-3">
                <UserAvatar user={user} fullName={fullName} />

                <div className="flex flex-wrap justify-end gap-1.5">
                    {isCurrentUser && (
                        <span className="rounded-full bg-emerald-100 px-2 py-1 text-[7px] font-extrabold uppercase tracking-[0.1em] text-emerald-700">
                            You
                        </span>
                    )}

                    <RoleBadge role={role} />
                </div>
            </div>

            <div className="mt-4 min-w-0">
                <h3 className="truncate text-sm font-extrabold text-[#071a4a]">
                    {fullName}
                </h3>

                <div className="mt-2 flex min-w-0 items-center gap-2 text-[10px] text-slate-500">
                    <Mail size={13} className="shrink-0 text-blue-600" />

                    <span className="truncate">
                        {user.email || "No email available"}
                    </span>
                </div>

                <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-500">
                    <CalendarDays size={13} className="shrink-0 text-blue-600" />

                    <span>
                        Joined {formatDate(user.createdAt)}
                    </span>
                </div>
            </div>

            <div className="mt-auto pt-5">
                <Link href={`/admin/users/${user._id}`} aria-label={`Manage ${fullName}`} className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 text-[10px] font-bold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md">
                    Manage User
                    <ArrowRight size={14} />
                </Link>
            </div>
        </article>
    );
};

const UserAvatar = ({ user, fullName }) => {
    const firstName = user.firstname || "";
    const lastName = user.lastname || "";
    const initials = `${firstName.charAt(0)}${lastName.charAt(0)}` || "U";

    return (
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-blue-600 text-base font-extrabold uppercase text-white shadow-md">
            {user.profileimage?.url ? (
                <img src={user.profileimage.url} alt={fullName} className="h-full w-full object-cover" />
            ) : (
                initials
            )}
        </div>
    );
};

const RoleBadge = ({ role }) => {
    const isAdmin = role === "admin";

    return (
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[7px] font-extrabold uppercase tracking-[0.1em] ${isAdmin ? "bg-violet-100 text-violet-700" : "bg-blue-100 text-blue-700"}`}>
            {isAdmin && <ShieldCheck size={10} />}
            {isAdmin ? "Admin" : "User"}
        </span>
    );
};

const StatCard = ({ label, value, icon: Icon, color }) => {
    const styles = {
        blue: "bg-blue-600 text-white lg:bg-blue-50 lg:text-blue-600",
        violet: "bg-violet-600 text-white lg:bg-violet-50 lg:text-violet-600",
        emerald: "bg-emerald-600 text-white lg:bg-emerald-50 lg:text-emerald-600",
        orange: "bg-orange-500 text-white lg:bg-orange-50 lg:text-orange-500",
    };

    return (
        <article className="flex min-w-0 items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11 ${styles[color]}`}>
                <Icon size={20} strokeWidth={1.9} />
            </div>

            <div className="min-w-0">
                <p className="text-lg font-extrabold text-[#071a4a] sm:text-xl">
                    {value}
                </p>

                <p className="truncate text-[9px] font-semibold text-slate-500 sm:text-[10px]">
                    {label}
                </p>
            </div>
        </article>
    );
};

const FilterSelect = ({ value, onChange, ariaLabel, options }) => {
    return (
        <div className="relative">
            <select value={value} onChange={onChange} aria-label={ariaLabel} className="h-10 w-full appearance-none rounded-xl border border-slate-300 bg-white px-3 pr-9 text-xs font-semibold text-slate-700 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100">
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>

            <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
    );
};

const UsersLoading = () => {
    return (
        <div className="grid grid-cols-1 gap-3 bg-slate-50/70 p-3 sm:grid-cols-2 sm:gap-4 sm:p-5 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
                <div key={item} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex justify-between gap-3">
                        <div className="h-14 w-14 rounded-2xl bg-slate-200" />
                        <div className="h-6 w-16 rounded-full bg-slate-100" />
                    </div>

                    <div className="mt-4 h-3.5 w-2/3 rounded bg-slate-200" />
                    <div className="mt-3 h-3 w-full rounded bg-slate-100" />
                    <div className="mt-2 h-3 w-3/4 rounded bg-slate-100" />
                    <div className="mt-5 h-10 rounded-xl bg-slate-100" />
                </div>
            ))}
        </div>
    );
};

const UsersError = ({ message, retry }) => {
    return (
        <div className="px-4 py-14 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500">
                <CircleAlert size={23} />
            </div>

            <h3 className="mt-3 text-sm font-extrabold text-[#071a4a]">
                Users could not be loaded
            </h3>

            <p className="mx-auto mt-1.5 max-w-md text-[10px] leading-5 text-slate-500 sm:text-xs">
                {message}
            </p>

            <button type="button" onClick={retry} className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-bold text-white transition hover:bg-blue-700">
                <RefreshCw size={15} />
                Try Again
            </button>
        </div>
    );
};

const UsersEmpty = ({ title, description, showClear = false, clearFilters }) => {
    return (
        <div className="px-4 py-14 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Users size={23} />
            </div>

            <h3 className="mt-3 text-sm font-extrabold text-[#071a4a]">
                {title}
            </h3>

            <p className="mx-auto mt-1.5 max-w-md text-[10px] leading-5 text-slate-500 sm:text-xs">
                {description}
            </p>

            {showClear && (
                <button type="button" onClick={clearFilters} className="mt-4 h-10 rounded-xl bg-blue-600 px-4 text-xs font-bold text-white transition hover:bg-blue-700">
                    Clear Filters
                </button>
            )}
        </div>
    );
};

const AdminHeader = ({ user }) => {
    const [showUserMenu, setShowUserMenu] = useState(false);
    const menuRef = useRef(null);

    const accountName = user
        ? `${user.firstname || ""} ${user.lastname || ""}`.trim() || "Administrator"
        : "Administrator";

    useEffect(() => {
        const closeUserMenu = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowUserMenu(false);
            }
        };

        document.addEventListener("mousedown", closeUserMenu);

        return () => {
            document.removeEventListener("mousedown", closeUserMenu);
        };
    }, []);

    return (
        <header className="sticky top-0 z-50 bg-[#102a63] px-3 py-2 text-white shadow-sm sm:px-6">
            <div className="mx-auto flex h-14 w-full max-w-[1500px] items-center gap-2 sm:h-16 sm:gap-4">
                <Link href="/admin" className="flex min-w-0 max-w-[48%] items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-2.5 py-2 text-white shadow-sm backdrop-blur-xl transition hover:bg-white/15 sm:max-w-none sm:gap-3 sm:px-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[#102a63] sm:h-10 sm:w-10">
                        <GraduationCap size={21} />
                    </div>

                    <div className="min-w-0">
                        <span className="block truncate text-[11px] font-bold text-white sm:text-sm">
                            StudiesForge
                        </span>

                        <span className="block truncate text-[9px] text-blue-200 sm:text-xs">
                            Admin Console
                        </span>
                    </div>
                </Link>

                <div ref={menuRef} className="relative ml-auto min-w-0 max-w-[52%] sm:max-w-none">
                    <button type="button" aria-label="Open admin account menu" aria-haspopup="menu" aria-expanded={showUserMenu} onClick={() => setShowUserMenu((previous) => !previous)} className="flex w-full min-w-0 items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-2.5 py-2 text-left text-white shadow-sm backdrop-blur-xl transition hover:bg-white/15 sm:gap-3 sm:px-4">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white text-xs font-bold uppercase text-[#102a63] sm:h-10 sm:w-10 sm:text-sm">
                            {user?.profileimage?.url ? (
                                <img src={user.profileimage.url} alt={accountName} className="h-full w-full object-cover" />
                            ) : (
                                user?.firstname?.charAt(0) || "A"
                            )}
                        </div>

                        <div className="min-w-0">
                            <span className="block truncate text-[11px] font-bold text-white sm:max-w-52 sm:text-sm">
                                {accountName}
                            </span>

                            <span className="block truncate text-[9px] text-blue-200 sm:max-w-52 sm:text-xs">
                                {user?.email || "Administrator"}
                            </span>
                        </div>

                        <ChevronDown size={15} className={`shrink-0 text-blue-200 transition-transform ${showUserMenu ? "rotate-180" : ""}`} />
                    </button>

                    {showUserMenu && (
                        <div role="menu" className="absolute right-0 top-full z-50 w-52 pt-2 sm:w-56">
                            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-2 text-slate-800 shadow-xl">
                                <Link href="/" role="menuitem" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition hover:bg-blue-50 hover:text-blue-700">
                                    <ExternalLink size={17} />
                                    View Website
                                </Link>

                                <Link href="/admin/settings" role="menuitem" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition hover:bg-blue-50 hover:text-blue-700">
                                    <Settings2 size={17} />
                                    Settings
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

const getFullName = (user) => {
    return `${user.firstname || ""} ${user.lastname || ""}`.trim() || "Unnamed User";
};

const getDateValue = (date) => {
    const parsedDate = new Date(date);

    return Number.isNaN(parsedDate.getTime()) ? 0 : parsedDate.getTime();
};

const formatDate = (date) => {
    if (!date) {
        return "Not available";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return "Not available";
    }

    return new Intl.DateTimeFormat("en-PK", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(parsedDate);
};

export default UsersPage;