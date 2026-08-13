"use client";

import axios from "axios";
import Link from "next/link";
import {
    ArrowRight,
    BookOpenText,
    ClipboardCheck,
    FileClock,
    FileText,
    ListChecks,
    PlayCircle,
    RefreshCw,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const materialStyles = {
    note: {
        label: "Note",
        icon: FileText,
        iconStyle: "bg-emerald-50 text-emerald-600",
    },
    notes: {
        label: "Notes",
        icon: FileText,
        iconStyle: "bg-emerald-50 text-emerald-600",
    },
    lecture: {
        label: "Lecture",
        icon: PlayCircle,
        iconStyle: "bg-orange-50 text-orange-500",
    },
    lectures: {
        label: "Lecture",
        icon: PlayCircle,
        iconStyle: "bg-orange-50 text-orange-500",
    },
    mcq: {
        label: "MCQ",
        icon: ListChecks,
        iconStyle: "bg-violet-50 text-violet-600",
    },
    mcqs: {
        label: "MCQs",
        icon: ListChecks,
        iconStyle: "bg-violet-50 text-violet-600",
    },
    "mock-test": {
        label: "Mock Test",
        icon: ClipboardCheck,
        iconStyle: "bg-blue-50 text-blue-600",
    },
    "mock-tests": {
        label: "Mock Test",
        icon: ClipboardCheck,
        iconStyle: "bg-blue-50 text-blue-600",
    },
    mocktests: {
        label: "Mock Test",
        icon: ClipboardCheck,
        iconStyle: "bg-blue-50 text-blue-600",
    },
    "past-paper": {
        label: "Past Paper",
        icon: FileClock,
        iconStyle: "bg-amber-50 text-amber-600",
    },
    "past-papers": {
        label: "Past Paper",
        icon: FileClock,
        iconStyle: "bg-amber-50 text-amber-600",
    },
    pastpapers: {
        label: "Past Paper",
        icon: FileClock,
        iconStyle: "bg-amber-50 text-amber-600",
    },
};

const EventMaterials = () => {
    const { id } = useParams();

    const [eventName, setEventName] =
        useState("");
    const [materials, setMaterials] =
        useState([]);
    const [loading, setLoading] =
        useState(true);
    const [errorMessage, setErrorMessage] =
        useState("");

    const normalizeType = (type = "") => {
        return String(type)
            .trim()
            .toLowerCase()
            .replace(/[\s_]+/g, "-");
    };

    const getStyle = (type) => {
        const normalizedType =
            normalizeType(type);

        return (
            materialStyles[normalizedType] || {
                label:
                    normalizedType
                        .replace(/-/g, " ")
                        .replace(
                            /\b\w/g,
                            (character) =>
                                character.toUpperCase(),
                        ) || "Material",
                icon: FileText,
                iconStyle:
                    "bg-blue-50 text-blue-600",
            }
        );
    };

    const getSubjectName = (material) => {
        return (
            material.subject?.name ||
            material.subjectName ||
            "General"
        );
    };

    const getMaterialHref = (material) => {
        if (material.href) {
            return material.href;
        }

        const normalizedType =
            normalizeType(material.type) ||
            "materials";

        return `/events/${id}/${normalizedType}/${material._id}`;
    };

    const formatDate = (date) => {
        if (!date) {
            return "Recently added";
        }

        const materialDate = new Date(date);

        if (
            Number.isNaN(
                materialDate.getTime(),
            )
        ) {
            return "Recently added";
        }

        return new Intl.DateTimeFormat(
            "en-PK",
            {
                day: "numeric",
                month: "short",
                year: "numeric",
            },
        ).format(materialDate);
    };

    const getMaterials = async () => {
        try {
            setLoading(true);
            setErrorMessage("");

            const result = await axios.get(
                `/api/events/${id}/materials`,
            );

            if (result.data.success) {
                const receivedMaterials =
                    result.data.materials ||
                    result.data.collection ||
                    [];

                const sortedMaterials = [
                    ...receivedMaterials,
                ].sort(
                    (
                        firstMaterial,
                        secondMaterial,
                    ) =>
                        new Date(
                            secondMaterial.updatedAt ||
                            secondMaterial.createdAt ||
                            0,
                        ) -
                        new Date(
                            firstMaterial.updatedAt ||
                            firstMaterial.createdAt ||
                            0,
                        ),
                );

                setEventName(
                    result.data.eventName || "",
                );

                setMaterials(sortedMaterials);
                return;
            }

            setMaterials([]);

            setErrorMessage(
                result.data.message ||
                "Learning material could not be loaded",
            );
        } catch (error) {
            if (
                error.response?.status === 404
            ) {
                setMaterials([]);
                setErrorMessage("");
                return;
            }

            console.log(error);
            setMaterials([]);

            setErrorMessage(
                error.response?.data?.message ||
                "Learning material could not be loaded",
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            getMaterials();
        }
    }, [id]);

    return (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <div className="flex items-start gap-2.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <BookOpenText
                            size={18}
                        />
                    </div>

                    <div>
                        <p className="text-[8px] font-bold uppercase tracking-[0.13em] text-blue-600 sm:text-[9px]">
                            Latest learning content
                        </p>

                        <h2 className="mt-0.5 text-base font-black tracking-tight text-[#071a4a] sm:text-lg">
                            {eventName
                                ? `${eventName} Study Material`
                                : "Study Material"}
                        </h2>

                        <p className="mt-1 text-[10px] leading-4 text-slate-500 sm:text-xs">
                            Explore recently added
                            notes, lectures and
                            practice resources.
                        </p>
                    </div>
                </div>

                {!loading &&
                    !errorMessage &&
                    materials.length > 0 && (
                        <div className="w-fit rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-extrabold text-blue-700">
                            {materials.length}{" "}
                            {materials.length ===
                                1
                                ? "resource"
                                : "resources"}
                        </div>
                    )}
            </div>

            {loading ? (
                <MaterialsLoading />
            ) : errorMessage ? (
                <MaterialsError
                    message={errorMessage}
                    onRetry={getMaterials}
                />
            ) : materials.length === 0 ? (
                <EmptyMaterials />
            ) : (
                <div className="grid grid-cols-2 gap-3 bg-slate-50/70 p-3 sm:p-4 lg:grid-cols-4">
                    {materials.map(
                        (material) => {
                            const style =
                                getStyle(
                                    material.type,
                                );

                            const Icon =
                                style.icon;

                            return (
                                <Link
                                    key={`${material.type}-${material._id}`}
                                    href={getMaterialHref(
                                        material,
                                    )}
                                    className="group flex min-w-0 flex-col rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md sm:p-3.5"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div
                                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-10 sm:w-10 ${style.iconStyle}`}
                                        >
                                            <Icon
                                                size={
                                                    18
                                                }
                                                strokeWidth={
                                                    1.9
                                                }
                                            />
                                        </div>

                                        <ArrowRight
                                            size={
                                                14
                                            }
                                            className="shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-600"
                                        />
                                    </div>

                                    <p className="mt-3 text-[7px] font-bold uppercase tracking-[0.12em] text-blue-600 sm:text-[8px]">
                                        {
                                            style.label
                                        }
                                    </p>

                                    <h3 className="mt-1 line-clamp-2 min-h-8 text-xs font-black leading-4 text-[#071a4a] sm:text-sm sm:leading-5">
                                        {material.title ||
                                            material.name ||
                                            "Learning resource"}
                                    </h3>

                                    <div className="mt-3 border-t border-slate-100 pt-2.5">
                                        <p className="truncate text-[8px] font-semibold text-slate-600 sm:text-[9px]">
                                            {getSubjectName(
                                                material,
                                            )}
                                        </p>

                                        <p className="mt-0.5 text-[7px] text-slate-400 sm:text-[8px]">
                                            {formatDate(
                                                material.updatedAt ||
                                                material.createdAt,
                                            )}
                                        </p>
                                    </div>
                                </Link>
                            );
                        },
                    )}
                </div>
            )}
        </section>
    );
};

const MaterialsLoading = () => {
    return (
        <div className="grid grid-cols-2 gap-3 bg-slate-50/70 p-3 sm:p-4 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
                <div
                    key={item}
                    className="animate-pulse rounded-xl border border-slate-200 bg-white p-3 sm:p-3.5"
                >
                    <div className="h-9 w-9 rounded-xl bg-slate-100 sm:h-10 sm:w-10" />

                    <div className="mt-3 h-2 w-14 rounded bg-slate-100" />

                    <div className="mt-2 h-3 w-full rounded bg-slate-200" />

                    <div className="mt-1.5 h-3 w-3/4 rounded bg-slate-100" />

                    <div className="mt-3 border-t border-slate-100 pt-2.5">
                        <div className="h-2.5 w-20 rounded bg-slate-100" />
                    </div>
                </div>
            ))}
        </div>
    );
};

const MaterialsError = ({
    message,
    onRetry,
}) => {
    return (
        <div className="flex min-h-52 items-center justify-center bg-slate-50/70 px-4 py-8 text-center">
            <div className="max-w-sm">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-500">
                    <FileText size={21} />
                </div>

                <h3 className="mt-3 text-sm font-black text-[#071a4a]">
                    Material could not be loaded
                </h3>

                <p className="mt-1.5 text-xs leading-5 text-slate-500">
                    {message}
                </p>

                <button
                    type="button"
                    onClick={onRetry}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-[11px] font-bold text-white transition hover:bg-blue-700"
                >
                    <RefreshCw size={13} />
                    Try again
                </button>
            </div>
        </div>
    );
};

const EmptyMaterials = () => {
    return (
        <div className="flex min-h-52 items-center justify-center bg-slate-50/70 px-4 py-8 text-center">
            <div className="max-w-sm">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <BookOpenText
                        size={21}
                    />
                </div>

                <h3 className="mt-3 text-sm font-black text-[#071a4a]">
                    Study material is coming soon
                </h3>

                <p className="mt-1.5 text-xs leading-5 text-slate-500">
                    Notes, lectures, MCQs and
                    practice resources will appear
                    here when they are added.
                </p>
            </div>
        </div>
    );
};

export default EventMaterials;