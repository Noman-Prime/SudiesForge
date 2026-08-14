"use client";

import Footer from "@/app/components/footer";
import Navbar from "@/app/components/navbar";
import { EventProvider } from "@/context/EventContext";
import axios from "axios";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, ChevronRight, ClipboardCheck, Home, Lightbulb, ListChecks, RefreshCw } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const bookFont = {
    fontFamily: 'Georgia, Cambria, "Times New Roman", serif',
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

const getCollection = (result) => {
    if (result.status !== "fulfilled" || !result.value.data.success) {
        return [];
    }

    return result.value.data.mcqs || result.value.data.questions || [];
};

const ReadTopicMcqs = () => {
    const { id: eventId, subjectId, chapterId, topicId } = useParams();
    const [event, setEvent] = useState(null);
    const [subject, setSubject] = useState(null);
    const [chapter, setChapter] = useState(null);
    const [topic, setTopic] = useState(null);
    const [mcqs, setMcqs] = useState([]);
    const [testMcqCount, setTestMcqCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    const chapterPath = `/events/${eventId}/subjects/${subjectId}/chapters/${chapterId}`;
    const topicPath = `${chapterPath}/topics/${topicId}`;
    const testPath = `${topicPath}/mcqs/test`;

    const getPageData = async () => {
        try {
            setLoading(true);
            setErrorMessage("");
            setMcqs([]);
            setTestMcqCount(0);

            const [topicResult, chapterResult, subjectResult, eventResult, readMcqsResult, testMcqsResult] = await Promise.allSettled([
                axios.get(`/api/topic/${topicId}`),
                axios.get(`/api/chapter/${chapterId}`),
                axios.get(`/api/subject/${subjectId}`),
                axios.get(`/api/events/${eventId}`),
                axios.get(`/api/mcqs/read/topic/${topicId}`),
                axios.get(`/api/mcqs/test/topic/${topicId}`),
            ]);

            const topicData = getRequiredData(topicResult, "topic", "Topic could not be loaded");
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

            if (readMcqsResult.status === "rejected" && readMcqsResult.reason?.response?.status !== 404) {
                throw new Error(readMcqsResult.reason?.response?.data?.message || "MCQs could not be loaded");
            }

            const readMcqs = getCollection(readMcqsResult);
            const testMcqs = getCollection(testMcqsResult);

            setTopic(topicData);
            setChapter(chapterData);
            setSubject(subjectData);
            setEvent(eventData);
            setMcqs(readMcqs);
            setTestMcqCount(testMcqs.length);
        } catch (error) {
            console.log(error);
            setEvent(null);
            setSubject(null);
            setChapter(null);
            setTopic(null);
            setMcqs([]);
            setTestMcqCount(0);
            setErrorMessage(error.response?.data?.message || error.message || "MCQs could not be loaded");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (eventId && subjectId && chapterId && topicId) {
            getPageData();
        }
    }, [eventId, subjectId, chapterId, topicId]);

    if (loading) {
        return <ReadPageLoading />;
    }

    if (errorMessage || !event || !subject || !chapter || !topic) {
        return <ReadPageError message={errorMessage || "The requested MCQs could not be found"} retry={getPageData} topicPath={topicPath} />;
    }

    return (
        <PageLayout>
            <main className="min-h-screen bg-[#eef1f5] px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
                <div className="mx-auto w-full max-w-[1050px]">
                    <PageBreadcrumb eventId={eventId} subjectId={subjectId} chapterPath={chapterPath} topicPath={topicPath} eventName={event.name} subjectName={subject.name} chapterName={chapter.chapterName} topicName={topic.topicName} />

                    <section className="overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-sm">
                        <div className="bg-gradient-to-r from-[#071a4a] to-[#123d8d] px-4 py-5 text-white sm:px-6 sm:py-6">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex min-w-0 items-start gap-3 sm:items-center">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-blue-100">
                                        <BookOpen size={23} />
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-blue-200">MCQ read mode</p>
                                        <h1 className="mt-1 text-lg font-extrabold leading-tight text-white sm:text-2xl">{topic.topicName}</h1>
                                        <p className="mt-1 text-[10px] leading-5 text-blue-100 sm:text-xs">Study each question with its correct answer and explanation.</p>
                                    </div>
                                </div>

                                {mcqs.length > 0 && (
                                    <div className="flex w-fit shrink-0 items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-2">
                                        <ListChecks size={17} />

                                        <div>
                                            <p className="text-[8px] font-bold uppercase tracking-wider text-blue-200">Questions</p>
                                            <p className="text-sm font-extrabold text-white">{mcqs.length}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {mcqs.length > 0 && (
                            <div className="border-t border-blue-900/10 bg-white px-3 py-3 sm:px-5">
                                <div className="flex items-center gap-2 overflow-x-auto">
                                    <span className="mr-1 shrink-0 text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">Questions</span>

                                    {mcqs.map((mcq, index) => (
                                        <a key={mcq._id} href={`#question-${mcq._id}`} className="flex h-8 min-w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-2 text-[10px] font-bold text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700">
                                            {index + 1}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </section>

                    {mcqs.length === 0 ? (
                        <EmptyState topicPath={topicPath} />
                    ) : (
                        <>
                            <section className="mt-4 space-y-4">
                                {mcqs.map((mcq, index) => (
                                    <QuestionCard key={mcq._id} mcq={mcq} questionNumber={index + 1} />
                                ))}
                            </section>

                            <CompletionCard topicPath={topicPath} testPath={testPath} testMcqCount={testMcqCount} />
                        </>
                    )}
                </div>
            </main>
        </PageLayout>
    );
};

const QuestionCard = ({ mcq, questionNumber }) => {
    const correctOptionIndex = mcq.options?.findIndex((option) => option.isCorrect) ?? -1;

    return (
        <article id={`question-${mcq._id}`} className="scroll-mt-24 overflow-hidden rounded-2xl border border-slate-200 bg-[#fffdf8] shadow-sm">
            <div className="border-b border-[#e7e1d3] bg-[#faf7ef] px-4 py-3 sm:px-6">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <span className="flex h-7 min-w-7 items-center justify-center rounded-lg bg-blue-700 px-2 text-[10px] font-extrabold text-white">
                            {questionNumber}
                        </span>
                        <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-blue-700">Multiple choice question</p>
                    </div>

                    <BookOpen size={17} className="shrink-0 text-slate-300" />
                </div>
            </div>

            <div className="px-4 py-5 sm:px-7 sm:py-6">
                <h2 style={bookFont} className="whitespace-pre-line text-[16px] font-bold leading-7 text-slate-900 sm:text-lg sm:leading-8">
                    {mcq.statement}
                </h2>

                <div className="mt-5 grid gap-2.5 sm:grid-cols-2 sm:gap-3">
                    {(mcq.options || []).map((option, optionIndex) => {
                        const isCorrect = option.isCorrect;
                        const optionLetter = String.fromCharCode(65 + optionIndex);

                        return (
                            <div key={`${mcq._id}-${optionIndex}`} className={`flex min-h-12 items-start gap-3 rounded-xl border px-3 py-3 sm:px-4 ${isCorrect ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-white"}`}>
                                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[10px] font-extrabold ${isCorrect ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"}`}>
                                    {optionLetter}
                                </span>

                                <p className={`min-w-0 flex-1 whitespace-pre-line pt-0.5 text-xs leading-5 sm:text-sm ${isCorrect ? "font-bold text-emerald-900" : "font-medium text-slate-700"}`}>
                                    {option.text}
                                </p>

                                {isCorrect && <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />}
                            </div>
                        );
                    })}
                </div>

                {correctOptionIndex >= 0 && (
                    <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                        <div className="flex items-start gap-3">
                            <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-600" />

                            <div className="min-w-0">
                                <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-emerald-700">Correct answer</p>
                                <p className="mt-1 text-xs font-bold leading-5 text-emerald-900 sm:text-sm">
                                    {String.fromCharCode(65 + correctOptionIndex)}. {mcq.options[correctOptionIndex]?.text}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {mcq.explanation && (
                    <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-4">
                        <div className="flex items-start gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                                <Lightbulb size={17} />
                            </div>

                            <div className="min-w-0">
                                <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-amber-700">Explanation</p>
                                <p style={bookFont} className="mt-1 whitespace-pre-line text-xs leading-6 text-slate-700 sm:text-sm sm:leading-7">{mcq.explanation}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </article>
    );
};

const CompletionCard = ({ topicPath, testPath, testMcqCount }) => {
    return (
        <section className="mt-4 overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-blue-600">Reading complete</p>
                    <h2 className="mt-1 text-base font-extrabold text-[#071a4a] sm:text-lg">
                        {testMcqCount > 0 ? "Ready to test your understanding?" : "Return to the topic material"}
                    </h2>
                    <p className="mt-1 text-[10px] leading-5 text-slate-500 sm:text-xs">
                        {testMcqCount > 0 ? `${testMcqCount} test ${testMcqCount === 1 ? "question is" : "questions are"} available for this topic.` : "No test-mode MCQs are currently available for this topic."}
                    </p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                    <Link href={topicPath} className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-[10px] font-bold text-slate-600 transition hover:border-blue-300 hover:text-blue-700 sm:w-auto">
                        <ArrowLeft size={14} />
                        Topic Material
                    </Link>

                    {testMcqCount > 0 && (
                        <Link href={testPath} className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-[10px] font-bold text-white transition hover:bg-blue-700 sm:w-auto">
                            <ClipboardCheck size={15} />
                            Take Topic Test
                            <ArrowRight size={14} />
                        </Link>
                    )}
                </div>
            </div>
        </section>
    );
};

const PageBreadcrumb = ({ eventId, subjectId, chapterPath, topicPath, eventName, subjectName, chapterName, topicName }) => {
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
            <Link href={chapterPath} className="max-w-36 truncate transition hover:text-blue-700 sm:max-w-48">{chapterName}</Link>
            <ChevronRight size={13} className="shrink-0 text-slate-300" />
            <Link href={topicPath} className="max-w-36 truncate transition hover:text-blue-700 sm:max-w-48">{topicName}</Link>
            <ChevronRight size={13} className="shrink-0 text-slate-300" />
            <span className="font-bold text-blue-700">Read MCQs</span>
        </nav>
    );
};

const EmptyState = ({ topicPath }) => {
    return (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-14 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <BookOpen size={24} />
            </div>

            <h2 className="mt-4 text-base font-extrabold text-[#071a4a]">No read-mode MCQs are available</h2>
            <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-slate-500">MCQs will appear here when read-mode questions are added to this topic.</p>

            <Link href={topicPath} className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 text-xs font-bold text-slate-600 transition hover:border-blue-300 hover:text-blue-700">
                <ArrowLeft size={15} />
                Return to Topic
            </Link>
        </div>
    );
};

const ReadPageLoading = () => {
    return (
        <PageLayout>
            <main className="min-h-[75vh] bg-[#eef1f5] px-3 py-6 sm:px-6">
                <div className="mx-auto w-full max-w-[1050px] animate-pulse">
                    <div className="h-10 rounded-xl bg-slate-200" />
                    <div className="mt-4 h-40 rounded-2xl bg-slate-200" />
                    <div className="mt-4 space-y-4">
                        {[1, 2, 3].map((item) => (
                            <div key={item} className="h-64 rounded-2xl bg-slate-200" />
                        ))}
                    </div>
                </div>
            </main>
        </PageLayout>
    );
};

const ReadPageError = ({ message, retry, topicPath }) => {
    return (
        <PageLayout>
            <main className="flex min-h-[75vh] items-center justify-center bg-[#eef1f5] px-4 py-8">
                <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white px-6 py-10 text-center shadow-sm">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500">
                        <RefreshCw size={22} />
                    </div>

                    <h1 className="mt-4 text-lg font-extrabold text-[#071a4a]">MCQs could not be loaded</h1>
                    <p className="mt-2 text-xs leading-5 text-slate-500">{message}</p>

                    <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
                        <Link href={topicPath} className="flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-xs font-bold text-slate-600 transition hover:bg-slate-50">
                            <ArrowLeft size={15} />
                            Back to Topic
                        </Link>

                        <button type="button" onClick={retry} className="flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-bold text-white transition hover:bg-blue-700">
                            <RefreshCw size={15} />
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

export default ReadTopicMcqs;