"use client";

import { useUser } from "@/context/userContext";
import axios from "axios";
import Link from "next/link";
import {
    ArrowLeft,
    CheckCircle2,
    ChevronDown,
    CircleAlert,
    ExternalLink,
    FileText,
    GraduationCap,
    Plus,
    Save,
    Settings2,
    Trash2,
    X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

const toastOptions = {
    autoClose: 3000,
    pauseOnHover: false,
    pauseOnFocusLoss: false,
    closeOnClick: true,
};

const createLocalId = () => {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
        return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random()}`;
};

const createEmptyMcq = (srNumber = 1) => ({
    localId: createLocalId(),
    sr_number: srNumber,
    statement: "",
    options: ["A", "B", "C", "D"].map((label) => ({
        localId: createLocalId(),
        option_number: label,
        option_text: "",
    })),
    correctOption: "A",
});

const createEmptyDetailQuestion = (srNumber = 1) => ({
    localId: createLocalId(),
    sr_number: srNumber,
    statement: "",
});

const EditPastPaperPage = ({ params }) => {
    const router = useRouter();
    const { user } = useUser();

    const [paperId, setPaperId] = useState("");

    const [events, setEvents] = useState([]);
    const [eventsLoading, setEventsLoading] = useState(true);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [errorMessage, setErrorMessage] = useState("");

    const [event, setEvent] = useState("");
    const [name, setName] = useState("");
    const [year, setYear] = useState("");
    const [instruction, setInstruction] = useState("");
    const [section, setSection] = useState("");

    const [mcqs, setMcqs] = useState([]);
    const [detailQuestions, setDetailQuestions] = useState([]);

    const selectedEvent = events.find((item) => item._id === event);

    useEffect(() => {
        const resolveParams = async () => {
            const resolvedParams = await params;
            setPaperId(resolvedParams.id);
        };

        resolveParams();
    }, [params]);

    const getEvents = async () => {
        try {
            setEventsLoading(true);

            const result = await axios.get("/api/events");

            if (result.data?.success) {
                setEvents(
                    result.data.event ||
                    result.data.events ||
                    []
                );
            } else {
                setEvents([]);
            }
        } catch (error) {
            console.log(error);

            setEvents([]);
        } finally {
            setEventsLoading(false);
        }
    };

    const getPastPaper = async (id) => {
        try {
            setLoading(true);
            setErrorMessage("");

            const result = await axios.get(
                `/api/pastpapers/${id}`
            );

            if (!result.data?.success) {
                setErrorMessage(
                    result.data?.message ||
                    "Past paper could not be loaded"
                );
                return;
            }

            const paper = result.data.pastpaper;

            setEvent(
                typeof paper.event === "object"
                    ? paper.event?._id || ""
                    : paper.event || ""
            );

            setName(paper.name || "");
            setYear(paper.year || "");
            setInstruction(paper.instruction || "");
            setSection(paper.section || "");

            setMcqs(
                Array.isArray(paper.mcq)
                    ? paper.mcq.map((mcq) => ({
                        localId: createLocalId(),
                        sr_number:
                            mcq.sr_number,
                        statement:
                            mcq.statement || "",
                        correctOption:
                            mcq.correctOption || "A",
                        options: Array.isArray(
                            mcq.options
                        )
                            ? mcq.options.map(
                                (option) => ({
                                    localId:
                                        createLocalId(),
                                    option_number:
                                        option.option_number,
                                    option_text:
                                        option.option_text ||
                                        "",
                                })
                            )
                            : [],
                    }))
                    : []
            );

            setDetailQuestions(
                Array.isArray(
                    paper.detailQuestions
                )
                    ? paper.detailQuestions.map(
                        (question) => ({
                            localId:
                                createLocalId(),
                            sr_number:
                                question.sr_number,
                            statement:
                                question.statement || "",
                        })
                    )
                    : []
            );
        } catch (error) {
            console.log(error);

            setErrorMessage(
                error.response?.data?.message ||
                "Past paper could not be loaded"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!paperId) {
            return;
        }

        getPastPaper(paperId);
        getEvents();
    }, [paperId]);

    const updateMcq = (index, field, value) => {
        setMcqs((previous) =>
            previous.map((mcq, currentIndex) =>
                currentIndex === index
                    ? {
                        ...mcq,
                        [field]: value,
                    }
                    : mcq
            )
        );
    };

    const updateMcqOption = (
        mcqIndex,
        optionIndex,
        value
    ) => {
        setMcqs((previous) =>
            previous.map((mcq, currentMcqIndex) => {
                if (currentMcqIndex !== mcqIndex) {
                    return mcq;
                }

                return {
                    ...mcq,
                    options: mcq.options.map(
                        (
                            option,
                            currentOptionIndex
                        ) =>
                            currentOptionIndex ===
                                optionIndex
                                ? {
                                    ...option,
                                    option_text:
                                        value,
                                }
                                : option
                    ),
                };
            })
        );
    };

    const addMcq = () => {
        setMcqs((previous) => [
            ...previous,
            createEmptyMcq(previous.length + 1),
        ]);
    };

    const removeMcq = (index) => {
        setMcqs((previous) =>
            previous
                .filter(
                    (_, currentIndex) =>
                        currentIndex !== index
                )
                .map((mcq, currentIndex) => ({
                    ...mcq,
                    sr_number: currentIndex + 1,
                }))
        );
    };

    const addMcqOption = (mcqIndex) => {
        setMcqs((previous) =>
            previous.map((mcq, currentIndex) => {
                if (currentIndex !== mcqIndex) {
                    return mcq;
                }

                if (mcq.options.length >= 6) {
                    toast.error(
                        "A maximum of six options is allowed",
                        toastOptions
                    );
                    return mcq;
                }

                const nextOption =
                    String.fromCharCode(
                        65 + mcq.options.length
                    );

                return {
                    ...mcq,
                    options: [
                        ...mcq.options,
                        {
                            localId:
                                createLocalId(),
                            option_number:
                                nextOption,
                            option_text: "",
                        },
                    ],
                };
            })
        );
    };

    const removeMcqOption = (
        mcqIndex,
        optionIndex
    ) => {
        setMcqs((previous) =>
            previous.map((mcq, currentIndex) => {
                if (currentIndex !== mcqIndex) {
                    return mcq;
                }

                if (mcq.options.length <= 2) {
                    toast.error(
                        "MCQ questions must contain at least two options",
                        toastOptions
                    );
                    return mcq;
                }

                const options = mcq.options
                    .filter(
                        (_, currentOptionIndex) =>
                            currentOptionIndex !==
                            optionIndex
                    )
                    .map((option, index) => ({
                        ...option,
                        option_number:
                            String.fromCharCode(
                                65 + index
                            ),
                    }));

                let correctOption =
                    mcq.correctOption;

                if (
                    !options.some(
                        (option) =>
                            option.option_number ===
                            correctOption
                    )
                ) {
                    correctOption =
                        options[0]?.option_number ||
                        "A";
                }

                return {
                    ...mcq,
                    options,
                    correctOption,
                };
            })
        );
    };

    const updateDetailQuestion = (
        index,
        value
    ) => {
        setDetailQuestions((previous) =>
            previous.map(
                (question, currentIndex) =>
                    currentIndex === index
                        ? {
                            ...question,
                            statement:
                                value,
                        }
                        : question
            )
        );
    };

    const addDetailQuestion = () => {
        setDetailQuestions((previous) => [
            ...previous,
            createEmptyDetailQuestion(
                previous.length + 1
            ),
        ]);
    };

    const removeDetailQuestion = (index) => {
        setDetailQuestions((previous) =>
            previous
                .filter(
                    (_, currentIndex) =>
                        currentIndex !== index
                )
                .map(
                    (
                        question,
                        currentIndex
                    ) => ({
                        ...question,
                        sr_number:
                            currentIndex + 1,
                    })
                )
        );
    };

    const validatePaper = () => {
        if (!event) {
            toast.error(
                "Please select an event",
                toastOptions
            );
            return false;
        }

        const numericYear = Number(year);

        if (
            !Number.isInteger(numericYear) ||
            numericYear < 1900 ||
            numericYear > new Date().getFullYear()
        ) {
            toast.error(
                "Please enter a valid year",
                toastOptions
            );
            return false;
        }

        if (!instruction.trim()) {
            toast.error(
                "Paper instruction is required",
                toastOptions
            );
            return false;
        }

        if (
            mcqs.length === 0 &&
            detailQuestions.length === 0
        ) {
            toast.error(
                "Add at least one MCQ or written question",
                toastOptions
            );
            return false;
        }

        for (
            let index = 0;
            index < mcqs.length;
            index += 1
        ) {
            const mcq = mcqs[index];

            if (!mcq.statement.trim()) {
                toast.error(
                    `Statement for MCQ ${index + 1} is required`,
                    toastOptions
                );
                return false;
            }

            if (mcq.options.length < 2) {
                toast.error(
                    `MCQ ${index + 1} must contain at least two options`,
                    toastOptions
                );
                return false;
            }

            if (
                mcq.options.some(
                    (option) =>
                        !option.option_text.trim()
                )
            ) {
                toast.error(
                    `Complete every option in MCQ ${index + 1}`,
                    toastOptions
                );
                return false;
            }

            if (
                !mcq.options.some(
                    (option) =>
                        option.option_number ===
                        mcq.correctOption
                )
            ) {
                toast.error(
                    `Select a valid correct option for MCQ ${index + 1}`,
                    toastOptions
                );
                return false;
            }
        }

        for (
            let index = 0;
            index < detailQuestions.length;
            index += 1
        ) {
            if (
                !detailQuestions[
                    index
                ].statement.trim()
            ) {
                toast.error(
                    `Statement for question ${index + 1} is required`,
                    toastOptions
                );
                return false;
            }
        }

        return true;
    };

    const updatePastPaper = async () => {
        if (saving || !validatePaper()) {
            return;
        }

        try {
            setSaving(true);

            const body = {
                event,
                name: name.trim(),
                year: Number(year),
                instruction: instruction.trim(),
                section: section.trim(),

                mcq: mcqs.map((mcq) => ({
                    sr_number: Number(
                        mcq.sr_number
                    ),
                    statement:
                        mcq.statement.trim(),
                    options: mcq.options.map(
                        (option) => ({
                            option_number:
                                option.option_number,
                            option_text:
                                option.option_text.trim(),
                        })
                    ),
                    correctOption:
                        mcq.correctOption,
                })),

                detailQuestions:
                    detailQuestions.map(
                        (question) => ({
                            sr_number: Number(
                                question.sr_number
                            ),
                            statement:
                                question.statement.trim(),
                        })
                    ),
            };

            const result = await axios.put(
                `/api/pastpapers/${paperId}`,
                body
            );

            if (!result.data?.success) {
                toast.error(
                    result.data?.message ||
                    "Past paper could not be updated",
                    toastOptions
                );
                return;
            }

            toast.success(
                result.data?.message ||
                "Past paper is updated",
                toastOptions
            );

            router.replace(
                "/admin/pastpapers"
            );
            router.refresh();
        } catch (error) {
            console.log(error);

            toast.error(
                error.response?.data?.message ||
                "Past paper could not be updated",
                toastOptions
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f5f7fb]">
                <AdminHeader user={user} />

                <main className="mx-auto w-full max-w-[1200px] px-3 py-8 sm:px-6 lg:px-8">
                    <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

                        <p className="mt-4 text-sm font-bold text-[#071a4a]">
                            Loading past paper...
                        </p>
                    </div>
                </main>
            </div>
        );
    }

    if (errorMessage) {
        return (
            <div className="min-h-screen bg-[#f5f7fb]">
                <AdminHeader user={user} />

                <main className="mx-auto w-full max-w-[1200px] px-3 py-8 sm:px-6 lg:px-8">
                    <div className="rounded-2xl border border-red-200 bg-white p-10 text-center shadow-sm">
                        <CircleAlert
                            size={35}
                            className="mx-auto text-red-500"
                        />

                        <h2 className="mt-4 text-base font-extrabold text-[#071a4a]">
                            Past paper could not be loaded
                        </h2>

                        <p className="mt-2 text-xs text-slate-500">
                            {errorMessage}
                        </p>

                        <Link
                            href="/admin/pastpapers"
                            className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-5 text-xs font-bold text-white"
                        >
                            <ArrowLeft size={15} />
                            Back to Past Papers
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f5f7fb]">
            <AdminHeader user={user} />

            <main className="mx-auto w-full max-w-[1200px] px-3 py-5 sm:px-6 sm:py-7 lg:px-8">
                <nav className="mb-5 flex items-center gap-2 text-xs sm:text-sm">
                    <Link
                        href="/admin/pastpapers"
                        className="flex items-center gap-1.5 font-semibold text-slate-500 hover:text-blue-700"
                    >
                        <ArrowLeft size={16} />
                        Past Papers
                    </Link>

                    <span className="text-slate-300">
                        /
                    </span>

                    <span className="font-semibold text-blue-700">
                        Manage
                    </span>
                </nav>

                <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
                    <div>
                        <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-blue-600">
                            Paper management
                        </p>

                        <h1 className="mt-1.5 text-xl font-extrabold tracking-tight text-[#071a4a] sm:text-2xl">
                            {name || "Past Paper"}
                        </h1>

                        <p className="mt-1.5 text-xs text-slate-500 sm:text-sm">
                            {selectedEvent?.name ||
                                "Event"}{" "}
                            · {year}
                        </p>
                    </div>

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <FileText size={23} />
                    </div>
                </section>

                <div className="mt-5 space-y-5">
                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
                            <h2 className="text-base font-extrabold text-[#071a4a]">
                                Basic Information
                            </h2>

                            <p className="mt-1 text-[10px] text-slate-500 sm:text-xs">
                                Update the paper information.
                            </p>
                        </div>

                        <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
                            <FormField
                                label="Event"
                                required
                            >
                                <select
                                    value={event}
                                    onChange={(e) =>
                                        setEvent(
                                            e.target
                                                .value
                                        )
                                    }
                                    disabled={
                                        eventsLoading ||
                                        saving
                                    }
                                    className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-xs text-[#071a4a] outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                >
                                    <option value="">
                                        {eventsLoading
                                            ? "Loading events..."
                                            : "Select event"}
                                    </option>

                                    {events.map(
                                        (item) => (
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
                                        )
                                    )}
                                </select>
                            </FormField>

                            <FormField label="Name">
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) =>
                                        setName(
                                            e.target
                                                .value
                                        )
                                    }
                                    disabled={saving}
                                    className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-xs text-[#071a4a] outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                />
                            </FormField>

                            <FormField
                                label="Year"
                                required
                            >
                                <input
                                    type="number"
                                    value={year}
                                    onChange={(e) =>
                                        setYear(
                                            e.target
                                                .value
                                        )
                                    }
                                    disabled={saving}
                                    className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-xs text-[#071a4a] outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                />
                            </FormField>

                            <FormField label="Section">
                                <input
                                    type="text"
                                    value={section}
                                    onChange={(e) =>
                                        setSection(
                                            e.target
                                                .value
                                        )
                                    }
                                    disabled={saving}
                                    placeholder="A / B / C"
                                    className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-xs text-[#071a4a] outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                />
                            </FormField>

                            <div className="sm:col-span-2">
                                <FormField
                                    label="Instruction"
                                    required
                                >
                                    <textarea
                                        value={
                                            instruction
                                        }
                                        onChange={(e) =>
                                            setInstruction(
                                                e
                                                    .target
                                                    .value
                                            )
                                        }
                                        disabled={
                                            saving
                                        }
                                        rows={4}
                                        className="w-full resize-y rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs leading-5 text-[#071a4a] outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                    />
                                </FormField>
                            </div>
                        </div>
                    </section>

                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
                            <div>
                                <h2 className="text-base font-extrabold text-[#071a4a]">
                                    MCQs
                                </h2>

                                <p className="mt-1 text-[10px] text-slate-500">
                                    {mcqs.length}{" "}
                                    {mcqs.length === 1
                                        ? "MCQ"
                                        : "MCQs"}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={addMcq}
                                disabled={saving}
                                className="flex h-9 items-center gap-1.5 rounded-lg bg-blue-600 px-3 text-[9px] font-bold text-white hover:bg-blue-700"
                            >
                                <Plus size={14} />
                                Add MCQ
                            </button>
                        </div>

                        <div className="space-y-4 bg-slate-50/70 p-4 sm:p-5">
                            {mcqs.length === 0 ? (
                                <EmptyBlock
                                    text="No MCQs in this paper."
                                    action="Add MCQ"
                                    onClick={addMcq}
                                />
                            ) : (
                                mcqs.map(
                                    (mcq, index) => (
                                        <McqEditor
                                            key={
                                                mcq.localId
                                            }
                                            mcq={mcq}
                                            index={index}
                                            disabled={
                                                saving
                                            }
                                            updateMcq={
                                                updateMcq
                                            }
                                            updateMcqOption={
                                                updateMcqOption
                                            }
                                            addMcqOption={
                                                addMcqOption
                                            }
                                            removeMcqOption={
                                                removeMcqOption
                                            }
                                            removeMcq={
                                                removeMcq
                                            }
                                        />
                                    )
                                )
                            )}
                        </div>
                    </section>

                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
                            <div>
                                <h2 className="text-base font-extrabold text-[#071a4a]">
                                    Detail Questions
                                </h2>

                                <p className="mt-1 text-[10px] text-slate-500">
                                    {
                                        detailQuestions.length
                                    }{" "}
                                    written{" "}
                                    {detailQuestions.length ===
                                        1
                                        ? "question"
                                        : "questions"}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={
                                    addDetailQuestion
                                }
                                disabled={saving}
                                className="flex h-9 items-center gap-1.5 rounded-lg bg-blue-600 px-3 text-[9px] font-bold text-white hover:bg-blue-700"
                            >
                                <Plus size={14} />
                                Add Question
                            </button>
                        </div>

                        <div className="space-y-3 bg-slate-50/70 p-4 sm:p-5">
                            {detailQuestions.length ===
                                0 ? (
                                <EmptyBlock
                                    text="No written questions in this paper."
                                    action="Add Question"
                                    onClick={
                                        addDetailQuestion
                                    }
                                />
                            ) : (
                                detailQuestions.map(
                                    (
                                        question,
                                        index
                                    ) => (
                                        <DetailQuestionEditor
                                            key={
                                                question.localId
                                            }
                                            question={
                                                question
                                            }
                                            index={
                                                index
                                            }
                                            disabled={
                                                saving
                                            }
                                            updateQuestion={
                                                updateDetailQuestion
                                            }
                                            removeQuestion={
                                                removeDetailQuestion
                                            }
                                        />
                                    )
                                )
                            )}
                        </div>
                    </section>

                    <section className="flex flex-col-reverse gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                        <Link
                            href="/admin/pastpapers"
                            className="flex h-11 items-center justify-center rounded-xl border border-slate-300 px-5 text-xs font-bold text-slate-600 hover:bg-slate-50"
                        >
                            Cancel
                        </Link>

                        <button
                            type="button"
                            onClick={updatePastPaper}
                            disabled={saving}
                            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-xs font-bold text-white hover:bg-blue-700 disabled:bg-blue-400"
                        >
                            {saving ? (
                                <>
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <Save size={16} />
                                    Update Past Paper
                                </>
                            )}
                        </button>
                    </section>
                </div>
            </main>
        </div>
    );
};

const McqEditor = ({
    mcq,
    index,
    disabled,
    updateMcq,
    updateMcqOption,
    addMcqOption,
    removeMcqOption,
    removeMcq,
}) => {
    return (
        <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 min-w-8 items-center justify-center rounded-lg bg-blue-600 px-2 text-[10px] font-extrabold text-white">
                        Q{mcq.sr_number}
                    </div>

                    <p className="text-xs font-extrabold text-[#071a4a]">
                        MCQ
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() =>
                        removeMcq(index)
                    }
                    disabled={disabled}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-500 hover:bg-red-600 hover:text-white disabled:opacity-40"
                >
                    <Trash2 size={14} />
                </button>
            </div>

            <div className="space-y-4 p-4">
                <FormField
                    label="Statement"
                    required
                >
                    <textarea
                        value={mcq.statement}
                        onChange={(e) =>
                            updateMcq(
                                index,
                                "statement",
                                e.target.value
                            )
                        }
                        disabled={disabled}
                        rows={3}
                        className="w-full resize-y rounded-xl border border-slate-300 px-3 py-2.5 text-xs leading-5 text-[#071a4a] outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                </FormField>

                <div>
                    <div className="flex items-center justify-between">
                        <p className="text-[9px] font-extrabold uppercase tracking-[0.1em] text-blue-600">
                            Options
                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                addMcqOption(
                                    index
                                )
                            }
                            disabled={
                                disabled ||
                                mcq.options
                                    .length >= 6
                            }
                            className="flex h-8 items-center gap-1 rounded-lg bg-blue-600 px-3 text-[8px] font-bold text-white disabled:bg-blue-400"
                        >
                            <Plus size={12} />
                            Option
                        </button>
                    </div>

                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        {mcq.options.map(
                            (
                                option,
                                optionIndex
                            ) => (
                                <div
                                    key={
                                        option.localId
                                    }
                                    className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-2"
                                >
                                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-[10px] font-extrabold text-blue-700">
                                        {
                                            option.option_number
                                        }
                                    </span>

                                    <input
                                        type="text"
                                        value={
                                            option.option_text
                                        }
                                        onChange={(
                                            e
                                        ) =>
                                            updateMcqOption(
                                                index,
                                                optionIndex,
                                                e.target
                                                    .value
                                            )
                                        }
                                        disabled={
                                            disabled
                                        }
                                        className="h-9 min-w-0 flex-1 border-0 bg-transparent px-1 text-xs outline-none"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            removeMcqOption(
                                                index,
                                                optionIndex
                                            )
                                        }
                                        disabled={
                                            disabled ||
                                            mcq.options
                                                .length <=
                                            2
                                        }
                                        className="flex h-8 w-8 items-center justify-center rounded-lg text-red-400 hover:bg-red-50 disabled:opacity-30"
                                    >
                                        <X
                                            size={14}
                                        />
                                    </button>
                                </div>
                            )
                        )}
                    </div>

                    <div className="mt-4">
                        <FormField
                            label="Correct option"
                            required
                        >
                            <select
                                value={
                                    mcq.correctOption
                                }
                                onChange={(e) =>
                                    updateMcq(
                                        index,
                                        "correctOption",
                                        e.target.value
                                    )
                                }
                                disabled={disabled}
                                className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-xs outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                            >
                                {mcq.options.map(
                                    (option) => (
                                        <option
                                            key={
                                                option.localId
                                            }
                                            value={
                                                option.option_number
                                            }
                                        >
                                            {
                                                option.option_number
                                            }
                                        </option>
                                    )
                                )}
                            </select>
                        </FormField>
                    </div>
                </div>
            </div>
        </article>
    );
};

const DetailQuestionEditor = ({
    question,
    index,
    disabled,
    updateQuestion,
    removeQuestion,
}) => {
    return (
        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 min-w-8 items-center justify-center rounded-lg bg-violet-600 px-2 text-[10px] font-extrabold text-white">
                        Q{question.sr_number}
                    </div>

                    <p className="text-xs font-extrabold text-[#071a4a]">
                        Written Question
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() =>
                        removeQuestion(index)
                    }
                    disabled={disabled}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-500 hover:bg-red-600 hover:text-white disabled:opacity-40"
                >
                    <Trash2 size={14} />
                </button>
            </div>

            <textarea
                value={question.statement}
                onChange={(e) =>
                    updateQuestion(
                        index,
                        e.target.value
                    )
                }
                disabled={disabled}
                rows={4}
                placeholder="Enter written question"
                className="mt-4 w-full resize-y rounded-xl border border-slate-300 px-3 py-2.5 text-xs leading-5 text-[#071a4a] outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
        </article>
    );
};

const EmptyBlock = ({
    text,
    action,
    onClick,
}) => {
    return (
        <div className="py-10 text-center">
            <FileText
                size={25}
                className="mx-auto text-slate-300"
            />

            <p className="mt-3 text-xs font-bold text-[#071a4a]">
                {text}
            </p>

            <button
                type="button"
                onClick={onClick}
                className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-lg bg-blue-600 px-4 text-[9px] font-bold text-white hover:bg-blue-700"
            >
                <Plus size={13} />
                {action}
            </button>
        </div>
    );
};

const FormField = ({
    label,
    required = false,
    children,
}) => {
    return (
        <label className="block">
            <span className="mb-2 block text-xs font-bold text-slate-700">
                {label}

                {required && (
                    <span className="ml-1 text-red-500">
                        *
                    </span>
                )}
            </span>

            {children}
        </label>
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
        const closeUserMenu = (event) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(
                    event.target
                )
            ) {
                setShowUserMenu(false);
            }
        };

        document.addEventListener(
            "mousedown",
            closeUserMenu
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                closeUserMenu
            );
        };
    }, []);

    return (
        <header className="sticky top-0 z-50 bg-[#102a63] px-3 py-2 text-white shadow-sm sm:px-6">
            <div className="mx-auto flex h-14 w-full max-w-[1500px] items-center">
                <Link
                    href="/admin"
                    className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-2.5 py-2"
                >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#102a63]">
                        <GraduationCap size={21} />
                    </div>

                    <div>
                        <span className="block text-[11px] font-bold">
                            StudiesForge
                        </span>

                        <span className="block text-[9px] text-blue-200">
                            Admin Console
                        </span>
                    </div>
                </Link>

                <div
                    ref={menuRef}
                    className="relative ml-auto"
                >
                    <button
                        type="button"
                        onClick={() =>
                            setShowUserMenu(
                                (previous) =>
                                    !previous
                            )
                        }
                        className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-2.5 py-2"
                    >
                        <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-xl bg-white text-xs font-bold text-[#102a63]">
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
                                    0
                                ) || "A"
                            )}
                        </div>

                        <span className="max-w-40 truncate text-[11px] font-bold">
                            {accountName}
                        </span>

                        <ChevronDown
                            size={15}
                            className={
                                showUserMenu
                                    ? "rotate-180"
                                    : ""
                            }
                        />
                    </button>

                    {showUserMenu && (
                        <div className="absolute right-0 top-full z-50 w-52 pt-2">
                            <div className="rounded-xl border border-slate-200 bg-white p-2 text-slate-800 shadow-xl">
                                <Link
                                    href="/"
                                    onClick={() =>
                                        setShowUserMenu(
                                            false
                                        )
                                    }
                                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold hover:bg-blue-50 hover:text-blue-700"
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
                                            false
                                        )
                                    }
                                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold hover:bg-blue-50 hover:text-blue-700"
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

export default EditPastPaperPage;