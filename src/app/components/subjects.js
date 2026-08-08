// "use client";

// import axios from "axios";
// import Link from "next/link";
// import {
//     ArrowRight,
//     BookOpenText,
// } from "lucide-react";
// import { useEffect, useState } from "react";

// const subjectStyles = [
//     {
//         icon: "bg-emerald-50 text-emerald-600",
//         border: "group-hover:border-emerald-200",
//     },
//     {
//         icon: "bg-blue-50 text-blue-600",
//         border: "group-hover:border-blue-200",
//     },
//     {
//         icon: "bg-orange-50 text-orange-500",
//         border: "group-hover:border-orange-200",
//     },
//     {
//         icon: "bg-violet-50 text-violet-600",
//         border: "group-hover:border-violet-200",
//     },
//     {
//         icon: "bg-teal-50 text-teal-600",
//         border: "group-hover:border-teal-200",
//     },
//     {
//         icon: "bg-cyan-50 text-cyan-600",
//         border: "group-hover:border-cyan-200",
//     },
// ];

// const PopularSubjects = () => {
//     const [subjects, setSubjects] = useState([]);

//     const getSubjects = async () => {
//         try {
//             const result = await axios.get("/api/subjects");

//             if (result.data.success) {
//                 setSubjects(
//                     result.data.subjects ||
//                     result.data.subject ||
//                     [],
//                 );
//             }
//         } catch (error) {
//             console.log(error);
//         }
//     };

//     useEffect(() => {
//         getSubjects();
//     }, []);

//     if (subjects.length === 0) {
//         return null;
//     }

//     return (
//         <section className="border-y border-slate-100 bg-white px-4 py-7 sm:px-6 sm:py-9 lg:px-8 lg:py-11">
//             <div className="mx-auto w-full max-w-[1300px]">
//                 <div className="mb-4 flex items-center justify-between gap-4 sm:mb-6">
//                     <h2 className="text-lg font-extrabold tracking-tight text-[#071a4a] sm:text-2xl">
//                         Popular Subjects
//                     </h2>

//                     <Link
//                         href="/subjects"
//                         className="hidden h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md sm:inline-flex"
//                     >
//                         View all subjects
//                         <ArrowRight size={15} />
//                     </Link>
//                 </div>

//                 <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
//                     {subjects
//                         .slice(0, 6)
//                         .map((subject, index) => {
//                             const style =
//                                 subjectStyles[
//                                 index % subjectStyles.length
//                                 ];

//                             const eventName =
//                                 subject.event?.name ||
//                                 subject.eventName ||
//                                 "";

//                             return (
//                                 <Link
//                                     key={subject._id}
//                                     href={`/subjects/${subject._id}`}
//                                     className={`group flex min-w-0 items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_3px_14px_rgba(15,23,42,0.05)] transition duration-200 hover:-translate-y-0.5 hover:shadow-md sm:min-h-24 sm:p-4 ${index >= 4 ? "max-sm:hidden" : ""} ${style.border}`}
//                                 >
//                                     <div
//                                         className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition duration-200 group-hover:scale-105 sm:h-11 sm:w-11 ${style.icon}`}
//                                     >
//                                         <BookOpenText
//                                             size={21}
//                                             strokeWidth={1.9}
//                                         />
//                                     </div>

//                                     <div className="min-w-0 flex-1">
//                                         <h3 className="truncate text-xs font-extrabold text-[#071a4a] sm:text-sm">
//                                             {subject.name}
//                                         </h3>

//                                         {eventName && (
//                                             <p className="mt-1 truncate text-[9px] font-semibold text-slate-500 sm:text-[11px]">
//                                                 {eventName}
//                                             </p>
//                                         )}
//                                     </div>
//                                 </Link>
//                             );
//                         })}
//                 </div>

//                 <Link
//                     href="/subjects"
//                     className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 sm:hidden"
//                 >
//                     View all subjects
//                     <ArrowRight size={15} />
//                 </Link>
//             </div>
//         </section>
//     );
// };

// export default PopularSubjects;

import Link from "next/link";
import {
  ArrowRight,
  BookOpenText,
} from "lucide-react";

const sampleSubjects = [
  {
    _id: "biology",
    name: "Biology",
    eventName: "MDCAT",
  },
  {
    _id: "physics",
    name: "Physics",
    eventName: "MDCAT",
  },
  {
    _id: "chemistry",
    name: "Chemistry",
    eventName: "MDCAT",
  },
  {
    _id: "english",
    name: "English",
    eventName: "CSS, PMS",
  },
];

const subjectStyles = [
  {
    icon: "bg-emerald-50 text-emerald-600",
    border: "group-hover:border-emerald-200",
  },
  {
    icon: "bg-blue-50 text-blue-600",
    border: "group-hover:border-blue-200",
  },
  {
    icon: "bg-orange-50 text-orange-500",
    border: "group-hover:border-orange-200",
  },
  {
    icon: "bg-violet-50 text-violet-600",
    border: "group-hover:border-violet-200",
  },
];

const PopularSubjects = () => {
  return (
    <section className="border-y border-slate-100 bg-white px-4 py-7 sm:px-6 sm:py-9 lg:px-8 lg:py-11">
      <div className="mx-auto w-full max-w-[1300px]">
        <div className="mb-4 flex items-center justify-between gap-4 sm:mb-6">
          <h2 className="text-lg font-extrabold tracking-tight text-[#071a4a] sm:text-2xl">
            Popular Subjects
          </h2>

          <Link
            href="/subjects"
            className="hidden h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md sm:inline-flex"
          >
            View all subjects
            <ArrowRight size={15} />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {sampleSubjects.map((subject, index) => {
            const style =
              subjectStyles[index % subjectStyles.length];

            return (
              <Link
                key={subject._id}
                href={`/subjects/${subject._id}`}
                className={`group flex min-w-0 items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_3px_14px_rgba(15,23,42,0.05)] transition duration-200 hover:-translate-y-0.5 hover:shadow-md sm:min-h-24 sm:p-4 ${style.border}`}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition duration-200 group-hover:scale-105 sm:h-11 sm:w-11 ${style.icon}`}
                >
                  <BookOpenText
                    size={21}
                    strokeWidth={1.9}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-xs font-extrabold text-[#071a4a] sm:text-sm">
                    {subject.name}
                  </h3>

                  <p className="mt-1 truncate text-[9px] font-semibold text-slate-500 sm:text-[11px]">
                    {subject.eventName}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        <Link
          href="/subjects"
          className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 sm:hidden"
        >
          View all subjects
          <ArrowRight size={15} />
        </Link>
      </div>
    </section>
  );
};

export default PopularSubjects;