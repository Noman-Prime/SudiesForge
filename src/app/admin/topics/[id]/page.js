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
    Table2,
    PlusCircle,
    MinusCircle,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

const emptySection = {
    subHeading: "",
    text: "",
};

const emptyTable = {
    headers: [],
    rows: [],
};

const getDocumentId = (value) => {
    if (!value) {
        return "";
    }

    return typeof value === "object"
        ? String(value._id || "")
        : String(value);
};

const sortChapters = (chapters = []) => {
    return [...chapters].sort(
        (first, second) =>
            Number(first.chapterNumber) - Number(second.chapterNumber),
    );
};

/*
|--------------------------------------------------------------------------
| Table Helpers
|--------------------------------------------------------------------------
*/

const normalizeTable = (table) => {
    if (!table || typeof table !== "object") {
        return null;
    }

    const headers = Array.isArray(table.headers)
        ? table.headers.map((header) => String(header ?? ""))
        : [];

    const rows = Array.isArray(table.rows)
        ? table.rows.map((row) => {
            if (!Array.isArray(row)) {
                return [];
            }

            return row.map((cell) => String(cell ?? ""));
        })
        : [];

    if (!headers.length && !rows.length) {
        return null;
    }

    const columnCount = Math.max(
        headers.length,
        ...rows.map((row) => row.length),
        0,
    );

    const normalizedHeaders = Array.from(
        { length: columnCount },
        (_, index) => headers[index] || `Column ${index + 1}`,
    );

    const normalizedRows = rows.map((row) =>
        Array.from(
            { length: columnCount },
            (_, index) => row[index] ?? "",
        ),
    );

    return {
        headers: normalizedHeaders,
        rows: normalizedRows,
    };
};

const createEmptyTable = () => {
    return {
        headers: ["Column 1", "Column 2"],
        rows: [["", ""]],
    };
};

/*
|--------------------------------------------------------------------------
| Topic Page
|--------------------------------------------------------------------------
*/

