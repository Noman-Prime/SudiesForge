"use client";

import { useUser } from "@/context/userContext";
import axios from "axios";
import Link from "next/link";
import {
    BookOpenText,
    ChevronDown,
    CircleAlert,
    ExternalLink,
    FileText,
    GraduationCap,
    Layers3,
    LoaderCircle,
    Plus,
    Search,
    Settings2,
    SlidersHorizontal,
    X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";

const Topics = () => {
    const { user } = useUser();

    const [topics, setTopics] = useState([]);
    const [events, setEvents] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [chapters, setChapters] = useState([]);

    const [search, setSearch] = useState("");
    const [selectedEvent, setSelectedEvent] = useState("");
    const [selectedSubject, setSelectedSubject] = useState("");
    const [selectedChapter, setSelectedChapter] = useState("");

    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    const getTopics = async () => {
        try {
            setLoading(true);
            setErrorMessage("");

            const requests = await Promise.allSettled([
                axios.get("/api/topic", {
                    withCredentials: true,
                }),

                axios.get("/api/events", {
                    withCredentials: true,
                }),

                axios.get("/api/subject", {
                    withCredentials: true,
                }),

                axios.get("/api/chapter", {
                    withCredentials: true,
                }),
            ]);

            const [
                topicsRequest,
                eventsRequest,
                subjectsRequest,
                chaptersRequest,
            ] = requests;

            if (topicsRequest.status === "fulfilled") {
                setTopics(
                    topicsRequest.value.data.topics || [],
                );
            } else if (
                topicsRequest.reason?.response?.status === 404
            ) {
                setTopics([]);
            } else {
                throw topicsRequest.reason;
            }

            if (eventsRequest.status === "fulfilled") {
                setEvents(
                    eventsRequest.value.data.event || [],
                );
            } else {
                setEvents([]);
            }

            if (subjectsRequest.status === "fulfilled") {
                setSubjects(
                    subjectsRequest.value.data.subjects || [],
                );
            } else {
                setSubjects([]);
            }

            if (chaptersRequest.status === "fulfilled") {
                setChapters(
                    chaptersRequest.value.data.chapters || [],
                );
            } else {
                setChapters([]);
            }
        } catch (error) {
            console.log(error);

            setTopics([]);

            setErrorMessage(
                error.response?.data?.message ||
                "Topics could not be loaded",
            );

            toast.error(
                error.response?.data?.message ||
                "Topics could not be loaded",
                {
                    autoClose: 3000,
                },
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getTopics();
    }, []);

    const getId = (value) => {
        if (!value) {
            return "";
        }

        if (typeof value === "object") {
            return String(value._id || "");
        }

        return String(value);
    };

    const chapterMap = useMemo(() => {
        const map = new Map();

        chapters.forEach((chapter) => {
            map.set(String(chapter._id), chapter);
        });

        topics.forEach((topic) => {
            if (
                topic.chapter &&
                typeof topic.chapter === "object"
            ) {
                map.set(
                    String(topic.chapter._id),
                    topic.chapter,
                );
            }
        });

        return map;
    }, [chapters, topics]);

    const subjectMap = useMemo(() => {
        const map = new Map();

        subjects.forEach((subject) => {
            map.set(String(subject._id), subject);
        });

        chapters.forEach((chapter) => {
            if (
                chapter.subject &&
                typeof chapter.subject === "object"
            ) {
                map.set(
                    String(chapter.subject._id),
                    chapter.subject,
                );
            }
        });

        return map;
    }, [subjects, chapters]);

    const eventMap = useMemo(() => {
        const map = new Map();

        events.forEach((event) => {
            map.set(String(event._id), event);
        });

        subjects.forEach((subject) => {
            if (
                subject.event &&
                typeof subject.event === "object"
            ) {
                map.set(
                    String(subject.event._id),
                    subject.event,
                );
            }
        });

        return map;
    }, [events, subjects]);

    const getChapter = (topic) => {
        const chapterId = getId(topic.chapter);

        return (
            chapterMap.get(chapterId) ||
            (typeof topic.chapter === "object"
                ? topic.chapter
                : null)
        );
    };

    const getSubject = (topic) => {
        const currentChapter = getChapter(topic);

        if (!currentChapter) {
            return null;
        }

        const subjectId = getId(
            currentChapter.subject,
        );

        return (
            subjectMap.get(subjectId) ||
            (typeof currentChapter.subject === "object"
                ? currentChapter.subject
                : null)
        );
    };

    const getEvent = (topic) => {
        const currentSubject = getSubject(topic);

        if (!currentSubject) {
            return null;
        }

        const eventId = getId(currentSubject.event);

        return (
            eventMap.get(eventId) ||
            (typeof currentSubject.event === "object"
                ? currentSubject.event
                : null)
        );
    };

    const availableSubjects = useMemo(() => {
        if (!selectedEvent) {
            return subjects;
        }

        return subjects.filter(
            (subject) =>
                getId(subject.event) ===
                String(selectedEvent),
        );
    }, [subjects, selectedEvent]);

    const availableChapters = useMemo(() => {
        if (!selectedSubject) {
            return selectedEvent
                ? chapters.filter((chapter) => {
                    const subject = subjectMap.get(
                        getId(chapter.subject),
                    );

                    return (
                        getId(subject?.event) ===
                        String(selectedEvent)
                    );
                })
                : chapters;
        }

        return chapters.filter(
            (chapter) =>
                getId(chapter.subject) ===
                String(selectedSubject),
        );
    }, [
        chapters,
        selectedEvent,
        selectedSubject,
        subjectMap,
    ]);

    const filteredTopics = useMemo(() => {
        const normalizedSearch = search
            .trim()
            .toLowerCase();

        return [...topics]
            .filter((topic) => {
                const currentChapter =
                    getChapter(topic);

                const currentSubject =
                    getSubject(topic);

                const currentEvent =
                    getEvent(topic);

                if (
                    selectedEvent &&
                    getId(currentEvent) !==
                    String(selectedEvent)
                ) {
                    return false;
                }

                if (
                    selectedSubject &&
                    getId(currentSubject) !==
                    String(selectedSubject)
                ) {
                    return false;
                }

                if (
                    selectedChapter &&
                    getId(currentChapter) !==
                    String(selectedChapter)
                ) {
                    return false;
                }

                if (!normalizedSearch) {
                    return true;
                }

                const searchableText = [
                    topic.topicName,
                    topic.topicNumber,
                    currentChapter?.chapterName,
                    currentChapter?.chapterNumber,
                    currentSubject?.name,
                    currentEvent?.name,
                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();

                return searchableText.includes(
                    normalizedSearch,
                );
            })
            .sort(
                (firstTopic, secondTopic) =>
                    Number(firstTopic.topicNumber) -
                    Number(secondTopic.topicNumber),
            );
    }, [
        topics,
        search,
        selectedEvent,
        selectedSubject,
        selectedChapter,
        chapterMap,
        subjectMap,
        eventMap,
    ]);

    const selectEvent = (event) => {
        const eventId = event.target.value;

        setSelectedEvent(eventId);
        setSelectedSubject("");
        setSelectedChapter("");
    };

    const selectSubject = (event) => {
        setSelectedSubject(event.target.value);
        setSelectedChapter("");
    };

    const clearFilters = () => {
        setSearch("");
        setSelectedEvent("");
        setSelectedSubject("");
        setSelectedChapter("");
    };

    const filtersAreActive =
        search ||
        selectedEvent ||
        selectedSubject ||
        selectedChapter;

    return (
        <div className="min-h-screen bg-[#f5f7fb]">
            <AdminHeader user={user} />

            <main className="mx-auto w-full max-w-[1400px] px-3 py-5 sm:px-6 sm:py-7 lg:px-8">
                <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
                    <div>
                        <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-blue-600">
                            Topic management
                        </p>

                        <h1 className="mt-1.5 text-xl font-black tracking-tight text-[#071a4a] sm:text-2xl">
                            Manage Topics
                        </h1>

                        <p className="mt-1.5 max-w-2xl text-xs leading-5 text-slate-500 sm:text-sm">
                            View and manage topics and their
                            content sections across all
                            events, subjects and chapters.
                        </p>
                    </div>

                    <Link
                        href="/admin/topics/create"
                        className="flex h-10 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 sm:w-auto"
                    >
                        <Plus size={16} />
                        Create Topic
                    </Link>
                </section>

                <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-4 sm:px-5">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <SlidersHorizontal size={17} />
                        </div>

                        <div>
                            <h2 className="text-sm font-extrabold text-[#071a4a]">
                                Find topics
                            </h2>

                            <p className="mt-0.5 text-[9px] text-slate-500 sm:text-[10px]">
                                Search or filter topics by
                                their content hierarchy.
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-[minmax(220px,1.3fr)_repeat(3,minmax(150px,0.8fr))_auto]">
                        <div className="relative">
                            <Search
                                size={15}
                                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <input
                                type="text"
                                value={search}
                                onChange={(event) =>
                                    setSearch(
                                        event.target.value,
                                    )
                                }
                                placeholder="Search topics..."
                                className="h-10 w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 text-xs text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                            />
                        </div>

                        <FilterSelect
                            value={selectedEvent}
                            onChange={selectEvent}
                            placeholder="All events"
                            options={events.map(
                                (event) => ({
                                    value: event._id,
                                    label: event.name,
                                }),
                            )}
                        />

                        <FilterSelect
                            value={selectedSubject}
                            onChange={selectSubject}
                            disabled={!selectedEvent}
                            placeholder={
                                selectedEvent
                                    ? "All subjects"
                                    : "Select event first"
                            }
                            options={availableSubjects.map(
                                (subject) => ({
                                    value: subject._id,
                                    label: subject.name,
                                }),
                            )}
                        />

                        <FilterSelect
                            value={selectedChapter}
                            onChange={(event) =>
                                setSelectedChapter(
                                    event.target.value,
                                )
                            }
                            disabled={!selectedSubject}
                            placeholder={
                                selectedSubject
                                    ? "All chapters"
                                    : "Select subject first"
                            }
                            options={availableChapters.map(
                                (chapter) => ({
                                    value: chapter._id,
                                    label: `Chapter ${chapter.chapterNumber}: ${chapter.chapterName}`,
                                }),
                            )}
                        />

                        <button
                            type="button"
                            onClick={clearFilters}
                            disabled={!filtersAreActive}
                            className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 text-[10px] font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 sm:col-span-2 lg:col-span-1"
                        >
                            <X size={14} />
                            Clear
                        </button>
                    </div>
                </section>

                <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-4 py-4 sm:px-5">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                <BookOpenText size={18} />
                            </div>

                            <div>
                                <h2 className="text-sm font-extrabold text-[#071a4a]">
                                    Topic collection
                                </h2>

                                <p className="mt-0.5 text-[9px] text-slate-500 sm:text-[10px]">
                                    Open a topic to update its
                                    information, sections or
                                    image.
                                </p>
                            </div>
                        </div>

                        {!loading && !errorMessage && (
                            <div className="shrink-0 rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-extrabold text-blue-700">
                                {filteredTopics.length}{" "}
                                {filteredTopics.length === 1
                                    ? "topic"
                                    : "topics"}
                            </div>
                        )}
                    </div>

                    {loading ? (
                        <TopicsLoading />
                    ) : errorMessage ? (
                        <TopicsError
                            message={errorMessage}
                            onRetry={getTopics}
                        />
                    ) : topics.length === 0 ? (
                        <NoTopics />
                    ) : filteredTopics.length === 0 ? (
                        <NoFilteredTopics
                            onClear={clearFilters}
                        />
                    ) : (
                        <div className="grid grid-cols-2 gap-3 bg-slate-50/70 p-3 sm:p-4 lg:grid-cols-4">
                            {filteredTopics.map((topic) => {
                                const currentChapter =
                                    getChapter(topic);

                                const currentSubject =
                                    getSubject(topic);

                                const currentEvent =
                                    getEvent(topic);

                                return (
                                    <TopicCard
                                        key={topic._id}
                                        topic={topic}
                                        chapter={
                                            currentChapter
                                        }
                                        subject={
                                            currentSubject
                                        }
                                        event={
                                            currentEvent
                                        }
                                    />
                                );
                            })}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

const TopicCard = ({
    topic,
    chapter,
    subject,
    event,
}) => {
    const sectionCount =
        topic.sections?.length || 0;

    return (
        <Link
            href={`/admin/topics/${topic._id}`}
            className="group flex min-w-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
        >
            <div className="relative h-24 overflow-hidden bg-gradient-to-br from-blue-50 via-slate-50 to-blue-100 sm:h-28 lg:h-32">
                {topic.image?.url ? (
                    <img
                        src={topic.image.url}
                        alt={topic.topicName}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-100 bg-white text-blue-600 shadow-sm sm:h-12 sm:w-12">
                            <BookOpenText
                                size={22}
                                strokeWidth={1.7}
                            />
                        </div>
                    </div>
                )}

                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#071a4a]/40 to-transparent" />

                <div className="absolute left-2 top-2 rounded-lg bg-[#071a4a]/90 px-2 py-1 text-[8px] font-extrabold text-white shadow-sm backdrop-blur-sm sm:text-[9px]">
                    Topic {topic.topicNumber}
                </div>
            </div>

            <div className="flex flex-1 flex-col p-3 sm:p-3.5">
                <p className="truncate text-[7px] font-bold uppercase tracking-[0.11em] text-blue-600 sm:text-[8px]">
                    {subject?.name || "Subject"}
                </p>

                <h3 className="mt-1 line-clamp-2 text-xs font-black leading-4 text-[#071a4a] sm:text-sm sm:leading-5">
                    {topic.topicName}
                </h3>

                <div className="mt-3 space-y-1.5 border-t border-slate-100 pt-2.5">
                    <InfoLine
                        label="Event"
                        value={
                            event?.name ||
                            "Not available"
                        }
                    />

                    <InfoLine
                        label="Chapter"
                        value={
                            chapter
                                ? `${chapter.chapterNumber}. ${chapter.chapterName}`
                                : "Not available"
                        }
                    />
                </div>

                <div className="mt-3 flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-2.5 py-2">
                    <div className="flex min-w-0 items-center gap-1.5 text-[8px] font-semibold text-slate-500 sm:text-[9px]">
                        <FileText
                            size={12}
                            className="shrink-0 text-blue-600"
                        />

                        <span>
                            {sectionCount}{" "}
                            {sectionCount === 1
                                ? "section"
                                : "sections"}
                        </span>
                    </div>

                    <span className="text-[8px] font-bold text-blue-600 transition group-hover:translate-x-0.5 sm:text-[9px]">
                        Manage
                    </span>
                </div>
            </div>
        </Link>
    );
};

const InfoLine = ({ label, value }) => {
    return (
        <div className="flex min-w-0 items-center gap-2 text-[8px] sm:text-[9px]">
            <span className="shrink-0 font-bold text-slate-400">
                {label}
            </span>

            <span className="truncate font-semibold text-slate-600">
                {value}
            </span>
        </div>
    );
};

const FilterSelect = ({
    value,
    onChange,
    disabled,
    placeholder,
    options,
}) => {
    return (
        <div className="relative">
            <select
                value={value}
                onChange={onChange}
                disabled={disabled}
                className="h-10 w-full appearance-none rounded-xl border border-slate-300 bg-white px-3 pr-9 text-xs text-slate-700 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
            >
                <option value="">
                    {placeholder}
                </option>

                {options.map((option) => (
                    <option
                        key={option.value}
                        value={option.value}
                    >
                        {option.label}
                    </option>
                ))}
            </select>

            <ChevronDown
                size={14}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
        </div>
    );
};

const TopicsLoading = () => {
    return (
        <div className="grid grid-cols-2 gap-3 bg-slate-50/70 p-3 sm:p-4 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
                <div
                    key={item}
                    className="animate-pulse overflow-hidden rounded-xl border border-slate-200 bg-white"
                >
                    <div className="h-24 bg-slate-200 sm:h-28 lg:h-32" />

                    <div className="p-3 sm:p-3.5">
                        <div className="h-2 w-16 rounded bg-slate-100" />

                        <div className="mt-2 h-3 w-full rounded bg-slate-200" />

                        <div className="mt-1.5 h-3 w-3/4 rounded bg-slate-100" />

                        <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
                            <div className="h-2.5 w-full rounded bg-slate-100" />

                            <div className="h-2.5 w-4/5 rounded bg-slate-100" />
                        </div>

                        <div className="mt-3 h-8 rounded-lg bg-slate-100" />
                    </div>
                </div>
            ))}
        </div>
    );
};

const TopicsError = ({
    message,
    onRetry,
}) => {
    return (
        <div className="flex min-h-64 items-center justify-center bg-slate-50/70 px-4 py-10 text-center">
            <div className="max-w-sm">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500">
                    <CircleAlert size={23} />
                </div>

                <h3 className="mt-4 text-sm font-black text-[#071a4a]">
                    Topics could not be loaded
                </h3>

                <p className="mt-1.5 text-xs leading-5 text-slate-500">
                    {message}
                </p>

                <button
                    type="button"
                    onClick={onRetry}
                    className="mt-4 inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-4 text-[11px] font-bold text-white transition hover:bg-blue-700"
                >
                    <LoaderCircle size={13} />
                    Try again
                </button>
            </div>
        </div>
    );
};

const NoTopics = () => {
    return (
        <div className="flex min-h-64 items-center justify-center bg-slate-50/70 px-4 py-10 text-center">
            <div className="max-w-sm">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <BookOpenText size={23} />
                </div>

                <h3 className="mt-4 text-sm font-black text-[#071a4a]">
                    No topics are available
                </h3>

                <p className="mt-1.5 text-xs leading-5 text-slate-500">
                    Create the first topic and attach it to
                    the correct event, subject and chapter.
                </p>

                <Link
                    href="/admin/topics/create"
                    className="mt-4 inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-4 text-[11px] font-bold text-white transition hover:bg-blue-700"
                >
                    <Plus size={14} />
                    Create Topic
                </Link>
            </div>
        </div>
    );
};

const NoFilteredTopics = ({ onClear }) => {
    return (
        <div className="flex min-h-64 items-center justify-center bg-slate-50/70 px-4 py-10 text-center">
            <div className="max-w-sm">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                    <Search size={22} />
                </div>

                <h3 className="mt-4 text-sm font-black text-[#071a4a]">
                    No matching topics
                </h3>

                <p className="mt-1.5 text-xs leading-5 text-slate-500">
                    No topics match the current search and
                    hierarchy filters.
                </p>

                <button
                    type="button"
                    onClick={onClear}
                    className="mt-4 inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 text-[11px] font-bold text-slate-600 transition hover:bg-slate-50"
                >
                    <X size={13} />
                    Clear filters
                </button>
            </div>
        </div>
    );
};

const AdminHeader = ({ user }) => {
    const [showUserMenu, setShowUserMenu] =
        useState(false);

    const menuRef = useRef(null);

    const accountName = user
        ? `${user.firstname || ""} ${user.lastname || ""
            }`.trim() || "Administrator"
        : "Administrator";

    useEffect(() => {
        const closeMenu = (event) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(
                    event.target,
                )
            ) {
                setShowUserMenu(false);
            }
        };

        document.addEventListener(
            "mousedown",
            closeMenu,
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                closeMenu,
            );
        };
    }, []);

    return (
        <header className="sticky top-0 z-50 bg-[#102a63] px-3 py-2 text-white shadow-sm sm:px-6">
            <div className="mx-auto flex h-14 w-full max-w-[1500px] items-center gap-2 sm:h-16 sm:gap-4">
                <Link
                    href="/admin"
                    className="flex min-w-0 max-w-[48%] items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-2.5 py-2 text-white shadow-sm backdrop-blur-xl transition hover:bg-white/15 sm:max-w-none sm:gap-3 sm:px-4"
                >
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

                <div
                    ref={menuRef}
                    className="relative ml-auto min-w-0 max-w-[52%] sm:max-w-none"
                >
                    <button
                        type="button"
                        aria-label="Open admin account menu"
                        aria-haspopup="menu"
                        aria-expanded={showUserMenu}
                        onClick={() =>
                            setShowUserMenu(
                                (previous) =>
                                    !previous,
                            )
                        }
                        className="flex w-full min-w-0 items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-2.5 py-2 text-left text-white shadow-sm backdrop-blur-xl transition hover:bg-white/15 sm:gap-3 sm:px-4"
                    >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white text-xs font-bold uppercase text-[#102a63] sm:h-10 sm:w-10 sm:text-sm">
                            {user?.profileimage?.url ? (
                                <img
                                    src={
                                        user
                                            .profileimage
                                            .url
                                    }
                                    alt={accountName}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                user?.firstname?.charAt(
                                    0,
                                ) || "A"
                            )}
                        </div>

                        <div className="min-w-0">
                            <span className="block truncate text-[11px] font-bold text-white sm:max-w-52 sm:text-sm">
                                {accountName}
                            </span>

                            <span className="block truncate text-[9px] text-blue-200 sm:max-w-52 sm:text-xs">
                                {user?.email ||
                                    "Administrator"}
                            </span>
                        </div>

                        <ChevronDown
                            size={15}
                            className={`shrink-0 text-blue-200 transition-transform ${showUserMenu
                                    ? "rotate-180"
                                    : ""
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
                                    onClick={() =>
                                        setShowUserMenu(
                                            false,
                                        )
                                    }
                                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition hover:bg-blue-50 hover:text-blue-700"
                                >
                                    <ExternalLink
                                        size={17}
                                    />
                                    View Website
                                </Link>

                                <Link
                                    href="/admin/settings"
                                    role="menuitem"
                                    onClick={() =>
                                        setShowUserMenu(
                                            false,
                                        )
                                    }
                                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition hover:bg-blue-50 hover:text-blue-700"
                                >
                                    <Settings2
                                        size={17}
                                    />
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

export default Topics;