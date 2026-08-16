"use client";

import Footer from "@/app/components/footer";
import Navbar from "@/app/components/navbar";
import { EventProvider } from "@/context/EventContext";
import axios from "axios";
import Link from "next/link";
import {
    ArrowRight,
    BookOpen,
    CircleAlert,
    FileText,
    Filter,
    GraduationCap,
    Layers3,
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

const TopicsPage = () => {
    const [topics, setTopics] = useState([]);
    const [chapters, setChapters] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState("all");
    const [selectedSubject, setSelectedSubject] = useState("all");
    const [selectedChapter, setSelectedChapter] = useState("all");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    const getTopics = async () => {
        try {
            setLoading(true);
            setErrorMessage("");

            const [topicsResult, chaptersResult, subjectsResult, eventsResult] = await Promise.allSettled([
                axios.get("/api/topic"),
                axios.get("/api/chapter"),
                axios.get("/api/subject"),
                axios.get("/api/events"),
            ]);

            if (topicsResult.status === "fulfilled" && topicsResult.value.data?.success) {
                setTopics(
                    topicsResult.value.data.topics ||
                    topicsResult.value.data.topic ||
                    [],
                );
            } else {
                const topicError = topicsResult.status === "rejected"
                    ? topicsResult.reason
                    : null;

                if (topicError?.response?.status === 404) {
                    setTopics([]);
                } else {
                    setTopics([]);
                    setErrorMessage(
                        topicError?.response?.data?.message ||
                        topicsResult.value?.data?.message ||
                        "Topics could not be loaded",
                    );
                }
            }

            if (chaptersResult.status === "fulfilled" && chaptersResult.value.data?.success) {
                setChapters(
                    chaptersResult.value.data.chapters ||
                    chaptersResult.value.data.chapter ||
                    [],
                );
            } else {
                setChapters([]);
            }

            if (subjectsResult.status === "fulfilled" && subjectsResult.value.data?.success) {
                setSubjects(
                    subjectsResult.value.data.subjects ||
                    subjectsResult.value.data.subject ||
                    [],
                );
            } else {
                setSubjects([]);
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

            setTopics([]);
            setChapters([]);
            setSubjects([]);
            setEvents([]);
            setErrorMessage(error.response?.data?.message || "Topics could not be loaded");
        } finally {
            setLoading(false);
        }
    };

    const eventOptions = useMemo(() => {
        return events
            .filter((event) => event?._id)
            .map((event) => ({
                value: String(event._id),
                label: event.name || "Unnamed Event",
            }))
            .sort((first, second) => first.label.localeCompare(second.label));
    }, [events]);

    const subjectOptions = useMemo(() => {
        return subjects
            .filter((subject) => {
                const eventId = getEventId(subject.event);

                return (
                    selectedEvent === "all" ||
                    eventId === selectedEvent
                );
            })
            .map((subject) => ({
                value: String(subject._id),
                label: subject.name || "Unnamed Subject",
                eventId: getEventId(subject.event),
            }))
            .sort((first, second) => first.label.localeCompare(second.label));
    }, [subjects, selectedEvent]);

    const chapterOptions = useMemo(() => {
        return chapters
            .filter((chapter) => {
                const subject = getSubjectRecord(chapter.subject, subjects);
                const subjectId = subject?._id ? String(subject._id) : "";
                const eventId = getEventId(subject?.event);

                const matchesEvent =
                    selectedEvent === "all" ||
                    eventId === selectedEvent;

                const matchesSubject =
                    selectedSubject === "all" ||
                    subjectId === selectedSubject;

                return matchesEvent && matchesSubject;
            })
            .map((chapter) => ({
                value: String(chapter._id),
                label: `${chapter.chapterNumber ? `Chapter ${chapter.chapterNumber}: ` : ""}${chapter.chapterName || "Unnamed Chapter"}`,
            }))
            .sort((first, second) => first.label.localeCompare(second.label));
    }, [chapters, subjects, selectedEvent, selectedSubject]);

    const filteredTopics = useMemo(() => {
        const searchValue = search.trim().toLowerCase();

        return topics
            .filter((topic) => {
                const chapter = getChapterRecord(topic.chapter, chapters);
                const subject = getSubjectRecord(chapter?.subject, subjects);

                const chapterId = chapter?._id ? String(chapter._id) : "";
                const subjectId = subject?._id ? String(subject._id) : "";
                const eventId = getEventId(subject?.event);

                const topicName = topic.topicName || "";
                const chapterName = chapter?.chapterName || "";
                const subjectName = subject?.name || "";
                const eventName = getEventName(subject?.event, events);

                const matchesEvent =
                    selectedEvent === "all" ||
                    eventId === selectedEvent;

                const matchesSubject =
                    selectedSubject === "all" ||
                    subjectId === selectedSubject;

                const matchesChapter =
                    selectedChapter === "all" ||
                    chapterId === selectedChapter;

                const matchesSearch =
                    !searchValue ||
                    topicName.toLowerCase().includes(searchValue) ||
                    chapterName.toLowerCase().includes(searchValue) ||
                    subjectName.toLowerCase().includes(searchValue) ||
                    eventName.toLowerCase().includes(searchValue) ||
                    String(topic.topicNumber || "").includes(searchValue);

                return matchesEvent && matchesSubject && matchesChapter && matchesSearch;
            })
            .sort((first, second) => {
                const firstChapter = getChapterRecord(first.chapter, chapters);
                const secondChapter = getChapterRecord(second.chapter, chapters);

                const chapterComparison =
                    Number(firstChapter?.chapterNumber || 0) -
                    Number(secondChapter?.chapterNumber || 0);

                if (chapterComparison !== 0) {
                    return chapterComparison;
                }

                return Number(first.topicNumber || 0) - Number(second.topicNumber || 0);
            });
    }, [
        topics,
        chapters,
        subjects,
        events,
        selectedEvent,
        selectedSubject,
        selectedChapter,
        search,
    ]);

    const filtersApplied =
        selectedEvent !== "all" ||
        selectedSubject !== "all" ||
        selectedChapter !== "all" ||
        search.trim();

    const changeEvent = (eventId) => {
        setSelectedEvent(eventId);
        setSelectedSubject("all");
        setSelectedChapter("all");
    };

    const changeSubject = (subjectId) => {
        setSelectedSubject(subjectId);
        setSelectedChapter("all");
    };

    const clearFilters = () => {
        setSelectedEvent("all");
        setSelectedSubject("all");
        setSelectedChapter("all");
        setSearch("");
    };

    useEffect(() => {
        getTopics();
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
                                Study material
                            </p>

                            <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-[#071a4a] sm:text-3xl">
                                Explore Topics
                            </h1>

                            <p className="mt-2 max-w-2xl text-xs leading-5 text-slate-500 sm:text-sm sm:leading-6">
                                Browse all structured topic notes or filter them through events, subjects and chapters.
                            </p>
                        </div>

                        {!loading && !errorMessage && (
                            <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
                                    <FileText size={20} />
                                </div>

                                <div>
                                    <p className="text-lg font-extrabold text-[#071a4a]">
                                        {topics.length}
                                    </p>

                                    <p className="text-[9px] font-bold text-slate-500">
                                        Available topics
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
                                    Find Topics
                                </h2>
                            </div>

                            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(220px,1fr)_170px_190px_220px_auto]">
                                <div className="relative">
                                    <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />

                                    <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search topics or chapters" className="h-11 w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 text-xs text-[#071a4a] outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
                                </div>

                                <select value={selectedEvent} onChange={(event) => changeEvent(event.target.value)} className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-600 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100">
                                    <option value="all">
                                        All events
                                    </option>

                                    {eventOptions.map((event) => (
                                        <option key={event.value} value={event.value}>
                                            {event.label}
                                        </option>
                                    ))}
                                </select>

                                <select value={selectedSubject} onChange={(event) => changeSubject(event.target.value)} className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-600 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100">
                                    <option value="all">
                                        All subjects
                                    </option>

                                    {subjectOptions.map((subject) => (
                                        <option key={subject.value} value={subject.value}>
                                            {subject.label}
                                        </option>
                                    ))}
                                </select>

                                <select value={selectedChapter} onChange={(event) => setSelectedChapter(event.target.value)} className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-600 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100">
                                    <option value="all">
                                        All chapters
                                    </option>

                                    {chapterOptions.map((chapter) => (
                                        <option key={chapter.value} value={chapter.value}>
                                            {chapter.label}
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
                                    Available Topics
                                </h2>

                                <p className="mt-1 text-[10px] text-slate-500 sm:text-xs">
                                    {filteredTopics.length} {filteredTopics.length === 1 ? "topic" : "topics"} displayed
                                </p>
                            </div>

                            {!loading && filteredTopics.length > 0 && (
                                <span className="flex h-9 min-w-9 items-center justify-center rounded-xl bg-blue-100 px-2.5 text-xs font-extrabold text-blue-700">
                                    {filteredTopics.length}
                                </span>
                            )}
                        </div>

                        {loading ? (
                            <TopicsLoading />
                        ) : errorMessage ? (
                            <TopicsError message={errorMessage} retry={getTopics} />
                        ) : topics.length === 0 ? (
                            <TopicsEmpty />
                        ) : filteredTopics.length === 0 ? (
                            <NoFilteredTopics clearFilters={clearFilters} />
                        ) : (
                            <div className="grid grid-cols-2 items-stretch gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
                                {filteredTopics.map((topic, index) => (
                                    <TopicCard key={topic._id} topic={topic} chapters={chapters} subjects={subjects} events={events} style={cardStyles[index % cardStyles.length]} />
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

const TopicCard = ({ topic, chapters, subjects, events, style }) => {
    const chapter = getChapterRecord(topic.chapter, chapters);
    const subject = getSubjectRecord(chapter?.subject, subjects);

    const chapterId = chapter?._id ? String(chapter._id) : "";
    const subjectId = subject?._id ? String(subject._id) : "";
    const eventId = getEventId(subject?.event);

    const eventName = getEventName(subject?.event, events);
    const subjectName = subject?.name || "Unknown Subject";
    const chapterName = chapter?.chapterName || "Unknown Chapter";
    const topicName = topic.topicName || "Unnamed Topic";
    const sectionCount = topic.sections?.length || 0;

    const topicHref =
        eventId && subjectId && chapterId
            ? `/events/${eventId}/subjects/${subjectId}/chapters/${chapterId}/topics/${topic._id}`
            : "#";

    return (
        <article className={`group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border bg-white transition duration-200 lg:hover:-translate-y-0.5 ${style.card}`}>
            <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                {topic.image?.url ? (
                    <img src={topic.image.url} alt={topicName} className="h-full w-full object-cover transition duration-300 lg:group-hover:scale-105" />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
                        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl transition duration-200 lg:group-hover:scale-105 ${style.icon}`}>
                            <FileText size={27} strokeWidth={1.8} />
                        </div>
                    </div>
                )}

                <span className={`absolute left-2.5 top-2.5 rounded-lg px-2.5 py-1 text-[7px] font-extrabold uppercase tracking-[0.1em] shadow-sm ${style.badge}`}>
                    Topic {topic.topicNumber || ""}
                </span>
            </div>

            <div className="flex flex-1 flex-col p-3 sm:p-4">
                <p className="truncate text-[8px] font-extrabold uppercase tracking-[0.12em] text-blue-600 sm:text-[9px]">
                    {eventName} · {subjectName}
                </p>

                <h3 className="mt-1.5 line-clamp-2 text-xs font-extrabold leading-5 text-[#071a4a] sm:text-sm">
                    {topicName}
                </h3>

                <div className="mt-2 flex items-center gap-1.5 text-[8px] font-semibold text-slate-500 sm:text-[9px]">
                    <BookOpen size={12} className="shrink-0 text-slate-400" />

                    <span className="truncate">
                        {chapterName}
                    </span>
                </div>

                <div className="mt-2 flex items-center gap-1.5 text-[8px] font-semibold text-slate-500 sm:text-[9px]">
                    <Layers3 size={12} className="shrink-0 text-slate-400" />

                    <span>
                        {sectionCount} {sectionCount === 1 ? "section" : "sections"}
                    </span>
                </div>

                <div className="mt-auto pt-4">
                    {eventId && subjectId && chapterId ? (
                        <Link href={topicHref} aria-label={`Read ${topicName}`} className="flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-2 text-[8px] font-bold text-white shadow-md transition active:scale-[0.98] lg:shadow-sm lg:hover:bg-blue-700 lg:hover:shadow-md sm:h-10 sm:text-[9px]">
                            <span className="truncate">
                                Read Topic
                            </span>

                            <ArrowRight size={13} className="shrink-0" />
                        </Link>
                    ) : (
                        <button type="button" disabled className="flex h-9 w-full cursor-not-allowed items-center justify-center rounded-lg bg-slate-200 px-2 text-[8px] font-bold text-slate-500 sm:h-10 sm:text-[9px]">
                            Topic path unavailable
                        </button>
                    )}
                </div>
            </div>
        </article>
    );
};

const TopicsLoading = () => {
    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                <div key={item} className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    <div className="aspect-[16/10] bg-slate-200" />

                    <div className="p-3 sm:p-4">
                        <div className="h-2.5 w-28 rounded bg-slate-100" />
                        <div className="mt-3 h-4 w-3/4 rounded bg-slate-200" />
                        <div className="mt-2 h-3 w-full rounded bg-slate-100" />
                        <div className="mt-5 h-9 rounded-lg bg-slate-200 sm:h-10" />
                    </div>
                </div>
            ))}
        </div>
    );
};

const TopicsError = ({ message, retry }) => {
    return (
        <div className="rounded-2xl border border-red-200 bg-white px-4 py-12 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500">
                <CircleAlert size={23} />
            </div>

            <h3 className="mt-4 text-base font-extrabold text-[#071a4a]">
                Topics could not be loaded
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

const TopicsEmpty = () => {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-12 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <FileText size={23} />
            </div>

            <h3 className="mt-4 text-base font-extrabold text-[#071a4a]">
                No topics are available
            </h3>

            <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-slate-500">
                Topics will appear here when study material is added under chapters.
            </p>
        </div>
    );
};

const NoFilteredTopics = ({ clearFilters }) => {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-12 text-center shadow-sm">
            <Search size={28} className="mx-auto text-slate-300" />

            <h3 className="mt-3 text-sm font-extrabold text-[#071a4a]">
                No topics match your filters
            </h3>

            <p className="mt-1.5 text-xs text-slate-500">
                Try another event, subject, chapter or search value.
            </p>

            <button type="button" onClick={clearFilters} className="mt-4 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-blue-700">
                Clear Filters
            </button>
        </div>
    );
};

const getChapterRecord = (chapter, chapters) => {
    if (!chapter) {
        return null;
    }

    if (typeof chapter === "object") {
        return chapter;
    }

    return chapters.find((item) =>
        String(item._id) === String(chapter),
    ) || null;
};

const getSubjectRecord = (subject, subjects) => {
    if (!subject) {
        return null;
    }

    if (typeof subject === "object") {
        return subject;
    }

    return subjects.find((item) =>
        String(item._id) === String(subject),
    ) || null;
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

    return events.find((item) =>
        String(item._id) === eventId,
    )?.name || "Event";
};

export default TopicsPage;