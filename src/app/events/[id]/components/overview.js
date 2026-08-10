import {
    BookOpen,
    GraduationCap,
    LibraryBig,
    Target,
} from "lucide-react";

const sampleOverview = {
    examType: "Medical Admission Test",
    subjectCount: 4,
    subjects:
        "Biology, Chemistry, Physics and English",
    materials:
        "Notes, Lectures, MCQs, Mock Tests and Past Papers",
    preparation:
        "Complete syllabus coverage with learning and practice material.",
};

const EventOverview = ({
    eventName = "MDCAT",
    overview = sampleOverview,
}) => {
    return (
        <section
            id="overview"
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
            <div className="border-b border-slate-200 px-4 py-4 sm:px-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-600">
                    {eventName} information
                </p>

                <h2 className="mt-1 text-lg font-extrabold tracking-tight text-[#071a4a] sm:text-xl">
                    Exam Overview
                </h2>
            </div>

            <div className="grid grid-cols-1 divide-y divide-slate-200 sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-4">
                <article className="p-4 sm:p-5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <GraduationCap
                            size={19}
                            strokeWidth={1.9}
                        />
                    </div>

                    <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                        Exam type
                    </p>

                    <h3 className="mt-1 text-sm font-extrabold text-[#071a4a]">
                        {overview.examType}
                    </h3>
                </article>

                <article className="p-4 sm:p-5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                        <BookOpen
                            size={19}
                            strokeWidth={1.9}
                        />
                    </div>

                    <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                        Core subjects
                    </p>

                    <h3 className="mt-1 text-sm font-extrabold text-[#071a4a]">
                        {overview.subjectCount} Subjects
                    </h3>

                    <p className="mt-1 text-[11px] leading-5 text-slate-500">
                        {overview.subjects}
                    </p>
                </article>

                <article className="p-4 sm:p-5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                        <LibraryBig
                            size={19}
                            strokeWidth={1.9}
                        />
                    </div>

                    <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                        Study materials
                    </p>

                    <h3 className="mt-1 text-sm font-extrabold text-[#071a4a]">
                        Complete Resources
                    </h3>

                    <p className="mt-1 text-[11px] leading-5 text-slate-500">
                        {overview.materials}
                    </p>
                </article>

                <article className="p-4 sm:p-5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                        <Target
                            size={19}
                            strokeWidth={1.9}
                        />
                    </div>

                    <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                        Preparation
                    </p>

                    <h3 className="mt-1 text-sm font-extrabold text-[#071a4a]">
                        Structured Learning
                    </h3>

                    <p className="mt-1 text-[11px] leading-5 text-slate-500">
                        {overview.preparation}
                    </p>
                </article>
            </div>
        </section>
    );
};

export default EventOverview;