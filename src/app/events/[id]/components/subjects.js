"use client";

import axios from "axios";
import Link from "next/link";
import { AlertCircle, BookOpenText, ChevronRight, RefreshCw } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const EventSubjects = () => {
    const { id } = useParams();
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    const getSubjects = async () => {
        try {
            setLoading(true);
            setErrorMessage("");

            const result = await axios.get(`/api/events/${id}/subjects`);

            if (result.data.success) {
                setSubjects(result.data.subjects || []);
            } else {
                setSubjects([]);
            }
        } catch (error) {
            console.log(error);

            if (error.response?.status === 404) {
                setSubjects([]);
                setErrorMessage("");
                return;
            }

            setSubjects([]);
            setErrorMessage(error.response?.data?.message || "Subjects could not be loaded");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            getSubjects();
        }
    }, [id]);

    return (
        <section id="subjects" className="scroll-mt-24 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-4 py-4 sm:px-5">
                <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <BookOpenText size={18} strokeWidth={1.9} />
                    </div>

                    <div className="min-w-0">
                        <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-blue-600 sm:text-[9px]">
                            Event subjects
                        </p>

                        <h2 className="mt-0.5 text-base font-extrabold tracking-tight text-[#071a4a] sm:text-lg">
                            Choose Your Subject
                        </h2>

                        <p className="mt-1 text-[9px] leading-4 text-slate-500 sm:text-[11px]">
                            Select a subject to open its available chapters.
                        </p>
                    </div>
                </div>

                {!loading && !errorMessage && subjects.length > 0 && (
                    <span className="flex h-8 min-w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 px-2 text-[10px] font-extrabold text-blue-700">
                        {subjects.length}
                    </span>
                )}
            </div>

            {loading ? (
                <SubjectsLoading />
            ) : errorMessage ? (
                <SubjectsError message={errorMessage} retry={getSubjects} />
            ) : subjects.length === 0 ? (
                <SubjectsEmpty />
            ) : (
                <div className="grid grid-cols-2 gap-2.5 bg-slate-50/70 p-3 sm:gap-3 sm:p-4 lg:grid-cols-4">
                    {subjects.map((subject) => (
                        <Link key={subject._id} href={`/events/${id}/subjects/${subject._id}`} aria-label={`Open ${subject.name}`} className="group min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md">
                            <div className="relative h-24 overflow-hidden bg-gradient-to-br from-blue-50 to-slate-100 sm:h-28 xl:h-32">
                                {subject.image?.url ? (
                                    <img src={subject.image.url} alt={subject.name} loading="lazy" decoding="async" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-blue-500">
                                        <BookOpenText size={28} strokeWidth={1.7} />
                                    </div>
                                )}

                                <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#071a4a]/35 to-transparent" />
                            </div>

                            <div className="p-2.5 sm:p-3">
                                <p className="text-[7px] font-bold uppercase tracking-[0.13em] text-blue-600 sm:text-[8px]">
                                    Subject
                                </p>

                                <h3 className="mt-1 line-clamp-2 min-h-8 text-[11px] font-extrabold leading-4 text-[#071a4a] sm:text-sm sm:leading-5">
                                    {subject.name}
                                </h3>

                                <div className="mt-2 flex items-center justify-between gap-2 border-t border-slate-100 pt-2">
                                    <span className="truncate text-[8px] font-semibold text-slate-500 sm:text-[9px]">
                                        Explore chapters
                                    </span>

                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                                        <ChevronRight size={13} strokeWidth={2.2} />
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </section>
    );
};

const SubjectsLoading = () => {
    return (
        <div className="grid grid-cols-2 gap-2.5 bg-slate-50/70 p-3 sm:gap-3 sm:p-4 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
                <div key={item} className="animate-pulse overflow-hidden rounded-xl border border-slate-200 bg-white">
                    <div className="h-24 bg-slate-200 sm:h-28 xl:h-32" />

                    <div className="p-2.5 sm:p-3">
                        <div className="h-2 w-12 rounded bg-slate-100" />
                        <div className="mt-2 h-3 w-3/4 rounded bg-slate-200" />
                        <div className="mt-2 h-3 w-1/2 rounded bg-slate-100" />
                        <div className="mt-3 h-6 rounded-lg bg-slate-100" />
                    </div>
                </div>
            ))}
        </div>
    );
};

const SubjectsError = ({ message, retry }) => {
    return (
        <div className="bg-slate-50/70 px-4 py-10 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500">
                <AlertCircle size={19} />
            </div>

            <h3 className="mt-3 text-sm font-extrabold text-[#071a4a]">
                Subjects could not be loaded
            </h3>

            <p className="mx-auto mt-1 max-w-md text-[10px] leading-5 text-slate-500">
                {message}
            </p>

            <button type="button" onClick={retry} className="mt-4 inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-4 text-[10px] font-bold text-white transition hover:bg-blue-700">
                <RefreshCw size={13} />
                Try Again
            </button>
        </div>
    );
};

const SubjectsEmpty = () => {
    return (
        <div className="bg-slate-50/70 px-4 py-10 text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-500">
                <BookOpenText size={21} />
            </div>

            <h3 className="mt-3 text-sm font-extrabold text-[#071a4a]">
                No subjects are available
            </h3>

            <p className="mx-auto mt-1 max-w-md text-[10px] leading-5 text-slate-500">
                Subjects will appear here when they are added to this event.
            </p>
        </div>
    );
};

export default EventSubjects;