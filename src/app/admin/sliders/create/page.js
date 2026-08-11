"use client";

import { useUser } from "@/context/userContext";
import axios from "axios";
import Link from "next/link";
import {
    ArrowLeft,
    ChevronDown,
    ExternalLink,
    GraduationCap,
    ImagePlus,
    LayoutTemplate,
    LoaderCircle,
    Settings2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const Create = () => {
    const navigate = useRouter();
    const { user } = useUser();

    const [showUserMenu, setShowUserMenu] =
        useState(false);
    const [imagePreview, setImagePreview] =
        useState("");
    const [isCreating, setIsCreating] =
        useState(false);

    const [data, setData] = useState({
        type: "",
        heading: "",
        description: "",
        highlightedText: "",
        image: null,
        active: true,
    });

    const accountName = user
        ? `${user.firstname || ""} ${user.lastname || ""}`.trim() ||
        "Administrator"
        : "Administrator";

    const updateData = (e) => {
        const { name, value, type, checked, files } =
            e.target;

        if (type === "file") {
            const selectedImage = files?.[0] || null;

            setData((previous) => ({
                ...previous,
                image: selectedImage,
            }));

            setImagePreview(
                selectedImage
                    ? URL.createObjectURL(selectedImage)
                    : "",
            );

            return;
        }

        setData((previous) => ({
            ...previous,
            [name]:
                type === "checkbox" ? checked : value,
            ...(name === "type" &&
                value === "withoutImage"
                ? { image: null }
                : {}),
        }));

        if (
            name === "type" &&
            value === "withoutImage"
        ) {
            setImagePreview("");
        }
    };

    useEffect(() => {
        return () => {
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    const createSlider = async () => {
        if (isCreating) return;

        setIsCreating(true);

        try {
            const result = await axios.postForm(
                "/api/slider",
                data,
                { withCredentials: true },
            );

            if (result.data.success) {
                toast.success("Slider is created", {
                    autoClose: 3000,
                });

                setData({
                    type: "",
                    heading: "",
                    description: "",
                    highlightedText: "",
                    image: null,
                    active: true,
                });

                setImagePreview("");
                navigate.push("/admin/sliders");
            }
        } catch (error) {
            console.log(error);

            toast.error(
                error.response?.data?.message ||
                "Slider is not created",
                { autoClose: 3000 },
            );
        } finally {
            setIsCreating(false);
        }
    };

    const previewHeading =
        data.heading || "Your slider heading";

    const previewHighlightedText =
        data.highlightedText || "Highlighted text";

    const previewDescription =
        data.description ||
        "Your slider description will appear here exactly as it will appear on the website.";

    return (
        <div className="min-h-screen bg-slate-100">
            <header className="sticky top-0 z-50 bg-[#102a63] px-3 py-2 text-white shadow-sm sm:px-6">
                <div className="mx-auto flex h-14 w-full max-w-[1500px] items-center gap-2 sm:h-16 sm:gap-4">
                    <Link
                        href="/admin"
                        className="flex min-w-0 max-w-[48%] items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-2.5 py-2 text-white shadow-sm backdrop-blur-xl transition hover:bg-white/15 sm:max-w-none sm:gap-3 sm:px-4"
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

                    <div className="relative ml-auto min-w-0 max-w-[52%] sm:max-w-none">
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
                            className="flex w-full min-w-0 items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-2.5 py-2 text-left text-white shadow-sm backdrop-blur-xl transition hover:bg-white/15 sm:gap-3 sm:px-4"
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

                            <div className="min-w-0">
                                <span className="block truncate text-[11px] font-bold text-white sm:max-w-[220px] sm:text-sm">
                                    {accountName}
                                </span>

                                <span className="block truncate text-[9px] text-blue-200 sm:max-w-[220px] sm:text-xs">
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

            <main className="mx-auto w-full max-w-[1450px] px-3 py-5 sm:px-6 sm:py-8">
                <button
                    type="button"
                    onClick={() => navigate.back()}
                    className="mb-5 flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-700"
                >
                    <ArrowLeft size={17} />
                    Back
                </button>

                <section className="grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:grid-cols-[1.08fr_0.92fr]">
                    <aside className="border-b border-slate-200 bg-slate-50 p-4 sm:p-6 lg:border-b-0 lg:border-r lg:p-8">
                        <div className="lg:sticky lg:top-24">
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">
                                        Live preview
                                    </p>

                                    <h1 className="mt-1 text-lg font-bold text-slate-900">
                                        Website slider
                                    </h1>
                                </div>

                                <span
                                    className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${data.active
                                            ? "bg-emerald-100 text-emerald-700"
                                            : "bg-red-100 text-red-700"
                                        }`}
                                >
                                    {data.active
                                        ? "Active"
                                        : "Inactive"}
                                </span>
                            </div>

                            {data.type === "" ? (
                                <div className="flex h-[240px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-5 text-center sm:h-[300px] lg:h-[360px]">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                                        <LayoutTemplate size={23} />
                                    </div>

                                    <p className="mt-4 text-sm font-bold text-slate-800">
                                        Select a slider type
                                    </p>

                                    <p className="mt-1.5 max-w-xs text-xs leading-5 text-slate-500">
                                        Your live frontend preview will
                                        appear here.
                                    </p>
                                </div>
                            ) : data.type === "withImage" ? (
                                <div className="relative h-[240px] overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-[#f7faff] to-[#edf5ff] sm:h-[300px] lg:h-[360px]">
                                    <div className="absolute -right-16 -top-20 h-52 w-52 rounded-full bg-blue-100/80 blur-2xl sm:h-72 sm:w-72" />

                                    <div className="relative z-10 grid h-full grid-cols-[1.15fr_0.85fr] items-center gap-2.5 px-4 pb-6 pt-4 sm:grid-cols-[1.1fr_0.9fr] sm:gap-6 sm:px-7 sm:py-6 lg:gap-8 lg:px-9">
                                        <div className="flex min-w-0 flex-col justify-center text-left">
                                            <div className="mb-2 flex items-center gap-1.5">
                                                <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />

                                                <span className="truncate text-[7px] font-bold uppercase tracking-[0.15em] text-blue-600 sm:text-[9px]">
                                                    StudiesForge Learning
                                                </span>
                                            </div>

                                            <h2 className="font-extrabold leading-[1.1] tracking-[-0.03em] text-[#071a4a]">
                                                <span className="line-clamp-2 text-[18px] sm:text-[27px] lg:text-[34px]">
                                                    {previewHeading}
                                                </span>

                                                <span className="mt-1 line-clamp-2 text-[18px] text-blue-600 sm:text-[27px] lg:text-[34px]">
                                                    {previewHighlightedText}
                                                </span>
                                            </h2>

                                            <p className="mt-2.5 line-clamp-3 text-[9px] leading-4 text-slate-600 sm:mt-4 sm:text-xs sm:leading-5 lg:text-sm lg:leading-6">
                                                {previewDescription}
                                            </p>
                                        </div>

                                        <div className="relative flex h-full min-w-0 items-center justify-center">
                                            <div className="absolute h-[120px] w-[120px] rounded-full bg-blue-200/60 blur-xl sm:h-[195px] sm:w-[195px] lg:h-[270px] lg:w-[270px]" />

                                            <div className="absolute h-[116px] w-[116px] rounded-full border border-blue-200 bg-white/70 shadow-md sm:h-[188px] sm:w-[188px] lg:h-[262px] lg:w-[262px]" />

                                            <div className="relative flex h-[105px] w-[105px] items-center justify-center overflow-hidden rounded-full border-[3px] border-white bg-blue-50 shadow-lg sm:h-[174px] sm:w-[174px] sm:border-4 lg:h-[245px] lg:w-[245px]">
                                                {imagePreview ? (
                                                    <img
                                                        src={imagePreview}
                                                        alt={previewHeading}
                                                        className="h-full w-full rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full flex-col items-center justify-center text-blue-400">
                                                        <ImagePlus size={24} />

                                                        <span className="mt-1 hidden text-[9px] font-semibold sm:block">
                                                            Select image
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="relative flex h-[240px] items-center justify-center overflow-hidden rounded-2xl border border-blue-900 bg-gradient-to-br from-[#061538] via-[#0b2f73] to-[#1261d6] px-5 text-center sm:h-[300px] sm:px-10 lg:h-[360px]">
                                    <div className="absolute -right-20 -top-28 h-64 w-64 rounded-full border border-white/10 bg-white/[0.04]" />

                                    <div className="absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-blue-300/[0.08]" />

                                    <div className="relative z-10 flex max-w-xl flex-col items-center">
                                        <div className="mb-2 flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-blue-100 backdrop-blur-sm sm:mb-3">
                                            <GraduationCap size={12} />

                                            <span className="text-[7px] font-bold uppercase tracking-[0.16em] sm:text-[9px]">
                                                StudiesForge Learning
                                            </span>
                                        </div>

                                        <h2 className="font-extrabold leading-[1.08] tracking-[-0.035em] text-white">
                                            <span className="line-clamp-2 text-[23px] sm:text-[32px] lg:text-[40px]">
                                                {previewHeading}
                                            </span>

                                            <span className="mt-1 line-clamp-2 bg-gradient-to-r from-blue-200 via-white to-sky-200 bg-clip-text text-[23px] text-transparent sm:text-[32px] lg:text-[40px]">
                                                {previewHighlightedText}
                                            </span>
                                        </h2>

                                        <p className="mt-3 line-clamp-3 max-w-lg text-[9px] leading-4 text-blue-100/90 sm:mt-4 sm:text-xs sm:leading-5 lg:text-sm lg:leading-6">
                                            {previewDescription}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <p className="mt-3 text-xs leading-5 text-slate-500">
                                This preview updates immediately as you
                                type and follows the frontend slider
                                layout.
                            </p>
                        </div>
                    </aside>

                    <section className="p-5 sm:p-8 lg:p-9">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">
                                New slider
                            </p>

                            <h2 className="mt-2 text-xl font-bold text-slate-900 sm:text-2xl">
                                Slider information
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                Enter the content and confirm its
                                appearance in the live preview.
                            </p>
                        </div>

                        <div className="mt-7 space-y-5">
                            <div>
                                <label
                                    htmlFor="type"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Slider type
                                </label>

                                <select
                                    id="type"
                                    name="type"
                                    value={data.type}
                                    onChange={updateData}
                                    className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                                >
                                    <option value="">
                                        Select slider type
                                    </option>

                                    <option value="withImage">
                                        With image
                                    </option>

                                    <option value="withoutImage">
                                        Without image
                                    </option>
                                </select>
                            </div>

                            <div>
                                <label
                                    htmlFor="heading"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Heading
                                </label>

                                <input
                                    id="heading"
                                    type="text"
                                    name="heading"
                                    value={data.heading}
                                    onChange={updateData}
                                    placeholder="Prepare Smarter."
                                    className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="highlightedText"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Highlighted text
                                </label>

                                <input
                                    id="highlightedText"
                                    type="text"
                                    name="highlightedText"
                                    value={data.highlightedText}
                                    onChange={updateData}
                                    placeholder="Learn Without Limits."
                                    className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="description"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Description
                                </label>

                                <textarea
                                    id="description"
                                    name="description"
                                    value={data.description}
                                    onChange={updateData}
                                    rows={4}
                                    placeholder="Enter the slider description"
                                    className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                                />
                            </div>

                            {data.type === "withImage" && (
                                <div>
                                    <label
                                        htmlFor="image"
                                        className="mb-2 block text-sm font-semibold text-slate-700"
                                    >
                                        Slider image
                                    </label>

                                    <label
                                        htmlFor="image"
                                        className="flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-center transition hover:border-blue-400 hover:bg-blue-50"
                                    >
                                        <ImagePlus
                                            size={24}
                                            className="text-blue-600"
                                        />

                                        <span className="mt-2 text-sm font-semibold text-slate-700">
                                            {data.image
                                                ? data.image.name
                                                : "Select slider image"}
                                        </span>

                                        <span className="mt-1 text-xs text-slate-500">
                                            Maximum image size: 5 MB
                                        </span>
                                    </label>

                                    <input
                                        id="image"
                                        type="file"
                                        name="image"
                                        accept="image/*"
                                        onChange={updateData}
                                        className="hidden"
                                    />
                                </div>
                            )}

                            <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                                <div>
                                    <p className="text-sm font-semibold text-slate-800">
                                        Active slider
                                    </p>

                                    <p className="mt-1 text-xs text-slate-500">
                                        Display this slider on the website.
                                    </p>
                                </div>

                                <input
                                    type="checkbox"
                                    name="active"
                                    checked={data.active}
                                    onChange={updateData}
                                    className="h-5 w-5 accent-blue-600"
                                />
                            </label>

                            <button
                                type="button"
                                onClick={createSlider}
                                disabled={isCreating}
                                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-blue-400 disabled:opacity-70"
                            >
                                {isCreating && (
                                    <LoaderCircle
                                        size={18}
                                        className="animate-spin"
                                    />
                                )}

                                {isCreating
                                    ? "Creating..."
                                    : "Create slider"}
                            </button>
                        </div>
                    </section>
                </section>
            </main>
        </div>
    );
};

export default Create;