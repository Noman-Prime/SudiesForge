"use client";

import { useUser } from "@/context/userContext";
import axios from "axios";
import Link from "next/link";
import {
    ArrowLeft,
    BookOpenText,
    CheckCircle2,
    ChevronDown,
    ExternalLink,
    FileText,
    GraduationCap,
    Layers3,
    ListTree,
    LoaderCircle,
    Plus,
    Save,
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

const CreateTopic = () => {
    const navigate = useRouter();
    const { user } = useUser();

    const [events, setEvents] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [chapters, setChapters] = useState([]);

    const [selectedEvent, setSelectedEvent] =
        useState("");
    const [selectedSubject, setSelectedSubject] =
        useState("");

    const [loadingEvents, setLoadingEvents] =
        useState(true);
    const [loadingSubjects, setLoadingSubjects] =
        useState(false);
    const [loadingChapters, setLoadingChapters] =
        useState(false);
    const [creating, setCreating] =
        useState(false);

    const [data, setData] = useState({
        chapter: "",
        topicNumber: "",
        topicName: "",
        sections: [
            {
                subHeading: "",
                text: "",
            },
        ],
    });

    const getEvents = async () => {
        try {
            setLoadingEvents(true);

            const result = await axios.get(
                "/api/events",
                {
                    withCredentials: true,
                },
            );

            if (result.data.success) {
                setEvents(
                    result.data.event || [],
                );
            }
        } catch (error) {
            console.log(error);

            if (error.response?.status !== 404) {
                toast.error(
                    error.response?.data?.message ||
                    "Events could not be loaded",
                    {
                        autoClose: 3000,
                    },
                );
            }

            setEvents([]);
        } finally {
            setLoadingEvents(false);
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

    const selectEvent = (e) => {
        const eventId = e.target.value;

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

    const selectSubject = (e) => {
        const subjectId = e.target.value;

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

    const fillTopicData = (e) => {
        const { name, value } = e.target;

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

    const createTopic = async (e) => {
        e.preventDefault();

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
                "Complete every section before creating the topic",
                {
                    autoClose: 3000,
                },
            );

            return;
        }

        try {
            setCreating(true);

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

            const result = await axios.post(
                "/api/topic",
                payload,
                {
                    withCredentials: true,
                },
            );

            if (result.data.success) {
                toast.success(
                    result.data.message ||
                    "Topic is created",
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
                "Topic could not be created",
                {
                    autoClose: 3000,
                },
            );
        } finally {
            setCreating(false);
        }
    };

    useEffect(() => {
        getEvents();
    }, []);

    const selectedEventName =
        events.find(
            (event) =>
                event._id === selectedEvent,
        )?.name || "";

    const selectedSubjectName =
        subjects.find(
            (subject) =>
                subject._id === selectedSubject,
        )?.name || "";

    const selectedChapter =
        chapters.find(
            (chapter) =>
                chapter._id === data.chapter,
        ) || null;

    return (
        <div className="min-h-screen bg-[#f5f7fb]">
            <AdminHeader user={user} />

            <main className="mx-auto w-full max-w-[1200px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
                <nav className="mb-5 flex items-center gap-2 text-xs sm:text-sm">
                    <button
                        type="button"
                        onClick={() =>
                            navigate.back()
                        }
                        className="flex items-center gap-1.5 font-semibold text-slate-500 transition hover:text-blue-700"
                    >
                        <ArrowLeft size={16} />
                        Topics
                    </button>

                    <span className="text-slate-300">
                        /
                    </span>

                    <span className="font-semibold text-blue-700">
                        Create Topic
                    </span>
                </nav>

                <section className="mb-5 rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm sm:px-6">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-600">
                        Topic management
                    </p>

                    <h1 className="mt-2 text-xl font-extrabold tracking-tight text-[#071a4a] sm:text-2xl">
                        Create a new topic
                    </h1>

                    <p className="mt-2 max-w-3xl text-xs leading-5 text-slate-500 sm:text-sm">
                        Select the event, subject and
                        chapter first. Then enter the
                        topic information and add as many
                        content sections as required.
                    </p>
                </section>

                <form
                    onSubmit={createTopic}
                    className="grid items-start gap-5 lg:grid-cols-[280px_minmax(0,1fr)]"
                >
                    <aside className="overflow-hidden rounded-2xl bg-[#102a63] text-white shadow-sm lg:sticky lg:top-24">
                        <div className="border-b border-white/10 px-5 py-5">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#102a63]">
                                <ListTree size={20} />
                            </div>

                            <h2 className="mt-4 text-lg font-extrabold">
                                Topic structure
                            </h2>

                            <p className="mt-2 text-xs leading-5 text-blue-100">
                                Follow the content hierarchy
                                to attach the topic to the
                                correct chapter.
                            </p>
                        </div>

                        <div className="space-y-2.5 p-4">
                            <HierarchyStep
                                number="1"
                                label="Event"
                                value={
                                    selectedEventName
                                }
                                active={
                                    !selectedEvent
                                }
                                complete={Boolean(
                                    selectedEvent,
                                )}
                            />

                            <HierarchyStep
                                number="2"
                                label="Subject"
                                value={
                                    selectedSubjectName
                                }
                                active={
                                    Boolean(
                                        selectedEvent,
                                    ) &&
                                    !selectedSubject
                                }
                                complete={Boolean(
                                    selectedSubject,
                                )}
                            />

                            <HierarchyStep
                                number="3"
                                label="Chapter"
                                value={
                                    selectedChapter
                                        ? `Chapter ${selectedChapter.chapterNumber}: ${selectedChapter.chapterName}`
                                        : ""
                                }
                                active={
                                    Boolean(
                                        selectedSubject,
                                    ) &&
                                    !data.chapter
                                }
                                complete={Boolean(
                                    data.chapter,
                                )}
                            />

                            <HierarchyStep
                                number="4"
                                label="Topic content"
                                value={
                                    data.topicName.trim()
                                }
                                active={Boolean(
                                    data.chapter,
                                )}
                                complete={Boolean(
                                    data.topicName.trim(),
                                )}
                            />
                        </div>

                        <div className="border-t border-white/10 p-5">
                            <div className="rounded-xl bg-white/10 p-4">
                                <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-blue-200">
                                    Topic sections
                                </p>

                                <p className="mt-2 text-2xl font-extrabold text-white">
                                    {
                                        data.sections
                                            .length
                                    }
                                </p>

                                <p className="mt-1 text-[10px] leading-4 text-blue-100">
                                    You can add or remove
                                    subheadings according to
                                    the topic content.
                                </p>
                            </div>

                            <p className="mt-4 text-[10px] leading-5 text-blue-100">
                                The topic image can be added
                                later from the topic update
                                page.
                            </p>
                        </div>
                    </aside>

                    <div className="space-y-5">
                        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <SectionHeader
                                number="01"
                                title="Select content hierarchy"
                                description="Choose where this topic belongs."
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
                                        loadingEvents ||
                                        creating
                                    }
                                    loading={
                                        loadingEvents
                                    }
                                    placeholder={
                                        loadingEvents
                                            ? "Loading events..."
                                            : "Select an event"
                                    }
                                    options={events.map(
                                        (event) => ({
                                            value: event._id,
                                            label: event.name,
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
                                        creating
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
                                        (subject) => ({
                                            value:
                                                subject._id,
                                            label:
                                                subject.name,
                                        }),
                                    )}
                                />

                                <SelectField
                                    id="chapter"
                                    label="Chapter"
                                    name="chapter"
                                    value={
                                        data.chapter
                                    }
                                    onChange={
                                        fillTopicData
                                    }
                                    disabled={
                                        !selectedSubject ||
                                        loadingChapters ||
                                        creating
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
                                        (chapter) => ({
                                            value:
                                                chapter._id,
                                            label: `Chapter ${chapter.chapterNumber}: ${chapter.chapterName}`,
                                        }),
                                    )}
                                />

                                {selectedEvent &&
                                    !loadingSubjects &&
                                    subjects.length ===
                                    0 && (
                                        <EmptySelectionMessage
                                            message="No subjects are attached to this event."
                                        />
                                    )}

                                {selectedSubject &&
                                    !loadingChapters &&
                                    chapters.length ===
                                    0 && (
                                        <EmptySelectionMessage
                                            message="No chapters are attached to this subject."
                                        />
                                    )}
                            </div>
                        </section>

                        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <SectionHeader
                                number="02"
                                title="Topic information"
                                description="Enter the topic number and name."
                                icon={BookOpenText}
                            />

                            <div className="grid gap-4 p-5 sm:grid-cols-[180px_minmax(0,1fr)] sm:p-6">
                                <div>
                                    <label
                                        htmlFor="topicNumber"
                                        className="mb-2 block text-xs font-bold text-slate-700"
                                    >
                                        Topic number
                                    </label>

                                    <input
                                        id="topicNumber"
                                        type="number"
                                        name="topicNumber"
                                        min="1"
                                        value={
                                            data.topicNumber
                                        }
                                        onChange={
                                            fillTopicData
                                        }
                                        disabled={
                                            creating
                                        }
                                        placeholder="For example: 1"
                                        required
                                        className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="topicName"
                                        className="mb-2 block text-xs font-bold text-slate-700"
                                    >
                                        Topic name
                                    </label>

                                    <input
                                        id="topicName"
                                        type="text"
                                        name="topicName"
                                        value={
                                            data.topicName
                                        }
                                        onChange={
                                            fillTopicData
                                        }
                                        disabled={
                                            creating
                                        }
                                        placeholder="For example: Cell Structure"
                                        required
                                        className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                        <FileText
                                            size={18}
                                        />
                                    </div>

                                    <div>
                                        <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-blue-600">
                                            Step 03
                                        </p>

                                        <h2 className="mt-0.5 text-base font-extrabold text-[#071a4a]">
                                            Topic sections
                                        </h2>

                                        <p className="mt-1 text-[10px] leading-4 text-slate-500 sm:text-xs">
                                            Add subheadings and
                                            their explanatory
                                            text.
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={addSection}
                                    disabled={creating}
                                    className="flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 text-[10px] font-bold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                                >
                                    <Plus size={14} />
                                    Add Section
                                </button>
                            </div>

                            <div className="space-y-4 bg-slate-50/70 p-4 sm:p-5">
                                {data.sections.map(
                                    (
                                        section,
                                        index,
                                    ) => (
                                        <div
                                            key={index}
                                            className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
                                        >
                                            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="flex h-7 min-w-7 items-center justify-center rounded-lg bg-blue-600 px-2 text-[10px] font-bold text-white">
                                                        {index +
                                                            1}
                                                    </span>

                                                    <p className="text-xs font-extrabold text-[#071a4a]">
                                                        Section{" "}
                                                        {index +
                                                            1}
                                                    </p>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeSection(
                                                            index,
                                                        )
                                                    }
                                                    disabled={
                                                        creating ||
                                                        data
                                                            .sections
                                                            .length ===
                                                        1
                                                    }
                                                    aria-label={`Remove section ${index + 1}`}
                                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:text-slate-300"
                                                >
                                                    <Trash2
                                                        size={
                                                            15
                                                        }
                                                    />
                                                </button>
                                            </div>

                                            <div className="space-y-4 p-4">
                                                <div>
                                                    <label
                                                        htmlFor={`subHeading-${index}`}
                                                        className="mb-2 block text-[11px] font-bold text-slate-700"
                                                    >
                                                        Subheading
                                                    </label>

                                                    <input
                                                        id={`subHeading-${index}`}
                                                        type="text"
                                                        value={
                                                            section.subHeading
                                                        }
                                                        onChange={(
                                                            e,
                                                        ) =>
                                                            updateSection(
                                                                index,
                                                                "subHeading",
                                                                e
                                                                    .target
                                                                    .value,
                                                            )
                                                        }
                                                        disabled={
                                                            creating
                                                        }
                                                        placeholder="For example: Characteristics"
                                                        required
                                                        className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                                                    />
                                                </div>

                                                <div>
                                                    <div className="mb-2 flex items-center justify-between gap-3">
                                                        <label
                                                            htmlFor={`text-${index}`}
                                                            className="text-[11px] font-bold text-slate-700"
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
                                                            e,
                                                        ) =>
                                                            updateSection(
                                                                index,
                                                                "text",
                                                                e
                                                                    .target
                                                                    .value,
                                                            )
                                                        }
                                                        disabled={
                                                            creating
                                                        }
                                                        placeholder="Write the complete explanation for this subheading..."
                                                        required
                                                        rows={6}
                                                        className="w-full resize-y rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ),
                                )}

                                <button
                                    type="button"
                                    onClick={addSection}
                                    disabled={creating}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-blue-300 bg-blue-50/50 px-4 py-3 text-xs font-bold text-blue-700 transition hover:border-blue-400 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <Plus size={16} />
                                    Add another section
                                </button>
                            </div>
                        </section>

                        <section className="flex flex-col-reverse gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
                            <p className="text-[10px] leading-4 text-slate-500 sm:max-w-sm">
                                Review the hierarchy and all
                                sections before creating the
                                topic.
                            </p>

                            <div className="flex flex-col-reverse gap-3 sm:flex-row">
                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate.back()
                                    }
                                    disabled={creating}
                                    className="flex h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={creating}
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
                                            <Save
                                                size={
                                                    16
                                                }
                                            />
                                            Create Topic
                                        </>
                                    )}
                                </button>
                            </div>
                        </section>
                    </div>
                </form>
            </main>
        </div>
    );
};

