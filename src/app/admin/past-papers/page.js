"use client";

import DeleteConfirmationModal from "@/app/admin/components/deleteconfirmation";
import { useUser } from "@/context/userContext";
import axios from "axios";
import Link from "next/link";
import {
    BookOpen,
    CalendarDays,
    ChevronDown,
    CircleAlert,
    Clock3,
    ExternalLink,
    FilePlus2,
    FileText,
    Filter,
    GraduationCap,
    ListChecks,
    LoaderCircle,
    Pencil,
    Search,
    Settings2,
    Trash2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";

const toastOptions = {
    autoClose: 3000,
    pauseOnHover: false,
    pauseOnFocusLoss: false,
    closeOnClick: true,
};

const PastPapersPage = () => {
    const { user } = useUser();

    const [pastPapers, setPastPapers] = useState([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [eventFilter, setEventFilter] = useState("all");
    const [yearFilter, setYearFilter] = useState("all");
    const [selectedPaper, setSelectedPaper] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const getPastPapers = useCallback(async () => {
        try {
            setLoading(true);
            setErrorMessage("");

            const result = await axios.get("/api/past-papers/admin");

            if (result.data?.success) {
                setPastPapers(result.data.pastPapers || []);
            } else {
                setPastPapers([]);
            }
        } catch (error) {
            console.log(error);

            if (error.response?.status === 404) {
                setPastPapers([]);
                setErrorMessage("");
                return;
            }

            setPastPapers([]);
            setErrorMessage(error.response?.data?.message || "Past papers could not be loaded");
        } finally {
            setLoading(false);
        }
    }, []);

    const eventOptions = useMemo(() => {
        const eventMap = new Map();

        pastPapers.forEach((paper) => {
            const eventId = getEventId(paper.event);
            const eventName = getEventName(paper.event);

            if (eventId) {
                eventMap.set(eventId, eventName);
            }
        });

        return Array.from(eventMap.entries()).map(([value, label]) => ({
            value,
            label,
        }));
    }, [pastPapers]);

    const yearOptions = useMemo(() => {
        return [...new Set(pastPapers.map((paper) => paper.year).filter(Boolean))]
            .sort((first, second) => second - first);
    }, [pastPapers]);

    const filteredPapers = useMemo(() => {
        const searchValue = search.trim().toLowerCase();

        return pastPapers.filter((paper) => {
            const eventId = getEventId(paper.event);
            const eventName = getEventName(paper.event);
            const paperTitle = paper.title || "";
            const paperCode = paper.paperCode || "";

            const matchesSearch =
                !searchValue ||
                paperTitle.toLowerCase().includes(searchValue) ||
                paperCode.toLowerCase().includes(searchValue) ||
                eventName.toLowerCase().includes(searchValue) ||
                String(paper.year || "").includes(searchValue);

            const matchesStatus =
                statusFilter === "all" ||
                paper.status === statusFilter;

            const matchesEvent =
                eventFilter === "all" ||
                eventId === eventFilter;

            const matchesYear =
                yearFilter === "all" ||
                String(paper.year) === yearFilter;

            return matchesSearch && matchesStatus && matchesEvent && matchesYear;
        });
    }, [pastPapers, search, statusFilter, eventFilter, yearFilter]);

    const publishedCount = pastPapers.filter((paper) => paper.status === "published").length;
    const draftCount = pastPapers.filter((paper) => paper.status === "draft").length;
    const totalQuestions = pastPapers.reduce((total, paper) => total + getQuestionCount(paper), 0);
    const filtersApplied = search || statusFilter !== "all" || eventFilter !== "all" || yearFilter !== "all";

    const clearFilters = () => {
        setSearch("");
        setStatusFilter("all");
        setEventFilter("all");
        setYearFilter("all");
    };

    const openDeleteModal = (paper) => {
        if (!deleting) {
            setSelectedPaper(paper);
            setShowDeleteModal(true);
        }
    };

    const closeDeleteModal = useCallback(() => {
        if (!deleting) {
            setShowDeleteModal(false);
            setSelectedPaper(null);
        }
    }, [deleting]);

    const deletePastPaper = async () => {
        if (!selectedPaper?._id || deleting) {
            return;
        }

        try {
            setDeleting(true);

            const result = await axios.delete(`/api/past-papers/${selectedPaper._id}`);

            if (!result.data?.success) {
                toast.error(result.data?.message || "Past paper could not be deleted", toastOptions);
                return;
            }

            setPastPapers((previous) =>
                previous.filter((paper) => paper._id !== selectedPaper._id),
            );

            setShowDeleteModal(false);
            setSelectedPaper(null);

            toast.success(result.data?.message || "Past paper is deleted", toastOptions);
        } catch (error) {
            console.log(error);

            toast.error(error.response?.data?.message || "Past paper could not be deleted", toastOptions);
        } finally {
            setDeleting(false);
        }
    };

    useEffect(() => {
        getPastPapers();
    }, [getPastPapers]);

    return (
        <div className="min-h-screen bg-[#f5f7fb]">
            <AdminHeader user={user} />

            <main className="mx-auto w-full max-w-[1300px] px-3 py-5 sm:px-6 sm:py-7 lg:px-8">
                <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
                    <div className="min-w-0">
                        <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-blue-600">
                            Paper management
                        </p>

                        <h1 className="mt-1.5 text-xl font-extrabold tracking-tight text-[#071a4a] sm:text-2xl">
                            Past Papers
                        </h1>

                        <p className="mt-1.5 max-w-2xl text-xs leading-5 text-slate-500 sm:text-sm">
                            Create, review and publish structured event-based examination papers.
                        </p>
                    </div>

                    <Link href="/admin/past-papers/create" className="flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md sm:w-auto">
                        <FilePlus2 size={17} />
                        Create Past Paper
                    </Link>
                </section>

                <section className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
                    <SummaryCard icon={FileText} label="Total Papers" value={pastPapers.length} color="blue" />
                    <SummaryCard icon={BookOpen} label="Published" value={publishedCount} color="emerald" />
                    <SummaryCard icon={Clock3} label="Drafts" value={draftCount} color="orange" />
                    <SummaryCard icon={ListChecks} label="Questions" value={totalQuestions} color="violet" />
                </section>

                <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                    <div className="flex items-center gap-2">
                        <Filter size={16} className="text-blue-600" />

                        <h2 className="text-sm font-extrabold text-[#071a4a]">
                            Filter Papers
                        </h2>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(220px,1fr)_180px_180px_150px_auto]">
                        <div className="relative">
                            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />

                            <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search title, code or event" className="h-11 w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 text-xs text-[#071a4a] outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
                        </div>

                        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-600 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100">
                            <option value="all">All statuses</option>
                            <option value="published">Published</option>
                            <option value="draft">Draft</option>
                        </select>

                        <select value={eventFilter} onChange={(event) => setEventFilter(event.target.value)} className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-600 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100">
                            <option value="all">All events</option>

                            {eventOptions.map((event) => (
                                <option key={event.value} value={event.value}>
                                    {event.label}
                                </option>
                            ))}
                        </select>

                        <select value={yearFilter} onChange={(event) => setYearFilter(event.target.value)} className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-600 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100">
                            <option value="all">All years</option>

                            {yearOptions.map((year) => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>

                        <button type="button" onClick={clearFilters} disabled={!filtersApplied} className="h-11 rounded-xl border border-slate-300 bg-white px-4 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">
                            Clear
                        </button>
                    </div>
                </section>

                <section className="mt-5">
                    <div className="mb-4 flex items-center justify-between gap-3">
                        <div>
                            <h2 className="text-base font-extrabold text-[#071a4a]">
                                Available Papers
                            </h2>

                            <p className="mt-1 text-[10px] text-slate-500 sm:text-xs">
                                {filteredPapers.length} {filteredPapers.length === 1 ? "paper" : "papers"} displayed
                            </p>
                        </div>

                        {!loading && pastPapers.length > 0 && (
                            <span className="flex h-9 min-w-9 items-center justify-center rounded-xl bg-blue-100 px-2.5 text-xs font-extrabold text-blue-700">
                                {pastPapers.length}
                            </span>
                        )}
                    </div>

                    {loading ? (
                        <PapersLoading />
                    ) : errorMessage ? (
                        <PapersError message={errorMessage} retry={getPastPapers} />
                    ) : pastPapers.length === 0 ? (
                        <PapersEmpty />
                    ) : filteredPapers.length === 0 ? (
                        <NoFilteredPapers clearFilters={clearFilters} />
                    ) : (
                        <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {filteredPapers.map((paper) => (
                                <PastPaperCard key={paper._id} paper={paper} deleting={deleting} openDeleteModal={openDeleteModal} />
                            ))}
                        </div>
                    )}
                </section>
            </main>

            <DeleteConfirmationModal open={showDeleteModal} title="Delete Past Paper?" description="This past paper, all its sections and every question will be permanently removed." itemName={selectedPaper ? `${selectedPaper.title} (${selectedPaper.year})` : ""} confirmText="Delete Paper" loading={deleting} onCancel={closeDeleteModal} onConfirm={deletePastPaper} />
        </div>
    );
};

const PastPaperCard = ({ paper, deleting, openDeleteModal }) => {
    const eventName = getEventName(paper.event);
    const sectionCount = paper.sectionCount ?? paper.sections?.length ?? 0;
    const questionCount = getQuestionCount(paper);
    const published = paper.status === "published";

    return (
        <article className={`group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${published ? "border-slate-200 hover:border-emerald-300" : "border-orange-200 hover:border-orange-300"}`}>
            <div className={`h-1.5 w-full ${published ? "bg-emerald-500" : "bg-orange-400"}`} />

            <div className="flex flex-1 flex-col p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition group-hover:scale-105 ${published ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-500"}`}>
                        <FileText size={22} />
                    </div>

                    <span className={`rounded-lg px-2.5 py-1 text-[8px] font-extrabold uppercase tracking-[0.1em] ${published ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"}`}>
                        {published ? "Published" : "Draft"}
                    </span>
                </div>

                <div className="mt-4 min-w-0">
                    <p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-blue-600">
                        {eventName}
                    </p>

                    <h3 className="mt-1.5 line-clamp-2 text-sm font-extrabold leading-5 text-[#071a4a] sm:text-base">
                        {paper.title}
                    </h3>

                    <div className="mt-2 flex flex-wrap gap-1.5">
                        <span className="rounded-md bg-slate-100 px-2 py-1 text-[8px] font-bold text-slate-600">
                            {paper.year}
                        </span>

                        {paper.paperCode && (
                            <span className="rounded-md bg-blue-50 px-2 py-1 text-[8px] font-bold text-blue-700">
                                {paper.paperCode}
                            </span>
                        )}

                        <span className="rounded-md bg-violet-50 px-2 py-1 text-[8px] font-bold capitalize text-violet-700">
                            {paper.creationMethod || "manual"}
                        </span>
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                    <PaperInformation icon={BookOpen} label="Sections" value={sectionCount} />
                    <PaperInformation icon={ListChecks} label="Questions" value={questionCount} />
                    <PaperInformation icon={Clock3} label="Duration" value={paper.duration || "—"} />
                    <PaperInformation icon={GraduationCap} label="Marks" value={paper.totalMarks || "—"} />
                </div>

                <div className="mt-4 flex items-center gap-1.5 border-t border-slate-100 pt-3 text-[9px] text-slate-400">
                    <CalendarDays size={13} />
                    Updated {formatDate(paper.updatedAt)}
                </div>

                <div className="mt-auto grid grid-cols-[1fr_42px] gap-2 pt-4">
                    <Link href={`/admin/past-papers/${paper._id}`} className="flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 text-[9px] font-bold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md">
                        <Pencil size={14} />
                        Manage Paper
                    </Link>

                    <button type="button" onClick={() => openDeleteModal(paper)} disabled={deleting} aria-label={`Delete ${paper.title}`} className="flex h-10 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50">
                        <Trash2 size={15} />
                    </button>
                </div>
            </div>
        </article>
    );
};

const PaperInformation = ({ icon: Icon, label, value }) => {
    return (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
            <div className="flex items-center gap-1.5 text-slate-400">
                <Icon size={12} />

                <span className="text-[7px] font-extrabold uppercase tracking-[0.08em]">
                    {label}
                </span>
            </div>

            <p className="mt-1 truncate text-[10px] font-extrabold text-[#071a4a]">
                {value}
            </p>
        </div>
    );
};

const SummaryCard = ({ icon: Icon, label, value, color }) => {
    const colorStyles = {
        blue: "bg-blue-50 text-blue-600",
        emerald: "bg-emerald-50 text-emerald-600",
        orange: "bg-orange-50 text-orange-500",
        violet: "bg-violet-50 text-violet-600",
    };

    return (
        <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11 ${colorStyles[color]}`}>
                <Icon size={20} />
            </div>

            <div className="min-w-0">
                <p className="truncate text-[8px] font-extrabold uppercase tracking-[0.1em] text-slate-400 sm:text-[9px]">
                    {label}
                </p>

                <p className="mt-0.5 text-base font-extrabold text-[#071a4a] sm:text-lg">
                    {value}
                </p>
            </div>
        </div>
    );
};

const PapersLoading = () => {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex justify-between">
                        <div className="h-11 w-11 rounded-xl bg-slate-200" />
                        <div className="h-6 w-20 rounded-lg bg-slate-100" />
                    </div>

                    <div className="mt-5 h-3 w-20 rounded bg-slate-100" />
                    <div className="mt-3 h-5 w-3/4 rounded bg-slate-200" />

                    <div className="mt-5 grid grid-cols-2 gap-2">
                        {[1, 2, 3, 4].map((card) => (
                            <div key={card} className="h-14 rounded-xl bg-slate-100" />
                        ))}
                    </div>

                    <div className="mt-5 h-10 rounded-xl bg-slate-200" />
                </div>
            ))}
        </div>
    );
};

const PapersError = ({ message, retry }) => {
    return (
        <div className="rounded-2xl border border-red-200 bg-white px-4 py-12 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500">
                <CircleAlert size={23} />
            </div>

            <h3 className="mt-4 text-base font-extrabold text-[#071a4a]">
                Past papers could not be loaded
            </h3>

            <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-slate-500">
                {message}
            </p>

            <button type="button" onClick={retry} className="mt-5 inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-5 text-xs font-bold text-white transition hover:bg-blue-700">
                Try Again
            </button>
        </div>
    );
};

const PapersEmpty = () => {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-12 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <FileText size={23} />
            </div>

            <h3 className="mt-4 text-base font-extrabold text-[#071a4a]">
                No past papers created
            </h3>

            <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-slate-500">
                Create your first structured past paper for an available event.
            </p>

            <Link href="/admin/past-papers/create" className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-xs font-bold text-white transition hover:bg-blue-700">
                <FilePlus2 size={15} />
                Create Past Paper
            </Link>
        </div>
    );
};

const NoFilteredPapers = ({ clearFilters }) => {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-12 text-center shadow-sm">
            <Search size={28} className="mx-auto text-slate-300" />

            <h3 className="mt-3 text-sm font-extrabold text-[#071a4a]">
                No papers match these filters
            </h3>

            <button type="button" onClick={clearFilters} className="mt-4 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-blue-700">
                Clear Filters
            </button>
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

const getEventId = (event) => {
    if (!event) {
        return "";
    }

    return String(typeof event === "object" ? event._id || "" : event);
};

const getEventName = (event) => {
    if (!event) {
        return "Unknown Event";
    }

    return typeof event === "object"
        ? event.name || "Unknown Event"
        : "Event";
};

const getQuestionCount = (paper) => {
    if (typeof paper.questionCount === "number") {
        return paper.questionCount;
    }

    return (paper.sections || []).reduce((total, section) => {
        return total + (section.questions?.length || 0);
    }, 0);
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

export default PastPapersPage;