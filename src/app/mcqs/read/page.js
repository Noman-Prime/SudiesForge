"use client"

import Footer from "@/app/components/footer"
import Navbar from "@/app/components/navbar"
import { EventProvider } from "@/context/EventContext"
import axios from "axios"
import Link from "next/link"
import {
    BookOpenCheck,
    Check,
    CheckCircle2,
    CircleAlert,
    ClipboardCheck,
    Filter,
    Lightbulb,
    RefreshCw,
    Search,
    X,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"

const ReadMcqsPage = () => {
    const [mcqs, setMcqs] = useState([])
    const [selectedEvent, setSelectedEvent] = useState("all")
    const [selectedSubject, setSelectedSubject] = useState("all")
    const [selectedChapter, setSelectedChapter] = useState("all")
    const [selectedTopic, setSelectedTopic] = useState("all")
    const [search, setSearch] = useState("")
    const [loading, setLoading] = useState(true)
    const [errorMessage, setErrorMessage] = useState("")

    const getMcqs = async () => {
        try {
            setLoading(true)
            setErrorMessage("")

            const result = await axios.get("/api/mcqs/read")

            if (result.data?.success) {
                setMcqs(result.data.mcqs || [])
            } else {
                setMcqs([])
            }
        } catch (error) {
            console.log(error)

            if (error.response?.status === 404) {
                setMcqs([])
                setErrorMessage("")
                return
            }

            setMcqs([])
            setErrorMessage(
                error.response?.data?.message ||
                "Reading MCQs could not be loaded"
            )
        } finally {
            setLoading(false)
        }
    }

    const eventOptions = useMemo(() => {
        return createReferenceOptions(
            mcqs,
            (mcq) => mcq.event,
            (event) => event?.name || "Unnamed Event"
        )
    }, [mcqs])

    const subjectOptions = useMemo(() => {
        const availableMcqs = mcqs.filter(
            (mcq) =>
                selectedEvent === "all" ||
                getReferenceId(mcq.event) === selectedEvent
        )

        return createReferenceOptions(
            availableMcqs,
            (mcq) => mcq.subject,
            (subject) => subject?.name || "Unnamed Subject"
        )
    }, [mcqs, selectedEvent])

    const chapterOptions = useMemo(() => {
        const availableMcqs = mcqs.filter((mcq) => {
            const eventId = getReferenceId(mcq.event)
            const subjectId = getReferenceId(mcq.subject)

            return (
                (selectedEvent === "all" || eventId === selectedEvent) &&
                (selectedSubject === "all" || subjectId === selectedSubject)
            )
        })

        return createReferenceOptions(
            availableMcqs,
            (mcq) => mcq.chapter,
            (chapter) =>
                `${chapter?.chapterNumber ? `Chapter ${chapter.chapterNumber}: ` : ""}${chapter?.chapterName || "Unnamed Chapter"
                }`
        )
    }, [mcqs, selectedEvent, selectedSubject])

    const topicOptions = useMemo(() => {
        const availableMcqs = mcqs.filter((mcq) => {
            const eventId = getReferenceId(mcq.event)
            const subjectId = getReferenceId(mcq.subject)
            const chapterId = getReferenceId(mcq.chapter)

            return (
                (selectedEvent === "all" || eventId === selectedEvent) &&
                (selectedSubject === "all" || subjectId === selectedSubject) &&
                (selectedChapter === "all" || chapterId === selectedChapter)
            )
        })

        return createReferenceOptions(
            availableMcqs,
            (mcq) => mcq.topic,
            (topic) =>
                `${topic?.topicNumber ? `Topic ${topic.topicNumber}: ` : ""}${topic?.topicName || "Unnamed Topic"
                }`
        )
    }, [mcqs, selectedEvent, selectedSubject, selectedChapter])

    const filteredMcqs = useMemo(() => {
        const searchValue = search.trim().toLowerCase()

        return mcqs.filter((mcq) => {
            const eventId = getReferenceId(mcq.event)
            const subjectId = getReferenceId(mcq.subject)
            const chapterId = getReferenceId(mcq.chapter)
            const topicId = getReferenceId(mcq.topic)

            const eventName = getReferenceName(mcq.event, "name")
            const subjectName = getReferenceName(mcq.subject, "name")
            const chapterName = getReferenceName(mcq.chapter, "chapterName")
            const topicName = getReferenceName(mcq.topic, "topicName")

            const matchesEvent =
                selectedEvent === "all" || eventId === selectedEvent

            const matchesSubject =
                selectedSubject === "all" || subjectId === selectedSubject

            const matchesChapter =
                selectedChapter === "all" || chapterId === selectedChapter

            const matchesTopic =
                selectedTopic === "all" || topicId === selectedTopic

            const matchesSearch =
                !searchValue ||
                String(mcq.statement || "")
                    .toLowerCase()
                    .includes(searchValue) ||
                String(mcq.explanation || "")
                    .toLowerCase()
                    .includes(searchValue) ||
                eventName.toLowerCase().includes(searchValue) ||
                subjectName.toLowerCase().includes(searchValue) ||
                chapterName.toLowerCase().includes(searchValue) ||
                topicName.toLowerCase().includes(searchValue)

            return (
                matchesEvent &&
                matchesSubject &&
                matchesChapter &&
                matchesTopic &&
                matchesSearch
            )
        })
    }, [
        mcqs,
        selectedEvent,
        selectedSubject,
        selectedChapter,
        selectedTopic,
        search,
    ])

    const filtersApplied = Boolean(
        selectedEvent !== "all" ||
        selectedSubject !== "all" ||
        selectedChapter !== "all" ||
        selectedTopic !== "all" ||
        search.trim()
    )

    const changeEvent = (eventId) => {
        setSelectedEvent(eventId)
        setSelectedSubject("all")
        setSelectedChapter("all")
        setSelectedTopic("all")
    }

    const changeSubject = (subjectId) => {
        setSelectedSubject(subjectId)
        setSelectedChapter("all")
        setSelectedTopic("all")
    }

    const changeChapter = (chapterId) => {
        setSelectedChapter(chapterId)
        setSelectedTopic("all")
    }

    const clearFilters = () => {
        setSelectedEvent("all")
        setSelectedSubject("all")
        setSelectedChapter("all")
        setSelectedTopic("all")
        setSearch("")
    }

    useEffect(() => {
        getMcqs()
    }, [])

    if (loading) {
        return (
            <>
                <EventProvider>
                    <Navbar />
                </EventProvider>
                <main style={pageStyle}>
                    <LoadingState />
                </main>
                <Footer />
            </>
        )
    }

    if (errorMessage) {
        return (
            <>
                <EventProvider>
                    <Navbar />
                </EventProvider>
                <main style={pageStyle}>
                    <ErrorState message={errorMessage} retry={getMcqs} />
                </main>
                <Footer />
            </>
        )
    }

    return (
        <>
            <EventProvider>
                <Navbar />
            </EventProvider>

            <main style={pageStyle}>
                {/* FILTER AREA — styled like Test mode, but keeps Read mode search/filter features */}
                <div style={panelStyle}>
                    <div style={panelHeaderStyle}>
                        <div>
                            <h1 style={titleStyle}>Read MCQs</h1>
                            <p style={subtitleStyle}>
                                Study questions with their correct answers and explanations.
                            </p>
                        </div>

                        <div style={headerActionsStyle}>
                            <span>
                                Questions:{" "}
                                <strong style={{ color: "#111827" }}>
                                    {filteredMcqs.length}
                                </strong>
                            </span>

                            <Link href="/mcqs/test" style={testButtonStyle}>
                                <ClipboardCheck size={15} />
                                Start Test Mode
                            </Link>
                        </div>
                    </div>

                    <div style={filterGridStyle}>
                        <div style={{ position: "relative" }}>
                            <Search
                                size={15}
                                style={{
                                    position: "absolute",
                                    left: "12px",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    color: "#9ca3af",
                                    pointerEvents: "none",
                                }}
                            />
                            <input
                                type="search"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search questions"
                                style={{
                                    ...controlStyle,
                                    paddingLeft: "38px",
                                }}
                            />
                        </div>

                        <FilterSelect
                            value={selectedEvent}
                            onChange={changeEvent}
                            label="All Events"
                            options={eventOptions}
                        />

                        <FilterSelect
                            value={selectedSubject}
                            onChange={changeSubject}
                            label="All Subjects"
                            options={subjectOptions}
                        />

                        <FilterSelect
                            value={selectedChapter}
                            onChange={changeChapter}
                            label="All Chapters"
                            options={chapterOptions}
                        />

                        <FilterSelect
                            value={selectedTopic}
                            onChange={setSelectedTopic}
                            label="All Topics"
                            options={topicOptions}
                        />
                    </div>

                    <div style={clearRowStyle}>
                        <button
                            type="button"
                            onClick={clearFilters}
                            disabled={!filtersApplied}
                            style={{
                                ...clearButtonStyle,
                                opacity: filtersApplied ? 1 : 0.5,
                                cursor: filtersApplied ? "pointer" : "not-allowed",
                            }}
                        >
                            <X size={14} />
                            Clear Filters
                        </button>
                    </div>
                </div>

                {/* EMPTY STATE */}
                {mcqs.length === 0 ? (
                    <div style={paperStyle}>
                        <EmptyState />
                    </div>
                ) : filteredMcqs.length === 0 ? (
                    <div style={paperStyle}>
                        <NoFilteredMcqs clearFilters={clearFilters} />
                    </div>
                ) : (
                    /* PAPER — same compact centered-paper visual language as Test mode */
                    <div style={paperStyle}>
                        <div style={paperHeaderStyle}>
                            <div>
                                <div style={paperEyebrowStyle}>MCQ Study Paper</div>
                                <h2 style={paperTitleStyle}>Reading Questions</h2>
                                <p style={paperSubtitleStyle}>
                                    Correct answers and explanations are shown for study.
                                </p>
                            </div>

                            <div style={paperCountStyle}>
                                {filteredMcqs.length} Questions
                            </div>
                        </div>

                        <div>
                            {filteredMcqs.map((mcq, index) => (
                                <ReadMcq
                                    key={mcq._id}
                                    mcq={mcq}
                                    number={index + 1}
                                />
                            ))}
                        </div>

                        <div style={paperFooterStyle}>
                            StudiesForge.com
                        </div>
                    </div>
                )}
            </main>

            <Footer />
        </>
    )
}

const ReadMcq = ({ mcq, number }) => {
    const eventName = getReferenceName(mcq.event, "name") || "Event"
    const subjectName = getReferenceName(mcq.subject, "name") || "Subject"
    const chapterName =
        getReferenceName(mcq.chapter, "chapterName") || "Chapter"
    const topicName = getReferenceName(mcq.topic, "topicName") || "Topic"

    const correctOptionIndex = (mcq.options || []).findIndex(
        (option) => option.isCorrect === true || option.correct === true
    )

    return (
        <div style={questionStyle}>
            <div style={questionMetaStyle}>
                <span style={questionNumberStyle}>{number}.</span>

                <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={questionTextStyle}>{mcq.statement}</div>

                    <div style={metaTextStyle}>
                        {eventName} • {subjectName} • {chapterName} • {topicName}
                    </div>
                </div>

                <span style={readBadgeStyle}>
                    <BookOpenCheck size={12} />
                    Read
                </span>
            </div>

            <div style={optionsGridStyle}>
                {(mcq.options || []).map((option, optionIndex) => {
                    const isCorrect = option.isCorrect === true || option.correct === true

                    return (
                        <div
                            key={`${mcq._id}-${optionIndex}`}
                            style={{
                                ...optionStyle,
                                border: isCorrect
                                    ? "1px solid #86efac"
                                    : "1px solid #d1d5db",
                                background: isCorrect ? "#f0fdf4" : "#ffffff",
                                color: isCorrect ? "#166534" : "#111827",
                            }}
                        >
                            <span style={optionLetterStyle}>
                                {String.fromCharCode(65 + optionIndex)}.
                            </span>

                            <span style={optionTextStyle}>
                                {option.text}
                            </span>

                            {isCorrect && (
                                <Check
                                    size={15}
                                    style={{
                                        flexShrink: 0,
                                        color: "#16a34a",
                                        marginTop: "1px",
                                    }}
                                />
                            )}
                        </div>
                    )
                })}
            </div>

            {correctOptionIndex >= 0 && (
                <div style={answerBoxStyle}>
                    <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
                    <span>
                        <strong>Correct answer:</strong>{" "}
                        {String.fromCharCode(65 + correctOptionIndex)}.{" "}
                        {mcq.options[correctOptionIndex]?.text}
                    </span>
                </div>
            )}

            {mcq.explanation && (
                <div style={explanationStyle}>
                    <div style={explanationHeadingStyle}>
                        <Lightbulb size={15} />
                        Explanation
                    </div>

                    <div style={explanationTextStyle}>
                        {mcq.explanation}
                    </div>
                </div>
            )}
        </div>
    )
}

const FilterSelect = ({ value, onChange, label, options }) => (
    <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={controlStyle}
    >
        <option value="all">{label}</option>

        {options.map((option) => (
            <option key={option.value} value={option.value}>
                {option.label}
            </option>
        ))}
    </select>
)

const LoadingState = () => (
    <div style={{ ...panelStyle, maxWidth: "794px", margin: "30px auto" }}>
        <div
            style={{
                minHeight: "300px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                color: "#6b7280",
                gap: "12px",
            }}
        >
            <RefreshCw size={24} />
            <span>Loading reading MCQs...</span>
        </div>
    </div>
)

const ErrorState = ({ message, retry }) => (
    <div style={{ ...panelStyle, maxWidth: "794px", margin: "30px auto" }}>
        <div
            style={{
                minHeight: "300px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                textAlign: "center",
            }}
        >
            <CircleAlert size={30} color="#dc2626" />
            <h2 style={{ margin: "12px 0 5px", color: "#111827" }}>
                Reading MCQs could not be loaded
            </h2>
            <p style={{ margin: 0, color: "#6b7280", fontSize: "14px" }}>
                {message}
            </p>
            <button type="button" onClick={retry} style={primaryButtonStyle}>
                <RefreshCw size={15} />
                Try Again
            </button>
        </div>
    </div>
)

const EmptyState = () => (
    <div
        style={{
            minHeight: "300px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            color: "#6b7280",
            fontSize: "15px",
            flexDirection: "column",
        }}
    >
        <BookOpenCheck size={30} />
        <h3 style={{ margin: "12px 0 5px", color: "#111827" }}>
            No reading MCQs are available
        </h3>
        <p style={{ margin: 0 }}>
            MCQs will appear here when they are assigned to read or both modes.
        </p>
    </div>
)

const NoFilteredMcqs = ({ clearFilters }) => (
    <div
        style={{
            minHeight: "300px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            color: "#6b7280",
            fontSize: "15px",
            flexDirection: "column",
        }}
    >
        <Search size={30} />
        <h3 style={{ margin: "12px 0 5px", color: "#111827" }}>
            No MCQs match your filters
        </h3>
        <p style={{ margin: 0 }}>
            Try another event, subject, chapter, topic or search term.
        </p>
        <button type="button" onClick={clearFilters} style={secondaryButtonStyle}>
            Clear Filters
        </button>
    </div>
)

const createReferenceOptions = (items, getReference, getLabel) => {
    const optionMap = new Map()

    items.forEach((item) => {
        const reference = getReference(item)
        const referenceId = getReferenceId(reference)

        if (!referenceId || optionMap.has(referenceId)) {
            return
        }

        optionMap.set(referenceId, {
            value: referenceId,
            label: getLabel(reference),
        })
    })

    return Array.from(optionMap.values()).sort((first, second) =>
        first.label.localeCompare(second.label)
    )
}

const getReferenceId = (reference) => {
    if (!reference) {
        return ""
    }

    return String(
        typeof reference === "object"
            ? reference._id || ""
            : reference
    )
}

const getReferenceName = (reference, field) => {
    if (!reference || typeof reference !== "object") {
        return ""
    }

    return String(reference[field] || "")
}

/* =========================================================
   TEST-PAGE-STYLE VISUAL SYSTEM
   ========================================================= */

const pageStyle = {
    minHeight: "100vh",
    background: "linear-gradient(180deg,#eef2f7 0%,#f7f8fa 100%)",
    padding: "30px 15px 60px",
    fontFamily: "Arial, Helvetica, sans-serif",
    boxSizing: "border-box",
}

const panelStyle = {
    width: "100%",
    maxWidth: "1100px",
    margin: "0 auto 25px",
    background: "#ffffff",
    borderRadius: "14px",
    padding: "20px",
    boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
    border: "1px solid #e5e7eb",
    boxSizing: "border-box",
}

const panelHeaderStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    flexWrap: "wrap",
    marginBottom: "18px",
}

