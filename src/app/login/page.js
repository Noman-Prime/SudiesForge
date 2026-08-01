"use client";

import { useUser } from "@/context/userContext";
import axios from "axios";
import { useState } from "react";
import { toast } from "react-toastify";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

const Login = () => {
    const { setUser } = useUser();
    const navigate = useRouter();
    const [showPassword, setShowPassword] = useState(false);

    const [data, setData] = useState({
        email: "",
        password: ""
    });

    const updateValue = (e) => {
        setData((previousData) => ({
            ...previousData,
            [e.target.name]: e.target.value
        }));
    };

    const getLogin = async () => {
        const loginData = {
            email: data.email.trim().toLowerCase(),
            password: data.password
        };

        if (!loginData.email || !loginData.password) {
            toast.error("Please enter email and password");
            return;
        }

        try {
            const result = await axios.post(
                "/api/login",
                loginData,
                {
                    withCredentials: true
                }
            );

            if (!result.data.success) {
                toast.error(
                    result.data.message ||
                    "Login failed"
                );

                return;
            }

            if (!result.data.User) {
                toast.error("User was not returned by login API");
                return;
            }

            const loggedUser = result.data.User;

            setUser(loggedUser);

            setData({
                email: "",
                password: ""
            });

            setShowPassword(false);

            toast.success("Welcome To Studies Forge", {
                autoClose: 3000
            });

            if (loggedUser.role === "admin") {
                navigate.push("/admin");
            } else {
                navigate.push("/");
            }
        } catch (error) {
            console.log(
                error.response?.data ||
                error.message
            );

            toast.error(
                error.response?.data?.message ||
                "Login failed"
            );
        }
    };

    return (
        <div className="min-h-screen bg-[#f7faff]">
            <header className="relative z-50 border-b border-slate-200 bg-white">
                <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
                    <a href="/" className="relative z-50">
                        <Image
                            src="/logo.png"
                            alt="Studies Forge logo"
                            width={170}
                            height={45}
                            priority
                            className="relative z-50 h-9 w-auto object-contain"
                        />
                    </a>

                    <div className="flex items-center gap-3">
                        <span className="hidden text-xs text-slate-500 sm:block">
                            Don&apos;t have an account?
                        </span>

                        <a
                            href="/signup"
                            className="rounded-lg border border-blue-600 px-4 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-50"
                        >
                            Create account
                        </a>
                    </div>
                </div>
            </header>

            <main className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
                <section className="grid w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_15px_45px_rgba(15,23,42,0.07)] lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="p-5 sm:p-8 lg:p-10">
                        <div className="mb-7">
                            <span className="mb-3 inline-flex rounded-full bg-blue-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-blue-600">
                                Student login
                            </span>

                            <h1 className="!m-0 !text-[20px] !font-bold !leading-7 !text-[#071a4a]">
                                Welcome back
                            </h1>

                            <p className="!mb-0 !mt-1.5 max-w-md !text-[12px] !font-medium !leading-5 !text-slate-600">
                                Sign in to continue learning and access your study resources.
                            </p>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label htmlFor="email" className="mb-1.5 block text-xs font-semibold text-slate-700">
                                    Email
                                </label>

                                <input id="email" type="email" name="email" value={data.email} onChange={updateValue} placeholder="name@example.com" autoComplete="email" autoCapitalize="none" spellCheck={false} className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-xs placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
                            </div>

                            <div>
                                <div className="mb-1.5 flex items-center justify-between">
                                    <label htmlFor="password" className="text-xs font-semibold text-slate-700">
                                        Password
                                    </label>

                                    <a href="/forgot-password" className="text-[11px] font-semibold text-blue-600 hover:underline">
                                        Forgot password?
                                    </a>
                                </div>

                                <div className="relative">
                                    <input id="password" type={showPassword ? "text" : "password"} name="password" value={data.password} onChange={updateValue} placeholder="Enter your password" autoComplete="current-password" autoCapitalize="none" spellCheck={false} onKeyDown={(e) => e.key === "Enter" && getLogin()} className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-3.5 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-xs placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />

                                    <button type="button" onClick={() => setShowPassword((previousValue) => !previousValue)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100">
                                        {showPassword ? (
                                            <EyeOff size={17} />
                                        ) : (
                                            <Eye size={17} />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <button type="button" onClick={getLogin} className="h-11 w-full rounded-lg bg-[#1260e8] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 active:scale-[0.99]">
                                Sign in
                            </button>
                        </div>

                        <p className="!mb-0 !mt-6 text-center !text-[12px] !text-slate-500">
                            Don&apos;t have an account?{" "}

                            <a href="/signup" className="font-semibold text-blue-600 hover:underline">
                                Create a free account
                            </a>
                        </p>
                    </div>

                    <aside className="relative hidden overflow-hidden border-l border-blue-100 bg-[#f4f8ff] p-7 lg:flex lg:flex-col">
                        <div className="absolute -right-14 -top-14 z-0 h-40 w-40 rounded-full bg-blue-100/70" />
                        <div className="absolute -bottom-20 -left-20 z-0 h-48 w-48 rounded-full bg-white/60" />

                        <div className="relative z-10">
                            <p className="!m-0 !text-[10px] !font-semibold !uppercase !tracking-[0.16em] !text-blue-600">
                                Continue learning
                            </p>

                            <h2 className="!mb-0 !mt-2 !text-[16px] !font-bold !leading-6 !text-[#071a4a]">
                                Your study resources are ready.
                            </h2>

                            <p className="!mb-0 !mt-2 !text-[11px] !font-medium !leading-5 !text-slate-600">
                                Sign in to access your notes, lectures, MCQs and exam preparation.
                            </p>
                        </div>

                        <div className="relative z-10 my-6 grid grid-cols-2 gap-3">
                            <div className="rounded-xl border border-blue-100 bg-white p-3 shadow-sm">
                                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-xs font-bold text-blue-600">
                                    N
                                </div>

                                <h3 className="!m-0 !text-[12px] !font-semibold !text-[#071a4a]">
                                    Notes
                                </h3>

                                <p className="!mb-0 !mt-1 !text-[9px] !leading-4 !text-slate-500">
                                    Structured notes
                                </p>
                            </div>

                            <div className="rounded-xl border border-orange-100 bg-white p-3 shadow-sm">
                                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-xs font-bold text-orange-500">
                                    ▶
                                </div>

                                <h3 className="!m-0 !text-[12px] !font-semibold !text-[#071a4a]">
                                    Lectures
                                </h3>

                                <p className="!mb-0 !mt-1 !text-[9px] !leading-4 !text-slate-500">
                                    Topic-wise videos
                                </p>
                            </div>

                            <div className="rounded-xl border border-emerald-100 bg-white p-3 shadow-sm">
                                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-xs font-bold text-emerald-600">
                                    ?
                                </div>

                                <h3 className="!m-0 !text-[12px] !font-semibold !text-[#071a4a]">
                                    MCQs
                                </h3>

                                <p className="!mb-0 !mt-1 !text-[9px] !leading-4 !text-slate-500">
                                    Practice questions
                                </p>
                            </div>

                            <div className="rounded-xl border border-purple-100 bg-white p-3 shadow-sm">
                                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-xs font-bold text-purple-600">
                                    ✓
                                </div>

                                <h3 className="!m-0 !text-[12px] !font-semibold !text-[#071a4a]">
                                    Mock tests
                                </h3>

                                <p className="!mb-0 !mt-1 !text-[9px] !leading-4 !text-slate-500">
                                    Full-length tests
                                </p>
                            </div>
                        </div>

                        <div className="relative z-10 mt-auto rounded-xl bg-gradient-to-r from-[#071a4a] to-[#1260e8] p-4 text-white">
                            <h3 className="!m-0 !text-[14px] !font-semibold !text-white">
                                100% Free. Always.
                            </h3>

                            <p className="!mb-0 !mt-1 !text-[10px] !leading-4 !text-blue-100">
                                No subscriptions and no hidden charges.
                            </p>
                        </div>
                    </aside>
                </section>
            </main>
        </div>
    );
};

export default Login;