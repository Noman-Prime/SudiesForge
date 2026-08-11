"use client";

import axios from "axios";
import Link from "next/link";
import {
    BookOpenText,
    ChevronRight,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const EventSubjects = () => {
    const { id } = useParams();

    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] =
        useState("");

    const getSubjects = async () => {
        try {
            setLoading(true);
            setErrorMessage("");

            const result = await axios.get(
                `/api/events/${id}/subjects`,
            );

            if (result.data.success) {
                setSubjects(
                    result.data.subjects || [],
                );
            }
        } catch (error) {
            console.log(error);

            setSubjects([]);
            setErrorMessage(
                error.response?.data?.message ||
                "Subjects could not be loaded",
            );
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
        <section
            id="subjects"
            className="scroll-mt-24 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
            <div className="border-b border-slate-200 px-4 py-4 sm:px-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-600">
                    Explore subjects
                </p>

                <h2 className="mt-1 text-lg font-extrabold tracking-tight text-[#071a4a] sm:text-xl">
                    Browse Subjects
                </h2>

                <p className="mt-1 text-[11px] leading-5 text-slate-500 sm:text-xs">
                    Select a subject to explore its chapters
                    and available study material.
                </p>
            </div>

            {loading ? (
                <div className="flex min-h-48 items-center justify-center bg-slate-50/60 px-4 text-center">
                    <div>
                        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

                        <p className="mt-3 text-xs font-semibold text-slate-500">
                            Loading subjects...
                        </p>
                    </div>
                </div>
            ) : errorMessage ? (
                <div className="flex min-h-48 items-center justify-center bg-slate-50/60 px-4 text-center">
                    <div>
                        <BookOpenText
                            size={34}
                            className="mx-auto text-red-400"
                        />

                        <p className="mt-3 text-sm font-semibold text-slate-700">
                            {errorMessage}
                        </p>

                        <button
                            type="button"
                            onClick={getSubjects}
                            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                        >
                            Try again
                        </button>
                    </div>
                </div>
            ) : subjects.length === 0 ? (
                <div className="flex min-h-48 items-center justify-center bg-slate-50/60 px-4 text-center">
                    <div>
                        <BookOpenText
                            size={34}
                            className="mx-auto text-blue-400"
                        />

                        <p className="mt-3 text-sm font-semibold text-slate-700">
                            No subjects are available
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                            Subjects will appear here when they
                            are added to this event.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-3 bg-slate-50/60 p-3 sm:gap-4 sm:p-5 lg:grid-cols-4">
                    {subjects.map((subject) => (
                        <Link
                            key={subject._id}
                            href={`/events/${id}/subjects/${subject._id}`}
                            className="group min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                        >
                            <div className="relative h-28 overflow-hidden bg-blue-50 sm:h-36">
                                {subject.image?.url ? (
                                    <img
                                        src={
                                            subject.image.url
                                        }
                                        alt={subject.name}
                                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-blue-600">
                                        <BookOpenText
                                            size={34}
                                            strokeWidth={1.7}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="p-3 sm:p-4">
                                <div className="flex min-w-0 items-center justify-between gap-2">
                                    <div className="min-w-0">
                                        <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-blue-600 sm:text-[10px]">
                                            Subject
                                        </p>

                                        <h3 className="mt-1 truncate text-sm font-extrabold text-[#071a4a] sm:text-base">
                                            {subject.name}
                                        </h3>
                                    </div>

                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                                        <ChevronRight
                                            size={17}
                                            strokeWidth={2}
                                        />
                                    </div>
                                </div>

                                <div className="mt-3 border-t border-slate-100 pt-3">
                                    <span className="text-[9px] font-semibold text-slate-500 sm:text-[11px]">
                                        View chapters and
                                        resources
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

export default EventSubjects;