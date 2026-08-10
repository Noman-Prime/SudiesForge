"use client";

import { useUser } from "@/context/userContext";
import axios from "axios";
import Link from "next/link";
import {
    ArrowLeft,
    BookOpen,
    CalendarDays,
    ChevronDown,
    ExternalLink,
    GraduationCap,
    ImagePlus,
    Pencil,
    Save,
    Settings2,
    Trash2,
    X,
} from "lucide-react";
import {
    useParams,
    useRouter,
} from "next/navigation";
import {
    useEffect,
    useState,
} from "react";
import { toast } from "react-toastify";

const Subject = () => {
    const { id } = useParams();
    const navigate = useRouter();
    const { user } = useUser();

    const [subject, setSubject] = useState(null);
    const [name, setName] = useState("");
    const [editing, setEditing] = useState(false);
    const [showUserMenu, setShowUserMenu] =
        useState(false);

    const accountName = user
        ? `${user.firstname || ""} ${user.lastname || ""}`.trim() ||
        "Administrator"
        : "Administrator";

    const getSubject = async () => {
        try {
            const result = await axios.get(
                `/api/subject/${id}`,
                {
                    withCredentials: true,
                },
            );

            if (result.data.success) {
                setSubject(result.data.subject);
                setName(result.data.subject.name);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const updateSubject = async () => {
        if (!name.trim()) {
            toast.error("Subject name is required");
            return;
        }

        try {
            const eventId =
                typeof subject.event === "object"
                    ? subject.event._id
                    : subject.event;

            const result = await axios.put(
                `/api/subject/${id}`,
                {
                    event: eventId,
                    name: name.trim(),
                },
                {
                    withCredentials: true,
                },
            );

            if (result.data.success) {
                setSubject((previous) => ({
                    ...result.data.subject,
                    event: previous.event,
                }));

                setName(result.data.subject.name);
                setEditing(false);
                toast.success("Subject is updated");
            }
        } catch (error) {
            console.log(error);

            toast.error(
                error.response?.data?.message ||
                "Subject could not be updated",
            );
        }
    };

    const updateImage = async (e) => {
        const file = e.target.files?.[0];

        if (!file) {
            return;
        }

        try {
            const result = await axios.put(
                `/api/subject/${id}/image`,
                file,
                {
                    headers: {
                        "Content-Type": file.type,
                    },
                    withCredentials: true,
                },
            );

            if (result.data.success) {
                setSubject((previous) => ({
                    ...result.data.subject,
                    event: previous.event,
                }));

                toast.success("Subject image is updated");
            }
        } catch (error) {
            console.log(error);

            toast.error(
                error.response?.data?.message ||
                "Subject image could not be updated",
            );
        }

        e.target.value = "";
    };

    const deleteSubject = async () => {
        const confirmed = window.confirm(
            `Are you sure you want to delete ${subject.name}?`,
        );

        if (!confirmed) {
            return;
        }

        try {
            const result = await axios.delete(
                `/api/subject/${id}`,
                {
                    withCredentials: true,
                },
            );

            if (result.data.success) {
                toast.success("Subject is deleted");
                navigate.push("/admin/subjects");
            }
        } catch (error) {
            console.log(error);

            toast.error(
                error.response?.data?.message ||
                "Subject could not be deleted",
            );
        }
    };

    const cancelUpdate = () => {
        setName(subject.name);
        setEditing(false);
    };

    const formatDate = (date) => {
        if (!date) {
            return "Not available";
        }

        return new Intl.DateTimeFormat("en-PK", {
            day: "numeric",
            month: "short",
            year: "numeric",
        }).format(new Date(date));
    };

    useEffect(() => {
        if (id) {
            getSubject();
        }
    }, [id]);

    const eventName =
        typeof subject?.event === "object"
            ? subject.event?.name
            : "Connected Event";

    return (
        <div className="min-h-screen bg-[#f5f7fb]">
            <header className="sticky top-0 z-50 bg-[#102a63] px-3 py-2 text-white shadow-sm sm:px-6">
                <div className="mx-auto flex h-14 w-full max-w-[1500px] items-center gap-2 sm:h-16 sm:gap-4">
                    <Link
                        href="/admin"
                        className="flex min-w-0 max-w-[48%] items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-2.5 py-2 text-white shadow-sm backdrop-blur-xl transition hover:bg-white/15 sm:max-w-none sm:gap-3 sm:px-4"
                    >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[#102a63] sm:h-10 sm:w-10">
                            <GraduationCap size={22} />
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

                    <div className="relative ml-auto min-w-0 max-w-[52%] sm:max-w-none">
                        <button
                            type="button"
                            aria-label="Open admin account menu"
                            aria-haspopup="menu"
                            aria-expanded={showUserMenu}
                            onClick={() =>
                                setShowUserMenu((previous) => !previous)
                            }
                            className="flex w-full min-w-0 items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-2.5 py-2 text-left text-white shadow-sm backdrop-blur-xl transition hover:bg-white/15 sm:gap-3 sm:px-4"
                        >
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white text-xs font-bold uppercase text-[#102a63] sm:h-10 sm:w-10 sm:text-sm">
                                {user?.profileimage?.url ? (
                                    <img
                                        src={user.profileimage.url}
                                        alt={accountName}
                                        className="h-full w-full rounded-full object-cover"
                                    />
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

                            <ChevronDown
                                size={15}
                                className={`shrink-0 text-blue-200 transition-transform duration-200 ${showUserMenu ? "rotate-180" : ""
                                    }`}
                            />
                        </button>

                        {showUserMenu && (
                            <div
                                role="menu"
                                className="absolute right-0 top-full z-50 w-52 pt-2 sm:w-56"
                            >
                                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-2 text-slate-800 shadow-xl">
                                    <Link
                                        href="/"
                                        role="menuitem"
                                        onClick={() => setShowUserMenu(false)}
                                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition hover:bg-blue-50 hover:text-blue-700"
                                    >
                                        <ExternalLink size={17} />
                                        View Website
                                    </Link>

                                    <Link
                                        href="/admin/settings"
                                        role="menuitem"
                                        onClick={() => setShowUserMenu(false)}
                                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition hover:bg-blue-50 hover:text-blue-700"
                                    >
                                        <Settings2 size={17} />
                                        Settings
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <main className="mx-auto w-full max-w-[1100px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
                <nav className="mb-5 flex items-center gap-2 text-xs sm:text-sm">
                    <Link
                        href="/admin/subjects"
                        className="flex items-center gap-1.5 font-semibold text-slate-500 transition hover:text-blue-700"
                    >
                        <ArrowLeft size={16} />
                        Subjects
                    </Link>

                    <span className="text-slate-300">/</span>

                    <span className="max-w-48 truncate font-semibold text-blue-700">
                        {subject?.name || "Manage Subject"}
                    </span>
                </nav>

                {subject && (
                    <>
                        <section className="mb-5 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-600">
                                    Subject management
                                </p>

                                <h1 className="mt-2 text-xl font-extrabold tracking-tight text-[#071a4a] sm:text-2xl">
                                    Manage {subject.name}
                                </h1>

                                <p className="mt-2 text-xs leading-5 text-slate-500 sm:text-sm">
                                    Update the Subject name, add or replace its
                                    image, or permanently delete it.
                                </p>
                            </div>

                            {!editing && (
                                <button
                                    type="button"
                                    onClick={() => setEditing(true)}
                                    className="flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 sm:w-auto"
                                >
                                    <Pencil size={16} />
                                    Update Subject
                                </button>
                            )}
                        </section>

                        <section className="grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:grid-cols-[0.85fr_1.15fr]">
                            <div className="border-b border-slate-200 bg-slate-50/70 p-4 sm:p-6 lg:border-b-0 lg:border-r">
                                <div className="mb-4">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-600">
                                        Subject image
                                    </p>

                                    <h2 className="mt-1 text-base font-extrabold text-[#071a4a]">
                                        Image and Appearance
                                    </h2>
                                </div>

                                <label
                                    htmlFor="subject-image"
                                    className="group relative block cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                                >
                                    <div className="h-64 sm:h-80 lg:h-96">
                                        {subject.image?.url ? (
                                            <img
                                                src={subject.image.url}
                                                alt={subject.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 px-6 text-center">
                                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">
                                                    <BookOpen size={30} />
                                                </div>

                                                <p className="mt-4 text-sm font-extrabold text-[#071a4a]">
                                                    No Subject Image
                                                </p>

                                                <p className="mt-1 text-[10px] leading-5 text-slate-500 sm:text-xs">
                                                    Click here to select and upload an image.
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="absolute inset-0 flex items-center justify-center bg-[#071a4a]/65 opacity-100 transition duration-200 sm:opacity-0 sm:group-hover:opacity-100">
                                        <div className="flex flex-col items-center text-center text-white">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-md">
                                                <ImagePlus size={24} />
                                            </div>

                                            <span className="mt-3 text-xs font-bold text-white">
                                                {subject.image?.url
                                                    ? "Replace Image"
                                                    : "Add Image"}
                                            </span>

                                            <span className="mt-1 text-[9px] text-blue-100">
                                                Select an image from your device
                                            </span>
                                        </div>
                                    </div>
                                </label>

                                <input
                                    id="subject-image"
                                    type="file"
                                    accept="image/*"
                                    onChange={updateImage}
                                    className="hidden"
                                />
                            </div>

                            <div className="p-5 sm:p-6 lg:p-8">
                                <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                        <BookOpen size={21} />
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-blue-600">
                                            Subject details
                                        </p>

                                        <h2 className="mt-1 truncate text-lg font-extrabold text-[#071a4a]">
                                            {subject.name}
                                        </h2>
                                    </div>
                                </div>

                                <div className="mt-6">
                                    {editing ? (
                                        <div>
                                            <label
                                                htmlFor="name"
                                                className="mb-2 block text-xs font-bold text-slate-700"
                                            >
                                                Subject name
                                            </label>

                                            <input
                                                id="name"
                                                type="text"
                                                value={name}
                                                onChange={(e) =>
                                                    setName(e.target.value)
                                                }
                                                onKeyDown={(e) =>
                                                    e.key === "Enter" &&
                                                    updateSubject()
                                                }
                                                autoComplete="off"
                                                className="h-12 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                                            />

                                            <p className="mt-2 text-[10px] leading-4 text-slate-500">
                                                Update only the Subject name. Its parent
                                                event will remain unchanged.
                                            </p>

                                            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                                <button
                                                    type="button"
                                                    onClick={cancelUpdate}
                                                    className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
                                                >
                                                    <X size={16} />
                                                    Cancel
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={updateSubject}
                                                    className="flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-xs font-bold text-white transition hover:bg-blue-700"
                                                >
                                                    <Save size={16} />
                                                    Save Changes
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                                <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
                                                    Subject name
                                                </p>

                                                <p className="mt-1 text-sm font-extrabold text-[#071a4a]">
                                                    {subject.name}
                                                </p>
                                            </div>

                                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                                <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
                                                    Parent event
                                                </p>

                                                <p className="mt-1 text-sm font-extrabold text-[#071a4a]">
                                                    {eventName}
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                                    <CalendarDays
                                                        size={17}
                                                        className="text-blue-600"
                                                    />

                                                    <p className="mt-2 text-[9px] font-bold uppercase tracking-[0.1em] text-slate-400">
                                                        Created
                                                    </p>

                                                    <p className="mt-1 text-xs font-bold text-[#071a4a]">
                                                        {formatDate(subject.createdAt)}
                                                    </p>
                                                </div>

                                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                                    <CalendarDays
                                                        size={17}
                                                        className="text-blue-600"
                                                    />

                                                    <p className="mt-2 text-[9px] font-bold uppercase tracking-[0.1em] text-slate-400">
                                                        Last updated
                                                    </p>

                                                    <p className="mt-1 text-xs font-bold text-[#071a4a]">
                                                        {formatDate(subject.updatedAt)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-7 border-t border-red-100 pt-5">
                                    <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                                        <p className="text-xs font-extrabold text-red-700">
                                            Delete Subject
                                        </p>

                                        <p className="mt-1 text-[10px] leading-5 text-red-600">
                                            This action permanently removes the Subject.
                                        </p>

                                        <button
                                            type="button"
                                            onClick={deleteSubject}
                                            className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-xs font-bold text-white transition hover:bg-red-700 sm:w-auto"
                                        >
                                            <Trash2 size={15} />
                                            Delete Subject
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </>
                )}
            </main>
        </div>
    );
};

export default Subject;