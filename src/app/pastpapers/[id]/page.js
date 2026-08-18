"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"

export default function PastPaperDetailsPage() {
    const params = useParams()

    const id = params?.id

    const [pastPaper, setPastPaper] = useState(null)
    const [loading, setLoading] = useState(true)
    const [downloading, setDownloading] = useState(false)
    const [error, setError] = useState("")

    // =========================================================
    // LOAD SPECIFIC PAST PAPER
    // =========================================================

    useEffect(() => {
        if (!id) return

        const loadPastPaper = async () => {
            try {
                setLoading(true)
                setError("")

                const res = await fetch(
                    `/api/pastpapers/${id}`,
                    {
                        cache: "no-store",
                    }
                )

                const data = await res.json()

                console.log(
                    "Past Paper API Response:",
                    data
                )

                if (!res.ok) {
                    throw new Error(
                        data?.message ||
                        "Unable to load past paper"
                    )
                }

                const paper =
                    data?.pastpaper ||
                    data?.pastPaper ||
                    data?.data ||
                    null

                if (!paper) {
                    throw new Error(
                        "Past paper was not found."
                    )
                }

                console.log(
                    "Past Paper:",
                    paper
                )

                console.log(
                    "MCQs:",
                    paper.mcq
                )

                setPastPaper(paper)
            } catch (err) {
                console.error(
                    "Past paper fetch error:",
                    err
                )

                setError(
                    err?.message ||
                    "Unable to load past paper."
                )
            } finally {
                setLoading(false)
            }
        }

        loadPastPaper()
    }, [id])

    // =========================================================
    // EVENT NAME
    // =========================================================

    const eventName = useMemo(() => {
        if (!pastPaper) {
            return "Past Paper"
        }

        if (
            pastPaper.event &&
            typeof pastPaper.event === "object"
        ) {
            return (
                pastPaper.event.name ||
                pastPaper.event.eventName ||
                pastPaper.event.title ||
                "Past Paper"
            )
        }

        return (
            pastPaper.eventName ||
            pastPaper.eventTitle ||
            "Past Paper"
        )
    }, [pastPaper])

    // =========================================================
    // SUBJECT NAME
    // =========================================================

    const subjectName = useMemo(() => {
        if (!pastPaper) {
            return ""
        }

        if (
            pastPaper.subject &&
            typeof pastPaper.subject === "object"
        ) {
            return (
                pastPaper.subject.name ||
                pastPaper.subject.subjectName ||
                ""
            )
        }

        return (
            pastPaper.subjectName ||
            ""
        )
    }, [pastPaper])

    // =========================================================
    // PAPER TITLE
    // =========================================================

    const paperTitle = useMemo(() => {
        if (!pastPaper) {
            return "Past Paper"
        }

        const name =
            pastPaper.name ||
            pastPaper.title ||
            pastPaper.paperName

        if (name) {
            return name
        }

        if (pastPaper.year) {
            return `${eventName} ${pastPaper.year}`
        }

        return eventName
    }, [
        pastPaper,
        eventName,
    ])

    // =========================================================
    // MCQS
    // =========================================================

    const mcqs = useMemo(() => {
        if (!pastPaper) {
            return []
        }

        /*
         * API RESPONSE:
         *
         * "mcq": [
         *   {
         *     "sr_number": 1,
         *     "statement": "...",
         *     "options": [...]
         *   }
         * ]
         */

        return Array.isArray(
            pastPaper.mcq
        )
            ? pastPaper.mcq
            : []
    }, [pastPaper])

    // =========================================================
    // DETAIL QUESTIONS
    // =========================================================

    const detailQuestions = useMemo(() => {
        if (!pastPaper) {
            return []
        }

        return Array.isArray(
            pastPaper.detailQuestions
        )
            ? pastPaper.detailQuestions
            : []
    }, [pastPaper])

    // =========================================================
    // DATE
    // =========================================================

    const paperDate = useMemo(() => {
        if (!pastPaper) {
            return ""
        }

        if (!pastPaper.createdAt) {
            return ""
        }

        try {
            return new Date(
                pastPaper.createdAt
            ).toLocaleDateString(
                "en-GB",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                }
            )
        } catch {
            return ""
        }
    }, [pastPaper])

    // =========================================================
    // YEAR
    // =========================================================

    const paperYear = useMemo(() => {
        if (!pastPaper) {
            return ""
        }

        return pastPaper.year || ""
    }, [pastPaper])

    // =========================================================
    // INSTRUCTION
    // =========================================================

    const instruction = useMemo(() => {
        if (!pastPaper) {
            return ""
        }

        return (
            pastPaper.instruction ||
            pastPaper.instructions ||
            pastPaper.description ||
            ""
        )
    }, [pastPaper])

    // =========================================================
    // TOTAL QUESTIONS
    // =========================================================

    const totalQuestions =
        mcqs.length +
        detailQuestions.length

    // =========================================================
    // TOTAL MARKS
    // =========================================================

    const totalMarks = useMemo(() => {
        if (!pastPaper) {
            return totalQuestions
        }

        return (
            pastPaper.totalMarks ||
            pastPaper.marks ||
            totalQuestions
        )
    }, [
        pastPaper,
        totalQuestions,
    ])

    // =========================================================
    // DOWNLOAD PDF
    // =========================================================

    const downloadPdf = async () => {
        if (
            !mcqs.length &&
            !detailQuestions.length
        ) {
            return
        }

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
                    "past-paper"
                )

            if (!paper) {
                throw new Error(
                    "Past paper could not be found."
                )
            }

            // =================================================
            // A4 DIMENSIONS
            // =================================================

            const A4_WIDTH = 794
            const A4_HEIGHT = 1123

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

            // =================================================
            // HEADER
            // =================================================

            const header =
                paper.querySelector(
                    "[data-pdf-header]"
                )

            // =================================================
            // QUESTIONS
            // =================================================

            const questionElements =
                Array.from(
                    paper.querySelectorAll(
                        "[data-pdf-question]"
                    )
                )

            if (!questionElements.length) {
                throw new Error(
                    "No questions were found."
                )
            }

            // =================================================
            // MEASUREMENT CONTAINER
            // =================================================

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

            // =================================================
            // MEASUREMENT PAPER
            // =================================================

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

            measurePaper.style.margin =
                "0"

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

            // =================================================
            // HEADER HEIGHT
            // =================================================

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

            // =================================================
            // PAGE HEIGHT
            // =================================================

            const firstPageQuestionHeight =
                Math.max(
                    0,
                    CONTENT_HEIGHT -
                    headerHeight -
                    10
                )

            const normalPageQuestionHeight =
                CONTENT_HEIGHT - 5

            // =================================================
            // MEASURE EVERY QUESTION
            // =================================================

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

            // =================================================
            // GROUP QUESTIONS
            // =================================================

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

                    if (
                        currentPage.length ===
                        0 ||
                        questionHeight <=
                        currentHeight
                    ) {
                        currentPage.push(
                            index
                        )

                        currentHeight -=
                            questionHeight
                    } else {
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

            document.body.removeChild(
                measure
            )

            // =================================================
            // CREATE PDF
            // =================================================

            const pdf = new jsPDF({
                orientation:
                    "portrait",
                unit: "mm",
                format: "a4",
                compress: true,
            })

            const PDF_WIDTH =
                pdf.internal.pageSize.getWidth()

            const PDF_HEIGHT =
                pdf.internal.pageSize.getHeight()

            // =================================================
            // RENDER PAGES
            // =================================================

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

                // =================================================
                // HEADER
                // =================================================

                if (
                    pageIndex === 0 &&
                    header
                ) {
                    const headerClone =
                        header.cloneNode(
                            true
                        )

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

                // =================================================
                // QUESTIONS
                // =================================================

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

                        page.appendChild(
                            clone
                        )
                    }
                )

                document.body.appendChild(
                    page
                )

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

            // =================================================
            // PDF METADATA
            // =================================================

            pdf.setProperties({
                title:
                    `${paperTitle} - StudiesForge`,
                subject:
                    "Past Paper",
                author:
                    "StudiesForge.com",
                creator:
                    "StudiesForge.com",
                keywords:
                    "StudiesForge, Past Paper, MCQs, Education",
            })

            // =================================================
            // SAVE
            // =================================================

            const safeName =
                String(
                    paperTitle ||
                    "Past-Paper"
                )
                    .replace(
                        /[^a-z0-9]+/gi,
                        "-"
                    )
                    .replace(
                        /^-+|-+$/g,
                        ""
                    )

            pdf.save(
                `${safeName || "Past-Paper"}-StudiesForge.pdf`
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
                    justifyContent: "center",
                    background: "#f3f4f6",
                    fontFamily:
                        "Arial, Helvetica, sans-serif",
                }}
            >
                <div
                    style={{
                        background: "#ffffff",
                        padding: "30px 45px",
                        borderRadius: "10px",
                        boxShadow:
                            "0 5px 25px rgba(0,0,0,0.08)",
                        fontSize: "16px",
                        fontWeight: "600",
                    }}
                >
                    Loading past paper...
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
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#f3f4f6",
                    padding: "20px",
                    fontFamily:
                        "Arial, Helvetica, sans-serif",
                }}
            >
                <div
                    style={{
                        background: "#ffffff",
                        padding: "30px",
                        borderRadius: "12px",
                        maxWidth: "500px",
                        width: "100%",
                        textAlign: "center",
                        border:
                            "1px solid #fecaca",
                        boxShadow:
                            "0 8px 30px rgba(0,0,0,0.08)",
                    }}
                >
                    <div
                        style={{
                            fontSize: "18px",
                            fontWeight: "800",
                            color: "#991b1b",
                            marginBottom: "8px",
                        }}
                    >
                        Unable to load past paper
                    </div>

                    <div
                        style={{
                            color: "#6b7280",
                            fontSize: "14px",
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
                INFORMATION BAR
            ================================================= */}

            <div
                data-pdf-hide
                style={{
                    width: "100%",
                    maxWidth: "794px",
                    margin: "0 auto 20px",
                    background: "#ffffff",
                    borderRadius: "12px",
                    padding: "15px 20px",
                    boxShadow:
                        "0 8px 30px rgba(0,0,0,0.08)",
                    border:
                        "1px solid #e5e7eb",
                    boxSizing: "border-box",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent:
                            "space-between",
                        alignItems: "center",
                        gap: "15px",
                        flexWrap: "wrap",
                    }}
                >
                    <div>
                        <div
                            style={{
                                fontSize: "13px",
                                color: "#6b7280",
                            }}
                        >
                            Past Paper
                        </div>

                        <div
                            style={{
                                marginTop: "2px",
                                fontSize: "18px",
                                fontWeight: "800",
                                color: "#111827",
                            }}
                        >
                            {paperTitle}
                        </div>
                    </div>

                    <div
                        style={{
                            display: "flex",
                            gap: "18px",
                            alignItems: "center",
                            fontSize: "12px",
                            color: "#6b7280",
                        }}
                    >
                        <span>
                            Questions:{" "}
                            <strong
                                style={{
                                    color: "#111827",
                                }}
                            >
                                {totalQuestions}
                            </strong>
                        </span>

                        {paperYear && (
                            <span>
                                Year:{" "}
                                <strong
                                    style={{
                                        color: "#111827",
                                    }}
                                >
                                    {paperYear}
                                </strong>
                            </span>
                        )}

                        {subjectName && (
                            <span>
                                Subject:{" "}
                                <strong
                                    style={{
                                        color: "#111827",
                                    }}
                                >
                                    {subjectName}
                                </strong>
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* =================================================
                A4 PAPER
            ================================================= */}

            <div
                id="past-paper"
                style={{
                    width: "100%",
                    maxWidth: "794px",
                    minHeight: "1123px",
                    margin: "0 auto",
                    background: "#ffffff",
                    boxSizing: "border-box",
                    padding:
                        "34px 42px 45px",
                    boxShadow:
                        "0 10px 35px rgba(0,0,0,0.13)",
                    border:
                        "1px solid #e5e7eb",
                    color: "#111111",
                    fontFamily:
                        "Arial, Helvetica, sans-serif",
                }}
            >
                {/* =================================================
                    HEADER
                ================================================= */}

                <div
                    data-pdf-header
                    style={{
                        borderBottom:
                            "2px solid #111827",
                        paddingBottom: "14px",
                        marginBottom: "18px",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            justifyContent:
                                "space-between",
                            alignItems:
                                "flex-start",
                            gap: "15px",
                        }}
                    >
                        <div>
                            <div
                                style={{
                                    fontSize: "23px",
                                    fontWeight: "800",
                                    letterSpacing:
                                        "-0.4px",
                                }}
                            >
                                StudiesForge
                            </div>

                            <div
                                style={{
                                    marginTop: "3px",
                                    fontSize: "11px",
                                    color: "#555555",
                                }}
                            >
                                {eventName}
                            </div>

                            {subjectName && (
                                <div
                                    style={{
                                        marginTop:
                                            "2px",
                                        fontSize:
                                            "11px",
                                        color:
                                            "#555555",
                                    }}
                                >
                                    {subjectName}
                                </div>
                            )}
                        </div>

                        <div
                            style={{
                                textAlign: "right",
                                fontSize: "11px",
                                lineHeight: "1.5",
                                color: "#444444",
                            }}
                        >
                            <div>
                                <strong>
                                    StudiesForge.com
                                </strong>
                            </div>

                            {paperYear && (
                                <div>
                                    Year:{" "}
                                    {paperYear}
                                </div>
                            )}

                            <div>
                                Total Questions:{" "}
                                {totalQuestions}
                            </div>

                            <div>
                                Total Marks:{" "}
                                {totalMarks}
                            </div>
                        </div>
                    </div>

                    {/* PAPER TITLE */}

                    <div
                        style={{
                            marginTop: "13px",
                            textAlign: "center",
                        }}
                    >
                        <div
                            style={{
                                fontSize: "17px",
                                fontWeight: "800",
                                textTransform:
                                    "uppercase",
                            }}
                        >
                            {paperTitle}
                        </div>
                    </div>

                    {/* NAME / DATE */}

                    <div
                        style={{
                            marginTop: "13px",
                            display: "flex",
                            justifyContent:
                                "space-between",
                            gap: "15px",
                            fontSize: "11px",
                            color: "#444444",
                        }}
                    >
                        <span>
                            Name:
                            __________________________
                        </span>

                        <span>
                            Date:
                            {paperDate
                                ? ` ${paperDate}`
                                : " ______________"}
                        </span>
                    </div>
                </div>

                {/* =================================================
                    INSTRUCTIONS
                ================================================= */}

                {instruction && (
                    <div
                        style={{
                            marginBottom: "18px",
                            padding: "10px 12px",
                            border:
                                "1px solid #d1d5db",
                            background: "#fafafa",
                            fontSize: "11px",
                            lineHeight: "1.5",
                        }}
                    >
                        <strong>
                            Instructions:
                        </strong>{" "}
                        {instruction}
                    </div>
                )}

                {/* =================================================
                    MCQS
                ================================================= */}

                {mcqs.length > 0 && (
                    <div>
                        <div
                            style={{
                                fontSize: "15px",
                                fontWeight: "800",
                                marginBottom:
                                    "15px",
                                borderBottom:
                                    "1px solid #111827",
                                paddingBottom:
                                    "7px",
                            }}
                        >
                            Multiple Choice Questions
                        </div>

                        {mcqs.map(
                            (
                                mcq,
                                index
                            ) => {
                                const statement =
                                    mcq?.statement ||
                                    ""

                                const options =
                                    Array.isArray(
                                        mcq?.options
                                    )
                                        ? mcq.options
                                        : []

                                return (
                                    <div
                                        key={
                                            mcq?._id ||
                                            index
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
                                                        "30px",
                                                    fontWeight:
                                                        "800",
                                                }}
                                            >
                                                {mcq?.sr_number ||
                                                    index +
                                                    1}
                                                .
                                            </span>

                                            <span
                                                style={{
                                                    whiteSpace:
                                                        "pre-wrap",
                                                    flex: "1",
                                                }}
                                            >
                                                {
                                                    statement
                                                }
                                            </span>
                                        </div>

                                        {/* OPTIONS */}

                                        {options.length >
                                            0 && (
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
                                                            "38px",
                                                    }}
                                                >
                                                    {options.map(
                                                        (
                                                            option,
                                                            optionIndex
                                                        ) => {
                                                            const optionNumber =
                                                                option?.option_number ||
                                                                String.fromCharCode(
                                                                    65 +
                                                                    optionIndex
                                                                )

                                                            const optionText =
                                                                option?.option_text ||
                                                                option?.text ||
                                                                option?.label ||
                                                                ""

                                                            return (
                                                                <div
                                                                    key={
                                                                        option?._id ||
                                                                        optionIndex
                                                                    }
                                                                    style={{
                                                                        width:
                                                                            "100%",
                                                                        textAlign:
                                                                            "left",
                                                                        padding:
                                                                            "8px 10px",
                                                                        border:
                                                                            "1px solid #d1d5db",
                                                                        borderRadius:
                                                                            "5px",
                                                                        background:
                                                                            "#ffffff",
                                                                        color:
                                                                            "#111827",
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
                                                                        {
                                                                            optionNumber
                                                                        }
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
                                                                            optionText
                                                                        }
                                                                    </span>
                                                                </div>
                                                            )
                                                        }
                                                    )}
                                                </div>
                                            )}
                                    </div>
                                )
                            }
                        )}
                    </div>
                )}

                {/* =================================================
                    DETAIL QUESTIONS
                ================================================= */}

                {detailQuestions.length >
                    0 && (
                        <div
                            style={{
                                marginTop:
                                    "25px",
                            }}
                        >
                            <div
                                style={{
                                    fontSize:
                                        "15px",
                                    fontWeight:
                                        "800",
                                    marginBottom:
                                        "15px",
                                    borderBottom:
                                        "1px solid #111827",
                                    paddingBottom:
                                        "7px",
                                }}
                            >
                                Detailed Questions
                            </div>

                            {detailQuestions.map(
                                (
                                    question,
                                    index
                                ) => {
                                    const text =
                                        question?.statement ||
                                        question?.question ||
                                        question?.text ||
                                        ""

                                    return (
                                        <div
                                            key={
                                                question?._id ||
                                                index
                                            }
                                            data-pdf-question
                                            style={{
                                                marginBottom:
                                                    "14px",
                                                paddingBottom:
                                                    "13px",
                                                borderBottom:
                                                    "1px solid #e5e7eb",
                                                fontSize:
                                                    "14px",
                                                lineHeight:
                                                    "1.5",
                                                pageBreakInside:
                                                    "avoid",
                                                breakInside:
                                                    "avoid",
                                            }}
                                        >
                                            <strong>
                                                {index +
                                                    1}
                                                .
                                            </strong>{" "}
                                            {text}
                                        </div>
                                    )
                                }
                            )}
                        </div>
                    )}

                {/* =================================================
                    EMPTY
                ================================================= */}

                {!mcqs.length &&
                    !detailQuestions.length && (
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
                            No questions are
                            available in this
                            past paper.
                        </div>
                    )}

                {/* =================================================
                    FOOTER
                ================================================= */}

                <div
                    style={{
                        marginTop: "22px",
                        paddingTop: "10px",
                        borderTop:
                            "1px solid #d1d5db",
                        textAlign: "center",
                        fontSize: "9px",
                        color: "#666666",
                    }}
                >
                    StudiesForge.com
                </div>
            </div>

            {/* =================================================
                DOWNLOAD BUTTON
            ================================================= */}

            {(mcqs.length > 0 ||
                detailQuestions.length >
                0) && (
                    <div
                        data-pdf-hide
                        style={{
                            width: "100%",
                            maxWidth: "794px",
                            margin:
                                "22px auto 0",
                            display: "flex",
                            justifyContent:
                                "center",
                            alignItems:
                                "center",
                        }}
                    >
                        <button
                            type="button"
                            onClick={
                                downloadPdf
                            }
                            disabled={
                                downloading
                            }
                            style={{
                                border: "none",
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
                    width: "100%",
                    maxWidth: "794px",
                    margin: "12px auto 0",
                    textAlign: "center",
                    fontSize: "11px",
                    color: "#6b7280",
                }}
            >
                Downloaded paper is
                formatted for A4
                printing. Every question
                remains together on one
                page.
            </div>
        </main>
    )
}