"use client";

import Footer from "@/app/components/footer";
import Navbar from "@/app/components/navbar";
import { EventProvider } from "@/context/EventContext";
import axios from "axios";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpen, BookOpenCheck, ChevronRight, ClipboardCheck, Home, List, RefreshCw } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const bookFont = {
    fontFamily: 'Georgia, Cambria, "Times New Roman", serif',
};

const getParagraphs = (text) => {
    return String(text || "")
        .split(/\n+/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean);
};

const getRequiredData = (result, property, fallbackMessage) => {
    if (result.status !== "fulfilled" || !result.value.data.success) {
        const message = result.status === "rejected"
            ? result.reason?.response?.data?.message
            : result.value.data.message;

        throw new Error(message || fallbackMessage);
    }

    return result.value.data[property];
};

const getMcqCount = (result) => {
    if (result.status !== "fulfilled" || !result.value.data.success) {
        return 0;
    }

    const data = result.value.data;

    return Number(
        data.count ??
        data.mcqs?.length ??
        data.questions?.length ??
        0,
    );
};

const TopicMaterial = () => {
    const { id: eventId, subjectId, chapterId, topicId } = useParams();
    const [event, setEvent] = useState(null);
    const [subject, setSubject] = useState(null);
    const [chapter, setChapter] = useState(null);
    const [topic, setTopic] = useState(null);
    const [chapterTopics, setChapterTopics] = useState([]);
    const [readMcqCount, setReadMcqCount] = useState(0);
    const [testMcqCount, setTestMcqCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [readingProgress, setReadingProgress] = useState(0);

    const sortedTopics = useMemo(() => {
        return [...chapterTopics].sort((first, second) => Number(first.topicNumber) - Number(second.topicNumber));
    }, [chapterTopics]);

    const currentTopicIndex = useMemo(() => {
        return sortedTopics.findIndex((item) => String(item._id) === String(topicId));
    }, [sortedTopics, topicId]);

    const previousTopic = currentTopicIndex > 0 ? sortedTopics[currentTopicIndex - 1] : null;
    const nextTopic = currentTopicIndex >= 0 && currentTopicIndex < sortedTopics.length - 1 ? sortedTopics[currentTopicIndex + 1] : null;
    const chapterPath = `/events/${eventId}/subjects/${subjectId}/chapters/${chapterId}`;
    const getTopicPath = (selectedTopicId) => `${chapterPath}/topics/${selectedTopicId}`;

    const getPageData = async () => {
        try {
            setLoading(true);
            setErrorMessage("");
            setReadMcqCount(0);
            setTestMcqCount(0);

            const [topicResult, chapterResult, subjectResult, eventResult, topicsResult, readMcqsResult, testMcqsResult] = await Promise.allSettled([
                axios.get(`/api/topic/${topicId}`),
                axios.get(`/api/chapter/${chapterId}`),
                axios.get(`/api/subject/${subjectId}`),
                axios.get(`/api/events/${eventId}`),
                axios.get(`/api/topic/chapter/${chapterId}`),
                axios.get(`/api/mcqs/read/topic/${topicId}`),
                axios.get(`/api/mcqs/test/topic/${topicId}`),
            ]);

            const topicData = getRequiredData(topicResult, "topic", "Topic material could not be loaded");
            const chapterData = getRequiredData(chapterResult, "chapter", "Chapter could not be loaded");
            const subjectData = getRequiredData(subjectResult, "subject", "Subject could not be loaded");
            const eventData = getRequiredData(eventResult, "event", "Event could not be loaded");

            const topicChapterId = typeof topicData.chapter === "object" ? topicData.chapter?._id : topicData.chapter;
            const chapterSubjectId = typeof chapterData.subject === "object" ? chapterData.subject?._id : chapterData.subject;
            const subjectEventId = typeof subjectData.event === "object" ? subjectData.event?._id : subjectData.event;

            if (String(topicChapterId) !== String(chapterId)) {
                throw new Error("This topic does not belong to the selected chapter");
            }

            if (String(chapterSubjectId) !== String(subjectId)) {
                throw new Error("This chapter does not belong to the selected subject");
            }

            if (String(subjectEventId) !== String(eventId)) {
                throw new Error("This subject does not belong to the selected event");
            }

            setTopic(topicData);
            setChapter(chapterData);
            setSubject(subjectData);
            setEvent(eventData);

            if (topicsResult.status === "fulfilled" && topicsResult.value.data.success) {
                setChapterTopics(topicsResult.value.data.topics || []);
            } else {
                setChapterTopics([topicData]);
            }

            setReadMcqCount(getMcqCount(readMcqsResult));
            setTestMcqCount(getMcqCount(testMcqsResult));
        } catch (error) {
            console.log(error);
            setEvent(null);
            setSubject(null);
            setChapter(null);
            setTopic(null);
            setChapterTopics([]);
            setReadMcqCount(0);
            setTestMcqCount(0);
            setErrorMessage(error.response?.data?.message || error.message || "Topic material could not be loaded");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (eventId && subjectId && chapterId && topicId) {
            getPageData();
        }
    }, [eventId, subjectId, chapterId, topicId]);

    useEffect(() => {
        const updateProgress = () => {
            const availableHeight = document.documentElement.scrollHeight - window.innerHeight;

            if (availableHeight <= 0) {
                setReadingProgress(100);
                return;
            }

            const progress = (window.scrollY / availableHeight) * 100;
            setReadingProgress(Math.min(100, Math.max(0, progress)));
        };

        updateProgress();
        window.addEventListener("scroll", updateProgress, { passive: true });
        window.addEventListener("resize", updateProgress);

        return () => {
            window.removeEventListener("scroll", updateProgress);
            window.removeEventListener("resize", updateProgress);
        };
    }, [loading, topicId]);

    const scrollToSection = (sectionIndex) => {
        document.getElementById(`section-${sectionIndex}`)?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    };

    if (loading) {
        return <ReadingPageLoading />;
    }

    if (errorMessage || !event || !subject || !chapter || !topic) {
        return <ReadingPageError message={errorMessage || "The requested topic was not found"} onRetry={getPageData} chapterPath={chapterPath} />;
    }

    const sections = topic.sections || [];
    const topicPath = getTopicPath(topicId);

    return (
        <PageLayout>
            <div className="sticky top-0 z-[60] h-1 bg-slate-200">
                <div className="h-full bg-blue-600 transition-[width] duration-150" style={{ width: `${readingProgress}%` }} />
            </div>

            <main className="min-h-screen bg-[#eef1f5] px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
                <div className="mx-auto w-full max-w-[1120px]">
                    <PageBreadcrumb eventId={eventId} subjectId={subjectId} chapterPath={chapterPath} eventName={event.name} subjectName={subject.name} chapterName={chapter.chapterName} topicName={topic.topicName} />

                    <article className="overflow-hidden rounded-2xl border border-[#ddd8ca] bg-[#fffdf7] shadow-[0_18px_55px_-38px_rgba(15,23,42,0.6)]">
                        <header className="border-b border-[#e5dfd0] bg-[#fffaf0] px-5 py-7 sm:px-8 sm:py-9 lg:px-10">
                            <div className="flex flex-wrap items-center gap-2 text-[9px] font-bold uppercase tracking-[0.14em] text-blue-700 sm:text-[10px]">
                                <span>{subject.name}</span>
                                <span className="text-slate-300">•</span>
                                <span>Chapter {chapter.chapterNumber}</span>
                                <span className="text-slate-300">•</span>
                                <span>Topic {topic.topicNumber}</span>
                            </div>

                            <h1 style={bookFont} className="mt-3 max-w-4xl text-[27px] font-bold leading-[1.15] tracking-[-0.02em] text-slate-950 sm:text-4xl lg:text-[42px]">
                                {topic.topicName}
                            </h1>

                            <p className="mt-3 max-w-3xl text-[11px] leading-5 text-slate-500 sm:text-xs sm:leading-6">
                                {chapter.chapterName}
                            </p>
                        </header>

                        <div className="lg:grid lg:grid-cols-[220px_minmax(0,1fr)]">
                            <aside className="border-b border-[#e5dfd0] bg-[#faf7ee] p-4 sm:p-5 lg:border-b-0 lg:border-r">
                                <div className="lg:sticky lg:top-24">
                                    <div className="flex items-center gap-2">
                                        <List size={16} className="text-blue-700" />
                                        <h2 className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-800">On this page</h2>
                                    </div>

                                    {sections.length > 0 ? (
                                        <nav className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-1">
                                            {sections.map((section, index) => (
                                                <button key={section._id || index} type="button" onClick={() => scrollToSection(index)} className="group flex min-w-0 items-start gap-2 rounded-lg px-2.5 py-2 text-left transition hover:bg-white hover:shadow-sm">
                                                    <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[8px] font-extrabold text-blue-700">
                                                        {index + 1}
                                                    </span>
                                                    <span className="line-clamp-2 text-[10px] font-semibold leading-4 text-slate-600 transition group-hover:text-blue-700 sm:text-[11px]">
                                                        {section.subHeading}
                                                    </span>
                                                </button>
                                            ))}
                                        </nav>
                                    ) : (
                                        <p className="mt-4 text-[10px] leading-5 text-slate-500">No sections are available.</p>
                                    )}

                                    <div className="mt-5 hidden border-t border-[#e5dfd0] pt-5 lg:block">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">Progress</p>
                                            <span className="text-[9px] font-extrabold text-blue-700">{Math.round(readingProgress)}%</span>
                                        </div>

                                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
                                            <div className="h-full rounded-full bg-blue-600 transition-[width] duration-150" style={{ width: `${readingProgress}%` }} />
                                        </div>
                                    </div>
                                </div>
                            </aside>

                            <div className="px-5 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
                                <div className="mx-auto max-w-[720px]">
                                    {topic.image?.url && (
                                        <figure className="mb-10">
                                            <div className="overflow-hidden rounded-lg border border-[#ddd8ca] bg-white p-2 shadow-sm sm:p-3">
                                                <img src={topic.image.url} alt={topic.topicName} className="max-h-[430px] w-full rounded-md object-contain" />
                                            </div>

                                            <figcaption style={bookFont} className="mt-2.5 text-center text-[10px] italic leading-5 text-slate-500 sm:text-xs">
                                                {topic.topicName}
                                            </figcaption>
                                        </figure>
                                    )}

                                    {sections.length === 0 ? (
                                        <div className="rounded-xl border border-dashed border-[#d8d1c0] bg-[#faf7ee] px-5 py-12 text-center">
                                            <BookOpen size={32} className="mx-auto text-blue-600" />
                                            <p style={bookFont} className="mt-4 text-base font-bold text-slate-800">Topic material is being prepared</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-12 sm:space-y-14">
                                            {sections.map((section, sectionIndex) => (
                                                <ReadingSection key={section._id || sectionIndex} section={section} sectionIndex={sectionIndex} />
                                            ))}
                                        </div>
                                    )}

                                    <div className="mt-14 border-t border-[#e5dfd0] pt-8 text-center">
                                        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                                            <BookOpen size={19} />
                                        </div>

                                        <p className="mt-3 text-[9px] font-bold uppercase tracking-[0.18em] text-blue-700">End of topic</p>
                                        <p style={bookFont} className="mt-1 text-sm font-bold text-slate-800">{topic.topicName}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <footer className="flex items-center justify-between gap-3 border-t border-[#e5dfd0] bg-[#faf7ee] px-5 py-3 text-[8px] font-bold uppercase tracking-[0.12em] text-slate-500 sm:px-8 sm:text-[9px]">
                            <span className="truncate">{subject.name}</span>
                            <span className="shrink-0">Chapter {chapter.chapterNumber} · Topic {topic.topicNumber}</span>
                        </footer>
                    </article>

                    <TopicPractice topicName={topic.topicName} topicPath={topicPath} readMcqCount={readMcqCount} testMcqCount={testMcqCount} />
                    <TopicNavigation previousTopic={previousTopic} nextTopic={nextTopic} chapterPath={chapterPath} getTopicPath={getTopicPath} />
                </div>
            </main>
        </PageLayout>
    );
};

const ReadingSection = ({ section, sectionIndex }) => {
    const paragraphs = getParagraphs(section.text);

    return (
        <section id={`section-${sectionIndex}`} className="scroll-mt-24">
            <div className="mb-5 flex items-start gap-3">
                <span className="mt-0.5 flex h-7 min-w-7 shrink-0 items-center justify-center rounded-full bg-blue-700 text-[10px] font-extrabold text-white">
                    {sectionIndex + 1}
                </span>

                <div className="min-w-0">
                    <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-blue-700 sm:text-[9px]">Section {sectionIndex + 1}</p>
                    <h2 style={bookFont} className="mt-1 text-xl font-bold leading-tight text-slate-950 sm:text-2xl">{section.subHeading}</h2>
                </div>
            </div>

            {paragraphs.length > 0 ? (
                <div style={bookFont} className="text-[16px] leading-[1.85] text-slate-800 sm:text-[17px] sm:leading-[1.95]">
                    {paragraphs.map((paragraph, paragraphIndex) => (
                        <p key={paragraphIndex} className={`${paragraphIndex > 0 ? "mt-5" : ""} ${sectionIndex === 0 && paragraphIndex === 0 ? "first-letter:float-left first-letter:mr-2 first-letter:mt-2 first-letter:text-[50px] first-letter:font-bold first-letter:leading-[0.7] first-letter:text-blue-800 sm:first-letter:text-[58px]" : ""} lg:text-justify`}>
                            {paragraph}
                        </p>
                    ))}
                </div>
            ) : (
                <p style={bookFont} className="text-sm italic text-slate-500">This section is being prepared.</p>
            )}
        </section>
    );
};

const TopicPractice = ({ topicName, topicPath, readMcqCount, testMcqCount }) => {
    if (readMcqCount === 0 && testMcqCount === 0) {
        return null;
    }

    return (
        <section className="mt-4 overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-4 py-4 sm:px-5">
                <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-blue-600">Topic practice</p>
                <h2 className="mt-1 text-base font-extrabold text-[#071a4a] sm:text-lg">Practise {topicName}</h2>
                <p className="mt-1 text-[10px] leading-5 text-slate-500 sm:text-xs">Review the available MCQs or attempt them as a test.</p>
            </div>

            <div className="grid gap-3 bg-slate-50/70 p-3 sm:grid-cols-2 sm:p-4">
                {readMcqCount > 0 && (
                    <Link href={`${topicPath}/mcqs/read`} className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-300 hover:shadow-md">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                            <BookOpenCheck size={20} />
                        </span>

                        <span className="min-w-0 flex-1">
                            <span className="block text-xs font-extrabold text-[#071a4a] sm:text-sm">Read MCQs</span>
                            <span className="mt-1 block text-[9px] leading-4 text-slate-500 sm:text-[10px]">
                                {readMcqCount} {readMcqCount === 1 ? "question" : "questions"} with answers and explanations
                            </span>
                        </span>

                        <ArrowRight size={16} className="shrink-0 text-blue-600 transition group-hover:translate-x-0.5" />
                    </Link>
                )}

                {testMcqCount > 0 && (
                    <Link href={`${topicPath}/mcqs/test`} className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-emerald-300 hover:shadow-md">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition group-hover:bg-emerald-600 group-hover:text-white">
                            <ClipboardCheck size={20} />
                        </span>

                        <span className="min-w-0 flex-1">
                            <span className="block text-xs font-extrabold text-[#071a4a] sm:text-sm">Take Test</span>
                            <span className="mt-1 block text-[9px] leading-4 text-slate-500 sm:text-[10px]">
                                Attempt {testMcqCount} {testMcqCount === 1 ? "question" : "questions"} and view your result
                            </span>
                        </span>

                        <ArrowRight size={16} className="shrink-0 text-emerald-600 transition group-hover:translate-x-0.5" />
                    </Link>
                )}
            </div>
        </section>
    );
};

const PageBreadcrumb = ({ eventId, subjectId, chapterPath, eventName, subjectName, chapterName, topicName }) => {
    return (
        <nav className="mb-4 flex items-center gap-1.5 overflow-x-auto whitespace-nowrap rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[10px] font-semibold text-slate-500 shadow-sm sm:text-xs">
            <Link href="/" className="flex items-center gap-1 transition hover:text-blue-700">
                <Home size={13} />
                Home
            </Link>

            <ChevronRight size={13} className="shrink-0 text-slate-300" />
            <Link href={`/events/${eventId}`} className="transition hover:text-blue-700">{eventName}</Link>
            <ChevronRight size={13} className="shrink-0 text-slate-300" />
            <Link href={`/events/${eventId}/subjects/${subjectId}`} className="transition hover:text-blue-700">{subjectName}</Link>
            <ChevronRight size={13} className="shrink-0 text-slate-300" />
            <Link href={chapterPath} className="max-w-40 truncate transition hover:text-blue-700 sm:max-w-52">{chapterName}</Link>
            <ChevronRight size={13} className="shrink-0 text-slate-300" />
            <span className="max-w-40 truncate font-bold text-blue-700 sm:max-w-52">{topicName}</span>
        </nav>
    );
};

const TopicNavigation = ({ previousTopic, nextTopic, chapterPath, getTopicPath }) => {
    return (
        <nav className="mt-4 grid grid-cols-2 gap-3">
            {previousTopic ? (
                <Link href={getTopicPath(previousTopic._id)} className="group flex min-w-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3.5 shadow-sm transition hover:border-blue-300 hover:shadow-md sm:px-4">
                    <ArrowLeft size={16} className="shrink-0 text-blue-600 transition group-hover:-translate-x-0.5" />

                    <div className="min-w-0">
                        <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-slate-400 sm:text-[9px]">Previous topic</p>
                        <p className="mt-1 truncate text-[10px] font-bold text-slate-800 sm:text-xs">{previousTopic.topicName}</p>
                    </div>
                </Link>
            ) : (
                <Link href={chapterPath} className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3.5 text-[10px] font-bold text-slate-600 shadow-sm transition hover:border-blue-300 hover:text-blue-700 sm:text-xs">
                    <ArrowLeft size={15} />
                    Chapter Topics
                </Link>
            )}

            {nextTopic ? (
                <Link href={getTopicPath(nextTopic._id)} className="group flex min-w-0 items-center justify-end gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3.5 text-right shadow-sm transition hover:border-blue-300 hover:shadow-md sm:px-4">
                    <div className="min-w-0">
                        <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-slate-400 sm:text-[9px]">Next topic</p>
                        <p className="mt-1 truncate text-[10px] font-bold text-slate-800 sm:text-xs">{nextTopic.topicName}</p>
                    </div>

                    <ArrowRight size={16} className="shrink-0 text-blue-600 transition group-hover:translate-x-0.5" />
                </Link>
            ) : (
                <Link href={chapterPath} className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 py-3.5 text-[10px] font-bold text-white shadow-sm transition hover:bg-blue-700 sm:text-xs">
                    Finish Reading
                    <ArrowRight size={15} />
                </Link>
            )}
        </nav>
    );
};

const ReadingPageLoading = () => {
    return (
        <PageLayout>
            <main className="min-h-[75vh] bg-[#eef1f5] px-3 py-6">
                <div className="mx-auto max-w-[1120px] animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-6 py-9 sm:px-10">
                        <div className="h-3 w-52 rounded bg-slate-200" />
                        <div className="mt-5 h-9 w-3/4 rounded bg-slate-200" />
                        <div className="mt-4 h-3 w-1/2 rounded bg-slate-100" />
                    </div>

                    <div className="px-6 py-10 sm:px-10 lg:ml-[220px]">
                        <div className="mx-auto max-w-[720px] space-y-4">
                            {[1, 2, 3, 4, 5, 6].map((item) => (
                                <div key={item} className="h-3 rounded bg-slate-100" />
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </PageLayout>
    );
};

const ReadingPageError = ({ message, onRetry, chapterPath }) => {
    return (
        <PageLayout>
            <main className="flex min-h-[75vh] items-center justify-center bg-[#eef1f5] px-4 py-8">
                <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center shadow-sm">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <BookOpen size={26} />
                    </div>

                    <h1 className="mt-4 text-xl font-extrabold text-slate-900">Topic could not be opened</h1>
                    <p className="mt-2 text-xs leading-6 text-slate-500">{message}</p>

                    <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
                        <Link href={chapterPath} className="flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-[11px] font-bold text-slate-600 transition hover:bg-slate-50">
                            <ArrowLeft size={14} />
                            Back to Chapter
                        </Link>

                        <button type="button" onClick={onRetry} className="flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-[11px] font-bold text-white transition hover:bg-blue-700">
                            <RefreshCw size={14} />
                            Try Again
                        </button>
                    </div>
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

export default TopicMaterial;