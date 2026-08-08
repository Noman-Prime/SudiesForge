"use client";

import axios from "axios";
import Link from "next/link";
import {
    ArrowRight,
    GraduationCap,
} from "lucide-react";
import { useEffect, useState } from "react";

const cardStyles = [
    {
        icon: "bg-emerald-50 text-emerald-600",
        accent: "group-hover:border-emerald-200",
    },
    {
        icon: "bg-orange-50 text-orange-500",
        accent: "group-hover:border-orange-200",
    },
    {
        icon: "bg-violet-50 text-violet-600",
        accent: "group-hover:border-violet-200",
    },
    {
        icon: "bg-teal-50 text-teal-600",
        accent: "group-hover:border-teal-200",
    },
    {
        icon: "bg-blue-50 text-blue-600",
        accent: "group-hover:border-blue-200",
    },
    {
        icon: "bg-amber-50 text-amber-600",
        accent: "group-hover:border-amber-200",
    },
];

const PopularEvents = () => {
    const [events, setEvents] = useState([]);

    const getEvents = async () => {
        try {
            const result = await axios.get("/api/events");

            if (result.data.success) {
                setEvents(result.data.event || []);
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        getEvents();
    }, []);

    if (events.length === 0) {
        return null;
    }

    return (
        <section className="bg-white px-4 py-7 sm:px-6 sm:py-9 lg:px-8 lg:py-11">
            <div className="mx-auto w-full max-w-[1300px]">
                <div className="mb-4 flex items-center justify-between gap-4 sm:mb-6">
                    <h2 className="text-lg font-extrabold tracking-tight text-[#071a4a] sm:text-2xl">
                        Popular Exams
                    </h2>

                    <Link
                        href="/events"
                        className="hidden h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md sm:inline-flex"
                    >
                        Explore Oppurtunites
                    </Link>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
                    {events.slice(0, 6).map((event, index) => {
                        const style =
                            cardStyles[index % cardStyles.length];

                        return (
                            <Link
                                key={event._id}
                                href={`/events/${event._id}`}
                                className={`group flex min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_3px_14px_rgba(15,23,42,0.05)] transition duration-200 hover:-translate-y-1 hover:shadow-lg sm:min-h-44 sm:p-4 ${index >= 4 ? "max-sm:hidden" : ""} ${style.accent}`}
                            >
                                <div
                                    className={`flex h-10 w-10 items-center justify-center rounded-xl transition duration-200 group-hover:scale-105 sm:h-11 sm:w-11 ${style.icon}`}
                                >
                                    <GraduationCap
                                        size={21}
                                        strokeWidth={1.9}
                                    />
                                </div>

                                <div className="mt-4 min-w-0">
                                    <h3 className="truncate text-sm font-extrabold text-[#071a4a] sm:text-base">
                                        {event.name}
                                    </h3>

                                    {event.description && (
                                        <p className="mt-2 line-clamp-2 text-[10px] leading-4 text-slate-500 sm:text-xs sm:leading-5">
                                            {event.description}
                                        </p>
                                    )}
                                </div>

                                <div className="mt-auto flex items-center gap-1 pt-4 text-[10px] font-bold text-blue-600 sm:text-xs">
                                    View subjects

                                    <ArrowRight
                                        size={13}
                                        className="transition-transform group-hover:translate-x-1"
                                    />
                                </div>
                            </Link>
                        );
                    })}
                </div>

                <Link
                    href="/events"
                    className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 sm:hidden"
                >
                    Explore Oppurtunites
                </Link>
            </div>
        </section>
    );
};

export default PopularEvents;