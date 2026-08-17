const normalizeText = (text = "") => {
    return text
        .replace(/\r/g, "")
        .replace(/\u00a0/g, " ")
        .replace(/\|/g, " ")
        .replace(/[ \t]+/g, " ")
        .trim();
};

const cleanLine = (line = "") => {
    return line
        .replace(/\u00a0/g, " ")
        .replace(/[ \t]+/g, " ")
        .trim();
};

const extractYear = (text = "", lines = []) => {
    /*
     * First prefer a year that appears near
     * CSS / paper / exam wording.
     */
    const headerText = lines
        .slice(0, 12)
        .join(" ");

    const headerYearMatches =
        headerText.match(
            /\b(19\d{2}|20\d{2})\b/g
        );

    if (headerYearMatches?.length) {
        for (const value of headerYearMatches) {
            const year = Number(value);

            if (
                year >= 1900 &&
                year <=
                new Date().getFullYear() + 1
            ) {
                return year;
            }
        }
    }

    /*
     * Then search for an explicit year phrase.
     */
    const explicitMatches = text.match(
        /(?:year|exam|paper|css)\D{0,30}(19\d{2}|20\d{2})\b/gi
    );

    if (explicitMatches?.length) {
        for (const value of explicitMatches) {
            const match =
                value.match(
                    /\b(19\d{2}|20\d{2})\b/
                );

            if (match) {
                const year = Number(match[1]);

                if (
                    year >= 1900 &&
                    year <=
                    new Date().getFullYear() + 1
                ) {
                    return year;
                }
            }
        }
    }

    return null;
};

const normalizeQuestionNumber = (
    value,
    previousNumber = null
) => {
    const token = String(value || "")
        .trim()
        .toLowerCase();

    if (/^\d+$/.test(token)) {
        const number = Number(token);

        if (
            number >= 1 &&
            number <= 999
        ) {
            return number;
        }
    }

    /*
     * OCR replacements.
     */
    const replacements = {
        s: 5,
        a: 6,
        t: 7,
        b: 8,
        g: 9,
    };

    if (
        token.length === 1 &&
        replacements[token] !== undefined
    ) {
        const number =
            replacements[token];

        if (
            previousNumber !== null &&
            number <= previousNumber
        ) {
            return previousNumber + 1;
        }

        return number;
    }

    return null;
};

/*
 * Explicit written-paper question markers:
 *
 * Q-No2
 * Q.No.3
 * QNo4
 * Question 5
 * Q6
 */
const detectWrittenQuestion = (
    line,
    previousNumber = null
) => {
    let match;

    match = line.match(
        /^\s*Q\s*[-.]?\s*No\s*[-.]?\s*([0-9A-Za-z?]+)/i
    );

    if (match) {
        const number =
            normalizeQuestionNumber(
                match[1],
                previousNumber
            );

        if (number !== null) {
            return {
                number,
                text: line
                    .slice(match[0].length)
                    .trim(),
            };
        }

        return null;
    }

    match = line.match(
        /^\s*QNo\s*([0-9A-Za-z?]+)/i
    );

    if (match) {
        const number =
            normalizeQuestionNumber(
                match[1],
                previousNumber
            );

        if (number !== null) {
            return {
                number,
                text: line
                    .slice(match[0].length)
                    .trim(),
            };
        }

        return null;
    }

    match = line.match(
        /^\s*Question\s*[-.:]?\s*([0-9A-Za-z?]+)/i
    );

    if (match) {
        const number =
            normalizeQuestionNumber(
                match[1],
                previousNumber
            );

        if (number !== null) {
            return {
                number,
                text: line
                    .slice(match[0].length)
                    .trim(),
            };
        }

        return null;
    }

    match = line.match(
        /^\s*Q\s*[-.:]?\s*([0-9A-Za-z?]+)\s*/i
    );

    if (match) {
        const number =
            normalizeQuestionNumber(
                match[1],
                previousNumber
            );

        if (
            number !== null &&
            number >= 1 &&
            number <= 100
        ) {
            return {
                number,
                text: line
                    .slice(match[0].length)
                    .trim(),
            };
        }
    }

    return null;
};

