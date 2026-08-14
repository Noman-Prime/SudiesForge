"use client";

import Footer from "@/app/components/footer";
import Navbar from "@/app/components/navbar";
import { EventProvider } from "@/context/EventContext";
import axios from "axios";
import Link from "next/link";
import {
    ArrowLeft,
    ArrowRight,
    BookOpen,
    ChevronRight,
    FileText,
    GraduationCap,
    Home,
    Layers3,
    RefreshCw,
} from "lucide-react";
import { useParams } from "next/navigation";
import {
    useEffect,
    useMemo,
    useState,
} from "react";

const ChapterPage = () => {
    const {
        id: eventId,
        subjectId,
        chapterId,
    } = useParams();

    const [event, setEvent] = useState(null);
    const [subject, setSubject] = useState(null);
    const [chapter, setChapter] = useState(null);
    const [topics, setTopics] = useState([]);

    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] =
        useState("");
    const [topicsError, setTopicsError] =
        useState("");

    const sortedTopics = useMemo(
        () =>
            [...topics].sort(
                (firstTopic, secondTopic) =>
                    Number(firstTopic.topicNumber) -
                    Number(secondTopic.topicNumber),
            ),
        [topics],
    );

    const getPageData = async () => {
        try {
            setLoading(true);
            setErrorMessage("");
            setTopicsError("");

            const results = await Promise.allSettled([
                axios.get(`/api/chapter/${chapterId}`),
                axios.get(`/api/subject/${subjectId}`),
                axios.get(`/api/events/${eventId}`),
                axios.get(
                    `/api/topic/chapter/${chapterId}`,
                ),
            ]);

            const [
                chapterResult,
                subjectResult,
                eventResult,
                topicsResult,
            ] = results;

            if (
                chapterResult.status === "rejected" ||
                !chapterResult.value.data.success
            ) {
                throw new Error(
                    chapterResult.reason?.response?.data
                        ?.message ||
                    "Chapter could not be loaded",
                );
            }

            setChapter(
                chapterResult.value.data.chapter,
            );

            if (
                subjectResult.status === "fulfilled" &&
                subjectResult.value.data.success
            ) {
                setSubject(
                    subjectResult.value.data.subject,
                );
            }

            if (
                eventResult.status === "fulfilled" &&
                eventResult.value.data.success
            ) {
                setEvent(eventResult.value.data.event);
            }

            if (
                topicsResult.status === "fulfilled" &&
                topicsResult.value.data.success
            ) {
                setTopics(
                    topicsResult.value.data.topics || [],
                );
            } else {
                const status =
                    topicsResult.reason?.response?.status;

                if (status === 404) {
                    setTopics([]);
                } else {
                    setTopics([]);

                    setTopicsError(
                        topicsResult.reason?.response?.data
                            ?.message ||
                        "Topics could not be loaded",
                    );
                }
            }
        } catch (error) {
            console.log(error);

            setErrorMessage(
                error.message ||
                error.response?.data?.message ||
                "Chapter could not be loaded",
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (eventId && subjectId && chapterId) {
            getPageData();
        }
    }, [eventId, subjectId, chapterId]);

    const topicLink = (topicId) =>
        `/events/${eventId}/subjects/${subjectId}/chapters/${chapterId}/topics/${topicId}`;

    if (loading) {
        return (
            <>
                <EventProvider>
                    <Navbar />
                </EventProvider>

                <main className="min-h-[75vh] bg-slate-50 px-4 py-8">
                    <div className="mx-auto w-full max-w-[1250px]">
                        <div className="animate-pulse">
                            <div className="h-10 w-64 rounded-xl bg-slate-200" />

                            <div className="mt-5 h-64 rounded-2xl bg-slate-200" />

                            <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                                {[1, 2, 3, 4].map(
                                    (item) => (
                                        <div
                                            key={item}
                                            className="h-52 rounded-2xl bg-slate-200"
                                        />
                                    ),
                                )}
                            </div>
                        </div>
                    </div>
                </main>

                <Footer />
            </>
        );
    }

    if (errorMessage || !chapter) {
        return (
            <>
                <EventProvider>
                    <Navbar />
                </EventProvider>

                <main className="flex min-h-[75vh] items-center justify-center bg-slate-50 px-4">
                    <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-7 text-center shadow-sm">
                        <BookOpen
                            size={40}
                            className="mx-auto text-red-400"
                        />

                        <h1 className="mt-4 text-xl font-extrabold text-[#071a4a]">
                            Chapter could not be opened
                        </h1>

                        <p className="mt-2 text-sm leading-6 text-slate-500">
                            {errorMessage}
                        </p>

                        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-center">
                            <Link
                                href={`/events/${eventId}/subjects/${subjectId}`}
                                className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
                            >
                                <ArrowLeft size={15} />
                                Back to Subject
                            </Link>

                            <button
                                type="button"
                                onClick={getPageData}
                                className="flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-xs font-bold text-white transition hover:bg-blue-700"
                            >
                                <RefreshCw size={15} />
                                Try Again
                            </button>
                        </div>
                    </div>
                </main>

                <Footer />
            </>
        );
    }

    return (
        <>
            <EventProvider>
                <Navbar />
            </EventProvider>

            <main className="min-h-screen bg-slate-50 px-3 py-4 sm:px-6 sm:py-7 lg:px-8">
                <div className="mx-auto w-full max-w-[1250px]">
                    <nav className="mb-4 flex items-center gap-1.5 overflow-x-auto whitespace-nowrap rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[10px] shadow-sm sm:text-xs">
                        <Link
                            href="/"
                            className="flex items-center gap-1 font-semibold text-slate-500 transition hover:text-blue-700"
                        >
                            <Home size={13} />
                            Home
                        </Link>

                        <ChevronRight
                            size={13}
                            className="shrink-0 text-slate-300"
                        />

                        <Link
                            href={`/events/${eventId}`}
                            className="font-semibold text-slate-500 transition hover:text-blue-700"
                        >
                            {event?.name || "Event"}
                        </Link>

                        <ChevronRight
                            size={13}
                            className="shrink-0 text-slate-300"
                        />

                        <Link
                            href={`/events/${eventId}/subjects/${subjectId}`}
                            className="font-semibold text-slate-500 transition hover:text-blue-700"
                        >
                            {subject?.name || "Subject"}
                        </Link>

                        <ChevronRight
                            size={13}
                            className="shrink-0 text-slate-300"
                        />

                        <span className="max-w-48 truncate font-bold text-blue-700">
                            {chapter.chapterName}
                        </span>
                    </nav>

                    <section className="relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-[#071a4a] via-[#102a63] to-blue-700 text-white shadow-md">
                        <div className="relative z-10 grid gap-5 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-center lg:p-9">
                            <div className="min-w-0">
                                <Link
                                    href={`/events/${eventId}/subjects/${subjectId}`}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-[10px] font-bold text-white backdrop-blur transition hover:bg-white/20"
                                >
                                    <ArrowLeft size={14} />
                                    Back to Chapters
                                </Link>

                                <div className="mt-5 flex flex-wrap items-center gap-2">
                                    <span className="rounded-full bg-white px-3 py-1 text-[9px] font-extrabold uppercase tracking-[0.13em] text-blue-700">
                                        Chapter{" "}
                                        {chapter.chapterNumber}
                                    </span>

                                    <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[9px] font-bold text-blue-100">
                                        {sortedTopics.length}{" "}
                                        {sortedTopics.length === 1
                                            ? "Topic"
                                            : "Topics"}
                                    </span>
                                </div>

                                <h1 className="mt-4 max-w-3xl text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl lg:text-4xl">
                                    {chapter.chapterName}
                                </h1>

                                <p className="mt-3 max-w-2xl text-xs leading-6 text-blue-100 sm:text-sm">
                                    Study the topics in order to
                                    build a complete understanding of
                                    this chapter.
                                </p>

                                <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[10px] font-semibold text-blue-100 sm:text-xs">
                                    <span>
                                        Event:{" "}
                                        <strong className="text-white">
                                            {event?.name ||
                                                "Event"}
                                        </strong>
                                    </span>

                                    <span>
                                        Subject:{" "}
                                        <strong className="text-white">
                                            {subject?.name ||
                                                "Subject"}
                                        </strong>
                                    </span>
                                </div>
                            </div>

                            <div className="overflow-hidden rounded-2xl border border-white/15 bg-white/10 p-2 shadow-lg backdrop-blur">
                                <div className="h-44 overflow-hidden rounded-xl bg-white/10 sm:h-52 lg:h-56">
                                    {chapter.image?.url ? (
                                        <img
                                            src={chapter.image.url}
                                            alt={
                                                chapter.chapterName
                                            }
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full flex-col items-center justify-center text-center">
                                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-blue-700 shadow-md">
                                                <GraduationCap
                                                    size={31}
                                                />
                                            </div>

                                            <p className="mt-3 text-xs font-bold text-white">
                                                Chapter{" "}
                                                {
                                                    chapter.chapterNumber
                                                }
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <BookOpen
                            size={250}
                            strokeWidth={0.8}
                            className="absolute -bottom-20 left-[42%] hidden rotate-[-8deg] text-white/[0.04] lg:block"
                        />
                    </section>

                    <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                            <div>
                                <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-blue-600 sm:text-[10px]">
                                    Chapter material
                                </p>

                                <h2 className="mt-1 text-lg font-extrabold text-[#071a4a] sm:text-xl">
                                    Topics in this Chapter
                                </h2>

                                <p className="mt-1 text-[10px] leading-5 text-slate-500 sm:text-xs">
                                    Open a topic to read its complete
                                    book-style study material.
                                </p>
                            </div>

                            {sortedTopics.length > 0 && (
                                <div className="flex h-9 w-fit items-center gap-2 rounded-lg bg-blue-50 px-3 text-[10px] font-bold text-blue-700">
                                    <Layers3 size={14} />
                                    {sortedTopics.length} Topics
                                </div>
                            )}
                        </div>

                        {topicsError ? (
                            <div className="flex min-h-52 items-center justify-center bg-slate-50/60 px-4 py-10 text-center">
                                <div>
                                    <RefreshCw
                                        size={32}
                                        className="mx-auto text-red-400"
                                    />

                                    <p className="mt-3 text-sm font-bold text-slate-700">
                                        {topicsError}
                                    </p>

                                    <button
                                        type="button"
                                        onClick={getPageData}
                                        className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-[10px] font-bold text-white transition hover:bg-blue-700"
                                    >
                                        <RefreshCw size={14} />
                                        Try Again
                                    </button>
                                </div>
                            </div>
                        ) : sortedTopics.length === 0 ? (
                            <div className="flex min-h-56 items-center justify-center bg-slate-50/60 px-4 py-10 text-center">
                                <div>
                                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                                        <FileText size={27} />
                                    </div>

                                    <h3 className="mt-4 text-sm font-extrabold text-[#071a4a]">
                                        No topics are available
                                    </h3>

                                    <p className="mx-auto mt-1 max-w-sm text-[10px] leading-5 text-slate-500 sm:text-xs">
                                        Topics will appear here when
                                        study material is added to
                                        this chapter.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3 bg-slate-50/60 p-3 sm:gap-4 sm:p-5 lg:grid-cols-4">
                                {sortedTopics.map(
                                    (topicItem, index) => (
                                        <Link
                                            key={topicItem._id}
                                            href={topicLink(
                                                topicItem._id,
                                            )}
                                            className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
                                        >
                                            <div className="relative h-24 overflow-hidden bg-gradient-to-br from-blue-50 to-slate-100 sm:h-32">
                                                {topicItem.image
                                                    ?.url ? (
                                                    <img
                                                        src={
                                                            topicItem
                                                                .image
                                                                .url
                                                        }
                                                        alt={
                                                            topicItem.topicName
                                                        }
                                                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                                    />
                                                ) : (
                                                    <div className="flex h-full items-center justify-center">
                                                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm sm:h-13 sm:w-13">
                                                            <BookOpen
                                                                size={
                                                                    23
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                <span className="absolute left-2 top-2 rounded-lg bg-[#071a4a]/90 px-2 py-1 text-[8px] font-extrabold uppercase tracking-[0.08em] text-white backdrop-blur sm:text-[9px]">
                                                    Topic{" "}
                                                    {
                                                        topicItem.topicNumber
                                                    }
                                                </span>
                                            </div>

                                            <div className="flex flex-1 flex-col p-3 sm:p-4">
                                                <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600 sm:text-[9px]">
                                                    Lesson{" "}
                                                    {index + 1}
                                                </p>

                                                <h3 className="mt-1 line-clamp-2 text-xs font-extrabold leading-5 text-[#071a4a] sm:text-sm">
                                                    {
                                                        topicItem.topicName
                                                    }
                                                </h3>

                                                <div className="mt-auto pt-3">
                                                    <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                                                        <span className="flex items-center gap-1 text-[8px] font-semibold text-slate-500 sm:text-[10px]">
                                                            <FileText
                                                                size={
                                                                    12
                                                                }
                                                            />
                                                            {topicItem
                                                                .sections
                                                                ?.length ||
                                                                0}{" "}
                                                            Sections
                                                        </span>

                                                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                                                            <ArrowRight
                                                                size={
                                                                    14
                                                                }
                                                            />
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ),
                                )}
                            </div>
                        )}
                    </section>

                    {sortedTopics.length > 0 && (
                        <section className="mt-5 overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 via-white to-blue-50 p-4 shadow-sm sm:p-5">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                                        <GraduationCap
                                            size={23}
                                        />
                                    </div>

                                    <div>
                                        <p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-blue-600">
                                            Begin learning
                                        </p>

                                        <h2 className="mt-1 text-sm font-extrabold text-[#071a4a] sm:text-base">
                                            Start with Topic{" "}
                                            {
                                                sortedTopics[0]
                                                    .topicNumber
                                            }
                                        </h2>

                                        <p className="mt-1 text-[10px] text-slate-500 sm:text-xs">
                                            Follow the topics in
                                            order for the best
                                            learning experience.
                                        </p>
                                    </div>
                                </div>

                                <Link
                                    href={topicLink(
                                        sortedTopics[0]._id,
                                    )}
                                    className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-[10px] font-bold text-white transition hover:bg-blue-700 sm:w-auto"
                                >
                                    Start Reading
                                    <ArrowRight size={14} />
                                </Link>
                            </div>
                        </section>
                    )}
                </div>
            </main>

            <Footer />
        </>
    );
};

export default ChapterPage;