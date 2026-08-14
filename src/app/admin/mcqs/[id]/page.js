"use client";

import { useUser } from "@/context/userContext";
import axios from "axios";
import Link from "next/link";
import {
    AlertTriangle,
    ArrowLeft,
    BookOpenCheck,
    CalendarDays,
    Check,
    ChevronDown,
    CirclePlus,
    ExternalLink,
    FileText,
    GraduationCap,
    LoaderCircle,
    RefreshCw,
    Save,
    Settings2,
    Trash2,
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

const getId = (value) => {
    if (!value) {
        return "";
    }

    if (typeof value === "object") {
        return value._id || "";
    }

    return value;
};

const ManageMcq = () => {
    const { id } = useParams();
    const navigate = useRouter();
    const { user } = useUser();
    const userMenuRef = useRef(null);

    const [mcq, setMcq] = useState(null);

    const [events, setEvents] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [chapters, setChapters] = useState([]);
    const [topics, setTopics] = useState([]);

    const [selectedEvent, setSelectedEvent] =
        useState("");

    const [selectedSubject, setSelectedSubject] =
        useState("");

    const [selectedChapter, setSelectedChapter] =
        useState("");

    const [selectedTopic, setSelectedTopic] =
        useState("");

    const [statement, setStatement] =
        useState("");

    const [explanation, setExplanation] =
        useState("");

    const [mcqType, setMcqType] =
        useState("both");

    const [options, setOptions] = useState([]);

    const [loading, setLoading] =
        useState(true);

    const [
        loadingSubjects,
        setLoadingSubjects,
    ] = useState(false);

    const [
        loadingChapters,
        setLoadingChapters,
    ] = useState(false);

    const [loadingTopics, setLoadingTopics] =
        useState(false);

    const [updating, setUpdating] =
        useState(false);

    const [deleting, setDeleting] =
        useState(false);

    const [errorMessage, setErrorMessage] =
        useState("");

    const [showUserMenu, setShowUserMenu] =
        useState(false);

    const accountName = user
        ? `${user.firstname || ""} ${user.lastname || ""
            }`.trim() || "Administrator"
        : "Administrator";

    const toastOptions = {
        autoClose: 3000,
    };

    const getSubjects = async (eventId) => {
        try {
            setLoadingSubjects(true);

            const result = await axios.get(
                `/api/events/${eventId}/subjects`,
            );

            if (result.data.success) {
                setSubjects(
                    result.data.subjects || [],
                );
            }
        } catch (error) {
            console.log(error);
            setSubjects([]);
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
            );

            if (result.data.success) {
                setChapters(
                    result.data.chapters || [],
                );
            }
        } catch (error) {
            console.log(error);
            setChapters([]);
        } finally {
            setLoadingChapters(false);
        }
    };

    const getTopics = async (chapterId) => {
        try {
            setLoadingTopics(true);

            const result = await axios.get(
                `/api/topic/chapter/${chapterId}`,
            );

            if (result.data.success) {
                setTopics(
                    result.data.topics || [],
                );
            }
        } catch (error) {
            console.log(error);
            setTopics([]);
        } finally {
            setLoadingTopics(false);
        }
    };

    const getMcq = async (
        showLoading = true,
    ) => {
        try {
            if (showLoading) {
                setLoading(true);
            }

            setErrorMessage("");

            const result = await axios.get(
                `/api/mcqs/${id}`,
                {
                    withCredentials: true,
                },
            );

            if (!result.data.success) {
                return;
            }

            const currentMcq =
                result.data.mcq;

            const eventId = getId(
                currentMcq.event,
            );

            const subjectId = getId(
                currentMcq.subject,
            );

            const chapterId = getId(
                currentMcq.chapter,
            );

            const topicId = getId(
                currentMcq.topic,
            );

            setMcq(currentMcq);

            setSelectedEvent(eventId);
            setSelectedSubject(subjectId);
            setSelectedChapter(chapterId);
            setSelectedTopic(topicId);

            setStatement(
                currentMcq.statement || "",
            );

            setExplanation(
                currentMcq.explanation || "",
            );

            setMcqType(
                currentMcq.mcqType || "both",
            );

            setOptions(
                (currentMcq.options || []).map(
                    (option) => ({
                        text:
                            option.text || "",
                        isCorrect:
                            Boolean(
                                option.isCorrect,
                            ),
                    }),
                ),
            );

            const [
                eventsResult,
                subjectsResult,
                chaptersResult,
                topicsResult,
            ] = await Promise.allSettled([
                axios.get("/api/events"),
                axios.get(
                    `/api/events/${eventId}/subjects`,
                ),
                axios.get(
                    `/api/chapter/subject/${subjectId}`,
                ),
                axios.get(
                    `/api/topic/chapter/${chapterId}`,
                ),
            ]);

            if (
                eventsResult.status ===
                "fulfilled" &&
                eventsResult.value.data.success
            ) {
                setEvents(
                    eventsResult.value.data
                        .event || [],
                );
            } else {
                setEvents([]);
            }

            if (
                subjectsResult.status ===
                "fulfilled" &&
                subjectsResult.value.data
                    .success
            ) {
                setSubjects(
                    subjectsResult.value.data
                        .subjects || [],
                );
            } else {
                setSubjects([]);
            }

            if (
                chaptersResult.status ===
                "fulfilled" &&
                chaptersResult.value.data
                    .success
            ) {
                setChapters(
                    chaptersResult.value.data
                        .chapters || [],
                );
            } else {
                setChapters([]);
            }

            if (
                topicsResult.status ===
                "fulfilled" &&
                topicsResult.value.data
                    .success
            ) {
                setTopics(
                    topicsResult.value.data
                        .topics || [],
                );
            } else {
                setTopics([]);
            }
        } catch (error) {
            console.log(error);

            setErrorMessage(
                error.response?.data?.message ||
                "MCQ could not be loaded",
            );
        } finally {
            if (showLoading) {
                setLoading(false);
            }
        }
    };

    const changeEvent = async (e) => {
        const eventId = e.target.value;

        setSelectedEvent(eventId);
        setSelectedSubject("");
        setSelectedChapter("");
        setSelectedTopic("");

        setSubjects([]);
        setChapters([]);
        setTopics([]);

        if (eventId) {
            await getSubjects(eventId);
        }
    };

    const changeSubject = async (e) => {
        const subjectId = e.target.value;

        setSelectedSubject(subjectId);
        setSelectedChapter("");
        setSelectedTopic("");

        setChapters([]);
        setTopics([]);

        if (subjectId) {
            await getChapters(subjectId);
        }
    };

    const changeChapter = async (e) => {
        const chapterId = e.target.value;

        setSelectedChapter(chapterId);
        setSelectedTopic("");

        setTopics([]);

        if (chapterId) {
            await getTopics(chapterId);
        }
    };

    const changeTopic = (e) => {
        setSelectedTopic(e.target.value);
    };

    const changeOption = (
        index,
        value,
    ) => {
        setOptions((previous) =>
            previous.map(
                (option, optionIndex) =>
                    optionIndex === index
                        ? {
                            ...option,
                            text: value,
                        }
                        : option,
            ),
        );
    };

    const selectCorrectOption = (index) => {
        setOptions((previous) =>
            previous.map(
                (option, optionIndex) => ({
                    ...option,
                    isCorrect:
                        optionIndex === index,
                }),
            ),
        );
    };

    const addOption = () => {
        setOptions((previous) => [
            ...previous,
            {
                text: "",
                isCorrect: false,
            },
        ]);
    };

    const removeOption = (index) => {
        if (options.length <= 2) {
            toast.error(
                "At least two options are required",
                toastOptions,
            );

            return;
        }

        setOptions((previous) =>
            previous.filter(
                (_, optionIndex) =>
                    optionIndex !== index,
            ),
        );
    };

    const updateMcq = async (e) => {
        e.preventDefault();

        if (!selectedEvent) {
            toast.error(
                "Please select an event",
                toastOptions,
            );
            return;
        }

        if (!selectedSubject) {
            toast.error(
                "Please select a subject",
                toastOptions,
            );
            return;
        }

        if (!selectedChapter) {
            toast.error(
                "Please select a chapter",
                toastOptions,
            );
            return;
        }

        if (!selectedTopic) {
            toast.error(
                "Please select a topic",
                toastOptions,
            );
            return;
        }

        if (!statement.trim()) {
            toast.error(
                "MCQ statement is required",
                toastOptions,
            );
            return;
        }

        const cleanOptions = options.map(
            (option) => ({
                text: option.text.trim(),
                isCorrect: option.isCorrect,
            }),
        );

        if (cleanOptions.length < 2) {
            toast.error(
                "At least two options are required",
                toastOptions,
            );
            return;
        }

        if (
            cleanOptions.some(
                (option) => !option.text,
            )
        ) {
            toast.error(
                "Please fill all options",
                toastOptions,
            );
            return;
        }

        const correctOptions =
            cleanOptions.filter(
                (option) =>
                    option.isCorrect,
            );

        if (correctOptions.length !== 1) {
            toast.error(
                "Please select one correct option",
                toastOptions,
            );
            return;
        }

        try {
            setUpdating(true);

            const result = await axios.put(
                `/api/mcqs/${id}`,
                {
                    topic: selectedTopic,
                    statement:
                        statement.trim(),
                    options: cleanOptions,
                    explanation:
                        explanation.trim(),
                    mcqType,
                },
                {
                    withCredentials: true,
                },
            );

            if (result.data.success) {
                const updatedMcq =
                    result.data.mcq;

                setMcq((previous) => ({
                    ...previous,
                    ...updatedMcq,
                    event:
                        events.find(
                            (item) =>
                                item._id ===
                                selectedEvent,
                        ) ||
                        previous?.event,
                    subject:
                        subjects.find(
                            (item) =>
                                item._id ===
                                selectedSubject,
                        ) ||
                        previous?.subject,
                    chapter:
                        chapters.find(
                            (item) =>
                                item._id ===
                                selectedChapter,
                        ) ||
                        previous?.chapter,
                    topic:
                        topics.find(
                            (item) =>
                                item._id ===
                                selectedTopic,
                        ) ||
                        previous?.topic,
                }));

                toast.success(
                    "MCQ is updated",
                    toastOptions,
                );
            }
        } catch (error) {
            console.log(error);

            toast.error(
                error.response?.data?.message ||
                "MCQ could not be updated",
                toastOptions,
            );
        } finally {
            setUpdating(false);
        }
    };

    const resetChanges = async () => {
        await getMcq(false);

        toast.info(
            "Changes are reset",
            toastOptions,
        );
    };

    const deleteMcq = async () => {
        const confirmed = window.confirm(
            "Are you sure you want to permanently delete this MCQ?",
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeleting(true);

            const result =
                await axios.delete(
                    `/api/mcqs/${id}`,
                    {
                        withCredentials: true,
                    },
                );

            if (result.data.success) {
                toast.success(
                    "MCQ is deleted",
                    toastOptions,
                );

                navigate.push(
                    "/admin/mcqs",
                );
            }
        } catch (error) {
            console.log(error);

            toast.error(
                error.response?.data?.message ||
                "MCQ could not be deleted",
                toastOptions,
            );
        } finally {
            setDeleting(false);
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
            getMcq();
        }
    }, [id]);

    useEffect(() => {
        const closeUserMenu = (e) => {
            if (
                userMenuRef.current &&
                !userMenuRef.current.contains(
                    e.target,
                )
            ) {
                setShowUserMenu(false);
            }
        };

        document.addEventListener(
            "mousedown",
            closeUserMenu,
        );

        return () =>
            document.removeEventListener(
                "mousedown",
                closeUserMenu,
            );
    }, []);

    const selectedEventName =
        events.find(
            (item) =>
                item._id === selectedEvent,
        )?.name ||
        (typeof mcq?.event === "object"
            ? mcq.event?.name
            : "") ||
        "Event";

    const selectedSubjectName =
        subjects.find(
            (item) =>
                item._id === selectedSubject,
        )?.name ||
        (typeof mcq?.subject === "object"
            ? mcq.subject?.name
            : "") ||
        "Subject";

    const selectedChapterName =
        chapters.find(
            (item) =>
                item._id === selectedChapter,
        )?.chapterName ||
        (typeof mcq?.chapter === "object"
            ? mcq.chapter?.chapterName
            : "") ||
        "Chapter";

    const selectedTopicName =
        topics.find(
            (item) =>
                item._id === selectedTopic,
        )?.topicName ||
        (typeof mcq?.topic === "object"
            ? mcq.topic?.topicName
            : "") ||
        "Topic";

    if (loading) {
        return (
            <PageLoading
                user={user}
                accountName={
                    accountName
                }
            />
        );
    }

    if (errorMessage || !mcq) {
        return (
            <PageError
                user={user}
                accountName={
                    accountName
                }
                message={
                    errorMessage ||
                    "MCQ is not found"
                }
                onRetry={getMcq}
            />
        );
    }

    return (
        <div className="min-h-screen bg-[#f5f7fb]">
            <AdminHeader
                user={user}
                accountName={accountName}
                userMenuRef={
                    userMenuRef
                }
                showUserMenu={
                    showUserMenu
                }
                setShowUserMenu={
                    setShowUserMenu
                }
            />

            <main className="mx-auto w-full max-w-[1250px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
                <nav className="mb-5 flex items-center gap-2 text-xs sm:text-sm">
                    <Link
                        href="/admin/mcqs"
                        className="flex items-center gap-1.5 font-semibold text-slate-500 transition hover:text-blue-700"
                    >
                        <ArrowLeft size={16} />
                        MCQs
                    </Link>

                    <span className="text-slate-300">
                        /
                    </span>

                    <span className="max-w-52 truncate font-semibold text-blue-700">
                        {mcq.statement}
                    </span>
                </nav>

                <section className="mb-5 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-600">
                                MCQ management
                            </p>

                            <TypeBadge
                                value={
                                    mcqType
                                }
                            />
                        </div>

                        <h1 className="mt-2 text-xl font-extrabold tracking-tight text-[#071a4a] sm:text-2xl">
                            Update MCQ
                        </h1>

                        <p className="mt-2 max-w-3xl text-xs leading-5 text-slate-500 sm:text-sm">
                            Update its content
                            location, statement,
                            options, correct answer,
                            explanation and
                            availability.
                        </p>
                    </div>

                    <button
                        type="submit"
                        form="mcq-update-form"
                        disabled={
                            updating ||
                            deleting
                        }
                        className="flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400 sm:w-auto"
                    >
                        {updating ? (
                            <>
                                <LoaderCircle
                                    size={16}
                                    className="animate-spin"
                                />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save size={16} />
                                Save Changes
                            </>
                        )}
                    </button>
                </section>

                <form
                    id="mcq-update-form"
                    onSubmit={updateMcq}
                    className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr] lg:items-start"
                >
                    <div className="space-y-5 lg:sticky lg:top-24">
                        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="border-b border-slate-200 px-5 py-4">
                                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-600">
                                    Content location
                                </p>

                                <h2 className="mt-1 text-base font-extrabold text-[#071a4a]">
                                    MCQ Parent
                                </h2>
                            </div>

                            <div className="space-y-4 p-4 sm:p-5">
                                <HierarchySelect
                                    number="1"
                                    label="Event"
                                    value={
                                        selectedEvent
                                    }
                                    onChange={
                                        changeEvent
                                    }
                                    options={
                                        events
                                    }
                                    getLabel={(
                                        item,
                                    ) =>
                                        item.name
                                    }
                                    placeholder="Select event"
                                />

                                {selectedEvent && (
                                    <HierarchySelect
                                        number="2"
                                        label="Subject"
                                        value={
                                            selectedSubject
                                        }
                                        onChange={
                                            changeSubject
                                        }
                                        options={
                                            subjects
                                        }
                                        getLabel={(
                                            item,
                                        ) =>
                                            item.name
                                        }
                                        placeholder={
                                            loadingSubjects
                                                ? "Loading subjects..."
                                                : subjects.length ===
                                                    0
                                                    ? "No subjects found"
                                                    : "Select subject"
                                        }
                                        disabled={
                                            loadingSubjects ||
                                            subjects.length ===
                                            0
                                        }
                                    />
                                )}

                                {selectedSubject && (
                                    <HierarchySelect
                                        number="3"
                                        label="Chapter"
                                        value={
                                            selectedChapter
                                        }
                                        onChange={
                                            changeChapter
                                        }
                                        options={
                                            chapters
                                        }
                                        getLabel={(
                                            item,
                                        ) =>
                                            `Chapter ${item.chapterNumber}: ${item.chapterName}`
                                        }
                                        placeholder={
                                            loadingChapters
                                                ? "Loading chapters..."
                                                : chapters.length ===
                                                    0
                                                    ? "No chapters found"
                                                    : "Select chapter"
                                        }
                                        disabled={
                                            loadingChapters ||
                                            chapters.length ===
                                            0
                                        }
                                    />
                                )}

                                {selectedChapter && (
                                    <HierarchySelect
                                        number="4"
                                        label="Topic"
                                        value={
                                            selectedTopic
                                        }
                                        onChange={
                                            changeTopic
                                        }
                                        options={
                                            topics
                                        }
                                        getLabel={(
                                            item,
                                        ) =>
                                            `Topic ${item.topicNumber}: ${item.topicName}`
                                        }
                                        placeholder={
                                            loadingTopics
                                                ? "Loading topics..."
                                                : topics.length ===
                                                    0
                                                    ? "No topics found"
                                                    : "Select topic"
                                        }
                                        disabled={
                                            loadingTopics ||
                                            topics.length ===
                                            0
                                        }
                                    />
                                )}

                                {selectedTopic && (
                                    <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                                        <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-blue-600">
                                            Selected path
                                        </p>

                                        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px] font-semibold leading-5 text-slate-700">
                                            <span>
                                                {
                                                    selectedEventName
                                                }
                                            </span>

                                            <span className="text-blue-400">
                                                /
                                            </span>

                                            <span>
                                                {
                                                    selectedSubjectName
                                                }
                                            </span>

                                            <span className="text-blue-400">
                                                /
                                            </span>

                                            <span>
                                                {
                                                    selectedChapterName
                                                }
                                            </span>

                                            <span className="text-blue-400">
                                                /
                                            </span>

                                            <span className="font-bold text-blue-700">
                                                {
                                                    selectedTopicName
                                                }
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>

                        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-600">
                                Record information
                            </p>

                            <div className="mt-4 grid grid-cols-2 gap-3">
                                <DateCard
                                    label="Created"
                                    value={formatDate(
                                        mcq.createdAt,
                                    )}
                                />

                                <DateCard
                                    label="Updated"
                                    value={formatDate(
                                        mcq.updatedAt,
                                    )}
                                />
                            </div>
                        </section>
                    </div>

                    <div className="space-y-5">
                        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                            <SectionHeading
                                icon={FileText}
                                label="Question"
                                title="MCQ statement"
                                description="Update the question statement."
                            />

                            <label
                                htmlFor="statement"
                                className="mt-5 mb-2 block text-xs font-bold text-slate-700"
                            >
                                Statement
                            </label>

                            <textarea
                                id="statement"
                                value={statement}
                                onChange={(e) =>
                                    setStatement(
                                        e.target
                                            .value,
                                    )
                                }
                                rows={4}
                                className="w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                            />
                        </section>

                        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                            <div className="flex items-start justify-between gap-3">
                                <SectionHeading
                                    icon={Check}
                                    label="Answers"
                                    title="MCQ options"
                                    description="Update options and select one correct answer."
                                />

                                <button
                                    type="button"
                                    onClick={
                                        addOption
                                    }
                                    className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 text-[10px] font-bold text-blue-700 transition hover:bg-blue-100"
                                >
                                    <CirclePlus
                                        size={14}
                                    />
                                    Add
                                </button>
                            </div>

                            <div className="mt-5 space-y-3">
                                {options.map(
                                    (
                                        option,
                                        index,
                                    ) => (
                                        <div
                                            key={
                                                index
                                            }
                                            className={`rounded-xl border p-3 transition ${option.isCorrect
                                                ? "border-green-300 bg-green-50"
                                                : "border-slate-200 bg-slate-50"
                                                }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        selectCorrectOption(
                                                            index,
                                                        )
                                                    }
                                                    className={`flex h-8 min-w-8 shrink-0 items-center justify-center rounded-full border text-[10px] font-extrabold transition ${option.isCorrect
                                                        ? "border-green-600 bg-green-600 text-white"
                                                        : "border-slate-300 bg-white text-slate-500 hover:border-blue-400 hover:text-blue-600"
                                                        }`}
                                                >
                                                    {option.isCorrect ? (
                                                        <Check
                                                            size={
                                                                15
                                                            }
                                                        />
                                                    ) : (
                                                        String.fromCharCode(
                                                            65 +
                                                            index,
                                                        )
                                                    )}
                                                </button>

                                                <input
                                                    type="text"
                                                    value={
                                                        option.text
                                                    }
                                                    onChange={(
                                                        e,
                                                    ) =>
                                                        changeOption(
                                                            index,
                                                            e
                                                                .target
                                                                .value,
                                                        )
                                                    }
                                                    placeholder={`Option ${String.fromCharCode(
                                                        65 +
                                                        index,
                                                    )}`}
                                                    className="h-10 min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 sm:text-sm"
                                                />

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeOption(
                                                            index,
                                                        )
                                                    }
                                                    disabled={
                                                        options.length <=
                                                        2
                                                    }
                                                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
                                                >
                                                    <Trash2
                                                        size={
                                                            15
                                                        }
                                                    />
                                                </button>
                                            </div>

                                            {option.isCorrect && (
                                                <p className="mt-2 pl-10 text-[9px] font-bold uppercase tracking-[0.1em] text-green-700">
                                                    Correct
                                                    answer
                                                </p>
                                            )}
                                        </div>
                                    ),
                                )}
                            </div>
                        </section>

                        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                            <SectionHeading
                                icon={
                                    BookOpenCheck
                                }
                                label="Availability"
                                title="Explanation and usage"
                                description="Update the explanation and select where this MCQ should appear."
                            />

                            <label
                                htmlFor="explanation"
                                className="mt-5 mb-2 block text-xs font-bold text-slate-700"
                            >
                                Explanation
                                <span className="ml-1 font-normal text-slate-400">
                                    Optional
                                </span>
                            </label>

                            <textarea
                                id="explanation"
                                value={
                                    explanation
                                }
                                onChange={(e) =>
                                    setExplanation(
                                        e.target
                                            .value,
                                    )
                                }
                                rows={4}
                                placeholder="Explain why the selected option is correct"
                                className="w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                            />

                            <p className="mt-5 mb-2 text-xs font-bold text-slate-700">
                                MCQ type
                            </p>

                            <div className="grid gap-3 sm:grid-cols-3">
                                <TypeOption
                                    value="both"
                                    currentValue={
                                        mcqType
                                    }
                                    onChange={
                                        setMcqType
                                    }
                                    title="Both"
                                    description="Reading and test"
                                />

                                <TypeOption
                                    value="read"
                                    currentValue={
                                        mcqType
                                    }
                                    onChange={
                                        setMcqType
                                    }
                                    title="Read only"
                                    description="Study mode only"
                                />

                                <TypeOption
                                    value="test"
                                    currentValue={
                                        mcqType
                                    }
                                    onChange={
                                        setMcqType
                                    }
                                    title="Test only"
                                    description="Test mode only"
                                />
                            </div>
                        </section>

                        <section className="flex flex-col-reverse gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-end sm:p-5">
                            <button
                                type="button"
                                onClick={
                                    resetChanges
                                }
                                disabled={
                                    updating ||
                                    deleting
                                }
                                className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <RefreshCw
                                    size={15}
                                />
                                Reset Changes
                            </button>

                            <button
                                type="submit"
                                disabled={
                                    updating ||
                                    deleting
                                }
                                className="flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-xs font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
                            >
                                {updating ? (
                                    <>
                                        <LoaderCircle
                                            size={
                                                16
                                            }
                                            className="animate-spin"
                                        />
                                        Saving...
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

                        <section className="rounded-2xl border border-red-200 bg-red-50 p-5 shadow-sm sm:p-6">
                            <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                                    <AlertTriangle
                                        size={20}
                                    />
                                </div>

                                <div className="min-w-0">
                                    <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-red-600">
                                        Danger zone
                                    </p>

                                    <h2 className="mt-1 text-base font-extrabold text-red-800">
                                        Delete MCQ
                                    </h2>

                                    <p className="mt-1 text-[10px] leading-5 text-red-600 sm:text-xs">
                                        This action
                                        permanently
                                        removes the MCQ
                                        from reading and
                                        test activities.
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={
                                    deleteMcq
                                }
                                disabled={
                                    deleting ||
                                    updating
                                }
                                className="mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-xs font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-400 sm:w-auto"
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
                                        Delete MCQ
                                    </>
                                )}
                            </button>
                        </section>
                    </div>
                </form>
            </main>
        </div>
    );
};

const AdminHeader = ({
    user,
    accountName,
    userMenuRef,
    showUserMenu,
    setShowUserMenu,
}) => (
    <header className="sticky top-0 z-50 bg-[#102a63] px-3 py-2 text-white shadow-sm sm:px-6">
        <div className="mx-auto flex h-14 w-full max-w-[1500px] items-center gap-2 sm:h-16 sm:gap-4">
            <Link
                href="/admin"
                className="flex min-w-0 max-w-[48%] items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-2.5 py-2 text-white shadow-sm backdrop-blur-xl transition hover:bg-white/15 sm:max-w-none sm:gap-3 sm:px-4"
            >
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

            <div
                ref={userMenuRef}
                className="relative ml-auto min-w-0 max-w-[52%] sm:max-w-none"
            >
                <button
                    type="button"
                    onClick={() =>
                        setShowUserMenu(
                            (previous) =>
                                !previous,
                        )
                    }
                    className="flex w-full min-w-0 items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-2.5 py-2 text-left text-white shadow-sm backdrop-blur-xl transition hover:bg-white/15 sm:gap-3 sm:px-4"
                >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white text-xs font-bold uppercase text-[#102a63] sm:h-10 sm:w-10 sm:rounded-full sm:text-sm">
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
                    <div className="absolute right-0 top-full z-50 w-52 pt-2 sm:w-56">
                        <div className="rounded-xl border border-slate-200 bg-white p-2 text-slate-800 shadow-xl">
                            <Link
                                href="/"
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

const HierarchySelect = ({
    number,
    label,
    value,
    onChange,
    options,
    getLabel,
    placeholder,
    disabled,
}) => (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
        <div className="mb-2.5 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-[9px] font-extrabold text-white">
                {number}
            </span>

            <label className="text-xs font-bold text-[#071a4a]">
                Select {label}
            </label>
        </div>

        <select
            value={value}
            onChange={onChange}
            disabled={disabled}
            className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
        >
            <option value="">
                {placeholder}
            </option>

            {options.map((item) => (
                <option
                    key={item._id}
                    value={item._id}
                >
                    {getLabel(item)}
                </option>
            ))}
        </select>
    </div>
);

const SectionHeading = ({
    icon: Icon,
    label,
    title,
    description,
}) => (
    <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Icon size={19} />
        </div>

        <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-blue-600">
                {label}
            </p>

            <h2 className="mt-1 text-base font-extrabold text-[#071a4a]">
                {title}
            </h2>

            <p className="mt-1 text-[10px] leading-5 text-slate-500 sm:text-xs">
                {description}
            </p>
        </div>
    </div>
);

const TypeOption = ({
    value,
    currentValue,
    onChange,
    title,
    description,
}) => {
    const selected =
        currentValue === value;

    return (
        <button
            type="button"
            onClick={() => onChange(value)}
            className={`rounded-xl border p-3 text-left transition ${selected
                ? "border-blue-600 bg-blue-50 ring-2 ring-blue-100"
                : "border-slate-200 bg-white hover:border-blue-300"
                }`}
        >
            <div className="flex items-center gap-2">
                <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full border ${selected
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-slate-300 bg-white"
                        }`}
                >
                    {selected && (
                        <Check size={12} />
                    )}
                </span>

                <span
                    className={`text-xs font-extrabold ${selected
                        ? "text-blue-700"
                        : "text-slate-700"
                        }`}
                >
                    {title}
                </span>
            </div>

            <p className="mt-2 pl-7 text-[9px] leading-4 text-slate-500">
                {description}
            </p>
        </button>
    );
};

const TypeBadge = ({ value }) => {
    const styles = {
        both: {
            label: "Read and Test",
            classes:
                "border-blue-200 bg-blue-50 text-blue-700",
        },
        read: {
            label: "Read Only",
            classes:
                "border-green-200 bg-green-50 text-green-700",
        },
        test: {
            label: "Test Only",
            classes:
                "border-violet-200 bg-violet-50 text-violet-700",
        },
    };

    const selected =
        styles[value] || styles.both;

    return (
        <span
            className={`rounded-full border px-2 py-1 text-[8px] font-extrabold uppercase tracking-[0.08em] ${selected.classes}`}
        >
            {selected.label}
        </span>
    );
};

const DateCard = ({ label, value }) => (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
        <CalendarDays
            size={15}
            className="text-blue-600"
        />

        <p className="mt-2 text-[8px] font-bold uppercase tracking-[0.1em] text-slate-400">
            {label}
        </p>

        <p className="mt-1 text-[10px] font-bold text-slate-700">
            {value}
        </p>
    </div>
);

const PageLoading = ({
    user,
    accountName,
}) => (
    <div className="min-h-screen bg-[#f5f7fb]">
        <AdminHeader
            user={user}
            accountName={accountName}
            userMenuRef={null}
            showUserMenu={false}
            setShowUserMenu={() => { }}
        />

        <main className="mx-auto max-w-[1250px] px-4 py-7">
            <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="h-3 w-40 rounded bg-slate-200" />

                <div className="mt-4 h-8 w-64 rounded bg-slate-200" />

                <div className="mt-4 h-3 w-2/3 rounded bg-slate-100" />
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
                <div className="h-[480px] animate-pulse rounded-2xl border border-slate-200 bg-white" />

                <div className="h-[620px] animate-pulse rounded-2xl border border-slate-200 bg-white" />
            </div>
        </main>
    </div>
);

const PageError = ({
    user,
    accountName,
    message,
    onRetry,
}) => (
    <div className="min-h-screen bg-[#f5f7fb]">
        <AdminHeader
            user={user}
            accountName={accountName}
            userMenuRef={null}
            showUserMenu={false}
            setShowUserMenu={() => { }}
        />

        <main className="flex min-h-[70vh] items-center justify-center px-4 py-8">
            <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
                <AlertTriangle
                    size={38}
                    className="mx-auto text-red-500"
                />

                <h1 className="mt-5 text-xl font-extrabold text-[#071a4a]">
                    MCQ could not be loaded
                </h1>

                <p className="mt-3 text-xs leading-6 text-slate-500">
                    {message}
                </p>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <Link
                        href="/admin/mcqs"
                        className="flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-xs font-bold text-slate-600"
                    >
                        <ArrowLeft size={14} />
                        Back to MCQs
                    </Link>

                    <button
                        type="button"
                        onClick={onRetry}
                        className="flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-xs font-bold text-white"
                    >
                        <RefreshCw size={14} />
                        Try again
                    </button>
                </div>
            </div>
        </main>
    </div>
);

export default ManageMcq;