const getOption = (line = "") => {
    /*
     * A. option
     * A) option
     * A- option
     * A: option
     * (A) option
     */
    const patterns = [
        /^\s*\(?([A-Fa-f])\)?\s*[.)\-:]\s*(.+)$/,

        /^\s*\(([A-Fa-f])\)\s*(.+)$/,
    ];

    for (const pattern of patterns) {
        const match =
            line.match(pattern);

        if (match) {
            return {
                option_number:
                    match[1].toUpperCase(),

                option_text:
                    match[2].trim(),
            };
        }
    }

    return null;
};

const hasMcqHeader = (lines = []) => {
    const header = lines
        .slice(0, 30)
        .join(" ")
        .toLowerCase();

    return (
        /\bmcqs?\b/.test(header) ||
        /\bomr\b/.test(header) ||
        /\bmcq[s]?\s+answer\s+sheet\b/.test(
            header
        ) ||
        /\b20x1\b/.test(header)
    );
};

const hasWrittenQuestionMarkers = (
    lines = []
) => {
    return lines.some(
        (line) =>
            detectWrittenQuestion(
                line
            ) !== null
    );
};

/*
 * Detect the beginning of numbered MCQs.
 *
 * We deliberately do NOT consider:
 *
 * Q:1.
 *
 * to be MCQ #1.
 *
 * In many papers Q:1 is the heading
 * for the MCQ section. The actual questions
 * begin with:
 *
 * 1.
 * 2.
 * 3.
 */
const detectNumberedMcq = (
    line
) => {
    const match = line.match(
        /^\s*(\d{1,3})\s*[.)]\s+(.+)$/
    );

    if (!match) {
        return null;
    }

    return {
        number: Number(match[1]),
        text: match[2].trim(),
    };
};

const parseMcqBlocks = (
    lines = []
) => {
    const questions = [];

    let current = null;

    for (const rawLine of lines) {
        const line = cleanLine(rawLine);

        if (!line) {
            continue;
        }

        const lower =
            line.toLowerCase();

        /*
         * Ignore obvious social/browser UI.
         */
        if (
            lower === "facebook" ||
            lower.includes("share") ||
            lower.includes("save")
        ) {
            continue;
        }

        /*
         * Ignore the section heading:
         *
         * Q:1.
         * PART-1
         * MCQs
         */
        if (
            /^\s*q\s*[:.]?\s*1\s*\.?\s*$/i.test(
                line
            ) ||
            /^part\s*[-:]?\s*1\b/i.test(
                line
            ) ||
            /^part[-\s]?1\b.*mcq/i.test(
                line
            )
        ) {
            continue;
        }

        const detected =
            detectNumberedMcq(line);

        if (detected) {
            if (current) {
                questions.push(
                    current
                );
            }

            current = {
                sr_number:
                    detected.number,

                lines: [],
            };

            if (detected.text) {
                current.lines.push(
                    detected.text
                );
            }

            continue;
        }

        if (current) {
            current.lines.push(
                line
            );
        }
    }

    if (current) {
        questions.push(current);
    }

    return questions;
};

const parseWrittenBlocks = (
    lines = []
) => {
    const questions = [];

    let current = null;
    let previousNumber = null;

    for (const rawLine of lines) {
        const line = cleanLine(rawLine);

        if (!line) {
            continue;
        }

        const lower =
            line.toLowerCase();

        if (
            lower === "facebook" ||
            lower.includes("share") ||
            lower.includes("save")
        ) {
            continue;
        }

        const detected =
            detectWrittenQuestion(
                line,
                previousNumber
            );

        if (
            detected &&
            detected.number !== null
        ) {
            if (current) {
                questions.push(
                    current
                );
            }

            current = {
                sr_number:
                    detected.number,

                lines: [],
            };

            if (detected.text) {
                current.lines.push(
                    detected.text
                );
            }

            previousNumber =
                detected.number;

            continue;
        }

        if (current) {
            current.lines.push(
                line
            );
        }
    }

    if (current) {
        questions.push(
            current
        );
    }

    return questions;
};

