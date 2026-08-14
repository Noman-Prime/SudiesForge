"use client";

import axios from "axios";
import { AlertCircle, CalendarDays, GraduationCap, RefreshCw } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const EventSummary = () => {
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const [subjectCount, setSubjectCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    const getEventSummary = async () => {
        try {
            setLoading(true);
            setErrorMessage("");

            const [eventResult, subjectsResult] = await Promise.allSettled([
                axios.get(`/api/events/${id}`),
                axios.get(`/api/events/${id}/subjects`),
            ]);

            if (eventResult.status !== "fulfilled" || !eventResult.value.data.success) {
                setEvent(null);
                setErrorMessage(eventResult.reason?.response?.data?.message || "Event information could not be loaded");
                return;
            }

            setEvent(eventResult.value.data.event);

            if (subjectsResult.status === "fulfilled" && subjectsResult.value.data.success) {
                setSubjectCount(subjectsResult.value.data.subjects?.length || 0);
            } else {
                setSubjectCount(0);
            }
        } catch (error) {
            console.log(error);
            setEvent(null);
            setErrorMessage(error.response?.data?.message || "Event information could not be loaded");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            getEventSummary();
        }
    }, [id]);

    if (loading) {
        return <SummaryLoading />;
    }

    if (errorMessage || !event) {
        return <SummaryError message={errorMessage} retry={getEventSummary} />;
    }

    const updatedText = event.updatedAt
        ? new Intl.DateTimeFormat("en-PK", {
            day: "numeric",
            month: "short",
            year: "numeric",
        }).format(new Date(event.updatedAt))
        : "Recently";

    const description = event.description || `Explore organized subjects, chapters, topics and practice material prepared for ${event.name}.`;

    return (
        <section className="overflow-hidden rounded-2xl border border-blue-900/10 bg-[#102a63] shadow-sm">
            <div className="grid gap-5 px-4 py-5 sm:px-6 sm:py-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-8">
                <div className="flex min-w-0 items-start gap-3 sm:items-center sm:gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white sm:h-16 sm:w-16">
                        <GraduationCap size={29} strokeWidth={1.8} />
                    </div>

                    <div className="min-w-0">
                        <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-blue-200 sm:text-[10px]">
                            Preparation hub
                        </p>

                        <h1 className="mt-1 text-xl font-extrabold leading-tight tracking-tight text-white sm:text-3xl">
                            {event.name}
                        </h1>

                        <p className="mt-2 max-w-2xl text-[11px] leading-5 text-blue-100 sm:text-sm sm:leading-6">
                            {description}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:w-[310px]">
                    <div className="rounded-xl border border-white/15 bg-white/10 px-3 py-3 text-center sm:px-4 sm:py-4">
                        <GraduationCap size={19} className="mx-auto text-blue-200" />

                        <p className="mt-1.5 text-base font-extrabold text-white sm:text-lg">
                            {subjectCount}
                        </p>

                        <p className="mt-0.5 text-[9px] font-semibold text-blue-200 sm:text-[10px]">
                            {subjectCount === 1 ? "Subject" : "Subjects"}
                        </p>
                    </div>

                    <div className="rounded-xl border border-white/15 bg-white/10 px-3 py-3 text-center sm:px-4 sm:py-4">
                        <CalendarDays size={19} className="mx-auto text-blue-200" />

                        <p className="mt-1.5 text-[11px] font-extrabold text-white sm:text-xs">
                            {updatedText}
                        </p>

                        <p className="mt-1 text-[9px] font-semibold text-blue-200 sm:text-[10px]">
                            Last updated
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

const SummaryLoading = () => {
    return (
        <section className="overflow-hidden rounded-2xl border border-blue-900/10 bg-[#102a63] px-4 py-5 shadow-sm sm:px-6 sm:py-6">
            <div className="animate-pulse">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 shrink-0 rounded-xl bg-white/10 sm:h-16 sm:w-16" />

                    <div className="min-w-0 flex-1">
                        <div className="h-2.5 w-24 rounded bg-white/10" />
                        <div className="mt-3 h-6 w-48 max-w-full rounded bg-white/15 sm:h-8 sm:w-64" />
                        <div className="mt-3 h-3 w-full max-w-lg rounded bg-white/10" />
                    </div>
                </div>
            </div>
        </section>
    );
};

const SummaryError = ({ message, retry }) => {
    return (
        <section className="rounded-2xl border border-red-200 bg-white px-4 py-8 text-center shadow-sm sm:px-6">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-500">
                <AlertCircle size={21} />
            </div>

            <h1 className="mt-3 text-base font-extrabold text-[#071a4a]">
                Event could not be loaded
            </h1>

            <p className="mx-auto mt-1.5 max-w-md text-xs leading-5 text-slate-500">
                {message || "Something went wrong while loading this event."}
            </p>

            <button type="button" onClick={retry} className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-bold text-white transition hover:bg-blue-700">
                <RefreshCw size={15} />
                Try Again
            </button>
        </section>
    );
};

export default EventSummary;