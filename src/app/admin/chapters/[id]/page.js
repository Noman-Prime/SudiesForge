"use client";

import { useUser } from "@/context/userContext";
import axios from "axios";
import Link from "next/link";
import {
    ArrowLeft,
    BookOpenText,
    CalendarDays,
    ChevronDown,
    ExternalLink,
    GraduationCap,
    ImagePlus,
    LoaderCircle,
    Pencil,
    Save,
    Settings2,
    Trash2,
    X,
} from "lucide-react";
import {
    useParams,
    useRouter,
} from "next/navigation";
import {
    useEffect,
    useState,
} from "react";
import { toast } from "react-toastify";

const toastOptions = {
    autoClose: 3000,
    pauseOnHover: false,
    pauseOnFocusLoss: false,
    closeOnClick: true,
};

const ManageChapter = () => {
    const { id } = useParams();
    const navigate = useRouter();
    const { user } = useUser();

    const emptyData = {
        event: "",
        subject: "",
        chapterNumber: "",
        chapterName: "",
    };

    const [chapter, setChapter] =
        useState(null);
    const [events, setEvents] =
        useState([]);
    const [subjects, setSubjects] =
        useState([]);

    const [data, setData] =
        useState(emptyData);
    const [savedData, setSavedData] =
        useState(emptyData);

    const [editing, setEditing] =
        useState(false);
    const [loading, setLoading] =
        useState(true);
    const [
        loadingSubjects,
        setLoadingSubjects,
    ] = useState(false);
    const [isUpdating, setIsUpdating] =
        useState(false);
    const [isUploading, setIsUploading] =
        useState(false);
    const [isDeleting, setIsDeleting] =
        useState(false);
    const [
        showUserMenu,
        setShowUserMenu,
    ] = useState(false);

    const accountName = user
        ? `${user.firstname || ""} ${user.lastname || ""}`.trim() ||
        "Administrator"
        : "Administrator";

    const getSubjectsByEvent = async (
        eventId,
    ) => {
        try {
            setLoadingSubjects(true);

            const result = await axios.get(
                `/api/events/${eventId}/subjects`,
                {
                    withCredentials: true,
                },
            );

            if (result.data.success) {
                setSubjects(
                    result.data.subjects || [],
                );
            }
        } catch (error) {
            if (
                error.response?.status === 404
            ) {
                setSubjects([]);
                return;
            }

            console.log(error);

            toast.dismiss();

            toast.error(
                error.response?.data
                    ?.message ||
                "Subjects could not be loaded",
                toastOptions,
            );
        } finally {
            setLoadingSubjects(false);
        }
    };

    const getChapter = async () => {
        try {
            setLoading(true);

            const chapterResult =
                await axios.get(
                    `/api/chapter/${id}`,
                    {
                        withCredentials: true,
                    },
                );

            if (
                !chapterResult.data.success
            ) {
                return;
            }

            const Chapter =
                chapterResult.data.chapter;

            const subjectId =
                Chapter.subject?._id ||
                Chapter.subject;

            const [
                eventsResult,
                subjectResult,
            ] = await Promise.all([
                axios.get("/api/events", {
                    withCredentials: true,
                }),
                axios.get(
                    `/api/subject/${subjectId}`,
                    {
                        withCredentials: true,
                    },
                ),
            ]);

            const Subject =
                subjectResult.data.subject;

            const eventId =
                Subject.event?._id ||
                Subject.event;

            if (
                eventsResult.data.success
            ) {
                setEvents(
                    eventsResult.data.event ||
                    [],
                );
            }

            await getSubjectsByEvent(
                eventId,
            );

            const chapterData = {
                event: String(
                    eventId || "",
                ),
                subject: String(
                    subjectId || "",
                ),
                chapterNumber:
                    Chapter.chapterNumber ??
                    "",
                chapterName:
                    Chapter.chapterName ||
                    "",
            };

            setChapter(Chapter);
            setData(chapterData);
            setSavedData(chapterData);
        } catch (error) {
            console.log(error);

            toast.dismiss();

            toast.error(
                error.response?.data
                    ?.message ||
                "Chapter could not be loaded",
                toastOptions,
            );
        } finally {
            setLoading(false);
        }
    };

    const updateData = (e) => {
        const { name, value } =
            e.target;

        if (name === "event") {
            setData((previous) => ({
                ...previous,
                event: value,
                subject: "",
            }));

            setSubjects([]);

            if (value) {
                getSubjectsByEvent(value);
            }

            return;
        }

        setData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const updateChapter = async (
        e,
    ) => {
        e.preventDefault();

        if (isUpdating) {
            return;
        }

        try {
            setIsUpdating(true);

            const result =
                await axios.put(
                    `/api/chapter/${id}`,
                    {
                        subject:
                            data.subject,
                        chapterNumber:
                            Number(
                                data.chapterNumber,
                            ),
                        chapterName:
                            data.chapterName,
                    },
                    {
                        withCredentials: true,
                    },
                );

            if (result.data.success) {
                setChapter(
                    (previous) => ({
                        ...previous,
                        ...result.data
                            .chapter,
                    }),
                );

                setSavedData({
                    ...data,
                });

                setEditing(false);

                toast.dismiss();

                toast.success(
                    "Chapter is updated",
                    toastOptions,
                );
            }
        } catch (error) {
            console.log(error);

            toast.dismiss();

            toast.error(
                error.response?.data
                    ?.message ||
                "Chapter could not be updated",
                toastOptions,
            );
        } finally {
            setIsUpdating(false);
        }
    };

    const updateImage = async (e) => {
        const input = e.target;
        const file =
            input.files?.[0];

        if (!file || isUploading) {
            return;
        }

        try {
            setIsUploading(true);

            const result =
                await axios.put(
                    `/api/chapter/${id}/image`,
                    file,
                    {
                        headers: {
                            "Content-Type":
                                file.type,
                        },
                        withCredentials: true,
                    },
                );

            if (result.data.success) {
                let updatedChapter =
                    result.data.chapter;

                if (!updatedChapter) {
                    const refreshed =
                        await axios.get(
                            `/api/chapter/${id}`,
                            {
                                withCredentials:
                                    true,
                            },
                        );

                    updatedChapter =
                        refreshed.data.chapter;
                }

                setChapter(
                    (previous) => ({
                        ...previous,
                        ...updatedChapter,
                    }),
                );

                toast.dismiss();

                toast.success(
                    "Chapter image is updated",
                    toastOptions,
                );
            }
        } catch (error) {
            console.log(error);

            toast.dismiss();

            toast.error(
                error.response?.data
                    ?.message ||
                "Chapter image could not be updated",
                toastOptions,
            );
        } finally {
            setIsUploading(false);
            input.value = "";
        }
    };

    const deleteChapter = async () => {
        if (isDeleting) {
            return;
        }

        const confirmed =
            window.confirm(
                `Are you sure you want to delete ${savedData.chapterName}?`,
            );

        if (!confirmed) {
            return;
        }

        try {
            setIsDeleting(true);

            const result =
                await axios.delete(
                    `/api/chapter/${id}`,
                    {
                        withCredentials: true,
                    },
                );

            if (result.data.success) {
                toast.dismiss();

                toast.success(
                    "Chapter is deleted",
                    toastOptions,
                );

                navigate.push(
                    "/admin/chapters",
                );
            }
        } catch (error) {
            console.log(error);

            toast.dismiss();

            toast.error(
                error.response?.data
                    ?.message ||
                "Chapter could not be deleted",
                toastOptions,
            );
        } finally {
            setIsDeleting(false);
        }
    };

    const cancelUpdate = async () => {
        setData({
            ...savedData,
        });

        setEditing(false);

        if (savedData.event) {
            await getSubjectsByEvent(
                savedData.event,
            );
        }
    };

    const formatDate = (date) => {
        if (!date) {
            return "Not available";
        }

        return new Intl.DateTimeFormat(
            "en-PK",
            {
                day: "numeric",
                month: "short",
                year: "numeric",
            },
        ).format(new Date(date));
    };

    useEffect(() => {
        if (id) {
            getChapter();
        }
    }, [id]);

    const eventName =
        events.find(
            (item) =>
                String(item._id) ===
                String(savedData.event),
        )?.name || "Connected Event";

    const subjectName =
        subjects.find(
            (item) =>
                String(item._id) ===
                String(savedData.subject),
        )?.name || "Connected Subject";

    return (
        <div className="min-h-screen bg-[#f5f7fb]">
            <header className="sticky top-0 z-50 bg-[#102a63] px-3 py-2 text-white shadow-sm sm:px-6">
                <div className="mx-auto flex h-14 w-full max-w-[1500px] items-center gap-2 sm:h-16 sm:gap-4">
                    <Link
                        href="/admin"
                        className="flex min-w-0 max-w-[48%] items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-2.5 py-2 text-white shadow-sm backdrop-blur-xl transition hover:bg-white/15 sm:max-w-none sm:gap-3 sm:px-4"
                    >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[#102a63] sm:h-10 sm:w-10">
                            <GraduationCap
                                size={22}
                            />
                        </div>

                        <div className="min-w-0">
                            <span className="block truncate text-[11px] font-bold text-white sm:text-sm">
                                StudiesForge
                            </span>

                            <span className="block truncate text-[9px] text-blue-200 sm:text-xs">
                                Admin Console
                            </span>
                        </div>
                    </Link>

                    <div className="relative ml-auto min-w-0 max-w-[52%] sm:max-w-none">
                        <button
                            type="button"
                            aria-label="Open admin account menu"
                            aria-haspopup="menu"
                            aria-expanded={
                                showUserMenu
                            }
                            onClick={() =>
                                setShowUserMenu(
                                    (previous) =>
                                        !previous,
                                )
                            }
                            className="flex w-full min-w-0 items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-2.5 py-2 text-left text-white shadow-sm backdrop-blur-xl transition hover:bg-white/15 sm:gap-3 sm:px-4"
                        >
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white text-xs font-bold uppercase text-[#102a63] sm:h-10 sm:w-10 sm:text-sm">
                                {user?.profileimage
                                    ?.url ? (
                                    <img
                                        src={
                                            user
                                                .profileimage
                                                .url
                                        }
                                        alt={
                                            accountName
                                        }
                                        className="h-full w-full rounded-full object-cover"
                                    />
                                ) : (
                                    user?.firstname?.charAt(
                                        0,
                                    ) || "A"
                                )}
                            </div>

                            <div className="min-w-0">
                                <span className="block truncate text-[11px] font-bold text-white sm:max-w-52 sm:text-sm">
                                    {accountName}
                                </span>

                                <span className="block truncate text-[9px] text-blue-200 sm:max-w-52 sm:text-xs">
                                    {user?.email ||
                                        "Administrator"}
                                </span>
                            </div>

                            <ChevronDown
                                size={15}
                                className={`shrink-0 text-blue-200 transition-transform duration-200 ${showUserMenu
                                        ? "rotate-180"
                                        : ""
                                    }`}
                            />
                        </button>

                        {showUserMenu && (
                            <div
                                role="menu"
                                className="absolute right-0 top-full z-50 w-52 pt-2 sm:w-56"
                            >
                                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-2 text-slate-800 shadow-xl">
                                    <Link
                                        href="/"
                                        role="menuitem"
                                        onClick={() =>
                                            setShowUserMenu(
                                                false,
                                            )
                                        }
                                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition hover:bg-blue-50 hover:text-blue-700"
                                    >
                                        <ExternalLink
                                            size={17}
                                        />
                                        View Website
                                    </Link>

                                    <Link
                                        href="/admin/settings"
                                        role="menuitem"
                                        onClick={() =>
                                            setShowUserMenu(
                                                false,
                                            )
                                        }
                                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition hover:bg-blue-50 hover:text-blue-700"
                                    >
                                        <Settings2
                                            size={17}
                                        />
                                        Settings
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <main className="mx-auto w-full max-w-[1100px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
                <nav className="mb-5 flex items-center gap-2 text-xs sm:text-sm">
                    <Link
                        href="/admin/chapters"
                        className="flex items-center gap-1.5 font-semibold text-slate-500 transition hover:text-blue-700"
                    >
                        <ArrowLeft size={16} />
                        Chapters
                    </Link>

                    <span className="text-slate-300">
                        /
                    </span>

                    <span className="max-w-48 truncate font-semibold text-blue-700">
                        {savedData.chapterName ||
                            "Manage Chapter"}
                    </span>
                </nav>

                {loading ? (
                    <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white">
                        <LoaderCircle
                            size={32}
                            className="animate-spin text-blue-600"
                        />

                        <p className="mt-3 text-xs font-bold text-slate-500">
                            Loading Chapter...
                        </p>
                    </div>
                ) : (
                    chapter && (
                        <>
                            <section className="mb-5 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-600">
                                        Chapter management
                                    </p>

                                    <h1 className="mt-2 text-xl font-extrabold tracking-tight text-[#071a4a] sm:text-2xl">
                                        Manage{" "}
                                        {
                                            savedData.chapterName
                                        }
                                    </h1>

                                    <p className="mt-2 text-xs leading-5 text-slate-500 sm:text-sm">
                                        Update the Chapter
                                        details, add or
                                        replace its image,
                                        or permanently
                                        delete it.
                                    </p>
                                </div>

                                {!editing && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setEditing(
                                                true,
                                            )
                                        }
                                        className="flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 sm:w-auto"
                                    >
                                        <Pencil
                                            size={16}
                                        />
                                        Update Chapter
                                    </button>
                                )}
                            </section>

                            <section className="grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:grid-cols-[0.85fr_1.15fr]">
                                <div className="border-b border-slate-200 bg-slate-50/70 p-4 sm:p-6 lg:border-b-0 lg:border-r">
                                    <div className="mb-4">
                                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-600">
                                            Chapter image
                                        </p>

                                        <h2 className="mt-1 text-base font-extrabold text-[#071a4a]">
                                            Image and
                                            Appearance
                                        </h2>
                                    </div>

                                    <label
                                        htmlFor="chapter-image"
                                        className={`group relative block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ${isUploading
                                                ? "pointer-events-none cursor-wait opacity-70"
                                                : "cursor-pointer"
                                            }`}
                                    >
                                        <div className="h-64 sm:h-80 lg:h-96">
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
                                                        savedData.chapterName
                                                    }
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 px-6 text-center">
                                                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">
                                                        <BookOpenText
                                                            size={
                                                                30
                                                            }
                                                        />
                                                    </div>

                                                    <p className="mt-4 text-sm font-extrabold text-[#071a4a]">
                                                        No Chapter
                                                        Image
                                                    </p>

                                                    <p className="mt-1 text-[10px] leading-5 text-slate-500 sm:text-xs">
                                                        Click
                                                        here to
                                                        select
                                                        and upload
                                                        an image.
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="absolute inset-0 flex items-center justify-center bg-[#071a4a]/65 opacity-100 transition duration-200 sm:opacity-0 sm:group-hover:opacity-100">
                                            <div className="flex flex-col items-center text-center text-white">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-md">
                                                    {isUploading ? (
                                                        <LoaderCircle
                                                            size={
                                                                24
                                                            }
                                                            className="animate-spin"
                                                        />
                                                    ) : (
                                                        <ImagePlus
                                                            size={
                                                                24
                                                            }
                                                        />
                                                    )}
                                                </div>

                                                <span className="mt-3 text-xs font-bold text-white">
                                                    {isUploading
                                                        ? "Uploading Image..."
                                                        : chapter
                                                            .image
                                                            ?.url
                                                            ? "Replace Image"
                                                            : "Add Image"}
                                                </span>

                                                {!isUploading && (
                                                    <span className="mt-1 text-[9px] text-blue-100">
                                                        Select
                                                        an image
                                                        from
                                                        your
                                                        device
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </label>

                                    <input
                                        id="chapter-image"
                                        type="file"
                                        accept="image/*"
                                        onChange={
                                            updateImage
                                        }
                                        disabled={
                                            isUploading
                                        }
                                        className="hidden"
                                    />
                                </div>

                                <div className="p-5 sm:p-6 lg:p-8">
                                    <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                            <BookOpenText
                                                size={21}
                                            />
                                        </div>

                                        <div className="min-w-0">
                                            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-blue-600">
                                                Chapter
                                                details
                                            </p>

                                            <h2 className="mt-1 truncate text-lg font-extrabold text-[#071a4a]">
                                                {
                                                    savedData.chapterName
                                                }
                                            </h2>
                                        </div>
                                    </div>

                                    <div className="mt-6">
                                        {editing ? (
                                            <form
                                                onSubmit={
                                                    updateChapter
                                                }
                                                className="space-y-5"
                                            >
                                                <div>
                                                    <label
                                                        htmlFor="event"
                                                        className="mb-2 block text-xs font-bold text-slate-700"
                                                    >
                                                        Parent
                                                        event
                                                    </label>

                                                    <select
                                                        id="event"
                                                        name="event"
                                                        value={
                                                            data.event
                                                        }
                                                        onChange={
                                                            updateData
                                                        }
                                                        required
                                                        disabled={
                                                            isUpdating
                                                        }
                                                        className="h-12 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                                                    >
                                                        <option value="">
                                                            Select
                                                            an
                                                            event
                                                        </option>

                                                        {events.map(
                                                            (
                                                                item,
                                                            ) => (
                                                                <option
                                                                    key={
                                                                        item._id
                                                                    }
                                                                    value={
                                                                        item._id
                                                                    }
                                                                >
                                                                    {
                                                                        item.name
                                                                    }
                                                                </option>
                                                            ),
                                                        )}
                                                    </select>
                                                </div>

                                                <div>
                                                    <label
                                                        htmlFor="subject"
                                                        className="mb-2 block text-xs font-bold text-slate-700"
                                                    >
                                                        Parent
                                                        subject
                                                    </label>

                                                    <select
                                                        id="subject"
                                                        name="subject"
                                                        value={
                                                            data.subject
                                                        }
                                                        onChange={
                                                            updateData
                                                        }
                                                        required
                                                        disabled={
                                                            !data.event ||
                                                            loadingSubjects ||
                                                            isUpdating
                                                        }
                                                        className="h-12 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                                                    >
                                                        <option value="">
                                                            {!data.event
                                                                ? "Select an event first"
                                                                : loadingSubjects
                                                                    ? "Loading subjects..."
                                                                    : subjects.length ===
                                                                        0
                                                                        ? "No subjects found"
                                                                        : "Select a subject"}
                                                        </option>

                                                        {subjects.map(
                                                            (
                                                                item,
                                                            ) => (
                                                                <option
                                                                    key={
                                                                        item._id
                                                                    }
                                                                    value={
                                                                        item._id
                                                                    }
                                                                >
                                                                    {
                                                                        item.name
                                                                    }
                                                                </option>
                                                            ),
                                                        )}
                                                    </select>
                                                </div>

                                                <div className="grid gap-5 sm:grid-cols-[0.4fr_1fr]">
                                                    <div>
                                                        <label
                                                            htmlFor="chapterNumber"
                                                            className="mb-2 block text-xs font-bold text-slate-700"
                                                        >
                                                            Chapter
                                                            number
                                                        </label>

                                                        <input
                                                            id="chapterNumber"
                                                            type="number"
                                                            name="chapterNumber"
                                                            value={
                                                                data.chapterNumber
                                                            }
                                                            onChange={
                                                                updateData
                                                            }
                                                            required
                                                            disabled={
                                                                isUpdating
                                                            }
                                                            className="h-12 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label
                                                            htmlFor="chapterName"
                                                            className="mb-2 block text-xs font-bold text-slate-700"
                                                        >
                                                            Chapter
                                                            name
                                                        </label>

                                                        <input
                                                            id="chapterName"
                                                            type="text"
                                                            name="chapterName"
                                                            value={
                                                                data.chapterName
                                                            }
                                                            onChange={
                                                                updateData
                                                            }
                                                            required
                                                            disabled={
                                                                isUpdating
                                                            }
                                                            autoComplete="off"
                                                            className="h-12 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                                    <button
                                                        type="button"
                                                        onClick={
                                                            cancelUpdate
                                                        }
                                                        disabled={
                                                            isUpdating
                                                        }
                                                        className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                                                    >
                                                        <X
                                                            size={
                                                                16
                                                            }
                                                        />
                                                        Cancel
                                                    </button>

                                                    <button
                                                        type="submit"
                                                        disabled={
                                                            isUpdating ||
                                                            loadingSubjects
                                                        }
                                                        className="flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-xs font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                                    >
                                                        {isUpdating ? (
                                                            <>
                                                                <LoaderCircle
                                                                    size={
                                                                        16
                                                                    }
                                                                    className="animate-spin"
                                                                />
                                                                Updating...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Save
                                                                    size={
                                                                        16
                                                                    }
                                                                />
                                                                Save
                                                                Changes
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </form>
                                        ) : (
                                            <div className="space-y-3">
                                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                                    <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
                                                        Chapter
                                                        name
                                                    </p>

                                                    <p className="mt-1 text-sm font-extrabold text-[#071a4a]">
                                                        {
                                                            savedData.chapterName
                                                        }
                                                    </p>
                                                </div>

                                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                                    <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
                                                        Chapter
                                                        number
                                                    </p>

                                                    <p className="mt-1 text-sm font-extrabold text-[#071a4a]">
                                                        {
                                                            savedData.chapterNumber
                                                        }
                                                    </p>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                                        <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
                                                            Parent
                                                            event
                                                        </p>

                                                        <p className="mt-1 truncate text-xs font-extrabold text-[#071a4a] sm:text-sm">
                                                            {
                                                                eventName
                                                            }
                                                        </p>
                                                    </div>

                                                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                                        <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
                                                            Parent
                                                            subject
                                                        </p>

                                                        <p className="mt-1 truncate text-xs font-extrabold text-[#071a4a] sm:text-sm">
                                                            {
                                                                subjectName
                                                            }
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                                        <CalendarDays
                                                            size={
                                                                17
                                                            }
                                                            className="text-blue-600"
                                                        />

                                                        <p className="mt-2 text-[9px] font-bold uppercase tracking-[0.1em] text-slate-400">
                                                            Created
                                                        </p>

                                                        <p className="mt-1 text-xs font-bold text-[#071a4a]">
                                                            {formatDate(
                                                                chapter.createdAt,
                                                            )}
                                                        </p>
                                                    </div>

                                                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                                        <CalendarDays
                                                            size={
                                                                17
                                                            }
                                                            className="text-blue-600"
                                                        />

                                                        <p className="mt-2 text-[9px] font-bold uppercase tracking-[0.1em] text-slate-400">
                                                            Last
                                                            updated
                                                        </p>

                                                        <p className="mt-1 text-xs font-bold text-[#071a4a]">
                                                            {formatDate(
                                                                chapter.updatedAt,
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-7 border-t border-red-100 pt-5">
                                        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                                            <p className="text-xs font-extrabold text-red-700">
                                                Delete
                                                Chapter
                                            </p>

                                            <p className="mt-1 text-[10px] leading-5 text-red-600">
                                                This action
                                                permanently
                                                removes the
                                                Chapter and
                                                its image.
                                            </p>

                                            <button
                                                type="button"
                                                onClick={
                                                    deleteChapter
                                                }
                                                disabled={
                                                    isDeleting
                                                }
                                                className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-xs font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                                            >
                                                {isDeleting ? (
                                                    <>
                                                        <LoaderCircle
                                                            size={
                                                                15
                                                            }
                                                            className="animate-spin"
                                                        />
                                                        Deleting...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Trash2
                                                            size={
                                                                15
                                                            }
                                                        />
                                                        Delete
                                                        Chapter
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </>
                    )
                )}
            </main>
        </div>
    );
};

export default ManageChapter;