const classifyBlock = (
    block
) => {
    const statementLines = [];
    const options = [];

    for (
        const line of block.lines
    ) {
        const option =
            getOption(line);

        if (option) {
            if (
                !options.some(
                    (existing) =>
                        existing.option_number ===
                        option.option_number
                )
            ) {
                options.push(
                    option
                );
            }
        } else {
            statementLines.push(
                line
            );
        }
    }

    let statement =
        statementLines
            .join(" ")
            .replace(/\s+/g, " ")
            .trim();

    /*
     * Remove marks:
     *
     * (20)
     * (20x1=20)
     * [20]
     */
    statement =
        statement.replace(
            /\s*[\(\[\{]\s*\d{1,3}(?:\s*x\s*\d{1,3})?(?:\s*=\s*\d{1,3})?\s*[\)\]\}]\s*$/gi,
            ""
        );

    statement =
        statement.trim();

    if (!statement) {
        return null;
    }

    /*
     * At least two options = MCQ.
     */
    if (options.length >= 2) {
        return {
            type: "mcq",

            sr_number:
                block.sr_number,

            statement,

            options,

            correctOption: "",
        };
    }

    return {
        type: "detail",

        sr_number:
            block.sr_number,

        statement,
    };
};

const extractSection = (
    text = ""
) => {
    /*
     * PART-I
     * PART-1
     * PART-II
     */
    let match = text.match(
        /\bPART\s*[-:]?\s*(I|II|III|IV|V|\d+)\b/i
    );

    if (match) {
        return match[1].toUpperCase();
    }

    match = text.match(
        /\bSECTION\s*[-:]?\s*([A-Z0-9]+)\b/i
    );

    if (match) {
        return match[1].toUpperCase();
    }

    return "";
};

const extractInstruction = (
    lines = [],
    firstQuestionIndex = -1
) => {
    const before =
        firstQuestionIndex === -1
            ? lines.slice(0, 25)
            : lines.slice(
                0,
                firstQuestionIndex
            );

    const result = [];

    let noteStarted = false;

    for (const line of before) {
        const lower =
            line.toLowerCase();

        if (
            lower.startsWith("note") ||
            lower.includes("note:")
        ) {
            noteStarted = true;

            result.push(line);

            continue;
        }

        if (noteStarted) {
            if (
                lower === "facebook" ||
                lower.includes("share") ||
                lower.includes("save")
            ) {
                continue;
            }

            result.push(line);

            continue;
        }

        if (
            lower.includes(
                "instruction"
            ) ||
            lower.includes(
                "attempt"
            ) ||
            lower.includes(
                "answer"
            ) ||
            lower.includes(
                "select"
            ) ||
            lower.includes(
                "choose"
            )
        ) {
            result.push(line);
        }
    }

    return result
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
};

const extractName = (
    lines = [],
    year = null
) => {
    const candidates = [];

    for (
        const line of lines.slice(
            0,
            20
        )
    ) {
        const cleaned =
            cleanLine(line);

        if (!cleaned) {
            continue;
        }

        const lower =
            cleaned.toLowerCase();

        if (
            /^\d{1,2}:\d{2}/.test(
                cleaned
            )
        ) {
            continue;
        }

        if (
            lower.includes(
                "facebook"
            ) ||
            lower.includes(
                "share"
            ) ||
            lower.includes(
                "save"
            ) ||
            lower.includes("©")
        ) {
            continue;
        }

        if (
            lower.startsWith(
                "note"
            ) ||
            lower.includes(
                "instruction"
            ) ||
            lower.includes(
                "attempt"
            )
        ) {
            continue;
        }

        if (
            /^\s*part\s*[-:]?\s*(i|ii|iii|iv|v|1|2|3|4|5)\b/i.test(
                cleaned
            )
        ) {
            continue;
        }

        if (
            cleaned.length < 4 ||
            cleaned.length > 160
        ) {
            continue;
        }

        candidates.push(
            cleaned
        );
    }

    const preferred =
        candidates.find(
            (line) => {
                const lower =
                    line.toLowerCase();

                return (
                    lower.includes(
                        "pakistan affairs"
                    ) ||
                    lower.includes(
                        "general knowledge"
                    ) ||
                    lower.includes(
                        "css"
                    )
                );
            }
        );

    let name =
        preferred ||
        "";

    if (!name) {
        return "";
    }

    if (
        year &&
        !name.includes(
            String(year)
        )
    ) {
        name += ` ${year}`;
    }

    return name.trim();
};

