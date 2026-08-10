import Link from "next/link";
import {
    ArrowRight,
    GraduationCap,
} from "lucide-react";

const EventStartBanner = ({
    eventId = "mdcat",
    eventName = "MDCAT",
}) => {
    return (
        <section className="overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 via-white to-blue-50 shadow-sm">
            <div className="flex flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-6">
                <div className="flex min-w-0 items-start gap-3 sm:items-center">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-200 bg-white text-blue-600 shadow-sm sm:h-12 sm:w-12">
                        <GraduationCap
                            size={25}
                            strokeWidth={1.9}
                        />
                    </div>

                    <div className="min-w-0">
                        <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-blue-600 sm:text-[10px]">
                            Begin learning
                        </p>

                        <h2 className="mt-1 text-base font-extrabold text-[#071a4a] sm:text-lg">
                            Start Your {eventName} Preparation
                        </h2>

                        <p className="mt-1 max-w-2xl text-[10px] leading-4 text-slate-500 sm:text-xs sm:leading-5">
                            Select a subject and access structured notes,
                            lectures, MCQs, mock tests and past papers.
                        </p>
                    </div>
                </div>

                <Link
                    href={`/events/${eventId}/subjects`}
                    className="flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md sm:w-auto"
                >
                    Get Started
                    <ArrowRight size={16} />
                </Link>
            </div>
        </section>
    );
};

export default EventStartBanner;