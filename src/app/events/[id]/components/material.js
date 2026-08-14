"use client";

import axios from "axios";
import Link from "next/link";
import { AlertCircle, ArrowRight, BookOpen, BookOpenText, FileText, ListChecks, RefreshCw } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const emptyCollection = {
    count: 0,
    items: [],
};

const emptyMcqs = {
    count: 0,
    readCount: 0,
    testCount: 0,
};

const EventMaterials = () => {
    const { id } = useParams();
    const [chapters, setChapters] = useState(emptyCollection);
    const [topics, setTopics] = useState(emptyCollection);
    const [mcqs, setMcqs] = useState(emptyMcqs);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    const getMaterials = async () => {
        try {
            setLoading(true);
            setErrorMessage("");

            const result = await axios.get(`/api/events/${id}/materials`);

            if (!result.data.success) {
                setChapters(emptyCollection);
                setTopics(emptyCollection);
                setMcqs(emptyMcqs);
                setErrorMessage(result.data.message || "Learning content could not be loaded");
                return;
            }

            setChapters({
                count: Number(result.data.chapters?.count) || 0,
                items: result.data.chapters?.items || [],
            });

            setTopics({
                count: Number(result.data.topics?.count) || 0,
                items: result.data.topics?.items || [],
            });

            setMcqs({
                count: Number(result.data.mcqs?.count) || 0,
                readCount: Number(result.data.mcqs?.readCount) || 0,
                testCount: Number(result.data.mcqs?.testCount) || 0,
            });
        } catch (error) {
            console.log(error);
            setChapters(emptyCollection);
            setTopics(emptyCollection);
            setMcqs(emptyMcqs);
            setErrorMessage(error.response?.data?.message || "Learning content could not be loaded");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            getMaterials();
        }
    }, [id]);

    if (loading) {
        return <MaterialsLoading />;
    }

    if (errorMessage) {
        return <MaterialsError message={errorMessage} retry={getMaterials} />;
    }

    const hasMaterials = chapters.count > 0 || topics.count > 0 || mcqs.count > 0;

    if (!hasMaterials) {
        return null;
    }

    return (
        <>
            {chapters.count > 0 && <ChaptersSection eventId={id} chapters={chapters} />}

            {topics.count > 0 && <TopicsSection eventId={id} topics={topics} />}

            {mcqs.count > 0 && <McqsSection mcqs={mcqs} />}
        </>
    );
};

