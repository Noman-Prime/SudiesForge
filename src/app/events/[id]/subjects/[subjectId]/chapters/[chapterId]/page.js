"use client";

import Footer from "@/app/components/footer";
import Navbar from "@/app/components/navbar";
import { EventProvider } from "@/context/EventContext";
import axios from "axios";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpen, ChevronRight, FileText, Home, Layers3, RefreshCw } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const ChapterPage = () => {
    const { id: eventId, subjectId, chapterId } = useParams();
    const [event, setEvent] = useState(null);
    const [subject, setSubject] = useState(null);
    const [chapter, setChapter] = useState(null);
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [topicsError, setTopicsError] = useState("");

    const sortedTopics = useMemo(() => {
        return [...topics].sort((first, second) => Number(first.topicNumber) - Number(second.topicNumber));
    }, [topics]);

    const getPageData = async () => {
        try {
            setLoading(true);
            setErrorMessage("");
            setTopicsError("");

            const [chapterResult, subjectResult, eventResult, topicsResult] = await Promise.allSettled([
                axios.get(`/api/chapter/${chapterId}`),
                axios.get(`/api/subject/${subjectId}`),
                axios.get(`/api/events/${eventId}`),
                axios.get(`/api/topic/chapter/${chapterId}`),
            ]);

            if (chapterResult.status !== "fulfilled" || !chapterResult.value.data.success) {
                throw new Error(chapterResult.reason?.response?.data?.message || "Chapter could not be loaded");
            }

            if (subjectResult.status !== "fulfilled" || !subjectResult.value.data.success) {
                throw new Error(subjectResult.reason?.response?.data?.message || "Subject could not be loaded");
            }

            if (eventResult.status !== "fulfilled" || !eventResult.value.data.success) {
                throw new Error(eventResult.reason?.response?.data?.message || "Event could not be loaded");
            }

            const chapterData = chapterResult.value.data.chapter;
            const subjectData = subjectResult.value.data.subject;
            const eventData = eventResult.value.data.event;

            const chapterSubjectId = typeof chapterData.subject === "object" ? chapterData.subject?._id : chapterData.subject;
            const subjectEventId = typeof subjectData.event === "object" ? subjectData.event?._id : subjectData.event;

            if (String(chapterSubjectId) !== String(subjectId) || String(subjectEventId) !== String(eventId)) {
                throw new Error("This chapter does not belong to the selected subject and event");
            }

            setChapter(chapterData);
            setSubject(subjectData);
            setEvent(eventData);

            if (topicsResult.status === "fulfilled" && topicsResult.value.data.success) {
                setTopics(topicsResult.value.data.topics || []);
            } else if (topicsResult.reason?.response?.status === 404) {
                setTopics([]);
            } else {
                setTopics([]);
                setTopicsError(topicsResult.reason?.response?.data?.message || "Topics could not be loaded");
            }
        } catch (error) {
            console.log(error);
            setChapter(null);
            setSubject(null);
            setEvent(null);
            setTopics([]);
            setErrorMessage(error.response?.data?.message || error.message || "Chapter could not be loaded");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (eventId && subjectId && chapterId) {
            getPageData();
        }
    }, [eventId, subjectId, chapterId]);

    const topicLink = (topicId) => `/events/${eventId}/subjects/${subjectId}/chapters/${chapterId}/topics/${topicId}`;

    if (loading) {
        return (
            <PageLayout>
                <main className="min-h-[75vh] bg-slate-50 px-3 py-4 sm:px-6 sm:py-6">
                    <div className="mx-auto w-full max-w-[1200px] animate-pulse">
                        <div className="h-9 w-64 max-w-full rounded-xl bg-slate-200" />
                        <div className="mt-4 grid overflow-hidden rounded-2xl border border-slate-200 bg-white md:grid-cols-[1fr_230px]">
                            <div className="h-56 bg-slate-200" />
                            <div className="hidden bg-slate-100 md:block" />
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
                            {[1, 2, 3, 4].map((item) => (
                                <div key={item} className="h-44 rounded-xl bg-slate-200" />
                            ))}
                        </div>
                    </div>
                </main>
            </PageLayout>
        );
    }

    if (errorMessage || !chapter) {
        return (
            <PageLayout>
                <main className="flex min-h-[75vh] items-center justify-center bg-slate-50 px-4 py-10">
                    <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-6 text-center shadow-sm">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500">
                            <BookOpen size={23} />
                        </div>
                        <h1 className="mt-4 text-lg font-extrabold text-[#071a4a]">Chapter could not be opened</h1>
                        <p className="mt-2 text-xs leading-5 text-slate-500">{errorMessage}</p>
                        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
                            <Link href={`/events/${eventId}/subjects/${subjectId}`} className="flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-xs font-bold text-slate-600 transition hover:bg-slate-50">
                                <ArrowLeft size={15} />
                                Back to Subject
                            </Link>
                            <button type="button" onClick={getPageData} className="flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-bold text-white transition hover:bg-blue-700">
                                <RefreshCw size={15} />
                                Try Again
                            </button>
                        </div>
                    </div>
                </main>
            </PageLayout>
        );
    }

    return (
        <PageLayout>
            <main className="min-h-screen bg-slate-50 px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
                <div className="mx-auto w-full max-w-[1200px]">
                    <nav className="mb-4 flex items-center gap-1.5 overflow-x-auto whitespace-nowrap rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[10px] shadow-sm sm:text-xs">
                        <Link href="/" className="flex items-center gap-1 font-semibold text-slate-500 transition hover:text-blue-700">
                            <Home size={13} />
                            Home
                        </Link>
                        <ChevronRight size={13} className="shrink-0 text-slate-300" />
                        <Link href={`/events/${eventId}`} className="font-semibold text-slate-500 transition hover:text-blue-700">
                            {event.name}
                        </Link>
                        <ChevronRight size={13} className="shrink-0 text-slate-300" />
                        <Link href={`/events/${eventId}/subjects/${subjectId}`} className="font-semibold text-slate-500 transition hover:text-blue-700">
                            {subject.name}
                        </Link>
                        <ChevronRight size={13} className="shrink-0 text-slate-300" />
                        <span className="max-w-48 truncate font-bold text-blue-700">{chapter.chapterName}</span>
                    </nav>

                    <section className="overflow-hidden rounded-2xl border border-blue-200 bg-[#071a4a] text-white shadow-sm">
                        <div className="grid md:grid-cols-[minmax(0,1fr)_230px]">
                            <div className="flex flex-col justify-center p-5 sm:p-7">
                                <Link href={`/events/${eventId}/subjects/${subjectId}`} className="inline-flex w-fit items-center gap-1.5 text-[10px] font-bold text-blue-200 transition hover:text-white">
                                    <ArrowLeft size={14} />
                                    Back to Chapters
                                </Link>

                                <div className="mt-5 flex flex-wrap items-center gap-2">
                                    <span className="rounded-lg bg-blue-600 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.12em] text-white">
                                        Chapter {chapter.chapterNumber}
                                    </span>
                                    <span className="rounded-lg border border-white/15 bg-white/10 px-2.5 py-1 text-[9px] font-bold text-blue-100">
                                        {sortedTopics.length} {sortedTopics.length === 1 ? "Topic" : "Topics"}
                                    </span>
                                </div>

                                <h1 className="mt-3 text-xl font-extrabold leading-tight tracking-tight sm:text-2xl lg:text-3xl">{chapter.chapterName}</h1>
                                <p className="mt-2 max-w-2xl text-[10px] leading-5 text-blue-100 sm:text-xs">
                                    Read the topics of this chapter in their assigned order.
                                </p>

                                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-[9px] font-semibold text-blue-200 sm:text-[10px]">
                                    <span>Event: <strong className="text-white">{event.name}</strong></span>
                                    <span>Subject: <strong className="text-white">{subject.name}</strong></span>
                                </div>
                            </div>

                            <div className="relative h-44 overflow-hidden border-t border-white/10 bg-blue-900 md:h-auto md:min-h-56 md:border-l md:border-t-0">
                                {chapter.image?.url ? (
                                    <img src={chapter.image.url} alt={chapter.chapterName} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-blue-700 to-[#071a4a] text-center">
                                        <BookOpen size={36} strokeWidth={1.6} className="text-blue-200" />
                                        <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.12em] text-blue-100">
                                            Chapter {chapter.chapterNumber}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    <section className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-4 sm:px-5">
                            <div>
                                <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-blue-600">Chapter topics</p>
                                <h2 className="mt-1 text-base font-extrabold text-[#071a4a] sm:text-lg">Study Material</h2>
                                <p className="mt-1 text-[10px] leading-5 text-slate-500 sm:text-xs">Select a topic to open its complete reading material.</p>
                            </div>

                            {sortedTopics.length > 0 && (
                                <span className="flex h-8 shrink-0 items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 text-[9px] font-bold text-blue-700">
                                    <Layers3 size={13} />
                                    {sortedTopics.length}
                                </span>
                            )}
                        </div>

                        {topicsError ? (
                            <div className="bg-slate-50/70 px-4 py-10 text-center">
                                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-500">
                                    <RefreshCw size={20} />
                                </div>
                                <p className="mt-3 text-sm font-bold text-slate-700">{topicsError}</p>
                                <button type="button" onClick={getPageData} className="mt-4 inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-[10px] font-bold text-white transition hover:bg-blue-700">
                                    <RefreshCw size={14} />
                                    Try Again
                                </button>
                            </div>
                        ) : sortedTopics.length === 0 ? (
                            <div className="bg-slate-50/70 px-4 py-12 text-center">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                    <FileText size={23} />
                                </div>
                                <h3 className="mt-3 text-sm font-extrabold text-[#071a4a]">No topics are available</h3>
                                <p className="mx-auto mt-1 max-w-sm text-[10px] leading-5 text-slate-500 sm:text-xs">
                                    Topics will appear here when material is added to this chapter.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3 bg-slate-50/70 p-3 sm:p-4 lg:grid-cols-4">
                                {sortedTopics.map((topicItem) => {
                                    const sectionCount = topicItem.sections?.length || 0;

                                    return (
                                        <Link key={topicItem._id} href={topicLink(topicItem._id)} className="group flex min-w-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md">
                                            <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-blue-50 to-slate-100">
                                                {topicItem.image?.url ? (
                                                    <img src={topicItem.image.url} alt={topicItem.topicName} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                                                ) : (
                                                    <div className="flex h-full items-center justify-center text-blue-500">
                                                        <BookOpen size={27} strokeWidth={1.7} />
                                                    </div>
                                                )}
                                                <span className="absolute left-2 top-2 rounded-md bg-[#071a4a]/90 px-2 py-1 text-[7px] font-extrabold uppercase tracking-[0.1em] text-white sm:text-[8px]">
                                                    Topic {topicItem.topicNumber}
                                                </span>
                                            </div>

                                            <div className="flex flex-1 flex-col p-3">
                                                <h3 className="line-clamp-2 min-h-10 text-xs font-extrabold leading-5 text-[#071a4a] sm:text-sm">
                                                    {topicItem.topicName}
                                                </h3>

                                                <div className="mt-auto flex items-center justify-between gap-2 border-t border-slate-100 pt-2.5">
                                                    <span className="flex min-w-0 items-center gap-1 text-[8px] font-semibold text-slate-500 sm:text-[9px]">
                                                        <FileText size={12} className="shrink-0" />
                                                        {sectionCount} {sectionCount === 1 ? "Section" : "Sections"}
                                                    </span>
                                                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                                                        <ArrowRight size={14} />
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </section>

                    {sortedTopics.length > 0 && (
                        <section className="mt-4 flex flex-col gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                            <div className="flex min-w-0 items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
                                    <BookOpen size={20} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-blue-600">Start reading</p>
                                    <h2 className="mt-0.5 truncate text-sm font-extrabold text-[#071a4a]">
                                        Topic {sortedTopics[0].topicNumber}: {sortedTopics[0].topicName}
                                    </h2>
                                </div>
                            </div>
                            <Link href={topicLink(sortedTopics[0]._id)} className="flex h-10 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-[10px] font-bold text-white transition hover:bg-blue-700 sm:w-auto">
                                Open First Topic
                                <ArrowRight size={14} />
                            </Link>
                        </section>
                    )}
                </div>
            </main>
        </PageLayout>
    );
};

const PageLayout = ({ children }) => {
    return (
        <>
            <EventProvider>
                <Navbar />
            </EventProvider>
            {children}
            <Footer />
        </>
    );
};

export default ChapterPage;