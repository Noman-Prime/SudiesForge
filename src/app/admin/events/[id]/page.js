"use client"
import { useEvent } from "@/context/EventContext"
import axios from "axios"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"

const Update = () => {
    const { id } = useParams()
    const [name, setName] = useState("")
    const updatedName = (e) => {
        setName(e.target.vale)
    }

    const updateEvent = async () => {
        try {
            const result = await axios.put(`/api/event/${id}`, name, { withCredentials: true })
            if (result.data.success) {
                toast.success("Event is Updated")
                setName(result.data.event)
                console.log(result.data.event);
            }
        } catch (error) {
            toast.error("Event is not updated")
        }
    }
    const current = async () => {
        try {
            const result = await axios.post(`/api/event/${id}`)
            if (result.success) {
                console.log(result.data.event);
                setName(result.data.event)
            }
        } catch (error) {
            setName("")
        }
    }
    useEffect(() => {
        current()
    }, [])
    return (
        <main className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-slate-100 px-4 py-8 sm:px-6">
            <section className="grid w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md md:grid-cols-[0.85fr_1.15fr]">
                <aside className="flex flex-col justify-between bg-blue-600 px-6 py-7 sm:px-8 md:px-9 md:py-10">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-sm font-bold text-blue-600">
                                SF
                            </div>

                            <span className="!text-base font-bold !text-white">
                                StudiesForge
                            </span>
                        </div>

                        <div className="mt-8 md:mt-14">
                            <p className="!m-0 !text-[10px] font-semibold uppercase tracking-[0.16em] !text-blue-100">
                                Event management
                            </p>

                            <h1 className="!mb-0 !mt-2 !text-[20px] font-bold !leading-7 !text-white sm:!text-[22px]">
                                Update educational event
                            </h1>

                            <p className="!mb-0 !mt-3 !text-[12px] !leading-5 !text-blue-100">
                                Change the event name to keep your educational content and website navigation accurate.
                            </p>
                        </div>
                    </div>

                    <p className="!mb-0 !mt-8 !text-[10px] !leading-5 !text-blue-100">
                        After updating, the new event name will be synchronized with the website navigation.
                    </p>
                </aside>

                <div className="flex items-center bg-white px-6 py-8 sm:px-8 md:px-10 md:py-10">
                    <div className="w-full">
                        <div className="mb-6">
                            <p className="!m-0 !text-[10px] font-semibold uppercase tracking-[0.14em] !text-blue-600">
                                Selected event
                            </p>

                            <h2 className="!mb-0 !mt-2 !text-[20px] font-bold !leading-7 !text-slate-900">
                                Edit event information
                            </h2>

                            <p className="!mb-0 !mt-1 !text-[12px] !leading-5 !text-slate-500">
                                The current event name is displayed below. Change it and save your update.
                            </p>
                        </div>

                        <div>
                            <label htmlFor="name" className="mb-2 block !text-xs font-semibold !text-slate-700">
                                Event name
                            </label>

                            <input id="name" type="text" name="name" value={name} onChange={updatedName} onKeyDown={(e) => e.key === "Enter" && updateEvent()} placeholder="Enter event name" autoComplete="off" className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 !text-sm !text-slate-900 outline-none transition placeholder:!text-xs placeholder:!text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100" />

                            <p className="!mb-0 !mt-2 !text-[10px] !leading-4 !text-slate-500">
                                Use a short and recognizable educational event name.
                            </p>
                        </div>

                        <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                            <a href="/admin/event" className="flex h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-5 !text-xs font-semibold !text-slate-600 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100">
                                Cancel
                            </a>

                            <button type="button" onClick={updateEvent} className="flex h-11 items-center justify-center rounded-lg bg-blue-600 px-5 !text-xs font-semibold !text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 active:scale-[0.99]">
                                Update event
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    )
}

export default Update