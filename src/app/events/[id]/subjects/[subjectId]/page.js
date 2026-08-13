"use client";

import Footer from "@/app/components/footer";
import Navbar from "@/app/components/navbar";
import { EventProvider } from "@/context/EventContext";
import axios from "axios";
import Link from "next/link";
import {
    ArrowLeft,
    BookOpenCheck,
    BookOpenText,
    ChevronRight,
    Clock3,
    GraduationCap,
    Hash,
    Layers3,
    LoaderCircle,
    Sparkles,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const SubjectPage = () => {
    const { id, subjectId } = useParams();

    const [subject, setSubject] = useState(null);
    const [chapters, setChapters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingChapters, setLoadingChapters] =
        useState(false);
    const [errorMessage, setErrorMessage] =
        useState("");
    const [chapterError, setChapterError] =
        useState("");

    const getChapters = async () => {
        try {
            setLoadingChapters(true);
            setChapterError("");

            const result = await axios.get(
                `/api/chapter/subject/${subjectId}`,
            );

            if (result.data.success) {
                const sortedChapters = [
                    ...(result.data.chapters || []),
                ].sort(
                    (firstChapter, secondChapter) =>
                        Number(firstChapter.chapterNumber) -
                        Number(secondChapter.chapterNumber),
                );

                setChapters(sortedChapters);
                return;
            }

            setChapters([]);

            setChapterError(
                result.data.message ||
                "Chapters could not be loaded",
            );
        } catch (error) {
            if (error.response?.status === 404) {
                setChapters([]);
                setChapterError("");
                return;
            }

            console.log(error);
            setChapters([]);

            setChapterError(
                error.response?.data?.message ||
                "Chapters could not be loaded",
            );
        } finally {
            setLoadingChapters(false);
        }
    };

    const getPageData = async () => {
        try {
            setLoading(true);
            setErrorMessage("");
            setChapterError("");
            setChapters([]);

            const result = await axios.get(
                `/api/subject/${subjectId}`,
            );

            if (!result.data.success) {
                setSubject(null);

                setErrorMessage(
                    result.data.message ||
                    "Subject could not be loaded",
                );

                return;
            }

            const currentSubject = result.data.subject;

            const subjectEventId =
                currentSubject.event?._id ||
                currentSubject.event;

            if (
                subjectEventId &&
                String(subjectEventId) !== String(id)
            ) {
                setSubject(null);

                setErrorMessage(
                    "This subject does not belong to this event",
                );

                return;
            }

            setSubject(currentSubject);

            await getChapters();
        } catch (error) {
            console.log(error);
            setSubject(null);

            setErrorMessage(
                error.response?.data?.message ||
                "Subject could not be loaded",
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id && subjectId) {
            getPageData();
        }
    }, [id, subjectId]);

    const eventName =
        typeof subject?.event === "object"
            ? subject.event?.name
            : "";

    return (
        <div className="min-h-screen bg-[#f4f7fb]">
            <EventProvider>
                <Navbar />
            </EventProvider>

            <main className="min-h-[calc(100vh-80px)] px-3 py-4 sm:px-5 sm:py-6 lg:px-7">
                <div className="mx-auto w-full max-w-[1300px]">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <Link
                            href={`/events/${id}#subjects`}
                            className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-bold text-slate-600 shadow-sm transition hover:border-blue-200 hover:text-blue-700"
                        >
                            <ArrowLeft size={16} />
                            Back to subjects
                        </Link>

                        {!loading && subject && (
                            <nav
                                aria-label="Breadcrumb"
                                className="flex min-w-0 items-center gap-1.5 text-[11px] font-semibold text-slate-500"
                            >
                                <Link
                                    href={`/events/${id}`}
                                    className="transition hover:text-blue-700"
                                >
                                    Event
                                </Link>

                                <ChevronRight size={13} />

                                <span className="max-w-40 truncate text-blue-700 sm:max-w-64">
                                    {subject.name}
                                </span>
                            </nav>
                        )}
                    </div>

                    {loading ? (
                        <SubjectPageLoading />
                    ) : errorMessage || !subject ? (
                        <SubjectPageError
                            message={
                                errorMessage ||
                                "Subject is not available"
                            }
                            onRetry={getPageData}
                            eventId={id}
                        />
                    ) : (
                        <>
                            <section className="relative mt-4 overflow-hidden rounded-2xl bg-[#071a4a] shadow-[0_18px_45px_-30px_rgba(7,26,74,0.8)]">
                                <div className="absolute -left-20 -top-24 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />

                                <div className="absolute -bottom-32 right-1/3 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />

                                <div className="relative grid lg:grid-cols-[minmax(0,1.12fr)_minmax(320px,0.88fr)] lg:items-stretch">
                                    <div className="flex flex-col justify-center px-5 py-6 sm:px-7 sm:py-8 lg:px-9 lg:py-9">
                                        <div className="flex w-fit items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.13em] text-blue-100 backdrop-blur-sm sm:text-[9px]">
                                            <GraduationCap size={12} />

                                            {eventName ||
                                                "StudiesForge subject"}
                                        </div>

                                        <h1 className="mt-3 max-w-2xl text-2xl font-black tracking-tight text-white sm:text-3xl lg:text-4xl lg:leading-[1.1]">
                                            {subject.name}
                                        </h1>

                                        <p className="mt-2.5 max-w-xl text-xs leading-5 text-blue-100/85 sm:text-sm sm:leading-6">
                                            Build your understanding chapter by
                                            chapter with an organized learning path
                                            for {subject.name}.
                                        </p>

                                        <div className="mt-5 grid max-w-lg grid-cols-2 gap-2.5">
                                            <div className="rounded-xl border border-white/10 bg-white/10 p-3 backdrop-blur-sm">
                                                <div className="flex items-center gap-1.5 text-blue-200">
                                                    <Layers3 size={14} />

                                                    <span className="text-[8px] font-bold uppercase tracking-[0.1em]">
                                                        Available
                                                    </span>
                                                </div>

                                                <p className="mt-1.5 text-lg font-black text-white sm:text-xl">
                                                    {chapters.length}
                                                </p>

                                                <p className="text-[9px] font-semibold text-blue-100/70 sm:text-[10px]">
                                                    {chapters.length === 1
                                                        ? "Chapter"
                                                        : "Chapters"}
                                                </p>
                                            </div>

                                            <div className="rounded-xl border border-white/10 bg-white/10 p-3 backdrop-blur-sm">
                                                <div className="flex items-center gap-1.5 text-blue-200">
                                                    <BookOpenCheck size={14} />

                                                    <span className="text-[8px] font-bold uppercase tracking-[0.1em]">
                                                        Learning path
                                                    </span>
                                                </div>

                                                <p className="mt-1.5 text-xs font-extrabold text-white sm:text-sm">
                                                    Well organized
                                                </p>

                                                <p className="mt-0.5 text-[9px] font-semibold text-blue-100/70 sm:text-[10px]">
                                                    Follow chapters in order
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="relative p-3 pt-0 sm:p-5 sm:pt-0 lg:p-5 lg:pl-0">
                                        <div className="relative h-48 overflow-hidden rounded-xl border border-white/10 bg-blue-900/50 sm:h-60 lg:h-full lg:min-h-[300px]">
                                            {subject.image?.url ? (
                                                <img
                                                    src={subject.image.url}
                                                    alt={subject.name}
                                                    className="absolute inset-0 h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-700 to-[#071a4a] text-blue-100">
                                                    <BookOpenText
                                                        size={54}
                                                        strokeWidth={1.25}
                                                    />
                                                </div>
                                            )}

                                            <div className="absolute inset-0 bg-gradient-to-t from-[#071a4a]/80 via-transparent to-transparent" />

                                            <div className="absolute inset-x-3 bottom-3 rounded-xl border border-white/15 bg-[#071a4a]/70 p-3 text-white backdrop-blur-md sm:inset-x-4 sm:bottom-4">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-blue-700">
                                                        <Sparkles size={15} />
                                                    </div>

                                                    <div className="min-w-0">
                                                        <p className="text-[8px] font-bold uppercase tracking-[0.11em] text-blue-200">
                                                            Subject library
                                                        </p>

                                                        <p className="mt-0.5 truncate text-xs font-extrabold sm:text-sm">
                                                            {subject.name}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                                    <div className="flex items-start gap-2.5">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                                            <BookOpenCheck size={18} />
                                        </div>

                                        <div>
                                            <p className="text-[8px] font-bold uppercase tracking-[0.13em] text-blue-600 sm:text-[9px]">
                                                Course outline
                                            </p>

                                            <h2 className="mt-0.5 text-base font-black tracking-tight text-[#071a4a] sm:text-lg">
                                                {subject.name} Chapters
                                            </h2>

                                            <p className="mt-1 text-[10px] leading-4 text-slate-500 sm:text-xs">
                                                Start from any chapter and explore
                                                the available learning material.
                                            </p>
                                        </div>
                                    </div>

                                    {!loadingChapters &&
                                        !chapterError && (
                                            <div className="flex w-fit items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-extrabold text-blue-700">
                                                <Layers3 size={13} />

                                                {chapters.length}{" "}
                                                {chapters.length === 1
                                                    ? "chapter"
                                                    : "chapters"}
                                            </div>
                                        )}
                                </div>

                                {loadingChapters ? (
                                    <ChaptersLoading />
                                ) : chapterError ? (
                                    <ChapterError
                                        message={chapterError}
                                        onRetry={getChapters}
                                    />
                                ) : chapters.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-3 bg-slate-50/70 p-3 sm:p-4 lg:grid-cols-4">
                                        {chapters.map((chapter) => (
                                            <article
                                                key={chapter._id}
                                                className="group flex min-w-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                                            >
                                                <div className="relative h-24 overflow-hidden bg-gradient-to-br from-blue-50 via-slate-50 to-blue-100 sm:h-28 lg:h-32">
                                                    {chapter.image?.url ? (
                                                        <img
                                                            src={chapter.image.url}
                                                            alt={chapter.chapterName}
                                                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
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

                                                    <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#071a4a]/40 to-transparent" />

                                                    <div className="absolute left-2 top-2 flex items-center gap-1 rounded-lg bg-[#071a4a]/90 px-2 py-1 text-[8px] font-extrabold text-white shadow-sm backdrop-blur-sm sm:text-[9px]">
                                                        <Hash size={10} />

                                                        Chapter{" "}
                                                        {chapter.chapterNumber}
                                                    </div>
                                                </div>

                                                <div className="flex flex-1 flex-col p-3 sm:p-3.5">
                                                    <p className="truncate text-[7px] font-bold uppercase tracking-[0.12em] text-blue-600 sm:text-[8px]">
                                                        {subject.name}
                                                    </p>

                                                    <h3 className="mt-1 line-clamp-2 text-xs font-black leading-4 text-[#071a4a] sm:text-sm sm:leading-5">
                                                        {chapter.chapterName}
                                                    </h3>

                                                    <div className="mt-3 border-t border-slate-100 pt-2.5">
                                                        <div className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-2 py-2 text-[8px] font-semibold text-slate-500 sm:text-[9px]">
                                                            <Clock3
                                                                size={12}
                                                                className="shrink-0 text-blue-600"
                                                            />

                                                            Resources coming soon
                                                        </div>
                                                    </div>
                                                </div>
                                            </article>
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyChapters
                                        subjectName={subject.name}
                                        eventId={id}
                                    />
                                )}
                            </section>
                        </>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

const SubjectPageLoading = () => {
    return (
        <div className="mt-4 animate-pulse overflow-hidden rounded-2xl bg-[#071a4a]">
            <div className="grid lg:grid-cols-[minmax(0,1.12fr)_minmax(320px,0.88fr)]">
                <div className="px-5 py-6 sm:px-7 sm:py-8 lg:px-9 lg:py-9">
                    <div className="h-5 w-36 rounded-full bg-white/10" />

                    <div className="mt-4 h-9 w-3/4 max-w-sm rounded-lg bg-white/15" />

                    <div className="mt-4 h-3 w-full max-w-xl rounded bg-white/10" />

                    <div className="mt-2 h-4 w-4/5 max-w-lg rounded bg-white/10" />

                    <div className="mt-5 grid max-w-lg grid-cols-2 gap-2.5">
                        <div className="h-20 rounded-xl bg-white/10" />

                        <div className="h-20 rounded-xl bg-white/10" />
                    </div>
                </div>

                <div className="p-3 pt-0 sm:p-5 sm:pt-0 lg:p-5 lg:pl-0">
                    <div className="h-48 rounded-xl bg-white/10 sm:h-60 lg:h-full lg:min-h-[300px]" />
                </div>
            </div>
        </div>
    );
};

const ChaptersLoading = () => {
    return (
        <div className="flex min-h-56 flex-col items-center justify-center bg-slate-50/70 px-4 py-9 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <LoaderCircle
                    size={22}
                    className="animate-spin"
                />
            </div>

            <p className="mt-3 text-xs font-extrabold text-[#071a4a]">
                Loading chapters
            </p>

            <p className="mt-1 text-[10px] text-slate-500">
                Preparing the subject outline...
            </p>
        </div>
    );
};

const ChapterError = ({
    message,
    onRetry,
}) => {
    return (
        <div className="flex min-h-56 items-center justify-center bg-slate-50/70 px-4 py-9 text-center">
            <div className="max-w-sm">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-500">
                    <BookOpenText size={22} />
                </div>

                <h3 className="mt-3 text-sm font-black text-[#071a4a]">
                    Chapters could not be loaded
                </h3>

                <p className="mt-1.5 text-xs leading-5 text-slate-500">
                    {message}
                </p>

                <button
                    type="button"
                    onClick={onRetry}
                    className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-[11px] font-bold text-white transition hover:bg-blue-700"
                >
                    Try again
                </button>
            </div>
        </div>
    );
};

const EmptyChapters = ({
    subjectName,
    eventId,
}) => {
    return (
        <div className="flex min-h-60 items-center justify-center bg-slate-50/70 px-4 py-9 text-center">
            <div className="max-w-md">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                    <BookOpenText
                        size={24}
                        strokeWidth={1.7}
                    />
                </div>

                <h3 className="mt-4 text-base font-black text-[#071a4a]">
                    No chapters are available yet
                </h3>

                <p className="mt-1.5 text-xs leading-5 text-slate-500">
                    Chapters for {subjectName} will appear here
                    as soon as they are added.
                </p>

                <Link
                    href={`/events/${eventId}#subjects`}
                    className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-blue-700"
                >
                    Explore other subjects

                    <ChevronRight size={17} />
                </Link>
            </div>
        </div>
    );
};

const SubjectPageError = ({
    message,
    onRetry,
    eventId,
}) => {
    return (
        <section className="mt-4 flex min-h-[320px] items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white px-4 py-10 text-center shadow-sm">
            <div className="max-w-md">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500">
                    <BookOpenText size={24} />
                </div>

                <h1 className="mt-4 text-lg font-black text-[#071a4a] sm:text-xl">
                    Subject could not be opened
                </h1>

                <p className="mt-1.5 text-xs leading-5 text-slate-500">
                    {message}
                </p>

                <div className="mt-5 flex flex-wrap justify-center gap-2.5">
                    <button
                        type="button"
                        onClick={onRetry}
                        className="rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-blue-700"
                    >
                        Try again
                    </button>

                    <Link
                        href={`/events/${eventId}#subjects`}
                        className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
                    >
                        Back to subjects
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default SubjectPage;