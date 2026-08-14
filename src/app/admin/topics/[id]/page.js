"use client";

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
    FileText,
    GraduationCap,
    ImagePlus,
    Layers3,
    LoaderCircle,
    Pencil,
    Plus,
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
    useRef,
    useState,
} from "react";
import { toast } from "react-toastify";

const Topic = () => {
    const { id } = useParams();
    const navigate = useRouter();
    const { user } = useUser();

    const [topic, setTopic] = useState(null);

    const [events, setEvents] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [chapters, setChapters] = useState([]);

    const [selectedEvent, setSelectedEvent] =
        useState("");
    const [selectedSubject, setSelectedSubject] =
        useState("");

    const [data, setData] = useState({
        chapter: "",
        topicNumber: "",
        topicName: "",
        sections: [],
    });

    const [loading, setLoading] =
        useState(true);
    const [loadingSubjects, setLoadingSubjects] =
        useState(false);
    const [loadingChapters, setLoadingChapters] =
        useState(false);
    const [editing, setEditing] =
        useState(false);
    const [updating, setUpdating] =
        useState(false);
    const [uploadingImage, setUploadingImage] =
        useState(false);
    const [deleting, setDeleting] =
        useState(false);
    const [errorMessage, setErrorMessage] =
        useState("");

    const getId = (value) => {
        if (!value) {
            return "";
        }

        if (typeof value === "object") {
            return String(value._id || "");
        }

        return String(value);
    };

    const getPageData = async () => {
        try {
            setLoading(true);
            setErrorMessage("");

            const topicResult = await axios.get(
                `/api/topic/${id}`,
                {
                    withCredentials: true,
                },
            );

            if (!topicResult.data.success) {
                setTopic(null);

                setErrorMessage(
                    topicResult.data.message ||
                    "Topic could not be loaded",
                );

                return;
            }

            const currentTopic =
                topicResult.data.topic;

            const chapterId = getId(
                currentTopic.chapter,
            );

            const chapterResult = await axios.get(
                `/api/chapter/${chapterId}`,
                {
                    withCredentials: true,
                },
            );

            const currentChapter =
                chapterResult.data.chapter;

            const subjectId = getId(
                currentChapter.subject,
            );

            const subjectResult = await axios.get(
                `/api/subject/${subjectId}`,
                {
                    withCredentials: true,
                },
            );

            const currentSubject =
                subjectResult.data.subject;

            const eventId = getId(
                currentSubject.event,
            );

            const [
                eventsResult,
                subjectsResult,
                chaptersResult,
            ] = await Promise.all([
                axios.get("/api/events", {
                    withCredentials: true,
                }),

                axios.get(
                    `/api/events/${eventId}/subjects`,
                    {
                        withCredentials: true,
                    },
                ),

                axios.get(
                    `/api/chapter/subject/${subjectId}`,
                    {
                        withCredentials: true,
                    },
                ),
            ]);

            const sortedChapters = [
                ...(chaptersResult.data.chapters ||
                    []),
            ].sort(
                (
                    firstChapter,
                    secondChapter,
                ) =>
                    Number(
                        firstChapter.chapterNumber,
                    ) -
                    Number(
                        secondChapter.chapterNumber,
                    ),
            );

            setEvents(
                eventsResult.data.event || [],
            );

            setSubjects(
                subjectsResult.data.subjects || [],
            );

            setChapters(sortedChapters);

            setSelectedEvent(eventId);
            setSelectedSubject(subjectId);

            setTopic({
                ...currentTopic,
                chapter: currentChapter,
            });

            setData({
                chapter: chapterId,
                topicNumber:
                    currentTopic.topicNumber ?? "",
                topicName:
                    currentTopic.topicName || "",
                sections:
                    currentTopic.sections?.length > 0
                        ? currentTopic.sections.map(
                            (section) => ({
                                _id:
                                    section._id ||
                                    undefined,
                                subHeading:
                                    section.subHeading ||
                                    "",
                                text:
                                    section.text ||
                                    "",
                            }),
                        )
                        : [
                            {
                                subHeading: "",
                                text: "",
                            },
                        ],
            });
        } catch (error) {
            console.log(error);
            setTopic(null);

            setErrorMessage(
                error.response?.data?.message ||
                "Topic could not be loaded",
            );
        } finally {
            setLoading(false);
        }
    };

    const getSubjects = async (eventId) => {
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
            console.log(error);
            setSubjects([]);

            if (error.response?.status !== 404) {
                toast.error(
                    error.response?.data?.message ||
                    "Subjects could not be loaded",
                    {
                        autoClose: 3000,
                    },
                );
            }
        } finally {
            setLoadingSubjects(false);
        }
    };

    const getChapters = async (
        subjectId,
    ) => {
        try {
            setLoadingChapters(true);

            const result = await axios.get(
                `/api/chapter/subject/${subjectId}`,
                {
                    withCredentials: true,
                },
            );

            if (result.data.success) {
                const sortedChapters = [
                    ...(result.data.chapters || []),
                ].sort(
                    (
                        firstChapter,
                        secondChapter,
                    ) =>
                        Number(
                            firstChapter.chapterNumber,
                        ) -
                        Number(
                            secondChapter.chapterNumber,
                        ),
                );

                setChapters(sortedChapters);
            }
        } catch (error) {
            console.log(error);
            setChapters([]);

            if (error.response?.status !== 404) {
                toast.error(
                    error.response?.data?.message ||
                    "Chapters could not be loaded",
                    {
                        autoClose: 3000,
                    },
                );
            }
        } finally {
            setLoadingChapters(false);
        }
    };

    const selectEvent = (event) => {
        const eventId = event.target.value;

        setSelectedEvent(eventId);
        setSelectedSubject("");

        setSubjects([]);
        setChapters([]);

        setData((previous) => ({
            ...previous,
            chapter: "",
        }));

        if (eventId) {
            getSubjects(eventId);
        }
    };

    const selectSubject = (event) => {
        const subjectId = event.target.value;

        setSelectedSubject(subjectId);
        setChapters([]);

        setData((previous) => ({
            ...previous,
            chapter: "",
        }));

        if (subjectId) {
            getChapters(subjectId);
        }
    };

    const fillTopicData = (event) => {
        const { name, value } = event.target;

        setData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const updateSection = (
        index,
        field,
        value,
    ) => {
        setData((previous) => ({
            ...previous,

            sections: previous.sections.map(
                (section, sectionIndex) =>
                    sectionIndex === index
                        ? {
                            ...section,
                            [field]: value,
                        }
                        : section,
            ),
        }));
    };

    const addSection = () => {
        setData((previous) => ({
            ...previous,

            sections: [
                ...previous.sections,
                {
                    subHeading: "",
                    text: "",
                },
            ],
        }));
    };

    const removeSection = (index) => {
        if (data.sections.length === 1) {
            toast.error(
                "A topic must have at least one section",
                {
                    autoClose: 3000,
                },
            );

            return;
        }

        setData((previous) => ({
            ...previous,

            sections: previous.sections.filter(
                (_, sectionIndex) =>
                    sectionIndex !== index,
            ),
        }));
    };

    const updateTopic = async () => {
        if (!selectedEvent) {
            toast.error(
                "Please select an event",
                {
                    autoClose: 3000,
                },
            );

            return;
        }

        if (!selectedSubject) {
            toast.error(
                "Please select a subject",
                {
                    autoClose: 3000,
                },
            );

            return;
        }

        if (!data.chapter) {
            toast.error(
                "Please select a chapter",
                {
                    autoClose: 3000,
                },
            );

            return;
        }

        if (
            !data.topicNumber ||
            Number(data.topicNumber) < 1
        ) {
            toast.error(
                "Please enter a valid topic number",
                {
                    autoClose: 3000,
                },
            );

            return;
        }

        if (!data.topicName.trim()) {
            toast.error(
                "Topic name is required",
                {
                    autoClose: 3000,
                },
            );

            return;
        }

        const incompleteSection =
            data.sections.some(
                (section) =>
                    !section.subHeading.trim() ||
                    !section.text.trim(),
            );

        if (incompleteSection) {
            toast.error(
                "Complete every topic section",
                {
                    autoClose: 3000,
                },
            );

            return;
        }

        try {
            setUpdating(true);

            const payload = {
                chapter: data.chapter,

                topicNumber: Number(
                    data.topicNumber,
                ),

                topicName:
                    data.topicName.trim(),

                sections: data.sections.map(
                    (section) => ({
                        subHeading:
                            section.subHeading.trim(),
                        text: section.text.trim(),
                    }),
                ),
            };

            const result = await axios.put(
                `/api/topic/${id}`,
                payload,
                {
                    withCredentials: true,
                },
            );

            if (result.data.success) {
                toast.success(
                    result.data.message ||
                    "Topic is updated",
                    {
                        autoClose: 3000,
                    },
                );

                setEditing(false);

                await getPageData();
            }
        } catch (error) {
            console.log(error);

            toast.error(
                error.response?.data?.message ||
                "Topic could not be updated",
                {
                    autoClose: 3000,
                },
            );
        } finally {
            setUpdating(false);
        }
    };

    const updateImage = async (event) => {
        const file =
            event.target.files?.[0];

        if (!file) {
            return;
        }

        if (!file.type.startsWith("image/")) {
            toast.error(
                "Only image files are allowed",
                {
                    autoClose: 3000,
                },
            );

            event.target.value = "";

            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error(
                "Image size cannot be greater than 5MB",
                {
                    autoClose: 3000,
                },
            );

            event.target.value = "";

            return;
        }

        try {
            setUploadingImage(true);

            const result = await axios.put(
                `/api/topic/${id}/image`,
                file,
                {
                    headers: {
                        "Content-Type": file.type,
                    },

                    withCredentials: true,
                },
            );

            if (result.data.success) {
                const refreshedTopic =
                    await axios.get(
                        `/api/topic/${id}`,
                        {
                            withCredentials: true,
                        },
                    );

                if (
                    refreshedTopic.data.success
                ) {
                    setTopic((previous) => ({
                        ...previous,
                        ...refreshedTopic.data
                            .topic,
                    }));
                }

                toast.success(
                    result.data.message ||
                    "Topic image is updated",
                    {
                        autoClose: 3000,
                    },
                );
            }
        } catch (error) {
            console.log(error);

            toast.error(
                error.response?.data?.message ||
                "Topic image could not be updated",
                {
                    autoClose: 3000,
                },
            );
        } finally {
            setUploadingImage(false);
            event.target.value = "";
        }
    };

    const deleteTopic = async () => {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${topic.topicName}"?`,
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeleting(true);

            const result = await axios.delete(
                `/api/topic/${id}`,
                {
                    withCredentials: true,
                },
            );

            if (result.data.success) {
                toast.success(
                    result.data.message ||
                    "Topic is deleted",
                    {
                        autoClose: 3000,
                    },
                );

                navigate.push("/admin/topics");
            }
        } catch (error) {
            console.log(error);

            toast.error(
                error.response?.data?.message ||
                "Topic could not be deleted",
                {
                    autoClose: 3000,
                },
            );
        } finally {
            setDeleting(false);
        }
    };

    const cancelUpdate = async () => {
        setEditing(false);

        await getPageData();
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
            getPageData();
        }
    }, [id]);

    const eventName =
        events.find(
            (event) =>
                String(event._id) ===
                String(selectedEvent),
        )?.name || "Not available";

    const subjectName =
        subjects.find(
            (subject) =>
                String(subject._id) ===
                String(selectedSubject),
        )?.name || "Not available";

    const selectedChapter =
        chapters.find(
            (chapter) =>
                String(chapter._id) ===
                String(data.chapter),
        ) || null;

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f5f7fb]">
                <AdminHeader user={user} />
                <TopicLoading />
            </div>
        );
    }

    if (errorMessage || !topic) {
        return (
            <div className="min-h-screen bg-[#f5f7fb]">
                <AdminHeader user={user} />

                <TopicError
                    message={
                        errorMessage ||
                        "Topic is not available"
                    }
                    onRetry={getPageData}
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f5f7fb]">
            <AdminHeader user={user} />

            <main className="mx-auto w-full max-w-[1200px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
                <nav className="mb-5 flex items-center gap-2 text-xs sm:text-sm">
                    <Link
                        href="/admin/topics"
                        className="flex items-center gap-1.5 font-semibold text-slate-500 transition hover:text-blue-700"
                    >
                        <ArrowLeft size={16} />
                        Topics
                    </Link>

                    <span className="text-slate-300">
                        /
                    </span>

                    <span className="max-w-52 truncate font-semibold text-blue-700">
                        {topic.topicName}
                    </span>
                </nav>

                <section className="mb-5 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
                    <div>
                        <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-blue-600">
                            Topic management
                        </p>

                        <h1 className="mt-1.5 text-xl font-black tracking-tight text-[#071a4a] sm:text-2xl">
                            Manage {topic.topicName}
                        </h1>

                        <p className="mt-1.5 max-w-2xl text-xs leading-5 text-slate-500 sm:text-sm">
                            Update the topic hierarchy,
                            information, content sections and
                            topic image.
                        </p>
                    </div>

                    {!editing && (
                        <button
                            type="button"
                            onClick={() =>
                                setEditing(true)
                            }
                            className="flex h-10 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 sm:w-auto"
                        >
                            <Pencil size={15} />
                            Update Topic
                        </button>
                    )}
                </section>

                <div className="grid items-start gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
                    <div className="space-y-5 lg:sticky lg:top-24">
                        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="border-b border-slate-200 px-4 py-4">
                                <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-blue-600">
                                    Topic image
                                </p>

                                <h2 className="mt-1 text-sm font-extrabold text-[#071a4a]">
                                    Image and appearance
                                </h2>
                            </div>

                            <label
                                htmlFor="topic-image"
                                className={`group relative block overflow-hidden ${uploadingImage
                                        ? "cursor-wait"
                                        : "cursor-pointer"
                                    }`}
                            >
                                <div className="h-64 bg-slate-100 sm:h-72 lg:h-64">
                                    {topic.image?.url ? (
                                        <img
                                            src={
                                                topic.image
                                                    .url
                                            }
                                            alt={
                                                topic.topicName
                                            }
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 px-5 text-center">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                                                <BookOpenText
                                                    size={
                                                        24
                                                    }
                                                />
                                            </div>

                                            <p className="mt-3 text-xs font-extrabold text-[#071a4a]">
                                                No Topic Image
                                            </p>

                                            <p className="mt-1 text-[9px] leading-4 text-slate-500">
                                                Select an image
                                                up to 5MB.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="absolute inset-0 flex items-center justify-center bg-[#071a4a]/65 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
                                    {uploadingImage ? (
                                        <div className="text-center text-white">
                                            <LoaderCircle
                                                size={25}
                                                className="mx-auto animate-spin"
                                            />

                                            <p className="mt-2 text-xs font-bold">
                                                Uploading...
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="text-center text-white">
                                            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-600 shadow-md">
                                                <ImagePlus
                                                    size={
                                                        20
                                                    }
                                                />
                                            </div>

                                            <p className="mt-2 text-xs font-bold">
                                                {topic.image
                                                    ?.url
                                                    ? "Replace Image"
                                                    : "Add Image"}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </label>

                            <input
                                id="topic-image"
                                type="file"
                                accept="image/*"
                                onChange={updateImage}
                                disabled={uploadingImage}
                                className="hidden"
                            />

                            <div className="border-t border-slate-100 p-4">
                                <p className="text-[9px] leading-4 text-slate-500">
                                    Recommended: a clear,
                                    landscape educational image.
                                </p>
                            </div>
                        </section>

                        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="border-b border-slate-200 px-4 py-4">
                                <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-blue-600">
                                    Content hierarchy
                                </p>

                                <h2 className="mt-1 text-sm font-extrabold text-[#071a4a]">
                                    Topic location
                                </h2>
                            </div>

                            <div className="space-y-2.5 p-4">
                                <HierarchyItem
                                    label="Event"
                                    value={eventName}
                                />

                                <HierarchyItem
                                    label="Subject"
                                    value={subjectName}
                                />

                                <HierarchyItem
                                    label="Chapter"
                                    value={
                                        selectedChapter
                                            ? `Chapter ${selectedChapter.chapterNumber}: ${selectedChapter.chapterName}`
                                            : "Not available"
                                    }
                                />
                            </div>
                        </section>
                    </div>

                    <div className="space-y-5">
                        {editing ? (
                            <>
                                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                    <SectionHeader
                                        title="Content hierarchy"
                                        description="Change where this topic belongs."
                                        icon={Layers3}
                                    />

                                    <div className="space-y-4 p-5 sm:p-6">
                                        <SelectField
                                            id="event"
                                            label="Event"
                                            value={
                                                selectedEvent
                                            }
                                            onChange={
                                                selectEvent
                                            }
                                            disabled={
                                                updating
                                            }
                                            placeholder="Select an event"
                                            options={events.map(
                                                (
                                                    event,
                                                ) => ({
                                                    value:
                                                        event._id,
                                                    label:
                                                        event.name,
                                                }),
                                            )}
                                        />

                                        <SelectField
                                            id="subject"
                                            label="Subject"
                                            value={
                                                selectedSubject
                                            }
                                            onChange={
                                                selectSubject
                                            }
                                            disabled={
                                                !selectedEvent ||
                                                loadingSubjects ||
                                                updating
                                            }
                                            loading={
                                                loadingSubjects
                                            }
                                            placeholder={
                                                !selectedEvent
                                                    ? "Select an event first"
                                                    : loadingSubjects
                                                        ? "Loading subjects..."
                                                        : subjects.length ===
                                                            0
                                                            ? "No subjects available"
                                                            : "Select a subject"
                                            }
                                            options={subjects.map(
                                                (
                                                    subject,
                                                ) => ({
                                                    value:
                                                        subject._id,
                                                    label:
                                                        subject.name,
                                                }),
                                            )}
                                        />

                                        <SelectField
                                            id="chapter"
                                            name="chapter"
                                            label="Chapter"
                                            value={
                                                data.chapter
                                            }
                                            onChange={
                                                fillTopicData
                                            }
                                            disabled={
                                                !selectedSubject ||
                                                loadingChapters ||
                                                updating
                                            }
                                            loading={
                                                loadingChapters
                                            }
                                            placeholder={
                                                !selectedSubject
                                                    ? "Select a subject first"
                                                    : loadingChapters
                                                        ? "Loading chapters..."
                                                        : chapters.length ===
                                                            0
                                                            ? "No chapters available"
                                                            : "Select a chapter"
                                            }
                                            options={chapters.map(
                                                (
                                                    chapter,
                                                ) => ({
                                                    value:
                                                        chapter._id,
                                                    label: `Chapter ${chapter.chapterNumber}: ${chapter.chapterName}`,
                                                }),
                                            )}
                                        />
                                    </div>
                                </section>

                                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                    <SectionHeader
                                        title="Topic information"
                                        description="Update the topic number and name."
                                        icon={
                                            BookOpenText
                                        }
                                    />

                                    <div className="grid gap-4 p-5 sm:grid-cols-[170px_minmax(0,1fr)] sm:p-6">
                                        <InputField
                                            id="topicNumber"
                                            name="topicNumber"
                                            label="Topic number"
                                            type="number"
                                            min="1"
                                            value={
                                                data.topicNumber
                                            }
                                            onChange={
                                                fillTopicData
                                            }
                                            disabled={
                                                updating
                                            }
                                            placeholder="For example: 1"
                                        />

                                        <InputField
                                            id="topicName"
                                            name="topicName"
                                            label="Topic name"
                                            type="text"
                                            value={
                                                data.topicName
                                            }
                                            onChange={
                                                fillTopicData
                                            }
                                            disabled={
                                                updating
                                            }
                                            placeholder="Enter topic name"
                                        />
                                    </div>
                                </section>

                                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                    <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                                <FileText
                                                    size={
                                                        18
                                                    }
                                                />
                                            </div>

                                            <div>
                                                <h2 className="text-base font-extrabold text-[#071a4a]">
                                                    Topic
                                                    sections
                                                </h2>

                                                <p className="mt-1 text-[10px] leading-4 text-slate-500 sm:text-xs">
                                                    Update,
                                                    add or
                                                    remove
                                                    content
                                                    sections.
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={
                                                addSection
                                            }
                                            disabled={
                                                updating
                                            }
                                            className="flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 text-[10px] font-bold text-blue-700 transition hover:bg-blue-100 disabled:opacity-60 sm:w-auto"
                                        >
                                            <Plus
                                                size={
                                                    14
                                                }
                                            />
                                            Add Section
                                        </button>
                                    </div>

                                    <div className="space-y-4 bg-slate-50/70 p-4 sm:p-5">
                                        {data.sections.map(
                                            (
                                                section,
                                                index,
                                            ) => (
                                                <SectionEditor
                                                    key={
                                                        section._id ||
                                                        index
                                                    }
                                                    section={
                                                        section
                                                    }
                                                    index={
                                                        index
                                                    }
                                                    updateSection={
                                                        updateSection
                                                    }
                                                    removeSection={
                                                        removeSection
                                                    }
                                                    disabled={
                                                        updating
                                                    }
                                                    canRemove={
                                                        data
                                                            .sections
                                                            .length >
                                                        1
                                                    }
                                                />
                                            ),
                                        )}

                                        <button
                                            type="button"
                                            onClick={
                                                addSection
                                            }
                                            disabled={
                                                updating
                                            }
                                            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-blue-300 bg-blue-50/50 px-4 py-3 text-xs font-bold text-blue-700 transition hover:bg-blue-50 disabled:opacity-60"
                                        >
                                            <Plus
                                                size={16}
                                            />
                                            Add another section
                                        </button>
                                    </div>
                                </section>

                                <section className="flex flex-col-reverse gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:justify-end sm:p-5">
                                    <button
                                        type="button"
                                        onClick={
                                            cancelUpdate
                                        }
                                        disabled={
                                            updating
                                        }
                                        className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
                                    >
                                        <X size={15} />
                                        Cancel
                                    </button>

                                    <button
                                        type="button"
                                        onClick={
                                            updateTopic
                                        }
                                        disabled={
                                            updating
                                        }
                                        className="flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-xs font-bold text-white transition hover:bg-blue-700 disabled:bg-blue-400"
                                    >
                                        {updating ? (
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
                                                Save Changes
                                            </>
                                        )}
                                    </button>
                                </section>
                            </>
                        ) : (
                            <>
                                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                    <SectionHeader
                                        title="Topic information"
                                        description="Current topic details and hierarchy."
                                        icon={
                                            BookOpenText
                                        }
                                    />

                                    <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-6">
                                        <DetailCard
                                            label="Topic number"
                                            value={`Topic ${topic.topicNumber}`}
                                        />

                                        <DetailCard
                                            label="Topic name"
                                            value={
                                                topic.topicName
                                            }
                                        />

                                        <DetailCard
                                            label="Created"
                                            value={formatDate(
                                                topic.createdAt,
                                            )}
                                            icon={
                                                CalendarDays
                                            }
                                        />

                                        <DetailCard
                                            label="Last updated"
                                            value={formatDate(
                                                topic.updatedAt,
                                            )}
                                            icon={
                                                CalendarDays
                                            }
                                        />
                                    </div>
                                </section>

                                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                    <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4 sm:px-6">
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                                <FileText
                                                    size={
                                                        18
                                                    }
                                                />
                                            </div>

                                            <div>
                                                <h2 className="text-base font-extrabold text-[#071a4a]">
                                                    Content
                                                    sections
                                                </h2>

                                                <p className="mt-1 text-[10px] text-slate-500 sm:text-xs">
                                                    Topic
                                                    explanation
                                                    organized
                                                    under
                                                    subheadings.
                                                </p>
                                            </div>
                                        </div>

                                        <span className="shrink-0 rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-extrabold text-blue-700">
                                            {
                                                topic
                                                    .sections
                                                    ?.length
                                            }{" "}
                                            sections
                                        </span>
                                    </div>

                                    <div className="space-y-3 bg-slate-50/70 p-4 sm:p-5">
                                        {topic.sections?.map(
                                            (
                                                section,
                                                index,
                                            ) => (
                                                <article
                                                    key={
                                                        section._id ||
                                                        index
                                                    }
                                                    className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <span className="flex h-7 min-w-7 shrink-0 items-center justify-center rounded-lg bg-blue-600 px-2 text-[10px] font-bold text-white">
                                                            {index +
                                                                1}
                                                        </span>

                                                        <div className="min-w-0 flex-1">
                                                            <h3 className="text-sm font-extrabold text-[#071a4a]">
                                                                {
                                                                    section.subHeading
                                                                }
                                                            </h3>

                                                            <p className="mt-2 whitespace-pre-line text-xs leading-6 text-slate-600 sm:text-sm">
                                                                {
                                                                    section.text
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>
                                                </article>
                                            ),
                                        )}
                                    </div>
                                </section>

                                <section className="rounded-2xl border border-red-200 bg-red-50 p-5 shadow-sm">
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <h2 className="text-sm font-extrabold text-red-700">
                                                Delete Topic
                                            </h2>

                                            <p className="mt-1 text-[10px] leading-5 text-red-600 sm:text-xs">
                                                This action
                                                permanently
                                                removes the
                                                topic, its
                                                sections and
                                                image.
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={
                                                deleteTopic
                                            }
                                            disabled={
                                                deleting
                                            }
                                            className="flex h-10 w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-xs font-bold text-white transition hover:bg-red-700 disabled:bg-red-400 sm:w-auto"
                                        >
                                            {deleting ? (
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
                                                    Topic
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </section>
                            </>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

const HierarchyItem = ({
    label,
    value,
}) => {
    return (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-[8px] font-bold uppercase tracking-[0.11em] text-slate-400">
                {label}
            </p>

            <p className="mt-1 truncate text-xs font-extrabold text-[#071a4a]">
                {value}
            </p>
        </div>
    );
};

const SectionHeader = ({
    title,
    description,
    icon: Icon,
}) => {
    return (
        <div className="flex items-start gap-3 border-b border-slate-200 px-5 py-4 sm:px-6">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Icon size={18} />
            </div>

            <div>
                <h2 className="text-base font-extrabold text-[#071a4a]">
                    {title}
                </h2>

                <p className="mt-1 text-[10px] leading-4 text-slate-500 sm:text-xs">
                    {description}
                </p>
            </div>
        </div>
    );
};

const SelectField = ({
    id,
    name,
    label,
    value,
    onChange,
    disabled,
    loading,
    placeholder,
    options,
}) => {
    return (
        <div>
            <label
                htmlFor={id}
                className="mb-2 block text-xs font-bold text-slate-700"
            >
                {label}
            </label>

            <div className="relative">
                <select
                    id={id}
                    name={name || id}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    className="h-11 w-full appearance-none rounded-xl border border-slate-300 bg-white px-3.5 pr-10 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                >
                    <option value="">
                        {placeholder}
                    </option>

                    {options.map((option) => (
                        <option
                            key={option.value}
                            value={option.value}
                        >
                            {option.label}
                        </option>
                    ))}
                </select>

                {loading ? (
                    <LoaderCircle
                        size={16}
                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-blue-600"
                    />
                ) : (
                    <ChevronDown
                        size={16}
                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                )}
            </div>
        </div>
    );
};

const InputField = ({
    id,
    name,
    label,
    type,
    min,
    value,
    onChange,
    disabled,
    placeholder,
}) => {
    return (
        <div>
            <label
                htmlFor={id}
                className="mb-2 block text-xs font-bold text-slate-700"
            >
                {label}
            </label>

            <input
                id={id}
                name={name}
                type={type}
                min={min}
                value={value}
                onChange={onChange}
                disabled={disabled}
                placeholder={placeholder}
                className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
            />
        </div>
    );
};

const SectionEditor = ({
    section,
    index,
    updateSection,
    removeSection,
    disabled,
    canRemove,
}) => {
    return (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <div className="flex items-center gap-2">
                    <span className="flex h-7 min-w-7 items-center justify-center rounded-lg bg-blue-600 px-2 text-[10px] font-bold text-white">
                        {index + 1}
                    </span>

                    <p className="text-xs font-extrabold text-[#071a4a]">
                        Section {index + 1}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() =>
                        removeSection(index)
                    }
                    disabled={
                        disabled || !canRemove
                    }
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:text-slate-300"
                >
                    <Trash2 size={15} />
                </button>
            </div>

            <div className="space-y-4 p-4">
                <InputField
                    id={`subHeading-${index}`}
                    label="Subheading"
                    type="text"
                    value={section.subHeading}
                    onChange={(event) =>
                        updateSection(
                            index,
                            "subHeading",
                            event.target.value,
                        )
                    }
                    disabled={disabled}
                    placeholder="Enter subheading"
                />

                <div>
                    <div className="mb-2 flex items-center justify-between gap-3">
                        <label
                            htmlFor={`text-${index}`}
                            className="text-xs font-bold text-slate-700"
                        >
                            Explanation
                        </label>

                        <span className="text-[9px] font-semibold text-slate-400">
                            {section.text.length}{" "}
                            characters
                        </span>
                    </div>

                    <textarea
                        id={`text-${index}`}
                        value={section.text}
                        onChange={(event) =>
                            updateSection(
                                index,
                                "text",
                                event.target.value,
                            )
                        }
                        disabled={disabled}
                        rows={6}
                        placeholder="Write section explanation..."
                        className="w-full resize-y rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
                    />
                </div>
            </div>
        </div>
    );
};

const DetailCard = ({
    label,
    value,
    icon: Icon,
}) => {
    return (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            {Icon && (
                <Icon
                    size={16}
                    className="mb-2 text-blue-600"
                />
            )}

            <p className="text-[8px] font-bold uppercase tracking-[0.11em] text-slate-400">
                {label}
            </p>

            <p className="mt-1 text-xs font-extrabold text-[#071a4a] sm:text-sm">
                {value}
            </p>
        </div>
    );
};

const TopicLoading = () => {
    return (
        <main className="mx-auto w-full max-w-[1200px] px-4 py-7 sm:px-6 lg:px-8">
            <div className="animate-pulse">
                <div className="h-5 w-44 rounded bg-slate-200" />

                <div className="mt-5 h-28 rounded-2xl bg-white" />

                <div className="mt-5 grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
                    <div className="h-96 rounded-2xl bg-white" />

                    <div className="space-y-5">
                        <div className="h-64 rounded-2xl bg-white" />

                        <div className="h-80 rounded-2xl bg-white" />
                    </div>
                </div>
            </div>
        </main>
    );
};

const TopicError = ({
    message,
    onRetry,
}) => {
    return (
        <main className="mx-auto flex min-h-[calc(100vh-80px)] w-full max-w-[1000px] items-center justify-center px-4 py-10">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-sm">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500">
                    <CircleAlert size={23} />
                </div>

                <h1 className="mt-4 text-lg font-black text-[#071a4a]">
                    Topic could not be opened
                </h1>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                    {message}
                </p>

                <button
                    type="button"
                    onClick={onRetry}
                    className="mt-5 rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-blue-700"
                >
                    Try again
                </button>
            </div>
        </main>
    );
};

const AdminHeader = ({ user }) => {
    const [showUserMenu, setShowUserMenu] =
        useState(false);

    const menuRef = useRef(null);

    const accountName = user
        ? `${user.firstname || ""} ${user.lastname || ""
            }`.trim() || "Administrator"
        : "Administrator";

    useEffect(() => {
        const closeMenu = (event) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(
                    event.target,
                )
            ) {
                setShowUserMenu(false);
            }
        };

        document.addEventListener(
            "mousedown",
            closeMenu,
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                closeMenu,
            );
        };
    }, []);

    return (
        <header className="sticky top-0 z-50 bg-[#102a63] px-3 py-2 text-white shadow-sm sm:px-6">
            <div className="mx-auto flex h-14 w-full max-w-[1500px] items-center gap-2 sm:h-16 sm:gap-4">
                <Link
                    href="/admin"
                    className="flex min-w-0 max-w-[48%] items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-2.5 py-2 text-white shadow-sm backdrop-blur-xl transition hover:bg-white/15 sm:max-w-none sm:gap-3 sm:px-4"
                >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[#102a63] sm:h-10 sm:w-10">
                        <GraduationCap size={21} />
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

                <div
                    ref={menuRef}
                    className="relative ml-auto min-w-0 max-w-[52%] sm:max-w-none"
                >
                    <button
                        type="button"
                        aria-label="Open admin account menu"
                        aria-haspopup="menu"
                        aria-expanded={showUserMenu}
                        onClick={() =>
                            setShowUserMenu(
                                (previous) =>
                                    !previous,
                            )
                        }
                        className="flex w-full min-w-0 items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-2.5 py-2 text-left text-white shadow-sm backdrop-blur-xl transition hover:bg-white/15 sm:gap-3 sm:px-4"
                    >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white text-xs font-bold uppercase text-[#102a63] sm:h-10 sm:w-10 sm:text-sm">
                            {user?.profileimage?.url ? (
                                <img
                                    src={
                                        user
                                            .profileimage
                                            .url
                                    }
                                    alt={accountName}
                                    className="h-full w-full object-cover"
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
                            className={`shrink-0 text-blue-200 transition-transform ${showUserMenu
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
    );
};

export default Topic;