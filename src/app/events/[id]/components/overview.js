"use client";

import axios from "axios";
import {
    BookOpen,
    GraduationCap,
    LibraryBig,
    Target,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const EventOverview = () => {
    const { id } = useParams();

    const [eventName, setEventName] = useState("");
    const [subjects, setSubjects] = useState([]);
    const [materials, setMaterials] = useState([]);

    const getOverview = async () => {
        try {
            const navigationResult = await axios.get(
                `/api/events/${id}/navigation`,
            );

            const subjectResult = await axios.get(
                "/api/subject",
            );

            if (navigationResult.data.success) {
                setEventName(
                    navigationResult.data.eventName,
                );

                setMaterials(
                    navigationResult.data.collection || [],
                );
            }

            if (subjectResult.data.success) {
                const eventSubjects = (
                    subjectResult.data.subjects || []
                ).filter((subject) => {
                    const eventId =
                        subject.event?._id ||
                        subject.event;

                    return String(eventId) === String(id);
                });

                setSubjects(eventSubjects);
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        if (id) {
            getOverview();
        }
    }, [id]);

    if (!eventName) {
        return null;
    }

    const subjectNames = subjects
        .map((subject) => subject.name)
        .join(", ");

    const studyMaterials = materials.filter(
        (item) => item.key !== "subjects",
    );

    const materialNames = studyMaterials
        .map((item) => item.name)
        .join(", ");

    const resourceCount = studyMaterials.reduce(
        (total, item) => total + item.count,
        0,
    );

    return (
        <section
            id="overview"
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
            <div className="border-b border-slate-200 px-4 py-4 sm:px-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-600">
                    {eventName} information
                </p>

                <h2 className="mt-1 text-lg font-extrabold tracking-tight text-[#071a4a] sm:text-xl">
                    Exam Overview
                </h2>
            </div>

            <div className="grid grid-cols-1 divide-y divide-slate-200 sm:grid-cols-2 xl:grid-cols-4 xl:divide-x xl:divide-y-0">
                <article className="p-4 sm:p-5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <GraduationCap
                            size={19}
                            strokeWidth={1.9}
                        />
                    </div>

                    <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                        Exam
                    </p>

                    <h3 className="mt-1 text-sm font-extrabold text-[#071a4a]">
                        {eventName}
                    </h3>
                </article>

                <article className="p-4 sm:p-5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                        <BookOpen
                            size={19}
                            strokeWidth={1.9}
                        />
                    </div>

                    <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                        Core subjects
                    </p>

                    <h3 className="mt-1 text-sm font-extrabold text-[#071a4a]">
                        {subjects.length} Subjects
                    </h3>

                    <p className="mt-1 text-[11px] leading-5 text-slate-500">
                        {subjectNames ||
                            "Subjects will be available soon"}
                    </p>
                </article>

                <article className="p-4 sm:p-5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                        <LibraryBig
                            size={19}
                            strokeWidth={1.9}
                        />
                    </div>

                    <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                        Study materials
                    </p>

                    <h3 className="mt-1 text-sm font-extrabold text-[#071a4a]">
                        {resourceCount} Resources
                    </h3>

                    <p className="mt-1 text-[11px] leading-5 text-slate-500">
                        {materialNames ||
                            "Study material will be available soon"}
                    </p>
                </article>

                <article className="p-4 sm:p-5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                        <Target
                            size={19}
                            strokeWidth={1.9}
                        />
                    </div>

                    <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                        Preparation
                    </p>

                    <h3 className="mt-1 text-sm font-extrabold text-[#071a4a]">
                        Structured Learning
                    </h3>

                    <p className="mt-1 text-[11px] leading-5 text-slate-500">
                        Explore the available {eventName} subjects
                        and preparation material.
                    </p>
                </article>
            </div>
        </section>
    );
};

export default EventOverview;