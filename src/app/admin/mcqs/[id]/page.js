"use client";

import DeleteConfirmationModal from "@/app/admin/components/deleteconfirmation";
import { useUser } from "@/context/userContext";
import axios from "axios";
import Link from "next/link";
import {
    ArrowLeft,
    BookOpenCheck,
    CalendarDays,
    ChevronDown,
    CircleAlert,
    ClipboardCheck,
    ExternalLink,
    GraduationCap,
    ListChecks,
    LoaderCircle,
    Plus,
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

const mcqTypes = [
    {
        value: "both",
        label: "Read and Test",
        description: "This MCQ will appear in both study and test modes.",
        icon: ListChecks,
    },
    {
        value: "read",
        label: "Read Only",
        description: "This MCQ will only appear in study mode.",
        icon: BookOpenCheck,
    },
    {
        value: "test",
        label: "Test Only",
        description: "This MCQ will only appear in test mode.",
        icon: ClipboardCheck,
    },
];

const ManageMcqPage = () => {
    const params = useParams();
    const router = useRouter();
    const { user } = useUser();

    const id = Array.isArray(params.id) ? params.id[0] : params.id;

    const [mcq, setMcq] = useState(null);
    const [statement, setStatement] = useState("");
    const [options, setOptions] = useState([]);
    const [explanation, setExplanation] = useState("");
    const [mcqType, setMcqType] = useState("both");
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const getMcq = useCallback(async () => {
        if (!id) {
            setLoading(false);
            setErrorMessage("MCQ ID is missing");
            return;
        }

        try {
            setLoading(true);
            setErrorMessage("");

            const result = await axios.get(`/api/mcqs/${id}`);
            const selectedMcq = result.data?.mcq;

            if (!result.data?.success || !selectedMcq) {
                setMcq(null);
                setErrorMessage(result.data?.message || "MCQ could not be loaded");
                return;
            }

            const selectedType = ["read", "test", "both"].includes(selectedMcq.type)
                ? selectedMcq.type
                : "both";

            setMcq(selectedMcq);
            setStatement(selectedMcq.statement || "");
            setExplanation(selectedMcq.explanation || "");
            setMcqType(selectedType);
            setOptions(
                (selectedMcq.options || []).map((option) => ({
                    text: option.text || "",
                    isCorrect: Boolean(option.isCorrect),
                })),
            );
        } catch (error) {
            console.log(error);

            setMcq(null);
            setErrorMessage(error.response?.data?.message || "MCQ could not be loaded");
        } finally {
            setLoading(false);
        }
    }, [id]);

    const updateOption = (index, value) => {
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
            previous.map((option, optionIndex) => ({
                ...option,
                isCorrect: optionIndex === index,
            })),
        );
    };

    const addOption = () => {
        if (options.length >= 6) {
            toast.error("A maximum of six options is allowed", toastOptions);
            return;
        }

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
            toast.error("At least two options are required", toastOptions);
            return;
        }

        setOptions((previous) => {
            const removedOptionWasCorrect = previous[index]?.isCorrect;
            const nextOptions = previous.filter((option, optionIndex) => optionIndex !== index);

            if (removedOptionWasCorrect && nextOptions.length > 0) {
                nextOptions[0] = {
                    ...nextOptions[0],
                    isCorrect: true,
                };
            }

            return nextOptions;
        });
    };

    const validateMcq = () => {
        if (!statement.trim()) {
            toast.error("MCQ statement is required", toastOptions);
            return false;
        }

        if (options.length < 2) {
            toast.error("At least two options are required", toastOptions);
            return false;
        }

        if (options.some((option) => !option.text.trim())) {
            toast.error("Please enter text for every option", toastOptions);
            return false;
        }

        const correctOptions = options.filter((option) => option.isCorrect);

        if (correctOptions.length !== 1) {
            toast.error("Please select exactly one correct option", toastOptions);
            return false;
        }

        if (!["read", "test", "both"].includes(mcqType)) {
            toast.error("Please select a valid MCQ type", toastOptions);
            return false;
        }

        return true;
    };

    const updateMcq = async (submitEvent) => {
        submitEvent.preventDefault();

        if (!mcq || updating || deleting || !validateMcq()) {
            return;
        }

        try {
            setUpdating(true);

            const topicId = typeof mcq.topic === "object"
                ? mcq.topic?._id
                : mcq.topic;

            if (!topicId) {
                toast.error("The MCQ topic is not available", toastOptions);
                return;
            }

            const result = await axios.put(`/api/mcqs/${id}`, {
                topic: topicId,
                statement: statement.trim(),
                options: options.map((option) => ({
                    text: option.text.trim(),
                    isCorrect: option.isCorrect,
                })),
                explanation: explanation.trim(),
                type: mcqType,
            });

            if (!result.data?.success) {
                toast.error(result.data?.message || "MCQ could not be updated", toastOptions);
                return;
            }

            setMcq((previous) => ({
                ...previous,
                ...result.data.mcq,
            }));

            toast.success(result.data?.message || "MCQ is updated", toastOptions);
        } catch (error) {
            console.log(error);

            toast.error(error.response?.data?.message || "MCQ could not be updated", toastOptions);
        } finally {
            setUpdating(false);
        }
    };

    const openDeleteModal = () => {
        if (!updating && !deleting) {
            setShowDeleteModal(true);
        }
    };

    const closeDeleteModal = useCallback(() => {
        if (!deleting) {
            setShowDeleteModal(false);
        }
    }, [deleting]);

    const deleteMcq = async () => {
        if (!id || updating || deleting) {
            return;
        }

        try {
            setDeleting(true);

            const result = await axios.delete(`/api/mcqs/${id}`);

            if (!result.data?.success) {
                toast.error(result.data?.message || "MCQ could not be deleted", toastOptions);
                return;
            }

            setShowDeleteModal(false);

            toast.success(result.data?.message || "MCQ is deleted", toastOptions);

            router.replace("/admin/mcqs");
            router.refresh();
        } catch (error) {
            console.log(error);

            toast.error(error.response?.data?.message || "MCQ could not be deleted", toastOptions);
        } finally {
            setDeleting(false);
        }
    };

    useEffect(() => {
        getMcq();
    }, [getMcq]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f5f7fb]">
                <AdminHeader user={user} />
                <McqLoading />
            </div>
        );
    }

    if (errorMessage || !mcq) {
        return (
            <div className="min-h-screen bg-[#f5f7fb]">
                <AdminHeader user={user} />
                <McqError message={errorMessage || "MCQ is not available"} retry={getMcq} />
            </div>
        );
    }

    const topicName = mcq.topic?.topicName || mcq.topic?.name || "Selected Topic";

    return (
        <div className="min-h-screen bg-[#f5f7fb]">
            <AdminHeader user={user} />

            <main className="mx-auto w-full max-w-[1100px] px-3 py-5 sm:px-6 sm:py-7 lg:px-8">
                <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-2 text-xs sm:text-sm">
                    <Link href="/admin/mcqs" className="flex items-center gap-1.5 font-semibold text-slate-500 transition hover:text-blue-700">
                        <ArrowLeft size={16} />
                        MCQs
                    </Link>

                    <span className="text-slate-300">/</span>

                    <span className="max-w-60 truncate font-semibold text-blue-700">
                        Manage MCQ
                    </span>
                </nav>

                <section className="mb-5 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
                    <div className="min-w-0">
                        <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-blue-600">
                            MCQ management
                        </p>

                        <h1 className="mt-1.5 text-xl font-extrabold tracking-tight text-[#071a4a] sm:text-2xl">
                            Update MCQ
                        </h1>

                        <p className="mt-1.5 max-w-2xl text-xs leading-5 text-slate-500 sm:text-sm">
                            Update the statement, options, correct answer, explanation and availability.
                        </p>
                    </div>

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <ListChecks size={23} />
                    </div>
                </section>

                <div className="grid items-start gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
                    <aside className="space-y-5 lg:sticky lg:top-24">
                        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="bg-[#102a63] p-5 text-white">
                                <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-blue-200">
                                    Assigned topic
                                </p>

                                <h2 className="mt-2 break-words text-base font-extrabold">
                                    {topicName}
                                </h2>

                                <p className="mt-2 text-[10px] leading-5 text-blue-100">
                                    This MCQ remains connected to its currently assigned topic.
                                </p>
                            </div>

                            <div className="space-y-3 p-4">
                                <InformationItem label="Created" value={formatDate(mcq.createdAt)} />
                                <InformationItem label="Last updated" value={formatDate(mcq.updatedAt)} />
                                <InformationItem label="Options" value={`${options.length} options`} />
                                <InformationItem label="Availability" value={getTypeLabel(mcqType)} />
                            </div>
                        </section>

                        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-slate-400">
                                MCQ ID
                            </p>

                            <p className="mt-2 break-all rounded-lg bg-slate-50 px-3 py-2 font-mono text-[9px] leading-4 text-slate-600">
                                {mcq._id}
                            </p>
                        </section>
                    </aside>

                    <form onSubmit={updateMcq} className="space-y-5">
                        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <SectionHeader title="Question Statement" description="Enter the complete MCQ question." />

                            <div className="p-5 sm:p-6">
                                <label htmlFor="statement" className="mb-2 block text-xs font-bold text-slate-700">
                                    Statement
                                </label>

                                <textarea id="statement" value={statement} onChange={(event) => setStatement(event.target.value)} disabled={updating || deleting} rows={5} placeholder="Enter the MCQ statement" className="w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 text-[#071a4a] outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50" />
                            </div>
                        </section>

                        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6">
                                <div>
                                    <p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-blue-600">
                                        Answer choices
                                    </p>

                                    <h2 className="mt-1 text-base font-extrabold text-[#071a4a]">
                                        Options
                                    </h2>
                                </div>

                                <button type="button" onClick={addOption} disabled={updating || deleting || options.length >= 6} className="flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 text-[9px] font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400">
                                    <Plus size={14} />
                                    Add Option
                                </button>
                            </div>

                            <div className="space-y-3 p-5 sm:p-6">
                                {options.map((option, index) => (
                                    <div key={index} className={`rounded-xl border p-3 transition ${option.isCorrect ? "border-emerald-400 bg-emerald-50" : "border-slate-200 bg-slate-50"}`}>
                                        <div className="flex items-start gap-3">
                                            <button type="button" onClick={() => selectCorrectOption(index)} disabled={updating || deleting} aria-label={`Mark option ${index + 1} as correct`} className={`mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[10px] font-extrabold transition ${option.isCorrect ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-300 bg-white text-slate-500 hover:border-emerald-500 hover:text-emerald-600"}`}>
                                                {String.fromCharCode(65 + index)}
                                            </button>

                                            <div className="min-w-0 flex-1">
                                                <input type="text" value={option.text} onChange={(event) => updateOption(index, event.target.value)} disabled={updating || deleting} placeholder={`Enter option ${String.fromCharCode(65 + index)}`} className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-[#071a4a] outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100" />

                                                <p className={`mt-1.5 text-[9px] font-bold ${option.isCorrect ? "text-emerald-600" : "text-slate-400"}`}>
                                                    {option.isCorrect ? "Correct answer" : "Click the letter to mark as correct"}
                                                </p>
                                            </div>

                                            <button type="button" onClick={() => removeOption(index)} disabled={updating || deleting || options.length <= 2} aria-label={`Remove option ${index + 1}`} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-red-200 bg-white text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40">
                                                <X size={15} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <SectionHeader title="Explanation" description="Explain why the selected option is correct." />

                            <div className="p-5 sm:p-6">
                                <textarea value={explanation} onChange={(event) => setExplanation(event.target.value)} disabled={updating || deleting} rows={5} placeholder="Enter the answer explanation" className="w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 text-[#071a4a] outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50" />
                            </div>
                        </section>

                        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <SectionHeader title="MCQ Availability" description="Choose where this MCQ should appear." />

                            <div className="grid gap-3 p-5 sm:grid-cols-3 sm:p-6">
                                {mcqTypes.map((item) => {
                                    const Icon = item.icon;
                                    const selected = mcqType === item.value;

                                    return (
                                        <label key={item.value} className={`cursor-pointer rounded-xl border p-4 transition ${selected ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100" : "border-slate-200 bg-white hover:border-blue-300"}`}>
                                            <input type="radio" name="mcqType" value={item.value} checked={selected} onChange={(event) => setMcqType(event.target.value)} disabled={updating || deleting} className="sr-only" />

                                            <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${selected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                                                <Icon size={17} />
                                            </div>

                                            <p className="mt-3 text-xs font-extrabold text-[#071a4a]">
                                                {item.label}
                                            </p>

                                            <p className="mt-1 text-[9px] leading-4 text-slate-500">
                                                {item.description}
                                            </p>
                                        </label>
                                    );
                                })}
                            </div>
                        </section>

                        <section className="flex flex-col-reverse gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                            <button type="button" onClick={openDeleteModal} disabled={updating || deleting} className="flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-xs font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-400">
                                <Trash2 size={16} />
                                Delete MCQ
                            </button>

                            <button type="submit" disabled={updating || deleting} className="flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400">
                                {updating ? (
                                    <>
                                        <LoaderCircle size={16} className="animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <Save size={16} />
                                        Update MCQ
                                    </>
                                )}
                            </button>
                        </section>
                    </form>
                </div>
            </main>

            <DeleteConfirmationModal open={showDeleteModal} title="Delete MCQ?" description="This MCQ, its options and explanation will be permanently removed." itemName={statement || "Selected MCQ"} confirmText="Delete MCQ" loading={deleting} onCancel={closeDeleteModal} onConfirm={deleteMcq} />
        </div>
    );
};

const SectionHeader = ({ title, description }) => {
    return (
        <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
            <p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-blue-600">
                MCQ information
            </p>

            <h2 className="mt-1 text-base font-extrabold text-[#071a4a]">
                {title}
            </h2>

            <p className="mt-1 text-[10px] leading-5 text-slate-500 sm:text-xs">
                {description}
            </p>
        </div>
    );
};

const InformationItem = ({ label, value }) => {
    return (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
            <p className="text-[8px] font-extrabold uppercase tracking-[0.1em] text-slate-400">
                {label}
            </p>

            <p className="mt-1 truncate text-[10px] font-bold text-[#071a4a]">
                {value}
            </p>
        </div>
    );
};

const McqLoading = () => {
    return (
        <main className="mx-auto w-full max-w-[1100px] px-3 py-7 sm:px-6 lg:px-8">
            <div className="animate-pulse">
                <div className="h-5 w-40 rounded bg-slate-200" />
                <div className="mt-5 h-28 rounded-2xl bg-white" />

                <div className="mt-5 grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
                    <div className="h-96 rounded-2xl bg-white" />
                    <div className="h-[620px] rounded-2xl bg-white" />
                </div>
            </div>
        </main>
    );
};

const McqError = ({ message, retry }) => {
    return (
        <main className="mx-auto flex min-h-[calc(100vh-80px)] w-full max-w-[900px] items-center justify-center px-4 py-10">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-sm">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500">
                    <CircleAlert size={23} />
                </div>

                <h1 className="mt-4 text-lg font-extrabold text-[#071a4a]">
                    MCQ could not be opened
                </h1>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                    {message}
                </p>

                <button type="button" onClick={retry} className="mt-5 rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-blue-700">
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
                <Link href="/admin" className="flex min-w-0 max-w-[48%] items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-2.5 py-2 text-white shadow-sm backdrop-blur-xl transition hover:bg-white/15 sm:max-w-none sm:gap-3 sm:px-4">
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

const getTypeLabel = (type) => {
    if (type === "read") {
        return "Read Only";
    }

    if (type === "test") {
        return "Test Only";
    }

    return "Read and Test";
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

export default ManageMcqPage;