const titleStyle = {
    margin: 0,
    fontSize: "25px",
    fontWeight: "800",
    color: "#111827",
}

const subtitleStyle = {
    margin: "5px 0 0",
    color: "#6b7280",
    fontSize: "14px",
}

const headerActionsStyle = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
    fontSize: "13px",
    color: "#4b5563",
}

const testButtonStyle = {
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
    background: "#111827",
    color: "#ffffff",
    padding: "10px 15px",
    borderRadius: "8px",
    textDecoration: "none",
    fontSize: "13px",
    fontWeight: "700",
}

const filterGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))",
    gap: "12px",
}

const controlStyle = {
    width: "100%",
    height: "42px",
    padding: "0 12px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    background: "#ffffff",
    color: "#111827",
    outline: "none",
    fontSize: "14px",
    boxSizing: "border-box",
    fontFamily: "Arial, Helvetica, sans-serif",
}

const clearRowStyle = {
    marginTop: "13px",
    display: "flex",
    justifyContent: "flex-end",
}

const clearButtonStyle = {
    border: "none",
    background: "#f3f4f6",
    color: "#374151",
    padding: "9px 15px",
    borderRadius: "7px",
    fontSize: "13px",
    fontWeight: "600",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
}

const paperStyle = {
    width: "100%",
    maxWidth: "794px",
    minHeight: "1123px",
    margin: "0 auto",
    background: "#ffffff",
    boxSizing: "border-box",
    padding: "34px 42px 45px",
    boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
    border: "1px solid #e5e7eb",
    fontFamily: "Arial, Helvetica, sans-serif",
}

const paperHeaderStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "15px",
    borderBottom: "1px solid #d1d5db",
    paddingBottom: "14px",
    marginBottom: "18px",
}

const paperEyebrowStyle = {
    fontSize: "10px",
    fontWeight: "700",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
}

const paperTitleStyle = {
    margin: "4px 0 0",
    fontSize: "22px",
    fontWeight: "800",
    color: "#111827",
}

const paperSubtitleStyle = {
    margin: "4px 0 0",
    fontSize: "12px",
    color: "#6b7280",
}

const paperCountStyle = {
    flexShrink: 0,
    padding: "7px 10px",
    borderRadius: "6px",
    background: "#f3f4f6",
    color: "#374151",
    fontSize: "11px",
    fontWeight: "700",
}

const questionStyle = {
    marginBottom: "14px",
    paddingBottom: "13px",
    borderBottom: "1px solid #e5e7eb",
    pageBreakInside: "avoid",
    breakInside: "avoid",
    boxSizing: "border-box",
}

const questionMetaStyle = {
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
}

const questionNumberStyle = {
    minWidth: "25px",
    fontSize: "14px",
    lineHeight: "1.45",
    fontWeight: "700",
    color: "#111827",
}

const questionTextStyle = {
    whiteSpace: "pre-wrap",
    fontSize: "14px",
    lineHeight: "1.45",
    fontWeight: "600",
    color: "#111827",
}

