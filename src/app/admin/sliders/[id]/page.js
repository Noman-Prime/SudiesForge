"use client";

import DeleteConfirmationModal from "@/app/admin/components/deleteconfirmation";
import { useUser } from "@/context/userContext";
import axios from "axios";
import Link from "next/link";
import {
    ArrowLeft,
    ChevronDown,
    CircleAlert,
    ExternalLink,
    GraduationCap,
    ImagePlus,
    LoaderCircle,
    Pencil,
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

const createSliderData = (slider) => ({
    type: slider?.type || "withoutImage",
    heading: slider?.heading || "",
    highlightedText: slider?.highlightedText || "",
    description: slider?.description || "",
    image: null,
    active: slider?.active ?? true,
});

const SliderPage = () => {
    const params = useParams();
    const router = useRouter();
    const { user } = useUser();

    const id = Array.isArray(params.id) ? params.id[0] : params.id;

    const [slider, setSlider] = useState(null);
    const [data, setData] = useState(createSliderData(null));
    const [imagePreview, setImagePreview] = useState("");
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const applySliderData = useCallback((currentSlider) => {
        setSlider(currentSlider);
        setData(createSliderData(currentSlider));
        setImagePreview("");
    }, []);

    const getSlider = useCallback(async () => {
        if (!id) {
            return;
        }

        try {
            setLoading(true);
            setErrorMessage("");

            const result = await axios.get(`/api/slider/${id}`, {
                withCredentials: true,
            });

            if (!result.data?.success || !result.data?.slider) {
                setSlider(null);
                setErrorMessage(result.data?.message || "Slider could not be loaded");
                return;
            }

            applySliderData(result.data.slider);
        } catch (error) {
            console.log(error);

            setSlider(null);
            setErrorMessage(error.response?.data?.message || "Slider could not be loaded");
        } finally {
            setLoading(false);
        }
    }, [applySliderData, id]);

    const updateData = (event) => {
        const { name, value, type, checked, files } = event.target;

        if (type === "file") {
            const selectedImage = files?.[0] || null;

            if (!selectedImage) {
                return;
            }

            if (!selectedImage.type.startsWith("image/")) {
                toast.error("Only image files are allowed", toastOptions);
                event.target.value = "";
                return;
            }

            if (selectedImage.size > 5 * 1024 * 1024) {
                toast.error("Image size cannot be greater than 5MB", toastOptions);
                event.target.value = "";
                return;
            }

            setData((previous) => ({
                ...previous,
                image: selectedImage,
            }));

            setImagePreview(URL.createObjectURL(selectedImage));
            return;
        }

        if (name === "type") {
            setData((previous) => ({
                ...previous,
                type: value,
                image: value === "withoutImage" ? null : previous.image,
            }));

            if (value === "withoutImage") {
                setImagePreview("");
            }

            return;
        }

        setData((previous) => ({
            ...previous,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const startEditing = () => {
        setData(createSliderData(slider));
        setImagePreview("");
        setEditing(true);
    };

    const cancelEditing = () => {
        setData(createSliderData(slider));
        setImagePreview("");
        setEditing(false);
    };

    const validateSlider = () => {
        if (!data.type) {
            toast.error("Please select a slider type", toastOptions);
            return false;
        }

        if (!data.heading.trim()) {
            toast.error("Slider heading is required", toastOptions);
            return false;
        }

        if (!data.highlightedText.trim()) {
            toast.error("Highlighted text is required", toastOptions);
            return false;
        }

        if (!data.description.trim()) {
            toast.error("Slider description is required", toastOptions);
            return false;
        }

        if (data.type === "withImage" && !data.image && !slider?.image?.url) {
            toast.error("Please select a slider image", toastOptions);
            return false;
        }

        return true;
    };

    const updateSlider = async () => {
        if (!validateSlider() || updating) {
            return;
        }

        try {
            setUpdating(true);

            const formData = new FormData();

            formData.append("type", data.type);
            formData.append("heading", data.heading.trim());
            formData.append("highlightedText", data.highlightedText.trim());
            formData.append("description", data.description.trim());
            formData.append("active", String(data.active));

            if (data.image) {
                formData.append("image", data.image);
            }

            const result = await axios.put(`/api/slider/${id}`, formData, {
                withCredentials: true,
            });

            if (!result.data?.success) {
                toast.error(result.data?.message || "Slider could not be updated", toastOptions);
                return;
            }

            if (result.data.slider) {
                applySliderData(result.data.slider);
            } else {
                await getSlider();
            }

            setEditing(false);

            toast.success(result.data.message || "Slider is updated", toastOptions);
        } catch (error) {
            console.log(error);

            toast.error(error.response?.data?.message || "Slider could not be updated", toastOptions);
        } finally {
            setUpdating(false);
        }
    };

    const openDeleteModal = () => {
        if (!deleting) {
            setShowDeleteModal(true);
        }
    };

    const closeDeleteModal = useCallback(() => {
        if (!deleting) {
            setShowDeleteModal(false);
        }
    }, [deleting]);

    const deleteSlider = async () => {
        if (!id || deleting) {
            return;
        }

        try {
            setDeleting(true);

            const result = await axios.delete(`/api/slider/${id}`, {
                withCredentials: true,
            });

            if (!result.data?.success) {
                toast.error(result.data?.message || "Slider could not be deleted", toastOptions);
                return;
            }

            setShowDeleteModal(false);

            toast.success(result.data.message || "Slider is deleted", toastOptions);

            router.replace("/admin/sliders");
        } catch (error) {
            console.log(error);

            toast.error(error.response?.data?.message || "Slider could not be deleted", toastOptions);
        } finally {
            setDeleting(false);
        }
    };

    useEffect(() => {
        return () => {
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    useEffect(() => {
        if (user === undefined) {
            return;
        }

        if (!user || user.role !== "admin") {
            router.replace("/");
            return;
        }

        getSlider();
    }, [getSlider, router, user]);

    if (user === undefined || loading) {
        return (
            <div className="min-h-screen bg-[#f5f7fb]">
                <AdminHeader user={user} />
                <SliderLoading />
            </div>
        );
    }

    if (!user || user.role !== "admin") {
        return null;
    }

    if (errorMessage || !slider) {
        return (
            <div className="min-h-screen bg-[#f5f7fb]">
                <AdminHeader user={user} />
                <SliderError message={errorMessage || "Slider is not available"} onRetry={getSlider} />
            </div>
        );
    }

    const previewData = editing ? data : slider;
    const previewHeading = previewData.heading || "Your slider heading";
    const previewHighlightedText = previewData.highlightedText || "Highlighted text";
    const previewDescription = previewData.description || "Your slider description will appear here.";
    const previewImage = editing ? imagePreview || slider.image?.url : slider.image?.url;
    const previewHasImage = previewData.type === "withImage";

    return (
        <div className="min-h-screen bg-[#f5f7fb]">
            <AdminHeader user={user} />

            <main className="mx-auto w-full max-w-[1450px] px-3 py-4 sm:px-6 sm:py-7">
                <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-2 text-xs sm:text-sm">
                    <Link href="/admin/sliders" className="flex items-center gap-1.5 font-semibold text-slate-500 transition hover:text-blue-700">
                        <ArrowLeft size={17} />
                        Sliders
                    </Link>

                    <span className="text-slate-300">/</span>

                    <span className="max-w-52 truncate font-semibold text-blue-700">
                        {slider.heading}
                    </span>
                </nav>

                <section className="grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:grid-cols-[1.08fr_0.92fr]">
                    <aside className="border-b border-slate-200 bg-slate-50 p-4 sm:p-6 lg:border-b-0 lg:border-r lg:p-8">
                        <div className="lg:sticky lg:top-24">
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-blue-600">
                                        {editing ? "Live preview" : "Slider preview"}
                                    </p>

                                    <h1 className="mt-1 text-lg font-extrabold text-[#071a4a]">
                                        {editing ? "Updating Slider" : "Website Slider"}
                                    </h1>
                                </div>

                                <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${previewData.active ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                                    {previewData.active ? "Active" : "Inactive"}
                                </span>
                            </div>

                            <SliderPreview
                                hasImage={previewHasImage}
                                image={previewImage}
                                heading={previewHeading}
                                highlightedText={previewHighlightedText}
                                description={previewDescription}
                            />

                            <p className="mt-3 text-xs leading-5 text-slate-500">
                                {editing
                                    ? "The preview updates immediately as you edit the slider."
                                    : "This is how the saved slider appears on the public website."}
                            </p>
                        </div>
                    </aside>

                    <section className="p-5 sm:p-8 lg:p-9">
                        <div className="mb-7">
                            <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-blue-600">
                                Slider management
                            </p>

                            <h2 className="mt-1.5 text-xl font-extrabold text-[#071a4a] sm:text-2xl">
                                {editing ? "Update Slider" : "Slider Information"}
                            </h2>

                            <p className="mt-1.5 text-xs leading-5 text-slate-500 sm:text-sm">
                                {editing
                                    ? "Edit the slider information and review the changes in the live preview."
                                    : "Review the saved slider information or select an action below."}
                            </p>
                        </div>

                        {editing ? (
                            <div className="space-y-5">
                                <SelectField id="type" name="type" label="Slider type" value={data.type} onChange={updateData} disabled={updating} options={[{ value: "withoutImage", label: "Without image" }, { value: "withImage", label: "With image" }]} />

                                <InputField id="heading" name="heading" label="Heading" value={data.heading} onChange={updateData} disabled={updating} />

                                <InputField id="highlightedText" name="highlightedText" label="Highlighted text" value={data.highlightedText} onChange={updateData} disabled={updating} />

                                <div>
                                    <label htmlFor="description" className="mb-2 block text-xs font-bold text-slate-700">
                                        Description
                                    </label>

                                    <textarea id="description" name="description" value={data.description} onChange={updateData} disabled={updating} rows={5} className="w-full resize-y rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm leading-6 text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50" />
                                </div>

                                {data.type === "withImage" && (
                                    <div>
                                        <label htmlFor="image" className="mb-2 block text-xs font-bold text-slate-700">
                                            Slider image
                                        </label>

                                        <label htmlFor="image" className={`flex min-h-28 flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-center transition hover:border-blue-400 hover:bg-blue-50 ${updating ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}>
                                            <ImagePlus size={22} className="text-blue-600" />

                                            <span className="mt-2 text-xs font-bold text-slate-700">
                                                {data.image ? data.image.name : "Select a new image"}
                                            </span>

                                            <span className="mt-1 text-[10px] text-slate-500">
                                                Leave unchanged to keep the current image. Maximum size: 5MB.
                                            </span>
                                        </label>

                                        <input id="image" type="file" name="image" accept="image/*" onChange={updateData} disabled={updating} className="hidden" />
                                    </div>
                                )}

                                <label className={`flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 ${updating ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}>
                                    <div>
                                        <span className="block text-sm font-bold text-slate-800">
                                            Active slider
                                        </span>

                                        <span className="mt-1 block text-[10px] leading-4 text-slate-500">
                                            Allow this slider to display on the public website.
                                        </span>
                                    </div>

                                    <input type="checkbox" name="active" checked={data.active} onChange={updateData} disabled={updating} className="h-5 w-5 accent-blue-600" />
                                </label>

                                <div className="grid grid-cols-2 gap-3 border-t border-slate-200 pt-5">
                                    <button type="button" onClick={cancelEditing} disabled={updating} className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60">
                                        <X size={17} />
                                        Cancel
                                    </button>

                                    <button type="button" onClick={updateSlider} disabled={updating} className="flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400">
                                        {updating ? (
                                            <>
                                                <LoaderCircle size={17} className="animate-spin" />
                                                Updating...
                                            </>
                                        ) : (
                                            <>
                                                <Save size={17} />
                                                Save Update
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <div className="space-y-4">
                                    <DetailItem label="Slider type" value={slider.type === "withImage" ? "With image" : "Without image"} />
                                    <DetailItem label="Heading" value={slider.heading} />
                                    <DetailItem label="Highlighted text" value={slider.highlightedText} blue />
                                    <DetailItem label="Description" value={slider.description} />
                                    <DetailItem label="Slider ID" value={slider._id} code />
                                </div>

                                <div className="mt-7 grid grid-cols-2 gap-3 border-t border-slate-200 pt-5">
                                    <button type="button" onClick={startEditing} className="flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-bold text-white transition hover:bg-blue-700">
                                        <Pencil size={17} />
                                        Update
                                    </button>

                                    <button type="button" onClick={openDeleteModal} disabled={deleting} className="flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-xs font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-400">
                                        <Trash2 size={17} />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        )}
                    </section>
                </section>
            </main>

            <DeleteConfirmationModal open={showDeleteModal} title="Delete Slider?" description="This will permanently remove the slider and its uploaded image from the website." itemName={slider.heading || "Slider"} confirmText="Delete Slider" loading={deleting} onCancel={closeDeleteModal} onConfirm={deleteSlider} />
        </div>
    );
};

const SliderPreview = ({ hasImage, image, heading, highlightedText, description }) => {
    if (!hasImage) {
        return (
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
                            {heading}
                        </span>

                        <span className="mt-1 line-clamp-2 bg-gradient-to-r from-blue-200 via-white to-sky-200 bg-clip-text text-[23px] text-transparent sm:text-[32px] lg:text-[40px]">
                            {highlightedText}
                        </span>
                    </h2>

                    <p className="mt-3 line-clamp-3 max-w-lg text-[9px] leading-4 text-blue-100/90 sm:mt-4 sm:text-xs sm:leading-5 lg:text-sm lg:leading-6">
                        {description}
                    </p>
                </div>
            </div>
        );
    }

    return (
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
                            {heading}
                        </span>

                        <span className="mt-1 line-clamp-2 text-[18px] text-blue-600 sm:text-[27px] lg:text-[34px]">
                            {highlightedText}
                        </span>
                    </h2>

                    <p className="mt-2.5 line-clamp-3 text-[9px] leading-4 text-slate-600 sm:mt-4 sm:text-xs sm:leading-5 lg:text-sm lg:leading-6">
                        {description}
                    </p>
                </div>

                <div className="relative flex h-full min-w-0 items-center justify-center">
                    <div className="absolute h-[120px] w-[120px] rounded-full bg-blue-200/60 blur-xl sm:h-[195px] sm:w-[195px] lg:h-[270px] lg:w-[270px]" />
                    <div className="absolute h-[116px] w-[116px] rounded-full border border-blue-200 bg-white/70 shadow-md sm:h-[188px] sm:w-[188px] lg:h-[262px] lg:w-[262px]" />

                    <div className="relative flex h-[105px] w-[105px] items-center justify-center overflow-hidden rounded-full border-[3px] border-white bg-blue-50 shadow-lg sm:h-[174px] sm:w-[174px] sm:border-4 lg:h-[245px] lg:w-[245px]">
                        {image ? (
                            <img src={image} alt={heading} className="h-full w-full object-cover" />
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
    );
};

const SelectField = ({ id, name, label, value, onChange, disabled, options }) => {
    return (
        <div>
            <label htmlFor={id} className="mb-2 block text-xs font-bold text-slate-700">
                {label}
            </label>

            <div className="relative">
                <select id={id} name={name} value={value} onChange={onChange} disabled={disabled} className="h-11 w-full appearance-none rounded-xl border border-slate-300 bg-white px-3.5 pr-10 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50">
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>

                <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
        </div>
    );
};

const InputField = ({ id, name, label, value, onChange, disabled }) => {
    return (
        <div>
            <label htmlFor={id} className="mb-2 block text-xs font-bold text-slate-700">
                {label}
            </label>

            <input id={id} type="text" name={name} value={value} onChange={onChange} disabled={disabled} autoComplete="off" className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50" />
        </div>
    );
};

const DetailItem = ({ label, value, blue = false, code = false }) => {
    return (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
                {label}
            </p>

            <p className={`mt-1.5 break-words ${code ? "font-mono text-xs" : "text-sm font-semibold"} ${blue ? "text-blue-600" : "text-slate-800"}`}>
                {value || "Not available"}
            </p>
        </div>
    );
};

const SliderLoading = () => {
    return (
        <main className="mx-auto w-full max-w-[1450px] px-3 py-7 sm:px-6">
            <div className="animate-pulse">
                <div className="h-5 w-44 rounded bg-slate-200" />
                <div className="mt-5 grid gap-5 lg:grid-cols-2">
                    <div className="h-[460px] rounded-2xl bg-white" />
                    <div className="h-[460px] rounded-2xl bg-white" />
                </div>
            </div>
        </main>
    );
};

const SliderError = ({ message, onRetry }) => {
    return (
        <main className="mx-auto flex min-h-[calc(100vh-80px)] w-full max-w-[900px] items-center justify-center px-4 py-10">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-sm">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500">
                    <CircleAlert size={23} />
                </div>

                <h1 className="mt-4 text-lg font-extrabold text-[#071a4a]">
                    Slider could not be opened
                </h1>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                    {message}
                </p>

                <button type="button" onClick={onRetry} className="mt-5 rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-blue-700">
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
        <header className="sticky top-0 z-50 border-b border-white/10 bg-[#102a63] px-2.5 py-2 text-white shadow-sm sm:px-6">
            <div className="mx-auto flex h-14 w-full max-w-[1500px] items-center gap-2 sm:h-16 sm:gap-4">
                <Link href="/admin" className="flex min-w-0 max-w-[46%] items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-2 py-1.5 text-white shadow-sm backdrop-blur-xl transition hover:bg-white/15 sm:max-w-none sm:gap-3 sm:rounded-2xl sm:px-4 sm:py-2">
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

                <div ref={menuRef} className="relative ml-auto min-w-0 max-w-[54%] sm:max-w-none">
                    <button type="button" aria-label="Open admin account menu" aria-haspopup="menu" aria-expanded={showUserMenu} onClick={() => setShowUserMenu((previous) => !previous)} className="flex w-full min-w-0 items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-2 py-1.5 text-left text-white shadow-sm backdrop-blur-xl transition hover:bg-white/15 sm:gap-3 sm:rounded-2xl sm:px-4 sm:py-2">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white text-xs font-bold uppercase text-[#102a63] sm:h-10 sm:w-10 sm:text-sm">
                            {user?.profileimage?.url ? (
                                <img src={user.profileimage.url} alt={accountName} className="h-full w-full object-cover" />
                            ) : (
                                user?.firstname?.charAt(0) || "A"
                            )}
                        </div>

                        <div className="min-w-0 max-w-[92px] sm:max-w-[220px]">
                            <span className="block truncate text-[11px] font-bold text-white sm:text-sm">
                                {accountName}
                            </span>

                            <span className="block truncate text-[9px] text-blue-200 sm:text-xs">
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

export default SliderPage;