"use client";

import axios from "axios";
import { BookOpen, FileText, GraduationCap, Home, Library, ListChecks } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const iconMap = {
    subjects: GraduationCap,
    chapters: BookOpen,
    topics: FileText,
    mcqs: ListChecks,
    pastpapers: Library,
};

const sectionKeyMap = {
    subject: "subjects",
    subjects: "subjects",
    chapter: "chapters",
    chapters: "chapters",
    topic: "topics",
    topics: "topics",
    mcq: "mcqs",
    mcqs: "mcqs",
    pastpaper: "pastpapers",
    pastpapers: "pastpapers",
    past_papers: "pastpapers",
};

const sectionOrder = {
    subjects: 1,
    chapters: 2,
    topics: 3,
    mcqs: 4,
    pastpapers: 5,
};

const EventNavigation = () => {
    const { id } = useParams();
    const [eventName, setEventName] = useState("");
    const [activeSection, setActiveSection] = useState("overview");
    const [navigation, setNavigation] = useState([
        {
            key: "overview",
            name: "Overview",
            icon: Home,
        },
    ]);

    const getNavigation = async () => {
        try {
            const result = await axios.get(`/api/events/${id}/navigation`);

            if (!result.data.success) {
                return;
            }

            setEventName(result.data.eventName || "");

            const usedKeys = new Set();

            const collections = (result.data.collection || [])
                .filter((item) => Number(item.count) > 0)
                .map((item) => {
                    const originalKey = String(item.key || "").trim().toLowerCase().replace(/\s+/g, "_");
                    const key = sectionKeyMap[originalKey] || originalKey;

                    return {
                        key,
                        name: item.name || key,
                        count: Number(item.count) || 0,
                        icon: iconMap[key] || Library,
                    };
                })
                .filter((item) => {
                    if (!item.key || usedKeys.has(item.key)) {
                        return false;
                    }

                    usedKeys.add(item.key);
                    return true;
                })
                .sort((first, second) => {
                    const firstOrder = sectionOrder[first.key] || 100;
                    const secondOrder = sectionOrder[second.key] || 100;

                    return firstOrder - secondOrder;
                });

            setNavigation([
                {
                    key: "overview",
                    name: "Overview",
                    icon: Home,
                },
                ...collections,
            ]);
        } catch (error) {
            console.log(error);
        }
    };

    const changeSection = (section) => {
        const target = document.getElementById(section);

        if (!target) {
            return;
        }

        setActiveSection(section);

        const nextUrl = section === "overview" ? `/events/${id}` : `/events/${id}#${section}`;

        window.history.replaceState(null, "", nextUrl);

        target.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    };

    useEffect(() => {
        if (id) {
            getNavigation();
        }
    }, [id]);

    useEffect(() => {
        const hash = window.location.hash.replace("#", "");

        if (!hash) {
            return;
        }

        const scrollToHash = () => {
            const target = document.getElementById(hash);

            if (!target) {
                return false;
            }

            setActiveSection(hash);

            target.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });

            return true;
        };

        if (scrollToHash()) {
            return;
        }

        const page = document.querySelector("main") || document.body;

        const mutationObserver = new MutationObserver(() => {
            if (scrollToHash()) {
                mutationObserver.disconnect();
            }
        });

        mutationObserver.observe(page, {
            childList: true,
            subtree: true,
        });

        const timeout = setTimeout(() => mutationObserver.disconnect(), 5000);

        return () => {
            clearTimeout(timeout);
            mutationObserver.disconnect();
        };
    }, [navigation]);

    useEffect(() => {
        let sectionObserver;

        const observeSections = () => {
            if (sectionObserver) {
                sectionObserver.disconnect();
            }

            const sections = navigation.map((item) => document.getElementById(item.key)).filter(Boolean);

            if (sections.length === 0) {
                return;
            }

            sectionObserver = new IntersectionObserver(
                (entries) => {
                    const visibleSections = entries
                        .filter((entry) => entry.isIntersecting)
                        .sort((first, second) => Math.abs(first.boundingClientRect.top - 100) - Math.abs(second.boundingClientRect.top - 100));

                    if (visibleSections.length > 0) {
                        setActiveSection(visibleSections[0].target.id);
                    }
                },
                {
                    rootMargin: "-90px 0px -60% 0px",
                    threshold: [0, 0.1, 0.25],
                },
            );

            sections.forEach((section) => sectionObserver.observe(section));
        };

        observeSections();

        const page = document.querySelector("main") || document.body;
        const mutationObserver = new MutationObserver(observeSections);

        mutationObserver.observe(page, {
            childList: true,
            subtree: true,
        });

        return () => {
            mutationObserver.disconnect();

            if (sectionObserver) {
                sectionObserver.disconnect();
            }
        };
    }, [navigation]);

    return (
        <>
            <nav aria-label="Event sections" className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm lg:hidden">
                <div className="flex min-w-max px-2">
                    {navigation.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeSection === item.key;

                        return (
                            <button key={item.key} type="button" onClick={() => changeSection(item.key)} aria-pressed={isActive} className={`flex min-w-[86px] items-center justify-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-3 text-[10px] font-bold transition ${isActive ? "border-blue-600 bg-blue-50/70 text-blue-700" : "border-transparent text-slate-500 hover:text-blue-700"}`}>
                                <Icon size={16} strokeWidth={1.9} />

                                <span>{item.name}</span>

                                {item.count !== undefined && (
                                    <span className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[8px] font-extrabold ${isActive ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                                        {item.count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </nav>

            <aside className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
                <div className="border-b border-slate-200 px-4 py-4">
                    <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-blue-600">
                        Event navigation
                    </p>

                    <h2 className="mt-1 truncate text-sm font-extrabold text-[#071a4a]">
                        {eventName || "Event"}
                    </h2>
                </div>

                <nav aria-label="Event sections" className="space-y-1 p-2.5">
                    {navigation.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeSection === item.key;

                        return (
                            <button key={item.key} type="button" onClick={() => changeSection(item.key)} aria-pressed={isActive} className={`flex w-full items-center gap-2.5 rounded-xl border-l-[3px] px-3 py-2.5 text-left text-xs font-bold transition ${isActive ? "border-blue-600 bg-blue-50 text-blue-700" : "border-transparent text-slate-600 hover:bg-slate-50 hover:text-blue-700"}`}>
                                <Icon size={17} strokeWidth={1.9} className="shrink-0" />

                                <span className="min-w-0 flex-1 truncate">
                                    {item.name}
                                </span>

                                {item.count !== undefined && (
                                    <span className={`flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1 text-[9px] font-extrabold ${isActive ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                                        {item.count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </nav>
            </aside>
        </>
    );
};

export default EventNavigation;