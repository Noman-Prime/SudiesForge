"use client";

import axios from "axios";
import Link from "next/link";
import {
    ArrowLeft,
    BookOpen,
    CalendarDays,
    ChevronRight,
    GraduationCap,
    LoaderCircle,
    Pencil,
    Plus,
    Trash2,
    X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useUser } from "@/context/userContext";

const Events = () => {
    const router = useRouter();
    const { user } = useUser();

    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [requestError, setRequestError] = useState("");

    const [editorMode, setEditorMode] = useState(null);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [eventName, setEventName] = useState("");
    const [saving, setSaving] = useState(false);

    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const accountName = user
        ? `${user.firstname || ""} ${user.lastname || ""}`.trim()
        : "Administrator";

    const getEvents = useCallback(async (signal) => {
        try {
            setLoading(true);
            setRequestError("");

            const result = await axios.get("/api/events", {
                withCredentials: true,
                signal,
            });

            if (result.data.success) {
                setEvents(result.data.event || []);
            }
        } catch (error) {
            if (axios.isCancel(error)) {
                return;
            }

            if (error.response?.status === 404) {
                setEvents([]);
                return;
            }

            console.log(error);

            setRequestError(
                error.response?.data?.message ||
                "Unable to load events.",
            );
        } finally {
            if (!signal?.aborted) {
                setLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        if (user === undefined) {
            return;
        }

        if (!user || user.role !== "admin") {
            router.replace("/");
            return;
        }

        const controller = new AbortController();

        getEvents(controller.signal);

        return () => {
            controller.abort();
        };
    }, [getEvents, router, user]);

    const openCreateEditor = () => {
        setSelectedEvent(null);
        setEventName("");
        setEditorMode("create");
    };

    const openEditEditor = (item) => {
        setSelectedEvent(item);
        setEventName(item.name || "");
        setEditorMode("edit");
    };

    const closeEditor = () => {
        if (saving) {
            return;
        }

        setEditorMode(null);
        setSelectedEvent(null);
        setEventName("");
    };

    const submitEvent = async (event) => {
        event.preventDefault();

        const name = eventName.trim();

        if (!name) {
            toast.error("Please enter the event name.");
            return;
        }

        try {
            setSaving(true);

            if (editorMode === "create") {
                const result = await axios.post(
                    "/api/events",
                    { name },
                    {
                        withCredentials: true,
                    },
                );

                if (result.data.success) {
                    const createdEvent =
                        result.data.Event || result.data.event;

                    if (createdEvent) {
                        setEvents((previous) => [
                            createdEvent,
                            ...previous,
                        ]);
                    } else {
                        await getEvents();
                    }

                    toast.success("Event created successfully.");
                }
            }

            if (editorMode === "edit" && selectedEvent) {
                const result = await axios.put(
                    `/api/events/${selectedEvent._id}`,
                    { name },
                    {
                        withCredentials: true,
                    },
                );

                if (result.data.success) {
                    const updatedEvent =
                        result.data.event || result.data.Event;

                    if (updatedEvent) {
                        setEvents((previous) =>
                            previous.map((item) =>
                                item._id === updatedEvent._id
                                    ? updatedEvent
                                    : item,
                            ),
                        );
                    } else {
                        await getEvents();
                    }

                    toast.success("Event updated successfully.");
                }
            }

            setEditorMode(null);
            setSelectedEvent(null);
            setEventName("");
        } catch (error) {
            console.log(error);

            toast.error(
                error.response?.data?.message ||
                "Something went wrong.",
            );
        } finally {
            setSaving(false);
        }
    };

    const confirmDelete = async () => {
        if (!deleteTarget) {
            return;
        }

        try {
            setDeleting(true);

            const result = await axios.delete(
                `/api/events/${deleteTarget._id}`,
                {
                    withCredentials: true,
                },
            );

            if (result.data.success) {
                setEvents((previous) =>
                    previous.filter(
                        (item) => item._id !== deleteTarget._id,
                    ),
                );

                setDeleteTarget(null);
                toast.success("Event deleted successfully.");
            }
        } catch (error) {
            console.log(error);

            toast.error(
                error.response?.data?.message ||
                "Unable to delete the event.",
            );
        } finally {
            setDeleting(false);
        }
    };

    const formatDate = (date) => {
        if (!date) {
            return "Not available";
        }

        return new Intl.DateTimeFormat("en-PK", {
            day: "numeric",
            month: "short",
            year: "numeric",
        }).format(new Date(date));
    };

    if (user === undefined) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <LoaderCircle
                    size={30}
                    className="animate-spin text-blue-700"
                />
            </div>
        );
    }

    if (!user || user.role !== "admin") {
        return null;
    }

    return (
        <main className="min-h-screen bg-[#f5f7fb]">
            <header className="sticky top-0 z-40 border-b border-white/10 bg-[#102a63] text-white shadow-sm">
                <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between gap-3 px-4 sm:h-[72px] sm:px-6 lg:px-8">
                    <Link
                        href="/admin"
                        className="flex min-w-0 items-center gap-2.5 text-white"
                    >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#102a63] sm:h-10 sm:w-10">
                            <GraduationCap size={22} />
                        </div>

                        <div className="min-w-0">
                            <p className="m-0 truncate text-sm font-bold text-white sm:text-base">
                                StudiesForge
                            </p>

                            <p className="m-0 truncate text-[10px] text-blue-200 sm:text-xs">
                                Admin Console
                            </p>
                        </div>
                    </Link>

                    <div className="flex min-w-0 items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-2.5 py-2 backdrop-blur-xl sm:gap-3 sm:px-4">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold uppercase text-[#102a63] sm:h-9 sm:w-9 sm:text-sm">
                            {user.firstname?.charAt(0) || "A"}
                        </div>

                        <div className="hidden min-w-0 sm:block">
                            <p className="m-0 max-w-48 truncate text-sm font-bold text-white">
                                {accountName}
                            </p>

                            <p className="m-0 max-w-48 truncate text-[11px] text-blue-200">
                                {user.email}
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="mx-auto w-full max-w-[1500px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
                <nav className="mb-5 flex items-center gap-2 text-sm">
                    <Link
                        href="/admin"
                        className="flex items-center gap-1.5 font-semibold text-slate-500 transition hover:text-blue-700"
                    >
                        <ArrowLeft size={16} />
                        Dashboard
                    </Link>

                    <ChevronRight
                        size={15}
                        className="text-slate-400"
                    />

                    <span className="font-semibold text-blue-700">
                        Events
                    </span>
                </nav>

                <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
                    <div>
                        <p className="m-0 text-sm font-semibold text-blue-700">
                            Website Material
                        </p>

                        <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
                            Events Management
                        </h1>

                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                            Create and manage educational events such as
                            PPSC, MDCAT and other examinations.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={openCreateEditor}
                        className="flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-800 sm:w-auto"
                    >
                        <Plus size={18} />
                        Create Event
                    </button>
                </section>

                <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-4 py-4 sm:px-6">
                        <h2 className="text-base font-bold text-slate-950">
                            All Events
                        </h2>

                        <p className="mt-1 text-xs text-slate-500">
                            Manage events and their related subjects.
                        </p>
                    </div>

                    {loading && (
                        <div className="flex min-h-64 flex-col items-center justify-center gap-3 px-5 py-12">
                            <LoaderCircle
                                size={30}
                                className="animate-spin text-blue-700"
                            />

                            <p className="text-sm font-medium text-slate-500">
                                Loading events...
                            </p>
                        </div>
                    )}

                    {!loading && requestError && (
                        <div className="flex min-h-64 flex-col items-center justify-center px-5 py-12 text-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
                                <X size={22} />
                            </div>

                            <h3 className="mt-4 text-base font-bold text-slate-900">
                                Unable to load events
                            </h3>

                            <p className="mt-2 max-w-md text-sm text-slate-500">
                                {requestError}
                            </p>

                            <button
                                type="button"
                                onClick={() => getEvents()}
                                className="mt-5 rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-800"
                            >
                                Try Again
                            </button>
                        </div>
                    )}

                    {!loading &&
                        !requestError &&
                        events.length === 0 && (
                            <div className="flex min-h-64 flex-col items-center justify-center px-5 py-12 text-center">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                                    <CalendarDays size={27} />
                                </div>

                                <h3 className="mt-4 text-lg font-bold text-slate-950">
                                    No events created
                                </h3>

                                <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                                    Create your first event to start adding
                                    subjects, chapters, topics and MCQs.
                                </p>

                                <button
                                    type="button"
                                    onClick={openCreateEditor}
                                    className="mt-5 flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-800"
                                >
                                    <Plus size={18} />
                                    Create First Event
                                </button>
                            </div>
                        )}

                    {!loading &&
                        !requestError &&
                        events.length > 0 && (
                            <div className="grid grid-cols-2 gap-3 bg-slate-50/70 p-3 sm:gap-4 sm:p-6 lg:grid-cols-4">
                                {events.map((item) => (
                                    <article
                                        key={item._id}
                                        className="group flex min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md sm:p-5"
                                    >
                                        <div className="flex items-start justify-between gap-2 sm:gap-3">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-sm font-bold uppercase text-blue-700 transition group-hover:bg-blue-700 group-hover:text-white sm:h-12 sm:w-12 sm:rounded-2xl sm:text-base">
                                                {item.name?.charAt(0) || "E"}
                                            </div>

                                            <div className="flex gap-1 sm:gap-1.5">
                                                <button
                                                    type="button"
                                                    aria-label={`Edit ${item.name}`}
                                                    onClick={() =>
                                                        openEditEditor(item)
                                                    }
                                                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 sm:h-9 sm:w-9 sm:rounded-xl"
                                                >
                                                    <Pencil size={14} />
                                                </button>

                                                <button
                                                    type="button"
                                                    aria-label={`Delete ${item.name}`}
                                                    onClick={() =>
                                                        setDeleteTarget(item)
                                                    }
                                                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 sm:h-9 sm:w-9 sm:rounded-xl"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="mt-3 min-w-0 sm:mt-4">
                                            <p className="m-0 truncate text-sm font-bold text-slate-950 sm:text-lg">
                                                {item.name}
                                            </p>

                                            <div className="mt-1.5 flex min-w-0 items-center gap-1.5 text-[10px] font-medium text-slate-500 sm:mt-2 sm:gap-2 sm:text-xs">
                                                <CalendarDays
                                                    size={13}
                                                    className="shrink-0"
                                                />

                                                <span className="truncate">
                                                    {formatDate(item.createdAt)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="my-3 h-px bg-slate-100 sm:my-4" />

                                        <div className="mb-4 hidden items-center justify-between gap-3 sm:flex">
                                            <span className="text-xs font-semibold text-slate-400">
                                                Event ID
                                            </span>

                                            <span className="max-w-[150px] truncate rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-[10px] font-semibold text-slate-600">
                                                {item._id}
                                            </span>
                                        </div>

                                        <Link
                                            href={`/admin/subjects/${item._id}`}
                                            className="mt-auto flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-blue-700 px-2 text-[11px] font-bold text-white transition hover:bg-blue-800 sm:h-11 sm:gap-2 sm:rounded-xl sm:px-4 sm:text-sm"
                                        >
                                            <BookOpen size={15} />

                                            <span className="sm:hidden">
                                                Subjects
                                            </span>

                                            <span className="hidden sm:inline">
                                                Manage Subjects
                                            </span>

                                            <ChevronRight
                                                size={15}
                                                className="hidden sm:block"
                                            />
                                        </Link>
                                    </article>
                                ))}
                            </div>
                        )}
                </section>
            </div>

            {editorMode && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="event-editor-title"
                    className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-950/55 p-0 backdrop-blur-sm sm:items-center sm:p-4"
                >
                    <div className="w-full rounded-t-3xl bg-white shadow-2xl sm:max-w-md sm:rounded-2xl">
                        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
                            <div>
                                <p className="m-0 text-xs font-bold uppercase tracking-wider text-blue-700">
                                    Event Management
                                </p>

                                <h2
                                    id="event-editor-title"
                                    className="mt-1 text-lg font-bold text-slate-950"
                                >
                                    {editorMode === "create"
                                        ? "Create Event"
                                        : "Edit Event"}
                                </h2>
                            </div>

                            <button
                                type="button"
                                aria-label="Close event form"
                                onClick={closeEditor}
                                disabled={saving}
                                className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition hover:bg-slate-200"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form
                            onSubmit={submitEvent}
                            className="px-5 py-5 sm:px-6"
                        >
                            <label
                                htmlFor="event-name"
                                className="text-sm font-bold text-slate-700"
                            >
                                Event name
                            </label>

                            <input
                                id="event-name"
                                type="text"
                                value={eventName}
                                onChange={(event) =>
                                    setEventName(event.target.value)
                                }
                                placeholder="For example: PPSC"
                                autoFocus
                                disabled={saving}
                                className="mt-2 h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                            />

                            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={closeEditor}
                                    disabled={saving}
                                    className="h-11 rounded-xl border border-slate-300 px-5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 sm:w-auto"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 text-sm font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                                >
                                    {saving ? (
                                        <>
                                            <LoaderCircle
                                                size={17}
                                                className="animate-spin"
                                            />
                                            Saving...
                                        </>
                                    ) : editorMode === "create" ? (
                                        <>
                                            <Plus size={17} />
                                            Create Event
                                        </>
                                    ) : (
                                        <>
                                            <Pencil size={16} />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {deleteTarget && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="delete-event-title"
                    className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/55 p-0 backdrop-blur-sm sm:items-center sm:p-4"
                >
                    <div className="w-full rounded-t-3xl bg-white p-5 shadow-2xl sm:max-w-md sm:rounded-2xl sm:p-6">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-red-600">
                            <Trash2 size={22} />
                        </div>

                        <h2
                            id="delete-event-title"
                            className="mt-4 text-lg font-bold text-slate-950"
                        >
                            Delete {deleteTarget.name}?
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-slate-500">
                            This event will be permanently deleted. Make sure
                            it does not contain subjects or other related
                            educational material.
                        </p>

                        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() => setDeleteTarget(null)}
                                disabled={deleting}
                                className="h-11 rounded-xl border border-slate-300 px-5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={confirmDelete}
                                disabled={deleting}
                                className="flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {deleting ? (
                                    <>
                                        <LoaderCircle
                                            size={17}
                                            className="animate-spin"
                                        />
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 size={17} />
                                        Delete Event
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
};

export default Events;