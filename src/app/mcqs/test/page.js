"use client"

import { useEffect, useMemo, useState } from "react"

export default function TestMcqsPage() {
    const [mcqs, setMcqs] = useState([])
    const [events, setEvents] = useState([])
    const [eventId, setEventId] = useState("")
    const [subjectId, setSubjectId] = useState("")
    const [chapterId, setChapterId] = useState("")
    const [topicId, setTopicId] = useState("")

    const [answers, setAnswers] = useState({})
    const [submitted, setSubmitted] = useState(false)
    const [loading, setLoading] = useState(true)
    const [downloading, setDownloading] = useState(false)
    const [error, setError] = useState("")

    // =========================================================
    // LOAD MCQS
    // =========================================================

    useEffect(() => {
        const loadMcqs = async () => {
            try {
                setLoading(true)
                setError("")

                const res = await fetch("/api/mcqs/test", {
                    cache: "no-store",
                })

                const data = await res.json()

                if (!res.ok) {
                    throw new Error(
                        data.message || "Unable to load MCQs"
                    )
                }

                setMcqs(data.mcqs || [])
            } catch (err) {
                console.log(err)
                setError(
                    err.message || "Something went wrong"
                )
            } finally {
                setLoading(false)
            }
        }

        loadMcqs()
    }, [])

    // =========================================================
    // LOAD EVENTS
    // =========================================================

    useEffect(() => {
        const loadEvents = async () => {
            try {
                const res = await fetch("/api/events", {
                    cache: "no-store",
                })

                const data = await res.json()

                if (res.ok) {
                    setEvents(
                        data.events ||
                        data.collection ||
                        data.data ||
                        []
                    )
                }
            } catch (err) {
                console.log(err)
            }
        }

        loadEvents()
    }, [])

    // =========================================================
    // FILTER DATA
    // =========================================================

    const availableSubjects = useMemo(() => {
        const map = new Map()

        mcqs.forEach((item) => {
            const sameEvent =
                !eventId ||
                item.event?._id === eventId ||
                item.event === eventId

            if (
                sameEvent &&
                item.subject
            ) {
                const id =
                    item.subject._id ||
                    item.subject

                const name =
                    item.subject.name ||
                    "Subject"

                if (id) {
                    map.set(id, {
                        _id: id,
                        name,
                    })
                }
            }
        })

        return Array.from(map.values())
    }, [mcqs, eventId])

    const availableChapters = useMemo(() => {
        const map = new Map()

        mcqs.forEach((item) => {
            const sameEvent =
                !eventId ||
                item.event?._id === eventId ||
                item.event === eventId

            const sameSubject =
                !subjectId ||
                item.subject?._id === subjectId ||
                item.subject === subjectId

            if (
                sameEvent &&
                sameSubject &&
                item.chapter
            ) {
                const id =
                    item.chapter._id ||
                    item.chapter

                if (id) {
                    map.set(id, {
                        _id: id,
                        chapterNumber:
                            item.chapter.chapterNumber,
                        chapterName:
                            item.chapter.chapterName ||
                            "Chapter",
                    })
                }
            }
        })

        return Array.from(map.values()).sort(
            (a, b) =>
                (a.chapterNumber || 0) -
                (b.chapterNumber || 0)
        )
    }, [
        mcqs,
        eventId,
        subjectId,
    ])

    const availableTopics = useMemo(() => {
        const map = new Map()

        mcqs.forEach((item) => {
            const sameEvent =
                !eventId ||
                item.event?._id === eventId ||
                item.event === eventId

            const sameSubject =
                !subjectId ||
                item.subject?._id === subjectId ||
                item.subject === subjectId

            const sameChapter =
                !chapterId ||
                item.chapter?._id === chapterId ||
                item.chapter === chapterId

            if (
                sameEvent &&
                sameSubject &&
                sameChapter &&
                item.topic
            ) {
                const id =
                    item.topic._id ||
                    item.topic

                if (id) {
                    map.set(id, {
                        _id: id,
                        topicNumber:
                            item.topic.topicNumber,
                        topicName:
                            item.topic.topicName ||
                            "Topic",
                    })
                }
            }
        })

        return Array.from(map.values()).sort(
            (a, b) =>
                (a.topicNumber || 0) -
                (b.topicNumber || 0)
        )
    }, [
        mcqs,
        eventId,
        subjectId,
        chapterId,
    ])

    // =========================================================
    // FILTER MCQS
    // =========================================================

    const filteredMcqs = useMemo(() => {
        return mcqs.filter((item) => {
            const sameEvent =
                !eventId ||
                item.event?._id === eventId ||
                item.event === eventId

            const sameSubject =
                !subjectId ||
                item.subject?._id === subjectId ||
                item.subject === subjectId

            const sameChapter =
                !chapterId ||
                item.chapter?._id === chapterId ||
                item.chapter === chapterId

            const sameTopic =
                !topicId ||
                item.topic?._id === topicId ||
                item.topic === topicId

            return (
                sameEvent &&
                sameSubject &&
                sameChapter &&
                sameTopic
            )
        })
    }, [
        mcqs,
        eventId,
        subjectId,
        chapterId,
        topicId,
    ])

    // =========================================================
    // FILTER HANDLERS
    // =========================================================

    const resetTestState = () => {
        setAnswers({})
        setSubmitted(false)
    }

    const handleEventChange = (value) => {
        setEventId(value)
        setSubjectId("")
        setChapterId("")
        setTopicId("")
        resetTestState()
    }

    const handleSubjectChange = (value) => {
        setSubjectId(value)
        setChapterId("")
        setTopicId("")
        resetTestState()
    }

    const handleChapterChange = (value) => {
        setChapterId(value)
        setTopicId("")
        resetTestState()
    }

    const handleTopicChange = (value) => {
        setTopicId(value)
        resetTestState()
    }

    const clearFilters = () => {
        setEventId("")
        setSubjectId("")
        setChapterId("")
        setTopicId("")
        resetTestState()
    }

    // =========================================================
    // ANSWER SELECTION
    // =========================================================

    const selectAnswer = (
        mcqId,
        optionIndex
    ) => {
        if (submitted) return

        setAnswers((previous) => ({
            ...previous,
            [mcqId]: optionIndex,
        }))
    }

    // =========================================================
    // CORRECT ANSWER
    // =========================================================

    const getCorrectIndex = (mcq) => {
        if (!mcq?.options) return -1

        return mcq.options.findIndex(
            (option) =>
                option.isCorrect === true ||
                option.correct === true
        )
    }

    // =========================================================
    // SUBMIT
    // =========================================================

    const submitTest = () => {
        if (!filteredMcqs.length) return

        setSubmitted(true)

        setTimeout(() => {
            window.scrollTo({
                top: 0,
                behavior: "smooth",
            })
        }, 100)
    }

    // =========================================================
    // RESULT
    // =========================================================

    const result = useMemo(() => {
        if (!submitted) {
            return {
                correct: 0,
                wrong: 0,
                unanswered: 0,
                percentage: 0,
            }
        }

        let correct = 0
        let wrong = 0
        let unanswered = 0

        filteredMcqs.forEach((mcq) => {
            const selected =
                answers[mcq._id]

            const correctIndex =
                getCorrectIndex(mcq)

            if (
                selected === undefined ||
                selected === null
            ) {
                unanswered++
            } else if (
                correctIndex !== -1 &&
                selected === correctIndex
            ) {
                correct++
            } else {
                wrong++
            }
        })

        const percentage =
            filteredMcqs.length
                ? Math.round(
                    (correct /
                        filteredMcqs.length) *
                    100
                )
                : 0

        return {
            correct,
            wrong,
            unanswered,
            percentage,
        }
    }, [
        submitted,
        answers,
        filteredMcqs,
    ])

    // =========================================================
    // OPTION STYLE
    // =========================================================

    const getOptionStyle = (
        mcq,
        optionIndex
    ) => {
        const selected =
            answers[mcq._id] ===
            optionIndex

        if (!submitted) {
            return {
                border: selected
                    ? "2px solid #2563eb"
                    : "1px solid #d1d5db",
                background: selected
                    ? "#eff6ff"
                    : "#ffffff",
                color: "#111827",
            }
        }

        const correctIndex =
            getCorrectIndex(mcq)

        const isCorrect =
            correctIndex === optionIndex

        if (isCorrect) {
            return {
                border:
                    "2px solid #16a34a",
                background:
                    "#dcfce7",
                color: "#166534",
            }
        }

        if (
            selected &&
            correctIndex !== optionIndex
        ) {
            return {
                border:
                    "2px solid #dc2626",
                background:
                    "#fee2e2",
                color: "#991b1b",
            }
        }

        return {
            border:
                "1px solid #d1d5db",
            background: "#ffffff",
            color: "#111827",
        }
    }

    // =========================================================
    // DOWNLOAD PDF
    //
    // IMPORTANT:
    // We DO NOT convert the entire paper into one giant
    // canvas and then slice it.
    //
    // Instead:
    // 1. Every MCQ is treated as an individual block.
    // 2. Complete MCQs are grouped into A4 pages.
    // 3. Each page is rendered separately.
    //
    // Therefore an MCQ cannot be cut between pages.
    // =========================================================

    const downloadPdf = async () => {
        if (!filteredMcqs.length) return

        try {
            setDownloading(true)

            const [
                { default: html2canvas },
                { jsPDF },
            ] = await Promise.all([
                import("html2canvas"),
                import("jspdf"),
            ])

            const paper =
                document.getElementById(
                    "mcq-paper"
                )

            if (!paper) {
                throw new Error(
                    "MCQ paper could not be found."
                )
            }

            /*
             * -------------------------------------------------
             * A4 dimensions in CSS pixels.
             *
             * 794 × 1123 is approximately A4 at 96 DPI.
             * -------------------------------------------------
             */

            const A4_WIDTH = 794
            const A4_HEIGHT = 1123

            /*
             * The visible paper has padding.
             * This is the usable content area.
             */

            const PAPER_PADDING_TOP = 34
            const PAPER_PADDING_BOTTOM = 45
            const PAPER_PADDING_LEFT = 42
            const PAPER_PADDING_RIGHT = 42

            const CONTENT_WIDTH =
                A4_WIDTH -
                PAPER_PADDING_LEFT -
                PAPER_PADDING_RIGHT

            const CONTENT_HEIGHT =
                A4_HEIGHT -
                PAPER_PADDING_TOP -
                PAPER_PADDING_BOTTOM

            /*
             * Header consumes part of every first page.
             * We calculate it from the real DOM instead of
             * guessing its height.
             */

            const header =
                paper.querySelector(
                    "[data-pdf-header]"
                )

            /*
             * MCQ elements.
             */

            const questionElements =
                Array.from(
                    paper.querySelectorAll(
                        "[data-pdf-question]"
                    )
                )

            if (!questionElements.length) {
                throw new Error(
                    "No MCQs were found for PDF."
                )
            }

            /*
             * -------------------------------------------------
             * Create an invisible measuring container.
             * -------------------------------------------------
             */

            const measure =
                document.createElement(
                    "div"
                )

            measure.style.position =
                "absolute"

            measure.style.left =
                "-100000px"

            measure.style.top = "0"

            measure.style.width =
                `${A4_WIDTH}px`

            measure.style.background =
                "#ffffff"

            measure.style.visibility =
                "hidden"

            measure.style.pointerEvents =
                "none"

            measure.style.boxSizing =
                "border-box"

            document.body.appendChild(
                measure
            )

            /*
             * Copy the original paper styling
             * into the measuring paper.
             */

            const measurePaper =
                paper.cloneNode(false)

            measurePaper.style.width =
                `${A4_WIDTH}px`

            measurePaper.style.maxWidth =
                `${A4_WIDTH}px`

            measurePaper.style.minHeight =
                `${A4_HEIGHT}px`

            measurePaper.style.height =
                `${A4_HEIGHT}px`

            measurePaper.style.margin = "0"

            measurePaper.style.padding =
                `${PAPER_PADDING_TOP}px ${PAPER_PADDING_RIGHT}px ${PAPER_PADDING_BOTTOM}px ${PAPER_PADDING_LEFT}px`

            measurePaper.style.boxSizing =
                "border-box"

            measurePaper.style.boxShadow =
                "none"

            measurePaper.style.border =
                "none"

            measurePaper.style.background =
                "#ffffff"

            measure.appendChild(
                measurePaper
            )

            /*
             * -------------------------------------------------
             * Clone header and measure it.
             * -------------------------------------------------
             */

            let headerHeight = 0

            if (header) {
                const headerClone =
                    header.cloneNode(
                        true
                    )

                measurePaper.appendChild(
                    headerClone
                )

                headerHeight =
                    headerClone.getBoundingClientRect()
                        .height

                measurePaper.removeChild(
                    headerClone
                )
            }

            /*
             * The remaining space for questions.
             */

            const firstPageQuestionHeight =
                Math.max(
                    0,
                    CONTENT_HEIGHT -
                    headerHeight -
                    10
                )

            /*
             * Other pages don't need the large
             * paper header.
             *
             * We still keep a small clean top
             * spacing.
             */

            const normalPageQuestionHeight =
                CONTENT_HEIGHT - 5

            /*
             * -------------------------------------------------
             * Measure every MCQ.
             * -------------------------------------------------
             */

            const questionHeights =
                questionElements.map(
                    (question) => {
                        const clone =
                            question.cloneNode(
                                true
                            )

                        clone.style.width =
                            `${CONTENT_WIDTH}px`

                        clone.style.marginLeft =
                            "0"

                        clone.style.marginRight =
                            "0"

                        clone.style.pageBreakInside =
                            "avoid"

                        clone.style.breakInside =
                            "avoid"

                        measurePaper.appendChild(
                            clone
                        )

                        const height =
                            clone.getBoundingClientRect()
                                .height

                        measurePaper.removeChild(
                            clone
                        )

                        return height
                    }
                )

            /*
             * -------------------------------------------------
             * GROUP MCQs INTO COMPLETE A4 PAGES.
             *
             * If question 8 doesn't fit after question 7,
             * question 8 moves completely to next page.
             *
             * It is NEVER split.
             * -------------------------------------------------
             */

            const pages = []

            let currentPage = []
            let currentHeight =
                firstPageQuestionHeight

            questionElements.forEach(
                (question, index) => {
                    const questionHeight =
                        questionHeights[
                        index
                        ]

                    const isFirstPage =
                        pages.length === 0

                    const availableHeight =
                        currentHeight

                    /*
                     * If this MCQ fits, add it.
                     */

                    if (
                        currentPage.length === 0 ||
                        questionHeight <=
                        availableHeight
                    ) {
                        currentPage.push(
                            index
                        )

                        currentHeight -=
                            questionHeight
                    } else {
                        /*
                         * Current page is full.
                         * Start another page.
                         */

                        pages.push(
                            currentPage
                        )

                        currentPage = [
                            index,
                        ]

                        currentHeight =
                            normalPageQuestionHeight -
                            questionHeight
                    }
                }
            )

            if (currentPage.length) {
                pages.push(
                    currentPage
                )
            }

            /*
             * Cleanup measuring DOM.
             */

            document.body.removeChild(
                measure
            )

            /*
             * -------------------------------------------------
             * PDF
             * -------------------------------------------------
             */

            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4",
                compress: true,
            })

            const PDF_WIDTH =
                pdf.internal.pageSize.getWidth()

            const PDF_HEIGHT =
                pdf.internal.pageSize.getHeight()

            /*
             * -------------------------------------------------
             * Render each A4 page separately.
             * -------------------------------------------------
             */

            for (
                let pageIndex = 0;
                pageIndex < pages.length;
                pageIndex++
            ) {
                if (pageIndex > 0) {
                    pdf.addPage()
                }

                const pageQuestionIndexes =
                    pages[pageIndex]

                /*
                 * Create a temporary A4 paper.
                 */

                const page =
                    document.createElement(
                        "div"
                    )

                page.style.position =
                    "absolute"

                page.style.left =
                    "-100000px"

                page.style.top = "0"

                page.style.width =
                    `${A4_WIDTH}px`

                page.style.height =
                    `${A4_HEIGHT}px`

                page.style.background =
                    "#ffffff"

                page.style.color =
                    "#111111"

                page.style.boxSizing =
                    "border-box"

                page.style.padding =
                    `${PAPER_PADDING_TOP}px ${PAPER_PADDING_RIGHT}px ${PAPER_PADDING_BOTTOM}px ${PAPER_PADDING_LEFT}px`

                page.style.fontFamily =
                    "Arial, Helvetica, sans-serif"

                /*
                 * Header only appears on the first
                 * PDF page, matching the paper design.
                 */

                if (pageIndex === 0 && header) {
                    const headerClone =
                        header.cloneNode(
                            true
                        )

                    /*
                     * Remove interactive elements
                     * from the PDF.
                     */

                    headerClone
                        .querySelectorAll(
                            "[data-pdf-hide]"
                        )
                        .forEach(
                            (item) => {
                                item.remove()
                            }
                        )

                    page.appendChild(
                        headerClone
                    )
                } else {
                    /*
                     * Small clean continuation header.
                     *
                     * This is not the bookmark.
                     * The actual bookmark is stored in
                     * the PDF outline below.
                     */

                    const continuation =
                        document.createElement(
                            "div"
                        )

                    continuation.style.height =
                        "24px"

                    continuation.style.borderBottom =
                        "1px solid #d1d5db"

                    continuation.style.marginBottom =
                        "10px"

                    page.appendChild(
                        continuation
                    )
                }

                /*
                 * Add complete questions.
                 */

                pageQuestionIndexes.forEach(
                    (questionIndex) => {
                        const question =
                            questionElements[
                            questionIndex
                            ]

                        const clone =
                            question.cloneNode(
                                true
                            )

                        clone.style.width =
                            `${CONTENT_WIDTH}px`

                        clone.style.marginLeft =
                            "0"

                        clone.style.marginRight =
                            "0"

                        clone.style.pageBreakInside =
                            "avoid"

                        clone.style.breakInside =
                            "avoid"

                        clone
                            .querySelectorAll(
                                "[data-pdf-hide]"
                            )
                            .forEach(
                                (item) => {
                                    item.remove()
                                }
                            )

                        /*
                         * In PDF mode, options should
                         * look like printed paper.
                         */

                        clone
                            .querySelectorAll(
                                "button"
                            )
                            .forEach(
                                (
                                    button
                                ) => {
                                    button.disabled =
                                        true

                                    button.style.cursor =
                                        "default"
                                }
                            )

                        page.appendChild(
                            clone
                        )
                    }
                )

                /*
                 * No visible StudiesForge.com
                 * watermark is added here.
                 *
                 * The user specifically requested
                 * StudiesForge.com as a BOOKMARK,
                 * not as text on the page.
                 */

                document.body.appendChild(
                    page
                )

                /*
                 * Render this one A4 page.
                 */

                const canvas =
                    await html2canvas(
                        page,
                        {
                            scale: 2,
                            useCORS: true,
                            backgroundColor:
                                "#ffffff",
                            logging: false,
                            width:
                                A4_WIDTH,
                            height:
                                A4_HEIGHT,
                            windowWidth:
                                A4_WIDTH,
                        }
                    )

                document.body.removeChild(
                    page
                )

                const image =
                    canvas.toDataURL(
                        "image/jpeg",
                        0.96
                    )

                /*
                 * Exactly fill the A4 PDF page.
                 */

                pdf.addImage(
                    image,
                    "JPEG",
                    0,
                    0,
                    PDF_WIDTH,
                    PDF_HEIGHT,
                    undefined,
                    "FAST"
                )
            }

            /*
             * -------------------------------------------------
             * PDF BOOKMARK
             * -------------------------------------------------
             *
             * This is the important part.
             *
             * It creates:
             *
             * StudiesForge.com
             *
             * in the PDF viewer's bookmark/navigation panel.
             *
             * It does NOT print the bookmark as text
             * over the MCQ page.
             *
             * jsPDF's Outline plugin provides this API.
             * -------------------------------------------------
             */

            if (
                pdf.outline &&
                typeof pdf.outline.add ===
                "function"
            ) {
                pdf.outline.add(
                    null,
                    "StudiesForge.com",
                    {
                        pageNumber: 1,
                    }
                )

                /*
                 * Optional useful child bookmark:
                 * points to the first page of the test.
                 */

                pdf.outline.add(
                    null,
                    "MCQ Test",
                    {
                        pageNumber: 1,
                    }
                )
            }

            /*
             * -------------------------------------------------
             * PDF METADATA
             *
             * This is separate from the bookmark.
             * -------------------------------------------------
             */

            pdf.setProperties({
                title:
                    "StudiesForge MCQ Test",
                subject:
                    "StudiesForge MCQ Test",
                author:
                    "StudiesForge.com",
                creator:
                    "StudiesForge.com",
                keywords:
                    "StudiesForge, MCQs, Test, Education",
            })

            /*
             * -------------------------------------------------
             * Save
             * -------------------------------------------------
             */

            pdf.save(
                "StudiesForge-MCQ-Test.pdf"
            )
        } catch (err) {
            console.error(
                "PDF generation error:",
                err
            )

            alert(
                "Unable to generate the PDF. Please make sure jspdf and html2canvas are installed."
            )
        } finally {
            setDownloading(false)
        }
    }

    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {
        return (
            <main
                style={{
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent:
                        "center",
                    background:
                        "#f3f4f6",
                    fontFamily:
                        "Arial, Helvetica, sans-serif",
                }}
            >
                <div
                    style={{
                        background:
                            "#ffffff",
                        padding:
                            "30px 45px",
                        borderRadius:
                            "10px",
                        boxShadow:
                            "0 5px 25px rgba(0,0,0,0.08)",
                        fontSize: "16px",
                        fontWeight:
                            "600",
                    }}
                >
                    Loading MCQs...
                </div>
            </main>
        )
    }

    // =========================================================
    // ERROR
    // =========================================================

    if (error) {
        return (
            <main
                style={{
                    minHeight: "100vh",
                    display: "flex",
                    alignItems:
                        "center",
                    justifyContent:
                        "center",
                    background:
                        "#f3f4f6",
                    padding: "20px",
                    fontFamily:
                        "Arial, Helvetica, sans-serif",
                }}
            >
                <div
                    style={{
                        background:
                            "#ffffff",
                        padding:
                            "30px",
                        borderRadius:
                            "12px",
                        maxWidth:
                            "500px",
                        width: "100%",
                        textAlign:
                            "center",
                        border:
                            "1px solid #fecaca",
                        boxShadow:
                            "0 8px 30px rgba(0,0,0,0.08)",
                    }}
                >
                    <div
                        style={{
                            fontSize:
                                "18px",
                            fontWeight:
                                "800",
                            color:
                                "#991b1b",
                            marginBottom:
                                "8px",
                        }}
                    >
                        Unable to load MCQs
                    </div>

                    <div
                        style={{
                            color:
                                "#6b7280",
                            fontSize:
                                "14px",
                        }}
                    >
                        {error}
                    </div>
                </div>
            </main>
        )
    }

    // =========================================================
    // PAGE
    // =========================================================

    return (
        <main
            style={{
                minHeight: "100vh",
                background:
                    "linear-gradient(180deg,#eef2f7 0%,#f7f8fa 100%)",
                padding:
                    "30px 15px 60px",
                fontFamily:
                    "Arial, Helvetica, sans-serif",
            }}
        >
            {/* =================================================
                FILTER AREA
            ================================================= */}

            <div
                data-pdf-hide
                style={{
                    width: "100%",
                    maxWidth: "1100px",
                    margin:
                        "0 auto 25px",
                    background:
                        "#ffffff",
                    borderRadius:
                        "14px",
                    padding: "20px",
                    boxShadow:
                        "0 8px 30px rgba(0,0,0,0.08)",
                    border:
                        "1px solid #e5e7eb",
                    boxSizing:
                        "border-box",
                }}
            >
                <div
                    style={{
                        display:
                            "flex",
                        justifyContent:
                            "space-between",
                        alignItems:
                            "center",
                        gap: "15px",
                        flexWrap:
                            "wrap",
                        marginBottom:
                            "18px",
                    }}
                >
                    <div>
                        <h1
                            style={{
                                margin: 0,
                                fontSize:
                                    "25px",
                                fontWeight:
                                    "800",
                                color:
                                    "#111827",
                            }}
                        >
                            MCQ Test
                        </h1>

                        <p
                            style={{
                                margin:
                                    "5px 0 0",
                                color:
                                    "#6b7280",
                                fontSize:
                                    "14px",
                            }}
                        >
                            Select your
                            answers and
                            submit the
                            test.
                        </p>
                    </div>

                    <div
                        style={{
                            display:
                                "flex",
                            alignItems:
                                "center",
                            gap: "8px",
                            fontSize:
                                "13px",
                            color:
                                "#4b5563",
                        }}
                    >
                        <span>
                            Questions:
                        </span>

                        <strong
                            style={{
                                color:
                                    "#111827",
                            }}
                        >
                            {
                                filteredMcqs.length
                            }
                        </strong>
                    </div>
                </div>

                <div
                    style={{
                        display:
                            "grid",
                        gridTemplateColumns:
                            "repeat(auto-fit,minmax(190px,1fr))",
                        gap: "12px",
                    }}
                >
                    {/* EVENT */}

                    <select
                        value={
                            eventId
                        }
                        onChange={(e) =>
                            handleEventChange(
                                e.target
                                    .value
                            )
                        }
                        style={{
                            width:
                                "100%",
                            padding:
                                "11px 12px",
                            borderRadius:
                                "8px",
                            border:
                                "1px solid #d1d5db",
                            background:
                                "#ffffff",
                            color:
                                "#111827",
                            outline:
                                "none",
                            fontSize:
                                "14px",
                            boxSizing:
                                "border-box",
                        }}
                    >
                        <option value="">
                            All Events
                        </option>

                        {events.map(
                            (
                                event
                            ) => (
                                <option
                                    key={
                                        event._id
                                    }
                                    value={
                                        event._id
                                    }
                                >
                                    {
                                        event.name
                                    }
                                </option>
                            )
                        )}
                    </select>

                    {/* SUBJECT */}

                    <select
                        value={
                            subjectId
                        }
                        onChange={(e) =>
                            handleSubjectChange(
                                e.target
                                    .value
                            )
                        }
                        style={{
                            width:
                                "100%",
                            padding:
                                "11px 12px",
                            borderRadius:
                                "8px",
                            border:
                                "1px solid #d1d5db",
                            background:
                                "#ffffff",
                            color:
                                "#111827",
                            outline:
                                "none",
                            fontSize:
                                "14px",
                            boxSizing:
                                "border-box",
                        }}
                    >
                        <option value="">
                            All Subjects
                        </option>

                        {availableSubjects.map(
                            (
                                subject
                            ) => (
                                <option
                                    key={
                                        subject._id
                                    }
                                    value={
                                        subject._id
                                    }
                                >
                                    {
                                        subject.name
                                    }
                                </option>
                            )
                        )}
                    </select>

                    {/* CHAPTER */}

                    <select
                        value={
                            chapterId
                        }
                        onChange={(e) =>
                            handleChapterChange(
                                e.target
                                    .value
                            )
                        }
                        style={{
                            width:
                                "100%",
                            padding:
                                "11px 12px",
                            borderRadius:
                                "8px",
                            border:
                                "1px solid #d1d5db",
                            background:
                                "#ffffff",
                            color:
                                "#111827",
                            outline:
                                "none",
                            fontSize:
                                "14px",
                            boxSizing:
                                "border-box",
                        }}
                    >
                        <option value="">
                            All Chapters
                        </option>

                        {availableChapters.map(
                            (
                                chapter
                            ) => (
                                <option
                                    key={
                                        chapter._id
                                    }
                                    value={
                                        chapter._id
                                    }
                                >
                                    {chapter.chapterNumber
                                        ? `${chapter.chapterNumber}. `
                                        : ""}
                                    {
                                        chapter.chapterName
                                    }
                                </option>
                            )
                        )}
                    </select>

                    {/* TOPIC */}

                    <select
                        value={
                            topicId
                        }
                        onChange={(e) =>
                            handleTopicChange(
                                e.target
                                    .value
                            )
                        }
                        style={{
                            width:
                                "100%",
                            padding:
                                "11px 12px",
                            borderRadius:
                                "8px",
                            border:
                                "1px solid #d1d5db",
                            background:
                                "#ffffff",
                            color:
                                "#111827",
                            outline:
                                "none",
                            fontSize:
                                "14px",
                            boxSizing:
                                "border-box",
                        }}
                    >
                        <option value="">
                            All Topics
                        </option>

                        {availableTopics.map(
                            (
                                topic
                            ) => (
                                <option
                                    key={
                                        topic._id
                                    }
                                    value={
                                        topic._id
                                    }
                                >
                                    {topic.topicNumber
                                        ? `${topic.topicNumber}. `
                                        : ""}
                                    {
                                        topic.topicName
                                    }
                                </option>
                            )
                        )}
                    </select>
                </div>

                <div
                    style={{
                        marginTop:
                            "13px",
                        display:
                            "flex",
                        justifyContent:
                            "flex-end",
                    }}
                >
                    <button
                        type="button"
                        onClick={
                            clearFilters
                        }
                        style={{
                            border:
                                "none",
                            background:
                                "#f3f4f6",
                            color:
                                "#374151",
                            padding:
                                "9px 15px",
                            borderRadius:
                                "7px",
                            cursor:
                                "pointer",
                            fontSize:
                                "13px",
                            fontWeight:
                                "600",
                        }}
                    >
                        Clear Filters
                    </button>
                </div>
            </div>

            {/* =================================================
                RESULT
            ================================================= */}

            {submitted &&
                filteredMcqs.length >
                0 && (
                    <div
                        data-pdf-hide
                        style={{
                            width:
                                "100%",
                            maxWidth:
                                "1100px",
                            margin:
                                "0 auto 20px",
                            background:
                                "#ffffff",
                            border:
                                "1px solid #e5e7eb",
                            borderRadius:
                                "12px",
                            padding:
                                "16px 20px",
                            display:
                                "grid",
                            gridTemplateColumns:
                                "repeat(auto-fit,minmax(130px,1fr))",
                            gap: "10px",
                            boxShadow:
                                "0 6px 20px rgba(0,0,0,0.06)",
                            boxSizing:
                                "border-box",
                        }}
                    >
                        <div
                            style={{
                                textAlign:
                                    "center",
                            }}
                        >
                            <div
                                style={{
                                    fontSize:
                                        "12px",
                                    color:
                                        "#6b7280",
                                }}
                            >
                                Score
                            </div>

                            <strong
                                style={{
                                    display:
                                        "block",
                                    marginTop:
                                        "3px",
                                    fontSize:
                                        "23px",
                                    color:
                                        "#111827",
                                }}
                            >
                                {
                                    result.percentage
                                }
                                %
                            </strong>
                        </div>

                        <div
                            style={{
                                textAlign:
                                    "center",
                            }}
                        >
                            <div
                                style={{
                                    fontSize:
                                        "12px",
                                    color:
                                        "#6b7280",
                                }}
                            >
                                Correct
                            </div>

                            <strong
                                style={{
                                    display:
                                        "block",
                                    marginTop:
                                        "3px",
                                    fontSize:
                                        "23px",
                                    color:
                                        "#16a34a",
                                }}
                            >
                                {
                                    result.correct
                                }
                            </strong>
                        </div>

                        <div
                            style={{
                                textAlign:
                                    "center",
                            }}
                        >
                            <div
                                style={{
                                    fontSize:
                                        "12px",
                                    color:
                                        "#6b7280",
                                }}
                            >
                                Wrong
                            </div>

                            <strong
                                style={{
                                    display:
                                        "block",
                                    marginTop:
                                        "3px",
                                    fontSize:
                                        "23px",
                                    color:
                                        "#dc2626",
                                }}
                            >
                                {
                                    result.wrong
                                }
                            </strong>
                        </div>

                        <div
                            style={{
                                textAlign:
                                    "center",
                            }}
                        >
                            <div
                                style={{
                                    fontSize:
                                        "12px",
                                    color:
                                        "#6b7280",
                                }}
                            >
                                Unanswered
                            </div>

                            <strong
                                style={{
                                    display:
                                        "block",
                                    marginTop:
                                        "3px",
                                    fontSize:
                                        "23px",
                                    color:
                                        "#6b7280",
                                }}
                            >
                                {
                                    result.unanswered
                                }
                            </strong>
                        </div>
                    </div>
                )}

            {/* =================================================
                A4 PAPER
            ================================================= */}

            <div
                id="mcq-paper"
                style={{
                    width:
                        "100%",
                    maxWidth:
                        "794px",
                    minHeight:
                        "1123px",
                    margin:
                        "0 auto",
                    background:
                        "#ffffff",
                    boxSizing:
                        "border-box",
                    padding:
                        "34px 42px 45px",
                    boxShadow:
                        "0 10px 35px rgba(0,0,0,0.13)",
                    border:
                        "1px solid #e5e7eb",
                    color:
                        "#111111",
                    fontFamily:
                        "Arial, Helvetica, sans-serif",
                }}
            >
                {/* =================================================
                    PAPER HEADER
                ================================================= */}

                <div
                    data-pdf-header
                    style={{
                        borderBottom:
                            "2px solid #111827",
                        paddingBottom:
                            "14px",
                        marginBottom:
                            "18px",
                    }}
                >
                    <div
                        style={{
                            display:
                                "flex",
                            justifyContent:
                                "space-between",
                            alignItems:
                                "flex-start",
                            gap:
                                "15px",
                        }}
                    >
                        <div>
                            <div
                                style={{
                                    fontSize:
                                        "23px",
                                    fontWeight:
                                        "800",
                                    letterSpacing:
                                        "-0.4px",
                                }}
                            >
                                StudiesForge
                            </div>

                            <div
                                style={{
                                    marginTop:
                                        "3px",
                                    fontSize:
                                        "11px",
                                    color:
                                        "#555555",
                                }}
                            >
                                MCQ Test Paper
                            </div>
                        </div>

                        <div
                            style={{
                                textAlign:
                                    "right",
                                fontSize:
                                    "11px",
                                lineHeight:
                                    "1.5",
                                color:
                                    "#444444",
                            }}
                        >
                            <div>
                                <strong>
                                    StudiesForge.com
                                </strong>
                            </div>

                            <div>
                                Total Questions:{" "}
                                {
                                    filteredMcqs.length
                                }
                            </div>
                        </div>
                    </div>

                    <div
                        style={{
                            marginTop:
                                "13px",
                            display:
                                "flex",
                            justifyContent:
                                "space-between",
                            gap:
                                "15px",
                            fontSize:
                                "11px",
                            color:
                                "#444444",
                        }}
                    >
                        <span>
                            Name:
                            __________________________
                        </span>

                        <span>
                            Date:
                            ______________
                        </span>
                    </div>
                </div>

                {/* =================================================
                    EMPTY
                ================================================= */}

                {!filteredMcqs.length && (
                    <div
                        style={{
                            minHeight:
                                "300px",
                            display:
                                "flex",
                            alignItems:
                                "center",
                            justifyContent:
                                "center",
                            textAlign:
                                "center",
                            color:
                                "#6b7280",
                            fontSize:
                                "15px",
                        }}
                    >
                        No MCQs found for
                        the selected
                        filters.
                    </div>
                )}

                {/* =================================================
                    MCQS
                ================================================= */}

                <div>
                    {filteredMcqs.map(
                        (
                            mcq,
                            index
                        ) => {
                            const selected =
                                answers[
                                mcq._id
                                ]

                            const correctIndex =
                                getCorrectIndex(
                                    mcq
                                )

                            return (
                                <div
                                    key={
                                        mcq._id
                                    }
                                    data-pdf-question
                                    style={{
                                        marginBottom:
                                            "14px",
                                        paddingBottom:
                                            "13px",
                                        borderBottom:
                                            "1px solid #e5e7eb",
                                        pageBreakInside:
                                            "avoid",
                                        breakInside:
                                            "avoid",
                                        boxSizing:
                                            "border-box",
                                    }}
                                >
                                    {/* QUESTION */}

                                    <div
                                        style={{
                                            display:
                                                "flex",
                                            alignItems:
                                                "flex-start",
                                            gap:
                                                "8px",
                                            fontSize:
                                                "14px",
                                            lineHeight:
                                                "1.45",
                                            fontWeight:
                                                "600",
                                        }}
                                    >
                                        <span
                                            style={{
                                                minWidth:
                                                    "25px",
                                            }}
                                        >
                                            {index +
                                                1}
                                            .
                                        </span>

                                        <span
                                            style={{
                                                whiteSpace:
                                                    "pre-wrap",
                                                flex:
                                                    "1",
                                            }}
                                        >
                                            {
                                                mcq.statement
                                            }
                                        </span>
                                    </div>

                                    {/* OPTIONS */}

                                    <div
                                        style={{
                                            display:
                                                "grid",
                                            gridTemplateColumns:
                                                "1fr 1fr",
                                            gap:
                                                "7px 12px",
                                            marginTop:
                                                "8px",
                                            marginLeft:
                                                "33px",
                                        }}
                                    >
                                        {(
                                            mcq.options ||
                                            []
                                        ).map(
                                            (
                                                option,
                                                optionIndex
                                            ) => {
                                                const isSelected =
                                                    selected ===
                                                    optionIndex

                                                const isCorrect =
                                                    submitted &&
                                                    correctIndex ===
                                                    optionIndex

                                                const isWrong =
                                                    submitted &&
                                                    isSelected &&
                                                    correctIndex !==
                                                    optionIndex

                                                return (
                                                    <button
                                                        key={
                                                            optionIndex
                                                        }
                                                        type="button"
                                                        onClick={() =>
                                                            selectAnswer(
                                                                mcq._id,
                                                                optionIndex
                                                            )
                                                        }
                                                        style={{
                                                            ...getOptionStyle(
                                                                mcq,
                                                                optionIndex
                                                            ),
                                                            width:
                                                                "100%",
                                                            textAlign:
                                                                "left",
                                                            padding:
                                                                "8px 10px",
                                                            borderRadius:
                                                                "5px",
                                                            cursor:
                                                                submitted
                                                                    ? "default"
                                                                    : "pointer",
                                                            fontSize:
                                                                "12.5px",
                                                            lineHeight:
                                                                "1.35",
                                                            display:
                                                                "flex",
                                                            alignItems:
                                                                "flex-start",
                                                            gap:
                                                                "7px",
                                                            boxSizing:
                                                                "border-box",
                                                            fontFamily:
                                                                "Arial, Helvetica, sans-serif",
                                                        }}
                                                    >
                                                        <span
                                                            style={{
                                                                fontWeight:
                                                                    "700",
                                                                minWidth:
                                                                    "20px",
                                                            }}
                                                        >
                                                            {String.fromCharCode(
                                                                65 +
                                                                optionIndex
                                                            )}
                                                            .
                                                        </span>

                                                        <span
                                                            style={{
                                                                flex:
                                                                    "1",
                                                                whiteSpace:
                                                                    "pre-wrap",
                                                            }}
                                                        >
                                                            {
                                                                option.text
                                                            }
                                                        </span>

                                                        {isCorrect && (
                                                            <span
                                                                style={{
                                                                    fontWeight:
                                                                        "800",
                                                                    color:
                                                                        "#16a34a",
                                                                }}
                                                            >
                                                                ✓
                                                            </span>
                                                        )}

                                                        {isWrong && (
                                                            <span
                                                                style={{
                                                                    fontWeight:
                                                                        "800",
                                                                    color:
                                                                        "#dc2626",
                                                                }}
                                                            >
                                                                ✕
                                                            </span>
                                                        )}
                                                    </button>
                                                )
                                            }
                                        )}
                                    </div>
                                </div>
                            )
                        }
                    )}
                </div>

                {/* =================================================
                    PAPER FOOTER
                ================================================= */}

                <div
                    style={{
                        marginTop:
                            "22px",
                        paddingTop:
                            "10px",
                        borderTop:
                            "1px solid #d1d5db",
                        textAlign:
                            "center",
                        fontSize:
                            "9px",
                        color:
                            "#666666",
                    }}
                >
                    StudiesForge.com
                </div>
            </div>

            {/* =================================================
                ACTION BUTTONS
            ================================================= */}

            {filteredMcqs.length >
                0 && (
                    <div
                        data-pdf-hide
                        style={{
                            width:
                                "100%",
                            maxWidth:
                                "794px",
                            margin:
                                "22px auto 0",
                            display:
                                "flex",
                            justifyContent:
                                "center",
                            alignItems:
                                "center",
                            gap:
                                "12px",
                            flexWrap:
                                "wrap",
                        }}
                    >
                        {!submitted && (
                            <button
                                type="button"
                                onClick={
                                    submitTest
                                }
                                style={{
                                    border:
                                        "none",
                                    background:
                                        "#111827",
                                    color:
                                        "#ffffff",
                                    padding:
                                        "13px 25px",
                                    borderRadius:
                                        "8px",
                                    fontSize:
                                        "14px",
                                    fontWeight:
                                        "700",
                                    cursor:
                                        "pointer",
                                    boxShadow:
                                        "0 5px 15px rgba(0,0,0,0.15)",
                                }}
                            >
                                Submit Test
                            </button>
                        )}

                        {submitted && (
                            <button
                                type="button"
                                onClick={() => {
                                    setAnswers(
                                        {}
                                    )

                                    setSubmitted(
                                        false
                                    )

                                    window.scrollTo(
                                        {
                                            top: 0,
                                            behavior:
                                                "smooth",
                                        }
                                    )
                                }}
                                style={{
                                    border:
                                        "1px solid #111827",
                                    background:
                                        "#ffffff",
                                    color:
                                        "#111827",
                                    padding:
                                        "13px 25px",
                                    borderRadius:
                                        "8px",
                                    fontSize:
                                        "14px",
                                    fontWeight:
                                        "700",
                                    cursor:
                                        "pointer",
                                }}
                            >
                                Retake Test
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={
                                downloadPdf
                            }
                            disabled={
                                downloading
                            }
                            style={{
                                border:
                                    "none",
                                background:
                                    downloading
                                        ? "#9ca3af"
                                        : "#2563eb",
                                color:
                                    "#ffffff",
                                padding:
                                    "13px 25px",
                                borderRadius:
                                    "8px",
                                fontSize:
                                    "14px",
                                fontWeight:
                                    "700",
                                cursor:
                                    downloading
                                        ? "not-allowed"
                                        : "pointer",
                                boxShadow:
                                    "0 5px 15px rgba(37,99,235,0.2)",
                            }}
                        >
                            {downloading
                                ? "Preparing PDF..."
                                : "Download PDF"}
                        </button>
                    </div>
                )}

            {/* =================================================
                DOWNLOAD NOTE
            ================================================= */}

            <div
                data-pdf-hide
                style={{
                    width:
                        "100%",
                    maxWidth:
                        "794px",
                    margin:
                        "12px auto 0",
                    textAlign:
                        "center",
                    fontSize:
                        "11px",
                    color:
                        "#6b7280",
                }}
            >
                Downloaded paper is
                formatted for A4
                printing. Every MCQ
                remains together on
                one page.
            </div>
        </main>
    )
}