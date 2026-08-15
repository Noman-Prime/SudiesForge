"use client";

import { useUser } from "@/context/userContext";
import axios from "axios";
import Link from "next/link";
import {
    ArrowLeft,
    BookOpen,
    CheckCircle2,
    ChevronDown,
    CircleAlert,
    ClipboardList,
    ExternalLink,
    FileText,
    GraduationCap,
    Layers3,
    ListChecks,
    LoaderCircle,
    Plus,
    Save,
    Settings2,
    Trash2,
    X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";

const toastOptions = {
    autoClose: 3000,
    pauseOnHover: false,
    pauseOnFocusLoss: false,
    closeOnClick: true,
};

const questionTypes = [
    {
        value: "mcq",
        label: "MCQ",
    },
    {
        value: "short",
        label: "Short Question",
    },
    {
        value: "long",
        label: "Long Question",
    },
];

const createLocalId = () => {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
        return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random()}`;
};

const createDefaultOptions = () => {
    return ["A", "B", "C", "D"].map((label) => ({
        localId: createLocalId(),
        label,
        text: "",
    }));
};

const createQuestion = (questionNumber = 1, type = "mcq") => {
    return {
        localId: createLocalId(),
        questionNumber,
        type,
        statement: "",
        marks: 1,
        options: type === "mcq" ? createDefaultOptions() : [],
    };
};

const createSection = (sectionNumber = 1, questionNumber = 1) => {
    return {
        localId: createLocalId(),
        title: `Section ${String.fromCharCode(64 + sectionNumber)}`,
        instructions: "",
        questions: [
            createQuestion(questionNumber),
        ],
    };
};

const CreatePastPaperPage = () => {
    const router = useRouter();
    const { user } = useUser();

    const [events, setEvents] = useState([]);
    const [event, setEvent] = useState("");
    const [title, setTitle] = useState("");
    const [year, setYear] = useState(new Date().getFullYear());
    const [paperCode, setPaperCode] = useState("");
    const [duration, setDuration] = useState("");
    const [totalMarks, setTotalMarks] = useState("");
    const [instructions, setInstructions] = useState([""]);
    const [sections, setSections] = useState([
        createSection(),
    ]);
    const [eventsLoading, setEventsLoading] = useState(true);
    const [submittingStatus, setSubmittingStatus] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const isSubmitting = Boolean(submittingStatus);

    const totalQuestions = useMemo(() => {
        return sections.reduce((total, section) => {
            return total + section.questions.length;
        }, 0);
    }, [sections]);

    const calculatedMarks = useMemo(() => {
        return sections.reduce((paperTotal, section) => {
            return paperTotal + section.questions.reduce((sectionTotal, question) => {
                return sectionTotal + (Number(question.marks) || 0);
            }, 0);
        }, 0);
    }, [sections]);

    const selectedEvent = events.find((item) => item._id === event);

    const getEvents = async () => {
        try {
            setEventsLoading(true);
            setErrorMessage("");

            const result = await axios.get("/api/events");

            if (result.data?.success) {
                setEvents(result.data.event || result.data.events || []);
            } else {
                setEvents([]);
            }
        } catch (error) {
            console.log(error);

            if (error.response?.status === 404) {
                setEvents([]);
                setErrorMessage("");
                return;
            }

            setEvents([]);
            setErrorMessage(error.response?.data?.message || "Events could not be loaded");
        } finally {
            setEventsLoading(false);
        }
    };

    const updateInstruction = (index, value) => {
        setInstructions((previous) =>
            previous.map((instruction, instructionIndex) =>
                instructionIndex === index ? value : instruction,
            ),
        );
    };

    const addInstruction = () => {
        setInstructions((previous) => [
            ...previous,
            "",
        ]);
    };

    const removeInstruction = (index) => {
        setInstructions((previous) => {
            if (previous.length === 1) {
                return [""];
            }

            return previous.filter((instruction, instructionIndex) => instructionIndex !== index);
        });
    };

    const updateSection = (sectionIndex, field, value) => {
        setSections((previous) =>
            previous.map((section, index) =>
                index === sectionIndex
                    ? {
                        ...section,
                        [field]: value,
                    }
                    : section,
            ),
        );
    };

    const addSection = () => {
        setSections((previous) => {
            const nextQuestionNumber = getNextQuestionNumber(previous);

            return [
                ...previous,
                createSection(previous.length + 1, nextQuestionNumber),
            ];
        });
    };

    const removeSection = (sectionIndex) => {
        if (sections.length === 1) {
            toast.error("At least one section is required", toastOptions);
            return;
        }

        setSections((previous) =>
            previous.filter((section, index) => index !== sectionIndex),
        );
    };

    const updateQuestion = (sectionIndex, questionIndex, field, value) => {
        setSections((previous) =>
            previous.map((section, currentSectionIndex) => {
                if (currentSectionIndex !== sectionIndex) {
                    return section;
                }

                return {
                    ...section,
                    questions: section.questions.map((question, currentQuestionIndex) =>
                        currentQuestionIndex === questionIndex
                            ? {
                                ...question,
                                [field]: value,
                            }
                            : question,
                    ),
                };
            }),
        );
    };

    const changeQuestionType = (sectionIndex, questionIndex, type) => {
        setSections((previous) =>
            previous.map((section, currentSectionIndex) => {
                if (currentSectionIndex !== sectionIndex) {
                    return section;
                }

                return {
                    ...section,
                    questions: section.questions.map((question, currentQuestionIndex) => {
                        if (currentQuestionIndex !== questionIndex) {
                            return question;
                        }

                        return {
                            ...question,
                            type,
                            options: type === "mcq"
                                ? question.options.length >= 2
                                    ? question.options
                                    : createDefaultOptions()
                                : [],
                        };
                    }),
                };
            }),
        );
    };

    const addQuestion = (sectionIndex) => {
        setSections((previous) => {
            const nextQuestionNumber = getNextQuestionNumber(previous);

            return previous.map((section, currentSectionIndex) =>
                currentSectionIndex === sectionIndex
                    ? {
                        ...section,
                        questions: [
                            ...section.questions,
                            createQuestion(nextQuestionNumber),
                        ],
                    }
                    : section,
            );
        });
    };

    const removeQuestion = (sectionIndex, questionIndex) => {
        const section = sections[sectionIndex];

        if (!section || section.questions.length === 1) {
            toast.error("Every section must contain at least one question", toastOptions);
            return;
        }

        setSections((previous) =>
            previous.map((currentSection, currentSectionIndex) =>
                currentSectionIndex === sectionIndex
                    ? {
                        ...currentSection,
                        questions: currentSection.questions.filter(
                            (question, currentQuestionIndex) => currentQuestionIndex !== questionIndex,
                        ),
                    }
                    : currentSection,
            ),
        );
    };

    const updateOption = (sectionIndex, questionIndex, optionIndex, value) => {
        setSections((previous) =>
            previous.map((section, currentSectionIndex) => {
                if (currentSectionIndex !== sectionIndex) {
                    return section;
                }

                return {
                    ...section,
                    questions: section.questions.map((question, currentQuestionIndex) => {
                        if (currentQuestionIndex !== questionIndex) {
                            return question;
                        }

                        return {
                            ...question,
                            options: question.options.map((option, currentOptionIndex) =>
                                currentOptionIndex === optionIndex
                                    ? {
                                        ...option,
                                        text: value,
                                    }
                                    : option,
                            ),
                        };
                    }),
                };
            }),
        );
    };

    const addOption = (sectionIndex, questionIndex) => {
        const question = sections[sectionIndex]?.questions[questionIndex];

        if (!question) {
            return;
        }

        if (question.options.length >= 6) {
            toast.error("A maximum of six options is allowed", toastOptions);
            return;
        }

        setSections((previous) =>
            previous.map((section, currentSectionIndex) => {
                if (currentSectionIndex !== sectionIndex) {
                    return section;
                }

                return {
                    ...section,
                    questions: section.questions.map((currentQuestion, currentQuestionIndex) => {
                        if (currentQuestionIndex !== questionIndex) {
                            return currentQuestion;
                        }

                        const nextOptions = [
                            ...currentQuestion.options,
                            {
                                localId: createLocalId(),
                                label: "",
                                text: "",
                            },
                        ];

                        return {
                            ...currentQuestion,
                            options: normalizeOptions(nextOptions),
                        };
                    }),
                };
            }),
        );
    };

    const removeOption = (sectionIndex, questionIndex, optionIndex) => {
        const question = sections[sectionIndex]?.questions[questionIndex];

        if (!question) {
            return;
        }

        if (question.options.length <= 2) {
            toast.error("MCQ questions must contain at least two options", toastOptions);
            return;
        }

        setSections((previous) =>
            previous.map((section, currentSectionIndex) => {
                if (currentSectionIndex !== sectionIndex) {
                    return section;
                }

                return {
                    ...section,
                    questions: section.questions.map((currentQuestion, currentQuestionIndex) => {
                        if (currentQuestionIndex !== questionIndex) {
                            return currentQuestion;
                        }

                        const nextOptions = currentQuestion.options.filter(
                            (option, currentOptionIndex) => currentOptionIndex !== optionIndex,
                        );

                        return {
                            ...currentQuestion,
                            options: normalizeOptions(nextOptions),
                        };
                    }),
                };
            }),
        );
    };

    const validatePaper = () => {
        if (!event) {
            toast.error("Please select an event", toastOptions);
            return false;
        }

        if (!title.trim()) {
            toast.error("Paper title is required", toastOptions);
            return false;
        }

        const paperYear = Number(year);

        if (!Number.isInteger(paperYear) || paperYear < 1900 || paperYear > new Date().getFullYear()) {
            toast.error("Please enter a valid paper year", toastOptions);
            return false;
        }

        if (!duration.trim()) {
            toast.error("Paper duration is required", toastOptions);
            return false;
        }

        if (!Number(totalMarks) || Number(totalMarks) < 1) {
            toast.error("Total marks must be greater than zero", toastOptions);
            return false;
        }

        if (sections.length === 0) {
            toast.error("At least one section is required", toastOptions);
            return false;
        }

        const questionNumbers = [];

        for (let sectionIndex = 0; sectionIndex < sections.length; sectionIndex += 1) {
            const section = sections[sectionIndex];

            if (section.questions.length === 0) {
                toast.error(`Section ${sectionIndex + 1} must contain a question`, toastOptions);
                return false;
            }

            for (let questionIndex = 0; questionIndex < section.questions.length; questionIndex += 1) {
                const question = section.questions[questionIndex];
                const displayNumber = question.questionNumber || questionIndex + 1;

                if (!Number.isInteger(Number(question.questionNumber)) || Number(question.questionNumber) < 1) {
                    toast.error(`Question ${displayNumber} has an invalid question number`, toastOptions);
                    return false;
                }

                questionNumbers.push(Number(question.questionNumber));

                if (!question.statement.trim()) {
                    toast.error(`Statement for question ${displayNumber} is required`, toastOptions);
                    return false;
                }

                if (Number(question.marks) < 0 || Number.isNaN(Number(question.marks))) {
                    toast.error(`Question ${displayNumber} has invalid marks`, toastOptions);
                    return false;
                }

                if (question.type === "mcq") {
                    if (question.options.length < 2) {
                        toast.error(`Question ${displayNumber} must contain at least two options`, toastOptions);
                        return false;
                    }

                    if (question.options.some((option) => !option.text.trim())) {
                        toast.error(`Enter text for every option in question ${displayNumber}`, toastOptions);
                        return false;
                    }
                }
            }
        }

        if (new Set(questionNumbers).size !== questionNumbers.length) {
            toast.error("Every question must have a unique question number", toastOptions);
            return false;
        }

        return true;
    };

    const createPastPaper = async (status) => {
        if (isSubmitting || !validatePaper()) {
            return;
        }

        try {
            setSubmittingStatus(status);

            const paperData = {
                event,
                title: title.trim(),
                year: Number(year),
                paperCode: paperCode.trim(),
                duration: duration.trim(),
                totalMarks: Number(totalMarks),
                instructions: instructions
                    .map((instruction) => instruction.trim())
                    .filter(Boolean),
                sections: sections.map((section) => ({
                    title: section.title.trim(),
                    instructions: section.instructions.trim(),
                    questions: section.questions.map((question) => ({
                        questionNumber: Number(question.questionNumber),
                        type: question.type,
                        statement: question.statement.trim(),
                        marks: Number(question.marks) || 0,
                        options: question.type === "mcq"
                            ? question.options.map((option, optionIndex) => ({
                                label: String.fromCharCode(65 + optionIndex),
                                text: option.text.trim(),
                            }))
                            : [],
                    })),
                })),
                creationMethod: "manual",
                status,
            };

            const result = await axios.post("/api/past-papers", paperData);

            if (!result.data?.success) {
                toast.error(result.data?.message || "Past paper could not be created", toastOptions);
                return;
            }

            toast.success(
                result.data?.message ||
                (status === "published"
                    ? "Past paper is created and published"
                    : "Past paper is saved as draft"),
                toastOptions,
            );

            router.replace("/admin/past-papers");
            router.refresh();
        } catch (error) {
            console.log(error);

            toast.error(error.response?.data?.message || "Past paper could not be created", toastOptions);
        } finally {
            setSubmittingStatus("");
        }
    };

    useEffect(() => {
        getEvents();
    }, []);

    return (
        <div className="min-h-screen bg-[#f5f7fb]">
            <AdminHeader user={user} />

            <main className="mx-auto w-full max-w-[1200px] px-3 py-5 sm:px-6 sm:py-7 lg:px-8">
                <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-2 text-xs sm:text-sm">
                    <Link href="/admin/past-papers" className="flex items-center gap-1.5 font-semibold text-slate-500 transition hover:text-blue-700">
                        <ArrowLeft size={16} />
                        Past Papers
                    </Link>

                    <span className="text-slate-300">/</span>

                    <span className="font-semibold text-blue-700">
                        Create
                    </span>
                </nav>

                <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
                    <div className="min-w-0">
                        <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-blue-600">
                            Manual paper creation
                        </p>

                        <h1 className="mt-1.5 text-xl font-extrabold tracking-tight text-[#071a4a] sm:text-2xl">
                            Create Past Paper
                        </h1>

                        <p className="mt-1.5 max-w-2xl text-xs leading-5 text-slate-500 sm:text-sm">
                            Create a structured event-based paper containing instructions, sections and questions.
                        </p>
                    </div>

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <FileText size={23} />
                    </div>
                </section>

                {errorMessage && (
                    <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                        <CircleAlert size={18} className="mt-0.5 shrink-0 text-red-500" />

                        <div>
                            <p className="text-xs font-bold text-red-700">
                                Events could not be loaded
                            </p>

                            <p className="mt-1 text-[10px] text-red-600">
                                {errorMessage}
                            </p>

                            <button type="button" onClick={getEvents} className="mt-2 text-[10px] font-bold text-red-700 underline">
                                Try again
                            </button>
                        </div>
                    </div>
                )}

                <div className="mt-5 grid items-start gap-5 lg:grid-cols-[270px_minmax(0,1fr)]">
                    <aside className="space-y-4 lg:sticky lg:top-24">
                        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="bg-[#102a63] p-5 text-white">
                                <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-blue-200">
                                    Paper summary
                                </p>

                                <h2 className="mt-2 break-words text-base font-extrabold">
                                    {title.trim() || "Untitled Past Paper"}
                                </h2>

                                <p className="mt-1 text-[10px] text-blue-100">
                                    {selectedEvent?.name || "No event selected"}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-2 p-4">
                                <SummaryItem label="Sections" value={sections.length} />
                                <SummaryItem label="Questions" value={totalQuestions} />
                                <SummaryItem label="Paper Marks" value={totalMarks || 0} />
                                <SummaryItem label="Question Marks" value={calculatedMarks} />
                            </div>
                        </section>

                        {Number(totalMarks) > 0 && calculatedMarks !== Number(totalMarks) && (
                            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                                <p className="text-[10px] font-bold text-amber-700">
                                    Marks difference
                                </p>

                                <p className="mt-1 text-[9px] leading-4 text-amber-600">
                                    The question marks total is {calculatedMarks}, while the paper total is {totalMarks}. This is allowed when a paper contains optional questions.
                                </p>
                            </div>
                        )}
                    </aside>

                    <div className="space-y-5">
                        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <SectionHeader icon={ClipboardList} label="Paper setup" title="Basic Information" description="Select the event and enter the examination paper details." />

                            <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
                                <FormField label="Event" required>
                                    <select value={event} onChange={(inputEvent) => setEvent(inputEvent.target.value)} disabled={eventsLoading || isSubmitting} className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-xs text-[#071a4a] outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50">
                                        <option value="">
                                            {eventsLoading ? "Loading events..." : "Select event"}
                                        </option>

                                        {events.map((item) => (
                                            <option key={item._id} value={item._id}>
                                                {item.name}
                                            </option>
                                        ))}
                                    </select>
                                </FormField>

                                <FormField label="Paper title" required>
                                    <input type="text" value={title} onChange={(inputEvent) => setTitle(inputEvent.target.value)} disabled={isSubmitting} placeholder="Example: MDCAT Past Paper" className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-xs text-[#071a4a] outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50" />
                                </FormField>

                                <FormField label="Year" required>
                                    <input type="number" min="1900" max={new Date().getFullYear()} value={year} onChange={(inputEvent) => setYear(inputEvent.target.value)} disabled={isSubmitting} className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-xs text-[#071a4a] outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50" />
                                </FormField>

                                <FormField label="Paper code">
                                    <input type="text" value={paperCode} onChange={(inputEvent) => setPaperCode(inputEvent.target.value)} disabled={isSubmitting} placeholder="Example: BIO-2025-A" className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-xs uppercase text-[#071a4a] outline-none transition placeholder:normal-case placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50" />
                                </FormField>

                                <FormField label="Duration" required>
                                    <input type="text" value={duration} onChange={(inputEvent) => setDuration(inputEvent.target.value)} disabled={isSubmitting} placeholder="Example: 3 Hours" className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-xs text-[#071a4a] outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50" />
                                </FormField>

                                <FormField label="Total marks" required>
                                    <input type="number" min="1" value={totalMarks} onChange={(inputEvent) => setTotalMarks(inputEvent.target.value)} disabled={isSubmitting} placeholder="Example: 200" className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-xs text-[#071a4a] outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50" />
                                </FormField>
                            </div>
                        </section>

                        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6">
                                <div>
                                    <p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-blue-600">
                                        Paper guidelines
                                    </p>

                                    <h2 className="mt-1 text-base font-extrabold text-[#071a4a]">
                                        General Instructions
                                    </h2>
                                </div>

                                <button type="button" onClick={addInstruction} disabled={isSubmitting} className="flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 text-[9px] font-bold text-white transition hover:bg-blue-700 disabled:bg-blue-400">
                                    <Plus size={14} />
                                    Add
                                </button>
                            </div>

                            <div className="space-y-3 p-5 sm:p-6">
                                {instructions.map((instruction, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[10px] font-extrabold text-blue-700">
                                            {index + 1}
                                        </span>

                                        <input type="text" value={instruction} onChange={(inputEvent) => updateInstruction(index, inputEvent.target.value)} disabled={isSubmitting} placeholder="Enter paper instruction" className="h-11 min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 text-xs text-[#071a4a] outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50" />

                                        <button type="button" onClick={() => removeInstruction(index)} disabled={isSubmitting} aria-label={`Remove instruction ${index + 1}`} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-500 transition hover:bg-red-600 hover:text-white disabled:opacity-50">
                                            <X size={15} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <div className="space-y-5">
                            {sections.map((section, sectionIndex) => (
                                <PaperSection key={section.localId} section={section} sectionIndex={sectionIndex} sectionsCount={sections.length} disabled={isSubmitting} updateSection={updateSection} removeSection={removeSection} addQuestion={addQuestion} updateQuestion={updateQuestion} changeQuestionType={changeQuestionType} removeQuestion={removeQuestion} updateOption={updateOption} addOption={addOption} removeOption={removeOption} />
                            ))}
                        </div>

                        <button type="button" onClick={addSection} disabled={isSubmitting} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-blue-300 bg-blue-50 text-xs font-bold text-blue-700 transition hover:border-blue-500 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50">
                            <Layers3 size={17} />
                            Add Another Section
                        </button>

                        <section className="flex flex-col-reverse gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                            <Link href="/admin/past-papers" className="flex h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 text-xs font-bold text-slate-600 transition hover:bg-slate-50">
                                Cancel
                            </Link>

                            <div className="grid grid-cols-2 gap-3 sm:flex">
                                <button type="button" onClick={() => createPastPaper("draft")} disabled={isSubmitting} className="flex h-11 items-center justify-center gap-2 rounded-xl border border-blue-600 bg-white px-4 text-xs font-bold text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50 sm:px-5">
                                    {submittingStatus === "draft" ? (
                                        <>
                                            <LoaderCircle size={16} className="animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={16} />
                                            Save Draft
                                        </>
                                    )}
                                </button>

                                <button type="button" onClick={() => createPastPaper("published")} disabled={isSubmitting} className="flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400 sm:px-5">
                                    {submittingStatus === "published" ? (
                                        <>
                                            <LoaderCircle size={16} className="animate-spin" />
                                            Publishing...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 size={16} />
                                            Publish
                                        </>
                                    )}
                                </button>
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
};

const PaperSection = ({
    section,
    sectionIndex,
    sectionsCount,
    disabled,
    updateSection,
    removeSection,
    addQuestion,
    updateQuestion,
    changeQuestionType,
    removeQuestion,
    updateOption,
    addOption,
    removeOption,
}) => {
    return (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-3 bg-[#102a63] px-5 py-4 text-white sm:px-6">
                <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10">
                        <Layers3 size={18} />
                    </div>

                    <div className="min-w-0">
                        <p className="text-[8px] font-extrabold uppercase tracking-[0.12em] text-blue-200">
                            Paper section
                        </p>

                        <h2 className="mt-0.5 truncate text-sm font-extrabold">
                            {section.title || `Section ${sectionIndex + 1}`}
                        </h2>
                    </div>
                </div>

                <button type="button" onClick={() => removeSection(sectionIndex)} disabled={disabled || sectionsCount === 1} aria-label={`Remove section ${sectionIndex + 1}`} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-500/20 text-red-100 transition hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40">
                    <Trash2 size={15} />
                </button>
            </div>

            <div className="grid gap-4 border-b border-slate-200 p-5 sm:grid-cols-2 sm:p-6">
                <FormField label="Section title">
                    <input type="text" value={section.title} onChange={(inputEvent) => updateSection(sectionIndex, "title", inputEvent.target.value)} disabled={disabled} placeholder="Example: Section A" className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-xs text-[#071a4a] outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50" />
                </FormField>

                <FormField label="Section instructions">
                    <input type="text" value={section.instructions} onChange={(inputEvent) => updateSection(sectionIndex, "instructions", inputEvent.target.value)} disabled={disabled} placeholder="Example: Attempt all questions" className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-xs text-[#071a4a] outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50" />
                </FormField>
            </div>

            <div className="space-y-4 bg-slate-50/70 p-4 sm:p-5">
                {section.questions.map((question, questionIndex) => (
                    <QuestionEditor key={question.localId} question={question} questionIndex={questionIndex} sectionIndex={sectionIndex} questionCount={section.questions.length} disabled={disabled} updateQuestion={updateQuestion} changeQuestionType={changeQuestionType} removeQuestion={removeQuestion} updateOption={updateOption} addOption={addOption} removeOption={removeOption} />
                ))}

                <button type="button" onClick={() => addQuestion(sectionIndex)} disabled={disabled} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-blue-300 bg-white text-[10px] font-bold text-blue-700 transition hover:border-blue-500 hover:bg-blue-50 disabled:opacity-50">
                    <Plus size={15} />
                    Add Question
                </button>
            </div>
        </section>
    );
};

const QuestionEditor = ({
    question,
    questionIndex,
    sectionIndex,
    questionCount,
    disabled,
    updateQuestion,
    changeQuestionType,
    removeQuestion,
    updateOption,
    addOption,
    removeOption,
}) => {
    return (
        <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 min-w-8 items-center justify-center rounded-lg bg-blue-600 px-2 text-[10px] font-extrabold text-white">
                        Q{question.questionNumber || questionIndex + 1}
                    </div>

                    <p className="text-xs font-extrabold text-[#071a4a]">
                        Question Details
                    </p>
                </div>

                <button type="button" onClick={() => removeQuestion(sectionIndex, questionIndex)} disabled={disabled || questionCount === 1} aria-label={`Remove question ${question.questionNumber}`} className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-500 transition hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-40">
                    <Trash2 size={14} />
                </button>
            </div>

            <div className="grid gap-4 p-4 sm:grid-cols-[120px_180px_120px_minmax(0,1fr)]">
                <FormField label="Number" required>
                    <input type="number" min="1" value={question.questionNumber} onChange={(inputEvent) => updateQuestion(sectionIndex, questionIndex, "questionNumber", inputEvent.target.value)} disabled={disabled} className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-xs text-[#071a4a] outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50" />
                </FormField>

                <FormField label="Question type" required>
                    <select value={question.type} onChange={(inputEvent) => changeQuestionType(sectionIndex, questionIndex, inputEvent.target.value)} disabled={disabled} className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-xs text-[#071a4a] outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50">
                        {questionTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </select>
                </FormField>

                <FormField label="Marks" required>
                    <input type="number" min="0" value={question.marks} onChange={(inputEvent) => updateQuestion(sectionIndex, questionIndex, "marks", inputEvent.target.value)} disabled={disabled} className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-xs text-[#071a4a] outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50" />
                </FormField>

                <FormField label="Statement" required>
                    <textarea value={question.statement} onChange={(inputEvent) => updateQuestion(sectionIndex, questionIndex, "statement", inputEvent.target.value)} disabled={disabled} rows={3} placeholder="Enter the complete question statement" className="w-full resize-y rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs leading-5 text-[#071a4a] outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50" />
                </FormField>
            </div>

            {question.type === "mcq" && (
                <div className="border-t border-slate-200 bg-slate-50 px-4 py-4">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-[9px] font-extrabold uppercase tracking-[0.1em] text-blue-600">
                                Answer options
                            </p>

                            <p className="mt-1 text-[9px] text-slate-500">
                                Enter the choices exactly as they should appear on the paper.
                            </p>
                        </div>

                        <button type="button" onClick={() => addOption(sectionIndex, questionIndex)} disabled={disabled || question.options.length >= 6} className="flex h-8 shrink-0 items-center justify-center gap-1 rounded-lg bg-blue-600 px-3 text-[8px] font-bold text-white transition hover:bg-blue-700 disabled:bg-blue-400">
                            <Plus size={12} />
                            Option
                        </button>
                    </div>

                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        {question.options.map((option, optionIndex) => (
                            <div key={option.localId} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-2">
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[10px] font-extrabold text-blue-700">
                                    {String.fromCharCode(65 + optionIndex)}
                                </span>

                                <input type="text" value={option.text} onChange={(inputEvent) => updateOption(sectionIndex, questionIndex, optionIndex, inputEvent.target.value)} disabled={disabled} placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`} className="h-9 min-w-0 flex-1 border-0 bg-transparent px-1 text-xs text-[#071a4a] outline-none placeholder:text-slate-400" />

                                <button type="button" onClick={() => removeOption(sectionIndex, questionIndex, optionIndex)} disabled={disabled || question.options.length <= 2} aria-label={`Remove option ${optionIndex + 1}`} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-red-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-30">
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </article>
    );
};