const metaTextStyle = {
    marginTop: "5px",
    color: "#6b7280",
    fontSize: "10px",
    lineHeight: "1.35",
}

const readBadgeStyle = {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    flexShrink: 0,
    padding: "5px 7px",
    borderRadius: "6px",
    background: "#f3f4f6",
    color: "#4b5563",
    fontSize: "9px",
    fontWeight: "700",
    textTransform: "uppercase",
}

const optionsGridStyle = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "7px 12px",
    marginTop: "8px",
    marginLeft: "33px",
}

const optionStyle = {
    width: "100%",
    minHeight: "38px",
    textAlign: "left",
    padding: "8px 10px",
    borderRadius: "5px",
    display: "flex",
    alignItems: "flex-start",
    gap: "7px",
    boxSizing: "border-box",
    fontSize: "12.5px",
    lineHeight: "1.35",
    fontFamily: "Arial, Helvetica, sans-serif",
}

const optionLetterStyle = {
    fontWeight: "700",
    minWidth: "20px",
}

const optionTextStyle = {
    flex: 1,
    whiteSpace: "pre-wrap",
}

const answerBoxStyle = {
    marginTop: "9px",
    padding: "8px 10px",
    borderRadius: "5px",
    border: "1px solid #bbf7d0",
    background: "#f0fdf4",
    color: "#166534",
    fontSize: "11.5px",
    lineHeight: "1.4",
    display: "flex",
    alignItems: "flex-start",
    gap: "7px",
}

const explanationStyle = {
    marginTop: "8px",
    padding: "9px 10px",
    borderRadius: "5px",
    border: "1px solid #fde68a",
    background: "#fffbeb",
}

const explanationHeadingStyle = {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "10px",
    fontWeight: "800",
    color: "#92400e",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
}

const explanationTextStyle = {
    marginTop: "5px",
    whiteSpace: "pre-wrap",
    fontSize: "11.5px",
    lineHeight: "1.5",
    color: "#78350f",
}

const paperFooterStyle = {
    marginTop: "22px",
    paddingTop: "10px",
    borderTop: "1px solid #d1d5db",
    textAlign: "center",
    fontSize: "9px",
    color: "#666666",
}

const primaryButtonStyle = {
    border: "none",
    background: "#111827",
    color: "#ffffff",
    padding: "10px 18px",
    borderRadius: "7px",
    marginTop: "15px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "700",
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
}

const secondaryButtonStyle = {
    border: "none",
    background: "#f3f4f6",
    color: "#374151",
    padding: "9px 15px",
    borderRadius: "7px",
    marginTop: "15px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
}

export default ReadMcqsPage