const HierarchyStep = ({
    number,
    label,
    value,
    active,
    complete,
}) => {
    return (
        <div
            className={`rounded-xl border p-3 transition ${complete
                    ? "border-emerald-300/30 bg-emerald-400/10"
                    : active
                        ? "border-blue-300/40 bg-white/15"
                        : "border-white/10 bg-white/5"
                }`}
        >
            <div className="flex items-start gap-3">
                <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold ${complete
                            ? "bg-emerald-400 text-[#071a4a]"
                            : active
                                ? "bg-white text-[#102a63]"
                                : "bg-white/10 text-blue-200"
                        }`}
                >
                    {complete ? (
                        <CheckCircle2 size={15} />
                    ) : (
                        number
                    )}
                </div>

                <div className="min-w-0">
                    <p className="text-[9px] font-bold uppercase tracking-[0.11em] text-blue-200">
                        {label}
                    </p>

                    <p
                        className={`mt-1 truncate text-xs font-bold ${value
                                ? "text-white"
                                : "text-blue-200/60"
                            }`}
                    >
                        {value ||
                            `Select ${label.toLowerCase()}`}
                    </p>
                </div>
            </div>
        </div>
    );
};

const SectionHeader = ({
    number,
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
                <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-blue-600">
                    Step {number}
                </p>

                <h2 className="mt-0.5 text-base font-extrabold text-[#071a4a]">
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
                    required
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

const EmptySelectionMessage = ({
    message,
}) => {
    return (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[10px] font-semibold leading-5 text-amber-700">
            {message}
        </div>
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

export default CreateTopic;