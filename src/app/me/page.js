"use client"

import { useUser } from "@/context/userContext"
import axios from "axios"
import Image from "next/image"
import { CalendarDays, Mail, MapPin, Pencil, Phone, Save, ShieldCheck, UserRound } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"

const DetailCard = ({ icon: Icon, label, value }) => {
    return (
        <div className="flex min-h-24 items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4 transition hover:border-blue-200 hover:bg-blue-50/40">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                <Icon size={17} strokeWidth={2} />
            </div>

            <div className="min-w-0">
                <p className="!m-0 !text-[10px] !font-semibold !uppercase !tracking-[0.1em] !text-slate-400">
                    {label}
                </p>

                <p className="!mb-0 !mt-1.5 break-words !text-[13px] !font-semibold !leading-5 !text-slate-800">
                    {value || "Not provided"}
                </p>
            </div>
        </div>
    )
}

const User = () => {
    const { user, setUser } = useUser()
    const [isEditing, setIsEditing] = useState(false)

    const [data, setData] = useState({
        firstname: "",
        lastname: "",
        email: "",
        contactnumber: "",
        country: ""
    })

    const updateValues = (e) => {
        setData((pre) => ({
            ...pre,
            [e.target.name]: e.target.value
        }))
    }

    const update = async () => {
        try {
            const result = await axios.put("/api/user", data, { withCredentials: true })

            if (result.data.success) {
                setUser(result.data.user)
                setIsEditing(false)
                toast.success("Account details updated")
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "User could not be updated")
        }
    }

    const handleUpdate = async () => {
        if (!isEditing) {
            setIsEditing(true)
            return
        }

        await update()
    }

    useEffect(() => {
        const getUser = async () => {
            try {
                const result = await axios.get("/api/user", { withCredentials: true })

                if (result.data.success) {
                    setUser(result.data.user)
                }
            } catch (error) {
                console.log(error.response?.data)
                toast.error(error.response?.data?.message || "Please login")
            }
        }

        getUser()
    }, [setUser])

    useEffect(() => {
        if (user) {
            setData({
                firstname: user.firstname || "",
                lastname: user.lastname || "",
                email: user.email || "",
                contactnumber: user.contactnumber || "",
                country: user.country || ""
            })
        }
    }, [user])

    const fullName = user ? `${user.firstname || ""} ${user.lastname || ""}`.trim() : ""
    const profileImage = user?.profileimage?.url
    const userInitial = user?.firstname?.charAt(0)?.toUpperCase() || "U"
    const accountRole = user?.role

    const joinedDate = user?.createdAt
        ? new Date(user.createdAt).toLocaleDateString("en-PK", {
            day: "numeric",
            month: "long",
            year: "numeric"
        })
        : "Not available"

    return (
        <main className="min-h-[calc(100vh-64px)] bg-[#f6f9ff] px-4 py-6 sm:px-6 sm:py-8 lg:py-10">
            <div className="mx-auto w-full max-w-6xl">
                <div className="mb-5 sm:mb-6">
                    <h1 className="!m-0 !text-[20px] !font-bold !leading-7 !text-blue-600 sm:!text-[22px]">
                        Account Details
                    </h1>

                    <p className="!mb-0 !mt-1 !text-[12px] !leading-5 !text-slate-500">
                        View and update your personal information.
                    </p>
                </div>

                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_12px_35px_rgba(15,23,42,0.06)] lg:grid lg:grid-cols-[290px_1fr]">
                    <aside className="relative overflow-hidden bg-gradient-to-br from-[#071a4a] to-[#125fd8] p-5 text-white sm:p-6 lg:min-h-[500px] lg:p-7">
                        <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-white/[0.07]"></div>
                        <div className="absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-blue-300/[0.08]"></div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-4 lg:flex-col lg:items-start lg:gap-5">
                                <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white/20 bg-white text-xl font-bold text-blue-700 shadow-lg sm:h-20 sm:w-20 lg:h-24 lg:w-24">
                                    {profileImage ? (
                                        <Image src={profileImage} alt={fullName || "User profile"} width={96} height={96} unoptimized className="h-full w-full object-cover" />
                                    ) : (
                                        <span>{userInitial}</span>
                                    )}
                                </div>

                                <div className="min-w-0">
                                    <p className="!m-0 !text-[10px] !font-semibold !uppercase !tracking-[0.14em] !text-blue-200">
                                        Studies Forge account
                                    </p>

                                    <h2 className="!mb-0 !mt-1 truncate !text-[18px] !font-bold !leading-6 !text-white">
                                        {fullName || "User account"}
                                    </h2>

                                    <p className="!mb-0 !mt-1 truncate !text-[11px] !text-blue-100">
                                        {user?.email || "Email not available"}
                                    </p>
                                </div>
                            </div>

                            <p className="!mb-0 !mt-6 hidden !text-[11px] !leading-5 !text-blue-100 lg:block">
                                Keep your personal details accurate so your Studies Forge account remains up to date.
                            </p>

                            <div className="mt-5 grid grid-cols-2 gap-2.5 lg:mt-7 lg:grid-cols-1">
                                <div className="rounded-xl border border-white/10 bg-white/[0.08] p-3.5">
                                    <div className="flex items-center gap-2 text-blue-200">
                                        <ShieldCheck size={16} />

                                        <span className="text-[9px] font-semibold uppercase tracking-wider">
                                            Account role
                                        </span>
                                    </div>

                                    <p className="!mb-0 !mt-2 !text-[12px] !font-semibold !capitalize !text-white">
                                        {accountRole ? `${accountRole} account` : "Not available"}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-white/10 bg-white/[0.08] p-3.5">
                                    <div className="flex items-center gap-2 text-blue-200">
                                        <CalendarDays size={16} />

                                        <span className="text-[9px] font-semibold uppercase tracking-wider">
                                            Member since
                                        </span>
                                    </div>

                                    <p className="!mb-0 !mt-2 !text-[12px] !font-semibold !text-white">
                                        {joinedDate}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </aside>

                    <div className="p-5 sm:p-7 lg:p-8">
                        <div className="border-b border-slate-200 pb-5">
                            <h2 className="!m-0 !text-[16px] !font-bold !leading-6 !text-[#071a4a]">
                                {isEditing ? "Edit personal information" : "Personal information"}
                            </h2>

                            <p className="!mb-0 !mt-1 !text-[11px] !leading-5 !text-slate-500">
                                {isEditing ? "Update the information connected with your account." : "Information associated with your registered account."}
                            </p>
                        </div>

                        {isEditing ? (
                            <div className="mt-5 space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <label htmlFor="firstname" className="mb-1.5 block text-xs font-semibold text-slate-700">
                                            First name
                                        </label>

                                        <input id="firstname" type="text" name="firstname" value={data.firstname} onChange={updateValues} placeholder="Enter first name" autoComplete="given-name" className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
                                    </div>

                                    <div>
                                        <label htmlFor="lastname" className="mb-1.5 block text-xs font-semibold text-slate-700">
                                            Last name
                                        </label>

                                        <input id="lastname" type="text" name="lastname" value={data.lastname} onChange={updateValues} placeholder="Enter last name" autoComplete="family-name" className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="email" className="mb-1.5 block text-xs font-semibold text-slate-700">
                                        Email address
                                    </label>

                                    <input id="email" type="email" name="email" value={data.email} onChange={updateValues} placeholder="name@example.com" autoComplete="email" className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <label htmlFor="contactnumber" className="mb-1.5 block text-xs font-semibold text-slate-700">
                                            Contact number
                                        </label>

                                        <input id="contactnumber" type="tel" name="contactnumber" value={data.contactnumber} onChange={updateValues} placeholder="03XXXXXXXXX" inputMode="numeric" maxLength={11} autoComplete="tel" className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
                                    </div>

                                    <div>
                                        <label htmlFor="country" className="mb-1.5 block text-xs font-semibold text-slate-700">
                                            Country
                                        </label>

                                        <input id="country" type="text" name="country" value={data.country} onChange={updateValues} placeholder="Enter country" autoComplete="country-name" className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="mt-5 grid gap-3.5 sm:grid-cols-2 sm:gap-4">
                                <DetailCard icon={UserRound} label="Full name" value={fullName} />
                                <DetailCard icon={Mail} label="Email address" value={user?.email} />
                                <DetailCard icon={Phone} label="Contact number" value={user?.contactnumber} />
                                <DetailCard icon={MapPin} label="Country" value={user?.country} />
                            </div>
                        )}

                        <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                            <div className="flex items-start gap-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                                    <ShieldCheck size={17} />
                                </div>

                                <div>
                                    <p className="!m-0 !text-[12px] !font-semibold !capitalize !text-[#071a4a]">
                                        {accountRole ? `${accountRole} account` : "Account role not available"}
                                    </p>

                                    <p className="!mb-0 !mt-1 !text-[10px] !leading-4 !text-slate-500">
                                        Your account permissions and access are based on the role assigned through your profile.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-5 flex justify-end border-t border-slate-200 pt-5">
                            <button type="button" onClick={handleUpdate} className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 active:scale-[0.99] sm:w-auto">
                                {isEditing ? <Save size={17} /> : <Pencil size={17} />}
                                {isEditing ? "Save changes" : "Update"}
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    )
}

export default User