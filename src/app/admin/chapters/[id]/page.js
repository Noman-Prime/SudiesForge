"use client";

import DeleteConfirmationModal from "@/app/admin/components/deleteconfirmation";
import { useUser } from "@/context/userContext";
import axios from "axios";
import Link from "next/link";
import {
    ArrowLeft,
    BookOpenText,
    CalendarDays,
    ChevronDown,
    CircleAlert,
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
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

const toastOptions = {
    autoClose: 3000,
    pauseOnHover: false,
    pauseOnFocusLoss: false,
    closeOnClick: true,
};

const emptyData = {
    event: "",
    subject: "",
    chapterNumber: "",
    chapterName: "",
};

const getDocumentId = (value) => {
    if (!value) {
        return "";
    }

    return typeof value === "object" ? String(value._id || "") : String(value);
};

const ManageChapter = () => {
    const params = useParams();
    const router = useRouter();
    const { user } = useUser();

    const id = Array.isArray(params.id) ? params.id[0] : params.id;

    const [chapter, setChapter] = useState(null);
    const [events, setEvents] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [data, setData] = useState(emptyData);
    const [savedData, setSavedData] = useState(emptyData);
    const [hierarchy, setHierarchy] = useState({
        eventName: "",
        subjectName: "",
    });

    const [loading, setLoading] = useState(true);
    const [loadingSubjects, setLoadingSubjects] = useState(false);
    const [editing, setEditing] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const getSubjectsByEvent = useCallback(async (eventId, showError = true) => {
        if (!eventId) {
            setSubjects([]);
            return [];
        }

        try {
            setLoadingSubjects(true);

            const result = await axios.get(`/api/events/${eventId}/subjects`, {
                withCredentials: true,
            });

            const availableSubjects = result.data?.success
                ? result.data.subjects || []
                : [];

            setSubjects(availableSubjects);

            return availableSubjects;
        } catch (error) {
            console.log(error);
            setSubjects([]);

            if (error.response?.status !== 404 && showError) {
                toast.dismiss();

                toast.error(error.response?.data?.message || "Subjects could not be loaded", toastOptions);
            }

            return [];
        } finally {
            setLoadingSubjects(false);
        }
    }, []);

    const getChapter = useCallback(async (showPageLoader = true) => {
        if (!id) {
            return;
        }

        try {
            if (showPageLoader) {
                setLoading(true);
            }

            setErrorMessage("");

            const chapterResult = await axios.get(`/api/chapter/${id}`, {
                withCredentials: true,
            });

            if (!chapterResult.data?.success || !chapterResult.data?.chapter) {
                setChapter(null);
                setErrorMessage(chapterResult.data?.message || "Chapter could not be loaded");
                return;
            }

            const currentChapter = chapterResult.data.chapter;
            const subjectId = getDocumentId(currentChapter.subject);

            if (!subjectId) {
                setChapter(null);
                setErrorMessage("The subject connected to this chapter is not available");
                return;
            }

            const [eventsResult, subjectResult] = await Promise.all([
                axios.get("/api/events", {
                    withCredentials: true,
                }),
                axios.get(`/api/subject/${subjectId}`, {
                    withCredentials: true,
                }),
            ]);

            if (!subjectResult.data?.success || !subjectResult.data?.subject) {
                setChapter(null);
                setErrorMessage(subjectResult.data?.message || "Chapter subject could not be loaded");
                return;
            }

            const currentSubject = subjectResult.data.subject;
            const eventId = getDocumentId(currentSubject.event);
            const availableEvents = eventsResult.data?.event || eventsResult.data?.events || [];

            setEvents(availableEvents);

            const availableSubjects = await getSubjectsByEvent(eventId, false);

            const chapterData = {
                event: eventId,
                subject: subjectId,
                chapterNumber: currentChapter.chapterNumber ?? "",
                chapterName: currentChapter.chapterName || "",
            };

            const eventName =
                typeof currentSubject.event === "object"
                    ? currentSubject.event?.name || ""
                    : availableEvents.find((event) => String(event._id) === String(eventId))?.name || "";

            const subjectName =
                currentSubject.name ||
                availableSubjects.find((subject) => String(subject._id) === String(subjectId))?.name ||
                "";

            setChapter(currentChapter);
            setData(chapterData);
            setSavedData(chapterData);

            setHierarchy({
                eventName: eventName || "Connected Event",
                subjectName: subjectName || "Connected Subject",
            });
        } catch (error) {
            console.log(error);

            setChapter(null);
            setErrorMessage(error.response?.data?.message || "Chapter could not be loaded");
        } finally {
            setLoading(false);
        }
    }, [getSubjectsByEvent, id]);

    const updateData = (event) => {
        const { name, value } = event.target;

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

    const validateChapter = () => {
        if (!data.event) {
            toast.dismiss();
            toast.error("Please select an event", toastOptions);
            return false;
        }

        if (!data.subject) {
            toast.dismiss();
            toast.error("Please select a subject", toastOptions);
            return false;
        }

        const chapterNumber = Number(data.chapterNumber);

        if (!Number.isInteger(chapterNumber) || chapterNumber < 1) {
            toast.dismiss();
            toast.error("Please enter a valid chapter number", toastOptions);
            return false;
        }

        if (!data.chapterName.trim()) {
            toast.dismiss();
            toast.error("Chapter name is required", toastOptions);
            return false;
        }

        return true;
    };

    const updateChapter = async (event) => {
        event.preventDefault();

        if (!validateChapter() || isUpdating) {
            return;
        }

        try {
            setIsUpdating(true);

            const result = await axios.put(
                `/api/chapter/${id}`,
                {
                    subject: data.subject,
                    chapterNumber: Number(data.chapterNumber),
                    chapterName: data.chapterName.trim(),
                },
                {
                    withCredentials: true,
                },
            );

            if (!result.data?.success) {
                toast.dismiss();
                toast.error(result.data?.message || "Chapter could not be updated", toastOptions);
                return;
            }

            const updatedData = {
                event: data.event,
                subject: data.subject,
                chapterNumber: Number(data.chapterNumber),
                chapterName: data.chapterName.trim(),
            };

            setChapter((previous) => ({
                ...previous,
                ...result.data.chapter,
                chapterNumber: updatedData.chapterNumber,
                chapterName: updatedData.chapterName,
                subject: updatedData.subject,
            }));

            setData(updatedData);
            setSavedData(updatedData);

            setHierarchy({
                eventName:
                    events.find((eventItem) => String(eventItem._id) === String(updatedData.event))?.name ||
                    "Connected Event",
                subjectName:
                    subjects.find((subject) => String(subject._id) === String(updatedData.subject))?.name ||
                    "Connected Subject",
            });

            setEditing(false);

            toast.dismiss();
            toast.success(result.data.message || "Chapter is updated", toastOptions);
        } catch (error) {
            console.log(error);

            toast.dismiss();
            toast.error(error.response?.data?.message || "Chapter could not be updated", toastOptions);
        } finally {
            setIsUpdating(false);
        }
    };

    const updateImage = async (event) => {
        const input = event.target;
        const file = input.files?.[0];

        if (!file || isUploading) {
            return;
        }

        if (!file.type.startsWith("image/")) {
            toast.dismiss();
            toast.error("Only image files are allowed", toastOptions);
            input.value = "";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.dismiss();
            toast.error("Image size cannot be greater than 5MB", toastOptions);
            input.value = "";
            return;
        }

        try {
            setIsUploading(true);

            const result = await axios.put(`/api/chapter/${id}/image`, file, {
                headers: {
                    "Content-Type": file.type,
                },
                withCredentials: true,
            });

            if (!result.data?.success) {
                toast.dismiss();
                toast.error(result.data?.message || "Chapter image could not be updated", toastOptions);
                return;
            }

            let updatedChapter = result.data.chapter;

            if (!updatedChapter) {
                const refreshedResult = await axios.get(`/api/chapter/${id}`, {
                    withCredentials: true,
                });

                updatedChapter = refreshedResult.data?.chapter;
            }

            if (updatedChapter) {
                setChapter((previous) => ({
                    ...previous,
                    ...updatedChapter,
                }));
            }

            toast.dismiss();
            toast.success(result.data.message || "Chapter image is updated", toastOptions);
        } catch (error) {
            console.log(error);

            toast.dismiss();
            toast.error(error.response?.data?.message || "Chapter image could not be updated", toastOptions);
        } finally {
            setIsUploading(false);
            input.value = "";
        }
    };

    const openDeleteModal = () => {
        if (!isDeleting) {
            setShowDeleteModal(true);
        }
    };

    const closeDeleteModal = useCallback(() => {
        if (!isDeleting) {
            setShowDeleteModal(false);
        }
    }, [isDeleting]);

    const deleteChapter = async () => {
        if (!id || isDeleting) {
            return;
        }

        try {
            setIsDeleting(true);

            const result = await axios.delete(`/api/chapter/${id}`, {
                withCredentials: true,
            });

            if (!result.data?.success) {
                toast.dismiss();
                toast.error(result.data?.message || "Chapter could not be deleted", toastOptions);
                return;
            }

            setShowDeleteModal(false);

            toast.dismiss();
            toast.success(result.data.message || "Chapter is deleted", toastOptions);

            router.replace("/admin/chapters");
        } catch (error) {
            console.log(error);

            toast.dismiss();
            toast.error(error.response?.data?.message || "Chapter could not be deleted", toastOptions);
        } finally {
            setIsDeleting(false);
        }
    };

    const cancelUpdate = async () => {
        if (isUpdating) {
            return;
        }

        setData({
            ...savedData,
        });

        setEditing(false);

        if (savedData.event) {
            await getSubjectsByEvent(savedData.event, false);
        }
    };

    const formatDate = (date) => {
        if (!date) {
            return "Not available";
        }

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "Not available";
        }

        return new Intl.DateTimeFormat("en-PK", {
            day: "numeric",
            month: "short",
            year: "numeric",
        }).format(parsedDate);
    };

    useEffect(() => {
        getChapter();
    }, [getChapter]);

    const eventName =
        events.find((event) => String(event._id) === String(savedData.event))?.name ||
        hierarchy.eventName ||
        "Connected Event";

    const subjectName =
        subjects.find((subject) => String(subject._id) === String(savedData.subject))?.name ||
        hierarchy.subjectName ||
        "Connected Subject";

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f5f7fb]">
                <AdminHeader user={user} />
                <ChapterLoading />
            </div>
        );
    }

    if (errorMessage || !chapter) {
        return (
            <div className="min-h-screen bg-[#f5f7fb]">
                <AdminHeader user={user} />
                <ChapterError message={errorMessage || "Chapter is not available"} onRetry={() => getChapter()} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f5f7fb]">
            <AdminHeader user={user} />

            <main className="mx-auto w-full max-w-[1100px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
                <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-2 text-xs sm:text-sm">
                    <Link href="/admin/chapters" className="flex items-center gap-1.5 font-semibold text-slate-500 transition hover:text-blue-700">
                        <ArrowLeft size={16} />
                        Chapters
                    </Link>

                    <span className="text-slate-300">/</span>

                    <span className="max-w-48 truncate font-semibold text-blue-700">
                        {savedData.chapterName || "Manage Chapter"}
                    </span>
                </nav>

                <section className="mb-5 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
                    <div className="min-w-0">
                        <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-blue-600">
                            Chapter management
                        </p>

                        <h1 className="mt-1.5 truncate text-xl font-extrabold tracking-tight text-[#071a4a] sm:text-2xl">
                            Manage {savedData.chapterName}
                        </h1>

                        <p className="mt-1.5 max-w-2xl text-xs leading-5 text-slate-500 sm:text-sm">
                            Update the chapter hierarchy, number, name and chapter image.
                        </p>
                    </div>

                    {!editing && (
                        <button type="button" onClick={() => setEditing(true)} className="flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 sm:w-auto">
                            <Pencil size={16} />
                            Update Chapter
                        </button>
                    )}
                </section>

                <section className="grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:grid-cols-[0.85fr_1.15fr]">
                    <div className="border-b border-slate-200 bg-slate-50/70 p-4 sm:p-6 lg:border-b-0 lg:border-r">
                        <div className="mb-4">
                            <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-blue-600">
                                Chapter image
                            </p>

                            <h2 className="mt-1 text-base font-extrabold text-[#071a4a]">
                                Image and Appearance
                            </h2>
                        </div>

                        <label htmlFor="chapter-image" className={`group relative block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ${isUploading ? "cursor-wait" : "cursor-pointer"}`}>
                            <div className="h-64 sm:h-80 lg:h-96">
                                {chapter.image?.url ? (
                                    <img src={chapter.image.url} alt={savedData.chapterName} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                                ) : (
                                    <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 px-6 text-center">
                                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">
                                            <BookOpenText size={30} />
                                        </div>

                                        <p className="mt-4 text-sm font-extrabold text-[#071a4a]">
                                            No Chapter Image
                                        </p>

                                        <p className="mt-1 text-[10px] leading-5 text-slate-500 sm:text-xs">
                                            Click here to select and upload an image.
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="absolute inset-0 flex items-center justify-center bg-[#071a4a]/65 opacity-100 transition duration-200 sm:opacity-0 sm:group-hover:opacity-100">
                                <div className="flex flex-col items-center text-center text-white">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-md">
                                        {isUploading ? <LoaderCircle size={24} className="animate-spin" /> : <ImagePlus size={24} />}
                                    </div>

                                    <span className="mt-3 text-xs font-bold text-white">
                                        {isUploading
                                            ? "Uploading..."
                                            : chapter.image?.url
                                                ? "Replace Image"
                                                : "Add Image"}
                                    </span>

                                    {!isUploading && (
                                        <span className="mt-1 text-[9px] text-blue-100">
                                            Select an image from your device
                                        </span>
                                    )}
                                </div>
                            </div>
                        </label>

                        <input id="chapter-image" type="file" accept="image/*" onChange={updateImage} disabled={isUploading} className="hidden" />

                        <p className="mt-3 text-[9px] leading-4 text-slate-500">
                            Upload JPG, PNG, WEBP or another supported image format. Maximum size: 5MB.
                        </p>
                    </div>

                    <div className="p-5 sm:p-6 lg:p-8">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                <BookOpenText size={21} />
                            </div>

                            <div className="min-w-0">
                                <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-blue-600">
                                    Chapter details
                                </p>

                                <h2 className="mt-1 truncate text-lg font-extrabold text-[#071a4a]">
                                    {savedData.chapterName}
                                </h2>
                            </div>
                        </div>

                        <div className="mt-6">
                            {editing ? (
                                <form onSubmit={updateChapter}>
                                    <div className="grid gap-5 sm:grid-cols-2">
                                        <SelectField id="event" name="event" label="Event" value={data.event} onChange={updateData} disabled={isUpdating} placeholder="Select an event" options={events.map((event) => ({ value: event._id, label: event.name }))} />

                                        <SelectField id="subject" name="subject" label="Subject" value={data.subject} onChange={updateData} disabled={!data.event || loadingSubjects || isUpdating} loading={loadingSubjects} placeholder={!data.event ? "Select an event first" : loadingSubjects ? "Loading subjects..." : subjects.length === 0 ? "No subjects found" : "Select a subject"} options={subjects.map((subject) => ({ value: subject._id, label: subject.name }))} />
                                    </div>

                                    <div className="mt-5 grid gap-5 sm:grid-cols-[0.4fr_1fr]">
                                        <InputField id="chapterNumber" name="chapterNumber" label="Chapter number" type="number" min="1" value={data.chapterNumber} onChange={updateData} disabled={isUpdating} />

                                        <InputField id="chapterName" name="chapterName" label="Chapter name" type="text" value={data.chapterName} onChange={updateData} disabled={isUpdating} />
                                    </div>

                                    <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                        <button type="button" onClick={cancelUpdate} disabled={isUpdating} className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60">
                                            <X size={16} />
                                            Cancel
                                        </button>

                                        <button type="submit" disabled={isUpdating || loadingSubjects} className="flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-xs font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400">
                                            {isUpdating ? (
                                                <>
                                                    <LoaderCircle size={16} className="animate-spin" />
                                                    Updating...
                                                </>
                                            ) : (
                                                <>
                                                    <Save size={16} />
                                                    Save Changes
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="space-y-3">
                                    <DetailItem label="Chapter name" value={savedData.chapterName} />
                                    <DetailItem label="Chapter number" value={savedData.chapterNumber} />

                                    <div className="grid grid-cols-2 gap-3">
                                        <DetailItem label="Parent event" value={eventName} />
                                        <DetailItem label="Parent subject" value={subjectName} />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <DateItem label="Created" value={formatDate(chapter.createdAt)} />
                                        <DateItem label="Last updated" value={formatDate(chapter.updatedAt)} />
                                    </div>
                                </div>
                            )}
                        </div>

                        {!editing && (
                            <div className="mt-7 border-t border-red-100 pt-5">
                                <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                                    <p className="text-xs font-extrabold text-red-700">
                                        Delete Chapter
                                    </p>

                                    <p className="mt-1 text-[10px] leading-5 text-red-600">
                                        This chapter can only be deleted after all topics connected to it have been removed.
                                    </p>

                                    <button type="button" onClick={openDeleteModal} disabled={isDeleting} className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-xs font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-400 sm:w-auto">
                                        <Trash2 size={15} />
                                        Delete Chapter
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </main>

            <DeleteConfirmationModal open={showDeleteModal} title="Delete Chapter?" description="This will permanently remove the chapter and its uploaded image. Make sure all topics connected to this chapter have already been deleted." itemName={savedData.chapterName} confirmText="Delete Chapter" loading={isDeleting} onCancel={closeDeleteModal} onConfirm={deleteChapter} />
        </div>
    );
};

const SelectField = ({ id, name, label, value, onChange, disabled, loading = false, placeholder, options }) => {
    return (
        <div>
            <label htmlFor={id} className="mb-2 block text-xs font-bold text-slate-700">
                {label}
            </label>

            <div className="relative">
                <select id={id} name={name} value={value} onChange={onChange} disabled={disabled} required className="h-12 w-full appearance-none rounded-xl border border-slate-300 bg-white px-3.5 pr-10 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400">
                    <option value="">{placeholder}</option>

                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>

                {loading ? (
                    <LoaderCircle size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-blue-600" />
                ) : (
                    <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                )}
            </div>
        </div>
    );
};

const InputField = ({ id, name, label, type, min, value, onChange, disabled }) => {
    return (
        <div>
            <label htmlFor={id} className="mb-2 block text-xs font-bold text-slate-700">
                {label}
            </label>

            <input id={id} name={name} type={type} min={min} value={value} onChange={onChange} required disabled={disabled} autoComplete="off" className="h-12 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50" />
        </div>
    );
};

const DetailItem = ({ label, value }) => {
    return (
        <div className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
                {label}
            </p>

            <p className="mt-1 truncate text-sm font-extrabold text-[#071a4a]">
                {value || "Not available"}
            </p>
        </div>
    );
};

const DateItem = ({ label, value }) => {
    return (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <CalendarDays size={17} className="text-blue-600" />

            <p className="mt-2 text-[9px] font-bold uppercase tracking-[0.1em] text-slate-400">
                {label}
            </p>

            <p className="mt-1 text-xs font-bold text-[#071a4a]">
                {value}
            </p>
        </div>
    );
};

const ChapterLoading = () => {
    return (
        <main className="mx-auto w-full max-w-[1100px] px-4 py-7 sm:px-6 lg:px-8">
            <div className="animate-pulse">
                <div className="h-5 w-44 rounded bg-slate-200" />
                <div className="mt-5 h-28 rounded-2xl bg-white" />
                <div className="mt-5 h-[560px] rounded-2xl bg-white" />
            </div>
        </main>
    );
};

const ChapterError = ({ message, onRetry }) => {
    return (
        <main className="mx-auto flex min-h-[calc(100vh-80px)] w-full max-w-[900px] items-center justify-center px-4 py-10">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-sm">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500">
                    <CircleAlert size={23} />
                </div>

                <h1 className="mt-4 text-lg font-extrabold text-[#071a4a]">
                    Chapter could not be opened
                </h1>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                    {message}
                </p>

                <button type="button" onClick={onRetry} className="mt-5 rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-blue-700">
                    Try Again
                </button>
            </div>
        </main>
    );
};

const AdminHeader = ({ user }) => {
    const [showUserMenu, setShowUserMenu] = useState(false);
    const menuRef = useRef(null);

    const accountName = user
        ? `${user.firstname || ""} ${user.lastname || ""}`.trim() || "Administrator"
        : "Administrator";

    useEffect(() => {
        const closeMenu = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowUserMenu(false);
            }
        };

        document.addEventListener("mousedown", closeMenu);

        return () => {
            document.removeEventListener("mousedown", closeMenu);
        };
    }, []);

    return (
        <header className="sticky top-0 z-50 bg-[#102a63] px-3 py-2 text-white shadow-sm sm:px-6">
            <div className="mx-auto flex h-14 w-full max-w-[1500px] items-center gap-2 sm:h-16 sm:gap-4">
                <Link href="/admin" className="flex min-w-0 max-w-[48%] items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-2.5 py-2 text-white shadow-sm backdrop-blur-xl transition hover:bg-white/15 sm:max-w-none sm:gap-3 sm:px-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[#102a63] sm:h-10 sm:w-10">
                        <GraduationCap size={22} />
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

                <div ref={menuRef} className="relative ml-auto min-w-0 max-w-[52%] sm:max-w-none">
                    <button type="button" aria-label="Open admin account menu" aria-haspopup="menu" aria-expanded={showUserMenu} onClick={() => setShowUserMenu((previous) => !previous)} className="flex w-full min-w-0 items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-2.5 py-2 text-left text-white shadow-sm backdrop-blur-xl transition hover:bg-white/15 sm:gap-3 sm:px-4">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white text-xs font-bold uppercase text-[#102a63] sm:h-10 sm:w-10 sm:text-sm">
                            {user?.profileimage?.url ? (
                                <img src={user.profileimage.url} alt={accountName} className="h-full w-full object-cover" />
                            ) : (
                                user?.firstname?.charAt(0) || "A"
                            )}
                        </div>

                        <div className="min-w-0">
                            <span className="block truncate text-[11px] font-bold text-white sm:max-w-52 sm:text-sm">
                                {accountName}
                            </span>

                            <span className="block truncate text-[9px] text-blue-200 sm:max-w-52 sm:text-xs">
                                {user?.email || "Administrator"}
                            </span>
                        </div>

                        <ChevronDown size={15} className={`shrink-0 text-blue-200 transition-transform ${showUserMenu ? "rotate-180" : ""}`} />
                    </button>

                    {showUserMenu && (
                        <div role="menu" className="absolute right-0 top-full z-50 w-52 pt-2 sm:w-56">
                            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-2 text-slate-800 shadow-xl">
                                <Link href="/" role="menuitem" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition hover:bg-blue-50 hover:text-blue-700">
                                    <ExternalLink size={17} />
                                    View Website
                                </Link>

                                <Link href="/admin/settings" role="menuitem" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition hover:bg-blue-50 hover:text-blue-700">
                                    <Settings2 size={17} />
                                    Settings
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default ManageChapter;