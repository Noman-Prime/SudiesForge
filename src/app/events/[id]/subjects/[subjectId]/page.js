"use client";

import Footer from "@/app/components/footer";
import Navbar from "@/app/components/navbar";
import { EventProvider } from "@/context/EventContext";
import axios from "axios";
import Link from "next/link";
import {
    ArrowLeft,
    BookOpenText,
    ChevronRight,
    Construction,
    GraduationCap,
    Layers3,
    LoaderCircle,
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
                    (
                        firstChapter,
                        secondChapter,
                    ) =>
                        Number(
                            firstChapter.chapterNumber,
                        ) -
                        Number(
                            secondChapter.chapterNumber,
                        ),
                );

                setChapters(sortedChapters);
            }
        } catch (error) {
            if (error.response?.status === 404) {
                setChapters([]);
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

            const currentSubject =
                result.data.subject;

            const subjectEventId =
                currentSubject.event?._id ||
                currentSubject.event;

            if (
                subjectEventId &&
                String(subjectEventId) !==
                String(id)
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

    return (
        <div className="min-h-screen bg-slate-50">
            <EventProvider>
                <Navbar />
            </EventProvider>

            <main className="min-h-[calc(100vh-80px)] px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
                <div className="mx-auto w-full max-w-[1300px]">
                    <Link
                        href={`/events/${id}#subjects`}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-700"
                    >
                        <ArrowLeft size={17} />
                        Back to event
                    </Link>

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
                            <nav
                                aria-label="Breadcrumb"
                                className="mt-5 flex flex-wrap items-center gap-1.5 text-xs font-semibold text-slate-500"
                            >
                                <Link
                                    href={`/events/${id}`}
                                    className="transition hover:text-blue-700"
                                >
                                    Event
                                </Link>

                                <ChevronRight
                                    size={14}
                                />

                                <Link
                                    href={`/events/${id}#subjects`}
                                    className="transition hover:text-blue-700"
                                >
                                    Subjects
                                </Link>

                                <ChevronRight
                                    size={14}
                                />

                                <span className="text-blue-700">
                                    {subject.name}
                                </span>
                            </nav>

                            <section className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                <div className="grid lg:grid-cols-[1fr_420px]">
                                    <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
                                        <div className="flex w-fit items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-blue-700">
                                            <GraduationCap
                                                size={14}
                                            />
                                            Subject workspace
                                        </div>

                                        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-[#071a4a] sm:text-4xl">
                                            {subject.name}
                                        </h1>

                                        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
                                            Explore chapters,
                                            topics, notes, videos
                                            and practice material
                                            for {subject.name}.
                                        </p>

                                        <div className="mt-6 flex flex-wrap gap-3">
                                            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                                                <Layers3
                                                    size={18}
                                                    className="text-blue-600"
                                                />

                                                <div>
                                                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                                                        Chapters
                                                    </p>

                                                    <p className="text-sm font-bold text-slate-700">
                                                        {
                                                            chapters.length
                                                        }{" "}
                                                        {chapters.length ===
                                                            1
                                                            ? "chapter"
                                                            : "chapters"}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                                                <BookOpenText
                                                    size={18}
                                                    className="text-blue-600"
                                                />

                                                <div>
                                                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                                                        Resources
                                                    </p>

                                                    <p className="text-sm font-bold text-slate-700">
                                                        Coming soon
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="relative min-h-64 overflow-hidden bg-blue-50 lg:min-h-[360px]">
                                        {subject.image?.url ? (
                                            <>
                                                <img
                                                    src={
                                                        subject
                                                            .image
                                                            .url
                                                    }
                                                    alt={
                                                        subject.name
                                                    }
                                                    className="absolute inset-0 h-full w-full object-cover"
                                                />

                                                <div className="absolute inset-0 bg-gradient-to-t from-[#071a4a]/30 via-transparent to-transparent" />
                                            </>
                                        ) : (
                                            <div className="flex h-full min-h-64 items-center justify-center text-blue-500 lg:min-h-[360px]">
                                                <BookOpenText
                                                    size={70}
                                                    strokeWidth={
                                                        1.4
                                                    }
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </section>

                            <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-600">
                                            Learning material
                                        </p>

                                        <h2 className="mt-1 text-lg font-extrabold text-[#071a4a] sm:text-xl">
                                            {subject.name}{" "}
                                            Chapters
                                        </h2>

                                        <p className="mt-1 text-[11px] leading-5 text-slate-500 sm:text-xs">
                                            Browse the chapters
                                            available under this
                                            subject.
                                        </p>
                                    </div>

                                    {!loadingChapters &&
                                        !chapterError && (
                                            <div className="flex h-9 w-fit min-w-9 items-center justify-center rounded-xl bg-blue-50 px-3 text-xs font-extrabold text-blue-700">
                                                {
                                                    chapters.length
                                                }
                                            </div>
                                        )}
                                </div>

                                {loadingChapters ? (
                                    <div className="flex min-h-64 flex-col items-center justify-center bg-slate-50/60 px-5 py-10 text-center">
                                        <LoaderCircle
                                            size={30}
                                            className="animate-spin text-blue-600"
                                        />

                                        <p className="mt-3 text-xs font-bold text-slate-500">
                                            Loading
                                            chapters...
                                        </p>
                                    </div>
                                ) : chapterError ? (
                                    <div className="flex min-h-64 items-center justify-center bg-slate-50/60 px-5 py-10 text-center">
                                        <div>
                                            <BookOpenText
                                                size={38}
                                                className="mx-auto text-red-400"
                                            />

                                            <h3 className="mt-4 text-sm font-extrabold text-[#071a4a]">
                                                Chapters could
                                                not be loaded
                                            </h3>

                                            <p className="mt-1 text-xs text-slate-500">
                                                {
                                                    chapterError
                                                }
                                            </p>

                                            <button
                                                type="button"
                                                onClick={
                                                    getChapters
                                                }
                                                className="mt-4 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-blue-700"
                                            >
                                                Try again
                                            </button>
                                        </div>
                                    </div>
                                ) : chapters.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-3 bg-slate-50/60 p-3 sm:grid-cols-3 sm:gap-4 sm:p-5 lg:grid-cols-4">
                                        {chapters.map(
                                            (chapter) => (
                                                <article
                                                    key={
                                                        chapter._id
                                                    }
                                                    className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                                                >
                                                    <div className="relative h-28 overflow-hidden bg-gradient-to-br from-blue-50 to-slate-100 sm:h-36">
                                                        {chapter
                                                            .image
                                                            ?.url ? (
                                                            <img
                                                                src={
                                                                    chapter
                                                                        .image
                                                                        .url
                                                                }
                                                                alt={
                                                                    chapter.chapterName
                                                                }
                                                                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                                            />
                                                        ) : (
                                                            <div className="flex h-full w-full items-center justify-center">
                                                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">
                                                                    <BookOpenText
                                                                        size={
                                                                            24
                                                                        }
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div className="absolute left-2.5 top-2.5 rounded-lg bg-[#102a63]/90 px-2 py-1 text-[9px] font-bold text-white shadow-sm backdrop-blur-sm sm:text-[10px]">
                                                            Chapter{" "}
                                                            {
                                                                chapter.chapterNumber
                                                            }
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-1 flex-col p-3 sm:p-4">
                                                        <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-blue-600 sm:text-[10px]">
                                                            {
                                                                subject.name
                                                            }
                                                        </p>

                                                        <h3 className="mt-1 line-clamp-2 text-sm font-extrabold text-[#071a4a] sm:text-base">
                                                            {
                                                                chapter.chapterName
                                                            }
                                                        </h3>

                                                        <div className="mt-auto border-t border-slate-100 pt-3">
                                                            <div className="flex items-center gap-2 text-[9px] font-semibold text-slate-500 sm:text-[11px]">
                                                                <Construction
                                                                    size={
                                                                        14
                                                                    }
                                                                    className="shrink-0 text-blue-500"
                                                                />
                                                                Study
                                                                material
                                                                will
                                                                appear
                                                                here
                                                            </div>
                                                        </div>
                                                    </div>
                                                </article>
                                            ),
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex min-h-64 items-center justify-center bg-slate-50/60 px-5 py-10 text-center">
                                        <div className="max-w-md">
                                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                                                <BookOpenText
                                                    size={27}
                                                    strokeWidth={
                                                        1.8
                                                    }
                                                />
                                            </div>

                                            <h3 className="mt-4 text-base font-extrabold text-[#071a4a]">
                                                No chapters are
                                                available
                                            </h3>

                                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                                Chapters for{" "}
                                                {subject.name}{" "}
                                                will appear here
                                                when they are
                                                added.
                                            </p>

                                            <Link
                                                href={`/events/${id}#subjects`}
                                                className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                                            >
                                                Explore other
                                                subjects
                                                <ChevronRight
                                                    size={17}
                                                />
                                            </Link>
                                        </div>
                                    </div>
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
        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="grid animate-pulse lg:grid-cols-[1fr_420px]">
                <div className="p-6 sm:p-8 lg:p-10">
                    <div className="h-7 w-40 rounded-full bg-slate-200" />
                    <div className="mt-5 h-10 w-64 rounded-lg bg-slate-200" />
                    <div className="mt-4 h-4 w-full max-w-xl rounded bg-slate-100" />
                    <div className="mt-2 h-4 w-4/5 max-w-lg rounded bg-slate-100" />

                    <div className="mt-7 flex gap-3">
                        <div className="h-16 w-36 rounded-xl bg-slate-100" />
                        <div className="h-16 w-36 rounded-xl bg-slate-100" />
                    </div>
                </div>

                <div className="min-h-64 bg-slate-200 lg:min-h-[360px]" />
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
        <section className="mt-5 flex min-h-96 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-10 text-center shadow-sm">
            <div>
                <BookOpenText
                    size={48}
                    className="mx-auto text-red-400"
                />

                <h1 className="mt-4 text-xl font-extrabold text-[#071a4a]">
                    Subject could not be opened
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                    {message}
                </p>

                <div className="mt-5 flex flex-wrap justify-center gap-3">
                    <button
                        type="button"
                        onClick={onRetry}
                        className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                        Try again
                    </button>

                    <Link
                        href={`/events/${eventId}#subjects`}
                        className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                    >
                        Back to subjects
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default SubjectPage;