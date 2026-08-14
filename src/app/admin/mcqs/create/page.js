"use client";

import { useUser } from "@/context/userContext";
import axios from "axios";
import Link from "next/link";
import {
    ArrowLeft,
    BookOpenCheck,
    Check,
    ChevronDown,
    CirclePlus,
    ExternalLink,
    FileText,
    GraduationCap,
    LoaderCircle,
    Settings2,
    Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
    useEffect,
    useRef,
    useState,
} from "react";
import { toast } from "react-toastify";

const CreateMcq = () => {
    const navigate = useRouter();
    const { user } = useUser();
    const userMenuRef = useRef(null);

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

    const [options, setOptions] = useState([
        {
            text: "",
            isCorrect: false,
        },
        {
            text: "",
            isCorrect: false,
        },
        {
            text: "",
            isCorrect: false,
        },
        {
            text: "",
            isCorrect: false,
        },
    ]);

    const [loadingEvents, setLoadingEvents] =
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

    const [creating, setCreating] =
        useState(false);

    const [showUserMenu, setShowUserMenu] =
        useState(false);

    const accountName = user
        ? `${user.firstname || ""} ${
              user.lastname || ""
          }`.trim() || "Administrator"
        : "Administrator";

    const toastOptions = {
        autoClose: 3000,
    };

    const getEvents = async () => {
        try {
            setLoadingEvents(true);

            const result = await axios.get(
                "/api/events",
            );

            if (result.data.success) {
                setEvents(
                    result.data.event || [],
                );
            }
        } catch (error) {
            console.log(error);

            setEvents([]);

            toast.error(
                error.response?.data?.message ||
                    "Events could not be loaded",
                toastOptions,
            );
        } finally {
            setLoadingEvents(false);
        }
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
            previous.map((option, optionIndex) =>
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

    const createMcq = async (e) => {
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
            setCreating(true);

            const result = await axios.post(
                "/api/mcqs",
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
                toast.success(
                    "MCQ is created",
                    toastOptions,
                );

                navigate.push("/admin/mcqs");
            }
        } catch (error) {
            console.log(error);

            toast.error(
                error.response?.data?.message ||
                    "MCQ could not be created",
                toastOptions,
            );
        } finally {
            setCreating(false);
        }
    };

    useEffect(() => {
        getEvents();
    }, []);

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
        )?.name || "";

    const selectedSubjectName =
        subjects.find(
            (item) =>
                item._id === selectedSubject,
        )?.name || "";

    const selectedChapterName =
        chapters.find(
            (item) =>
                item._id === selectedChapter,
        )?.chapterName || "";

    const selectedTopicName =
        topics.find(
            (item) =>
                item._id === selectedTopic,
        )?.topicName || "";

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

                    <div
                        ref={userMenuRef}
                        className="relative ml-auto min-w-0 max-w-[52%] sm:max-w-none"
                    >
                        <button
                            type="button"
                            aria-label="Open admin account menu"
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
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white text-xs font-bold uppercase text-[#102a63] sm:h-10 sm:w-10 sm:rounded-full sm:text-sm">
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
                                    {user?.email ||
                                        "Administrator"}
                                </span>
                            </div>

                            <ChevronDown
                                size={15}
                                className={`shrink-0 text-blue-200 transition-transform ${
                                    showUserMenu
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
                                            size={
                                                17
                                            }
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

                    <span className="font-semibold text-blue-700">
                        Create
                    </span>
                </nav>

                <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-600">
                        MCQ management
                    </p>

                    <h1 className="mt-2 text-xl font-extrabold tracking-tight text-[#071a4a] sm:text-2xl">
                        Create a new MCQ
                    </h1>

                    <p className="mt-2 max-w-3xl text-xs leading-5 text-slate-500 sm:text-sm">
                        Select the complete content
                        path, add the question and
                        options, mark the correct
                        answer, and choose where the
                        MCQ should appear.
                    </p>
                </section>

                <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
                    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm lg:sticky lg:top-24">
                        <div className="border-b border-slate-200 px-5 py-4">
                            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-600">
                                Content location
                            </p>

                            <h2 className="mt-1 text-base font-extrabold text-[#071a4a]">
                                Select MCQ Parent
                            </h2>

                            <p className="mt-1 text-[10px] leading-5 text-slate-500">
                                Complete each selection
                                in order.
                            </p>
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
                                options={events}
                                getLabel={(
                                    item,
                                ) => item.name}
                                placeholder={
                                    loadingEvents
                                        ? "Loading events..."
                                        : "Select event"
                                }
                                disabled={
                                    loadingEvents
                                }
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

                    {!selectedTopic ? (
                        <section className="flex min-h-[430px] items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-center shadow-sm">
                            <div>
                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                                    <BookOpenCheck
                                        size={27}
                                    />
                                </div>

                                <h2 className="mt-4 text-base font-extrabold text-[#071a4a]">
                                    Select the content path
                                </h2>

                                <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-slate-500">
                                    Select an event,
                                    subject, chapter and
                                    topic before entering
                                    the MCQ details.
                                </p>
                            </div>
                        </section>
                    ) : (
                        <form
                            onSubmit={createMcq}
                            className="space-y-5"
                        >
                            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                                <SectionHeading
                                    icon={
                                        FileText
                                    }
                                    label="Question"
                                    title="MCQ statement"
                                    description="Write the question clearly and completely."
                                />

                                <label
                                    htmlFor="statement"
                                    className="mt-5 mb-2 block text-xs font-bold text-slate-700"
                                >
                                    Statement
                                </label>

                                <textarea
                                    id="statement"
                                    value={
                                        statement
                                    }
                                    onChange={(e) =>
                                        setStatement(
                                            e.target
                                                .value,
                                        )
                                    }
                                    rows={4}
                                    placeholder="Enter the MCQ statement"
                                    className="w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                                />
                            </section>

                            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                                <div className="flex items-start justify-between gap-3">
                                    <SectionHeading
                                        icon={
                                            Check
                                        }
                                        label="Answers"
                                        title="MCQ options"
                                        description="Enter the options and mark exactly one as correct."
                                    />

                                    <button
                                        type="button"
                                        onClick={
                                            addOption
                                        }
                                        className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 text-[10px] font-bold text-blue-700 transition hover:bg-blue-100"
                                    >
                                        <CirclePlus
                                            size={
                                                14
                                            }
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
                                                className={`rounded-xl border p-3 transition ${
                                                    option.isCorrect
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
                                                        aria-label={`Mark option ${
                                                            index +
                                                            1
                                                        } as correct`}
                                                        className={`flex h-8 min-w-8 shrink-0 items-center justify-center rounded-full border text-[10px] font-extrabold transition ${
                                                            option.isCorrect
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
                                                        aria-label={`Remove option ${
                                                            index +
                                                            1
                                                        }`}
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
                                    description="Add an explanation and select where this MCQ should appear."
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
                                    onClick={() =>
                                        navigate.back()
                                    }
                                    disabled={
                                        creating
                                    }
                                    className="flex h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={
                                        creating
                                    }
                                    className="flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
                                >
                                    {creating ? (
                                        <>
                                            <LoaderCircle
                                                size={
                                                    16
                                                }
                                                className="animate-spin"
                                            />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <BookOpenCheck
                                                size={
                                                    16
                                                }
                                            />
                                            Create MCQ
                                        </>
                                    )}
                                </button>
                            </section>
                        </form>
                    )}
                </div>
            </main>
        </div>
    );
};

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
            className={`rounded-xl border p-3 text-left transition ${
                selected
                    ? "border-blue-600 bg-blue-50 ring-2 ring-blue-100"
                    : "border-slate-200 bg-white hover:border-blue-300"
            }`}
        >
            <div className="flex items-center gap-2">
                <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                        selected
                            ? "border-blue-600 bg-blue-600 text-white"
                            : "border-slate-300 bg-white"
                    }`}
                >
                    {selected && (
                        <Check size={12} />
                    )}
                </span>

                <span
                    className={`text-xs font-extrabold ${
                        selected
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

export default CreateMcq;