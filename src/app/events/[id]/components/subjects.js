import Link from "next/link";
import {
    Atom,
    BookOpenText,
    ChevronRight,
    FlaskConical,
    Leaf,
} from "lucide-react";

const sampleSubjects = [
    {
        _id: "biology",
        name: "Biology",
        notes: 120,
        lectures: 85,
        mcqs: "950+",
        icon: Leaf,
        iconStyle: "bg-emerald-50 text-emerald-600",
        borderStyle: "hover:border-emerald-200",
    },
    {
        _id: "chemistry",
        name: "Chemistry",
        notes: 95,
        lectures: 70,
        mcqs: "800+",
        icon: FlaskConical,
        iconStyle: "bg-orange-50 text-orange-500",
        borderStyle: "hover:border-orange-200",
    },
    {
        _id: "physics",
        name: "Physics",
        notes: 85,
        lectures: 65,
        mcqs: "750+",
        icon: Atom,
        iconStyle: "bg-violet-50 text-violet-600",
        borderStyle: "hover:border-violet-200",
    },
    {
        _id: "english",
        name: "English",
        notes: 60,
        lectures: 50,
        mcqs: "600+",
        icon: BookOpenText,
        iconStyle: "bg-blue-50 text-blue-600",
        borderStyle: "hover:border-blue-200",
    },
];

const EventSubjects = ({
    eventId = "mdcat",
    eventName = "MDCAT",
    subjects = sampleSubjects,
}) => {
    return (
        <section
            id="subjects"
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
            <div className="border-b border-slate-200 px-4 py-4 sm:px-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-600">
                    Explore subjects
                </p>

                <h2 className="mt-1 text-lg font-extrabold tracking-tight text-[#071a4a] sm:text-xl">
                    Browse {eventName} Subjects
                </h2>

                <p className="mt-1 text-[11px] leading-5 text-slate-500 sm:text-xs">
                    Select a subject to access its notes, lectures and practice
                    material.
                </p>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-50/60 p-3 sm:gap-4 sm:p-5 lg:grid-cols-4">
                {subjects.map((subject) => {
                    const Icon = subject.icon || BookOpenText;

                    return (
                        <Link
                            key={subject._id}
                            href={`/events/${eventId}/subjects/${subject._id}`}
                            className={`group min-w-0 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-4 ${subject.borderStyle || "hover:border-blue-200"}`}
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div
                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition group-hover:scale-105 sm:h-11 sm:w-11 ${subject.iconStyle ||
                                        "bg-blue-50 text-blue-600"
                                        }`}
                                >
                                    <Icon size={21} strokeWidth={1.9} />
                                </div>

                                <ChevronRight
                                    size={17}
                                    className="shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-blue-600"
                                />
                            </div>

                            <h3 className="mt-3 truncate text-sm font-extrabold text-[#071a4a] sm:text-base">
                                {subject.name}
                            </h3>

                            <div className="mt-3 grid grid-cols-3 divide-x divide-slate-200 border-t border-slate-100 pt-3">
                                <div className="min-w-0 pr-1 text-center">
                                    <span className="block truncate text-[10px] font-extrabold text-[#071a4a] sm:text-xs">
                                        {subject.notes}
                                    </span>

                                    <span className="mt-0.5 block truncate text-[8px] text-slate-500 sm:text-[10px]">
                                        Notes
                                    </span>
                                </div>

                                <div className="min-w-0 px-1 text-center">
                                    <span className="block truncate text-[10px] font-extrabold text-[#071a4a] sm:text-xs">
                                        {subject.lectures}
                                    </span>

                                    <span className="mt-0.5 block truncate text-[8px] text-slate-500 sm:text-[10px]">
                                        Lectures
                                    </span>
                                </div>

                                <div className="min-w-0 pl-1 text-center">
                                    <span className="block truncate text-[10px] font-extrabold text-[#071a4a] sm:text-xs">
                                        {subject.mcqs}
                                    </span>

                                    <span className="mt-0.5 block truncate text-[8px] text-slate-500 sm:text-[10px]">
                                        MCQs
                                    </span>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
};

export default EventSubjects;