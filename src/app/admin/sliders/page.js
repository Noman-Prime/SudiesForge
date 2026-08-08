"use client";

import { useUser } from "@/context/userContext";
import axios from "axios";
import Link from "next/link";
import {
    ArrowLeft,
    ChevronDown,
    ExternalLink,
    Eye,
    GraduationCap,
    ImageIcon,
    LayoutTemplate,
    Plus,
    Settings2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const Sliders = () => {
    const navigate = useRouter();
    const { user } = useUser();

    const [sliders, setSliders] = useState([]);
    const [showUserMenu, setShowUserMenu] =
        useState(false);

    const accountName = user
        ? `${user.firstname || ""} ${user.lastname || ""}`.trim() ||
        "Administrator"
        : "Administrator";

    const getSliders = async () => {
        try {
            const result = await axios.get("/api/slider");

            if (result.data.success) {
                setSliders(result.data.sliders || []);
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        if (user === undefined) {
            return;
        }

        if (!user || user.role !== "admin") {
            navigate.push("/");
            return;
        }

        getSliders();
    }, [user]);

    if (user === undefined) {
        return null;
    }

    if (!user || user.role !== "admin") {
        return null;
    }

    return (
        <div className="min-h-screen bg-slate-100">
            <header className="sticky top-0 z-50 border-b border-white/10 bg-[#102a63] px-2.5 py-2 text-white shadow-sm sm:px-6">
                <div className="mx-auto flex h-14 w-full max-w-[1500px] items-center gap-2 sm:h-16 sm:gap-4">
                    <Link
                        href="/admin"
                        className="flex min-w-0 max-w-[46%] items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-2 py-1.5 text-white shadow-sm backdrop-blur-xl transition hover:bg-white/15 sm:max-w-none sm:gap-3 sm:rounded-2xl sm:px-4 sm:py-2"
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

                    <div className="relative ml-auto min-w-0 max-w-[54%] sm:max-w-none">
                        <button
                            type="button"
                            aria-label="Open admin account menu"
                            aria-haspopup="menu"
                            aria-expanded={showUserMenu}
                            onClick={() =>
                                setShowUserMenu(
                                    (previous) => !previous,
                                )
                            }
                            className="flex w-full min-w-0 items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-2 py-1.5 text-left text-white shadow-sm backdrop-blur-xl transition hover:bg-white/15 sm:gap-3 sm:rounded-2xl sm:px-4 sm:py-2"
                        >
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white text-xs font-bold uppercase text-[#102a63] sm:h-10 sm:w-10 sm:text-sm">
                                {user?.profileimage?.url ? (
                                    <img
                                        src={user.profileimage.url}
                                        alt={accountName}
                                        className="h-full w-full rounded-full object-cover"
                                    />
                                ) : (
                                    user?.firstname?.charAt(0) || "A"
                                )}
                            </div>

                            <div className="min-w-0 max-w-[92px] sm:max-w-[220px]">
                                <span className="block truncate text-[11px] font-bold text-white sm:text-sm">
                                    {accountName}
                                </span>

                                <span className="block truncate text-[9px] text-blue-200 sm:text-xs">
                                    {user?.email ||
                                        "admin@studiesforge.com"}
                                </span>
                            </div>

                            <ChevronDown
                                size={15}
                                className={`shrink-0 text-blue-200 transition-transform duration-200 ${showUserMenu
                                        ? "rotate-180"
                                        : "rotate-0"
                                    }`}
                            />
                        </button>

                        <div
                            role="menu"
                            className={`absolute right-0 top-full w-52 origin-top-right pt-2 transition-all duration-200 sm:w-56 ${showUserMenu
                                    ? "visible pointer-events-auto translate-y-0 opacity-100"
                                    : "invisible pointer-events-none translate-y-2 opacity-0"
                                }`}
                        >
                            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-2 text-slate-800 shadow-xl">
                                <Link
                                    href="/"
                                    role="menuitem"
                                    onClick={() =>
                                        setShowUserMenu(false)
                                    }
                                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition hover:bg-blue-50 hover:text-blue-700"
                                >
                                    <ExternalLink size={17} />
                                    View Website
                                </Link>

                                <Link
                                    href="/admin/settings"
                                    role="menuitem"
                                    onClick={() =>
                                        setShowUserMenu(false)
                                    }
                                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition hover:bg-blue-50 hover:text-blue-700"
                                >
                                    <Settings2 size={17} />
                                    Settings
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="mx-auto w-full max-w-[1500px] px-3 py-4 sm:px-6 sm:py-7 lg:px-8">
                <nav className="mb-4 flex items-center gap-1.5 text-xs sm:mb-5 sm:gap-2 sm:text-sm">
                    <Link
                        href="/admin"
                        className="flex items-center gap-1.5 font-semibold text-slate-500 transition hover:text-blue-700"
                    >
                        <ArrowLeft size={17} />
                        Dashboard
                    </Link>

                    <span className="text-slate-300">/</span>

                    <span className="font-semibold text-blue-700">
                        Sliders
                    </span>
                </nav>

                <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6 lg:p-7">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">
                            Website material
                        </p>

                        <h1 className="mt-1.5 text-lg font-bold text-slate-950 sm:mt-2 sm:text-2xl">
                            Slider Management
                        </h1>

                        <p className="mt-2 max-w-2xl text-xs leading-5 text-slate-500 sm:text-sm sm:leading-6">
                            Create and manage the sliders displayed on
                            the StudiesForge website.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            navigate.push("/admin/sliders/create")
                        }
                        className="flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 sm:w-auto"
                    >
                        <Plus size={18} />
                        Create Slider
                    </button>
                </section>

                {sliders.length === 0 ? (
                    <section className="mt-5 flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-center sm:mt-6 sm:min-h-64 sm:p-6">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                            <LayoutTemplate size={26} />
                        </div>

                        <h2 className="mt-4 text-lg font-bold text-slate-900">
                            No sliders created
                        </h2>

                        <p className="mt-2 text-sm text-slate-500">
                            Create your first website slider to display
                            it here.
                        </p>
                    </section>
                ) : (
                    <section className="mt-5 grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4 xl:mt-6 xl:gap-4">
                        {sliders.map((item) => (
                            <article
                                key={item._id}
                                className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md sm:rounded-2xl"
                            >
                                <div className="relative h-28 overflow-hidden border-b border-slate-100 sm:h-32 lg:h-36">
                                    <div className="absolute left-2 top-2 z-20 flex flex-wrap gap-1 sm:left-2.5 sm:top-2.5">
                                        <span
                                            className={`rounded-full px-1.5 py-0.5 text-[8px] font-bold shadow-sm sm:px-2 sm:py-1 sm:text-[9px] ${item.active
                                                    ? "bg-emerald-100 text-emerald-700"
                                                    : "bg-red-100 text-red-700"
                                                }`}
                                        >
                                            {item.active
                                                ? "Active"
                                                : "Inactive"}
                                        </span>
                                    </div>

                                    <span className="absolute right-2 top-2 z-20 rounded-full bg-white/95 px-1.5 py-0.5 text-[8px] font-bold text-blue-700 shadow-sm sm:right-2.5 sm:top-2.5 sm:px-2 sm:py-1 sm:text-[9px]">
                                        {item.type === "withImage"
                                            ? "With image"
                                            : "Without image"}
                                    </span>

                                    {item.type === "withImage" ? (
                                        <div className="relative grid h-full grid-cols-[1.12fr_0.88fr] items-center overflow-hidden bg-gradient-to-br from-white via-[#f7faff] to-[#eaf3ff] px-2 pb-2 pt-8 sm:px-3 sm:pb-3 sm:pt-9">
                                            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-blue-100/80 blur-xl" />

                                            <div className="relative z-10 flex min-w-0 flex-col justify-center pr-1 sm:pr-2">
                                                <h2 className="line-clamp-2 text-[9px] font-extrabold leading-3 text-[#071a4a] sm:text-[11px] sm:leading-4">
                                                    {item.heading}
                                                </h2>

                                                <p className="mt-0.5 line-clamp-2 text-[8px] font-bold leading-3 text-blue-600 sm:mt-1 sm:text-[9px] sm:leading-4">
                                                    {item.highlightedText}
                                                </p>
                                            </div>

                                            <div className="relative z-10 flex min-w-0 items-center justify-center">
                                                <div className="absolute h-[58px] w-[58px] rounded-full border border-blue-100 bg-white/80 shadow-sm sm:h-[72px] sm:w-[72px]" />

                                                <div className="relative h-[52px] w-[52px] overflow-hidden rounded-full border-2 border-white bg-blue-50 shadow-md sm:h-[66px] sm:w-[66px]">
                                                    {item.image?.url ? (
                                                        <img
                                                            src={item.image.url}
                                                            alt={item.heading}
                                                            className="h-full w-full rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center">
                                                            <ImageIcon
                                                                size={18}
                                                                className="text-blue-300"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="relative flex h-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#061538] via-[#0b2f73] to-[#1261d6] px-3 pb-3 pt-8 text-center sm:px-4 sm:pb-4 sm:pt-9">
                                            <div className="absolute -right-10 -top-12 h-28 w-28 rounded-full border border-white/10 bg-white/[0.04]" />

                                            <div className="absolute -bottom-14 -left-12 h-32 w-32 rounded-full bg-blue-300/[0.08]" />

                                            <div className="relative z-10 flex items-center gap-1 rounded-full border border-white/10 bg-white/10 px-2 py-0.5 text-blue-100 backdrop-blur-sm">
                                                <GraduationCap size={10} />

                                                <span className="text-[6px] font-bold uppercase tracking-[0.12em] sm:text-[7px]">
                                                    StudiesForge
                                                </span>
                                            </div>

                                            <h2 className="relative z-10 mt-1.5 line-clamp-2 text-[10px] font-extrabold leading-3 text-white sm:text-xs sm:leading-4">
                                                {item.heading}
                                            </h2>

                                            <p className="relative z-10 mt-0.5 line-clamp-2 bg-gradient-to-r from-blue-200 via-white to-sky-200 bg-clip-text text-[8px] font-bold leading-3 text-transparent sm:text-[9px] sm:leading-4">
                                                {item.highlightedText}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-1 flex-col p-2.5 sm:p-3.5">
                                    <p className="line-clamp-2 min-h-8 text-[9px] leading-4 text-slate-500 sm:min-h-10 sm:text-[10px]">
                                        {item.description}
                                    </p>

                                    <div className="mt-3 border-t border-slate-200 pt-2.5 sm:pt-3">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                navigate.push(
                                                    `/admin/sliders/${item._id}`,
                                                )
                                            }
                                            className="flex h-8 w-full items-center justify-center gap-1.5 rounded-md bg-blue-600 px-2 text-[9px] font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-100 sm:h-9 sm:rounded-lg sm:text-[10px]"
                                        >
                                            <Eye size={12} />
                                            View Slider
                                        </button>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </section>
                )}
            </main>
        </div>
    );
};

export default Sliders;