const TopicPage = () => {
    const params = useParams();
    const router = useRouter();
    const { user } = useUser();

    const id = Array.isArray(params.id) ? params.id[0] : params.id;

    const [topic, setTopic] = useState(null);
    const [events, setEvents] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [chapters, setChapters] = useState([]);

    const [selectedEvent, setSelectedEvent] = useState("");
    const [selectedSubject, setSelectedSubject] = useState("");

    const [hierarchy, setHierarchy] = useState({
        eventName: "",
        subjectName: "",
        chapterName: "",
    });

    const [data, setData] = useState({
        chapter: "",
        topicNumber: "",
        topicName: "",
        sections: [{ ...emptySection }],
        table: null,
    });

    const [loading, setLoading] = useState(true);
    const [loadingSubjects, setLoadingSubjects] = useState(false);
    const [loadingChapters, setLoadingChapters] = useState(false);
    const [editing, setEditing] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    /*
    |--------------------------------------------------------------------------
    | Load Topic
    |--------------------------------------------------------------------------
    */

    const getPageData = useCallback(
        async (showPageLoader = true) => {
            if (!id) {
                return;
            }

            try {
                if (showPageLoader) {
                    setLoading(true);
                }

                setErrorMessage("");

                const topicResult = await axios.get(`/api/topic/${id}`, {
                    withCredentials: true,
                });

                if (
                    !topicResult.data?.success ||
                    !topicResult.data?.topic
                ) {
                    setTopic(null);
                    setErrorMessage(
                        topicResult.data?.message ||
                        "Topic could not be loaded",
                    );
                    return;
                }

                const currentTopic = topicResult.data.topic;

                const chapterId = getDocumentId(currentTopic.chapter);

                if (!chapterId) {
                    setTopic(null);
                    setErrorMessage(
                        "The chapter connected to this topic is not available",
                    );
                    return;
                }

                const chapterResult = await axios.get(
                    `/api/chapter/${chapterId}`,
                    {
                        withCredentials: true,
                    },
                );

                if (
                    !chapterResult.data?.success ||
                    !chapterResult.data?.chapter
                ) {
                    setTopic(null);
                    setErrorMessage(
                        chapterResult.data?.message ||
                        "Topic chapter could not be loaded",
                    );
                    return;
                }

                const currentChapter = chapterResult.data.chapter;

                const subjectId = getDocumentId(currentChapter.subject);

                if (!subjectId) {
                    setTopic(null);
                    setErrorMessage(
                        "The subject connected to this topic is not available",
                    );
                    return;
                }

                const subjectResult = await axios.get(
                    `/api/subject/${subjectId}`,
                    {
                        withCredentials: true,
                    },
                );

                if (
                    !subjectResult.data?.success ||
                    !subjectResult.data?.subject
                ) {
                    setTopic(null);
                    setErrorMessage(
                        subjectResult.data?.message ||
                        "Topic subject could not be loaded",
                    );
                    return;
                }

                const currentSubject = subjectResult.data.subject;

                const eventId = getDocumentId(currentSubject.event);

                if (!eventId) {
                    setTopic(null);
                    setErrorMessage(
                        "The event connected to this topic is not available",
                    );
                    return;
                }

                const [
                    eventsResult,
                    subjectsResult,
                    chaptersResult,
                ] = await Promise.allSettled([
                    axios.get("/api/events", {
                        withCredentials: true,
                    }),

                    axios.get(`/api/events/${eventId}/subjects`, {
                        withCredentials: true,
                    }),

                    axios.get(`/api/chapter/subject/${subjectId}`, {
                        withCredentials: true,
                    }),
                ]);

                const eventData =
                    eventsResult.status === "fulfilled"
                        ? eventsResult.value.data
                        : null;

                const subjectData =
                    subjectsResult.status === "fulfilled"
                        ? subjectsResult.value.data
                        : null;

                const chapterData =
                    chaptersResult.status === "fulfilled"
                        ? chaptersResult.value.data
                        : null;

                const availableEvents =
                    eventData?.event ||
                    eventData?.events ||
                    [];

                const availableSubjects =
                    subjectData?.subjects || [];

                const availableChapters = sortChapters(
                    chapterData?.chapters || [],
                );

                const eventName =
                    typeof currentSubject.event === "object"
                        ? currentSubject.event?.name || ""
                        : availableEvents.find(
                            (event) =>
                                String(event._id) ===
                                String(eventId),
                        )?.name || "";

                /*
                |--------------------------------------------------------------------------
                | Normalize Incoming Table
                |--------------------------------------------------------------------------
                */

                const incomingTable = normalizeTable(
                    currentTopic.table,
                );

                setEvents(availableEvents);
                setSubjects(availableSubjects);
                setChapters(availableChapters);

                setSelectedEvent(eventId);
                setSelectedSubject(subjectId);

                setHierarchy({
                    eventName: eventName || "Not available",
                    subjectName:
                        currentSubject.name || "Not available",
                    chapterName:
                        currentChapter.chapterName ||
                        "Not available",
                });

                setTopic({
                    ...currentTopic,
                    chapter: currentChapter,
                    table: incomingTable,
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
                                        section.text || "",
                                }),
                            )
                            : [{ ...emptySection }],

                    table: incomingTable,
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
        },
        [id],
    );

    /*
    |--------------------------------------------------------------------------
    | Subjects
    |--------------------------------------------------------------------------
    */

    const getSubjects = async (eventId) => {
        try {
            setLoadingSubjects(true);

            const result = await axios.get(
                `/api/events/${eventId}/subjects`,
                {
                    withCredentials: true,
                },
            );

            setSubjects(
                result.data?.success
                    ? result.data.subjects || []
                    : [],
            );
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

    /*
    |--------------------------------------------------------------------------
    | Chapters
    |--------------------------------------------------------------------------
    */

    const getChapters = async (subjectId) => {
        try {
            setLoadingChapters(true);

            const result = await axios.get(
                `/api/chapter/subject/${subjectId}`,
                {
                    withCredentials: true,
                },
            );

            setChapters(
                result.data?.success
                    ? sortChapters(
                        result.data.chapters || [],
                    )
                    : [],
            );
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

    /*
    |--------------------------------------------------------------------------
    | Hierarchy Selectors
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | Topic Fields
    |--------------------------------------------------------------------------
    */

    const fillTopicData = (event) => {
        const { name, value } = event.target;

        setData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    /*
    |--------------------------------------------------------------------------
    | Sections
    |--------------------------------------------------------------------------
    */

    const updateSection = (index, field, value) => {
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
                { ...emptySection },
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

    /*
    |--------------------------------------------------------------------------
    | Table
    |--------------------------------------------------------------------------
    */

    const hasTable = Boolean(data.table);

    const enableTable = () => {
        setData((previous) => ({
            ...previous,
            table: createEmptyTable(),
        }));
    };

    const removeTable = () => {
        setData((previous) => ({
            ...previous,
            table: null,
        }));
    };

    const updateTableHeader = (columnIndex, value) => {
        setData((previous) => {
            if (!previous.table) {
                return previous;
            }

            const headers = [
                ...previous.table.headers,
            ];

            headers[columnIndex] = value;

            return {
                ...previous,
                table: {
                    ...previous.table,
                    headers,
                },
            };
        });
    };

    const updateTableCell = (
        rowIndex,
        columnIndex,
        value,
    ) => {
        setData((previous) => {
            if (!previous.table) {
                return previous;
            }

            const rows = previous.table.rows.map(
                (row, currentRowIndex) => {
                    if (currentRowIndex !== rowIndex) {
                        return row;
                    }

                    const updatedRow = [...row];

                    updatedRow[columnIndex] = value;

                    return updatedRow;
                },
            );

            return {
                ...previous,

                table: {
                    ...previous.table,
                    rows,
                },
            };
        });
    };

    const addTableColumn = () => {
        setData((previous) => {
            if (!previous.table) {
                return previous;
            }

            const columnNumber =
                previous.table.headers.length + 1;

            return {
                ...previous,

                table: {
                    headers: [
                        ...previous.table.headers,
                        `Column ${columnNumber}`,
                    ],

                    rows: previous.table.rows.map(
                        (row) => [
                            ...row,
                            "",
                        ],
                    ),
                },
            };
        });
    };

    const removeTableColumn = (columnIndex) => {
        if (!data.table) {
            return;
        }

        if (data.table.headers.length <= 1) {
            toast.error(
                "A table must have at least one column",
                {
                    autoClose: 3000,
                },
            );

            return;
        }

        setData((previous) => ({
            ...previous,

            table: {
                headers:
                    previous.table.headers.filter(
                        (_, index) =>
                            index !== columnIndex,
                    ),

                rows:
                    previous.table.rows.map((row) =>
                        row.filter(
                            (_, index) =>
                                index !== columnIndex,
                        ),
                    ),
            },
        }));
    };

    const addTableRow = () => {
        setData((previous) => {
            if (!previous.table) {
                return previous;
            }

            return {
                ...previous,

                table: {
                    ...previous.table,

                    rows: [
                        ...previous.table.rows,
                        Array.from(
                            {
                                length:
                                    previous.table
                                        .headers
                                        .length,
                            },
                            () => "",
                        ),
                    ],
                },
            };
        });
    };

    const removeTableRow = (rowIndex) => {
        if (!data.table) {
            return;
        }

        if (data.table.rows.length <= 1) {
            toast.error(
                "A table must have at least one row",
                {
                    autoClose: 3000,
                },
            );

            return;
        }

        setData((previous) => ({
            ...previous,

            table: {
                ...previous.table,

                rows:
                    previous.table.rows.filter(
                        (_, index) =>
                            index !== rowIndex,
                    ),
            },
        }));
    };

    /*
    |--------------------------------------------------------------------------
    | Validation
    |--------------------------------------------------------------------------
    */

    const validateTopic = () => {
        if (!selectedEvent) {
            toast.error("Please select an event", {
                autoClose: 3000,
            });

            return false;
        }

        if (!selectedSubject) {
            toast.error("Please select a subject", {
                autoClose: 3000,
            });

            return false;
        }

        if (!data.chapter) {
            toast.error("Please select a chapter", {
                autoClose: 3000,
            });

            return false;
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

            return false;
        }

        if (!data.topicName.trim()) {
            toast.error("Topic name is required", {
                autoClose: 3000,
            });

            return false;
        }

        if (!data.sections.length) {
            toast.error(
                "At least one section is required",
                {
                    autoClose: 3000,
                },
            );

            return false;
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

            return false;
        }

        /*
        |--------------------------------------------------------------------------
        | Validate Table
        |--------------------------------------------------------------------------
        */

        if (data.table) {
            if (!data.table.headers.length) {
                toast.error(
                    "Table must have at least one column",
                    {
                        autoClose: 3000,
                    },
                );

                return false;
            }

            if (!data.table.rows.length) {
                toast.error(
                    "Table must have at least one row",
                    {
                        autoClose: 3000,
                    },
                );

                return false;
            }

            const emptyHeader =
                data.table.headers.some(
                    (header) =>
                        !String(header).trim(),
                );

            if (emptyHeader) {
                toast.error(
                    "Complete every table column heading",
                    {
                        autoClose: 3000,
                    },
                );

                return false;
            }
        }

        return true;
    };

    /*
    |--------------------------------------------------------------------------
    | Update Topic
    |--------------------------------------------------------------------------
    */

    const updateTopic = async () => {
        if (!validateTopic() || updating) {
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

                sections:
                    data.sections.map(
                        (section) => ({
                            subHeading:
                                section.subHeading.trim(),

                            text:
                                section.text.trim(),
                        }),
                    ),

                /*
                |--------------------------------------------------------------------------
                | Send Table
                |--------------------------------------------------------------------------
                */

                table: data.table
                    ? {
                        headers:
                            data.table.headers.map(
                                (header) =>
                                    String(
                                        header,
                                    ).trim(),
                            ),

                        rows:
                            data.table.rows.map(
                                (row) =>
                                    row.map(
                                        (cell) =>
                                            String(
                                                cell ??
                                                "",
                                            ).trim(),
                                    ),
                            ),
                    }
                    : null,
            };

            const result = await axios.put(
                `/api/topic/${id}`,
                payload,
                {
                    withCredentials: true,
                },
            );

            if (!result.data?.success) {
                toast.error(
                    result.data?.message ||
                    "Topic could not be updated",
                    {
                        autoClose: 3000,
                    },
                );

                return;
            }

            toast.success(
                result.data.message ||
                "Topic is updated",
                {
                    autoClose: 3000,
                },
            );

            setEditing(false);

            await getPageData(false);
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

    /*
    |--------------------------------------------------------------------------
    | Image
    |--------------------------------------------------------------------------
    */

    const updateImage = async (event) => {
        const input = event.target;
        const file = input.files?.[0];

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

            input.value = "";

            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error(
                "Image size cannot be greater than 5MB",
                {
                    autoClose: 3000,
                },
            );

            input.value = "";

            return;
        }

        try {
            setUploadingImage(true);

            const result = await axios.put(
                `/api/topic/${id}/image`,
                file,
                {
                    headers: {
                        "Content-Type":
                            file.type,
                    },

                    withCredentials: true,
                },
            );

            if (!result.data?.success) {
                toast.error(
                    result.data?.message ||
                    "Topic image could not be updated",
                    {
                        autoClose: 3000,
                    },
                );

                return;
            }

            const refreshedTopic =
                await axios.get(
                    `/api/topic/${id}`,
                    {
                        withCredentials: true,
                    },
                );

            if (
                refreshedTopic.data?.success &&
                refreshedTopic.data?.topic
            ) {
                setTopic((previous) => ({
                    ...previous,
                    ...refreshedTopic.data.topic,
                    chapter:
                        previous.chapter,
                }));
            }

            toast.success(
                result.data.message ||
                "Topic image is updated",
                {
                    autoClose: 3000,
                },
            );
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
            input.value = "";
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Delete
    |--------------------------------------------------------------------------
    */

    const openDeleteModal = () => {
        if (!deleting) {
            setShowDeleteModal(true);
        }
    };

    const closeDeleteModal = useCallback(() => {
        if (!deleting) {
            setShowDeleteModal(false);
        }
    }, [deleting]);

    const deleteTopic = async () => {
        if (!id || deleting) {
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

            if (!result.data?.success) {
                toast.error(
                    result.data?.message ||
                    "Topic could not be deleted",
                    {
                        autoClose: 3000,
                    },
                );

                return;
            }

            setShowDeleteModal(false);

            toast.success(
                result.data.message ||
                "Topic is deleted",
                {
                    autoClose: 3000,
                },
            );

            router.replace("/admin/topics");
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

    /*
    |--------------------------------------------------------------------------
    | Cancel
    |--------------------------------------------------------------------------
    */

    const cancelUpdate = async () => {
        if (updating) {
            return;
        }

        setEditing(false);

        await getPageData(false);
    };

    /*
    |--------------------------------------------------------------------------
    | Date
    |--------------------------------------------------------------------------
    */

    const formatDate = (date) => {
        if (!date) {
            return "Not available";
        }

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "Not available";
        }

        return new Intl.DateTimeFormat(
            "en-PK",
            {
                day: "numeric",
                month: "short",
                year: "numeric",
            },
        ).format(parsedDate);
    };

    useEffect(() => {
        getPageData();
    }, [getPageData]);

    /*
    |--------------------------------------------------------------------------
    | Display Values
    |--------------------------------------------------------------------------
    */

    const eventName =
        events.find(
            (event) =>
                String(event._id) ===
                String(selectedEvent),
        )?.name ||
        hierarchy.eventName ||
        "Not available";

    const subjectName =
        subjects.find(
            (subject) =>
                String(subject._id) ===
                String(selectedSubject),
        )?.name ||
        hierarchy.subjectName ||
        "Not available";

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
                    onRetry={() =>
                        getPageData()
                    }
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f5f7fb]">
            <AdminHeader user={user} />

            <main className="mx-auto w-full max-w-[1200px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8">

                {/* Breadcrumb */}

                <nav
                    aria-label="Breadcrumb"
                    className="mb-5 flex items-center gap-2 text-xs sm:text-sm"
                >
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

                {/* Header */}

                <section className="mb-5 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
                    <div className="min-w-0">
                        <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-blue-600">
                            Topic management
                        </p>

                        <h1 className="mt-1.5 truncate text-xl font-black tracking-tight text-[#071a4a] sm:text-2xl">
                            Manage {topic.topicName}
                        </h1>

                        <p className="mt-1.5 max-w-2xl text-xs leading-5 text-slate-500 sm:text-sm">
                            Update the topic hierarchy,
                            information, content sections
                            and topic image.
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

                    {/* LEFT */}

                    <div className="space-y-5 lg:sticky lg:top-24">

                        {/* Image */}

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
                                <div className="h-64 bg-slate-100">
                                    {topic.image?.url ? (
                                        <img
                                            src={
                                                topic
                                                    .image
                                                    .url
                                            }
                                            alt={
                                                topic.topicName
                                            }
                                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 px-6 text-center">
                                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">
                                                <BookOpenText
                                                    size={
                                                        27
                                                    }
                                                    strokeWidth={
                                                        1.8
                                                    }
                                                />
                                            </div>

                                            <p className="mt-3 text-xs font-extrabold text-[#071a4a]">
                                                No topic image
                                            </p>

                                            <p className="mt-1 text-[10px] leading-4 text-slate-500">
                                                Upload an
                                                image with
                                                a maximum
                                                size of
                                                5MB.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-slate-950/70 via-transparent to-transparent p-4 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
                                    <div className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/95 px-4 py-2.5 text-xs font-bold text-blue-700 shadow-lg backdrop-blur-sm">
                                        {uploadingImage ? (
                                            <>
                                                <LoaderCircle
                                                    size={
                                                        16
                                                    }
                                                    className="animate-spin"
                                                />
                                                Uploading...
                                            </>
                                        ) : (
                                            <>
                                                <ImagePlus
                                                    size={
                                                        16
                                                    }
                                                />

                                                {topic
                                                    .image
                                                    ?.url
                                                    ? "Change Image"
                                                    : "Upload Image"}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </label>

                            <input
                                id="topic-image"
                                type="file"
                                accept="image/*"
                                onChange={
                                    updateImage
                                }
                                disabled={
                                    uploadingImage
                                }
                                className="hidden"
                            />

                            <div className="border-t border-slate-200 px-4 py-3">
                                <p className="text-[9px] leading-4 text-slate-500">
                                    JPG, PNG, WEBP or
                                    another supported
                                    image format.
                                    Maximum size: 5MB.
                                </p>
                            </div>
                        </section>

                        {/* Hierarchy */}

                        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="border-b border-slate-200 px-4 py-4">
                                <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-blue-600">
                                    Connected hierarchy
                                </p>

                                <h2 className="mt-1 text-sm font-extrabold text-[#071a4a]">
                                    Content location
                                </h2>
                            </div>

                            <div className="space-y-3 p-4">
                                <HierarchyItem
                                    label="Event"
                                    value={
                                        eventName
                                    }
                                />

                                <HierarchyItem
                                    label="Subject"
                                    value={
                                        subjectName
                                    }
                                />

                                <HierarchyItem
                                    label="Chapter"
                                    value={
                                        selectedChapter?.chapterName ||
                                        hierarchy.chapterName
                                    }
                                />
                            </div>
                        </section>
                    </div>

                    {/* RIGHT */}

                    <div className="space-y-5">

                        {editing ? (
                            <>
                                {/* Hierarchy */}

                                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                    <SectionHeader
                                        title="Topic hierarchy"
                                        description="Choose the event, subject and chapter for this topic."
                                        icon={Layers3}
                                    />

                                    <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
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
                                            loading={
                                                false
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
                                                loadingSubjects
                                                    ? "Loading subjects..."
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

                                        <div className="sm:col-span-2">
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
                                                    loadingChapters
                                                        ? "Loading chapters..."
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
                                    </div>
                                </section>

                                {/* Topic Info */}

                                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                    <SectionHeader
                                        title="Topic information"
                                        description="Update the topic number and topic name."
                                        icon={
                                            BookOpenText
                                        }
                                    />

                                    <div className="grid gap-4 p-5 sm:grid-cols-[180px_minmax(0,1fr)] sm:p-6">
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
                                            placeholder="1"
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

                                {/* Sections */}

                                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                    <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4 sm:px-6">
                                        <div className="flex min-w-0 items-start gap-3">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                                <FileText
                                                    size={
                                                        18
                                                    }
                                                />
                                            </div>

                                            <div className="min-w-0">
                                                <h2 className="text-base font-extrabold text-[#071a4a]">
                                                    Content sections
                                                </h2>

                                                <p className="mt-1 text-[10px] leading-4 text-slate-500 sm:text-xs">
                                                    Add as many
                                                    subheadings
                                                    and
                                                    explanations
                                                    as required.
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
                                            className="flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 text-[10px] font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                                        >
                                            <Plus
                                                size={14}
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
                                    </div>
                                </section>

                                {/* TABLE EDITOR */}

                                <TableEditor
                                    table={data.table}
                                    updating={
                                        updating
                                    }
                                    enableTable={
                                        enableTable
                                    }
                                    removeTable={
                                        removeTable
                                    }
                                    updateTableHeader={
                                        updateTableHeader
                                    }
                                    updateTableCell={
                                        updateTableCell
                                    }
                                    addTableColumn={
                                        addTableColumn
                                    }
                                    removeTableColumn={
                                        removeTableColumn
                                    }
                                    addTableRow={
                                        addTableRow
                                    }
                                    removeTableRow={
                                        removeTableRow
                                    }
                                />

                                {/* Save */}

                                <section className="flex flex-col-reverse gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:justify-end">
                                    <button
                                        type="button"
                                        onClick={
                                            cancelUpdate
                                        }
                                        disabled={
                                            updating
                                        }
                                        className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        <X
                                            size={16}
                                        />
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
                                        className="flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
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
                                {/* Topic Info */}

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

                                {/* Content */}

                                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                    <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4 sm:px-6">
                                        <div className="flex min-w-0 items-start gap-3">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                                <FileText
                                                    size={
                                                        18
                                                    }
                                                />
                                            </div>

                                            <div className="min-w-0">
                                                <h2 className="text-base font-extrabold text-[#071a4a]">
                                                    Content sections
                                                </h2>

                                                <p className="mt-1 text-[10px] text-slate-500 sm:text-xs">
                                                    Topic explanation
                                                    organized
                                                    under
                                                    subheadings.
                                                </p>
                                            </div>
                                        </div>

                                        <span className="shrink-0 rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-extrabold text-blue-700">
                                            {topic.sections
                                                ?.length ||
                                                0}{" "}
                                            sections
                                        </span>
                                    </div>

                                    {topic.sections
                                        ?.length >
                                        0 ? (
                                        <div className="space-y-3 bg-slate-50/70 p-4 sm:p-5">
                                            {topic.sections.map(
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
                                    ) : (
                                        <div className="p-6 text-center text-xs text-slate-500">
                                            No content
                                            sections are
                                            available.
                                        </div>
                                    )}
                                </section>

                                {/* TABLE VIEW */}

                                {topic.table && (
                                    <TableView
                                        table={
                                            topic.table
                                        }
                                    />
                                )}

                                {/* Delete */}

                                <section className="rounded-2xl border border-red-200 bg-red-50 p-5 shadow-sm">
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <h2 className="text-sm font-extrabold text-red-700">
                                                Delete Topic
                                            </h2>

                                            <p className="mt-1 text-[10px] leading-5 text-red-600 sm:text-xs">
                                                Permanently
                                                remove this
                                                topic, its
                                                content
                                                sections and
                                                uploaded
                                                image.
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={
                                                openDeleteModal
                                            }
                                            disabled={
                                                deleting
                                            }
                                            className="flex h-10 w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-xs font-bold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-400 sm:w-auto"
                                        >
                                            <Trash2
                                                size={15}
                                            />
                                            Delete Topic
                                        </button>
                                    </div>
                                </section>
                            </>
                        )}
                    </div>
                </div>
            </main>

            <DeleteConfirmationModal
                open={showDeleteModal}
                title="Delete Topic?"
                description="Deleting this topic permanently removes its content sections and uploaded image."
                itemName={topic.topicName}
                confirmText="Delete Topic"
                loading={deleting}
                onCancel={
                    closeDeleteModal
                }
                onConfirm={deleteTopic}
            />
        </div>
    );
};

/*
|--------------------------------------------------------------------------
| Table Editor
|--------------------------------------------------------------------------
*/

const TableEditor = ({
    table,
    updating,
    enableTable,
    removeTable,
    updateTableHeader,
    updateTableCell,
    addTableColumn,
    removeTableColumn,
    addTableRow,
    removeTableRow,
}) => {
    if (!table) {
        return (
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6">
                    <div className="flex min-w-0 items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <Table2 size={18} />
                        </div>

                        <div>
                            <h2 className="text-base font-extrabold text-[#071a4a]">
                                Topic table
                            </h2>

                            <p className="mt-1 text-[10px] leading-4 text-slate-500 sm:text-xs">
                                No table is currently
                                attached to this topic.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={
                            enableTable
                        }
                        disabled={
                            updating
                        }
                        className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-blue-600 px-3 text-[10px] font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                    >
                        <Plus
                            size={14}
                        />
                        Add Table
                    </button>
                </div>
            </section>
        );
    }

    return (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <Table2 size={18} />
                    </div>

                    <div className="min-w-0">
                        <h2 className="text-base font-extrabold text-[#071a4a]">
                            Edit Table
                        </h2>

                        <p className="mt-1 text-[10px] leading-4 text-slate-500 sm:text-xs">
                            Update table headings,
                            rows and cell values.
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={
                        removeTable
                    }
                    disabled={
                        updating
                    }
                    className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 text-[10px] font-bold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <Trash2
                        size={14}
                    />
                    Remove Table
                </button>
            </div>

            <div className="space-y-4 bg-slate-50/70 p-4 sm:p-5">

                {/* Table controls */}

                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={
                            addTableColumn
                        }
                        disabled={
                            updating
                        }
                        className="flex h-9 items-center gap-1.5 rounded-lg bg-blue-600 px-3 text-[10px] font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
                    >
                        <PlusCircle
                            size={14}
                        />
                        Add Column
                    </button>

                    <button
                        type="button"
                        onClick={
                            addTableRow
                        }
                        disabled={
                            updating
                        }
                        className="flex h-9 items-center gap-1.5 rounded-lg bg-blue-600 px-3 text-[10px] font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
                    >
                        <PlusCircle
                            size={14}
                        />
                        Add Row
                    </button>
                </div>

                {/* Table */}

                <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                    <table className="min-w-[700px] w-full border-collapse">
                        <thead>
                            <tr>
                                {table.headers.map(
                                    (
                                        header,
                                        columnIndex,
                                    ) => (
                                        <th
                                            key={
                                                columnIndex
                                            }
                                            className="border-b border-r border-slate-200 bg-slate-100 p-2 text-left align-top"
                                        >
                                            <div className="flex items-start gap-2">
                                                <input
                                                    type="text"
                                                    value={
                                                        header
                                                    }
                                                    onChange={(
                                                        event,
                                                    ) =>
                                                        updateTableHeader(
                                                            columnIndex,
                                                            event
                                                                .target
                                                                .value,
                                                        )
                                                    }
                                                    disabled={
                                                        updating
                                                    }
                                                    className="h-9 min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-2.5 text-xs font-bold text-slate-800 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
                                                    placeholder={`Column ${columnIndex +
                                                        1
                                                        }`}
                                                />

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeTableColumn(
                                                            columnIndex,
                                                        )
                                                    }
                                                    disabled={
                                                        updating ||
                                                        table
                                                            .headers
                                                            .length <=
                                                        1
                                                    }
                                                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:text-slate-300"
                                                    aria-label={`Remove column ${columnIndex +
                                                        1
                                                        }`}
                                                >
                                                    <MinusCircle
                                                        size={
                                                            16
                                                        }
                                                    />
                                                </button>
                                            </div>
                                        </th>
                                    ),
                                )}
                            </tr>
                        </thead>

                        <tbody>
                            {table.rows.map(
                                (
                                    row,
                                    rowIndex,
                                ) => (
                                    <tr
                                        key={
                                            rowIndex
                                        }
                                        className="group"
                                    >
                                        {table.headers.map(
                                            (
                                                _,
                                                columnIndex,
                                            ) => (
                                                <td
                                                    key={
                                                        columnIndex
                                                    }
                                                    className="border-b border-r border-slate-200 p-2 align-top"
                                                >
                                                    <textarea
                                                        value={
                                                            row[
                                                            columnIndex
                                                            ] ??
                                                            ""
                                                        }
                                                        onChange={(
                                                            event,
                                                        ) =>
                                                            updateTableCell(
                                                                rowIndex,
                                                                columnIndex,
                                                                event
                                                                    .target
                                                                    .value,
                                                            )
                                                        }
                                                        disabled={
                                                            updating
                                                        }
                                                        rows={
                                                            3
                                                        }
                                                        className="w-full min-w-[140px] resize-y rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs leading-5 text-slate-700 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
                                                        placeholder="Enter value..."
                                                    />
                                                </td>
                                            ),
                                        )}

                                        <td className="w-10 border-b border-slate-200 p-2 align-top">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeTableRow(
                                                        rowIndex,
                                                    )
                                                }
                                                disabled={
                                                    updating ||
                                                    table
                                                        .rows
                                                        .length <=
                                                    1
                                                }
                                                className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:text-slate-300"
                                                aria-label={`Remove row ${rowIndex +
                                                    1
                                                    }`}
                                            >
                                                <Trash2
                                                    size={
                                                        14
                                                    }
                                                />
                                            </button>
                                        </td>
                                    </tr>
                                ),
                            )}
                        </tbody>
                    </table>
                </div>

                <p className="text-[10px] leading-4 text-slate-500">
                    {table.headers.length} columns ·{" "}
                    {table.rows.length} rows
                </p>
            </div>
        </section>
    );
};

/*
|--------------------------------------------------------------------------
| Table View
|--------------------------------------------------------------------------
*/

const TableView = ({ table }) => {
    if (!table?.headers?.length) {
        return null;
    }

    return (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4 sm:px-6">
                <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <Table2 size={18} />
                    </div>

                    <div className="min-w-0">
                        <h2 className="text-base font-extrabold text-[#071a4a]">
                            Topic Table
                        </h2>

                        <p className="mt-1 text-[10px] leading-4 text-slate-500 sm:text-xs">
                            Information presented in
                            tabular format.
                        </p>
                    </div>
                </div>

                <span className="shrink-0 rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-extrabold text-blue-700">
                    {table.headers.length} columns
                </span>
            </div>

            <div className="overflow-x-auto bg-slate-50/70 p-4 sm:p-5">
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                    <table className="min-w-full border-collapse">
                        <thead>
                            <tr>
                                {table.headers.map(
                                    (
                                        header,
                                        index,
                                    ) => (
                                        <th
                                            key={
                                                index
                                            }
                                            className="border-b border-r border-slate-200 bg-slate-100 px-4 py-3 text-left text-xs font-extrabold text-[#071a4a]"
                                        >
                                            {header ||
                                                `Column ${index +
                                                1
                                                }`}
                                        </th>
                                    ),
                                )}
                            </tr>
                        </thead>

                        <tbody>
                            {table.rows.length >
                                0 ? (
                                table.rows.map(
                                    (
                                        row,
                                        rowIndex,
                                    ) => (
                                        <tr
                                            key={
                                                rowIndex
                                            }
                                            className="transition hover:bg-blue-50/40"
                                        >
                                            {table.headers.map(
                                                (
                                                    _,
                                                    columnIndex,
                                                ) => (
                                                    <td
                                                        key={
                                                            columnIndex
                                                        }
                                                        className="border-b border-r border-slate-200 px-4 py-3 text-xs leading-5 text-slate-600 sm:text-sm"
                                                    >
                                                        {row[
                                                            columnIndex
                                                        ] || (
                                                                <span className="text-slate-300">
                                                                    —
                                                                </span>
                                                            )}
                                                    </td>
                                                ),
                                            )}
                                        </tr>
                                    ),
                                )
                            ) : (
                                <tr>
                                    <td
                                        colSpan={
                                            table
                                                .headers
                                                .length
                                        }
                                        className="px-5 py-8 text-center text-xs text-slate-400"
                                    >
                                        No table rows
                                        available.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
};

/*
|--------------------------------------------------------------------------
| Small Components
|--------------------------------------------------------------------------
*/

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
                {value || "Not available"}
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

            <div className="min-w-0">
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

                    {options.map(
                        (option) => (
                            <option
                                key={
                                    option.value
                                }
                                value={
                                    option.value
                                }
                            >
                                {
                                    option.label
                                }
                            </option>
                        ),
                    )}
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
                name={name || id}
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
                        disabled ||
                        !canRemove
                    }
                    aria-label={`Remove section ${index + 1
                        }`}
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
                    value={
                        section.subHeading
                    }
                    onChange={(event) =>
                        updateSection(
                            index,
                            "subHeading",
                            event.target
                                .value,
                        )
                    }
                    disabled={
                        disabled
                    }
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
                            {
                                section
                                    .text
                                    .length
                            }{" "}
                            characters
                        </span>
                    </div>

                    <textarea
                        id={`text-${index}`}
                        value={
                            section.text
                        }
                        onChange={(
                            event,
                        ) =>
                            updateSection(
                                index,
                                "text",
                                event
                                    .target
                                    .value,
                            )
                        }
                        disabled={
                            disabled
                        }
                        rows={6}
                        placeholder="Write section explanation..."
                        className="w-full resize-y rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
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

            <p className="mt-1 break-words text-xs font-extrabold text-[#071a4a] sm:text-sm">
                {value ||
                    "Not available"}
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
                    Try Again
                </button>
            </div>
        </main>
    );
};

const AdminHeader = ({
    user,
}) => {
    const [
        showUserMenu,
        setShowUserMenu,
    ] = useState(false);

    const menuRef = useRef(null);

    const accountName = user
        ? `${user.firstname || ""} ${user.lastname || ""
            }`.trim() ||
        "Administrator"
        : "Administrator";

    useEffect(() => {
        const closeMenu = (event) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(
                    event.target,
                )
            ) {
                setShowUserMenu(
                    false,
                );
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
                        <GraduationCap
                            size={21}
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

                <div
                    ref={menuRef}
                    className="relative ml-auto min-w-0 max-w-[52%] sm:max-w-none"
                >
                    <button
                        type="button"
                        aria-label="Open admin account menu"
                        aria-haspopup="menu"
                        aria-expanded={
                            showUserMenu
                        }
                        onClick={() =>
                            setShowUserMenu(
                                (
                                    previous,
                                ) =>
                                    !previous,
                            )
                        }
                        className="flex w-full min-w-0 items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-2.5 py-2 text-left text-white shadow-sm backdrop-blur-xl transition hover:bg-white/15 sm:gap-3 sm:px-4"
                    >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white text-xs font-bold uppercase text-[#102a63] sm:h-10 sm:w-10 sm:text-sm">
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
                                {
                                    accountName
                                }
                            </span>

                            <span className="block truncate text-[9px] text-blue-200 sm:max-w-52 sm:text-xs">
                                {
                                    user?.email ||
                                    "Administrator"
                                }
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
                                        size={
                                            17
                                        }
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
                                        size={
                                            17
                                        }
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

export default TopicPage;