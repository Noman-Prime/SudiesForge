"use client";

import axios from "axios";
import Link from "next/link";
import { ArrowRight, BookOpenText, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

const subjectStyles = [
  {
    icon: "bg-emerald-600 text-white lg:bg-emerald-50 lg:text-emerald-600 lg:group-hover:bg-emerald-600 lg:group-hover:text-white",
    card: "border-emerald-300 shadow-md lg:border-slate-200 lg:shadow-sm lg:hover:border-emerald-300 lg:hover:shadow-md",
    badge: "bg-emerald-50 text-emerald-700",
  },
  {
    icon: "bg-blue-600 text-white lg:bg-blue-50 lg:text-blue-600 lg:group-hover:bg-blue-600 lg:group-hover:text-white",
    card: "border-blue-300 shadow-md lg:border-slate-200 lg:shadow-sm lg:hover:border-blue-300 lg:hover:shadow-md",
    badge: "bg-blue-50 text-blue-700",
  },
  {
    icon: "bg-orange-500 text-white lg:bg-orange-50 lg:text-orange-500 lg:group-hover:bg-orange-500 lg:group-hover:text-white",
    card: "border-orange-300 shadow-md lg:border-slate-200 lg:shadow-sm lg:hover:border-orange-300 lg:hover:shadow-md",
    badge: "bg-orange-50 text-orange-700",
  },
  {
    icon: "bg-violet-600 text-white lg:bg-violet-50 lg:text-violet-600 lg:group-hover:bg-violet-600 lg:group-hover:text-white",
    card: "border-violet-300 shadow-md lg:border-slate-200 lg:shadow-sm lg:hover:border-violet-300 lg:hover:shadow-md",
    badge: "bg-violet-50 text-violet-700",
  },
];

const getId = (value) => {
  return typeof value === "object" ? value?._id : value;
};

const PopularSubjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const getSubjects = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const result = await axios.get("/api/subject");

      if (result.data.success) {
        setSubjects(result.data.subjects || result.data.subject || []);
      } else {
        setSubjects([]);
      }
    } catch (error) {
      console.log(error);

      if (error.response?.status === 404) {
        setSubjects([]);
        return;
      }

      setSubjects([]);
      setErrorMessage(error.response?.data?.message || "Subjects could not be loaded");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getSubjects();
  }, []);

  if (!loading && !errorMessage && subjects.length === 0) {
    return null;
  }

  const visibleSubjects = subjects
    .filter((subject) => subject?._id && getId(subject.event))
    .slice(0, 4);

  return (
    <section id="subjects" aria-labelledby="available-subjects-heading" className="border-b border-slate-200 bg-white px-3 py-7 sm:px-6 sm:py-9 lg:px-8">
      <div className="mx-auto w-full max-w-[1200px]">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-blue-600">
              Learning subjects
            </p>

            <h2 id="available-subjects-heading" className="mt-1 text-lg font-extrabold tracking-tight text-[#071a4a] sm:text-xl">
              Explore Subjects
            </h2>

            <p className="mt-1 max-w-2xl text-[10px] leading-5 text-slate-500 sm:text-xs">
              Choose a subject to explore its available chapters, topics and practice material.
            </p>
          </div>

          {!loading && !errorMessage && subjects.length > 0 && (
            <span className="flex h-9 min-w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 px-2.5 text-xs font-extrabold text-blue-700">
              {subjects.length}
            </span>
          )}
        </div>

        {loading ? (
          <SubjectsLoading />
        ) : errorMessage ? (
          <SubjectsError message={errorMessage} retry={getSubjects} />
        ) : (
          <>
            <div className="mt-5 grid grid-cols-2 items-stretch gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
              {visibleSubjects.map((subject, index) => {
                const style = subjectStyles[index % subjectStyles.length];
                const eventId = getId(subject.event);
                const eventName = typeof subject.event === "object" ? subject.event?.name : "";

                return (
                  <article key={subject._id} className={`group flex h-full min-w-0 flex-col rounded-2xl border bg-white p-3 transition duration-200 lg:hover:-translate-y-0.5 sm:p-4 ${style.card}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl transition duration-200 lg:group-hover:scale-105 sm:h-11 sm:w-11 ${style.icon}`}>
                        {subject.image?.url ? (
                          <img src={subject.image.url} alt={subject.name} className="h-full w-full object-cover" />
                        ) : (
                          <BookOpenText size={21} strokeWidth={1.9} />
                        )}
                      </div>

                      <span className={`rounded-md px-2 py-1 text-[7px] font-extrabold uppercase tracking-[0.1em] sm:text-[8px] ${style.badge}`}>
                        Subject
                      </span>
                    </div>

                    <div className="mt-3 min-w-0 flex-1">
                      <h3 className="line-clamp-2 text-xs font-extrabold leading-5 text-[#071a4a] sm:text-sm">
                        {subject.name}
                      </h3>

                      {eventName && (
                        <p className="mt-1.5 truncate text-[9px] font-semibold text-slate-500 sm:text-[10px]">
                          {eventName}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 border-t border-slate-100 pt-3">
                      <Link href={`/events/${eventId}/subjects/${subject._id}`} aria-label={`Open ${subject.name}`} className="flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-2 text-[8px] font-bold text-white shadow-md transition active:scale-[0.98] lg:shadow-sm lg:hover:bg-blue-700 lg:hover:shadow-md sm:h-10 sm:text-[9px]">
                        <span className="truncate">View Subject</span>
                        <ArrowRight size={13} className="shrink-0" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>

            {subjects.length > 4 && (
              <div className="mt-4 flex justify-center">
                <Link href="/subjects" className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-xs font-bold text-white shadow-md transition active:scale-[0.98] hover:bg-blue-700 sm:w-auto">
                  View All Subjects
                  <ArrowRight size={15} />
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

const SubjectsLoading = () => {
  return (
    <div className="mt-5 grid grid-cols-2 items-stretch gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
      {[1, 2, 3, 4].map((item) => (
        <div key={item} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="h-10 w-10 rounded-xl bg-slate-200 sm:h-11 sm:w-11" />
            <div className="h-5 w-14 rounded-md bg-slate-100" />
          </div>

          <div className="mt-4 h-3 w-2/3 rounded bg-slate-200" />
          <div className="mt-2 h-3 w-1/2 rounded bg-slate-100" />
          <div className="mt-5 h-9 rounded-lg bg-slate-200 sm:h-10" />
        </div>
      ))}
    </div>
  );
};

const SubjectsError = ({ message, retry }) => {
  return (
    <div className="mt-5 rounded-2xl border border-red-200 bg-white px-4 py-10 text-center shadow-sm">
      <BookOpenText size={28} className="mx-auto text-red-400" />

      <h3 className="mt-3 text-sm font-extrabold text-[#071a4a]">
        Subjects could not be loaded
      </h3>

      <p className="mx-auto mt-1.5 max-w-md text-[10px] leading-5 text-slate-500 sm:text-xs">
        {message}
      </p>

      <button type="button" onClick={retry} className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-bold text-white shadow-sm transition active:scale-[0.98] hover:bg-blue-700">
        <RefreshCw size={15} />
        Try Again
      </button>
    </div>
  );
};

export default PopularSubjects;