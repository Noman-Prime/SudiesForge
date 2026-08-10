"use client";

import axios from "axios";
import {
    BookOpen,
    Home,
} from "lucide-react";
import {
    useParams,
    usePathname,
    useRouter,
} from "next/navigation";
import { useEffect, useState } from "react";

const EventNavigation = () => {
    const { id } = useParams();
    const pathname = usePathname();
    const navigate = useRouter();

    const [eventName, setEventName] = useState("");
    const [navigation, setNavigation] = useState([
        {
            key: "overview",
            name: "Overview",
            icon: Home,
        },
    ]);

    const currentPath = pathname
        .split("/")
        .filter(Boolean)[2];

    const activeSection = currentPath || "overview";

    const getNavigation = async () => {
        try {
            const result = await axios.get(
                `/api/events/${id}/navigation`,
            );

            if (result.data.success) {
                setEventName(result.data.eventName);

                const collections =
                    result.data.collection.map((item) => ({
                        key: item.key,
                        name: item.name,
                        count: item.count,
                        icon: BookOpen,
                    }));

                setNavigation([
                    {
                        key: "overview",
                        name: "Overview",
                        icon: Home,
                    },
                    ...collections,
                ]);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const changeSection = (section) => {
        if (section === "overview") {
            navigate.push(`/events/${id}`);
            return;
        }

        navigate.push(`/events/${id}/${section}`);
    };

    useEffect(() => {
        if (id) {
            getNavigation();
        }
    }, [id]);

    return (
        <>
            {/* Mobile navigation */}
            <nav className="overflow-x-auto border-y border-slate-200 bg-white lg:hidden">
                <div className="flex min-w-max px-3">
                    {navigation.map((item) => {
                        const Icon = item.icon;
                        const isActive =
                            activeSection === item.key;

                        return (
                            <button
                                key={item.key}
                                type="button"
                                onClick={() =>
                                    changeSection(item.key)
                                }
                                aria-pressed={isActive}
                                className={`flex min-w-20 flex-col items-center justify-center gap-1.5 border-b-2 px-3 py-3 text-[10px] font-bold transition ${isActive
                                        ? "border-blue-600 text-blue-600"
                                        : "border-transparent text-slate-500 hover:text-blue-600"
                                    }`}
                            >
                                <Icon
                                    size={17}
                                    strokeWidth={1.9}
                                />

                                <span>{item.name}</span>
                            </button>
                        );
                    })}
                </div>
            </nav>

            {/* Desktop navigation */}
            <aside className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
                <div className="border-b border-slate-200 px-5 py-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-600">
                        Event material
                    </p>

                    <h2 className="mt-1 text-base font-extrabold text-[#071a4a]">
                        {eventName} Resources
                    </h2>
                </div>

                <nav className="space-y-1.5 p-3">
                    {navigation.map((item) => {
                        const Icon = item.icon;
                        const isActive =
                            activeSection === item.key;

                        return (
                            <button
                                key={item.key}
                                type="button"
                                onClick={() =>
                                    changeSection(item.key)
                                }
                                aria-pressed={isActive}
                                className={`flex w-full items-center gap-3 rounded-xl border-l-[3px] px-3.5 py-3 text-left text-sm font-semibold transition ${isActive
                                        ? "border-blue-600 bg-blue-50 text-blue-700"
                                        : "border-transparent text-slate-600 hover:bg-slate-50 hover:text-blue-700"
                                    }`}
                            >
                                <Icon
                                    size={18}
                                    strokeWidth={1.9}
                                    className="shrink-0"
                                />

                                <span className="min-w-0 flex-1 truncate">
                                    {item.name}
                                </span>

                                {item.count !== undefined && (
                                    <span className="flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 px-1.5 text-[10px] font-bold text-slate-600">
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