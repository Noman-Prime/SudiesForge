"use client";

import DeleteConfirmationModal from "@/app/admin/components/deleteconfirmation";
import { useUser } from "@/context/userContext";
import axios from "axios";
import Link from "next/link";
import {
    ArrowLeft,
    CalendarDays,
    ChevronDown,
    CircleAlert,
    ExternalLink,
    GraduationCap,
    LoaderCircle,
    Mail,
    MapPin,
    Phone,
    Save,
    Settings2,
    ShieldCheck,
    Trash2,
    UserRound,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

const toastOptions = {
    autoClose: 3000,
    pauseOnHover: false,
    pauseOnFocusLoss: false,
    closeOnClick: true,
};

const allowedRoles = [
    {
        value: "user",
        label: "Regular User",
        description: "Can access public learning content and personal account features.",
    },
    {
        value: "admin",
        label: "Administrator",
        description: "Can access the admin console and manage website content.",
    },
];

const ManageUserPage = () => {
    const params = useParams();
    const router = useRouter();
    const { user: currentUser } = useUser();

    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    const currentUserId = currentUser?._id || currentUser?.id;

    const [managedUser, setManagedUser] = useState(null);
    const [selectedRole, setSelectedRole] = useState("user");
    const [savedRole, setSavedRole] = useState("user");
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const isCurrentUser = Boolean(currentUserId && String(currentUserId) === String(id));
    const roleChanged = selectedRole !== savedRole;

    const getUser = useCallback(async () => {
        if (!id) {
            setLoading(false);
            setErrorMessage("User ID is missing");
            return;
        }

        try {
            setLoading(true);
            setErrorMessage("");

            const result = await axios.get(`/api/user/${id}`);
            const selectedUser = result.data?.user || result.data?.User;

            if (!result.data?.success || !selectedUser) {
                setManagedUser(null);
                setErrorMessage(result.data?.message || "User could not be loaded");
                return;
            }

            const userRole = allowedRoles.some((role) => role.value === selectedUser.role)
                ? selectedUser.role
                : "user";

            setManagedUser(selectedUser);
            setSelectedRole(userRole);
            setSavedRole(userRole);
        } catch (error) {
            console.log(error);

            setManagedUser(null);
            setErrorMessage(error.response?.data?.message || "User could not be loaded");
        } finally {
            setLoading(false);
        }
    }, [id]);

    const updateUserRole = async () => {
        if (!managedUser || updating || !roleChanged) {
            return;
        }

        if (!allowedRoles.some((role) => role.value === selectedRole)) {
            toast.error("Please select a valid user role", toastOptions);
            return;
        }

        if (isCurrentUser) {
            toast.error("You cannot change your own administrator role", toastOptions);
            return;
        }

        try {
            setUpdating(true);

            const result = await axios.put(`/api/user/${id}/role`, {
                role: selectedRole,
            });

            if (!result.data?.success) {
                toast.error(result.data?.message || "User role could not be updated", toastOptions);
                return;
            }

            const updatedUser = result.data?.user || {
                ...managedUser,
                role: selectedRole,
            };

            const updatedRole = updatedUser.role || selectedRole;

            setManagedUser(updatedUser);
            setSelectedRole(updatedRole);
            setSavedRole(updatedRole);

            toast.success(result.data?.message || "User role is updated", toastOptions);
        } catch (error) {
            console.log(error);

            toast.error(error.response?.data?.message || "User role could not be updated", toastOptions);
        } finally {
            setUpdating(false);
        }
    };

    const resetRole = () => {
        if (!updating) {
            setSelectedRole(savedRole);
        }
    };

    const openDeleteModal = () => {
        if (isCurrentUser) {
            toast.error("You cannot delete your own administrator account", toastOptions);
            return;
        }

        if (!deleting) {
            setShowDeleteModal(true);
        }
    };

    const closeDeleteModal = useCallback(() => {
        if (!deleting) {
            setShowDeleteModal(false);
        }
    }, [deleting]);

    const deleteUserAccount = async () => {
        if (!id || deleting || isCurrentUser) {
            return;
        }

        try {
            setDeleting(true);

            const result = await axios.delete(`/api/user/${id}`);

            if (!result.data?.success) {
                toast.error(result.data?.message || "User could not be deleted", toastOptions);
                return;
            }

            setShowDeleteModal(false);

            toast.success(result.data?.message || "User is deleted", toastOptions);

            router.replace("/admin/users");
            router.refresh();
        } catch (error) {
            console.log(error);

            toast.error(error.response?.data?.message || "User could not be deleted", toastOptions);
        } finally {
            setDeleting(false);
        }
    };

    useEffect(() => {
        getUser();
    }, [getUser]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f5f7fb]">
                <AdminHeader user={currentUser} />
                <UserLoading />
            </div>
        );
    }

    if (errorMessage || !managedUser) {
        return (
            <div className="min-h-screen bg-[#f5f7fb]">
                <AdminHeader user={currentUser} />
                <UserError message={errorMessage || "User is not available"} retry={getUser} />
            </div>
        );
    }

    const fullName = getFullName(managedUser);

    return (
        <div className="min-h-screen bg-[#f5f7fb]">
            <AdminHeader user={currentUser} />

            <main className="mx-auto w-full max-w-[1100px] px-3 py-5 sm:px-6 sm:py-7 lg:px-8">
                <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-2 text-xs sm:text-sm">
                    <Link href="/admin/users" className="flex items-center gap-1.5 font-semibold text-slate-500 transition hover:text-blue-700">
                        <ArrowLeft size={16} />
                        Users
                    </Link>

                    <span className="text-slate-300">/</span>

                    <span className="max-w-52 truncate font-semibold text-blue-700">
                        {fullName}
                    </span>
                </nav>

                <section className="mb-5 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
                    <div className="min-w-0">
                        <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-blue-600">
                            User management
                        </p>

                        <h1 className="mt-1.5 truncate text-xl font-extrabold tracking-tight text-[#071a4a] sm:text-2xl">
                            Manage {fullName}
                        </h1>

                        <p className="mt-1.5 max-w-2xl text-xs leading-5 text-slate-500 sm:text-sm">
                            Review account information and control the user’s website role.
                        </p>
                    </div>

                    <RoleBadge role={savedRole} />
                </section>

                <div className="grid items-start gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
                    <aside className="space-y-5 lg:sticky lg:top-24">
                        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="bg-gradient-to-br from-[#102a63] to-blue-700 px-5 py-7 text-center">
                                <UserAvatar user={managedUser} fullName={fullName} />

                                <h2 className="mt-4 break-words text-lg font-extrabold text-white">
                                    {fullName}
                                </h2>

                                <p className="mt-1 break-all text-[10px] text-blue-100">
                                    {managedUser.email || "No email available"}
                                </p>

                                {isCurrentUser && (
                                    <span className="mt-3 inline-flex rounded-full bg-emerald-500 px-3 py-1 text-[8px] font-extrabold uppercase tracking-[0.1em] text-white">
                                        Your Account
                                    </span>
                                )}
                            </div>

                            <div className="space-y-3 p-4">
                                <InformationRow icon={Mail} label="Email" value={managedUser.email} />
                                <InformationRow icon={Phone} label="Contact number" value={managedUser.contactnumber} />
                                <InformationRow icon={MapPin} label="Country" value={managedUser.country} />
                                <InformationRow icon={CalendarDays} label="Joined" value={formatDate(managedUser.createdAt)} />
                            </div>
                        </section>

                        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-slate-400">
                                User ID
                            </p>

                            <p className="mt-2 break-all rounded-lg bg-slate-50 px-3 py-2 font-mono text-[9px] leading-4 text-slate-600">
                                {managedUser._id}
                            </p>
                        </section>
                    </aside>

                    <div className="space-y-5">
                        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="flex items-start gap-3 border-b border-slate-200 px-5 py-4 sm:px-6">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                    <ShieldCheck size={20} />
                                </div>

                                <div>
                                    <p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-blue-600">
                                        Access control
                                    </p>

                                    <h2 className="mt-1 text-base font-extrabold text-[#071a4a]">
                                        Update User Role
                                    </h2>

                                    <p className="mt-1 text-[10px] leading-5 text-slate-500 sm:text-xs">
                                        This is the only user information an administrator can update from this page.
                                    </p>
                                </div>
                            </div>

                            <div className="p-5 sm:p-6">
                                {isCurrentUser && (
                                    <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                                        <p className="text-xs font-bold text-amber-700">
                                            Your administrator role is protected
                                        </p>

                                        <p className="mt-1 text-[10px] leading-5 text-amber-600">
                                            You cannot demote or delete your own account from the admin console.
                                        </p>
                                    </div>
                                )}

                                <div className="grid gap-3 sm:grid-cols-2">
                                    {allowedRoles.map((role) => {
                                        const selected = selectedRole === role.value;
                                        const disabled = updating || isCurrentUser;

                                        return (
                                            <label key={role.value} className={`relative flex min-h-32 items-start gap-3 rounded-xl border p-4 transition ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"} ${selected ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100" : "border-slate-200 bg-white hover:border-blue-300"}`}>
                                                <input type="radio" name="role" value={role.value} checked={selected} onChange={(event) => setSelectedRole(event.target.value)} disabled={disabled} className="mt-1 h-4 w-4 shrink-0 accent-blue-600" />

                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        {role.value === "admin" ? (
                                                            <ShieldCheck size={17} className="text-violet-600" />
                                                        ) : (
                                                            <UserRound size={17} className="text-blue-600" />
                                                        )}

                                                        <p className="text-sm font-extrabold text-[#071a4a]">
                                                            {role.label}
                                                        </p>
                                                    </div>

                                                    <p className="mt-2 text-[10px] leading-5 text-slate-500">
                                                        {role.description}
                                                    </p>
                                                </div>
                                            </label>
                                        );
                                    })}
                                </div>

                                <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                                    <button type="button" onClick={resetRole} disabled={updating || !roleChanged || isCurrentUser} className="flex h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">
                                        Reset
                                    </button>

                                    <button type="button" onClick={updateUserRole} disabled={updating || !roleChanged || isCurrentUser} className="flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400">
                                        {updating ? (
                                            <>
                                                <LoaderCircle size={16} className="animate-spin" />
                                                Updating...
                                            </>
                                        ) : (
                                            <>
                                                <Save size={16} />
                                                Update Role
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </section>

                        <section className="rounded-2xl border border-red-200 bg-red-50 p-5 shadow-sm">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-xs font-extrabold text-red-700">
                                        Delete User
                                    </p>

                                    <p className="mt-1 text-[10px] leading-5 text-red-600 sm:text-xs">
                                        Permanently remove this account and its uploaded profile image.
                                    </p>
                                </div>

                                <button type="button" onClick={openDeleteModal} disabled={deleting || isCurrentUser} className="flex h-10 w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-xs font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-400 sm:w-auto">
                                    <Trash2 size={15} />
                                    {isCurrentUser ? "Protected Account" : "Delete User"}
                                </button>
                            </div>
                        </section>
                    </div>
                </div>
            </main>

            <DeleteConfirmationModal open={showDeleteModal} title="Delete User?" description="This will permanently remove the user account and its uploaded profile image." itemName={fullName} confirmText="Delete User" loading={deleting} onCancel={closeDeleteModal} onConfirm={deleteUserAccount} />
        </div>
    );
};

const UserAvatar = ({ user, fullName }) => {
    const initials = `${user.firstname?.charAt(0) || ""}${user.lastname?.charAt(0) || ""}` || "U";

    return (
        <div className="mx-auto flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border-4 border-white/20 bg-white text-2xl font-extrabold uppercase text-[#102a63] shadow-xl">
            {user.profileimage?.url ? (
                <img src={user.profileimage.url} alt={fullName} className="h-full w-full object-cover" />
            ) : (
                initials
            )}
        </div>
    );
};

const InformationRow = ({ icon: Icon, label, value }) => {
    return (
        <div className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
                <Icon size={15} />
            </div>

            <div className="min-w-0">
                <p className="text-[8px] font-extrabold uppercase tracking-[0.1em] text-slate-400">
                    {label}
                </p>

                <p className="mt-0.5 truncate text-[10px] font-bold text-[#071a4a]">
                    {value || "Not available"}
                </p>
            </div>
        </div>
    );
};

const RoleBadge = ({ role }) => {
    const userIsAdmin = role === "admin";

    return (
        <span className={`inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-[9px] font-extrabold uppercase tracking-[0.1em] ${userIsAdmin ? "bg-violet-100 text-violet-700" : "bg-blue-100 text-blue-700"}`}>
            {userIsAdmin ? <ShieldCheck size={14} /> : <UserRound size={14} />}
            {userIsAdmin ? "Administrator" : "Regular User"}
        </span>
    );
};

const UserLoading = () => {
    return (
        <main className="mx-auto w-full max-w-[1100px] px-3 py-7 sm:px-6 lg:px-8">
            <div className="animate-pulse">
                <div className="h-5 w-44 rounded bg-slate-200" />
                <div className="mt-5 h-28 rounded-2xl bg-white" />

                <div className="mt-5 grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
                    <div className="h-[480px] rounded-2xl bg-white" />
                    <div className="h-[480px] rounded-2xl bg-white" />
                </div>
            </div>
        </main>
    );
};

const UserError = ({ message, retry }) => {
    return (
        <main className="mx-auto flex min-h-[calc(100vh-80px)] w-full max-w-[900px] items-center justify-center px-4 py-10">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-sm">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500">
                    <CircleAlert size={23} />
                </div>

                <h1 className="mt-4 text-lg font-extrabold text-[#071a4a]">
                    User could not be opened
                </h1>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                    {message}
                </p>

                <button type="button" onClick={retry} className="mt-5 rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-blue-700">
                    Try Again
                </button>
            </div>
        </main>
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

export default ManageUserPage;