const ChaptersSection = ({ eventId, chapters }) => {
    return (
        <section id="chapters" className="scroll-mt-24 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <SectionHeader icon={BookOpen} eyebrow="Chapter library" title="Available Chapters" description="Recently added chapters from the subjects available in this event." count={chapters.count} />

            <div className="grid grid-cols-2 gap-2.5 bg-slate-50/70 p-3 sm:gap-3 sm:p-4 lg:grid-cols-4">
                {chapters.items.map((item) => {
                    const subjectId = item.subject?._id || item.subject;
                    const subjectName = item.subject?.name || "Subject";
                    const href = subjectId ? `/events/${eventId}/subjects/${subjectId}/chapters/${item._id}` : `/events/${eventId}#subjects`;

                    return (
                        <Link key={item._id} href={href} className="group min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md">
                            <div className="relative h-20 overflow-hidden bg-gradient-to-br from-blue-50 to-slate-100 sm:h-24">
                                {item.image?.url ? (
                                    <img src={item.image.url} alt={item.chapterName} loading="lazy" decoding="async" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-blue-500">
                                        <BookOpen size={26} strokeWidth={1.7} />
                                    </div>
                                )}

                                <span className="absolute left-2 top-2 rounded-md border border-white/60 bg-white/90 px-2 py-1 text-[7px] font-extrabold uppercase tracking-[0.1em] text-blue-700 shadow-sm">
                                    Chapter {item.chapterNumber}
                                </span>
                            </div>

                            <div className="p-2.5 sm:p-3">
                                <h3 className="line-clamp-2 min-h-8 text-[10px] font-extrabold leading-4 text-[#071a4a] sm:text-xs">
                                    {item.chapterName}
                                </h3>

                                <p className="mt-1 truncate text-[8px] font-semibold text-slate-500 sm:text-[9px]">
                                    {subjectName}
                                </p>

                                <div className="mt-2 flex items-center justify-between gap-2 border-t border-slate-100 pt-2">
                                    <span className="text-[8px] font-bold text-blue-600">
                                        Open chapter
                                    </span>

                                    <ArrowRight size={13} className="shrink-0 text-blue-500 transition group-hover:translate-x-0.5" />
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
};

const TopicsSection = ({ eventId, topics }) => {
    return (
        <section id="topics" className="scroll-mt-24 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <SectionHeader icon={FileText} eyebrow="Topic library" title="Recently Added Topics" description="Open a topic to read its structured learning material." count={topics.count} />

            <div className="grid grid-cols-2 gap-2.5 bg-slate-50/70 p-3 sm:gap-3 sm:p-4 lg:grid-cols-4">
                {topics.items.map((item) => {
                    const chapterData = item.chapter;
                    const chapterId = chapterData?._id || chapterData;
                    const subjectId = chapterData?.subject?._id || chapterData?.subject;
                    const subjectName = chapterData?.subject?.name || "Subject";
                    const chapterName = chapterData?.chapterName || "Chapter";

                    const href = subjectId && chapterId
                        ? `/events/${eventId}/subjects/${subjectId}/chapters/${chapterId}/topics/${item._id}`
                        : `/events/${eventId}#subjects`;

                    return (
                        <Link key={item._id} href={href} className="group min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md">
                            <div className="relative h-20 overflow-hidden bg-gradient-to-br from-indigo-50 to-slate-100 sm:h-24">
                                {item.image?.url ? (
                                    <img src={item.image.url} alt={item.topicName} loading="lazy" decoding="async" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-indigo-500">
                                        <FileText size={26} strokeWidth={1.7} />
                                    </div>
                                )}

                                <span className="absolute left-2 top-2 rounded-md border border-white/60 bg-white/90 px-2 py-1 text-[7px] font-extrabold uppercase tracking-[0.1em] text-indigo-700 shadow-sm">
                                    Topic {item.topicNumber}
                                </span>
                            </div>

                            <div className="p-2.5 sm:p-3">
                                <h3 className="line-clamp-2 min-h-8 text-[10px] font-extrabold leading-4 text-[#071a4a] sm:text-xs">
                                    {item.topicName}
                                </h3>

                                <p className="mt-1 truncate text-[8px] font-semibold text-slate-500 sm:text-[9px]">
                                    {subjectName} · {chapterName}
                                </p>

                                <div className="mt-2 flex items-center justify-between gap-2 border-t border-slate-100 pt-2">
                                    <span className="text-[8px] font-bold text-indigo-600">
                                        Read topic
                                    </span>

                                    <ArrowRight size={13} className="shrink-0 text-indigo-500 transition group-hover:translate-x-0.5" />
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
};

const McqsSection = ({ mcqs }) => {
    const scrollToSubjects = () => {
        document.getElementById("subjects")?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    };

    return (
        <section id="mcqs" className="scroll-mt-24 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <SectionHeader icon={ListChecks} eyebrow="Practice material" title="Available MCQs" description="MCQs are organized by topic for study and test practice." count={mcqs.count} />

            <div className="bg-slate-50/70 p-3 sm:p-4">
                <div className="grid grid-cols-3 gap-2.5">
                    <McqStat label="Total MCQs" value={mcqs.count} color="text-blue-600" />
                    <McqStat label="Study Mode" value={mcqs.readCount} color="text-emerald-600" />
                    <McqStat label="Test Mode" value={mcqs.testCount} color="text-violet-600" />
                </div>

                <div className="mt-3 flex flex-col gap-3 rounded-xl border border-blue-100 bg-blue-50 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
                    <div>
                        <p className="text-[10px] font-extrabold text-[#071a4a] sm:text-xs">
                            MCQs are available inside their related topics
                        </p>

                        <p className="mt-1 text-[9px] leading-4 text-slate-500 sm:text-[10px]">
                            Choose a subject, open a chapter and select a topic to study or attempt its MCQs.
                        </p>
                    </div>

                    <button type="button" onClick={scrollToSubjects} className="flex h-9 w-full shrink-0 items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-4 text-[10px] font-bold text-white transition hover:bg-blue-700 sm:w-auto">
                        Choose Subject
                        <ArrowRight size={13} />
                    </button>
                </div>
            </div>
        </section>
    );
};

const SectionHeader = ({ icon: Icon, eyebrow, title, description, count }) => {
    return (
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-4 py-4 sm:px-5">
            <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Icon size={18} strokeWidth={1.9} />
                </div>

                <div className="min-w-0">
                    <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-blue-600 sm:text-[9px]">
                        {eyebrow}
                    </p>

                    <h2 className="mt-0.5 text-base font-extrabold tracking-tight text-[#071a4a] sm:text-lg">
                        {title}
                    </h2>

                    <p className="mt-1 text-[9px] leading-4 text-slate-500 sm:text-[11px]">
                        {description}
                    </p>
                </div>
            </div>

            <span className="flex h-8 min-w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 px-2 text-[10px] font-extrabold text-blue-700">
                {count}
            </span>
        </div>
    );
};

const McqStat = ({ label, value, color }) => {
    return (
        <div className="rounded-xl border border-slate-200 bg-white px-2 py-3 text-center shadow-sm sm:px-4">
            <p className={`text-lg font-extrabold sm:text-xl ${color}`}>
                {value}
            </p>

            <p className="mt-1 text-[7px] font-bold uppercase tracking-[0.08em] text-slate-400 sm:text-[9px]">
                {label}
            </p>
        </div>
    );
};

const MaterialsLoading = () => {
    return (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-4 py-4 sm:px-5">
                <div className="h-3 w-32 animate-pulse rounded bg-slate-200" />
                <div className="mt-2 h-5 w-48 animate-pulse rounded bg-slate-100" />
            </div>

            <div className="grid grid-cols-2 gap-2.5 bg-slate-50/70 p-3 sm:gap-3 sm:p-4 lg:grid-cols-4">
                {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="animate-pulse overflow-hidden rounded-xl border border-slate-200 bg-white">
                        <div className="h-20 bg-slate-200 sm:h-24" />

                        <div className="p-3">
                            <div className="h-3 w-3/4 rounded bg-slate-200" />
                            <div className="mt-2 h-2.5 w-1/2 rounded bg-slate-100" />
                            <div className="mt-3 h-6 rounded bg-slate-100" />
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

const MaterialsError = ({ message, retry }) => {
    return (
        <section className="rounded-2xl border border-red-200 bg-white px-4 py-10 text-center shadow-sm">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500">
                <AlertCircle size={19} />
            </div>

            <h3 className="mt-3 text-sm font-extrabold text-[#071a4a]">
                Learning content could not be loaded
            </h3>

            <p className="mx-auto mt-1.5 max-w-md text-[10px] leading-5 text-slate-500">
                {message}
            </p>

            <button type="button" onClick={retry} className="mt-4 inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-4 text-[10px] font-bold text-white transition hover:bg-blue-700">
                <RefreshCw size={13} />
                Try Again
            </button>
        </section>
    );
};

export default EventMaterials;