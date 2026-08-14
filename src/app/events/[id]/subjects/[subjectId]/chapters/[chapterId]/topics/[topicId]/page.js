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
    Home,
    List,
    RefreshCw,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const bookFont = {
    fontFamily: 'Georgia, Cambria, "Times New Roman", serif',
};

const getParagraphs = (text) =>
    String(text || "")
        .split(/\n+/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean);

const TopicMaterial = () => {
    const {
        id: eventId,
        subjectId,
        chapterId,
        topicId,
    } = useParams();

    const [topic, setTopic] = useState(null);
    const [chapter, setChapter] = useState(null);
    const [subject, setSubject] = useState(null);
    const [chapterTopics, setChapterTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [readingProgress, setReadingProgress] = useState(0);

    const getPageData = async () => {
        try {
            setLoading(true);
            setErrorMessage("");

            const results = await Promise.allSettled([
                axios.get(`/api/topic/${topicId}`),
                axios.get(`/api/chapter/${chapterId}`),
                axios.get(`/api/subject/${subjectId}`),
                axios.get(`/api/topic/chapter/${chapterId}`),
            ]);

            const [
                topicResult,
                chapterResult,
                subjectResult,
                topicsResult,
            ] = results;

            if (
                topicResult.status === "rejected" ||
                !topicResult.value.data.success
            ) {
                throw new Error(
                    topicResult.reason?.response?.data?.message ||
                        "Topic material could not be loaded",
                );
            }

            if (
                chapterResult.status === "rejected" ||
                !chapterResult.value.data.success
            ) {
                throw new Error(
                    chapterResult.reason?.response?.data?.message ||
                        "Chapter could not be loaded",
                );
            }

            if (
                subjectResult.status === "rejected" ||
                !subjectResult.value.data.success
            ) {
                throw new Error(
                    subjectResult.reason?.response?.data?.message ||
                        "Subject could not be loaded",
                );
            }

            const currentTopic = topicResult.value.data.topic;
            const currentChapter =
                chapterResult.value.data.chapter;
            const currentSubject =
                subjectResult.value.data.subject;

            const topicChapterId =
                currentTopic.chapter?._id ||
                currentTopic.chapter;

            const chapterSubjectId =
                currentChapter.subject?._id ||
                currentChapter.subject;

            if (
                String(topicChapterId) !==
                String(chapterId)
            ) {
                throw new Error(
                    "This topic does not belong to this chapter",
                );
            }

            if (
                String(chapterSubjectId) !==
                String(subjectId)
            ) {
                throw new Error(
                    "This chapter does not belong to this subject",
                );
            }

            setTopic(currentTopic);
            setChapter(currentChapter);
            setSubject(currentSubject);

            if (
                topicsResult.status === "fulfilled" &&
                topicsResult.value.data.success
            ) {
                setChapterTopics(
                    [
                        ...(topicsResult.value.data
                            .topics || []),
                    ].sort(
                        (
                            firstTopic,
                            secondTopic,
                        ) =>
                            Number(
                                firstTopic.topicNumber,
                            ) -
                            Number(
                                secondTopic.topicNumber,
                            ),
                    ),
                );
            } else {
                setChapterTopics([currentTopic]);
            }
        } catch (error) {
            console.log(error);

            setErrorMessage(
                error.response?.data?.message ||
                    error.message ||
                    "Topic material could not be loaded",
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (
            eventId &&
            subjectId &&
            chapterId &&
            topicId
        ) {
            getPageData();
        }
    }, [
        eventId,
        subjectId,
        chapterId,
        topicId,
    ]);

    useEffect(() => {
        const updateProgress = () => {
            const availableHeight =
                document.documentElement
                    .scrollHeight -
                window.innerHeight;

            if (availableHeight <= 0) {
                setReadingProgress(100);
                return;
            }

            setReadingProgress(
                Math.min(
                    100,
                    Math.max(
                        0,
                        (window.scrollY /
                            availableHeight) *
                            100,
                    ),
                ),
            );
        };

        updateProgress();

        window.addEventListener(
            "scroll",
            updateProgress,
            {
                passive: true,
            },
        );

        return () =>
            window.removeEventListener(
                "scroll",
                updateProgress,
            );
    }, []);

    const currentTopicIndex = useMemo(
        () =>
            chapterTopics.findIndex(
                (item) =>
                    String(item._id) ===
                    String(topicId),
            ),
        [chapterTopics, topicId],
    );

    const previousTopic =
        currentTopicIndex > 0
            ? chapterTopics[
                  currentTopicIndex - 1
              ]
            : null;

    const nextTopic =
        currentTopicIndex >= 0 &&
        currentTopicIndex <
            chapterTopics.length - 1
            ? chapterTopics[
                  currentTopicIndex + 1
              ]
            : null;

    const chapterPath = `/events/${eventId}/subjects/${subjectId}/chapters/${chapterId}`;

    const getTopicPath = (
        selectedTopicId,
    ) =>
        `${chapterPath}/topics/${selectedTopicId}`;

    const scrollToSection = (
        sectionIndex,
    ) => {
        document
            .getElementById(
                `section-${sectionIndex}`,
            )
            ?.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
    };

    if (loading) {
        return <ReadingPageLoading />;
    }

    if (
        errorMessage ||
        !topic ||
        !chapter ||
        !subject
    ) {
        return (
            <ReadingPageError
                message={
                    errorMessage ||
                    "The requested topic was not found"
                }
                onRetry={getPageData}
                chapterPath={chapterPath}
            />
        );
    }

    const sections = topic.sections || [];

    return (
        <>
            <EventProvider>
                <Navbar />
            </EventProvider>

            <div className="sticky top-0 z-[60] h-1 bg-slate-200">
                <div
                    className="h-full bg-blue-600 transition-[width] duration-150"
                    style={{
                        width: `${readingProgress}%`,
                    }}
                />
            </div>

            <main className="min-h-screen bg-slate-100 px-3 py-4 sm:px-6 sm:py-7 lg:px-8">
                <div className="mx-auto w-full max-w-[1120px]">
                    <PageBreadcrumb
                        eventId={eventId}
                        subjectId={subjectId}
                        chapterPath={
                            chapterPath
                        }
                        subjectName={
                            subject.name
                        }
                        chapterName={
                            chapter.chapterName
                        }
                        topicName={
                            topic.topicName
                        }
                    />

                    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-[#fffefa] shadow-[0_18px_55px_-35px_rgba(15,23,42,.45)]">
                        <header className="border-b border-slate-200 px-5 py-7 sm:px-8 sm:py-9 lg:px-10">
                            <div className="flex flex-wrap items-center gap-2 text-[9px] font-bold uppercase tracking-[0.14em] text-blue-600 sm:text-[10px]">
                                <span>
                                    {subject.name}
                                </span>

                                <span className="text-slate-300">
                                    •
                                </span>

                                <span>
                                    Chapter{" "}
                                    {
                                        chapter.chapterNumber
                                    }
                                </span>

                                <span className="text-slate-300">
                                    •
                                </span>

                                <span>
                                    Topic{" "}
                                    {
                                        topic.topicNumber
                                    }
                                </span>
                            </div>

                            <h1
                                style={bookFont}
                                className="mt-3 max-w-4xl text-[28px] font-bold leading-[1.15] tracking-[-0.02em] text-slate-900 sm:text-4xl lg:text-[42px]"
                            >
                                {
                                    topic.topicName
                                }
                            </h1>

                            <p className="mt-3 max-w-3xl text-xs leading-5 text-slate-500 sm:text-sm sm:leading-6">
                                From{" "}
                                {
                                    chapter.chapterName
                                }
                                . Read the complete
                                topic in a clean,
                                structured textbook
                                format.
                            </p>
                        </header>

                        <div className="lg:grid lg:grid-cols-[230px_minmax(0,1fr)]">
                            <aside className="border-b border-slate-200 bg-slate-50/80 p-4 sm:p-5 lg:border-b-0 lg:border-r lg:p-6">
                                <div className="lg:sticky lg:top-24">
                                    <div className="flex items-center gap-2 text-slate-900">
                                        <List
                                            size={
                                                16
                                            }
                                            className="text-blue-600"
                                        />

                                        <h2 className="text-[10px] font-extrabold uppercase tracking-[0.14em]">
                                            On this
                                            page
                                        </h2>
                                    </div>

                                    {sections.length >
                                    0 ? (
                                        <nav className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-1">
                                            {sections.map(
                                                (
                                                    section,
                                                    index,
                                                ) => (
                                                    <button
                                                        key={
                                                            section._id ||
                                                            index
                                                        }
                                                        type="button"
                                                        onClick={() =>
                                                            scrollToSection(
                                                                index,
                                                            )
                                                        }
                                                        className="group flex min-w-0 items-start gap-2 rounded-lg px-2.5 py-2 text-left transition hover:bg-white hover:shadow-sm"
                                                    >
                                                        <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[8px] font-extrabold text-blue-700">
                                                            {index +
                                                                1}
                                                        </span>

                                                        <span className="line-clamp-2 text-[10px] font-semibold leading-4 text-slate-600 transition group-hover:text-blue-700 sm:text-[11px]">
                                                            {
                                                                section.subHeading
                                                            }
                                                        </span>
                                                    </button>
                                                ),
                                            )}
                                        </nav>
                                    ) : (
                                        <p className="mt-4 text-[10px] leading-5 text-slate-500">
                                            No
                                            sections
                                            are
                                            available.
                                        </p>
                                    )}

                                    <div className="mt-5 hidden border-t border-slate-200 pt-5 lg:block">
                                        <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
                                            Reading
                                            progress
                                        </p>

                                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
                                            <div
                                                className="h-full rounded-full bg-blue-600 transition-[width] duration-150"
                                                style={{
                                                    width: `${readingProgress}%`,
                                                }}
                                            />
                                        </div>

                                        <p className="mt-2 text-[10px] font-bold text-slate-600">
                                            {Math.round(
                                                readingProgress,
                                            )}
                                            %
                                            completed
                                        </p>
                                    </div>
                                </div>
                            </aside>

                            <div className="px-5 py-7 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
                                <div className="mx-auto max-w-[740px]">
                                    {topic.image
                                        ?.url && (
                                        <figure className="mb-10 sm:mb-12">
                                            <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-2 sm:p-3">
                                                <img
                                                    src={
                                                        topic
                                                            .image
                                                            .url
                                                    }
                                                    alt={
                                                        topic.topicName
                                                    }
                                                    className="max-h-[430px] w-full rounded-lg bg-white object-contain"
                                                />
                                            </div>

                                            <figcaption
                                                style={
                                                    bookFont
                                                }
                                                className="mt-3 text-center text-[10px] italic leading-5 text-slate-500 sm:text-xs"
                                            >
                                                Figure:{" "}
                                                {
                                                    topic.topicName
                                                }
                                            </figcaption>
                                        </figure>
                                    )}

                                    {sections.length ===
                                    0 ? (
                                        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-12 text-center">
                                            <BookOpen
                                                size={
                                                    34
                                                }
                                                className="mx-auto text-blue-500"
                                            />

                                            <p
                                                style={
                                                    bookFont
                                                }
                                                className="mt-4 text-base font-bold text-slate-800"
                                            >
                                                Topic
                                                material
                                                is being
                                                prepared
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-12 sm:space-y-14">
                                            {sections.map(
                                                (
                                                    section,
                                                    sectionIndex,
                                                ) => (
                                                    <ReadingSection
                                                        key={
                                                            section._id ||
                                                            sectionIndex
                                                        }
                                                        section={
                                                            section
                                                        }
                                                        sectionIndex={
                                                            sectionIndex
                                                        }
                                                    />
                                                ),
                                            )}
                                        </div>
                                    )}

                                    <div className="mt-14 border-t border-slate-200 pt-8 text-center">
                                        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                                            <BookOpen
                                                size={
                                                    19
                                                }
                                            />
                                        </div>

                                        <p className="mt-3 text-[9px] font-bold uppercase tracking-[0.18em] text-blue-600">
                                            End of
                                            topic
                                        </p>

                                        <p
                                            style={
                                                bookFont
                                            }
                                            className="mt-1 text-sm font-bold text-slate-800"
                                        >
                                            {
                                                topic.topicName
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <footer className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-5 py-3 text-[8px] font-bold uppercase tracking-[0.13em] text-slate-500 sm:px-8 sm:text-[9px] lg:px-10">
                            <span>
                                {subject.name}
                            </span>

                            <span>
                                Chapter{" "}
                                {
                                    chapter.chapterNumber
                                }{" "}
                                · Topic{" "}
                                {
                                    topic.topicNumber
                                }
                            </span>
                        </footer>
                    </article>

                    <TopicNavigation
                        previousTopic={
                            previousTopic
                        }
                        nextTopic={nextTopic}
                        chapterPath={
                            chapterPath
                        }
                        getTopicPath={
                            getTopicPath
                        }
                    />
                </div>
            </main>

            <Footer />
        </>
    );
};

const PageBreadcrumb = ({
    eventId,
    subjectId,
    chapterPath,
    subjectName,
    chapterName,
    topicName,
}) => (
    <nav className="mb-4 flex items-center gap-1.5 overflow-x-auto whitespace-nowrap rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[10px] font-semibold text-slate-500 shadow-sm sm:text-xs">
        <Link
            href="/"
            className="flex items-center gap-1 transition hover:text-blue-700"
        >
            <Home size={13} />
            Home
        </Link>

        <ChevronRight
            size={13}
            className="shrink-0 text-slate-300"
        />

        <Link
            href={`/events/${eventId}/subjects/${subjectId}`}
            className="transition hover:text-blue-700"
        >
            {subjectName}
        </Link>

        <ChevronRight
            size={13}
            className="shrink-0 text-slate-300"
        />

        <Link
            href={chapterPath}
            className="max-w-40 truncate transition hover:text-blue-700 sm:max-w-60"
        >
            {chapterName}
        </Link>

        <ChevronRight
            size={13}
            className="shrink-0 text-slate-300"
        />

        <span className="max-w-40 truncate font-bold text-blue-700 sm:max-w-60">
            {topicName}
        </span>
    </nav>
);

const ReadingSection = ({
    section,
    sectionIndex,
}) => {
    const paragraphs = getParagraphs(
        section.text,
    );

    return (
        <section
            id={`section-${sectionIndex}`}
            className="scroll-mt-24"
        >
            <div className="mb-5 flex items-start gap-3">
                <span className="mt-0.5 flex h-7 min-w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[10px] font-extrabold text-white shadow-sm">
                    {sectionIndex + 1}
                </span>

                <div className="min-w-0">
                    <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-blue-600 sm:text-[9px]">
                        Section{" "}
                        {sectionIndex + 1}
                    </p>

                    <h2
                        style={bookFont}
                        className="mt-1 text-xl font-bold leading-tight text-slate-900 sm:text-2xl"
                    >
                        {section.subHeading}
                    </h2>
                </div>
            </div>

            {paragraphs.length > 0 ? (
                <div
                    style={bookFont}
                    className="text-[15px] leading-[1.85] text-slate-700 sm:text-[17px] sm:leading-[1.95]"
                >
                    {paragraphs.map(
                        (
                            paragraph,
                            paragraphIndex,
                        ) => (
                            <p
                                key={
                                    paragraphIndex
                                }
                                className={`text-left lg:text-justify ${
                                    paragraphIndex >
                                    0
                                        ? "mt-5"
                                        : ""
                                } ${
                                    sectionIndex ===
                                        0 &&
                                    paragraphIndex ===
                                        0
                                        ? "first-letter:float-left first-letter:mr-2 first-letter:mt-2 first-letter:text-[48px] first-letter:font-bold first-letter:leading-[.7] first-letter:text-blue-700 sm:first-letter:text-[58px]"
                                        : ""
                                }`}
                            >
                                {paragraph}
                            </p>
                        ),
                    )}
                </div>
            ) : (
                <p
                    style={bookFont}
                    className="text-sm italic text-slate-500"
                >
                    This section is being
                    prepared.
                </p>
            )}
        </section>
    );
};

const TopicNavigation = ({
    previousTopic,
    nextTopic,
    chapterPath,
    getTopicPath,
}) => (
    <nav className="mt-4 grid grid-cols-2 gap-3">
        {previousTopic ? (
            <Link
                href={getTopicPath(
                    previousTopic._id,
                )}
                className="group flex min-w-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3.5 shadow-sm transition hover:border-blue-200 hover:shadow-md sm:px-4"
            >
                <ArrowLeft
                    size={16}
                    className="shrink-0 text-blue-600 transition group-hover:-translate-x-0.5"
                />

                <div className="min-w-0">
                    <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-slate-400 sm:text-[9px]">
                        Previous topic
                    </p>

                    <p className="mt-1 truncate text-[10px] font-bold text-slate-800 sm:text-xs">
                        {
                            previousTopic.topicName
                        }
                    </p>
                </div>
            </Link>
        ) : (
            <Link
                href={chapterPath}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3.5 text-[10px] font-bold text-slate-600 shadow-sm transition hover:border-blue-200 hover:text-blue-700 sm:text-xs"
            >
                <ArrowLeft size={15} />
                Chapter topics
            </Link>
        )}

        {nextTopic ? (
            <Link
                href={getTopicPath(
                    nextTopic._id,
                )}
                className="group flex min-w-0 items-center justify-end gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3.5 text-right shadow-sm transition hover:border-blue-200 hover:shadow-md sm:px-4"
            >
                <div className="min-w-0">
                    <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-slate-400 sm:text-[9px]">
                        Next topic
                    </p>

                    <p className="mt-1 truncate text-[10px] font-bold text-slate-800 sm:text-xs">
                        {nextTopic.topicName}
                    </p>
                </div>

                <ArrowRight
                    size={16}
                    className="shrink-0 text-blue-600 transition group-hover:translate-x-0.5"
                />
            </Link>
        ) : (
            <Link
                href={chapterPath}
                className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 py-3.5 text-[10px] font-bold text-white shadow-sm transition hover:bg-blue-700 sm:text-xs"
            >
                Finish reading
                <ArrowRight size={15} />
            </Link>
        )}
    </nav>
);

const ReadingPageLoading = () => (
    <>
        <EventProvider>
            <Navbar />
        </EventProvider>

        <main className="min-h-[75vh] bg-slate-100 px-3 py-8">
            <div className="mx-auto max-w-[1120px] animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-6 py-10 sm:px-10">
                    <div className="h-3 w-52 rounded bg-slate-200" />

                    <div className="mt-5 h-10 w-3/4 rounded bg-slate-200" />

                    <div className="mt-4 h-4 w-1/2 rounded bg-slate-100" />
                </div>

                <div className="px-6 py-10 sm:px-10 lg:ml-[230px]">
                    <div className="mx-auto max-w-[740px] space-y-4">
                        {[1, 2, 3, 4, 5, 6].map(
                            (item) => (
                                <div
                                    key={item}
                                    className="h-3 rounded bg-slate-100"
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

const ReadingPageError = ({
    message,
    onRetry,
    chapterPath,
}) => (
    <>
        <EventProvider>
            <Navbar />
        </EventProvider>

        <main className="flex min-h-[75vh] items-center justify-center bg-slate-100 px-4 py-8">
            <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <BookOpen size={28} />
                </div>

                <h1 className="mt-5 text-xl font-extrabold text-slate-900 sm:text-2xl">
                    Topic could not be opened
                </h1>

                <p className="mt-3 text-xs leading-6 text-slate-500 sm:text-sm">
                    {message}
                </p>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <Link
                        href={chapterPath}
                        className="flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-[11px] font-bold text-slate-600 transition hover:bg-slate-50"
                    >
                        <ArrowLeft size={14} />
                        Back to chapter
                    </Link>

                    <button
                        type="button"
                        onClick={onRetry}
                        className="flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-[11px] font-bold text-white transition hover:bg-blue-700"
                    >
                        <RefreshCw size={14} />
                        Try again
                    </button>
                </div>
            </div>
        </main>

        <Footer />
    </>
);

export default TopicMaterial;