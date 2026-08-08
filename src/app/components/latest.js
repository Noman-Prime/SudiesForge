import Link from "next/link";
import {
    ArrowRight,
    ClipboardCheck,
    FileText,
    ListChecks,
    Play,
    PlayCircle,
} from "lucide-react";

const sampleResources = [
    {
        _id: "resource-notes-1",
        resourceType: "notes",
        typeLabel: "New Notes",
        title: "Plant Kingdom - Complete Notes",
        subtitle: "MDCAT Biology",
        timeLabel: "2 days ago",
        href: "/notes/plant-kingdom",
    },
    {
        _id: "resource-lecture-1",
        resourceType: "lecture",
        typeLabel: "New Lecture",
        title: "The Living World - Full Lecture",
        subtitle: "MDCAT Biology",
        timeLabel: "5 days ago",
        href: "/lectures/the-living-world",
        showPreview: true,
    },
    {
        _id: "resource-mcqs-1",
        resourceType: "mcqs",
        typeLabel: "New MCQs",
        title: "Cell Biology - 50 MCQs",
        subtitle: "MDCAT Biology",
        timeLabel: "1 week ago",
        href: "/mcqs/cell-biology",
    },
    {
        _id: "resource-test-1",
        resourceType: "mockTest",
        typeLabel: "New Mock Test",
        title: "MDCAT Biology Full Mock Test",
        subtitle: "100 Questions",
        timeLabel: "1 week ago",
        href: "/mock-tests/mdcat-biology",
    },
    {
        _id: "resource-notes-2",
        resourceType: "notes",
        typeLabel: "New Notes",
        title: "Tenses in English - Complete Guide",
        subtitle: "CSS English",
        timeLabel: "1 week ago",
        href: "/notes/english-tenses",
    },
];

const resourceStyles = {
    notes: {
        icon: FileText,
        iconStyle: "bg-emerald-50 text-emerald-600",
        labelStyle: "text-emerald-600",
        borderStyle: "group-hover:border-emerald-200",
    },
    lecture: {
        icon: PlayCircle,
        iconStyle: "bg-rose-50 text-rose-600",
        labelStyle: "text-rose-600",
        borderStyle: "group-hover:border-rose-200",
    },
    mcqs: {
        icon: ListChecks,
        iconStyle: "bg-violet-50 text-violet-600",
        labelStyle: "text-violet-600",
        borderStyle: "group-hover:border-violet-200",
    },
    mockTest: {
        icon: ClipboardCheck,
        iconStyle: "bg-blue-50 text-blue-600",
        labelStyle: "text-blue-600",
        borderStyle: "group-hover:border-blue-200",
    },
};

const LatestResources = ({
    resources = sampleResources,
}) => {
    const visibleResources = resources.slice(0, 5);

    return (
        <section className="bg-white px-4 py-7 sm:px-6 sm:py-9 lg:px-8 lg:py-11">
            <div className="mx-auto w-full max-w-[1300px]">
                <div className="mb-4 flex items-center justify-between gap-4 sm:mb-6">
                    <h2 className="text-lg font-extrabold tracking-tight text-[#071a4a] sm:text-2xl">
                        Latest Resources
                    </h2>

                    <Link
                        href="/resources"
                        className="hidden h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md sm:inline-flex"
                    >
                        View all resources
                        <ArrowRight size={15} />
                    </Link>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
                    {visibleResources.map((resource, index) => {
                        const style =
                            resourceStyles[resource.resourceType] ||
                            resourceStyles.notes;

                        const Icon = style.icon;

                        return (
                            <Link
                                key={resource._id}
                                href={resource.href}
                                className={`group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_3px_14px_rgba(15,23,42,0.05)] transition duration-200 hover:-translate-y-1 hover:shadow-lg ${index >= 4 ? "max-sm:hidden" : ""} ${style.borderStyle}`}
                            >
                                {resource.thumbnail ? (
                                    <div className="aspect-[16/9] overflow-hidden bg-slate-100">
                                        <img
                                            src={resource.thumbnail}
                                            alt={resource.title}
                                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                        />
                                    </div>
                                ) : resource.showPreview ? (
                                    <div className="relative flex aspect-[16/9] items-center justify-center overflow-hidden bg-gradient-to-br from-[#102a63] via-blue-700 to-blue-500">
                                        <div className="absolute -left-5 top-2 h-16 w-16 rounded-full bg-white/10" />

                                        <div className="absolute -bottom-7 right-1 h-20 w-20 rounded-full bg-white/10" />

                                        <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white text-blue-700 shadow-lg transition group-hover:scale-110 sm:h-11 sm:w-11">
                                            <Play
                                                size={18}
                                                fill="currentColor"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="px-3 pt-3 sm:px-4 sm:pt-4">
                                        <div
                                            className={`flex h-10 w-10 items-center justify-center rounded-xl sm:h-11 sm:w-11 ${style.iconStyle}`}
                                        >
                                            <Icon
                                                size={21}
                                                strokeWidth={1.9}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="flex flex-1 flex-col p-3 sm:p-4">
                                    <span
                                        className={`text-[8px] font-extrabold uppercase tracking-[0.12em] sm:text-[9px] ${style.labelStyle}`}
                                    >
                                        {resource.typeLabel}
                                    </span>

                                    <h3 className="mt-2 line-clamp-2 text-xs font-extrabold leading-4 text-[#071a4a] sm:text-sm sm:leading-5">
                                        {resource.title}
                                    </h3>

                                    <p className="mt-1 line-clamp-1 text-[9px] font-medium text-slate-500 sm:text-[11px]">
                                        {resource.subtitle}
                                    </p>

                                    <span className="mt-auto pt-4 text-[8px] font-medium text-slate-400 sm:text-[10px]">
                                        {resource.timeLabel}
                                    </span>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                <Link
                    href="/resources"
                    className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 sm:hidden"
                >
                    View all resources
                    <ArrowRight size={15} />
                </Link>
            </div>
        </section>
    );
};

export default LatestResources;