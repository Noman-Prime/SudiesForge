"use client"

import axios from "axios"
import {
    BookOpen,
    CalendarDays,
    GraduationCap,
} from "lucide-react"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"

const EventSummary = () => {
    const { id } = useParams()

    const [event, setEvent] = useState(null)
    const [subjectCount, setSubjectCount] = useState(0)
    const [resourceCount, setResourceCount] = useState(0)

    const getEvent = async () => {
        try {
            const result = await axios.get(`/api/events/${id}`)

            if (result.data.success) {
                setEvent(result.data.event)
            }
        } catch (error) {
            console.log(error)
        }
    }

    const getSubjects = async () => {
        try {
            const result = await axios.get("/api/subject")

            if (result.data.success) {
                const subjects = result.data.subjects.filter((item) => {
                    const eventId =
                        typeof item.event === "object"
                            ? item.event?._id
                            : item.event

                    return String(eventId) === String(id)
                })

                setSubjectCount(subjects.length)
            }
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        if (id) {
            getEvent()
            getSubjects()
        }
    }, [id])

    if (!event) {
        return null
    }

    const updatedText = event.updatedAt
        ? new Intl.DateTimeFormat("en-PK", {
            day: "numeric",
            month: "short",
            year: "numeric",
        }).format(new Date(event.updatedAt))
        : "Recently updated"

    const description =
        event.description ||
        `Explore organized subjects, study material and practice resources for ${event.name} preparation.`

    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 items-start gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#102a63] text-white shadow-sm sm:h-20 sm:w-20">
                        <GraduationCap
                            size={34}
                            strokeWidth={1.8}
                            className="sm:h-10 sm:w-10"
                        />
                    </div>

                    <div className="min-w-0">
                        <span className="inline-flex rounded-md bg-blue-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white sm:text-xs">
                            {event.name}
                        </span>

                        <h1 className="mt-2 text-xl font-extrabold tracking-tight text-[#071a4a] sm:text-3xl">
                            {event.name} Preparation Hub
                        </h1>

                        <p className="mt-2 max-w-2xl text-xs leading-5 text-slate-500 sm:text-sm sm:leading-6">
                            {description}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:shrink-0">
                    <div className="flex min-w-0 flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-2 py-3 text-center sm:min-w-32 sm:px-4">
                        <GraduationCap
                            size={19}
                            className="text-blue-600"
                        />

                        <span className="mt-1.5 text-xs font-extrabold text-[#071a4a] sm:text-sm">
                            {subjectCount}
                        </span>

                        <span className="mt-0.5 text-[9px] text-slate-500 sm:text-[11px]">
                            Subjects
                        </span>
                    </div>

                    <div className="flex min-w-0 flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-2 py-3 text-center sm:min-w-32 sm:px-4">
                        <BookOpen
                            size={19}
                            className="text-blue-600"
                        />

                        <span className="mt-1.5 text-xs font-extrabold text-[#071a4a] sm:text-sm">
                            {resourceCount}
                        </span>

                        <span className="mt-0.5 text-[9px] text-slate-500 sm:text-[11px]">
                            Resources
                        </span>
                    </div>

                    <div className="flex min-w-0 flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-2 py-3 text-center sm:min-w-32 sm:px-4">
                        <CalendarDays
                            size={19}
                            className="text-blue-600"
                        />

                        <span className="mt-1.5 text-[10px] font-extrabold text-[#071a4a] sm:text-xs">
                            {updatedText}
                        </span>

                        <span className="mt-0.5 text-[9px] text-slate-500 sm:text-[11px]">
                            Last updated
                        </span>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default EventSummary