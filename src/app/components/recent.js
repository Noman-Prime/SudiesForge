// import Link from "next/link";
// import {
//     ArrowUpRight,
//     BookOpen,
//     ClipboardCheck,
//     FileClock,
//     FileText,
//     ListChecks,
//     PlayCircle,
// } from "lucide-react";

// const resourceStyles = {
//     subject: {
//         icon: BookOpen,
//         style: "bg-blue-50 text-blue-600",
//     },
//     chapter: {
//         icon: FileText,
//         style: "bg-emerald-50 text-emerald-600",
//     },
//     lecture: {
//         icon: PlayCircle,
//         style: "bg-orange-50 text-orange-500",
//     },
//     mcqs: {
//         icon: ListChecks,
//         style: "bg-violet-50 text-violet-600",
//     },
//     mockTest: {
//         icon: ClipboardCheck,
//         style: "bg-cyan-50 text-cyan-600",
//     },
//     pastPaper: {
//         icon: FileClock,
//         style: "bg-amber-50 text-amber-600",
//     },
// };

// const RecentOpened = ({ recentItems = [] }) => {
//     const visibleItems = recentItems.slice(0, 4);

//     return (
//         <section className="bg-slate-50 px-4 py-7 sm:px-6 sm:py-9 lg:px-8 lg:py-11">
//             <div className="mx-auto w-full max-w-[1300px]">
//                 <div className="mb-4 flex items-center justify-between sm:mb-6">
//                     <div>
//                         <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-600 sm:text-xs">
//                             Your activity
//                         </p>

//                         <h2 className="mt-1 text-lg font-extrabold tracking-tight text-[#071a4a] sm:text-2xl">
//                             Recently Viewed
//                         </h2>
//                     </div>

//                     {recentItems.length > 4 && (
//                         <Link
//                             href="/me/recently-viewed"
//                             className="hidden h-10 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 px-4 text-xs font-bold text-blue-700 transition hover:border-blue-600 hover:bg-blue-600 hover:text-white sm:inline-flex"
//                         >
//                             View all
//                         </Link>
//                     )}
//                 </div>

//                 {visibleItems.length === 0 ? (
//                     <div className="flex min-h-44 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-8 text-center">
//                         <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 sm:h-14 sm:w-14">
//                             <FileClock
//                                 size={25}
//                                 strokeWidth={1.8}
//                             />
//                         </div>

//                         <h3 className="mt-4 text-sm font-extrabold text-[#071a4a] sm:text-base">
//                             No recently viewed resources
//                         </h3>

//                         <p className="mt-1 max-w-md text-[11px] leading-5 text-slate-500 sm:text-xs">
//                             Subjects, chapters, lectures and other
//                             resources you open will appear here.
//                         </p>
//                     </div>
//                 ) : (
//                     <>
//                         <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
//                             {visibleItems.map((item) => {
//                                 const resource =
//                                     resourceStyles[item.resourceType] ||
//                                     resourceStyles.chapter;

//                                 const Icon = resource.icon;

//                                 return (
//                                     <Link
//                                         key={item._id}
//                                         href={item.href}
//                                         className="group flex min-w-0 items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-[0_3px_14px_rgba(15,23,42,0.05)] transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md sm:p-4"
//                                     >
//                                         <div
//                                             className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${resource.style}`}
//                                         >
//                                             <Icon
//                                                 size={21}
//                                                 strokeWidth={1.9}
//                                             />
//                                         </div>

//                                         <div className="min-w-0 flex-1">
//                                             <span className="block text-[9px] font-bold uppercase tracking-[0.12em] text-blue-600">
//                                                 {item.resourceType}
//                                             </span>

//                                             <h3 className="mt-1 truncate text-xs font-extrabold text-[#071a4a] sm:text-sm">
//                                                 {item.title}
//                                             </h3>

//                                             {item.subtitle && (
//                                                 <p className="mt-1 truncate text-[10px] text-slate-500 sm:text-[11px]">
//                                                     {item.subtitle}
//                                                 </p>
//                                             )}
//                                         </div>

//                                         <ArrowUpRight
//                                             size={17}
//                                             className="shrink-0 text-slate-400 transition group-hover:text-blue-600"
//                                         />
//                                     </Link>
//                                 );
//                             })}
//                         </div>

//                         {recentItems.length > 4 && (
//                             <Link
//                                 href="/me/recently-viewed"
//                                 className="mt-4 flex h-11 w-full items-center justify-center rounded-xl bg-blue-600 px-4 text-xs font-bold text-white transition hover:bg-blue-700 sm:hidden"
//                             >
//                                 View all recently viewed
//                             </Link>
//                         )}
//                     </>
//                 )}
//             </div>
//         </section>
//     );
// };

// export default RecentOpened;

