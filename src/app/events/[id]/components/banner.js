"use client";

import axios from "axios";
import Link from "next/link";
import {
    ArrowRight,
    GraduationCap,
} from "lucide-react";
import { useParams } from "next/navigation";
import {
    useEffect,
    useState,
} from "react";

const EventStartBanner = () => {
    const { id } = useParams();

    const [eventName, setEventName] =
        useState("");

    const getEvent = async () => {
        try {
            const result = await axios.get(
                `/api/events/${id}`,
            );

            if (result.data.success) {
                setEventName(
                    result.data.event?.name || "",
                );
            }
        } catch (error) {
            console.log(
                error.response?.data?.message ||
                error,
            );
        }
    };

    useEffect(() => {
        if (id) {
            getEvent();
        }
    }, [id]);

    return (
        <section className="overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 via-white to-blue-50 shadow-sm">
            <div className="flex flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div className="flex min-w-0 items-start gap-3 sm:items-center">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-200 bg-white text-blue-600 shadow-sm sm:h-11 sm:w-11">
                        <GraduationCap
                            size={22}
                            strokeWidth={1.9}
                        />
                    </div>

                    <div className="min-w-0">
                        <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-blue-600">
                            Begin learning
                        </p>

                        <h2 className="mt-1 text-base font-extrabold text-[#071a4a] sm:text-lg">
                            {eventName
                                ? `Start Your ${eventName} Preparation`
                                : "Start Your Preparation"}
                        </h2>

                        <p className="mt-1 max-w-2xl text-[10px] leading-4 text-slate-500 sm:text-xs sm:leading-5">
                            Choose a subject to explore its
                            chapters and available learning
                            resources.
                        </p>
                    </div>
                </div>

                <Link
                    href={`/events/${id}#subjects`}
                    className="flex h-10 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md sm:w-auto"
                >
                    Browse Subjects

                    <ArrowRight size={15} />
                </Link>
            </div>
        </section>
    );
};

export default EventStartBanner;