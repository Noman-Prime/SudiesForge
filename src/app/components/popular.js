"use client";

import axios from "axios";
import Link from "next/link";
import { ArrowRight, GraduationCap } from "lucide-react";
import { useEffect, useState } from "react";

const cardStyles = [
    {
        icon: "bg-blue-600 text-white lg:bg-blue-50 lg:text-blue-600 lg:group-hover:bg-blue-600 lg:group-hover:text-white",
        card: "border-blue-300 shadow-md lg:border-slate-200 lg:shadow-sm lg:hover:border-blue-300 lg:hover:shadow-md",
    },
    {
        icon: "bg-emerald-600 text-white lg:bg-emerald-50 lg:text-emerald-600 lg:group-hover:bg-emerald-600 lg:group-hover:text-white",
        card: "border-emerald-300 shadow-md lg:border-slate-200 lg:shadow-sm lg:hover:border-emerald-300 lg:hover:shadow-md",
    },
    {
        icon: "bg-orange-500 text-white lg:bg-orange-50 lg:text-orange-500 lg:group-hover:bg-orange-500 lg:group-hover:text-white",
        card: "border-orange-300 shadow-md lg:border-slate-200 lg:shadow-sm lg:hover:border-orange-300 lg:hover:shadow-md",
    },
    {
        icon: "bg-violet-600 text-white lg:bg-violet-50 lg:text-violet-600 lg:group-hover:bg-violet-600 lg:group-hover:text-white",
        card: "border-violet-300 shadow-md lg:border-slate-200 lg:shadow-sm lg:hover:border-violet-300 lg:hover:shadow-md",
    },
];

const PopularEvents = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    const getEvents = async () => {
        try {
            setLoading(true);
            setErrorMessage("");

            const result = await axios.get("/api/events");

            if (result.data.success) {
                setEvents(result.data.event || result.data.events || []);
            } else {
                setEvents([]);
            }
        } catch (error) {
            console.log(error);

            if (error.response?.status === 404) {
                setEvents([]);
                return;
            }

            setEvents([]);
            setErrorMessage(error.response?.data?.message || "Exams could not be loaded");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getEvents();
    }, []);

    if (!loading && !errorMessage && events.length === 0) {
        return null;
    }

    return (
        <section id="exams" aria-labelledby="available-exams-heading" className="border-b border-slate-200 bg-slate-50/70 px-3 py-7 sm:px-6 sm:py-9 lg:px-8">
            <div className="mx-auto w-full max-w-[1200px]">
                <div className="flex items-end justify-between gap-4">
                    <div>
                        <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-blue-600">
                            Exam preparation
                        </p>

                        <h2 id="available-exams-heading" className="mt-1 text-lg font-extrabold tracking-tight text-[#071a4a] sm:text-xl">
                            Choose Your Exam
                        </h2>

                        <p className="mt-1 max-w-2xl text-[10px] leading-5 text-slate-500 sm:text-xs">
                            Select an exam to explore its subjects, chapters, topics and available practice material.
                        </p>
                    </div>

                    {!loading && !errorMessage && events.length > 0 && (
                        <span className="flex h-9 min-w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 px-2.5 text-xs font-extrabold text-blue-700">
                            {events.length}
                        </span>
                    )}
                </div>

                {loading ? (
                    <EventsLoading />
                ) : errorMessage ? (
                    <EventsError message={errorMessage} retry={getEvents} />
                ) : (
                    <div className="mt-5 grid grid-cols-2 items-stretch gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
                        {events.map((event, index) => {
                            const style = cardStyles[index % cardStyles.length];

                            return (
                                <article key={event._id} className={`group flex h-full min-w-0 flex-col rounded-2xl border bg-white p-3 transition duration-200 lg:hover:-translate-y-0.5 sm:p-4 ${style.card}`}>
                                    <div className="flex items-start justify-between gap-2">
                                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition duration-200 lg:group-hover:scale-105 sm:h-11 sm:w-11 ${style.icon}`}>
                                            <GraduationCap size={21} strokeWidth={1.9} />
                                        </div>

                                        <span className="rounded-md bg-slate-100 px-2 py-1 text-[7px] font-extrabold uppercase tracking-[0.1em] text-slate-500 sm:text-[8px]">
                                            Exam
                                        </span>
                                    </div>

                                    <div className="mt-3 min-w-0 flex-1">
                                        <h3 className="line-clamp-2 text-xs font-extrabold leading-5 text-[#071a4a] sm:text-sm">
                                            {event.name}
                                        </h3>

                                        {event.description && (
                                            <p className="mt-1.5 line-clamp-2 text-[9px] leading-4 text-slate-500 sm:text-[10px]">
                                                {event.description}
                                            </p>
                                        )}
                                    </div>

                                    <div className="mt-4 border-t border-slate-100 pt-3">
                                        <Link href={`/events/${event._id}`} aria-label={`Explore ${event.name}`} className="flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-2 text-[8px] font-bold text-white shadow-md transition active:scale-[0.98] lg:shadow-sm lg:hover:bg-blue-700 lg:hover:shadow-md sm:h-10 sm:text-[9px]">
                                            <span className="truncate">Explore Event</span>
                                            <ArrowRight size={13} className="shrink-0" />
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

const EventsLoading = () => {
    return (
        <div className="mt-5 grid grid-cols-2 items-stretch gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
                <div key={item} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
                    <div className="flex items-start justify-between gap-2">
                        <div className="h-10 w-10 rounded-xl bg-slate-200 sm:h-11 sm:w-11" />
                        <div className="h-5 w-12 rounded-md bg-slate-100" />
                    </div>

                    <div className="mt-4 h-3 w-2/3 rounded bg-slate-200" />
                    <div className="mt-2 h-3 w-1/2 rounded bg-slate-100" />
                    <div className="mt-5 h-9 rounded-lg bg-slate-200 sm:h-10" />
                </div>
            ))}
        </div>
    );
};

const EventsError = ({ message, retry }) => {
    return (
        <div className="mt-5 rounded-2xl border border-red-200 bg-white px-4 py-10 text-center shadow-sm">
            <GraduationCap size={28} className="mx-auto text-red-400" />

            <h3 className="mt-3 text-sm font-extrabold text-[#071a4a]">
                Exams could not be loaded
            </h3>

            <p className="mx-auto mt-1.5 max-w-md text-[10px] leading-5 text-slate-500 sm:text-xs">
                {message}
            </p>

            <button type="button" onClick={retry} className="mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-4 text-xs font-bold text-white shadow-sm transition active:scale-[0.98] hover:bg-blue-700">
                Try Again
            </button>
        </div>
    );
};

export default PopularEvents;