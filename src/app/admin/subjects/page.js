"use client";

import { useUser } from "@/context/userContext";
import axios from "axios";
import Link from "next/link";
import {
    ArrowLeft,
    BookOpen,
    ChevronDown,
    ExternalLink,
    Filter,
    GraduationCap,
    Plus,
    Settings2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const Subjects = () => {
    const navigate = useRouter();
    const { user } = useUser();

    const [subjects, setSubjects] = useState([]);
    const [selectedEvent, setSelectedEvent] =
        useState("all");
    const [showUserMenu, setShowUserMenu] =
        useState(false);

    const accountName = user
        ? `${user.firstname || ""} ${user.lastname || ""}`.trim() ||
        "Administrator"
        : "Administrator";

    const getSubjects = async () => {
        try {
            const result = await axios.get("/api/subject", {
                withCredentials: true,
            });

            if (result.data.success) {
                setSubjects(result.data.subjects || []);
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        getSubjects();
    }, []);

    const events = [
        ...new Map(
            subjects
                .filter(
                    (item) =>
                        item.event &&
                        typeof item.event === "object" &&
                        item.event._id,
                )
                .map((item) => [
                    item.event._id,
                    item.event,
                ]),
        ).values(),
    ];

    const filteredSubjects =
        selectedEvent === "all"
            ? subjects
            : subjects.filter((item) => {
                const eventId =
                    typeof item.event === "object"
                        ? item.event?._id
                        : item.event;

                return String(eventId) === selectedEvent;
            });

    const selectedEventName =
        selectedEvent === "all"
            ? "All Subjects"
            : events.find(
                (item) =>
                    String(item._id) === selectedEvent,
            )?.name || "Subjects";

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

            <main className="mx-auto w-full max-w-[1500px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
                <nav className="mb-5 flex items-center gap-2 text-xs sm:text-sm">
                    <Link
                        href="/admin"
                        className="flex items-center gap-1.5 font-semibold text-slate-500 transition hover:text-blue-700"
                    >
                        <ArrowLeft size={16} />
                        Dashboard
                    </Link>

                    <span className="text-slate-300">/</span>

                    <span className="font-semibold text-blue-700">
                        Subjects
                    </span>
                </nav>

                <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-600">
                            Website material
                        </p>

                        <h1 className="mt-2 text-xl font-extrabold tracking-tight text-[#071a4a] sm:text-2xl">
                            Subjects Management
                        </h1>

                        <p className="mt-2 max-w-2xl text-xs leading-5 text-slate-500 sm:text-sm sm:leading-6">
                            Create and manage the subjects connected to your
                            educational events.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            navigate.push("/admin/subjects/create")
                        }
                        className="flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md sm:w-auto"
                    >
                        <Plus size={17} />
                        Create Subject
                    </button>
                </section>

                <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-4 border-b border-slate-200 px-4 py-4 sm:flex-row sm:items-end sm:justify-between sm:px-6">
                        <div>
                            <h2 className="text-base font-extrabold text-[#071a4a]">
                                {selectedEventName}
                            </h2>

                            <p className="mt-1 text-[10px] text-slate-500 sm:text-xs">
                                {selectedEvent === "all"
                                    ? "Subjects from every educational event."
                                    : `Subjects connected to ${selectedEventName}.`}
                            </p>
                        </div>

                        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                            <label
                                htmlFor="event-filter"
                                className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500"
                            >
                                <Filter size={14} />
                                Filter by event
                            </label>

                            <select
                                id="event-filter"
                                value={selectedEvent}
                                onChange={(e) =>
                                    setSelectedEvent(e.target.value)
                                }
                                className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-xs font-bold text-slate-700 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100 sm:min-w-48"
                            >
                                <option value="all">
                                    All Events
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

                            <div className="flex h-10 min-w-10 items-center justify-center rounded-xl bg-blue-50 px-3 text-xs font-extrabold text-blue-700">
                                {filteredSubjects.length}
                            </div>
                        </div>
                    </div>

                    {filteredSubjects.length > 0 ? (
                        <div className="grid grid-cols-2 gap-3 bg-slate-50/70 p-3 sm:grid-cols-3 sm:gap-4 sm:p-5 lg:grid-cols-4 xl:grid-cols-5">
                            {filteredSubjects.map((item) => (
                                <article
                                    key={item._id}
                                    className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                                >
                                    <div className="relative h-28 overflow-hidden bg-gradient-to-br from-blue-50 to-slate-100 sm:h-36">
                                        {item.image?.url ? (
                                            <img
                                                src={item.image.url}
                                                alt={item.name}
                                                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">
                                                    <BookOpen size={24} />
                                                </div>
                                            </div>
                                        )}

                                        <div className="absolute left-2.5 top-2.5 max-w-[calc(100%-20px)] rounded-lg bg-[#102a63]/90 px-2 py-1 text-[9px] font-bold text-white shadow-sm backdrop-blur-sm sm:text-[10px]">
                                            <span className="block truncate">
                                                {item.event?.name || "No Event"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-1 flex-col p-3 sm:p-4">
                                        <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-blue-600 sm:text-[10px]">
                                            Subject
                                        </p>

                                        <h3 className="mt-1 truncate text-sm font-extrabold text-[#071a4a] sm:text-base">
                                            {item.name}
                                        </h3>

                                        <p className="mt-1 truncate text-[9px] text-slate-500 sm:text-[11px]">
                                            {item.event?.name
                                                ? `Part of ${item.event.name}`
                                                : "Parent event unavailable"}
                                        </p>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                navigate.push(
                                                    `/admin/subjects/${item._id}`,
                                                )
                                            }
                                            className="mt-4 flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 text-[10px] font-bold text-white transition hover:bg-blue-700 sm:h-10 sm:text-xs"
                                        >
                                            <Settings2 size={14} />
                                            Manage Subject
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <div className="flex min-h-56 flex-col items-center justify-center bg-slate-50/70 px-5 py-10 text-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                                <BookOpen size={23} />
                            </div>

                            <h3 className="mt-4 text-sm font-extrabold text-[#071a4a]">
                                No Subjects Found
                            </h3>

                            <p className="mt-1 text-xs text-slate-500">
                                No Subjects are connected to the selected event.
                            </p>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

export default Subjects;