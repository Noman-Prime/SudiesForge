import Link from "next/link";
import {
    ArrowRight,
    ClipboardCheck,
    FileClock,
    FileText,
    ListChecks,
    PlayCircle,
} from "lucide-react";

const materialStyles = {
    notes: {
        label: "Notes",
        icon: FileText,
        iconStyle: "bg-emerald-50 text-emerald-600",
    },
    lectures: {
        label: "Lecture",
        icon: PlayCircle,
        iconStyle: "bg-orange-50 text-orange-500",
    },
    mcqs: {
        label: "MCQs",
        icon: ListChecks,
        iconStyle: "bg-violet-50 text-violet-600",
    },
    "mock-tests": {
        label: "Mock Test",
        icon: ClipboardCheck,
        iconStyle: "bg-blue-50 text-blue-600",
    },
    "past-papers": {
        label: "Past Paper",
        icon: FileClock,
        iconStyle: "bg-amber-50 text-amber-600",
    },
};

const sampleMaterials = [
    {
        _id: "biology-notes-1",
        title: "Cell Structure and Functions",
        type: "notes",
        subject: "Biology",
        updatedAt: "May 11, 2026",
    },
    {
        _id: "chemistry-lecture-1",
        title: "Chemical Bonding – Full Lecture",
        type: "lectures",
        subject: "Chemistry",
        updatedAt: "May 10, 2026",
    },
    {
        _id: "physics-mcqs-1",
        title: "Laws of Motion MCQs",
        type: "mcqs",
        subject: "Physics",
        updatedAt: "May 9, 2026",
    },
    {
        _id: "mdcat-mock-test-1",
        title: "MDCAT Full-Length Mock Test 1",
        type: "mock-tests",
        subject: "MDCAT",
        updatedAt: "May 8, 2026",
    },
];

const EventMaterials = ({
    eventId = "mdcat",
    eventName = "MDCAT",
    materials = sampleMaterials,
}) => {
    return (
        <section
            id="materials"
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
            <div className="border-b border-slate-200 px-4 py-4 sm:px-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-600">
                    Latest learning content
                </p>

                <h2 className="mt-1 text-lg font-extrabold tracking-tight text-[#071a4a] sm:text-xl">
                    Featured {eventName} Material
                </h2>

                <p className="mt-1 text-[11px] leading-5 text-slate-500 sm:text-xs">
                    Access recently added notes, lectures and practice
                    resources.
                </p>
            </div>

            {/* Mobile view */}
            <div className="space-y-3 bg-slate-50/60 p-3 md:hidden">
                {materials.map((material) => {
                    const style =
                        materialStyles[material.type] ||
                        materialStyles.notes;

                    const Icon = style.icon;

                    return (
                        <Link
                            key={material._id}
                            href={
                                material.href ||
                                `/events/${eventId}/${material.type}/${material._id}`
                            }
                            className="group flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:border-blue-200 hover:shadow-md"
                        >
                            <div
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${style.iconStyle}`}
                            >
                                <Icon size={19} strokeWidth={1.9} />
                            </div>

                            <div className="min-w-0 flex-1">
                                <span className="text-[8px] font-bold uppercase tracking-[0.1em] text-blue-600">
                                    {style.label}
                                </span>

                                <h3 className="mt-0.5 truncate text-xs font-extrabold text-[#071a4a]">
                                    {material.title}
                                </h3>

                                <div className="mt-1 flex items-center gap-2 text-[9px] text-slate-500">
                                    <span className="truncate">
                                        {material.subject}
                                    </span>

                                    <span className="h-1 w-1 shrink-0 rounded-full bg-slate-300" />

                                    <span className="shrink-0">
                                        {material.updatedAt}
                                    </span>
                                </div>
                            </div>

                            <ArrowRight
                                size={16}
                                className="shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-600"
                            />
                        </Link>
                    );
                })}
            </div>

            {/* Desktop view */}
            <div className="hidden overflow-x-auto p-5 md:block">
                <div className="min-w-[700px] overflow-hidden rounded-xl border border-slate-200">
                    <div className="grid grid-cols-[minmax(260px,1.6fr)_0.7fr_0.7fr_0.8fr_70px] bg-slate-50 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                        <span>Material</span>
                        <span>Type</span>
                        <span>Subject</span>
                        <span>Updated</span>
                        <span className="text-right">Open</span>
                    </div>

                    {materials.map((material) => {
                        const style =
                            materialStyles[material.type] ||
                            materialStyles.notes;

                        const Icon = style.icon;

                        return (
                            <Link
                                key={material._id}
                                href={
                                    material.href ||
                                    `/events/${eventId}/${material.type}/${material._id}`
                                }
                                className="group grid grid-cols-[minmax(260px,1.6fr)_0.7fr_0.7fr_0.8fr_70px] items-center border-t border-slate-200 px-4 py-3 transition hover:bg-blue-50/50"
                            >
                                <div className="flex min-w-0 items-center gap-3">
                                    <div
                                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${style.iconStyle}`}
                                    >
                                        <Icon size={17} strokeWidth={1.9} />
                                    </div>

                                    <span className="truncate text-xs font-bold text-[#071a4a]">
                                        {material.title}
                                    </span>
                                </div>

                                <span className="text-[11px] font-semibold text-slate-600">
                                    {style.label}
                                </span>

                                <span className="text-[11px] text-slate-600">
                                    {material.subject}
                                </span>

                                <span className="text-[11px] text-slate-500">
                                    {material.updatedAt}
                                </span>

                                <div className="flex justify-end">
                                    <ArrowRight
                                        size={17}
                                        className="text-blue-600 transition group-hover:translate-x-1"
                                    />
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default EventMaterials;