const SectionHeader = ({ icon: Icon, label, title, description }) => {
    return (
        <div className="flex items-start gap-3 border-b border-slate-200 px-5 py-4 sm:px-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Icon size={19} />
            </div>

            <div>
                <p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-blue-600">
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
};

const FormField = ({ label, required = false, children }) => {
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

const SummaryItem = ({ label, value }) => {
    return (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-[8px] font-extrabold uppercase tracking-[0.1em] text-slate-400">
                {label}
            </p>

            <p className="mt-1 text-sm font-extrabold text-[#071a4a]">
                {value}
            </p>
        </div>
    );
};

const AdminHeader = ({ user }) => {
    const [showUserMenu, setShowUserMenu] = useState(false);
    const menuRef = useRef(null);

    const accountName = user
        ? `${user.firstname || ""} ${user.lastname || ""}`.trim() || "Administrator"
        : "Administrator";

    useEffect(() => {
        const closeUserMenu = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowUserMenu(false);
            }
        };

        document.addEventListener("mousedown", closeUserMenu);

        return () => {
            document.removeEventListener("mousedown", closeUserMenu);
        };
    }, []);

    return (
        <header className="sticky top-0 z-50 bg-[#102a63] px-3 py-2 text-white shadow-sm sm:px-6">
            <div className="mx-auto flex h-14 w-full max-w-[1500px] items-center gap-2 sm:h-16 sm:gap-4">
                <Link href="/admin" className="flex min-w-0 max-w-[48%] items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-2.5 py-2 text-white transition hover:bg-white/15 sm:max-w-none sm:gap-3 sm:px-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[#102a63] sm:h-10 sm:w-10">
                        <GraduationCap size={21} />
                    </div>

                    <div className="min-w-0">
                        <span className="block truncate text-[11px] font-bold sm:text-sm">
                            StudiesForge
                        </span>

                        <span className="block truncate text-[9px] text-blue-200 sm:text-xs">
                            Admin Console
                        </span>
                    </div>
                </Link>

                <div ref={menuRef} className="relative ml-auto min-w-0 max-w-[52%] sm:max-w-none">
                    <button type="button" aria-label="Open admin account menu" aria-haspopup="menu" aria-expanded={showUserMenu} onClick={() => setShowUserMenu((previous) => !previous)} className="flex w-full min-w-0 items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-2.5 py-2 text-left text-white transition hover:bg-white/15 sm:gap-3 sm:px-4">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white text-xs font-bold uppercase text-[#102a63] sm:h-10 sm:w-10 sm:text-sm">
                            {user?.profileimage?.url ? (
                                <img src={user.profileimage.url} alt={accountName} className="h-full w-full object-cover" />
                            ) : (
                                user?.firstname?.charAt(0) || "A"
                            )}
                        </div>

                        <div className="min-w-0">
                            <span className="block truncate text-[11px] font-bold sm:max-w-52 sm:text-sm">
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

const normalizeOptions = (options) => {
    return options.map((option, index) => ({
        ...option,
        label: String.fromCharCode(65 + index),
    }));
};

const getNextQuestionNumber = (sections) => {
    const questionNumbers = sections.flatMap((section) =>
        section.questions.map((question) => Number(question.questionNumber) || 0),
    );

    return questionNumbers.length > 0
        ? Math.max(...questionNumbers) + 1
        : 1;
};

export default CreatePastPaperPage;