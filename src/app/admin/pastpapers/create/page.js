"use client";

import { useUser } from "@/context/userContext";
import axios from "axios";
import Link from "next/link";
import {
    ArrowLeft,
    BookOpen,
    Camera,
    CheckCircle2,
    ChevronDown,
    CircleAlert,
    ExternalLink,
    FileText,
    GraduationCap,
    LoaderCircle,
    Plus,
    Save,
    Settings2,
    Trash2,
    Upload,
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
    if (
        typeof crypto !== "undefined" &&
        crypto.randomUUID
    ) {
        return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random()}`;
};

const createOptions = () => {
    return ["A", "B", "C", "D"].map(
        (label) => ({
            localId: createLocalId(),
            option_number: label,
            option_text: "",
        })
    );
};

const createMcq = (srNumber = 1) => {
    return {
        localId: createLocalId(),
        sr_number: srNumber,
        statement: "",
        options: createOptions(),
        correctOption: "",
    };
};

const createDetailQuestion = (
    srNumber = 1
) => {
    return {
        localId: createLocalId(),
        sr_number: srNumber,
        statement: "",
    };
};

const CreatePastPaperPage = () => {
    const router = useRouter();
    const { user } = useUser();

    const [events, setEvents] = useState([]);
    const [eventsLoading, setEventsLoading] =
        useState(true);
    const [errorMessage, setErrorMessage] =
        useState("");

    const [event, setEvent] = useState("");
    const [name, setName] = useState("");
    const [year, setYear] = useState(
        new Date().getFullYear()
    );
    const [instruction, setInstruction] =
        useState("");
    const [section, setSection] = useState("");

    const [mcqs, setMcqs] = useState([]);
    const [detailQuestions, setDetailQuestions] =
        useState([]);

    const [submitting, setSubmitting] =
        useState(false);

    const [scanning, setScanning] =
        useState(false);
    const [scanError, setScanError] =
        useState("");
    const [scanFile, setScanFile] =
        useState(null);

    const selectedEvent = events.find(
        (item) => item._id === event
    );

    const getEvents = async () => {
        try {
            setEventsLoading(true);
            setErrorMessage("");

            const result = await axios.get(
                "/api/events"
            );

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

            if (
                error.response?.status ===
                404
            ) {
                setEvents([]);
                return;
            }

            setEvents([]);

            setErrorMessage(
                error.response?.data
                    ?.message ||
                "Events could not be loaded"
            );
        } finally {
            setEventsLoading(false);
        }
    };

    const scanPastPaper = async (file) => {
        if (
            !file ||
            scanning ||
            submitting
        ) {
            return;
        }

        if (
            !file.type?.startsWith("image/")
        ) {
            toast.error(
                "Please select a valid image file",
                toastOptions
            );
            return;
        }

        try {
            setScanning(true);
            setScanError("");
            setScanFile(file);

            const formData = new FormData();

            formData.append(
                "image",
                file
            );

            const result =
                await axios.post(
                    "/api/pastpapers/extract",
                    formData
                );

            console.log(
                "OCR API response:",
                result.data
            );

            if (
                !result.data?.success
            ) {
                throw new Error(
                    result.data
                        ?.message ||
                    "Paper could not be extracted"
                );
            }

            const data =
                result.data?.data || {};

            console.log(
                "Extracted paper data:",
                data
            );

            setName(
                typeof data.name ===
                    "string"
                    ? data.name.trim()
                    : ""
            );

            setYear(
                data.year
                    ? Number(data.year)
                    : new Date().getFullYear()
            );

            setInstruction(
                typeof data.instruction ===
                    "string"
                    ? data.instruction.trim()
                    : ""
            );

            setSection(
                typeof data.section ===
                    "string"
                    ? data.section.trim()
                    : ""
            );

            const extractedMcqs =
                Array.isArray(data.mcq)
                    ? data.mcq
                    : [];

            const normalizedMcqs =
                extractedMcqs.map(
                    (mcq, index) => {
                        const options =
                            Array.isArray(
                                mcq.options
                            )
                                ? mcq.options
                                : [];

                        const normalizedOptions =
                            options.map(
                                (
                                    option,
                                    optionIndex
                                ) => ({
                                    localId:
                                        createLocalId(),

                                    option_number:
                                        typeof option.option_number ===
                                            "string" &&
                                            option.option_number.trim()
                                            ? option.option_number
                                                .trim()
                                                .toUpperCase()
                                            : String.fromCharCode(
                                                65 +
                                                optionIndex
                                            ),

                                    option_text:
                                        typeof option.option_text ===
                                            "string"
                                            ? option.option_text.trim()
                                            : "",
                                })
                            );

                        const extractedCorrect =
                            typeof mcq.correctOption ===
                                "string"
                                ? mcq.correctOption
                                    .trim()
                                    .toUpperCase()
                                : "";

                        const correctOption =
                            normalizedOptions.some(
                                (option) =>
                                    option.option_number ===
                                    extractedCorrect
                            )
                                ? extractedCorrect
                                : "";

                        return {
                            localId:
                                createLocalId(),

                            sr_number:
                                Number(
                                    mcq.sr_number
                                ) ||
                                index + 1,

                            statement:
                                typeof mcq.statement ===
                                    "string"
                                    ? mcq.statement.trim()
                                    : "",

                            options:
                                normalizedOptions.length
                                    ? normalizedOptions
                                    : createOptions(),

                            correctOption,
                        };
                    }
                );

            setMcqs(normalizedMcqs);

            const extractedDetailQuestions =
                Array.isArray(
                    data.detailQuestions
                )
                    ? data.detailQuestions
                    : [];

            const normalizedDetailQuestions =
                extractedDetailQuestions.map(
                    (
                        question,
                        index
                    ) => ({
                        localId:
                            createLocalId(),

                        sr_number:
                            Number(
                                question.sr_number
                            ) ||
                            index + 1,

                        statement:
                            typeof question.statement ===
                                "string"
                                ? question.statement.trim()
                                : "",
                    })
                );

            setDetailQuestions(
                normalizedDetailQuestions
            );

            toast.success(
                `Paper extracted: ${normalizedMcqs.length} MCQs and ${normalizedDetailQuestions.length} written questions.`,
                toastOptions
            );
        } catch (error) {
            console.error(
                "Past paper OCR error:",
                error
            );

            const message =
                error.response?.data
                    ?.message ||
                error.message ||
                "Paper could not be scanned";

            setScanError(message);

            toast.error(
                message,
                toastOptions
            );
        } finally {
            setScanning(false);
        }
    };

    const handleImageUpload = (
        inputEvent
    ) => {
        const file =
            inputEvent.target.files?.[0];

        if (file) {
            scanPastPaper(file);
        }

        inputEvent.target.value = "";
    };

    const addMcq = () => {
        setMcqs((previous) => [
            ...previous,
            createMcq(
                previous.length + 1
            ),
        ]);
    };

    const removeMcq = (index) => {
        setMcqs((previous) => {
            const updated =
                previous.filter(
                    (_, currentIndex) =>
                        currentIndex !==
                        index
                );

            return updated.map(
                (mcq, currentIndex) => ({
                    ...mcq,
                    sr_number:
                        currentIndex + 1,
                })
            );
        });
    };

    const updateMcq = (
        index,
        field,
        value
    ) => {
        setMcqs((previous) =>
            previous.map(
                (
                    mcq,
                    currentIndex
                ) =>
                    currentIndex ===
                        index
                        ? {
                            ...mcq,
                            [field]:
                                value,
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
            previous.map(
                (
                    mcq,
                    currentMcqIndex
                ) => {
                    if (
                        currentMcqIndex !==
                        mcqIndex
                    ) {
                        return mcq;
                    }

                    return {
                        ...mcq,

                        options:
                            mcq.options.map(
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
                }
            )
        );
    };

    const addMcqOption = (
        mcqIndex
    ) => {
        setMcqs((previous) =>
            previous.map(
                (
                    mcq,
                    currentMcqIndex
                ) => {
                    if (
                        currentMcqIndex !==
                        mcqIndex
                    ) {
                        return mcq;
                    }

                    if (
                        mcq.options.length >=
                        6
                    ) {
                        toast.error(
                            "A maximum of six options is allowed",
                            toastOptions
                        );

                        return mcq;
                    }

                    const nextLabel =
                        String.fromCharCode(
                            65 +
                            mcq
                                .options
                                .length
                        );

                    return {
                        ...mcq,

                        options: [
                            ...mcq.options,
                            {
                                localId:
                                    createLocalId(),
                                option_number:
                                    nextLabel,
                                option_text:
                                    "",
                            },
                        ],
                    };
                }
            )
        );
    };

    const removeMcqOption = (
        mcqIndex,
        optionIndex
    ) => {
        setMcqs((previous) =>
            previous.map(
                (
                    mcq,
                    currentMcqIndex
                ) => {
                    if (
                        currentMcqIndex !==
                        mcqIndex
                    ) {
                        return mcq;
                    }

                    if (
                        mcq.options.length <=
                        2
                    ) {
                        toast.error(
                            "MCQ questions must contain at least two options",
                            toastOptions
                        );

                        return mcq;
                    }

                    const updatedOptions =
                        mcq.options
                            .filter(
                                (
                                    _,
                                    currentOptionIndex
                                ) =>
                                    currentOptionIndex !==
                                    optionIndex
                            )
                            .map(
                                (
                                    option,
                                    currentOptionIndex
                                ) => ({
                                    ...option,
                                    option_number:
                                        String.fromCharCode(
                                            65 +
                                            currentOptionIndex
                                        ),
                                })
                            );

                    const validCorrect =
                        updatedOptions.some(
                            (option) =>
                                option.option_number ===
                                mcq.correctOption
                        );

                    return {
                        ...mcq,

                        options:
                            updatedOptions,

                        correctOption:
                            validCorrect
                                ? mcq.correctOption
                                : "",
                    };
                }
            )
        );
    };

    const addDetailQuestion =
        () => {
            setDetailQuestions(
                (previous) => [
                    ...previous,
                    createDetailQuestion(
                        previous.length +
                        1
                    ),
                ]
            );
        };

    const removeDetailQuestion =
        (index) => {
            setDetailQuestions(
                (previous) => {
                    const updated =
                        previous.filter(
                            (
                                _,
                                currentIndex
                            ) =>
                                currentIndex !==
                                index
                        );

                    return updated.map(
                        (
                            question,
                            currentIndex
                        ) => ({
                            ...question,
                            sr_number:
                                currentIndex +
                                1,
                        })
                    );
                }
            );
        };

    const updateDetailQuestion =
        (index, value) => {
            setDetailQuestions(
                (previous) =>
                    previous.map(
                        (
                            question,
                            currentIndex
                        ) =>
                            currentIndex ===
                                index
                                ? {
                                    ...question,
                                    statement:
                                        value,
                                }
                                : question
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

        const paperYear =
            Number(year);

        if (
            !Number.isInteger(
                paperYear
            ) ||
            paperYear < 1900 ||
            paperYear >
            new Date().getFullYear()
        ) {
            toast.error(
                "Please enter a valid paper year",
                toastOptions
            );

            return false;
        }

        if (
            !instruction.trim()
        ) {
            toast.error(
                "Paper instruction is required",
                toastOptions
            );

            return false;
        }

        if (
            mcqs.length === 0 &&
            detailQuestions.length ===
            0
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
            const mcq =
                mcqs[index];

            if (
                !mcq.statement.trim()
            ) {
                toast.error(
                    `Statement for MCQ ${index + 1
                    } is required`,
                    toastOptions
                );

                return false;
            }

            if (
                mcq.options.length < 2
            ) {
                toast.error(
                    `MCQ ${index + 1
                    } must have at least two options`,
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
                    `Please complete every option in MCQ ${index + 1
                    }`,
                    toastOptions
                );

                return false;
            }

            if (
                !mcq.correctOption
            ) {
                toast.error(
                    `Please select the correct option for MCQ ${index + 1
                    }`,
                    toastOptions
                );

                return false;
            }

            const correctExists =
                mcq.options.some(
                    (option) =>
                        option.option_number ===
                        mcq.correctOption
                );

            if (!correctExists) {
                toast.error(
                    `Invalid correct option for MCQ ${index + 1
                    }`,
                    toastOptions
                );

                return false;
            }
        }

        for (
            let index = 0;
            index <
            detailQuestions.length;
            index += 1
        ) {
            if (
                !detailQuestions[
                    index
                ].statement.trim()
            ) {
                toast.error(
                    `Statement for question ${index + 1
                    } is required`,
                    toastOptions
                );

                return false;
            }
        }

        return true;
    };

    const createPastPaper =
        async () => {
            if (
                submitting ||
                scanning ||
                !validatePaper()
            ) {
                return;
            }

            try {
                setSubmitting(true);

                const paperData = {
                    event,

                    name: name.trim(),

                    year: Number(year),

                    instruction:
                        instruction.trim(),

                    section:
                        section.trim(),

                    mcq: mcqs.map(
                        (mcq) => ({
                            sr_number:
                                Number(
                                    mcq.sr_number
                                ),

                            statement:
                                mcq.statement.trim(),

                            options:
                                mcq.options.map(
                                    (
                                        option
                                    ) => ({
                                        option_number:
                                            option.option_number,

                                        option_text:
                                            option.option_text.trim(),
                                    })
                                ),

                            correctOption:
                                mcq.correctOption,
                        })
                    ),

                    detailQuestions:
                        detailQuestions.map(
                            (
                                question
                            ) => ({
                                sr_number:
                                    Number(
                                        question.sr_number
                                    ),

                                statement:
                                    question.statement.trim(),
                            })
                        ),
                };

                const result =
                    await axios.post(
                        "/api/pastpapers",
                        paperData
                    );

                if (
                    !result.data
                        ?.success
                ) {
                    toast.error(
                        result.data
                            ?.message ||
                        "Past paper could not be created",
                        toastOptions
                    );

                    return;
                }

                toast.success(
                    result.data
                        ?.message ||
                    "Past paper is created",
                    toastOptions
                );

                router.replace(
                    "/admin/pastpapers"
                );

                router.refresh();
            } catch (error) {
                console.log(error);

                toast.error(
                    error.response?.data
                        ?.message ||
                    "Past paper could not be created",
                    toastOptions
                );
            } finally {
                setSubmitting(false);
            }
        };

    useEffect(() => {
        getEvents();
    }, []);

    return (
        <div className="min-h-screen bg-[#f5f7fb]">
            <AdminHeader
                user={user}
            />

            <main className="mx-auto w-full max-w-[1200px] px-3 py-5 sm:px-6 sm:py-7 lg:px-8">
                <nav
                    aria-label="Breadcrumb"
                    className="mb-5 flex items-center gap-2 text-xs sm:text-sm"
                >
                    <Link
                        href="/admin/pastpapers"
                        className="flex items-center gap-1.5 font-semibold text-slate-500 transition hover:text-blue-700"
                    >
                        <ArrowLeft
                            size={16}
                        />
                        Past Papers
                    </Link>

                    <span className="text-slate-300">
                        /
                    </span>

                    <span className="font-semibold text-blue-700">
                        Create
                    </span>
                </nav>

                <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
                    <div className="min-w-0">
                        <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-blue-600">
                            Past paper creation
                        </p>

                        <h1 className="mt-1.5 text-xl font-extrabold tracking-tight text-[#071a4a] sm:text-2xl">
                            Create Past Paper
                        </h1>

                        <p className="mt-1.5 max-w-2xl text-xs leading-5 text-slate-500 sm:text-sm">
                            Enter the paper manually or scan a paper image to extract its content into the editable form.
                        </p>
                    </div>

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <FileText
                            size={23}
                        />
                    </div>
                </section>

                {errorMessage && (
                    <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                        <CircleAlert
                            size={18}
                            className="mt-0.5 shrink-0 text-red-500"
                        />

                        <div>
                            <p className="text-xs font-bold text-red-700">
                                Events could not be loaded
                            </p>

                            <p className="mt-1 text-[10px] text-red-600">
                                {
                                    errorMessage
                                }
                            </p>

                            <button
                                type="button"
                                onClick={
                                    getEvents
                                }
                                className="mt-2 text-[10px] font-bold text-red-700 underline"
                            >
                                Try again
                            </button>
                        </div>
                    </div>
                )}

                <input
                    id="pastpaper-image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={
                        scanning ||
                        submitting
                    }
                    onChange={
                        handleImageUpload
                    }
                />

                <input
                    id="pastpaper-camera"
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    disabled={
                        scanning ||
                        submitting
                    }
                    onChange={
                        handleImageUpload
                    }
                />

                <div className="mt-5 grid items-start gap-5 lg:grid-cols-[270px_minmax(0,1fr)]">
                    <aside className="space-y-4 lg:sticky lg:top-24">
                        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="bg-[#102a63] p-5 text-white">
                                <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-blue-200">
                                    Paper summary
                                </p>

                                <h2 className="mt-2 break-words text-base font-extrabold">
                                    {name.trim() ||
                                        "Untitled Past Paper"}
                                </h2>

                                <p className="mt-1 text-[10px] text-blue-100">
                                    {selectedEvent?.name ||
                                        "No event selected"}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-2 p-4">
                                <SummaryItem
                                    label="Year"
                                    value={
                                        year ||
                                        "—"
                                    }
                                />

                                <SummaryItem
                                    label="MCQs"
                                    value={
                                        mcqs.length
                                    }
                                />

                                <SummaryItem
                                    label="Written"
                                    value={
                                        detailQuestions.length
                                    }
                                />

                                <SummaryItem
                                    label="Questions"
                                    value={
                                        mcqs.length +
                                        detailQuestions.length
                                    }
                                />
                            </div>
                        </section>

                        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                            <p className="text-[10px] font-bold text-blue-700">
                                Paper structure
                            </p>

                            <p className="mt-1 text-[9px] leading-4 text-blue-600">
                                MCQs and written questions are independent. You can use either one or both.
                            </p>
                        </div>
                    </aside>

                    <div className="space-y-5">
                        <section className="overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-sm">
                            <div className="border-b border-blue-100 bg-blue-50 px-5 py-4 sm:px-6">
                                <p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-blue-600">
                                    Fast import
                                </p>

                                <h2 className="mt-1 text-base font-extrabold text-[#071a4a]">
                                    Scan Past Paper
                                </h2>

                                <p className="mt-1 max-w-2xl text-[10px] leading-5 text-slate-500 sm:text-xs">
                                    Upload a clear paper image or use your camera. Extracted information will be placed into the editable form below.
                                </p>
                            </div>

                            <div className="p-5 sm:p-6">
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <label
                                        htmlFor="pastpaper-image-upload"
                                        className={`flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 text-xs font-bold text-blue-700 transition hover:bg-blue-100 ${scanning ||
                                                submitting
                                                ? "pointer-events-none opacity-50"
                                                : ""
                                            }`}
                                    >
                                        {scanning ? (
                                            <LoaderCircle
                                                size={
                                                    17
                                                }
                                                className="animate-spin"
                                            />
                                        ) : (
                                            <Upload
                                                size={
                                                    17
                                                }
                                            />
                                        )}

                                        {scanning
                                            ? "Scanning..."
                                            : "Upload Paper Image"}
                                    </label>

                                    <label
                                        htmlFor="pastpaper-camera"
                                        className={`flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-xs font-bold text-slate-700 transition hover:bg-slate-50 ${scanning ||
                                                submitting
                                                ? "pointer-events-none opacity-50"
                                                : ""
                                            }`}
                                    >
                                        <Camera
                                            size={
                                                17
                                            }
                                        />
                                        Use Camera
                                    </label>
                                </div>

                                {scanFile && (
                                    <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2
                                                size={
                                                    16
                                                }
                                                className="shrink-0 text-emerald-600"
                                            />

                                            <p className="truncate text-[10px] font-bold text-emerald-700">
                                                {
                                                    scanFile.name
                                                }
                                            </p>
                                        </div>

                                        <p className="mt-1 pl-6 text-[9px] leading-4 text-emerald-600">
                                            Extracted data has been loaded into the editable form.
                                        </p>
                                    </div>
                                )}

                                {scanError && (
                                    <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3">
                                        <div className="flex items-start gap-2">
                                            <CircleAlert
                                                size={
                                                    16
                                                }
                                                className="mt-0.5 shrink-0 text-red-500"
                                            />

                                            <p className="text-[10px] leading-4 text-red-600">
                                                {
                                                    scanError
                                                }
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {scanning && (
                                    <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
                                        <div className="flex items-center gap-3">
                                            <LoaderCircle
                                                size={
                                                    18
                                                }
                                                className="animate-spin text-blue-600"
                                            />

                                            <div>
                                                <p className="text-[10px] font-bold text-blue-700">
                                                    Reading paper...
                                                </p>

                                                <p className="mt-1 text-[9px] text-blue-600">
                                                    Please wait while the questions are extracted.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>

                        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <SectionHeader
                                icon={
                                    BookOpen
                                }
                                label="Paper setup"
                                title="Basic Information"
                                description="Enter the information that belongs to the paper itself."
                            />

                            <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
                                <FormField
                                    label="Event"
                                    required
                                >
                                    <select
                                        value={
                                            event
                                        }
                                        onChange={(
                                            inputEvent
                                        ) =>
                                            setEvent(
                                                inputEvent
                                                    .target
                                                    .value
                                            )
                                        }
                                        disabled={
                                            eventsLoading ||
                                            submitting
                                        }
                                        className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-xs text-[#071a4a] outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                                    >
                                        <option value="">
                                            {eventsLoading
                                                ? "Loading events..."
                                                : "Select event"}
                                        </option>

                                        {events.map(
                                            (
                                                item
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
                                            )
                                        )}
                                    </select>
                                </FormField>

                                <FormField label="Paper name">
                                    <input
                                        type="text"
                                        value={
                                            name
                                        }
                                        onChange={(
                                            inputEvent
                                        ) =>
                                            setName(
                                                inputEvent
                                                    .target
                                                    .value
                                            )
                                        }
                                        disabled={
                                            submitting
                                        }
                                        placeholder="Example: MDCAT 2025"
                                        className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-xs text-[#071a4a] outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50"
                                    />
                                </FormField>

                                <FormField
                                    label="Year"
                                    required
                                >
                                    <input
                                        type="number"
                                        min="1900"
                                        max={
                                            new Date().getFullYear()
                                        }
                                        value={
                                            year
                                        }
                                        onChange={(
                                            inputEvent
                                        ) =>
                                            setYear(
                                                inputEvent
                                                    .target
                                                    .value
                                            )
                                        }
                                        disabled={
                                            submitting
                                        }
                                        className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-xs text-[#071a4a] outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50"
                                    />
                                </FormField>

                                <FormField label="Section">
                                    <input
                                        type="text"
                                        value={
                                            section
                                        }
                                        onChange={(
                                            inputEvent
                                        ) =>
                                            setSection(
                                                inputEvent
                                                    .target
                                                    .value
                                            )
                                        }
                                        disabled={
                                            submitting
                                        }
                                        placeholder="Example: A"
                                        className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-xs text-[#071a4a] outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50"
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
                                            onChange={(
                                                inputEvent
                                            ) =>
                                                setInstruction(
                                                    inputEvent
                                                        .target
                                                        .value
                                                )
                                            }
                                            disabled={
                                                submitting
                                            }
                                            rows={
                                                4
                                            }
                                            placeholder="Enter the instructions exactly as they should appear for this paper."
                                            className="w-full resize-y rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs leading-5 text-[#071a4a] outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50"
                                        />
                                    </FormField>
                                </div>
                            </div>
                        </section>

                        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6">
                                <div>
                                    <p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-blue-600">
                                        Objective questions
                                    </p>

                                    <h2 className="mt-1 text-base font-extrabold text-[#071a4a]">
                                        MCQs
                                    </h2>

                                    <p className="mt-1 text-[10px] text-slate-500 sm:text-xs">
                                        {
                                            mcqs.length
                                        }{" "}
                                        {mcqs.length ===
                                            1
                                            ? "question"
                                            : "questions"}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={
                                        addMcq
                                    }
                                    disabled={
                                        submitting ||
                                        scanning
                                    }
                                    className="flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 text-[9px] font-bold text-white transition hover:bg-blue-700 disabled:bg-blue-400"
                                >
                                    <Plus
                                        size={
                                            14
                                        }
                                    />
                                    Add MCQ
                                </button>
                            </div>

                            {mcqs.length ===
                                0 ? (
                                <EmptyQuestions
                                    message="No MCQs added yet."
                                    actionLabel="Add MCQ"
                                    onAction={
                                        addMcq
                                    }
                                    disabled={
                                        submitting ||
                                        scanning
                                    }
                                />
                            ) : (
                                <div className="space-y-4 bg-slate-50/70 p-4 sm:p-5">
                                    {mcqs.map(
                                        (
                                            mcq,
                                            index
                                        ) => (
                                            <McqEditor
                                                key={
                                                    mcq.localId
                                                }
                                                mcq={
                                                    mcq
                                                }
                                                index={
                                                    index
                                                }
                                                disabled={
                                                    submitting ||
                                                    scanning
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
                                    )}
                                </div>
                            )}
                        </section>

                        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6">
                                <div>
                                    <p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-blue-600">
                                        Written questions
                                    </p>

                                    <h2 className="mt-1 text-base font-extrabold text-[#071a4a]">
                                        Detail Questions
                                    </h2>

                                    <p className="mt-1 text-[10px] text-slate-500 sm:text-xs">
                                        {
                                            detailQuestions.length
                                        }{" "}
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
                                    disabled={
                                        submitting ||
                                        scanning
                                    }
                                    className="flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 text-[9px] font-bold text-white transition hover:bg-blue-700 disabled:bg-blue-400"
                                >
                                    <Plus
                                        size={
                                            14
                                        }
                                    />
                                    Add Question
                                </button>
                            </div>

                            {detailQuestions.length ===
                                0 ? (
                                <EmptyQuestions
                                    message="No written questions added yet."
                                    actionLabel="Add Question"
                                    onAction={
                                        addDetailQuestion
                                    }
                                    disabled={
                                        submitting ||
                                        scanning
                                    }
                                />
                            ) : (
                                <div className="space-y-3 bg-slate-50/70 p-4 sm:p-5">
                                    {detailQuestions.map(
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
                                                    submitting ||
                                                    scanning
                                                }
                                                updateQuestion={
                                                    updateDetailQuestion
                                                }
                                                removeQuestion={
                                                    removeDetailQuestion
                                                }
                                            />
                                        )
                                    )}
                                </div>
                            )}
                        </section>

                        <section className="flex flex-col-reverse gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                            <Link
                                href="/admin/pastpapers"
                                className="flex h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
                            >
                                Cancel
                            </Link>

                            <button
                                type="button"
                                onClick={
                                    createPastPaper
                                }
                                disabled={
                                    submitting ||
                                    scanning
                                }
                                className="flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
                            >
                                {submitting ? (
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

                                        Create Past Paper
                                    </>
                                )}
                            </button>
                        </section>
                    </div>
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
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 min-w-8 items-center justify-center rounded-lg bg-blue-600 px-2 text-[10px] font-extrabold text-white">
                        Q{
                            mcq.sr_number
                        }
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
                    disabled={
                        disabled
                    }
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-500 transition hover:bg-red-600 hover:text-white disabled:opacity-40"
                >
                    <Trash2
                        size={14}
                    />
                </button>
            </div>

            <div className="space-y-4 p-4">
                <FormField
                    label="Statement"
                    required
                >
                    <textarea
                        value={
                            mcq.statement
                        }
                        onChange={(
                            event
                        ) =>
                            updateMcq(
                                index,
                                "statement",
                                event.target
                                    .value
                            )
                        }
                        disabled={
                            disabled
                        }
                        rows={3}
                        placeholder="Enter the complete MCQ statement"
                        className="w-full resize-y rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs leading-5 text-[#071a4a] outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50"
                    />
                </FormField>

                <div>
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-[9px] font-extrabold uppercase tracking-[0.1em] text-blue-600">
                                Options
                            </p>

                            <p className="mt-1 text-[9px] text-slate-500">
                                Review the extracted choices and select the correct answer.
                            </p>
                        </div>

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
                                    .length >=
                                6
                            }
                            className="flex h-8 items-center justify-center gap-1 rounded-lg bg-blue-600 px-3 text-[8px] font-bold text-white transition hover:bg-blue-700 disabled:bg-blue-400"
                        >
                            <Plus
                                size={12}
                            />
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
                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[10px] font-extrabold text-blue-700">
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
                                            event
                                        ) =>
                                            updateMcqOption(
                                                index,
                                                optionIndex,
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        disabled={
                                            disabled
                                        }
                                        placeholder={`Option ${option.option_number}`}
                                        className="h-9 min-w-0 flex-1 border-0 bg-transparent px-1 text-xs text-[#071a4a] outline-none placeholder:text-slate-400"
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
                                        aria-label={`Remove option ${option.option_number}`}
                                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-red-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
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
                                onChange={(
                                    event
                                ) =>
                                    updateMcq(
                                        index,
                                        "correctOption",
                                        event.target
                                            .value
                                    )
                                }
                                disabled={
                                    disabled
                                }
                                className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-xs text-[#071a4a] outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50"
                            >
                                <option value="">
                                    Select correct option
                                </option>

                                {mcq.options.map(
                                    (
                                        option
                                    ) => (
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
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 min-w-8 items-center justify-center rounded-lg bg-violet-600 px-2 text-[10px] font-extrabold text-white">
                        Q{
                            question.sr_number
                        }
                    </div>

                    <p className="text-xs font-extrabold text-[#071a4a]">
                        Written Question
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() =>
                        removeQuestion(
                            index
                        )
                    }
                    disabled={
                        disabled
                    }
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-500 transition hover:bg-red-600 hover:text-white disabled:opacity-40"
                >
                    <Trash2
                        size={14}
                    />
                </button>
            </div>

            <div className="mt-4">
                <FormField
                    label="Statement"
                    required
                >
                    <textarea
                        value={
                            question.statement
                        }
                        onChange={(
                            event
                        ) =>
                            updateQuestion(
                                index,
                                event.target
                                    .value
                            )
                        }
                        disabled={
                            disabled
                        }
                        rows={4}
                        placeholder="Enter the written question"
                        className="w-full resize-y rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs leading-5 text-[#071a4a] outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50"
                    />
                </FormField>
            </div>
        </article>
    );
};

const EmptyQuestions = ({
    message,
    actionLabel,
    onAction,
    disabled,
}) => {
    return (
        <div className="px-4 py-10 text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                <FileText size={21} />
            </div>

            <p className="mt-3 text-xs font-bold text-[#071a4a]">
                {message}
            </p>

            <button
                type="button"
                onClick={onAction}
                disabled={disabled}
                className="mt-4 inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-4 text-[9px] font-bold text-white transition hover:bg-blue-700 disabled:bg-blue-400"
            >
                <Plus size={13} />
                {actionLabel}
            </button>
        </div>
    );
};

const SectionHeader = ({
    icon: Icon,
    label,
    title,
    description,
}) => {
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

const SummaryItem = ({
    label,
    value,
}) => {
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

const AdminHeader = ({
    user,
}) => {
    const [
        showUserMenu,
        setShowUserMenu,
    ] = useState(false);

    const menuRef =
        useRef(null);

    const accountName = user
        ? `${user.firstname || ""} ${user.lastname || ""
            }`.trim() ||
        "Administrator"
        : "Administrator";

    useEffect(() => {
        const closeUserMenu = (
            event
        ) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(
                    event.target
                )
            ) {
                setShowUserMenu(
                    false
                );
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
            <div className="mx-auto flex h-14 w-full max-w-[1500px] items-center gap-2 sm:h-16 sm:gap-4">
                <Link
                    href="/admin"
                    className="flex min-w-0 max-w-[48%] items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-2.5 py-2 text-white transition hover:bg-white/15 sm:max-w-none sm:gap-3 sm:px-4"
                >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[#102a63] sm:h-10 sm:w-10">
                        <GraduationCap
                            size={21}
                        />
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
                                    previous
                                ) =>
                                    !previous
                            )
                        }
                        className="flex w-full min-w-0 items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-2.5 py-2 text-left text-white transition hover:bg-white/15 sm:gap-3 sm:px-4"
                    >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white text-xs font-bold uppercase text-[#102a63] sm:h-10 sm:w-10 sm:text-sm">
                            {user?.profileimage?.url ? (
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
                                    0
                                ) || "A"
                            )}
                        </div>

                        <div className="min-w-0">
                            <span className="block truncate text-[11px] font-bold sm:max-w-52 sm:text-sm">
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
                                            false
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
                                            false
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

export default CreatePastPaperPage;