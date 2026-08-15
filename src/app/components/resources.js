import Link from "next/link";
import { ArrowRight, BookOpen, BookOpenCheck, ClipboardCheck, FileText, GraduationCap, ListChecks } from "lucide-react";

const categories = [
    {
        name: "Subjects",
        description: "Browse all available subjects",
        href: "/subjects",
        buttonText: "View Subjects",
        icon: GraduationCap,
        iconStyle: "border-blue-600 bg-blue-600 text-white lg:border-blue-100 lg:bg-blue-50 lg:text-blue-600 lg:group-hover:border-blue-600 lg:group-hover:bg-blue-600 lg:group-hover:text-white",
        cardStyle: "border-blue-300 shadow-md lg:border-slate-200 lg:shadow-sm lg:hover:border-blue-300 lg:hover:shadow-md",
    },
    {
        name: "Chapters",
        description: "Explore chapters by subject",
        href: "/chapters",
        buttonText: "View Chapters",
        icon: BookOpen,
        iconStyle: "border-emerald-600 bg-emerald-600 text-white lg:border-emerald-100 lg:bg-emerald-50 lg:text-emerald-600 lg:group-hover:border-emerald-600 lg:group-hover:bg-emerald-600 lg:group-hover:text-white",
        cardStyle: "border-emerald-300 shadow-md lg:border-slate-200 lg:shadow-sm lg:hover:border-emerald-300 lg:hover:shadow-md",
    },
    {
        name: "Topics",
        description: "Read structured topic notes",
        href: "/topics",
        buttonText: "View Topics",
        icon: FileText,
        iconStyle: "border-violet-600 bg-violet-600 text-white lg:border-violet-100 lg:bg-violet-50 lg:text-violet-600 lg:group-hover:border-violet-600 lg:group-hover:bg-violet-600 lg:group-hover:text-white",
        cardStyle: "border-violet-300 shadow-md lg:border-slate-200 lg:shadow-sm lg:hover:border-violet-300 lg:hover:shadow-md",
    },
];

const CategoryCollection = () => {
    return (
        <section aria-labelledby="learning-content-heading" className="relative overflow-hidden border-b border-slate-200 bg-white px-3 py-7 sm:px-6 sm:py-9 lg:px-8">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-blue-50/70 to-transparent" />

            <div className="relative mx-auto w-full max-w-[1200px]">
                <div>
                    <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-blue-600">
                        Learning content
                    </p>

                    <h2 id="learning-content-heading" className="mt-1 text-lg font-extrabold tracking-tight text-[#071a4a] sm:text-xl">
                        Explore Study Material
                    </h2>

                    <p className="mt-1 max-w-2xl text-[10px] leading-5 text-slate-500 sm:text-xs">
                        Browse subjects, chapters and topics, or practise MCQs in read and test modes.
                    </p>
                </div>

                <div className="mt-5 grid w-full grid-cols-2 items-stretch gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
                    {categories.map((category) => {
                        const Icon = category.icon;

                        return (
                            <article key={category.name} className={`group flex h-full min-w-0 flex-col rounded-2xl border bg-white p-3 transition duration-200 lg:hover:-translate-y-0.5 sm:p-4 ${category.cardStyle}`}>
                                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border shadow-sm transition duration-200 lg:group-hover:scale-105 sm:h-11 sm:w-11 ${category.iconStyle}`}>
                                    <Icon size={20} strokeWidth={1.9} />
                                </div>

                                <div className="mt-3 min-w-0 flex-1">
                                    <h3 className="text-xs font-extrabold text-[#071a4a] sm:text-sm">
                                        {category.name}
                                    </h3>

                                    <p className="mt-1 line-clamp-2 text-[9px] leading-4 text-slate-500 sm:text-[10px]">
                                        {category.description}
                                    </p>
                                </div>

                                <div className="mt-4 border-t border-slate-100 pt-3">
                                    <Link href={category.href} aria-label={category.buttonText} className="flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-2 text-[8px] font-bold text-white shadow-md transition active:scale-[0.98] lg:shadow-sm lg:hover:bg-blue-700 lg:hover:shadow-md sm:h-10 sm:text-[9px]">
                                        <span className="truncate">{category.buttonText}</span>
                                        <ArrowRight size={13} className="shrink-0" />
                                    </Link>
                                </div>
                            </article>
                        );
                    })}

                    <article className="group flex h-full min-w-0 flex-col rounded-2xl border border-orange-300 bg-white p-3 shadow-md transition duration-200 lg:border-slate-200 lg:shadow-sm lg:hover:-translate-y-0.5 lg:hover:border-orange-300 lg:hover:shadow-md sm:p-4">
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-orange-500 bg-orange-500 text-white shadow-sm transition duration-200 lg:border-orange-100 lg:bg-orange-50 lg:text-orange-500 lg:group-hover:scale-105 lg:group-hover:border-orange-500 lg:group-hover:bg-orange-500 lg:group-hover:text-white sm:h-11 sm:w-11">
                                <ListChecks size={20} strokeWidth={1.9} />
                            </div>

                            <span className="rounded-md bg-orange-50 px-2 py-1 text-[7px] font-extrabold uppercase tracking-[0.1em] text-orange-600 sm:text-[8px]">
                                2 Modes
                            </span>
                        </div>

                        <div className="mt-3 min-w-0 flex-1">
                            <h3 className="text-xs font-extrabold text-[#071a4a] sm:text-sm">
                                MCQs
                            </h3>

                            <p className="mt-1 line-clamp-2 text-[9px] leading-4 text-slate-500 sm:text-[10px]">
                                Study correct answers or attempt questions as a test.
                            </p>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
                            <Link href="/mcqs/read" aria-label="Open MCQs in read mode" className="flex h-9 min-w-0 items-center justify-center gap-1 rounded-lg bg-blue-600 px-1.5 text-[8px] font-bold text-white shadow-md transition active:scale-[0.98] lg:shadow-sm lg:hover:bg-blue-700 lg:hover:shadow-md sm:h-10 sm:px-2 sm:text-[9px]">
                                <BookOpenCheck size={13} className="shrink-0" />
                                <span className="truncate">Read</span>
                            </Link>

                            <Link href="/mcqs/test" aria-label="Open MCQs in test mode" className="flex h-9 min-w-0 items-center justify-center gap-1 rounded-lg bg-emerald-600 px-1.5 text-[8px] font-bold text-white shadow-md transition active:scale-[0.98] lg:shadow-sm lg:hover:bg-emerald-700 lg:hover:shadow-md sm:h-10 sm:px-2 sm:text-[9px]">
                                <ClipboardCheck size={13} className="shrink-0" />
                                <span className="truncate">Test</span>
                            </Link>
                        </div>
                    </article>
                </div>
            </div>
        </section>
    );
};

export default CategoryCollection;