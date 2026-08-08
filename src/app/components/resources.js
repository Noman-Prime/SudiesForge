import Link from "next/link";
import {
    BookOpenText,
    CirclePlay,
    ClipboardCheck,
    Files,
    ListChecks,
} from "lucide-react";

const categories = [
    {
        name: "Notes",
        href: "/notes",
        icon: BookOpenText,
        iconStyle:
            "border-blue-100 bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white",
    },
    {
        name: "Lectures",
        href: "/lectures",
        icon: CirclePlay,
        iconStyle:
            "border-orange-100 bg-orange-50 text-orange-500 group-hover:bg-orange-500 group-hover:text-white",
    },
    {
        name: "MCQs",
        href: "/mcqs",
        icon: ListChecks,
        iconStyle:
            "border-emerald-100 bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white",
    },
    {
        name: "Mock Tests",
        href: "/mock-tests",
        icon: ClipboardCheck,
        iconStyle:
            "border-violet-100 bg-violet-50 text-violet-600 group-hover:bg-violet-600 group-hover:text-white",
    },
    {
        name: "Past Papers",
        href: "/past-papers",
        icon: Files,
        iconStyle:
            "border-cyan-100 bg-cyan-50 text-cyan-600 group-hover:bg-cyan-600 group-hover:text-white",
    },
];

const CategoryCollection = () => {
    return (
        <section
            aria-label="Learning resources"
            className="relative overflow-hidden border-b border-slate-200 bg-white"
        >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-blue-50/60 to-transparent" />

            <div className="relative mx-auto w-full max-w-5xl px-2 py-3 sm:px-6 sm:py-5 lg:px-8 lg:py-6">
                <div className="grid grid-cols-5 gap-1.5 sm:gap-4 lg:gap-8">
                    {categories.map((category) => {
                        const Icon = category.icon;

                        return (
                            <Link
                                key={category.name}
                                href={category.href}
                                aria-label={`Open ${category.name}`}
                                className="group flex min-w-0 flex-col items-center justify-center rounded-xl px-1 py-2.5 text-center transition duration-200 hover:bg-slate-50 sm:rounded-2xl sm:px-3 sm:py-4"
                            >
                                <div
                                    className={`flex h-10 w-10 items-center justify-center rounded-xl border shadow-[0_4px_12px_rgba(15,23,42,0.06)] transition duration-200 group-hover:-translate-y-1 group-hover:shadow-lg sm:h-13 sm:w-13 sm:rounded-2xl lg:h-14 lg:w-14 ${category.iconStyle}`}
                                >
                                    <Icon
                                        size={19}
                                        strokeWidth={1.9}
                                        className="sm:h-6 sm:w-6 lg:h-7 lg:w-7"
                                    />
                                </div>

                                <span className="mt-2 min-h-6 text-[9px] font-bold leading-3 text-[#102a63] transition group-hover:text-blue-700 sm:mt-3 sm:min-h-0 sm:text-sm sm:leading-5">
                                    {category.name}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default CategoryCollection;