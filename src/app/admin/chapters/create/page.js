"use client";

import axios from "axios";
import Link from "next/link";
import {
    ArrowLeft,
    BookOpenText,
    Hash,
    LoaderCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
    toast,
    ToastContainer,
} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CreateChapter = () => {
    const navigate = useRouter();

    const [data, setData] = useState({
        subject: "",
        chapterNumber: "",
        chapterName: "",
    });

    const [subjects, setSubjects] = useState([]);
    const [loadingSubjects, setLoadingSubjects] =
        useState(true);
    const [isCreating, setIsCreating] =
        useState(false);

    const fillData = (e) => {
        setData((previousData) => ({
            ...previousData,
            [e.target.name]: e.target.value,
        }));
    };

    const getSubjects = async () => {
        try {
            setLoadingSubjects(true);

            const result = await axios.get(
                "/api/subject",
            );

            if (result.data.success) {
                setSubjects(
                    result.data.subjects || [],
                );
            }
        } catch (error) {
            if (error.response?.status === 404) {
                setSubjects([]);
                return;
            }

            console.log(error);

            toast.error(
                error.response?.data?.message ||
                "Subjects could not be loaded",
            );
        } finally {
            setLoadingSubjects(false);
        }
    };

    const sendData = async (e) => {
        e.preventDefault();

        if (isCreating) {
            return;
        }

        try {
            setIsCreating(true);

            const result = await axios.post(
                "/api/chapter",
                {
                    subject: data.subject,
                    chapterNumber: Number(
                        data.chapterNumber,
                    ),
                    chapterName: data.chapterName,
                },
            );

            if (result.data.success) {
                toast.success("Chapter is created");

                setTimeout(() => {
                    navigate.push(
                        "/admin/chapters",
                    );
                }, 3000);
            }
        } catch (error) {
            console.log(error);

            toast.error(
                error.response?.data?.message ||
                "Chapter is not created",
            );

            setIsCreating(false);
        }
    };

    useEffect(() => {
        getSubjects();
    }, []);

    return (
        <main className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6">
            <div className="mx-auto w-full max-w-4xl">
                <Link
                    href="/admin/chapters"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-blue-600"
                >
                    <ArrowLeft size={18} />
                    Back to chapters
                </Link>

                <div className="mt-5 grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md md:grid-cols-[0.85fr_1.15fr]">
                    <section className="flex flex-col justify-between bg-[#102a63] px-6 py-8 text-white sm:px-8 md:px-9 md:py-10">
                        <div>
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                                <BookOpenText size={23} />
                            </div>

                            <p className="mt-8 text-xs font-semibold uppercase tracking-[0.15em] text-blue-200">
                                Chapter management
                            </p>

                            <h1 className="mt-3 text-2xl font-bold leading-tight sm:text-3xl">
                                Create a new chapter
                            </h1>

                            <p className="mt-4 text-sm leading-6 text-blue-100">
                                Select the related subject
                                and enter the chapter details
                                according to the official
                                book or material.
                            </p>
                        </div>

                        <p className="mt-10 text-xs leading-5 text-blue-200">
                            The chapter image can be added
                            later from the update page.
                        </p>
                    </section>

                    <section className="px-6 py-8 sm:px-8 md:px-10 md:py-10">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">
                            New chapter
                        </p>

                        <h2 className="mt-2 text-2xl font-bold text-slate-900">
                            Chapter information
                        </h2>

                        <p className="mt-2 text-sm text-slate-500">
                            Enter the required chapter
                            details below.
                        </p>

                        <form
                            onSubmit={sendData}
                            className="mt-7 space-y-5"
                        >
                            <div>
                                <label
                                    htmlFor="subject"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Subject
                                </label>

                                <select
                                    id="subject"
                                    name="subject"
                                    value={data.subject}
                                    onChange={fillData}
                                    required
                                    disabled={
                                        loadingSubjects ||
                                        isCreating
                                    }
                                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                                >
                                    <option value="">
                                        {loadingSubjects
                                            ? "Loading subjects..."
                                            : "Select a subject"}
                                    </option>

                                    {subjects.map(
                                        (subject) => (
                                            <option
                                                key={
                                                    subject._id
                                                }
                                                value={
                                                    subject._id
                                                }
                                            >
                                                {subject
                                                    .event
                                                    ?.name
                                                    ? `${subject.event.name} - `
                                                    : ""}
                                                {
                                                    subject.name
                                                }
                                            </option>
                                        ),
                                    )}
                                </select>
                            </div>

                            <div>
                                <label
                                    htmlFor="chapterNumber"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Chapter number
                                </label>

                                <div className="relative">
                                    <Hash
                                        size={17}
                                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                    />

                                    <input
                                        id="chapterNumber"
                                        type="number"
                                        name="chapterNumber"
                                        value={
                                            data.chapterNumber
                                        }
                                        onChange={fillData}
                                        required
                                        disabled={
                                            isCreating
                                        }
                                        placeholder="For example: 1"
                                        className="w-full rounded-lg border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                                    />
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="chapterName"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Chapter name
                                </label>

                                <input
                                    id="chapterName"
                                    type="text"
                                    name="chapterName"
                                    value={
                                        data.chapterName
                                    }
                                    onChange={fillData}
                                    required
                                    disabled={isCreating}
                                    placeholder="Enter chapter name"
                                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={
                                    isCreating ||
                                    loadingSubjects ||
                                    subjects.length === 0
                                }
                                className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
                            >
                                {isCreating ? (
                                    <>
                                        <LoaderCircle
                                            size={18}
                                            className="animate-spin"
                                        />
                                        Creating...
                                    </>
                                ) : (
                                    "Create chapter"
                                )}
                            </button>
                        </form>
                    </section>
                </div>
            </div>

            <ToastContainer
                position="top-right"
                autoClose={3000}
                pauseOnHover={false}
                closeOnClick
            />
        </main>
    );
};

export default CreateChapter;