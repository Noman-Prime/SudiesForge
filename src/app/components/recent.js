"use client";

import axios from "axios";
import Link from "next/link";
import { ArrowRight, BookOpen, FileText, GraduationCap, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

const resourceStyles = {
    subject: {
        name: "Subject",
        icon: GraduationCap,
        iconStyle: "bg-blue-600 text-white lg:bg-blue-50 lg:text-blue-600 lg:group-hover:bg-blue-600 lg:group-hover:text-white",
        cardStyle: "border-blue-300 shadow-md lg:border-slate-200 lg:shadow-sm lg:hover:border-blue-300 lg:hover:shadow-md",
    },
    chapter: {
        name: "Chapter",
        icon: BookOpen,
        iconStyle: "bg-emerald-600 text-white lg:bg-emerald-50 lg:text-emerald-600 lg:group-hover:bg-emerald-600 lg:group-hover:text-white",
        cardStyle: "border-emerald-300 shadow-md lg:border-slate-200 lg:shadow-sm lg:hover:border-emerald-300 lg:hover:shadow-md",
    },
    topic: {
        name: "Topic",
        icon: FileText,
        iconStyle: "bg-violet-600 text-white lg:bg-violet-50 lg:text-violet-600 lg:group-hover:bg-violet-600 lg:group-hover:text-white",
        cardStyle: "border-violet-300 shadow-md lg:border-slate-200 lg:shadow-sm lg:hover:border-violet-300 lg:hover:shadow-md",
    },
};

const getId = (value) => {
    return typeof value === "object" ? value?._id : value;
};

const getName = (value) => {
    return typeof value === "object" ? value?.name : "";
};

const getCollection = (result, property) => {
    if (result.status !== "fulfilled" || !result.value.data.success) {
        return [];
    }

    return result.value.data[property] || [];
};

const RecentOpened = () => {
    const [recentItems, setRecentItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    const getRecentItems = async () => {
        try {
            setLoading(true);
            setErrorMessage("");

            const results = await Promise.allSettled([
                axios.get("/api/subject"),
                axios.get("/api/chapter"),
                axios.get("/api/topic"),
            ]);

            if (results.every((result) => result.status === "rejected")) {
                throw results[0].reason;
            }

            const [subjectsResult, chaptersResult, topicsResult] = results;

            const subjects = getCollection(subjectsResult, "subjects");
            const chapters = getCollection(chaptersResult, "chapters");
            const topics = getCollection(topicsResult, "topics");

            const subjectMap = new Map(
                subjects.map((subject) => [
                    String(subject._id),
                    subject,
                ]),
            );

            const chapterMap = new Map(
                chapters.map((chapter) => [
                    String(chapter._id),
                    chapter,
                ]),
            );

            const subjectItems = subjects
                .map((subject) => {
                    const eventId = getId(subject.event);

                    if (!eventId) {
                        return null;
                    }

                    return {
                        _id: `subject-${subject._id}`,
                        resourceType: "subject",
                        title: subject.name,
                        subtitle: getName(subject.event) || "Explore subject material",
                        href: `/events/${eventId}/subjects/${subject._id}`,
                        createdAt: subject.createdAt,
                    };
                })
                .filter(Boolean);

            const chapterItems = chapters
                .map((chapter) => {
                    const subjectData = typeof chapter.subject === "object"
                        ? chapter.subject
                        : subjectMap.get(String(chapter.subject));

                    const subjectId = getId(chapter.subject);
                    const eventId = getId(subjectData?.event);

                    if (!eventId || !subjectId) {
                        return null;
                    }

                    return {
                        _id: `chapter-${chapter._id}`,
                        resourceType: "chapter",
                        title: chapter.chapterName,
                        subtitle: subjectData?.name
                            ? `${subjectData.name} · Chapter ${chapter.chapterNumber}`
                            : `Chapter ${chapter.chapterNumber}`,
                        href: `/events/${eventId}/subjects/${subjectId}/chapters/${chapter._id}`,
                        createdAt: chapter.createdAt,
                    };
                })
                .filter(Boolean);

            const topicItems = topics
                .map((topic) => {
                    const chapterData = typeof topic.chapter === "object"
                        ? topic.chapter
                        : chapterMap.get(String(topic.chapter));

                    const chapterId = getId(topic.chapter);

                    const subjectData = typeof chapterData?.subject === "object"
                        ? chapterData.subject
                        : subjectMap.get(String(chapterData?.subject));

                    const subjectId = getId(chapterData?.subject);
                    const eventId = getId(subjectData?.event);

                    if (!eventId || !subjectId || !chapterId) {
                        return null;
                    }

                    return {
                        _id: `topic-${topic._id}`,
                        resourceType: "topic",
                        title: topic.topicName,
                        subtitle: chapterData?.chapterName
                            ? `${subjectData?.name || "Subject"} · ${chapterData.chapterName}`
                            : subjectData?.name || "Topic material",
                        href: `/events/${eventId}/subjects/${subjectId}/chapters/${chapterId}/topics/${topic._id}`,
                        createdAt: topic.createdAt,
                    };
                })
                .filter(Boolean);

            const items = [
                ...subjectItems,
                ...chapterItems,
                ...topicItems,
            ]
                .filter((item) => item.createdAt)
                .sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt))
                .slice(0, 4);

            setRecentItems(items);
        } catch (error) {
            console.log(error);
            setRecentItems([]);
            setErrorMessage(error.response?.data?.message || "Recent material could not be loaded");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getRecentItems();
    }, []);

    if (!loading && !errorMessage && recentItems.length === 0) {
        return null;
    }

    return (
        <section aria-labelledby="recent-material-heading" className="border-b border-slate-200 bg-white px-3 py-7 sm:px-6 sm:py-9 lg:px-8">
            <div className="mx-auto w-full max-w-[1200px]">
                <div className="flex items-end justify-between gap-4">
                    <div>
                        <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-blue-600">
                            New learning material
                        </p>

                        <h2 id="recent-material-heading" className="mt-1 text-lg font-extrabold tracking-tight text-[#071a4a] sm:text-xl">
                            Recently Added
                        </h2>

                        <p className="mt-1 max-w-2xl text-[10px] leading-5 text-slate-500 sm:text-xs">
                            Explore the latest subjects, chapters and topics added to StudiesForge.
                        </p>
                    </div>

                    {!loading && !errorMessage && recentItems.length > 0 && (
                        <span className="flex h-9 min-w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 px-2.5 text-xs font-extrabold text-blue-700">
                            {recentItems.length}
                        </span>
                    )}
                </div>

                {loading ? (
                    <RecentLoading />
                ) : errorMessage ? (
                    <RecentError message={errorMessage} retry={getRecentItems} />
                ) : (
                    <div className="mt-5 grid grid-cols-2 items-stretch gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
                        {recentItems.map((item) => {
                            const resource = resourceStyles[item.resourceType] || resourceStyles.topic;
                            const Icon = resource.icon;

                            return (
                                <article key={item._id} className={`group flex h-full min-w-0 flex-col rounded-2xl border bg-white p-3 transition duration-200 lg:hover:-translate-y-0.5 sm:p-4 ${resource.cardStyle}`}>
                                    <div className="flex items-start justify-between gap-2">
                                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition duration-200 sm:h-11 sm:w-11 ${resource.iconStyle}`}>
                                            <Icon size={20} strokeWidth={1.9} />
                                        </div>

                                        <span className="rounded-md bg-slate-100 px-2 py-1 text-[7px] font-extrabold uppercase tracking-[0.1em] text-slate-500 sm:text-[8px]">
                                            {resource.name}
                                        </span>
                                    </div>

                                    <div className="mt-3 min-w-0 flex-1">
                                        <h3 className="line-clamp-2 text-xs font-extrabold leading-5 text-[#071a4a] sm:text-sm">
                                            {item.title}
                                        </h3>

                                        <p className="mt-1.5 line-clamp-2 text-[9px] leading-4 text-slate-500 sm:text-[10px]">
                                            {item.subtitle}
                                        </p>
                                    </div>

                                    <div className="mt-4 border-t border-slate-100 pt-3">
                                        <Link href={item.href} className="flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 text-[9px] font-bold text-white shadow-md transition active:scale-[0.98] lg:shadow-sm lg:hover:bg-blue-700 lg:hover:shadow-md sm:h-10 sm:text-[10px]">
                                            Open {resource.name}
                                            <ArrowRight size={14} />
                                        </Link>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
};

const RecentLoading = () => {
    return (
        <div className="mt-5 grid grid-cols-2 items-stretch gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
                <div key={item} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
                    <div className="flex items-start justify-between gap-2">
                        <div className="h-10 w-10 rounded-xl bg-slate-200 sm:h-11 sm:w-11" />
                        <div className="h-5 w-14 rounded-md bg-slate-100" />
                    </div>

                    <div className="mt-4 h-3 w-3/4 rounded bg-slate-200" />
                    <div className="mt-2 h-3 w-1/2 rounded bg-slate-100" />
                    <div className="mt-5 h-9 rounded-lg bg-slate-200 sm:h-10" />
                </div>
            ))}
        </div>
    );
};

const RecentError = ({ message, retry }) => {
    return (
        <div className="mt-5 rounded-2xl border border-red-200 bg-white px-4 py-10 text-center shadow-sm">
            <FileText size={27} className="mx-auto text-red-400" />

            <h3 className="mt-3 text-sm font-extrabold text-[#071a4a]">
                Recent material could not be loaded
            </h3>

            <p className="mx-auto mt-1.5 max-w-md text-[10px] leading-5 text-slate-500 sm:text-xs">
                {message}
            </p>

            <button type="button" onClick={retry} className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-bold text-white shadow-sm transition active:scale-[0.98] hover:bg-blue-700">
                <RefreshCw size={15} />
                Try Again
            </button>
        </div>
    );
};

export default RecentOpened;