import Link from "next/link";
import {
    ArrowUpRight,
    BookOpen,
    ClipboardCheck,
    FileClock,
    FileText,
    ListChecks,
    PlayCircle,
} from "lucide-react";

const sampleRecentItems = [
    {
        _id: "recent-lecture-1",
        resourceType: "lecture",
        title: "Cell Structure",
        subtitle: "MDCAT Biology",
        href: "/lectures/cell-structure",
    },
    {
        _id: "recent-subject-1",
        resourceType: "subject",
        title: "Biology",
        subtitle: "MDCAT",
        href: "/subjects/biology",
    },
    {
        _id: "recent-mcqs-1",
        resourceType: "mcqs",
        title: "Cell Biology MCQs",
        subtitle: "MDCAT Biology",
        href: "/mcqs/cell-biology",
    },
    {
        _id: "recent-paper-1",
        resourceType: "pastPaper",
        title: "PPSC Past Paper",
        subtitle: "General Knowledge",
        href: "/past-papers/ppsc",
    },
];

const resourceStyles = {
    subject: {
        icon: BookOpen,
        style: "bg-blue-50 text-blue-600",
    },
    chapter: {
        icon: FileText,
        style: "bg-emerald-50 text-emerald-600",
    },
    lecture: {
        icon: PlayCircle,
        style: "bg-orange-50 text-orange-500",
    },
    mcqs: {
        icon: ListChecks,
        style: "bg-violet-50 text-violet-600",
    },
    mockTest: {
        icon: ClipboardCheck,
        style: "bg-cyan-50 text-cyan-600",
    },
    pastPaper: {
        icon: FileClock,
        style: "bg-amber-50 text-amber-600",
    },
};

const RecentOpened = ({
    recentItems = sampleRecentItems,
}) => {
    const visibleItems = recentItems.slice(0, 4);

    return (
        <section className="bg-slate-50 px-4 py-7 sm:px-6 sm:py-9 lg:px-8 lg:py-11">
            <div className="mx-auto w-full max-w-[1300px]">
                <div className="mb-4 flex items-center justify-between sm:mb-6">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-600 sm:text-xs">
                            Your activity
                        </p>

                        <h2 className="mt-1 text-lg font-extrabold tracking-tight text-[#071a4a] sm:text-2xl">
                            Recently Viewed
                        </h2>
                    </div>

                    {recentItems.length > 4 && (
                        <Link
                            href="/me/recently-viewed"
                            className="hidden h-10 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 px-4 text-xs font-bold text-blue-700 transition hover:border-blue-600 hover:bg-blue-600 hover:text-white sm:inline-flex"
                        >
                            View all
                        </Link>
                    )}
                </div>

                {visibleItems.length === 0 ? (
                    <div className="flex min-h-44 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-8 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 sm:h-14 sm:w-14">
                            <FileClock
                                size={25}
                                strokeWidth={1.8}
                            />
                        </div>

                        <h3 className="mt-4 text-sm font-extrabold text-[#071a4a] sm:text-base">
                            No recently viewed resources
                        </h3>

                        <p className="mt-1 max-w-md text-[11px] leading-5 text-slate-500 sm:text-xs">
                            Subjects, chapters, lectures and other
                            resources you open will appear here.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            {visibleItems.map((item) => {
                                const resource =
                                    resourceStyles[item.resourceType] ||
                                    resourceStyles.chapter;

                                const Icon = resource.icon;

                                return (
                                    <Link
                                        key={item._id}
                                        href={item.href}
                                        className="group flex min-w-0 items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-[0_3px_14px_rgba(15,23,42,0.05)] transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md sm:p-4"
                                    >
                                        <div
                                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${resource.style}`}
                                        >
                                            <Icon
                                                size={21}
                                                strokeWidth={1.9}
                                            />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <span className="block text-[9px] font-bold uppercase tracking-[0.12em] text-blue-600">
                                                {item.resourceType}
                                            </span>

                                            <h3 className="mt-1 truncate text-xs font-extrabold text-[#071a4a] sm:text-sm">
                                                {item.title}
                                            </h3>

                                            {item.subtitle && (
                                                <p className="mt-1 truncate text-[10px] text-slate-500 sm:text-[11px]">
                                                    {item.subtitle}
                                                </p>
                                            )}
                                        </div>

                                        <ArrowUpRight
                                            size={17}
                                            className="shrink-0 text-slate-400 transition group-hover:text-blue-600"
                                        />
                                    </Link>
                                );
                            })}
                        </div>

                        {recentItems.length > 4 && (
                            <Link
                                href="/me/recently-viewed"
                                className="mt-4 flex h-11 w-full items-center justify-center rounded-xl bg-blue-600 px-4 text-xs font-bold text-white transition hover:bg-blue-700 sm:hidden"
                            >
                                View all recently viewed
                            </Link>
                        )}
                    </>
                )}
            </div>
        </section>
    );
};

export default RecentOpened;