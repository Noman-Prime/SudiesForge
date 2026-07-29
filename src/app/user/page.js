"use client"

import { useUser } from "@/context/userContext"
import axios from "axios"
import { useState } from "react"
import { toast } from "react-toastify"
import Image from "next/image"

const CreateUser = () => {
    const { setUser } = useUser()
    const [data, setData] = useState({
        firstname: "",
        lastname: "",
        email: "",
        password: "",
        contactnumber: "",
        country: ""
    })

    const updateValue = (e) => {
        setData((pre) => ({
            ...pre,
            [e.target.name]: e.target.value
        }))
    }
    const signUp = async () => {
        try {
            const result = await axios.post("/api/user", data, { withCredentials: true })
            if (result.data.success) {
                toast.success("Account is Registed")
                setUser(result.data)
            }
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <div className="min-h-screen bg-[#f7faff]">
            <header className="relative z-50 border-b border-slate-200 bg-white">
                <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
                    <a href="/" className="relative z-50">
                        <Image src="/logo.png" alt="StudiesForge logo" width={170} height={45} priority className="relative z-50 h-9 w-auto object-contain" />
                    </a>

                    <div className="flex items-center gap-3">
                        <span className="hidden text-xs text-slate-500 sm:block">Already registered?</span>

                        <a href="/login" className="rounded-lg border border-blue-600 px-4 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-50">
                            Sign in
                        </a>
                    </div>
                </div>
            </header>

            <main className="px-4 py-7 sm:px-6 sm:py-10 lg:py-12">
                <section className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_15px_45px_rgba(15,23,42,0.07)] lg:grid-cols-[1.18fr_0.82fr]">
                    <div className="p-5 sm:p-8 lg:p-10">
                        <div className="mb-7">
                            <span className="mb-3 inline-flex rounded-full bg-blue-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-blue-600">
                                Free student account
                            </span>

                            <h1 className="text-xl font-bold text-[#071a4a] md:text-black">
                                Create your account
                            </h1>

                            <p className="mt-2 max-w-md text-xs leading-5 text-slate-500 sm:text-[13px]">
                                Get access to free notes, lectures, MCQs, mock tests and exam preparation material.
                            </p>
                        </div>

                        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="firstname" className="mb-1.5 block text-xs font-semibold text-slate-700">
                                        First name
                                    </label>

                                    <input id="firstname" type="text" name="firstname" value={data.firstname} onChange={updateValue} placeholder="Enter first name" autoComplete="given-name" className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-xs placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
                                </div>

                                <div>
                                    <label htmlFor="lastname" className="mb-1.5 block text-xs font-semibold text-slate-700">
                                        Last name
                                    </label>

                                    <input id="lastname" type="text" name="lastname" value={data.lastname} onChange={updateValue} placeholder="Enter last name" autoComplete="family-name" className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-xs placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="email" className="mb-1.5 block text-xs font-semibold text-slate-700">
                                    Email address
                                </label>

                                <input id="email" type="email" name="email" value={data.email} onChange={updateValue} placeholder="name@example.com" autoComplete="email" className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-xs placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
                            </div>

                            <div>
                                <label htmlFor="password" className="mb-1.5 block text-xs font-semibold text-slate-700">
                                    Password
                                </label>

                                <input id="password" type="password" name="password" value={data.password} onChange={updateValue} placeholder="Create a secure password" autoComplete="new-password" className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-xs placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />

                                <p className="mt-1.5 text-[10px] text-slate-400">
                                    Use a strong password to keep your account secure.
                                </p>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="contactnumber" className="mb-1.5 block text-xs font-semibold text-slate-700">
                                        Contact number
                                    </label>

                                    <input id="contactnumber" type="tel" name="contactnumber" value={data.contactnumber} onChange={updateValue} placeholder="03XXXXXXXXX" inputMode="numeric" maxLength={11} autoComplete="tel" className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-xs placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
                                </div>

                                <div>
                                    <label htmlFor="country" className="mb-1.5 block text-xs font-semibold text-slate-700">
                                        Country
                                    </label>

                                    <input id="country" type="text" name="country" value={data.country} onChange={updateValue} placeholder="Enter country" autoComplete="country-name" className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-xs placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
                                </div>
                            </div>

                            <p className="text-[10px] leading-4 text-slate-500">
                                By creating an account, you agree to our{" "}
                                <a href="/terms" className="font-semibold text-blue-600 hover:underline">
                                    Terms of Use
                                </a>{" "}
                                and{" "}
                                <a href="/privacy" className="font-semibold text-blue-600 hover:underline">
                                    Privacy Policy
                                </a>.
                            </p>

                            <button type="button" onClick={signUp} className="h-11 w-full rounded-lg bg-[#1260e8] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 active:scale-[0.99]">
                                Create free account
                            </button>
                        </form>

                        <p className="mt-5 text-center text-xs text-slate-500">
                            Already have an account?{" "}
                            <a href="/login" className="font-semibold text-blue-600 hover:underline">
                                Sign in
                            </a>
                        </p>
                    </div>

                    <aside className="relative hidden overflow-hidden border-l border-blue-100 bg-[#f4f8ff] p-7 lg:flex lg:flex-col">
                        <div className="absolute -right-14 -top-14 z-0 h-40 w-40 rounded-full bg-blue-100/70"></div>
                        <div className="absolute -bottom-20 -left-20 z-0 h-48 w-48 rounded-full bg-white/60"></div>

                        <div className="relative z-10">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-600">
                                StudiesForge resources
                            </p>

                            <h2 className="mt-2 text-base font-bold leading-6 text-[#071a4a]">
                                Prepare smarter with free educational content.
                            </h2>

                            <p className="mt-2 text-[11px] leading-5 text-slate-500">
                                Find useful study material organized for major Pakistani exams.
                            </p>
                        </div>

                        <div className="relative z-10 my-6 grid grid-cols-2 gap-3">
                            <div className="rounded-xl border border-blue-100 bg-white p-3 shadow-sm">
                                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-xs font-bold text-blue-600">
                                    N
                                </div>

                                <h3 className="text-xs font-semibold text-[#071a4a]">Notes</h3>
                                <p className="mt-1 text-[9px] leading-4 text-slate-400">Structured study notes</p>
                            </div>

                            <div className="rounded-xl border border-orange-100 bg-white p-3 shadow-sm">
                                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-xs font-bold text-orange-500">
                                    ▶
                                </div>

                                <h3 className="text-xs font-semibold text-[#071a4a]">Lectures</h3>
                                <p className="mt-1 text-[9px] leading-4 text-slate-400">Topic-wise videos</p>
                            </div>

                            <div className="rounded-xl border border-emerald-100 bg-white p-3 shadow-sm">
                                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-xs font-bold text-emerald-600">
                                    ?
                                </div>

                                <h3 className="text-xs font-semibold text-[#071a4a]">MCQs</h3>
                                <p className="mt-1 text-[9px] leading-4 text-slate-400">Practice questions</p>
                            </div>

                            <div className="rounded-xl border border-purple-100 bg-white p-3 shadow-sm">
                                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-xs font-bold text-purple-600">
                                    ✓
                                </div>

                                <h3 className="text-xs font-semibold text-[#071a4a]">Mock tests</h3>
                                <p className="mt-1 text-[9px] leading-4 text-slate-400">Full-length tests</p>
                            </div>
                        </div>

                        <div className="relative z-10 rounded-xl border border-slate-200 bg-white p-4">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                Popular exams
                            </p>

                            <div className="mt-3 grid grid-cols-4 gap-2">
                                <span className="rounded-lg bg-emerald-50 py-2 text-center text-[10px] font-semibold text-emerald-700">
                                    MDCAT
                                </span>

                                <span className="rounded-lg bg-orange-50 py-2 text-center text-[10px] font-semibold text-orange-600">
                                    NTS
                                </span>

                                <span className="rounded-lg bg-purple-50 py-2 text-center text-[10px] font-semibold text-purple-600">
                                    CSS
                                </span>

                                <span className="rounded-lg bg-blue-50 py-2 text-center text-[10px] font-semibold text-blue-600">
                                    PMS
                                </span>
                            </div>
                        </div>

                        <div className="relative z-10 mt-auto pt-6">
                            <div className="rounded-xl bg-gradient-to-r from-[#071a4a] to-[#1260e8] p-4 text-white">
                                <h3 className="text-sm font-semibold">100% Free. Always.</h3>

                                <p className="mt-1 text-[10px] leading-4 text-blue-100">
                                    No hidden charges and no subscriptions.
                                </p>
                            </div>
                        </div>
                    </aside>
                </section>
            </main>
        </div>
    );
}

export default CreateUser