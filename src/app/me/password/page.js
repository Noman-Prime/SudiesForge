"use client";

import axios from "axios";
import {
    ArrowRight,
    CheckCircle2,
    Eye,
    EyeOff,
    KeyRound,
    LockKeyhole,
    Save,
    ShieldCheck,
    X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";

const Password = () => {
    const navigate = useRouter();

    const [step, setStep] = useState("current");
    const [error, setError] = useState("");

    const [showPassword, setShowPassword] = useState({
        currentPassword: false,
        newPassword: false,
        confirmPassword: false,
    });

    const [data, setData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const updateValue = (e) => {
        setData((pre) => ({
            ...pre,
            [e.target.name]: e.target.value,
        }));

        setError("");
    };

    const togglePassword = (field) => {
        setShowPassword((pre) => ({
            ...pre,
            [field]: !pre[field],
        }));
    };

    const closePage = () => {
        setData({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        });

        setError("");
        setStep("current");

        setShowPassword({
            currentPassword: false,
            newPassword: false,
            confirmPassword: false,
        });

        navigate.push("/me");
    };

    const verifyCurrentPassword = async () => {
        if (!data.currentPassword) {
            setError("Please enter your current password");
            return;
        }

        try {
            const result = await axios.put(
                "/api/user/password",
                {
                    currentPassword: data.currentPassword,
                    verifyOnly: true,
                },
                {
                    withCredentials: true,
                },
            );

            if (result.data.success) {
                setError("");
                setStep("new");
                return;
            }

            setError(result.data.message || "Current password is incorrect");
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Current password could not be verified",
            );
        }
    };

    const updatePassword = async () => {
        if (!data.newPassword || !data.confirmPassword) {
            setError("Please enter and confirm your new password");
            return;
        }

        if (data.currentPassword === data.newPassword) {
            setError("New password must be different from current password");
            return;
        }

        if (data.newPassword !== data.confirmPassword) {
            setError("New password and confirm password must match");
            return;
        }

        try {
            const result = await axios.put("/api/user/password", data, {
                withCredentials: true,
            });

            if (result.data.success) {
                setData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                });

                setError("");

                toast.success("Password updated successfully");

                navigate.push("/me");
                return;
            }

            setError(result.data.message || "Password could not be updated");
        } catch (error) {
            setError(
                error.response?.data?.message || "Password could not be updated",
            );
        }
    };

    return (
        <main className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-[#f6f9ff] px-4 py-7 sm:px-6 sm:py-10">
            <section className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.08)]">
                <div className="relative overflow-hidden bg-gradient-to-r from-[#071a4a] to-[#1260e8] px-5 py-5 text-white sm:px-7 sm:py-6">
                    <div className="absolute -right-12 -top-16 h-40 w-40 rounded-full bg-white/[0.08]" />
                    <div className="absolute -bottom-20 left-12 h-36 w-36 rounded-full bg-blue-300/[0.08]" />

                    <div className="relative z-10 flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white">
                                <KeyRound size={20} />
                            </div>

                            <div>
                                <p className="m-0 text-[9px] font-semibold uppercase tracking-[0.16em] text-blue-200">
                                    Account security
                                </p>

                                <h1 className="mb-0 mt-1 text-[18px] font-bold leading-6 text-white sm:text-[20px]">
                                    Update password
                                </h1>

                                <p className="mb-0 mt-1 text-[10px] leading-4 text-blue-100 sm:text-[11px]">
                                    Verify your identity before creating a new password.
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={closePage}
                            aria-label="Cancel password update"
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white transition hover:bg-white/20 focus:outline-none focus:ring-4 focus:ring-white/20"
                        >
                            <X size={19} />
                        </button>
                    </div>
                </div>

                <div className="p-5 sm:p-7">
                    <div className="mb-6 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                        <div className="flex items-center gap-2">
                            <div
                                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${step === "current"
                                        ? "bg-blue-600 text-white"
                                        : "bg-emerald-100 text-emerald-700"
                                    }`}
                            >
                                {step === "new" ? <CheckCircle2 size={15} /> : "1"}
                            </div>

                            <span
                                className={`hidden text-[10px] font-semibold sm:block ${step === "current"
                                        ? "text-blue-700"
                                        : "text-emerald-700"
                                    }`}
                            >
                                Verify
                            </span>
                        </div>

                        <div className="h-px w-12 bg-slate-200 sm:w-24" />

                        <div className="flex items-center justify-end gap-2">
                            <div
                                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${step === "new"
                                        ? "bg-blue-600 text-white"
                                        : "bg-slate-100 text-slate-400"
                                    }`}
                            >
                                2
                            </div>

                            <span
                                className={`hidden text-[10px] font-semibold sm:block ${step === "new" ? "text-blue-700" : "text-slate-400"
                                    }`}
                            >
                                New password
                            </span>
                        </div>
                    </div>

                    {step === "current" ? (
                        <div>
                            <div className="mb-5">
                                <h2 className="m-0 text-[15px] font-bold leading-5 text-[#071a4a]">
                                    Enter your current password
                                </h2>

                                <p className="mb-0 mt-1 text-[11px] leading-5 text-slate-500">
                                    We need to confirm that this account belongs to you.
                                </p>
                            </div>

                            <div>
                                <label
                                    htmlFor="currentPassword"
                                    className="mb-1.5 block text-xs font-semibold text-slate-700"
                                >
                                    Current password
                                </label>

                                <div className="relative">
                                    <LockKeyhole
                                        size={17}
                                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                                    />

                                    <input
                                        id="currentPassword"
                                        type={
                                            showPassword.currentPassword ? "text" : "password"
                                        }
                                        name="currentPassword"
                                        value={data.currentPassword}
                                        onChange={updateValue}
                                        onKeyDown={(e) =>
                                            e.key === "Enter" && verifyCurrentPassword()
                                        }
                                        placeholder="Enter current password"
                                        autoComplete="current-password"
                                        autoCapitalize="none"
                                        spellCheck={false}
                                        autoFocus
                                        className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-xs placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => togglePassword("currentPassword")}
                                        aria-label={
                                            showPassword.currentPassword
                                                ? "Hide current password"
                                                : "Show current password"
                                        }
                                        className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                                    >
                                        {showPassword.currentPassword ? (
                                            <EyeOff size={17} />
                                        ) : (
                                            <Eye size={17} />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5">
                                    <p className="m-0 text-[11px] font-medium leading-4 text-red-600">
                                        {error}
                                    </p>
                                </div>
                            )}

                            <div className="mt-5 flex items-center justify-end gap-3 border-t border-slate-200 pt-5">
                                <button
                                    type="button"
                                    onClick={closePage}
                                    className="h-10 rounded-lg border border-slate-300 bg-white px-4 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={verifyCurrentPassword}
                                    className="flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-xs font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 active:scale-[0.99]"
                                >
                                    Continue
                                    <ArrowRight size={15} />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50/70 p-3.5">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                                    <ShieldCheck size={17} />
                                </div>

                                <div>
                                    <h2 className="m-0 text-[12px] font-semibold leading-5 text-emerald-800">
                                        Current password verified
                                    </h2>

                                    <p className="mb-0 mt-0.5 text-[10px] leading-4 text-emerald-700">
                                        You can now create a new password for your account.
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label
                                        htmlFor="newPassword"
                                        className="mb-1.5 block text-xs font-semibold text-slate-700"
                                    >
                                        New password
                                    </label>

                                    <div className="relative">
                                        <input
                                            id="newPassword"
                                            type={showPassword.newPassword ? "text" : "password"}
                                            name="newPassword"
                                            value={data.newPassword}
                                            onChange={updateValue}
                                            placeholder="Enter new password"
                                            autoComplete="new-password"
                                            autoCapitalize="none"
                                            spellCheck={false}
                                            autoFocus
                                            className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-3.5 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-xs placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                        />

                                        <button
                                            type="button"
                                            onClick={() => togglePassword("newPassword")}
                                            aria-label={
                                                showPassword.newPassword
                                                    ? "Hide new password"
                                                    : "Show new password"
                                            }
                                            className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                                        >
                                            {showPassword.newPassword ? (
                                                <EyeOff size={17} />
                                            ) : (
                                                <Eye size={17} />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label
                                        htmlFor="confirmPassword"
                                        className="mb-1.5 block text-xs font-semibold text-slate-700"
                                    >
                                        Confirm new password
                                    </label>

                                    <div className="relative">
                                        <input
                                            id="confirmPassword"
                                            type={
                                                showPassword.confirmPassword ? "text" : "password"
                                            }
                                            name="confirmPassword"
                                            value={data.confirmPassword}
                                            onChange={updateValue}
                                            onKeyDown={(e) =>
                                                e.key === "Enter" && updatePassword()
                                            }
                                            placeholder="Confirm new password"
                                            autoComplete="new-password"
                                            autoCapitalize="none"
                                            spellCheck={false}
                                            className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-3.5 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-xs placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                        />

                                        <button
                                            type="button"
                                            onClick={() => togglePassword("confirmPassword")}
                                            aria-label={
                                                showPassword.confirmPassword
                                                    ? "Hide confirmed password"
                                                    : "Show confirmed password"
                                            }
                                            className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                                        >
                                            {showPassword.confirmPassword ? (
                                                <EyeOff size={17} />
                                            ) : (
                                                <Eye size={17} />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5">
                                    <p className="m-0 text-[11px] font-medium leading-4 text-red-600">
                                        {error}
                                    </p>
                                </div>
                            )}

                            <div className="mt-5 flex items-center justify-end gap-3 border-t border-slate-200 pt-5">
                                <button
                                    type="button"
                                    onClick={closePage}
                                    className="h-10 rounded-lg border border-slate-300 bg-white px-4 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={updatePassword}
                                    className="flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-xs font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 active:scale-[0.99]"
                                >
                                    <Save size={15} />
                                    Save password
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
};

export default Password;