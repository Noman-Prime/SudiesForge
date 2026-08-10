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
    LibraryBig,
    Plus,
    Settings2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const Create = () => {
    const navigate = useRouter();
    const { user } = useUser();

    const [events, setEvents] = useState([]);
    const [showUserMenu, setShowUserMenu] =
        useState(false);

    const [data, setData] = useState({
        event: "",
        name: "",
    });

    const accountName = user
        ? `${user.firstname || ""} ${user.lastname || ""}`.trim() ||
        "Administrator"
        : "Administrator";

    const updateData = (e) => {
        setData((previous) => ({
            ...previous,
            [e.target.name]: e.target.value,
        }));
    };

    const getEvents = async () => {
        try {
            const result = await axios.get("/api/events", {
                withCredentials: true,
            });

            if (result.data.success) {
                setEvents(result.data.event || []);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const sendData = async () => {
        if (!data.event) {
            toast.error("Please select an event");
            return;
        }

        if (!data.name.trim()) {
            toast.error("Subject name is required");
            return;
        }

        try {
            const result = await axios.post(
                "/api/subject",
                {
                    event: data.event,
                    name: data.name.trim(),
                },
                {
                    withCredentials: true,
                },
            );

            if (result.data.success) {
                toast.success("Subject is created");

                setData({
                    event: "",
                    name: "",
                });

                navigate.push("/admin/subjects");
            }
        } catch (error) {
            console.log(error);

            toast.error(
                error.response?.data?.message ||
                "Subject could not be created",
            );
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
                        href="/admin/subjects"
                        className="flex items-center gap-1.5 font-semibold text-slate-500 transition hover:text-blue-700"
                    >
                        <ArrowLeft size={16} />
                        Subjects
                    </Link>

                    <span className="text-slate-300">/</span>

                    <span className="font-semibold text-blue-700">
                        Create Subject
                    </span>
                </nav>

                <section className="grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md md:grid-cols-[0.85fr_1.15fr]">
                    <aside className="flex flex-col justify-between bg-gradient-to-br from-[#102a63] to-blue-700 px-6 py-7 text-white sm:px-8 md:px-9 md:py-10">
                        <div>
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white">
                                <BookOpen size={23} />
                            </div>

                            <p className="mt-7 text-[10px] font-bold uppercase tracking-[0.16em] text-blue-200">
                                Subject management
                            </p>

                            <h1 className="mt-2 text-xl font-extrabold leading-7 text-white sm:text-2xl">
                                Add a Subject to an Event
                            </h1>

                            <p className="mt-3 text-xs leading-5 text-blue-100 sm:text-sm sm:leading-6">
                                Create an organized subject under the correct
                                educational event. Images and learning material
                                can be added later from the Manage Subject page.
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
                                            MDCAT, PPSC, PMS or another event
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/10 p-3">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-blue-700">
                                        <LibraryBig size={18} />
                                    </div>

                                    <div>
                                        <p className="text-xs font-bold text-white">
                                            Add Material Later
                                        </p>

                                        <p className="mt-0.5 text-[10px] text-blue-200">
                                            Add image, chapters and resources
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <p className="mt-8 text-[10px] leading-5 text-blue-200">
                            The Subject will automatically become available
                            under its selected educational event.
                        </p>
                    </aside>

                    <section className="flex items-center px-6 py-8 sm:px-8 md:px-10 md:py-10">
                        <div className="w-full">
                            <div className="mb-7">
                                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-600">
                                    New subject
                                </p>

                                <h2 className="mt-2 text-xl font-extrabold text-[#071a4a] sm:text-2xl">
                                    Subject Information
                                </h2>

                                <p className="mt-2 text-xs leading-5 text-slate-500 sm:text-sm">
                                    Select an event and enter the new subject name.
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
                                        className="h-12 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                                    >
                                        <option value="">
                                            Select an event
                                        </option>

                                        {events.map((item) => (
                                            <option
                                                key={item._id}
                                                value={item._id}
                                            >
                                                {item.name}
                                            </option>
                                        ))}
                                    </select>

                                    <p className="mt-2 text-[10px] leading-4 text-slate-500">
                                        This determines where the Subject will appear.
                                    </p>
                                </div>

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
                                        name="name"
                                        value={data.name}
                                        onChange={updateData}
                                        onKeyDown={(e) =>
                                            e.key === "Enter" && sendData()
                                        }
                                        placeholder="For example: Biology"
                                        autoComplete="off"
                                        className="h-12 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                                    />

                                    <p className="mt-2 text-[10px] leading-4 text-slate-500">
                                        Use a short and recognizable subject name.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                                <Link
                                    href="/admin/subjects"
                                    className="flex h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
                                >
                                    Cancel
                                </Link>

                                <button
                                    type="button"
                                    onClick={sendData}
                                    className="flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md"
                                >
                                    <Plus size={17} />
                                    Create Subject
                                </button>
                            </div>
                        </div>
                    </section>
                </section>
            </main>
        </div>
    );
};

export default Create;