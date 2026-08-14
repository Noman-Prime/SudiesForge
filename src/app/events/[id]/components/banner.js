"use client";

import axios from "axios";
import Link from "next/link";
import { ArrowRight, GraduationCap } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const EventStartBanner = () => {
    const { id } = useParams();
    const [eventName, setEventName] = useState("");
    const [hasSubjects, setHasSubjects] = useState(false);
    const [loading, setLoading] = useState(true);

    const getBannerData = async () => {
        try {
            setLoading(true);

            const result = await axios.get(`/api/events/${id}/navigation`);

            if (!result.data.success) {
                setEventName("");
                setHasSubjects(false);
                return;
            }

            const subjectCollection = (result.data.collection || []).find((item) => item.key === "subjects");

            setEventName(result.data.eventName || "");
            setHasSubjects(Number(subjectCollection?.count) > 0);
        } catch (error) {
            console.log(error.response?.data?.message || error);
            setEventName("");
            setHasSubjects(false);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            getBannerData();
        }
    }, [id]);

    if (loading || !hasSubjects) {
        return null;
    }

    return (
        <section className="overflow-hidden rounded-2xl border border-[#102a63] bg-[#102a63] shadow-sm">
            <div className="flex flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div className="flex min-w-0 items-start gap-3 sm:items-center">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white sm:h-11 sm:w-11">
                        <GraduationCap size={22} strokeWidth={1.9} />
                    </div>

                    <div className="min-w-0">
                        <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-blue-200 sm:text-[9px]">
                            Begin your preparation
                        </p>

                        <h2 className="mt-1 text-base font-extrabold text-white sm:text-lg">
                            {eventName ? `Start Learning ${eventName}` : "Start Learning"}
                        </h2>

                        <p className="mt-1 max-w-2xl text-[9px] leading-4 text-blue-100 sm:text-[11px] sm:leading-5">
                            Choose a subject and continue through its chapters, topics and practice MCQs.
                        </p>
                    </div>
                </div>

                <Link href={`/events/${id}#subjects`} className="flex h-10 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 text-[10px] font-extrabold text-[#102a63] shadow-sm transition hover:bg-blue-50 sm:w-auto">
                    Choose a Subject
                    <ArrowRight size={14} />
                </Link>
            </div>
        </section>
    );
};

export default EventStartBanner;