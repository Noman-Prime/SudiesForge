"use client";

import Footer from "@/app/components/footer";
import Navbar from "@/app/components/navbar";
import { EventProvider } from "@/context/EventContext";
import axios from "axios";
import Link from "next/link";
import { AlertCircle, ArrowLeft, BookOpen, CheckCircle2, ChevronRight, ClipboardCheck, Home, RefreshCw, RotateCcw, Send, Target, XCircle } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

const TopicMcqTest = () => {
    const { id: eventId, subjectId, chapterId, topicId } = useParams();
    const [event, setEvent] = useState(null);
    const [subject, setSubject] = useState(null);
    const [chapter, setChapter] = useState(null);
    const [topic, setTopic] = useState(null);
    const [mcqs, setMcqs] = useState([]);
    const [readMcqCount, setReadMcqCount] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [testResult, setTestResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const chapterPath = `/events/${eventId}/subjects/${subjectId}/chapters/${chapterId}`;
    const topicPath = `${chapterPath}/topics/${topicId}`;
    const readPath = `${topicPath}/mcqs/read`;

    const answeredCount = useMemo(() => {
        return mcqs.filter((mcq) => selectedAnswers[mcq._id] !== undefined).length;
    }, [mcqs, selectedAnswers]);

    const progress = mcqs.length > 0 ? Math.round((answeredCount / mcqs.length) * 100) : 0;

    const getPageData = async () => {
        try {
            setLoading(true);
            setErrorMessage("");
            setSelectedAnswers({});
            setTestResult(null);
            setMcqs([]);
            setReadMcqCount(0);

            const [topicResult, chapterResult, subjectResult, eventResult, testMcqsResult, readMcqsResult] = await Promise.allSettled([
                axios.get(`/api/topic/${topicId}`),
                axios.get(`/api/chapter/${chapterId}`),
                axios.get(`/api/subject/${subjectId}`),
                axios.get(`/api/events/${eventId}`),
                axios.get(`/api/mcqs/test/topic/${topicId}`),
                axios.get(`/api/mcqs/read/topic/${topicId}`),
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

            if (testMcqsResult.status === "rejected" && testMcqsResult.reason?.response?.status !== 404) {
                throw new Error(testMcqsResult.reason?.response?.data?.message || "The test could not be loaded");
            }

            const testMcqs = getCollection(testMcqsResult);
            const readMcqs = getCollection(readMcqsResult);

            setTopic(topicData);
            setChapter(chapterData);
            setSubject(subjectData);
            setEvent(eventData);
            setMcqs(testMcqs);
            setReadMcqCount(readMcqs.length);
        } catch (error) {
            console.log(error);
            setEvent(null);
            setSubject(null);
            setChapter(null);
            setTopic(null);
            setMcqs([]);
            setReadMcqCount(0);
            setSelectedAnswers({});
            setTestResult(null);
            setErrorMessage(error.response?.data?.message || error.message || "The test could not be loaded");
        } finally {
            setLoading(false);
        }
    };

    const selectAnswer = (mcqId, optionIndex) => {
        if (testResult || submitting) {
            return;
        }

        setSelectedAnswers((previous) => ({
            ...previous,
            [mcqId]: optionIndex,
        }));
    };

    const submitTest = async () => {
        if (submitting || testResult || mcqs.length === 0) {
            return;
        }

        if (answeredCount !== mcqs.length) {
            const remaining = mcqs.length - answeredCount;

            toast.error(`Please answer the remaining ${remaining} question${remaining === 1 ? "" : "s"}`, {
                autoClose: 3000,
            });

            return;
        }

        try {
            setSubmitting(true);

            const answers = mcqs.map((mcq) => ({
                mcqId: mcq._id,
                selectedOption: selectedAnswers[mcq._id],
            }));

            const result = await axios.post("/api/mcqs/test/submit", {
                answers,
            });

            if (result.data.success) {
                setTestResult(result.data.result || result.data);

                toast.success("Test submitted successfully", {
                    autoClose: 3000,
                });

                window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                });
            }
        } catch (error) {
            console.log(error);

            toast.error(error.response?.data?.message || "The test could not be submitted", {
                autoClose: 3000,
            });
        } finally {
            setSubmitting(false);
        }
    };

    const restartTest = () => {
        setSelectedAnswers({});
        setTestResult(null);

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    useEffect(() => {
        if (eventId && subjectId && chapterId && topicId) {
            getPageData();
        }
    }, [eventId, subjectId, chapterId, topicId]);

    if (loading) {
        return <TestPageLoading />;
    }

    if (errorMessage || !event || !subject || !chapter || !topic) {
        return <TestPageError message={errorMessage || "The requested test could not be found"} retry={getPageData} topicPath={topicPath} />;
    }

    const resultItems = testResult?.results || [];
    const correctAnswers = Number(testResult?.correctAnswers ?? testResult?.correct ?? resultItems.filter((item) => item.isCorrect).length);
    const totalQuestions = Number(testResult?.totalQuestions ?? mcqs.length);
    const wrongAnswers = Number(testResult?.wrongAnswers ?? testResult?.wrong ?? Math.max(totalQuestions - correctAnswers, 0));
    const percentage = Number(testResult?.percentage ?? (totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0));

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
                                        <ClipboardCheck size={23} />
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-blue-200">MCQ test mode</p>
                                        <h1 className="mt-1 text-lg font-extrabold leading-tight text-white sm:text-2xl">{topic.topicName}</h1>
                                        <p className="mt-1 text-[10px] leading-5 text-blue-100 sm:text-xs">Select one option for every question and submit your answers.</p>
                                    </div>
                                </div>

                                {mcqs.length > 0 && (
                                    <div className="flex w-fit shrink-0 items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-2">
                                        <Target size={17} />

                                        <div>
                                            <p className="text-[8px] font-bold uppercase tracking-wider text-blue-200">Questions</p>
                                            <p className="text-sm font-extrabold text-white">{mcqs.length}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {mcqs.length > 0 && !testResult && (
                            <div className="border-t border-blue-900/10 bg-white px-4 py-4 sm:px-6">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">Test progress</p>
                                        <p className="mt-1 text-xs font-bold text-[#071a4a]">{answeredCount} of {mcqs.length} answered</p>
                                    </div>

                                    <span className="text-sm font-extrabold text-blue-600">{progress}%</span>
                                </div>

                                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                                    <div className="h-full rounded-full bg-blue-600 transition-all duration-300" style={{ width: `${progress}%` }} />
                                </div>
                            </div>
                        )}
                    </section>

                    {testResult && (
                        <ResultSummary correctAnswers={correctAnswers} wrongAnswers={wrongAnswers} totalQuestions={totalQuestions} percentage={percentage} restartTest={restartTest} readPath={readPath} readMcqCount={readMcqCount} />
                    )}

                    {mcqs.length === 0 ? (
                        <EmptyState topicPath={topicPath} readPath={readPath} readMcqCount={readMcqCount} />
                    ) : (
                        <>
                            <QuestionNavigation mcqs={mcqs} selectedAnswers={selectedAnswers} resultItems={resultItems} submitted={Boolean(testResult)} />

                            <section className="mt-4 space-y-4">
                                {mcqs.map((mcq, index) => (
                                    <TestQuestionCard key={mcq._id} mcq={mcq} questionNumber={index + 1} selectedOption={selectedAnswers[mcq._id]} selectAnswer={selectAnswer} result={findResult(resultItems, mcq._id)} submitted={Boolean(testResult)} />
                                ))}
                            </section>

                            {!testResult && (
                                <SubmitBar answeredCount={answeredCount} totalQuestions={mcqs.length} submitting={submitting} submitTest={submitTest} />
                            )}
                        </>
                    )}
                </div>

                <ToastContainer position="top-right" autoClose={3000} newestOnTop closeOnClick pauseOnHover />
            </main>
        </PageLayout>
    );
};

const QuestionNavigation = ({ mcqs, selectedAnswers, resultItems, submitted }) => {
    return (
        <nav className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white px-3 py-3 shadow-sm sm:px-5">
            <div className="flex items-center gap-2 overflow-x-auto">
                <span className="mr-1 shrink-0 text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">Questions</span>

                {mcqs.map((mcq, index) => {
                    const answered = selectedAnswers[mcq._id] !== undefined;
                    const itemResult = findResult(resultItems, mcq._id);
                    let buttonStyle = "border-slate-200 bg-slate-50 text-slate-600";

                    if (submitted && itemResult?.isCorrect) {
                        buttonStyle = "border-emerald-300 bg-emerald-50 text-emerald-700";
                    } else if (submitted && itemResult && !itemResult.isCorrect) {
                        buttonStyle = "border-red-300 bg-red-50 text-red-700";
                    } else if (answered) {
                        buttonStyle = "border-blue-300 bg-blue-50 text-blue-700";
                    }

                    return (
                        <a key={mcq._id} href={`#question-${mcq._id}`} className={`flex h-8 min-w-8 shrink-0 items-center justify-center rounded-lg border px-2 text-[10px] font-bold transition ${buttonStyle}`}>
                            {index + 1}
                        </a>
                    );
                })}
            </div>
        </nav>
    );
};

const TestQuestionCard = ({ mcq, questionNumber, selectedOption, selectAnswer, result, submitted }) => {
    const correctOption = result?.correctOption;
    const resultBorder = submitted && result
        ? result.isCorrect
            ? "border-emerald-200"
            : "border-red-200"
        : "border-slate-200";

    return (
        <article id={`question-${mcq._id}`} className={`scroll-mt-24 overflow-hidden rounded-2xl border bg-white shadow-sm ${resultBorder}`}>
            <div className="border-b border-slate-200 bg-slate-50/70 px-4 py-3 sm:px-6">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <span className="flex h-7 min-w-7 items-center justify-center rounded-lg bg-blue-700 px-2 text-[10px] font-extrabold text-white">
                            {questionNumber}
                        </span>
                        <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-blue-700">Select one answer</p>
                    </div>

                    {submitted && result && (
                        result.isCorrect ? (
                            <div className="flex items-center gap-1.5 text-emerald-600">
                                <CheckCircle2 size={17} />
                                <span className="text-[9px] font-bold uppercase">Correct</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1.5 text-red-600">
                                <XCircle size={17} />
                                <span className="text-[9px] font-bold uppercase">Incorrect</span>
                            </div>
                        )
                    )}
                </div>
            </div>

            <div className="px-4 py-5 sm:px-7 sm:py-6">
                <h2 style={bookFont} className="whitespace-pre-line text-[16px] font-bold leading-7 text-slate-900 sm:text-lg sm:leading-8">
                    {mcq.statement}
                </h2>

                <div className="mt-5 grid gap-2.5 sm:grid-cols-2 sm:gap-3">
                    {(mcq.options || []).map((option, optionIndex) => {
                        const isSelected = selectedOption === optionIndex;
                        const isCorrectAnswer = submitted && correctOption === optionIndex;
                        const isWrongSelection = submitted && isSelected && correctOption !== optionIndex;
                        let optionStyle = "border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50";
                        let letterStyle = "bg-slate-100 text-slate-600";

                        if (!submitted && isSelected) {
                            optionStyle = "border-blue-500 bg-blue-50 ring-2 ring-blue-100";
                            letterStyle = "bg-blue-600 text-white";
                        }

                        if (isCorrectAnswer) {
                            optionStyle = "border-emerald-400 bg-emerald-50";
                            letterStyle = "bg-emerald-600 text-white";
                        }

                        if (isWrongSelection) {
                            optionStyle = "border-red-400 bg-red-50";
                            letterStyle = "bg-red-600 text-white";
                        }

                        return (
                            <button key={`${mcq._id}-${optionIndex}`} type="button" disabled={submitted} aria-pressed={isSelected} onClick={() => selectAnswer(mcq._id, optionIndex)} className={`flex min-h-12 w-full items-start gap-3 rounded-xl border px-3 py-3 text-left transition sm:px-4 ${optionStyle} ${submitted ? "cursor-default" : "cursor-pointer"}`}>
                                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[10px] font-extrabold ${letterStyle}`}>
                                    {String.fromCharCode(65 + optionIndex)}
                                </span>

                                <span className="min-w-0 flex-1 whitespace-pre-line pt-0.5 text-xs font-semibold leading-5 text-slate-700 sm:text-sm">{option.text}</span>

                                {isCorrectAnswer && <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />}
                                {isWrongSelection && <XCircle size={18} className="shrink-0 text-red-600" />}
                            </button>
                        );
                    })}
                </div>

                {submitted && result && (
                    <div className="mt-5 space-y-3">
                        {!result.isCorrect && (
                            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-600" />

                                    <div className="min-w-0">
                                        <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-emerald-700">Correct answer</p>
                                        <p className="mt-1 text-xs font-bold leading-5 text-emerald-900 sm:text-sm">
                                            {correctOption !== undefined && `${String.fromCharCode(65 + correctOption)}. `}
                                            {result.correctAnswer}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {result.explanation && (
                            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4">
                                <div className="flex items-start gap-3">
                                    <BookOpen size={18} className="mt-0.5 shrink-0 text-amber-700" />

                                    <div className="min-w-0">
                                        <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-amber-700">Explanation</p>
                                        <p style={bookFont} className="mt-1 whitespace-pre-line text-xs leading-6 text-slate-700 sm:text-sm sm:leading-7">{result.explanation}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </article>
    );
};

const SubmitBar = ({ answeredCount, totalQuestions, submitting, submitTest }) => {
    const remainingQuestions = totalQuestions - answeredCount;

    return (
        <section className="sticky bottom-3 z-30 mt-4 rounded-2xl border border-blue-200 bg-white/95 p-3 shadow-xl backdrop-blur-lg sm:p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-xs font-extrabold text-[#071a4a]">{answeredCount} of {totalQuestions} questions answered</p>
                    <p className="mt-1 text-[10px] text-slate-500">
                        {remainingQuestions > 0 ? `${remainingQuestions} ${remainingQuestions === 1 ? "question remains" : "questions remain"}.` : "All questions are answered. You can submit the test."}
                    </p>
                </div>

                <button type="button" onClick={submitTest} disabled={submitting} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto">
                    {submitting ? (
                        <>
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                            Submitting...
                        </>
                    ) : (
                        <>
                            <Send size={16} />
                            Submit Test
                        </>
                    )}
                </button>
            </div>
        </section>
    );
};

const ResultSummary = ({ correctAnswers, wrongAnswers, totalQuestions, percentage, restartTest, readPath, readMcqCount }) => {
    return (
        <section className="mt-4 overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-sm">
            <div className="bg-blue-50 px-4 py-5 sm:px-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
                            <Target size={22} />
                        </div>

                        <div>
                            <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-blue-700">Test completed</p>
                            <h2 className="mt-1 text-lg font-extrabold text-[#071a4a]">Your score is {percentage}%</h2>
                            <p className="mt-1 text-xs text-slate-600">Review each submitted answer below.</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                        {readMcqCount > 0 && (
                            <Link href={readPath} className="flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-[10px] font-bold text-slate-600 transition hover:border-blue-300 hover:text-blue-700">
                                <BookOpen size={15} />
                                Study MCQs
                            </Link>
                        )}

                        <button type="button" onClick={restartTest} className="flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-[10px] font-bold text-white transition hover:bg-blue-700">
                            <RotateCcw size={15} />
                            Retake Test
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 divide-x divide-slate-200 border-t border-slate-200">
                <ResultBox label="Total" value={totalQuestions} color="text-blue-600" />
                <ResultBox label="Correct" value={correctAnswers} color="text-emerald-600" />
                <ResultBox label="Incorrect" value={wrongAnswers} color="text-red-600" />
            </div>
        </section>
    );
};

const ResultBox = ({ label, value, color }) => {
    return (
        <div className="px-2 py-4 text-center sm:py-5">
            <p className={`text-xl font-extrabold sm:text-2xl ${color}`}>{value}</p>
            <p className="mt-1 text-[8px] font-bold uppercase tracking-[0.12em] text-slate-400 sm:text-[9px]">{label}</p>
        </div>
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
            <span className="font-bold text-blue-700">Topic Test</span>
        </nav>
    );
};

const EmptyState = ({ topicPath, readPath, readMcqCount }) => {
    return (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-14 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <ClipboardCheck size={24} />
            </div>

            <h2 className="mt-4 text-base font-extrabold text-[#071a4a]">No test-mode MCQs are available</h2>
            <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-slate-500">Test questions will appear here when test-mode MCQs are added to this topic.</p>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
                <Link href={topicPath} className="flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 text-xs font-bold text-slate-600 transition hover:border-blue-300 hover:text-blue-700">
                    <ArrowLeft size={15} />
                    Return to Topic
                </Link>

                {readMcqCount > 0 && (
                    <Link href={readPath} className="flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-xs font-bold text-white transition hover:bg-blue-700">
                        <BookOpen size={15} />
                        Read MCQs
                    </Link>
                )}
            </div>
        </div>
    );
};

const TestPageLoading = () => {
    return (
        <PageLayout>
            <main className="min-h-[75vh] bg-[#eef1f5] px-3 py-6 sm:px-6">
                <div className="mx-auto w-full max-w-[1050px] animate-pulse">
                    <div className="h-10 rounded-xl bg-slate-200" />
                    <div className="mt-4 h-44 rounded-2xl bg-slate-200" />

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

const TestPageError = ({ message, retry, topicPath }) => {
    return (
        <PageLayout>
            <main className="flex min-h-[75vh] items-center justify-center bg-[#eef1f5] px-4 py-8">
                <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white px-6 py-10 text-center shadow-sm">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500">
                        <AlertCircle size={22} />
                    </div>

                    <h1 className="mt-4 text-lg font-extrabold text-[#071a4a]">Test could not be loaded</h1>
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

const findResult = (results, mcqId) => {
    return results.find((item) => {
        const resultId = item.mcqId || item._id || item.id;
        return String(resultId) === String(mcqId);
    });
};

export default TopicMcqTest;