"use client";

import { useUser } from "@/context/userContext";
import axios from "axios";
import Link from "next/link";
import {
    BookOpen,
    BookOpenCheck,
    CalendarDays,
    CheckSquare,
    ChevronDown,
    ChevronRight,
    ClipboardCheck,
    ExternalLink,
    Filter,
    GraduationCap,
    Layers3,
    Plus,
    RefreshCw,
    Search,
    Settings2,
} from "lucide-react";
import {
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

const Mcqs = () => {
    const { user } = useUser();
    const userMenuRef = useRef(null);

    const [mcqs, setMcqs] = useState([]);
    const [loading, setLoading] =
        useState(true);

    const [errorMessage, setErrorMessage] =
        useState("");

    const [search, setSearch] =
        useState("");

    const [typeFilter, setTypeFilter] =
        useState("all");

    const [eventFilter, setEventFilter] =
        useState("all");

    const [showUserMenu, setShowUserMenu] =
        useState(false);

    const accountName = user
        ? `${user.firstname || ""} ${
              user.lastname || ""
          }`.trim() || "Administrator"
        : "Administrator";

    const getMcqs = async () => {
        try {
            setLoading(true);
            setErrorMessage("");

            const result = await axios.get(
                "/api/mcqs",
                {
                    withCredentials: true,
                },
            );

            if (result.data.success) {
                setMcqs(
                    result.data.mcqs || [],
                );
            }
        } catch (error) {
            console.log(error);

            if (
                error.response?.status === 404
            ) {
                setMcqs([]);
                setErrorMessage("");
                return;
            }

            setMcqs([]);

            setErrorMessage(
                error.response?.data?.message ||
                    "MCQs could not be loaded",
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getMcqs();
    }, []);

    useEffect(() => {
        const closeUserMenu = (e) => {
            if (
                userMenuRef.current &&
                !userMenuRef.current.contains(
                    e.target,
                )
            ) {
                setShowUserMenu(false);
            }
        };

        document.addEventListener(
            "mousedown",
            closeUserMenu,
        );

        return () =>
            document.removeEventListener(
                "mousedown",
                closeUserMenu,
            );
    }, []);

    const events = useMemo(() => {
        const eventMap = new Map();

        mcqs.forEach((mcq) => {
            if (
                mcq.event &&
                typeof mcq.event ===
                    "object" &&
                mcq.event._id
            ) {
                eventMap.set(
                    mcq.event._id,
                    mcq.event,
                );
            }
        });

        return Array.from(
            eventMap.values(),
        );
    }, [mcqs]);

    const filteredMcqs = useMemo(() => {
        const searchValue = search
            .trim()
            .toLowerCase();

        return mcqs.filter((mcq) => {
            const eventName =
                typeof mcq.event === "object"
                    ? mcq.event?.name || ""
                    : "";

            const subjectName =
                typeof mcq.subject ===
                "object"
                    ? mcq.subject?.name || ""
                    : "";

            const chapterName =
                typeof mcq.chapter ===
                "object"
                    ? mcq.chapter
                          ?.chapterName || ""
                    : "";

            const topicName =
                typeof mcq.topic === "object"
                    ? mcq.topic
                          ?.topicName || ""
                    : "";

            const matchesSearch =
                !searchValue ||
                mcq.statement
                    ?.toLowerCase()
                    .includes(searchValue) ||
                eventName
                    .toLowerCase()
                    .includes(searchValue) ||
                subjectName
                    .toLowerCase()
                    .includes(searchValue) ||
                chapterName
                    .toLowerCase()
                    .includes(searchValue) ||
                topicName
                    .toLowerCase()
                    .includes(searchValue);

            const currentType =
                mcq.mcqType || "both";

            const matchesType =
                typeFilter === "all" ||
                currentType === typeFilter;

            const currentEventId =
                typeof mcq.event === "object"
                    ? mcq.event?._id
                    : mcq.event;

            const matchesEvent =
                eventFilter === "all" ||
                String(currentEventId) ===
                    String(eventFilter);

            return (
                matchesSearch &&
                matchesType &&
                matchesEvent
            );
        });
    }, [
        mcqs,
        search,
        typeFilter,
        eventFilter,
    ]);

    const totalBoth = mcqs.filter(
        (mcq) =>
            (mcq.mcqType || "both") ===
            "both",
    ).length;

    const totalRead = mcqs.filter(
        (mcq) =>
            mcq.mcqType === "read",
    ).length;

    const totalTest = mcqs.filter(
        (mcq) =>
            mcq.mcqType === "test",
    ).length;

    const resetFilters = () => {
        setSearch("");
        setTypeFilter("all");
        setEventFilter("all");
    };

    const filtersAreActive =
        search ||
        typeFilter !== "all" ||
        eventFilter !== "all";

    return (
        <div className="min-h-screen bg-[#f5f7fb]">
            <header className="sticky top-0 z-50 bg-[#102a63] px-3 py-2 text-white shadow-sm sm:px-6">
                <div className="mx-auto flex h-14 w-full max-w-[1500px] items-center gap-2 sm:h-16 sm:gap-4">
                    <Link
                        href="/admin"
                        className="flex min-w-0 max-w-[48%] items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-2.5 py-2 text-white shadow-sm backdrop-blur-xl transition hover:bg-white/15 sm:max-w-none sm:gap-3 sm:px-4"
                    >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[#102a63] sm:h-10 sm:w-10">
                            <GraduationCap
                                size={22}
                            />
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
                        ref={userMenuRef}
                        className="relative ml-auto min-w-0 max-w-[52%] sm:max-w-none"
                    >
                        <button
                            type="button"
                            aria-label="Open admin account menu"
                            aria-expanded={
                                showUserMenu
                            }
                            onClick={() =>
                                setShowUserMenu(
                                    (previous) =>
                                        !previous,
                                )
                            }
                            className="flex w-full min-w-0 items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-2.5 py-2 text-left text-white shadow-sm backdrop-blur-xl transition hover:bg-white/15 sm:gap-3 sm:px-4"
                        >
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white text-xs font-bold uppercase text-[#102a63] sm:h-10 sm:w-10 sm:rounded-full sm:text-sm">
                                {user?.profileimage
                                    ?.url ? (
                                    <img
                                        src={
                                            user
                                                .profileimage
                                                .url
                                        }
                                        alt={
                                            accountName
                                        }
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
                                    {
                                        accountName
                                    }
                                </span>

                                <span className="block truncate text-[9px] text-blue-200 sm:max-w-52 sm:text-xs">
                                    {user?.email ||
                                        "Administrator"}
                                </span>
                            </div>

                            <ChevronDown
                                size={15}
                                className={`shrink-0 text-blue-200 transition-transform ${
                                    showUserMenu
                                        ? "rotate-180"
                                        : ""
                                }`}
                            />
                        </button>

                        {showUserMenu && (
                            <div className="absolute right-0 top-full z-50 w-52 pt-2 sm:w-56">
                                <div className="rounded-xl border border-slate-200 bg-white p-2 text-slate-800 shadow-xl">
                                    <Link
                                        href="/"
                                        onClick={() =>
                                            setShowUserMenu(
                                                false,
                                            )
                                        }
                                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition hover:bg-blue-50 hover:text-blue-700"
                                    >
                                        <ExternalLink
                                            size={
                                                17
                                            }
                                        />
                                        View Website
                                    </Link>

                                    <Link
                                        href="/admin/settings"
                                        onClick={() =>
                                            setShowUserMenu(
                                                false,
                                            )
                                        }
                                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition hover:bg-blue-50 hover:text-blue-700"
                                    >
                                        <Settings2
                                            size={
                                                17
                                            }
                                        />
                                        Settings
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <main className="mx-auto w-full max-w-[1450px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
                <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-600">
                            Question management
                        </p>

                        <h1 className="mt-2 text-xl font-extrabold tracking-tight text-[#071a4a] sm:text-2xl">
                            Manage MCQs
                        </h1>

                        <p className="mt-2 max-w-2xl text-xs leading-5 text-slate-500 sm:text-sm">
                            Create and manage
                            questions for reading and
                            test activities across
                            events, subjects, chapters
                            and topics.
                        </p>
                    </div>

                    <Link
                        href="/admin/mcqs/create"
                        className="flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md sm:w-auto"
                    >
                        <Plus size={16} />
                        Create MCQ
                    </Link>
                </section>

                <section className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
                    <SummaryCard
                        icon={Layers3}
                        label="Total MCQs"
                        count={mcqs.length}
                        color="blue"
                    />

                    <SummaryCard
                        icon={BookOpenCheck}
                        label="Read and Test"
                        count={totalBoth}
                        color="indigo"
                    />

                    <SummaryCard
                        icon={BookOpen}
                        label="Read Only"
                        count={totalRead}
                        color="green"
                    />

                    <SummaryCard
                        icon={ClipboardCheck}
                        label="Test Only"
                        count={totalTest}
                        color="violet"
                    />
                </section>

                <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                    <div className="flex items-center gap-2">
                        <Filter
                            size={16}
                            className="text-blue-600"
                        />

                        <h2 className="text-xs font-extrabold text-[#071a4a]">
                            Search and filter
                        </h2>

                        <span className="ml-auto text-[10px] font-semibold text-slate-400">
                            {
                                filteredMcqs.length
                            }{" "}
                            result
                            {filteredMcqs.length !==
                            1
                                ? "s"
                                : ""}
                        </span>
                    </div>

                    <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_200px_200px_auto]">
                        <div className="relative">
                            <Search
                                size={16}
                                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <input
                                type="text"
                                value={search}
                                onChange={(e) =>
                                    setSearch(
                                        e.target
                                            .value,
                                    )
                                }
                                placeholder="Search statement, event, subject, chapter or topic"
                                className="h-11 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 text-xs text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                            />
                        </div>

                        <select
                            value={typeFilter}
                            onChange={(e) =>
                                setTypeFilter(
                                    e.target.value,
                                )
                            }
                            className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                        >
                            <option value="all">
                                All types
                            </option>

                            <option value="both">
                                Read and Test
                            </option>

                            <option value="read">
                                Read only
                            </option>

                            <option value="test">
                                Test only
                            </option>
                        </select>

                        <select
                            value={eventFilter}
                            onChange={(e) =>
                                setEventFilter(
                                    e.target.value,
                                )
                            }
                            className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                        >
                            <option value="all">
                                All events
                            </option>

                            {events.map((event) => (
                                <option
                                    key={
                                        event._id
                                    }
                                    value={
                                        event._id
                                    }
                                >
                                    {event.name}
                                </option>
                            ))}
                        </select>

                        <button
                            type="button"
                            onClick={resetFilters}
                            disabled={
                                !filtersAreActive
                            }
                            className="flex h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Reset
                        </button>
                    </div>
                </section>

                {loading ? (
                    <McqLoading />
                ) : errorMessage ? (
                    <section className="mt-5 flex min-h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-center shadow-sm">
                        <div>
                            <RefreshCw
                                size={32}
                                className="mx-auto text-red-400"
                            />

                            <h2 className="mt-4 text-base font-extrabold text-[#071a4a]">
                                MCQs could not be
                                loaded
                            </h2>

                            <p className="mt-2 text-xs leading-5 text-slate-500">
                                {errorMessage}
                            </p>

                            <button
                                type="button"
                                onClick={getMcqs}
                                className="mt-5 flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-xs font-bold text-white transition hover:bg-blue-700"
                            >
                                <RefreshCw
                                    size={14}
                                />
                                Try again
                            </button>
                        </div>
                    </section>
                ) : filteredMcqs.length === 0 ? (
                    <section className="mt-5 flex min-h-72 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-center shadow-sm">
                        <div>
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                                <CheckSquare
                                    size={27}
                                />
                            </div>

                            <h2 className="mt-4 text-base font-extrabold text-[#071a4a]">
                                {mcqs.length === 0
                                    ? "No MCQs created"
                                    : "No matching MCQs"}
                            </h2>

                            <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-slate-500">
                                {mcqs.length === 0
                                    ? "Create your first MCQ to make questions available for reading and tests."
                                    : "Change or reset the filters to view other MCQs."}
                            </p>

                            {mcqs.length === 0 ? (
                                <Link
                                    href="/admin/mcqs/create"
                                    className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-xs font-bold text-white transition hover:bg-blue-700"
                                >
                                    <Plus
                                        size={14}
                                    />
                                    Create MCQ
                                </Link>
                            ) : (
                                <button
                                    type="button"
                                    onClick={
                                        resetFilters
                                    }
                                    className="mt-5 h-10 rounded-lg border border-slate-300 bg-white px-4 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
                                >
                                    Reset Filters
                                </button>
                            )}
                        </div>
                    </section>
                ) : (
                    <section className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {filteredMcqs.map(
                            (mcq, index) => (
                                <McqCard
                                    key={
                                        mcq._id
                                    }
                                    mcq={
                                        mcq
                                    }
                                    index={
                                        index
                                    }
                                />
                            ),
                        )}
                    </section>
                )}
            </main>
        </div>
    );
};

const McqCard = ({ mcq, index }) => {
    const eventName =
        typeof mcq.event === "object"
            ? mcq.event?.name
            : "Event";

    const subjectName =
        typeof mcq.subject === "object"
            ? mcq.subject?.name
            : "Subject";

    const chapterName =
        typeof mcq.chapter === "object"
            ? mcq.chapter?.chapterName
            : "Chapter";

    const chapterNumber =
        typeof mcq.chapter === "object"
            ? mcq.chapter?.chapterNumber
            : null;

    const topicName =
        typeof mcq.topic === "object"
            ? mcq.topic?.topicName
            : "Topic";

    const topicNumber =
        typeof mcq.topic === "object"
            ? mcq.topic?.topicNumber
            : null;

    const currentType =
        mcq.mcqType || "both";

    const typeDetails = {
        both: {
            label: "Read and Test",
            classes:
                "bg-blue-50 text-blue-700 border-blue-200",
        },
        read: {
            label: "Read Only",
            classes:
                "bg-green-50 text-green-700 border-green-200",
        },
        test: {
            label: "Test Only",
            classes:
                "bg-violet-50 text-violet-700 border-violet-200",
        },
    };

    const type =
        typeDetails[currentType] ||
        typeDetails.both;

    const formatDate = (date) => {
        if (!date) {
            return "Not available";
        }

        return new Intl.DateTimeFormat(
            "en-PK",
            {
                day: "numeric",
                month: "short",
                year: "numeric",
            },
        ).format(new Date(date));
    };

    return (
        <Link
            href={`/admin/mcqs/${mcq._id}`}
            className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
        >
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-3.5">
                <div className="flex min-w-0 items-center gap-2.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xs font-extrabold text-blue-700 transition group-hover:bg-blue-600 group-hover:text-white">
                        {index + 1}
                    </div>

                    <div className="min-w-0">
                        <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-blue-600">
                            Multiple choice
                        </p>

                        <p className="mt-0.5 truncate text-[10px] font-semibold text-slate-500">
                            {eventName} ·{" "}
                            {subjectName}
                        </p>
                    </div>
                </div>

                <span
                    className={`shrink-0 rounded-full border px-2 py-1 text-[8px] font-extrabold uppercase tracking-[0.08em] ${type.classes}`}
                >
                    {type.label}
                </span>
            </div>

            <div className="flex flex-1 flex-col p-4">
                <h2 className="line-clamp-3 text-sm font-extrabold leading-6 text-[#071a4a] transition group-hover:text-blue-700 sm:text-[15px]">
                    {mcq.statement}
                </h2>

                <div className="mt-4 space-y-2">
                    <div className="flex items-start gap-2 rounded-lg bg-slate-50 px-3 py-2.5">
                        <BookOpen
                            size={14}
                            className="mt-0.5 shrink-0 text-blue-600"
                        />

                        <div className="min-w-0">
                            <p className="text-[8px] font-bold uppercase tracking-[0.1em] text-slate-400">
                                Chapter
                            </p>

                            <p className="mt-0.5 truncate text-[10px] font-bold text-slate-700">
                                {chapterNumber
                                    ? `${chapterNumber}. `
                                    : ""}
                                {chapterName}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-2 rounded-lg bg-slate-50 px-3 py-2.5">
                        <BookOpenCheck
                            size={14}
                            className="mt-0.5 shrink-0 text-blue-600"
                        />

                        <div className="min-w-0">
                            <p className="text-[8px] font-bold uppercase tracking-[0.1em] text-slate-400">
                                Topic
                            </p>

                            <p className="mt-0.5 truncate text-[10px] font-bold text-slate-700">
                                {topicNumber
                                    ? `${topicNumber}. `
                                    : ""}
                                {topicName}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-3 text-[9px] font-semibold text-slate-500">
                        <span className="flex items-center gap-1">
                            <CheckSquare
                                size={13}
                                className="text-blue-600"
                            />

                            {mcq.options?.length ||
                                0}{" "}
                            options
                        </span>

                        <span className="flex items-center gap-1">
                            <CalendarDays
                                size={13}
                                className="text-blue-600"
                            />

                            {formatDate(
                                mcq.createdAt,
                            )}
                        </span>
                    </div>

                    <span className="flex shrink-0 items-center gap-1 text-[9px] font-extrabold text-blue-600">
                        Manage
                        <ChevronRight
                            size={13}
                            className="transition group-hover:translate-x-0.5"
                        />
                    </span>
                </div>
            </div>
        </Link>
    );
};

const SummaryCard = ({
    icon: Icon,
    label,
    count,
    color,
}) => {
    const colors = {
        blue: {
            box: "bg-blue-50 text-blue-600",
            border: "border-blue-100",
        },
        indigo: {
            box: "bg-indigo-50 text-indigo-600",
            border: "border-indigo-100",
        },
        green: {
            box: "bg-green-50 text-green-600",
            border: "border-green-100",
        },
        violet: {
            box: "bg-violet-50 text-violet-600",
            border: "border-violet-100",
        },
    };

    const selectedColor =
        colors[color] || colors.blue;

    return (
        <div
            className={`rounded-2xl border bg-white p-4 shadow-sm sm:p-5 ${selectedColor.border}`}
        >
            <div className="flex items-center justify-between gap-3">
                <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400 sm:text-[10px]">
                        {label}
                    </p>

                    <p className="mt-2 text-xl font-extrabold text-[#071a4a] sm:text-2xl">
                        {count}
                    </p>
                </div>

                <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11 ${selectedColor.box}`}
                >
                    <Icon size={20} />
                </div>
            </div>
        </div>
    );
};

const McqLoading = () => (
    <section className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map(
            (item) => (
                <div
                    key={item}
                    className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                    <div className="flex items-center gap-3 border-b border-slate-100 p-4">
                        <div className="h-9 w-9 rounded-xl bg-slate-200" />

                        <div className="flex-1">
                            <div className="h-2.5 w-24 rounded bg-slate-200" />

                            <div className="mt-2 h-2 w-32 rounded bg-slate-100" />
                        </div>
                    </div>

                    <div className="p-4">
                        <div className="h-3 w-full rounded bg-slate-200" />
                        <div className="mt-2 h-3 w-5/6 rounded bg-slate-200" />
                        <div className="mt-2 h-3 w-2/3 rounded bg-slate-100" />

                        <div className="mt-5 h-12 rounded-lg bg-slate-100" />
                        <div className="mt-2 h-12 rounded-lg bg-slate-100" />

                        <div className="mt-4 h-8 border-t border-slate-100" />
                    </div>
                </div>
            ),
        )}
    </section>
);

export default Mcqs;