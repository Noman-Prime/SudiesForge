"use client";

import axios from "axios";
import { AlertCircle, BookOpen, FileText, GraduationCap, LibraryBig, ListChecks, RefreshCw } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const contentDetails = {
    subjects: {
        icon: GraduationCap,
        description: "Choose a subject",
    },
    chapters: {
        icon: BookOpen,
        description: "Follow book chapters",
    },
    topics: {
        icon: FileText,
        description: "Study individual topics",
    },
    mcqs: {
        icon: ListChecks,
        description: "Practise with questions",
    },
    pastpapers: {
        icon: LibraryBig,
        description: "Review previous papers",
    },
};

const EventOverview = () => {
    const { id } = useParams();
    const [eventName, setEventName] = useState("");
    const [learningPath, setLearningPath] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    const getOverview = async () => {
        try {
            setLoading(true);
            setErrorMessage("");

            const result = await axios.get(`/api/events/${id}/navigation`);

            if (!result.data.success) {
                setEventName("");
                setLearningPath([]);
                setErrorMessage(result.data.message || "Event overview could not be loaded");
                return;
            }

            const availableContent = (result.data.collection || []).filter((item) => Number(item.count) > 0);

            setEventName(result.data.eventName || "");
            setLearningPath(availableContent);
        } catch (error) {
            console.log(error);
            setEventName("");
            setLearningPath([]);
            setErrorMessage(error.response?.data?.message || "Event overview could not be loaded");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            getOverview();
        }
    }, [id]);

    if (loading) {
        return <OverviewLoading />;
    }

    if (errorMessage || !eventName) {
        return <OverviewError message={errorMessage} retry={getOverview} />;
    }

    return (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-2 border-b border-slate-200 px-4 py-4 sm:px-6 sm:py-5">
                <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-blue-600">
                    Learning structure
                </p>

                <h2 className="text-lg font-extrabold tracking-tight text-[#071a4a] sm:text-xl">
                    Your {eventName} Learning Path
                </h2>

                <p className="max-w-2xl text-[10px] leading-5 text-slate-500 sm:text-xs">
                    Move through the available learning stages in order, from selecting a subject to practising the prepared material.
                </p>
            </div>

            {learningPath.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 bg-slate-50/70 p-3 sm:p-5 xl:grid-cols-4">
                    {learningPath.map((item, index) => {
                        const details = contentDetails[item.key] || {
                            icon: LibraryBig,
                            description: "Explore available content",
                        };

                        const Icon = details.icon;

                        return (
                            <article key={item.key} className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md sm:p-4">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                                        <Icon size={18} strokeWidth={1.9} />
                                    </div>

                                    <span className="text-[8px] font-bold uppercase tracking-[0.12em] text-slate-300">
                                        Step {String(index + 1).padStart(2, "0")}
                                    </span>
                                </div>

                                <p className="mt-3 text-xl font-extrabold leading-none text-[#071a4a] sm:text-2xl">
                                    {item.count}
                                </p>

                                <h3 className="mt-1.5 truncate text-xs font-extrabold text-[#071a4a] sm:text-sm">
                                    {item.name}
                                </h3>

                                <p className="mt-1 text-[9px] leading-4 text-slate-500 sm:text-[10px]">
                                    {details.description}
                                </p>
                            </article>
                        );
                    })}
                </div>
            ) : (
                <div className="px-4 py-10 text-center sm:px-6">
                    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <LibraryBig size={21} />
                    </div>

                    <h3 className="mt-3 text-sm font-extrabold text-[#071a4a]">
                        Learning material is coming soon
                    </h3>

                    <p className="mx-auto mt-1.5 max-w-md text-[10px] leading-5 text-slate-500 sm:text-xs">
                        Available subjects and preparation material will appear here when they are added to this event.
                    </p>
                </div>
            )}
        </section>
    );
};

const OverviewLoading = () => {
    return (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="animate-pulse px-4 py-5 sm:px-6">
                <div className="h-2.5 w-24 rounded bg-slate-100" />
                <div className="mt-3 h-6 w-56 max-w-full rounded bg-slate-200" />
                <div className="mt-3 h-3 w-full max-w-xl rounded bg-slate-100" />

                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[1, 2, 3, 4].map((item) => (
                        <div key={item} className="h-32 rounded-xl bg-slate-100" />
                    ))}
                </div>
            </div>
        </section>
    );
};

const OverviewError = ({ message, retry }) => {
    return (
        <section className="rounded-2xl border border-red-200 bg-white px-4 py-8 text-center shadow-sm sm:px-6">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-500">
                <AlertCircle size={21} />
            </div>

            <h2 className="mt-3 text-base font-extrabold text-[#071a4a]">
                Overview could not be loaded
            </h2>

            <p className="mx-auto mt-1.5 max-w-md text-xs leading-5 text-slate-500">
                {message || "Something went wrong while loading the event overview."}
            </p>

            <button type="button" onClick={retry} className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-bold text-white transition hover:bg-blue-700">
                <RefreshCw size={15} />
                Try Again
            </button>
        </section>
    );
};

export default EventOverview;