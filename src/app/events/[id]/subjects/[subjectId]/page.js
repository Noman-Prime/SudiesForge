"use client";

import Footer from "@/app/components/footer";
import Navbar from "@/app/components/navbar";
import { EventProvider } from "@/context/EventContext";
import axios from "axios";
import Link from "next/link";
import {
    ArrowLeft,
    BookOpenText,
    ChevronRight,
    Construction,
    GraduationCap,
    Layers3,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const SubjectPage = () => {
    const { id, subjectId } = useParams();

    const [subject, setSubject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] =
        useState("");

    const getSubject = async () => {
        try {
            setLoading(true);
            setErrorMessage("");

            const result = await axios.get(
                `/api/subject/${subjectId}`,
            );

            if (result.data.success) {
                const currentSubject =
                    result.data.subject;

                const subjectEventId =
                    currentSubject.event?._id ||
                    currentSubject.event;

                if (
                    subjectEventId &&
                    String(subjectEventId) !==
                    String(id)
                ) {
                    setSubject(null);
                    setErrorMessage(
                        "This subject does not belong to this event",
                    );
                    return;
                }

                setSubject(currentSubject);
            }
        } catch (error) {
            console.log(error);

            setSubject(null);
            setErrorMessage(
                error.response?.data?.message ||
                "Subject could not be loaded",
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (subjectId) {
            getSubject();
        }
    }, [subjectId, id]);

    return (
        <div className="min-h-screen bg-slate-50">
            <EventProvider>
                <Navbar />
            </EventProvider>

            <main className="min-h-[calc(100vh-80px)] px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
                <div className="mx-auto w-full max-w-[1300px]">
                    <Link
                        href={`/events/${id}#subjects`}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-700"
                    >
                        <ArrowLeft size={17} />
                        Back to event
                    </Link>

                    {loading ? (
                        <SubjectPageLoading />
                    ) : errorMessage || !subject ? (
                        <SubjectPageError
                            message={
                                errorMessage ||
                                "Subject is not available"
                            }
                            onRetry={getSubject}
                            eventId={id}
                        />
                    ) : (
                        <>
                            <nav
                                aria-label="Breadcrumb"
                                className="mt-5 flex flex-wrap items-center gap-1.5 text-xs font-semibold text-slate-500"
                            >
                                <Link
                                    href={`/events/${id}`}
                                    className="transition hover:text-blue-700"
                                >
                                    Event
                                </Link>

                                <ChevronRight size={14} />

                                <Link
                                    href={`/events/${id}#subjects`}
                                    className="transition hover:text-blue-700"
                                >
                                    Subjects
                                </Link>

                                <ChevronRight size={14} />

                                <span className="text-blue-700">
                                    {subject.name}
                                </span>
                            </nav>

                            <section className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                <div className="grid lg:grid-cols-[1fr_420px]">
                                    <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
                                        <div className="flex w-fit items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-blue-700">
                                            <GraduationCap
                                                size={14}
                                            />
                                            Subject workspace
                                        </div>

                                        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-[#071a4a] sm:text-4xl">
                                            {subject.name}
                                        </h1>

                                        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
                                            Explore chapters,
                                            topics, notes, videos
                                            and practice material
                                            for {subject.name}.
                                        </p>

                                        <div className="mt-6 flex flex-wrap gap-3">
                                            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                                                <Layers3
                                                    size={18}
                                                    className="text-blue-600"
                                                />

                                                <div>
                                                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                                                        Chapters
                                                    </p>

                                                    <p className="text-sm font-bold text-slate-700">
                                                        Coming soon
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                                                <BookOpenText
                                                    size={18}
                                                    className="text-blue-600"
                                                />

                                                <div>
                                                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                                                        Resources
                                                    </p>

                                                    <p className="text-sm font-bold text-slate-700">
                                                        Coming soon
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="relative min-h-64 overflow-hidden bg-blue-50 lg:min-h-[360px]">
                                        {subject.image?.url ? (
                                            <>
                                                <img
                                                    src={
                                                        subject
                                                            .image
                                                            .url
                                                    }
                                                    alt={
                                                        subject.name
                                                    }
                                                    className="absolute inset-0 h-full w-full object-cover"
                                                />

                                                <div className="absolute inset-0 bg-gradient-to-t from-[#071a4a]/30 via-transparent to-transparent" />
                                            </>
                                        ) : (
                                            <div className="flex h-full min-h-64 items-center justify-center text-blue-500 lg:min-h-[360px]">
                                                <BookOpenText
                                                    size={70}
                                                    strokeWidth={
                                                        1.4
                                                    }
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </section>

                            <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-600">
                                        Learning material
                                    </p>

                                    <h2 className="mt-1 text-lg font-extrabold text-[#071a4a] sm:text-xl">
                                        Chapters and resources
                                    </h2>
                                </div>

                                <div className="flex min-h-72 items-center justify-center bg-slate-50/60 px-5 py-10 text-center">
                                    <div className="max-w-md">
                                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                                            <Construction
                                                size={30}
                                                strokeWidth={
                                                    1.8
                                                }
                                            />
                                        </div>

                                        <h3 className="mt-5 text-lg font-extrabold text-[#071a4a]">
                                            Learning material is
                                            coming soon
                                        </h3>

                                        <p className="mt-2 text-sm leading-6 text-slate-500">
                                            Chapters, topics,
                                            notes, lectures and
                                            practice material for{" "}
                                            {subject.name} will
                                            appear here when they
                                            are added.
                                        </p>

                                        <Link
                                            href={`/events/${id}#subjects`}
                                            className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                                        >
                                            Explore other subjects
                                            <ChevronRight
                                                size={17}
                                            />
                                        </Link>
                                    </div>
                                </div>
                            </section>
                        </>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

const SubjectPageLoading = () => {
    return (
        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="grid animate-pulse lg:grid-cols-[1fr_420px]">
                <div className="p-6 sm:p-8 lg:p-10">
                    <div className="h-7 w-40 rounded-full bg-slate-200" />
                    <div className="mt-5 h-10 w-64 rounded-lg bg-slate-200" />
                    <div className="mt-4 h-4 w-full max-w-xl rounded bg-slate-100" />
                    <div className="mt-2 h-4 w-4/5 max-w-lg rounded bg-slate-100" />

                    <div className="mt-7 flex gap-3">
                        <div className="h-16 w-36 rounded-xl bg-slate-100" />
                        <div className="h-16 w-36 rounded-xl bg-slate-100" />
                    </div>
                </div>

                <div className="min-h-64 bg-slate-200 lg:min-h-[360px]" />
            </div>
        </div>
    );
};

const SubjectPageError = ({
    message,
    onRetry,
    eventId,
}) => {
    return (
        <section className="mt-5 flex min-h-96 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-10 text-center shadow-sm">
            <div>
                <BookOpenText
                    size={48}
                    className="mx-auto text-red-400"
                />

                <h1 className="mt-4 text-xl font-extrabold text-[#071a4a]">
                    Subject could not be opened
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                    {message}
                </p>

                <div className="mt-5 flex flex-wrap justify-center gap-3">
                    <button
                        type="button"
                        onClick={onRetry}
                        className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                        Try again
                    </button>

                    <Link
                        href={`/events/${eventId}#subjects`}
                        className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                    >
                        Back to subjects
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default SubjectPage;