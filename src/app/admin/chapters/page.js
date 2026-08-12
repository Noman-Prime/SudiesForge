"use client";

import axios from "axios";
import Link from "next/link";
import {
    BookOpenText,
    Edit3,
    ImageIcon,
    LoaderCircle,
    Plus,
    Search,
    Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
    toast,
    ToastContainer,
} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Chapters = () => {
    const [chapters, setChapters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState("");
    const [search, setSearch] = useState("");

    const getChapters = async () => {
        try {
            setLoading(true);

            const result = await axios.get(
                "/api/chapter",
            );

            if (result.data.success) {
                setChapters(
                    result.data.chapters || [],
                );
            }
        } catch (error) {
            if (error.response?.status === 404) {
                setChapters([]);
                return;
            }

            console.log(error);

            toast.error(
                error.response?.data?.message ||
                "Chapters could not be loaded",
            );
        } finally {
            setLoading(false);
        }
    };

    const deleteChapter = async (id) => {
        const isConfirmed = window.confirm(
            "Are you sure you want to delete this chapter?",
        );

        if (!isConfirmed || deletingId) {
            return;
        }

        try {
            setDeletingId(id);

            const result = await axios.delete(
                `/api/chapter/${id}`,
            );

            if (result.data.success) {
                setChapters((previousChapters) =>
                    previousChapters.filter(
                        (chapter) =>
                            chapter._id !== id,
                    ),
                );

                toast.success(
                    "Chapter is deleted",
                );
            }
        } catch (error) {
            console.log(error);

            toast.error(
                error.response?.data?.message ||
                "Chapter could not be deleted",
            );
        } finally {
            setDeletingId("");
        }
    };

    useEffect(() => {
        getChapters();
    }, []);

    const filteredChapters = chapters.filter(
        (chapter) => {
            const searchValue =
                search.trim().toLowerCase();

            if (!searchValue) {
                return true;
            }

            const chapterName =
                chapter.chapterName
                    ?.toLowerCase() || "";

            const chapterNumber = String(
                chapter.chapterNumber || "",
            );

            const subjectName =
                chapter.subject?.name
                    ?.toLowerCase() || "";

            return (
                chapterName.includes(searchValue) ||
                chapterNumber.includes(searchValue) ||
                subjectName.includes(searchValue)
            );
        },
    );

    return (
        <main className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6">
            <div className="mx-auto w-full max-w-6xl">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-600">
                            Chapter management
                        </p>

                        <h1 className="mt-1 text-2xl font-extrabold text-[#071a4a] sm:text-3xl">
                            Chapters
                        </h1>

                        <p className="mt-2 text-sm text-slate-500">
                            Manage chapters and their
                            assigned subjects.
                        </p>
                    </div>

                    <Link
                        href="/admin/chapters/create"
                        className="inline-flex w-fit items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                        <Plus size={18} />
                        Create chapter
                    </Link>
                </div>

                <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-4 border-b border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                        <div>
                            <h2 className="font-bold text-slate-900">
                                All chapters
                            </h2>

                            <p className="mt-1 text-xs text-slate-500">
                                {chapters.length}{" "}
                                {chapters.length === 1
                                    ? "chapter"
                                    : "chapters"}{" "}
                                available
                            </p>
                        </div>

                        <div className="relative w-full sm:w-72">
                            <Search
                                size={17}
                                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <input
                                type="search"
                                value={search}
                                onChange={(e) =>
                                    setSearch(
                                        e.target.value,
                                    )
                                }
                                placeholder="Search chapters..."
                                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex min-h-72 items-center justify-center">
                            <div className="text-center">
                                <LoaderCircle
                                    size={34}
                                    className="mx-auto animate-spin text-blue-600"
                                />

                                <p className="mt-3 text-sm font-semibold text-slate-500">
                                    Loading chapters...
                                </p>
                            </div>
                        </div>
                    ) : filteredChapters.length ===
                        0 ? (
                        <div className="flex min-h-72 items-center justify-center px-4 text-center">
                            <div>
                                <BookOpenText
                                    size={42}
                                    strokeWidth={1.6}
                                    className="mx-auto text-blue-400"
                                />

                                <h3 className="mt-4 font-bold text-slate-800">
                                    {search
                                        ? "No matching chapters"
                                        : "No chapters are available"}
                                </h3>

                                <p className="mt-1 text-sm text-slate-500">
                                    {search
                                        ? "Try another search."
                                        : "Create your first chapter to get started."}
                                </p>

                                {!search && (
                                    <Link
                                        href="/admin/chapters/create"
                                        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                                    >
                                        <Plus
                                            size={17}
                                        />
                                        Create chapter
                                    </Link>
                                )}
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Mobile cards */}
                            <div className="divide-y divide-slate-200 md:hidden">
                                {filteredChapters.map(
                                    (chapter) => (
                                        <article
                                            key={
                                                chapter._id
                                            }
                                            className="p-4"
                                        >
                                            <div className="flex gap-4">
                                                <div className="h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-blue-50">
                                                    {chapter
                                                        .image
                                                        ?.url ? (
                                                        <img
                                                            src={
                                                                chapter
                                                                    .image
                                                                    .url
                                                            }
                                                            alt={
                                                                chapter.chapterName
                                                            }
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center text-blue-400">
                                                            <ImageIcon
                                                                size={
                                                                    26
                                                                }
                                                            />
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-blue-600">
                                                        Chapter{" "}
                                                        {
                                                            chapter.chapterNumber
                                                        }
                                                    </p>

                                                    <h3 className="mt-1 truncate font-bold text-slate-900">
                                                        {
                                                            chapter.chapterName
                                                        }
                                                    </h3>

                                                    <p className="mt-1 truncate text-xs text-slate-500">
                                                        {chapter
                                                            .subject
                                                            ?.name ||
                                                            "Subject unavailable"}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mt-4 flex gap-2">
                                                <Link
                                                    href={`/admin/chapters/${chapter._id}`}
                                                    className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                                                >
                                                    <Edit3
                                                        size={
                                                            15
                                                        }
                                                    />
                                                    Edit
                                                </Link>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        deleteChapter(
                                                            chapter._id,
                                                        )
                                                    }
                                                    disabled={
                                                        deletingId ===
                                                        chapter._id
                                                    }
                                                    className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                                                >
                                                    {deletingId ===
                                                        chapter._id ? (
                                                        <LoaderCircle
                                                            size={
                                                                15
                                                            }
                                                            className="animate-spin"
                                                        />
                                                    ) : (
                                                        <Trash2
                                                            size={
                                                                15
                                                            }
                                                        />
                                                    )}

                                                    {deletingId ===
                                                        chapter._id
                                                        ? "Deleting..."
                                                        : "Delete"}
                                                </button>
                                            </div>
                                        </article>
                                    ),
                                )}
                            </div>

                            {/* Desktop table */}
                            <div className="hidden overflow-x-auto md:block">
                                <table className="w-full">
                                    <thead className="bg-slate-50">
                                        <tr className="text-left text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500">
                                            <th className="px-6 py-4">
                                                Chapter
                                            </th>

                                            <th className="px-6 py-4">
                                                Subject
                                            </th>

                                            <th className="px-6 py-4">
                                                Number
                                            </th>

                                            <th className="px-6 py-4 text-right">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-200">
                                        {filteredChapters.map(
                                            (chapter) => (
                                                <tr
                                                    key={
                                                        chapter._id
                                                    }
                                                    className="transition hover:bg-slate-50"
                                                >
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-blue-50">
                                                                {chapter
                                                                    .image
                                                                    ?.url ? (
                                                                    <img
                                                                        src={
                                                                            chapter
                                                                                .image
                                                                                .url
                                                                        }
                                                                        alt={
                                                                            chapter.chapterName
                                                                        }
                                                                        className="h-full w-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="flex h-full w-full items-center justify-center text-blue-400">
                                                                        <ImageIcon
                                                                            size={
                                                                                21
                                                                            }
                                                                        />
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div className="min-w-0">
                                                                <p className="max-w-xs truncate text-sm font-bold text-slate-900">
                                                                    {
                                                                        chapter.chapterName
                                                                    }
                                                                </p>

                                                                <p className="mt-1 text-xs text-slate-400">
                                                                    ID:{" "}
                                                                    {
                                                                        chapter._id
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="px-6 py-4 text-sm font-semibold text-slate-600">
                                                        {chapter
                                                            .subject
                                                            ?.name ||
                                                            "Unavailable"}
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        <span className="inline-flex min-w-9 items-center justify-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                                                            {
                                                                chapter.chapterNumber
                                                            }
                                                        </span>
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        <div className="flex justify-end gap-2">
                                                            <Link
                                                                href={`/admin/chapters/${chapter._id}`}
                                                                aria-label="Edit chapter"
                                                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                                                            >
                                                                <Edit3
                                                                    size={
                                                                        16
                                                                    }
                                                                />
                                                            </Link>

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    deleteChapter(
                                                                        chapter._id,
                                                                    )
                                                                }
                                                                disabled={
                                                                    deletingId ===
                                                                    chapter._id
                                                                }
                                                                aria-label="Delete chapter"
                                                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                                                            >
                                                                {deletingId ===
                                                                    chapter._id ? (
                                                                    <LoaderCircle
                                                                        size={
                                                                            16
                                                                        }
                                                                        className="animate-spin"
                                                                    />
                                                                ) : (
                                                                    <Trash2
                                                                        size={
                                                                            16
                                                                        }
                                                                    />
                                                                )}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ),
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <ToastContainer
                position="top-right"
                autoClose={3000}
                closeOnClick
                pauseOnHover={false}
            />
        </main>
    );
};

export default Chapters;