const removeSocialUi = (
    lines = []
) => {
    return lines.filter(
        (line) => {
            const lower =
                line.toLowerCase();

            return (
                lower !== "facebook" &&
                !lower.includes(
                    "share"
                ) &&
                !lower.includes(
                    "save"
                )
            );
        }
    );
};

export const parsePastPaperText = (
    rawText = ""
) => {
    const text =
        normalizeText(rawText);

    if (!text) {
        return {
            name: "",
            year: null,
            instruction: "",
            section: "",
            mcq: [],
            detailQuestions: [],
        };
    }

    const originalLines = text
        .split("\n")
        .map(cleanLine)
        .filter(Boolean);

    const lines =
        removeSocialUi(
            originalLines
        );

    const year =
        extractYear(
            text,
            lines
        );

    const section =
        extractSection(text);

    const mcqMode =
        hasMcqHeader(lines);

    const writtenMode =
        hasWrittenQuestionMarkers(
            lines
        );

    let mcq = [];
    let detailQuestions = [];

    /*
     * =========================
     * MCQ PAPER
     * =========================
     */
    if (mcqMode) {
        const mcqBlocks =
            parseMcqBlocks(
                lines
            );

        const parsedMcqs =
            mcqBlocks
                .map(
                    classifyBlock
                )
                .filter(
                    (question) =>
                        question &&
                        question.type ===
                        "mcq"
                );

        mcq =
            parsedMcqs.map(
                (question) => ({
                    sr_number:
                        question.sr_number,

                    statement:
                        question.statement,

                    options:
                        question.options,

                    correctOption: "",
                })
            );
    }

    /*
     * =========================
     * WRITTEN PAPER
     * =========================
     */
    if (writtenMode) {
        const writtenBlocks =
            parseWrittenBlocks(
                lines
            );

        const parsedWritten =
            writtenBlocks
                .map(
                    classifyBlock
                )
                .filter(
                    (question) =>
                        question
                );

        detailQuestions =
            parsedWritten
                .filter(
                    (question) =>
                        question.type ===
                        "detail"
                )
                .map(
                    (question) => ({
                        sr_number:
                            question.sr_number,

                        statement:
                            question.statement,
                    })
                );

        /*
         * A paper may contain both MCQs
         * and written questions. If there
         * is a written section but the
         * MCQ header wasn't detected,
         * don't destroy the MCQs that
         * were already found.
         */
    }

    /*
     * If no MCQ header was detected,
     * still inspect numbered questions
     * for MCQ-like options.
     *
     * This supports papers where the
     * OCR failed to read "MCQ".
     */
    if (!mcqMode) {
        const numberedBlocks =
            parseMcqBlocks(
                lines
            );

        const possibleMcqs =
            numberedBlocks
                .map(
                    classifyBlock
                )
                .filter(
                    (question) =>
                        question &&
                        question.type ===
                        "mcq"
                );

        if (
            possibleMcqs.length > 0
        ) {
            mcq =
                possibleMcqs.map(
                    (question) => ({
                        sr_number:
                            question.sr_number,

                        statement:
                            question.statement,

                        options:
                            question.options,

                        correctOption:
                            "",
                    })
                );
        }
    }

    /*
     * Find the first question line for
     * instruction extraction.
     */
    const firstQuestionIndex =
        lines.findIndex(
            (line) =>
                detectWrittenQuestion(
                    line
                ) !== null ||
                detectNumberedMcq(
                    line
                ) !== null
        );

    const instruction =
        extractInstruction(
            lines,
            firstQuestionIndex
        );

    const name =
        extractName(
            lines,
            year
        );

    return {
        name,
        year,
        instruction,
        section,
        mcq,
        detailQuestions,
    };
};