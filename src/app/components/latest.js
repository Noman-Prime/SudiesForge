import Link from "next/link";
import { ArrowRight, FileClock, Files, FileText } from "lucide-react";

const pastPaperEvents = [
    {
        _id: "mdcat-past-papers",
        eventName: "MDCAT",
        description: "Browse all available previous MDCAT examination papers.",
        href: "/past-papers/mdcat",
    },
    {
        _id: "ppsc-past-papers",
        eventName: "PPSC",
        description: "Explore previous papers from available PPSC examinations.",
        href: "/past-papers/ppsc",
    },
    {
        _id: "css-past-papers",
        eventName: "CSS",
        description: "Access previous CSS competitive examination papers.",
        href: "/past-papers/css",
    },
    {
        _id: "pms-past-papers",
        eventName: "PMS",
        description: "Browse previous PMS examination papers by year.",
        href: "/past-papers/pms",
    },
];

const cardStyles = [
    {
        card: "border-blue-300 shadow-md lg:border-slate-200 lg:shadow-sm lg:hover:border-blue-300 lg:hover:shadow-md",
        preview: "from-blue-600 to-blue-800 lg:from-blue-50 lg:to-blue-100 lg:group-hover:from-blue-600 lg:group-hover:to-blue-800",
        title: "text-white lg:text-blue-800 lg:group-hover:text-white",
        label: "text-blue-100 lg:text-blue-600 lg:group-hover:text-blue-100",
        icon: "text-blue-600",
    },
    {
        card: "border-emerald-300 shadow-md lg:border-slate-200 lg:shadow-sm lg:hover:border-emerald-300 lg:hover:shadow-md",
        preview: "from-emerald-600 to-emerald-800 lg:from-emerald-50 lg:to-emerald-100 lg:group-hover:from-emerald-600 lg:group-hover:to-emerald-800",
        title: "text-white lg:text-emerald-800 lg:group-hover:text-white",
        label: "text-emerald-100 lg:text-emerald-600 lg:group-hover:text-emerald-100",
        icon: "text-emerald-600",
    },
    {
        card: "border-orange-300 shadow-md lg:border-slate-200 lg:shadow-sm lg:hover:border-orange-300 lg:hover:shadow-md",
        preview: "from-orange-500 to-orange-700 lg:from-orange-50 lg:to-orange-100 lg:group-hover:from-orange-500 lg:group-hover:to-orange-700",
        title: "text-white lg:text-orange-800 lg:group-hover:text-white",
        label: "text-orange-100 lg:text-orange-600 lg:group-hover:text-orange-100",
        icon: "text-orange-500",
    },
    {
        card: "border-violet-300 shadow-md lg:border-slate-200 lg:shadow-sm lg:hover:border-violet-300 lg:hover:shadow-md",
        preview: "from-violet-600 to-violet-800 lg:from-violet-50 lg:to-violet-100 lg:group-hover:from-violet-600 lg:group-hover:to-violet-800",
        title: "text-white lg:text-violet-800 lg:group-hover:text-white",
        label: "text-violet-100 lg:text-violet-600 lg:group-hover:text-violet-100",
        icon: "text-violet-600",
    },
];

const PastPapers = () => {
    return (
        <section id="past-papers" aria-labelledby="past-papers-heading" className="relative overflow-hidden border-b border-slate-200 bg-slate-50/70 px-3 py-7 sm:px-6 sm:py-9 lg:px-8">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-blue-50/80 to-transparent" />

            <div className="relative mx-auto w-full max-w-[1200px]">
                <div className="flex items-end justify-between gap-4">
                    <div>
                        <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-blue-600">
                            Previous examinations
                        </p>

                        <h2 id="past-papers-heading" className="mt-1 text-lg font-extrabold tracking-tight text-[#071a4a] sm:text-xl">
                            Past Papers
                        </h2>

                        <p className="mt-1 max-w-2xl text-[10px] leading-5 text-slate-500 sm:text-xs">
                            Select an event to browse all previous examination papers available under it.
                        </p>
                    </div>

                    <Link href="/past-papers" className="hidden h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md sm:flex">
                        View All Papers
                        <ArrowRight size={15} />
                    </Link>
                </div>

                <div className="mt-5 grid grid-cols-2 items-stretch gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
                    {pastPaperEvents.map((item, index) => {
                        const style = cardStyles[index % cardStyles.length];

                        return (
                            <article key={item._id} className={`group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border bg-white transition duration-200 lg:hover:-translate-y-0.5 ${style.card}`}>
                                <div className={`relative h-28 overflow-hidden bg-gradient-to-br p-3 transition duration-300 sm:h-32 sm:p-4 ${style.preview}`}>
                                    <div className="absolute -left-6 -top-7 h-20 w-20 rounded-full bg-white/10" />
                                    <div className="absolute -bottom-9 -right-5 h-24 w-24 rounded-full bg-white/10" />

                                    <div className="relative flex h-full items-center justify-between gap-2">
                                        <div className="min-w-0">
                                            <div className={`flex items-center gap-1 text-[7px] font-extrabold uppercase tracking-[0.12em] transition sm:text-[8px] ${style.label}`}>
                                                <FileClock size={11} />
                                                Past Papers
                                            </div>

                                            <h3 className={`mt-1.5 truncate text-sm font-black tracking-tight transition sm:text-base ${style.title}`}>
                                                {item.eventName}
                                            </h3>

                                            <p className={`mt-1 text-[7px] font-semibold transition sm:text-[8px] ${style.label}`}>
                                                Examination archive
                                            </p>
                                        </div>

                                        <div className="relative mr-1 flex h-[70px] w-[52px] shrink-0 rotate-2 flex-col rounded-md border border-white/70 bg-white p-2 shadow-lg transition duration-300 lg:group-hover:rotate-6 sm:h-[78px] sm:w-[58px]">
                                            <FileText size={18} className={`mx-auto ${style.icon}`} />

                                            <div className="mt-2 h-1 w-full rounded-full bg-slate-200" />
                                            <div className="mt-1 h-1 w-4/5 rounded-full bg-slate-200" />
                                            <div className="mt-1 h-1 w-3/5 rounded-full bg-slate-200" />

                                            <span className={`mt-auto text-center text-[6px] font-black uppercase ${style.icon}`}>
                                                {item.eventName}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-1 flex-col p-3 sm:p-4">
                                    <div className="flex items-center gap-1.5">
                                        <Files size={13} className="shrink-0 text-blue-600" />

                                        <span className="text-[8px] font-extrabold uppercase tracking-[0.1em] text-blue-600 sm:text-[9px]">
                                            Event Collection
                                        </span>
                                    </div>

                                    <p className="mt-2 line-clamp-3 text-[9px] leading-4 text-slate-500 sm:text-[10px]">
                                        {item.description}
                                    </p>

                                    <div className="mt-auto border-t border-slate-100 pt-3">
                                        <Link href={item.href} aria-label={`Browse ${item.eventName} past papers`} className="flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-2 text-[8px] font-bold text-white shadow-md transition active:scale-[0.98] lg:shadow-sm lg:hover:bg-blue-700 lg:hover:shadow-md sm:h-10 sm:text-[9px]">
                                            <span className="truncate">Browse Papers</span>
                                            <ArrowRight size={13} className="shrink-0" />
                                        </Link>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>

                <Link href="/past-papers" className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-bold text-white shadow-md transition active:scale-[0.98] hover:bg-blue-700 sm:hidden">
                    <Files size={16} />
                    View All Past Papers
                    <ArrowRight size={15} />
                </Link>
            </div>
        </section>
    );
};

export default PastPapers;