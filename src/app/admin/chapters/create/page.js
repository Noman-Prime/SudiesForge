"use client";

import { useUser } from "@/context/userContext";
import axios from "axios";
import Link from "next/link";
import {
    ArrowLeft,
    BookOpen,
    BookOpenText,
    CalendarDays,
    ChevronDown,
    ExternalLink,
    GraduationCap,
    Plus,
    Settings2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const toastOptions = {
    autoClose: 3000,
    pauseOnHover: false,
    pauseOnFocusLoss: false,
    closeOnClick: true,
};

const Create = () => {
    const navigate = useRouter();
    const { user } = useUser();

    const [events, setEvents] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loadingEvents, setLoadingEvents] = useState(true);
    const [loadingSubjects, setLoadingSubjects] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [data, setData] = useState({
        event: "",
        subject: "",
        chapterNumber: "",
        chapterName: "",
    });

    const accountName = user
        ? `${user.firstname || ""} ${user.lastname || ""}`.trim() ||
        "Administrator"
        : "Administrator";

    const updateData = (e) => {
        const { name, value } = e.target;

        if (name === "event") {
            setData((previous) => ({
                ...previous,
                event: value,
                subject: "",
            }));

            setSubjects([]);

            if (value) {
                getSubjects(value);
            }

            return;
        }

        setData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const getEvents = async () => {
        try {
            setLoadingEvents(true);

            const result = await axios.get("/api/events", {
                withCredentials: true,
            });

            if (result.data.success) {
                setEvents(result.data.event || []);
            }
        } catch (error) {
            if (error.response?.status === 404) {
                setEvents([]);
                return;
            }

            console.log(error);
            toast.dismiss();
            toast.error(
                error.response?.data?.message ||
                "Events could not be loaded",
                toastOptions,
            );
        } finally {
            setLoadingEvents(false);
        }
    };

    const getSubjects = async (eventId) => {
        try {
            setLoadingSubjects(true);

            const result = await axios.get(
                `/api/events/${eventId}/subjects`,
                { withCredentials: true },
            );

            if (result.data.success) {
                setSubjects(result.data.subjects || []);
            }
        } catch (error) {
            if (error.response?.status === 404) {
                setSubjects([]);
                return;
            }

            console.log(error);
            toast.dismiss();
            toast.error(
                error.response?.data?.message ||
                "Subjects could not be loaded",
                toastOptions,
            );
        } finally {
            setLoadingSubjects(false);
        }
    };

    const sendData = async (e) => {
        e.preventDefault();

        if (isSubmitting) return;

        setIsSubmitting(true);

        try {
            const result = await axios.post(
                "/api/chapter",
                {
                    subject: data.subject,
                    chapterNumber: Number(data.chapterNumber),
                    chapterName: data.chapterName,
                },
                { withCredentials: true },
            );

            if (!result.data?.success) {
                toast.dismiss();
                toast.error(
                    result.data?.message ||
                    "Chapter could not be created",
                    toastOptions,
                );
                return;
            }

            setData({
                event: "",
                subject: "",
                chapterNumber: "",
                chapterName: "",
            });

            toast.dismiss();
            toast.success("Chapter is created", toastOptions);
            navigate.push("/admin/chapters");
        } catch (error) {
            console.log(error);
            toast.dismiss();
            toast.error(
                error.response?.data?.message ||
                error.message ||
                "Chapter could not be created",
                toastOptions,
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        getEvents();
    }, []);

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
                        href="/admin/chapters"
                        className="flex items-center gap-1.5 font-semibold text-slate-500 transition hover:text-blue-700"
                    >
                        <ArrowLeft size={16} />
                        Chapters
                    </Link>
                    <span className="text-slate-300">/</span>
                    <span className="font-semibold text-blue-700">
                        Create Chapter
                    </span>
                </nav>

                <section className="grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md md:grid-cols-[0.85fr_1.15fr]">
                    <aside className="flex flex-col justify-between bg-gradient-to-br from-[#102a63] to-blue-700 px-6 py-7 text-white sm:px-8 md:px-9 md:py-10">
                        <div>
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white">
                                <BookOpenText size={23} />
                            </div>

                            <p className="mt-7 text-[10px] font-bold uppercase tracking-[0.16em] text-blue-200">
                                Chapter management
                            </p>

                            <h1 className="mt-2 text-xl font-extrabold leading-7 text-white sm:text-2xl">
                                Add a Chapter to a Subject
                            </h1>

                            <p className="mt-3 text-xs leading-5 text-blue-100 sm:text-sm sm:leading-6">
                                First select an educational event, then
                                choose one of its subjects and add the
                                chapter details from the official material.
                            </p>

                            <div className="mt-7 space-y-3">
                                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/10 p-3">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-blue-700">
                                        <CalendarDays size={18} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-white">
                                            Select Parent Event
                                        </p>
                                        <p className="mt-0.5 text-[10px] text-blue-200">
                                            MDCAT, PPSC or another event
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/10 p-3">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-blue-700">
                                        <BookOpen size={18} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-white">
                                            Select Parent Subject
                                        </p>
                                        <p className="mt-0.5 text-[10px] text-blue-200">
                                            Only related subjects will appear
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <p className="mt-8 text-[10px] leading-5 text-blue-200">
                            The Chapter will automatically become available
                            under the selected Event and Subject.
                        </p>
                    </aside>

                    <section className="flex items-center px-6 py-8 sm:px-8 md:px-10 md:py-10">
                        <form className="w-full" onSubmit={sendData}>
                            <div className="mb-7">
                                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-600">
                                    New chapter
                                </p>
                                <h2 className="mt-2 text-xl font-extrabold text-[#071a4a] sm:text-2xl">
                                    Chapter Information
                                </h2>
                                <p className="mt-2 text-xs leading-5 text-slate-500 sm:text-sm">
                                    Select an event, choose its subject and enter the chapter information.
                                </p>
                            </div>

                            <div className="space-y-5">
                                <div>
                                    <label
                                        htmlFor="event"
                                        className="mb-2 block text-xs font-bold text-slate-700"
                                    >
                                        Parent event
                                    </label>

                                    <select
                                        id="event"
                                        name="event"
                                        value={data.event}
                                        onChange={updateData}
                                        required
                                        disabled={loadingEvents || isSubmitting}
                                        className="h-12 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                                    >
                                        <option value="">
                                            {loadingEvents
                                                ? "Loading events..."
                                                : "Select an event"}
                                        </option>

                                        {events.map((item) => (
                                            <option key={item._id} value={item._id}>
                                                {item.name}
                                            </option>
                                        ))}
                                    </select>

                                    <p className="mt-2 text-[10px] leading-4 text-slate-500">
                                        Select the event that contains the required subject.
                                    </p>
                                </div>

                                <div>
                                    <label
                                        htmlFor="subject"
                                        className="mb-2 block text-xs font-bold text-slate-700"
                                    >
                                        Parent subject
                                    </label>

                                    <select
                                        id="subject"
                                        name="subject"
                                        value={data.subject}
                                        onChange={updateData}
                                        required
                                        disabled={
                                            !data.event ||
                                            loadingSubjects ||
                                            isSubmitting
                                        }
                                        className="h-12 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                                    >
                                        <option value="">
                                            {!data.event
                                                ? "Select an event first"
                                                : loadingSubjects
                                                    ? "Loading subjects..."
                                                    : subjects.length === 0
                                                        ? "No subjects found"
                                                        : "Select a subject"}
                                        </option>

                                        {subjects.map((item) => (
                                            <option key={item._id} value={item._id}>
                                                {item.name}
                                            </option>
                                        ))}
                                    </select>

                                    <p className="mt-2 text-[10px] leading-4 text-slate-500">
                                        Only subjects belonging to the selected Event are shown.
                                    </p>
                                </div>

                                <div className="grid gap-5 sm:grid-cols-[0.42fr_1fr]">
                                    <div>
                                        <label
                                            htmlFor="chapterNumber"
                                            className="mb-2 block text-xs font-bold text-slate-700"
                                        >
                                            Chapter number
                                        </label>
                                        <input
                                            id="chapterNumber"
                                            type="number"
                                            name="chapterNumber"
                                            value={data.chapterNumber}
                                            onChange={updateData}
                                            placeholder="For example: 1"
                                            required
                                            disabled={isSubmitting}
                                            className="h-12 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                                        />
                                        <p className="mt-2 text-[10px] leading-4 text-slate-500">
                                            Use the official number.
                                        </p>
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="chapterName"
                                            className="mb-2 block text-xs font-bold text-slate-700"
                                        >
                                            Chapter name
                                        </label>
                                        <input
                                            id="chapterName"
                                            type="text"
                                            name="chapterName"
                                            value={data.chapterName}
                                            onChange={updateData}
                                            placeholder="Enter chapter name"
                                            autoComplete="off"
                                            required
                                            disabled={isSubmitting}
                                            className="h-12 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                                        />
                                        <p className="mt-2 text-[10px] leading-4 text-slate-500">
                                            Enter the name used in the book.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                                <Link
                                    href="/admin/chapters"
                                    className="flex h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
                                >
                                    Cancel
                                </Link>

                                <button
                                    type="submit"
                                    disabled={
                                        isSubmitting ||
                                        loadingEvents ||
                                        loadingSubjects ||
                                        !data.event ||
                                        !data.subject ||
                                        subjects.length === 0
                                    }
                                    className="flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <Plus size={17} />
                                    {isSubmitting
                                        ? "Creating Chapter..."
                                        : "Create Chapter"}
                                </button>
                            </div>
                        </form>
                    </section>
                </section>
            </main>
        </div>
    );
};

export default Create;