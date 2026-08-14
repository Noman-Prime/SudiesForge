"use client";

import Footer from "@/app/components/footer";
import Navbar from "@/app/components/navbar";
import { EventProvider } from "@/context/EventContext";
import axios from "axios";
import Link from "next/link";
import { AlertCircle, ArrowLeft, ArrowRight, BookOpen, BookOpenText, ChevronRight, GraduationCap, RefreshCw } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const sortChapters = (items) => {
    return [...items].sort((first, second) => Number(first.chapterNumber) - Number(second.chapterNumber));
};

const SubjectPage = () => {
    const { id, subjectId } = useParams();
    const [subject, setSubject] = useState(null);
    const [chapters, setChapters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingChapters, setLoadingChapters] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [chapterError, setChapterError] = useState("");

    const handleChaptersResult = (result) => {
        if (result.status === "fulfilled" && result.value.data.success) {
            setChapters(sortChapters(result.value.data.chapters || []));
            setChapterError("");
            return;
        }

        if (result.status === "rejected" && result.reason?.response?.status === 404) {
            setChapters([]);
            setChapterError("");
            return;
        }

        setChapters([]);
        setChapterError(result.reason?.response?.data?.message || "Chapters could not be loaded");
    };

    const getPageData = async () => {
        try {
            setLoading(true);
            setErrorMessage("");
            setChapterError("");

            const [subjectResult, chaptersResult] = await Promise.allSettled([
                axios.get(`/api/subject/${subjectId}`),
                axios.get(`/api/chapter/subject/${subjectId}`),
            ]);

            if (subjectResult.status !== "fulfilled" || !subjectResult.value.data.success) {
                setSubject(null);
                setChapters([]);
                setErrorMessage(subjectResult.reason?.response?.data?.message || "Subject could not be loaded");
                return;
            }

            const currentSubject = subjectResult.value.data.subject;
            const subjectEventId = currentSubject.event?._id || currentSubject.event;

            if (subjectEventId && String(subjectEventId) !== String(id)) {
                setSubject(null);
                setChapters([]);
                setErrorMessage("This subject does not belong to this event");
                return;
            }

            setSubject(currentSubject);
            handleChaptersResult(chaptersResult);
        } catch (error) {
            console.log(error);
            setSubject(null);
            setChapters([]);
            setErrorMessage(error.response?.data?.message || "Subject could not be loaded");
        } finally {
            setLoading(false);
        }
    };

    const getChapters = async () => {
        try {
            setLoadingChapters(true);
            setChapterError("");

            const result = await axios.get(`/api/chapter/subject/${subjectId}`);

            if (result.data.success) {
                setChapters(sortChapters(result.data.chapters || []));
            } else {
                setChapters([]);
                setChapterError(result.data.message || "Chapters could not be loaded");
            }
        } catch (error) {
            console.log(error);

            if (error.response?.status === 404) {
                setChapters([]);
                setChapterError("");
                return;
            }

            setChapters([]);
            setChapterError(error.response?.data?.message || "Chapters could not be loaded");
        } finally {
            setLoadingChapters(false);
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

            <main className="min-h-[calc(100vh-80px)] px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
                <div className="mx-auto w-full max-w-[1200px]">
                    <div className="flex items-center justify-between gap-3">
                        <Link href={`/events/${id}#subjects`} className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-[10px] font-bold text-slate-600 shadow-sm transition hover:border-blue-200 hover:text-blue-700">
                            <ArrowLeft size={14} />
                            Subjects
                        </Link>

                        {!loading && subject && (
                            <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 overflow-hidden text-[9px] font-semibold text-slate-500 sm:text-[10px]">
                                <Link href={`/events/${id}`} className="shrink-0 transition hover:text-blue-700">
                                    Event
                                </Link>

                                <ChevronRight size={12} className="shrink-0 text-slate-300" />

                                <span className="truncate text-blue-700">
                                    {subject.name}
                                </span>
                            </nav>
                        )}
                    </div>

                    {loading ? (
                        <SubjectLoading />
                    ) : errorMessage || !subject ? (
                        <SubjectError message={errorMessage || "Subject is not available"} retry={getPageData} eventId={id} />
                    ) : (
                        <>
                            <section className="mt-4 overflow-hidden rounded-2xl border border-[#102a63] bg-[#102a63] shadow-sm">
                                <div className="grid md:grid-cols-[minmax(0,1fr)_280px] md:items-stretch">
                                    <div className="flex flex-col justify-center px-4 py-5 sm:px-6 sm:py-6">
                                        <div className="flex w-fit items-center gap-1.5 rounded-lg border border-white/15 bg-white/10 px-2.5 py-1.5 text-[8px] font-bold uppercase tracking-[0.13em] text-blue-100">
                                            <GraduationCap size={12} />
                                            Subject
                                        </div>

                                        <h1 className="mt-3 text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-3xl">
                                            {subject.name}
                                        </h1>

                                        <p className="mt-2 max-w-xl text-[10px] leading-5 text-blue-100 sm:text-xs">
                                            Follow the available chapters in order and continue to their topics and practice material.
                                        </p>

                                        <div className="mt-4 flex w-fit items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-2">
                                            <BookOpen size={16} className="text-blue-200" />

                                            <span className="text-sm font-extrabold text-white">
                                                {chapters.length}
                                            </span>

                                            <span className="text-[9px] font-semibold text-blue-200">
                                                {chapters.length === 1 ? "Chapter" : "Chapters"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-3 pt-0 md:p-3 md:pl-0">
                                        <div className="h-44 overflow-hidden rounded-xl border border-white/10 bg-blue-900/40 md:h-full md:min-h-52">
                                            {subject.image?.url ? (
                                                <img src={subject.image.url} alt={subject.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-blue-100">
                                                    <BookOpenText size={44} strokeWidth={1.4} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-4 py-4 sm:px-5">
                                    <div className="flex min-w-0 items-start gap-3">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                            <BookOpen size={18} strokeWidth={1.9} />
                                        </div>

                                        <div className="min-w-0">
                                            <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-blue-600 sm:text-[9px]">
                                                Subject chapters
                                            </p>

                                            <h2 className="mt-0.5 text-base font-extrabold text-[#071a4a] sm:text-lg">
                                                {subject.name} Chapters
                                            </h2>

                                            <p className="mt-1 text-[9px] leading-4 text-slate-500 sm:text-[11px]">
                                                Choose a chapter to view its available topics.
                                            </p>
                                        </div>
                                    </div>

                                    {!loadingChapters && !chapterError && (
                                        <span className="flex h-8 min-w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 px-2 text-[10px] font-extrabold text-blue-700">
                                            {chapters.length}
                                        </span>
                                    )}
                                </div>

                                {loadingChapters ? (
                                    <ChaptersLoading />
                                ) : chapterError ? (
                                    <ChaptersError message={chapterError} retry={getChapters} />
                                ) : chapters.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-2.5 bg-slate-50/70 p-3 sm:gap-3 sm:p-4 lg:grid-cols-4">
                                        {chapters.map((chapter) => (
                                            <Link key={chapter._id} href={`/events/${id}/subjects/${subjectId}/chapters/${chapter._id}`} aria-label={`Open chapter ${chapter.chapterNumber}: ${chapter.chapterName}`} className="group min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md">
                                                <div className="relative h-24 overflow-hidden bg-gradient-to-br from-blue-50 to-slate-100 sm:h-28">
                                                    {chapter.image?.url ? (
                                                        <img src={chapter.image.url} alt={chapter.chapterName} loading="lazy" decoding="async" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center text-blue-500">
                                                            <BookOpenText size={27} strokeWidth={1.7} />
                                                        </div>
                                                    )}

                                                    <span className="absolute left-2 top-2 rounded-md border border-white/60 bg-white/90 px-2 py-1 text-[7px] font-extrabold uppercase tracking-[0.1em] text-blue-700 shadow-sm">
                                                        Chapter {chapter.chapterNumber}
                                                    </span>
                                                </div>

                                                <div className="p-2.5 sm:p-3">
                                                    <h3 className="line-clamp-2 min-h-8 text-[10px] font-extrabold leading-4 text-[#071a4a] sm:text-xs">
                                                        {chapter.chapterName}
                                                    </h3>

                                                    <div className="mt-2 flex items-center justify-between gap-2 border-t border-slate-100 pt-2">
                                                        <span className="text-[8px] font-bold text-blue-600">
                                                            Open chapter
                                                        </span>

                                                        <ArrowRight size={13} className="shrink-0 text-blue-500 transition group-hover:translate-x-0.5" />
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyChapters subjectName={subject.name} eventId={id} />
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

const SubjectLoading = () => {
    return (
        <section className="mt-4 animate-pulse overflow-hidden rounded-2xl bg-[#102a63]">
            <div className="grid md:grid-cols-[minmax(0,1fr)_280px]">
                <div className="px-4 py-6 sm:px-6">
                    <div className="h-5 w-20 rounded-lg bg-white/10" />
                    <div className="mt-4 h-8 w-56 max-w-full rounded bg-white/15" />
                    <div className="mt-3 h-3 w-full max-w-lg rounded bg-white/10" />
                    <div className="mt-2 h-3 w-4/5 max-w-md rounded bg-white/10" />
                    <div className="mt-5 h-10 w-28 rounded-xl bg-white/10" />
                </div>

                <div className="p-3 pt-0 md:pl-0 md:pt-3">
                    <div className="h-44 rounded-xl bg-white/10 md:h-full md:min-h-52" />
                </div>
            </div>
        </section>
    );
};

const ChaptersLoading = () => {
    return (
        <div className="grid grid-cols-2 gap-2.5 bg-slate-50/70 p-3 sm:gap-3 sm:p-4 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
                <div key={item} className="animate-pulse overflow-hidden rounded-xl border border-slate-200 bg-white">
                    <div className="h-24 bg-slate-200 sm:h-28" />

                    <div className="p-3">
                        <div className="h-3 w-3/4 rounded bg-slate-200" />
                        <div className="mt-2 h-3 w-1/2 rounded bg-slate-100" />
                        <div className="mt-3 h-6 rounded bg-slate-100" />
                    </div>
                </div>
            ))}
        </div>
    );
};

const ChaptersError = ({ message, retry }) => {
    return (
        <div className="bg-slate-50/70 px-4 py-10 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500">
                <AlertCircle size={19} />
            </div>

            <h3 className="mt-3 text-sm font-extrabold text-[#071a4a]">
                Chapters could not be loaded
            </h3>

            <p className="mx-auto mt-1.5 max-w-md text-[10px] leading-5 text-slate-500">
                {message}
            </p>

            <button type="button" onClick={retry} className="mt-4 inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-4 text-[10px] font-bold text-white transition hover:bg-blue-700">
                <RefreshCw size={13} />
                Try Again
            </button>
        </div>
    );
};

const EmptyChapters = ({ subjectName, eventId }) => {
    return (
        <div className="bg-slate-50/70 px-4 py-10 text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <BookOpenText size={21} strokeWidth={1.7} />
            </div>

            <h3 className="mt-3 text-sm font-extrabold text-[#071a4a]">
                No chapters are available
            </h3>

            <p className="mx-auto mt-1 max-w-md text-[10px] leading-5 text-slate-500">
                Chapters for {subjectName} will appear here when they are added.
            </p>

            <Link href={`/events/${eventId}#subjects`} className="mt-4 inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 text-[10px] font-bold text-slate-600 transition hover:border-blue-200 hover:text-blue-700">
                Other Subjects
                <ChevronRight size={14} />
            </Link>
        </div>
    );
};

const SubjectError = ({ message, retry, eventId }) => {
    return (
        <section className="mt-4 flex min-h-72 items-center justify-center rounded-2xl border border-red-200 bg-white px-4 py-10 text-center shadow-sm">
            <div className="max-w-md">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-500">
                    <AlertCircle size={21} />
                </div>

                <h1 className="mt-3 text-base font-extrabold text-[#071a4a]">
                    Subject could not be opened
                </h1>

                <p className="mt-1.5 text-xs leading-5 text-slate-500">
                    {message}
                </p>

                <div className="mt-5 flex flex-wrap justify-center gap-2">
                    <button type="button" onClick={retry} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-blue-600 px-4 text-[10px] font-bold text-white transition hover:bg-blue-700">
                        <RefreshCw size={13} />
                        Try Again
                    </button>

                    <Link href={`/events/${eventId}#subjects`} className="inline-flex h-9 items-center rounded-lg border border-slate-300 bg-white px-4 text-[10px] font-bold text-slate-600 transition hover:bg-slate-50">
                        Back to Subjects
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default SubjectPage;