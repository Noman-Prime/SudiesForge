"use client";

import Footer from "@/app/components/footer";
import Navbar from "@/app/components/navbar";
import { EventProvider } from "@/context/EventContext";
import axios from "axios";
import Link from "next/link";
import {
    ArrowRight,
    BookOpenText,
    CircleAlert,
    Filter,
    GraduationCap,
    RefreshCw,
    Search,
    X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const cardStyles = [
    {
        card: "border-blue-300 shadow-md lg:border-slate-200 lg:shadow-sm lg:hover:border-blue-300 lg:hover:shadow-md",
        icon: "bg-blue-600 text-white lg:bg-blue-50 lg:text-blue-600 lg:group-hover:bg-blue-600 lg:group-hover:text-white",
        badge: "bg-blue-50 text-blue-700",
    },
    {
        card: "border-emerald-300 shadow-md lg:border-slate-200 lg:shadow-sm lg:hover:border-emerald-300 lg:hover:shadow-md",
        icon: "bg-emerald-600 text-white lg:bg-emerald-50 lg:text-emerald-600 lg:group-hover:bg-emerald-600 lg:group-hover:text-white",
        badge: "bg-emerald-50 text-emerald-700",
    },
    {
        card: "border-orange-300 shadow-md lg:border-slate-200 lg:shadow-sm lg:hover:border-orange-300 lg:hover:shadow-md",
        icon: "bg-orange-500 text-white lg:bg-orange-50 lg:text-orange-500 lg:group-hover:bg-orange-500 lg:group-hover:text-white",
        badge: "bg-orange-50 text-orange-700",
    },
    {
        card: "border-violet-300 shadow-md lg:border-slate-200 lg:shadow-sm lg:hover:border-violet-300 lg:hover:shadow-md",
        icon: "bg-violet-600 text-white lg:bg-violet-50 lg:text-violet-600 lg:group-hover:bg-violet-600 lg:group-hover:text-white",
        badge: "bg-violet-50 text-violet-700",
    },
];

const SubjectsPage = () => {
    const [subjects, setSubjects] = useState([]);
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState("all");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    const getSubjects = async () => {
        try {
            setLoading(true);
            setErrorMessage("");

            const [subjectsResult, eventsResult] = await Promise.allSettled([
                axios.get("/api/subject"),
                axios.get("/api/events"),
            ]);

            if (subjectsResult.status === "fulfilled" && subjectsResult.value.data?.success) {
                setSubjects(
                    subjectsResult.value.data.subjects ||
                    subjectsResult.value.data.subject ||
                    [],
                );
            } else {
                const subjectError = subjectsResult.status === "rejected"
                    ? subjectsResult.reason
                    : null;

                if (subjectError?.response?.status === 404) {
                    setSubjects([]);
                } else {
                    setSubjects([]);
                    setErrorMessage(
                        subjectError?.response?.data?.message ||
                        subjectsResult.value?.data?.message ||
                        "Subjects could not be loaded",
                    );
                }
            }

            if (eventsResult.status === "fulfilled" && eventsResult.value.data?.success) {
                setEvents(
                    eventsResult.value.data.event ||
                    eventsResult.value.data.events ||
                    [],
                );
            } else {
                setEvents([]);
            }
        } catch (error) {
            console.log(error);

            setSubjects([]);
            setEvents([]);
            setErrorMessage(error.response?.data?.message || "Subjects could not be loaded");
        } finally {
            setLoading(false);
        }
    };

    const eventOptions = useMemo(() => {
        const eventMap = new Map();

        events.forEach((event) => {
            if (event?._id) {
                eventMap.set(String(event._id), event.name || "Unnamed Event");
            }
        });

        subjects.forEach((subject) => {
            const eventId = getEventId(subject.event);
            const eventName = getEventName(subject.event, events);

            if (eventId && !eventMap.has(eventId)) {
                eventMap.set(eventId, eventName);
            }
        });

        return Array.from(eventMap.entries())
            .map(([value, label]) => ({
                value,
                label,
            }))
            .sort((first, second) => first.label.localeCompare(second.label));
    }, [events, subjects]);

    const filteredSubjects = useMemo(() => {
        const searchValue = search.trim().toLowerCase();

        return subjects
            .filter((subject) => {
                const eventId = getEventId(subject.event);
                const eventName = getEventName(subject.event, events);
                const subjectName = subject.name || "";

                const matchesEvent =
                    selectedEvent === "all" ||
                    eventId === selectedEvent;

                const matchesSearch =
                    !searchValue ||
                    subjectName.toLowerCase().includes(searchValue) ||
                    eventName.toLowerCase().includes(searchValue);

                return matchesEvent && matchesSearch;
            })
            .sort((first, second) =>
                String(first.name || "").localeCompare(String(second.name || "")),
            );
    }, [subjects, events, selectedEvent, search]);

    const filtersApplied = selectedEvent !== "all" || search.trim();

    const clearFilters = () => {
        setSelectedEvent("all");
        setSearch("");
    };

    useEffect(() => {
        getSubjects();
    }, []);

    return (
        <>
            <EventProvider>
                <Navbar />
            </EventProvider>

            <main className="min-h-screen bg-[#f7f9fc]">
                <section className="border-b border-slate-200 bg-white px-3 py-7 sm:px-6 sm:py-9 lg:px-8">
                    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                            <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-blue-600">
                                Learning collection
                            </p>

                            <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-[#071a4a] sm:text-3xl">
                                Explore Subjects
                            </h1>

                            <p className="mt-2 max-w-2xl text-xs leading-5 text-slate-500 sm:text-sm sm:leading-6">
                                Browse all available subjects or select an event to find the subjects created for its preparation.
                            </p>
                        </div>

                        {!loading && !errorMessage && (
                            <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
                                    <GraduationCap size={20} />
                                </div>

                                <div>
                                    <p className="text-lg font-extrabold text-[#071a4a]">
                                        {subjects.length}
                                    </p>

                                    <p className="text-[9px] font-bold text-slate-500">
                                        Available subjects
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                <section className="px-3 py-5 sm:px-6 sm:py-7 lg:px-8">
                    <div className="mx-auto w-full max-w-[1200px]">
                        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                            <div className="flex items-center gap-2">
                                <Filter size={16} className="text-blue-600" />

                                <h2 className="text-sm font-extrabold text-[#071a4a]">
                                    Find Subjects
                                </h2>
                            </div>

                            <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_240px_auto]">
                                <div className="relative">
                                    <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />

                                    <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search subjects or events" className="h-11 w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 text-xs text-[#071a4a] outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
                                </div>

                                <select value={selectedEvent} onChange={(event) => setSelectedEvent(event.target.value)} className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-600 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100">
                                    <option value="all">
                                        All events
                                    </option>

                                    {eventOptions.map((event) => (
                                        <option key={event.value} value={event.value}>
                                            {event.label}
                                        </option>
                                    ))}
                                </select>

                                <button type="button" onClick={clearFilters} disabled={!filtersApplied} className="flex h-11 items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">
                                    <X size={14} />
                                    Clear
                                </button>
                            </div>
                        </div>

                        <div className="mb-4 mt-6 flex items-end justify-between gap-4">
                            <div>
                                <h2 className="text-base font-extrabold text-[#071a4a] sm:text-lg">
                                    Available Subjects
                                </h2>

                                <p className="mt-1 text-[10px] text-slate-500 sm:text-xs">
                                    {filteredSubjects.length} {filteredSubjects.length === 1 ? "subject" : "subjects"} displayed
                                </p>
                            </div>

                            {!loading && filteredSubjects.length > 0 && (
                                <span className="flex h-9 min-w-9 items-center justify-center rounded-xl bg-blue-100 px-2.5 text-xs font-extrabold text-blue-700">
                                    {filteredSubjects.length}
                                </span>
                            )}
                        </div>

                        {loading ? (
                            <SubjectsLoading />
                        ) : errorMessage ? (
                            <SubjectsError message={errorMessage} retry={getSubjects} />
                        ) : subjects.length === 0 ? (
                            <SubjectsEmpty />
                        ) : filteredSubjects.length === 0 ? (
                            <NoFilteredSubjects clearFilters={clearFilters} />
                        ) : (
                            <div className="grid grid-cols-2 items-stretch gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
                                {filteredSubjects.map((subject, index) => (
                                    <SubjectCard key={subject._id} subject={subject} events={events} style={cardStyles[index % cardStyles.length]} />
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </main>

            <Footer />
        </>
    );
};

const SubjectCard = ({ subject, events, style }) => {
    const eventId = getEventId(subject.event);
    const eventName = getEventName(subject.event, events);
    const subjectName = subject.name || "Unnamed Subject";
    const subjectHref = eventId
        ? `/events/${eventId}/subjects/${subject._id}`
        : "#";

    return (
        <article className={`group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border bg-white transition duration-200 lg:hover:-translate-y-0.5 ${style.card}`}>
            <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                {subject.image?.url ? (
                    <img src={subject.image.url} alt={subjectName} className="h-full w-full object-cover transition duration-300 lg:group-hover:scale-105" />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
                        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl transition duration-200 lg:group-hover:scale-105 ${style.icon}`}>
                            <BookOpenText size={27} strokeWidth={1.8} />
                        </div>
                    </div>
                )}

                <span className={`absolute left-2.5 top-2.5 rounded-lg px-2.5 py-1 text-[7px] font-extrabold uppercase tracking-[0.1em] shadow-sm ${style.badge}`}>
                    Subject
                </span>
            </div>

            <div className="flex flex-1 flex-col p-3 sm:p-4">
                <p className="truncate text-[8px] font-extrabold uppercase tracking-[0.12em] text-blue-600 sm:text-[9px]">
                    {eventName}
                </p>

                <h3 className="mt-1.5 line-clamp-2 text-xs font-extrabold leading-5 text-[#071a4a] sm:text-sm">
                    {subjectName}
                </h3>

                <p className="mt-1.5 line-clamp-2 text-[9px] leading-4 text-slate-500 sm:text-[10px]">
                    Explore chapters, topics and available learning material.
                </p>

                <div className="mt-auto pt-4">
                    {eventId ? (
                        <Link href={subjectHref} aria-label={`Explore ${subjectName}`} className="flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-2 text-[8px] font-bold text-white shadow-md transition active:scale-[0.98] lg:shadow-sm lg:hover:bg-blue-700 lg:hover:shadow-md sm:h-10 sm:text-[9px]">
                            <span className="truncate">
                                Explore Subject
                            </span>

                            <ArrowRight size={13} className="shrink-0" />
                        </Link>
                    ) : (
                        <button type="button" disabled className="flex h-9 w-full cursor-not-allowed items-center justify-center rounded-lg bg-slate-200 px-2 text-[8px] font-bold text-slate-500 sm:h-10 sm:text-[9px]">
                            Event unavailable
                        </button>
                    )}
                </div>
            </div>
        </article>
    );
};

const SubjectsLoading = () => {
    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                <div key={item} className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    <div className="aspect-[16/10] bg-slate-200" />

                    <div className="p-3 sm:p-4">
                        <div className="h-2.5 w-20 rounded bg-slate-100" />
                        <div className="mt-3 h-4 w-3/4 rounded bg-slate-200" />
                        <div className="mt-2 h-3 w-full rounded bg-slate-100" />
                        <div className="mt-5 h-9 rounded-lg bg-slate-200 sm:h-10" />
                    </div>
                </div>
            ))}
        </div>
    );
};

const SubjectsError = ({ message, retry }) => {
    return (
        <div className="rounded-2xl border border-red-200 bg-white px-4 py-12 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500">
                <CircleAlert size={23} />
            </div>

            <h3 className="mt-4 text-base font-extrabold text-[#071a4a]">
                Subjects could not be loaded
            </h3>

            <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-slate-500">
                {message}
            </p>

            <button type="button" onClick={retry} className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-xs font-bold text-white transition hover:bg-blue-700">
                <RefreshCw size={15} />
                Try Again
            </button>
        </div>
    );
};

const SubjectsEmpty = () => {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-12 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <BookOpenText size={23} />
            </div>

            <h3 className="mt-4 text-base font-extrabold text-[#071a4a]">
                No subjects are available
            </h3>

            <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-slate-500">
                Subjects will appear here when they are added to an event.
            </p>
        </div>
    );
};

const NoFilteredSubjects = ({ clearFilters }) => {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-12 text-center shadow-sm">
            <Search size={28} className="mx-auto text-slate-300" />

            <h3 className="mt-3 text-sm font-extrabold text-[#071a4a]">
                No subjects match your filters
            </h3>

            <p className="mt-1.5 text-xs text-slate-500">
                Try another event or clear the current search.
            </p>

            <button type="button" onClick={clearFilters} className="mt-4 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-blue-700">
                Clear Filters
            </button>
        </div>
    );
};

const getEventId = (event) => {
    if (!event) {
        return "";
    }

    return String(
        typeof event === "object"
            ? event._id || ""
            : event,
    );
};

const getEventName = (event, events) => {
    if (!event) {
        return "Unknown Event";
    }

    if (typeof event === "object" && event.name) {
        return event.name;
    }

    const eventId = getEventId(event);

    return events.find((item) => String(item._id) === eventId)?.name || "Event";
};

export default SubjectsPage;