const normalizeOcrArtifacts = (text = "") => {
    return text
        // Common OCR corruption around option labels.
        .replace(/\(\s*A[TYQ]\s*/gi, "(A) ")
        .replace(/\(\s*B[8G]\s*/gi, "(B) ")
        .replace(/\(\s*C[©GQ]\s*/gi, "(C) ")
        .replace(/\(\s*D[0QRP]\s*/gi, "(D) ")

        // OCR may use ] or } instead of ).
        .replace(/\(\s*A\s*[\]}]\s*/gi, "(A) ")
        .replace(/\(\s*B\s*[\]}]\s*/gi, "(B) ")
        .replace(/\(\s*C\s*[\]}]\s*/gi, "(C) ")
        .replace(/\(\s*D\s*[\]}]\s*/gi, "(D) ")

        // More malformed OCR variants.
        .replace(/\(\s*A[TYQ]\s+/gi, "(A) ")
        .replace(/\(\s*B[8G]\s+/gi, "(B) ")
        .replace(/\(\s*C[©GQ]\s+/gi, "(C) ")
        .replace(/\(\s*D[0QRP]\s+/gi, "(D) ")

        // Normalize whitespace.
        .replace(/[ \t]+/g, " ");
};

const normalizeText = (text = "") => {
    return normalizeOcrArtifacts(
        text
            .replace(/\r/g, "")
            .replace(/\u00a0/g, " ")
            .replace(/\|/g, " ")
            .replace(/[ \t]+/g, " ")
            .trim()
    );
};

const cleanLine = (line = "") => {
    return normalizeOcrArtifacts(line)
        .replace(/\u00a0/g, " ")
        .replace(/[ \t]+/g, " ")
        .trim();
};

const isValidYear = (year) => {
    return (
        Number.isInteger(year) &&
        year >= 1900 &&
        year <= new Date().getFullYear() + 1
    );
};

/*
 * --------------------------------------------------
 * YEAR
 * --------------------------------------------------
 */

const extractYear = (
    text = "",
    lines = []
) => {
    /*
     * 1. Look in the top/header area first.
     */
    const header = lines
        .slice(0, 12)
        .join(" ");

    const headerMatches =
        header.match(
            /\b(19\d{2}|20\d{2})\b/g
        );

    if (headerMatches?.length) {
        for (const value of headerMatches) {
            const year = Number(value);

            if (isValidYear(year)) {
                return year;
            }
        }
    }

    /*
     * 2. Explicit year/exam/paper wording.
     */
    const explicitPattern =
        /(?:year|exam|examination|paper|css)[^0-9]{0,40}(19\d{2}|20\d{2})\b/gi;

    let match;

    while (
        (match =
            explicitPattern.exec(text)) !== null
    ) {
        const year = Number(match[1]);

        if (isValidYear(year)) {
            return year;
        }
    }

    /*
     * 3. CSS + year.
     */
    const cssMatch =
        text.match(
            /\bCSS\b[^0-9]{0,30}(19\d{2}|20\d{2})\b/i
        );

    if (cssMatch) {
        const year = Number(cssMatch[1]);

        if (isValidYear(year)) {
            return year;
        }
    }

    return null;
};

/*
 * --------------------------------------------------
 * PAPER NAME
 * --------------------------------------------------
 */

const extractName = (
    lines = [],
    year = null
) => {
    const candidates = [];

    for (
        const rawLine of lines.slice(0, 20)
    ) {
        const line = cleanLine(rawLine);

        if (!line) {
            continue;
        }

        const lower =
            line.toLowerCase();

        /*
         * Ignore phone/social UI.
         */
        if (
            /^\d{1,2}:\d{2}/.test(line) ||
            lower.includes("facebook") ||
            lower.includes("share") ||
            lower.includes("save") ||
            lower.includes("©")
        ) {
            continue;
        }

        if (
            lower.startsWith("note") ||
            lower.includes("instruction")
        ) {
            continue;
        }

        if (
            /^part\s*[-:]?\s*(i|ii|iii|iv|v|1|2|3|4|5)\b/i.test(
                line
            )
        ) {
            continue;
        }

        if (
            line.length < 5 ||
            line.length > 160
        ) {
            continue;
        }

        candidates.push(line);
    }

    /*
     * Prefer recognizable title.
     */
    const preferred =
        candidates.find((line) => {
            const lower =
                line.toLowerCase();

            return (
                lower.includes(
                    "pakistan affairs"
                ) ||
                lower.includes(
                    "general knowledge"
                ) ||
                lower.includes("css")
            );
        });

    let name =
        preferred ||
        candidates[0] ||
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

/*
 * --------------------------------------------------
 * SECTION
 * --------------------------------------------------
 */

const extractSection = (
    text = ""
) => {
    const part =
        text.match(
            /\bPART\s*[-:]?\s*(I|II|III|IV|V|\d+)\b/i
        );

    if (part) {
        return part[1].toUpperCase();
    }

    const section =
        text.match(
            /\bSECTION\s*[-:]?\s*([A-Z0-9]+)\b/i
        );

    if (section) {
        return section[1].toUpperCase();
    }

    return "";
};

/*
 * --------------------------------------------------
 * MCQ SECTION DETECTION
 * --------------------------------------------------
 */

const detectMcqMode = (
    lines = []
) => {
    const header =
        lines
            .slice(0, 35)
            .join(" ")
            .toLowerCase();

    return (
        header.includes("mcq") ||
        header.includes("mcqs") ||
        header.includes("omr") ||
        header.includes("answer sheet") ||
        header.includes("20x1") ||
        header.includes("best option")
    );
};

/*
 * --------------------------------------------------
 * QUESTION NUMBER NORMALIZATION
 * --------------------------------------------------
 */

const normalizeQuestionNumber = (
    value,
    previousNumber = null
) => {
    const token =
        String(value || "")
            .trim()
            .toLowerCase();

    /*
     * Normal number.
     */
    if (
        /^\d+$/.test(token)
    ) {
        const number =
            Number(token);

        if (
            number >= 1 &&
            number <= 999
        ) {
            return number;
        }
    }

    /*
     * Common OCR mistakes.
     *
     * 5 -> s
     * 6 -> a
     * 7 -> t
     * 8 -> b
     * 9 -> g
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

        /*
         * If OCR generated a number that
         * goes backwards, use the next
         * sequential number.
         */
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
 * --------------------------------------------------
 * WRITTEN QUESTION MARKER
 * --------------------------------------------------
 */

const detectWrittenQuestion = (
    line = "",
    previousNumber = null
) => {
    let match;

    /*
     * Q-No2
     * Q.No.3
     * QNo4
     */
    match = line.match(
        /^\s*Q\s*[-.]?\s*No\s*[-.]?\s*([0-9A-Za-z?]+)\s*/i
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

                text:
                    line
                        .slice(match[0].length)
                        .trim(),
            };
        }
    }

    /*
     * Question 5
     */
    match = line.match(
        /^\s*Question\s*[-.:]?\s*([0-9A-Za-z?]+)\s*/i
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

                text:
                    line
                        .slice(match[0].length)
                        .trim(),
            };
        }
    }

    /*
     * Q6 / Q-6 / Q.6
     */
    match = line.match(
        /^\s*Q\s*[-.:]?\s*([0-9A-Za-z?]+)\s*/i
    );

    if (match) {
        const lower =
            line.toLowerCase();

        /*
         * Q1 is often the MCQ instruction.
         */
        if (
            Number(match[1]) === 1 &&
            (
                lower.includes(
                    "select the best option"
                ) ||
                lower.includes("omr") ||
                lower.includes("mcq") ||
                lower.includes(
                    "appropriate box"
                )
            )
        ) {
            return null;
        }

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

                text:
                    line
                        .slice(match[0].length)
                        .trim(),
            };
        }
    }

    return null;
};

/*
 * --------------------------------------------------
 * NUMBERED MCQ
 * --------------------------------------------------
 *
 * Detect:
 *
 * 1. Question
 * 2) Question
 * 3, Question
 * 4: Question
 * 5; Question
 */

const detectNumberedMcq = (
    line = ""
) => {
    const match =
        line.match(
            /^\s*(\d{1,3})\s*[\.,:;)]\s*(.*)$/
        );

    if (!match) {
        return null;
    }

    const number =
        Number(match[1]);

    if (
        number < 1 ||
        number > 200
    ) {
        return null;
    }

    return {
        number,

        text:
            match[2]?.trim() || "",
    };
};

/*
 * --------------------------------------------------
 * INLINE OPTIONS
 * --------------------------------------------------
 *
 * Supports:
 *
 * (A) Ravi (B) Indus
 * A) Ravi B) Indus
 * A. Ravi B. Indus
 * A: Ravi B: Indus
 */

const extractInlineOptions = (
    text = ""
) => {
    const options = [];

    const matches = [];

    /*
     * Strong pattern for parenthesized labels.
     *
     * (A)
     * (B)
     * (C)
     * (D)
     */
    const parenthesisRegex =
        /\(([A-Da-d])\)\s*/g;

    let match;

    while (
        (match =
            parenthesisRegex.exec(text)) !==
        null
    ) {
        matches.push({
            label:
                match[1].toUpperCase(),

            start:
                match.index,

            end:
                parenthesisRegex.lastIndex,
        });
    }

    /*
     * If that did not find enough options,
     * try A), A., A:, A-
     */
    if (matches.length < 2) {
        const letterRegex =
            /(?:^|\s)([A-Da-d])\s*[\)\.\:\-]\s+/g;

        let letterMatch;

        while (
            (letterMatch =
                letterRegex.exec(text)) !== null
        ) {
            matches.push({
                label:
                    letterMatch[1].toUpperCase(),

                /*
                 * letterRegex includes the
                 * preceding whitespace.
                 */
                start:
                    letterMatch.index,

                end:
                    letterRegex.lastIndex,
            });
        }
    }

    /*
     * Sort by position.
     */
    matches.sort(
        (a, b) =>
            a.start - b.start
    );

    /*
     * Remove duplicate positions.
     */
    const uniqueMatches = [];

    for (
        const item of matches
    ) {
        const duplicate =
            uniqueMatches.some(
                (existing) =>
                    existing.start ===
                    item.start &&
                    existing.label ===
                    item.label
            );

        if (!duplicate) {
            uniqueMatches.push(item);
        }
    }

    /*
     * Need at least two options
     * before treating text as inline MCQ.
     */
    if (
        uniqueMatches.length < 2
    ) {
        return {
            statement: text.trim(),
            options: [],
        };
    }

    const statement =
        text
            .slice(
                0,
                uniqueMatches[0].start
            )
            .trim();

    for (
        let index = 0;
        index < uniqueMatches.length;
        index += 1
    ) {
        const current =
            uniqueMatches[index];

        const next =
            uniqueMatches[index + 1];

        const end =
            next
                ? next.start
                : text.length;

        const optionText =
            text
                .slice(
                    current.end,
                    end
                )
                .trim()
                .replace(
                    /\s+/g,
                    " "
                );

        if (
            optionText
        ) {
            options.push({
                option_number:
                    current.label,

                option_text:
                    optionText,
            });
        }
    }

    /*
     * Don't return malformed duplicate labels.
     */
    const cleanedOptions = [];

    for (
        const option of options
    ) {
        const exists =
            cleanedOptions.some(
                (item) =>
                    item.option_number ===
                    option.option_number
            );

        if (!exists) {
            cleanedOptions.push(
                option
            );
        }
    }

    return {
        statement,

        options:
            cleanedOptions,
    };
};

/*
 * --------------------------------------------------
 * LINE OPTIONS
 * --------------------------------------------------
 */

const getSingleLineOption = (
    line = ""
) => {
    const patterns = [
        /*
         * (A) text
         */
        /^\s*\(([A-Da-d])\)\s*(.+)$/,

        /*
         * (A) - text
         */
        /^\s*\(([A-Da-d])\)\s*[-.:]?\s*(.+)$/,

        /*
         * A) text
         * A. text
         * A: text
         * A- text
         */
        /^\s*([A-Da-d])\s*[\).:\-]\s*(.+)$/,

        /*
         * A text
         *
         * Only use this as the final fallback.
         */
        /^\s*([A-Da-d])\s{2,}(.+)$/,
    ];

    for (
        const pattern of patterns
    ) {
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

/*
 * --------------------------------------------------
 * MCQ BLOCK PARSER
 * --------------------------------------------------
 */

const parseMcqBlocks = (
    lines = []
) => {
    const blocks = [];

    let current = null;

    for (
        const rawLine of lines
    ) {
        const line =
            cleanLine(rawLine);

        if (!line) {
            continue;
        }

        const lower =
            line.toLowerCase();

        /*
         * Ignore social/browser text.
         */
        if (
            lower === "facebook" ||
            lower.includes("share") ||
            lower.includes("save")
        ) {
            continue;
        }

        /*
         * Skip Q.1 MCQ instruction heading.
         */
        if (
            /^\s*Q\s*[:.]?\s*1\s*[.)]?\s*/i.test(
                line
            ) &&
            (
                lower.includes("select") ||
                lower.includes("best option") ||
                lower.includes("omr") ||
                lower.includes("appropriate box")
            )
        ) {
            continue;
        }

        const numbered =
            detectNumberedMcq(
                line
            );

        if (numbered) {
            /*
             * Ignore instruction heading
             * accidentally detected as Q1.
             */
            if (
                numbered.number === 1 &&
                (
                    lower.includes(
                        "select the best option"
                    ) ||
                    lower.includes("omr") ||
                    lower.includes(
                        "appropriate box"
                    )
                )
            ) {
                continue;
            }

            /*
             * Save previous block.
             */
            if (current) {
                blocks.push(current);
            }

            /*
             * Start new block.
             */
            current = {
                sr_number:
                    numbered.number,

                lines: [],
            };

            if (
                numbered.text
            ) {
                current.lines.push(
                    numbered.text
                );
            }

            continue;
        }

        /*
         * Continuation/options of current MCQ.
         */
        if (current) {
            current.lines.push(
                line
            );
        }
    }

    /*
     * Save last block.
     */
    if (current) {
        blocks.push(current);
    }

    return blocks;
};

/*
 * --------------------------------------------------
 * WRITTEN BLOCK PARSER
 * --------------------------------------------------
 */

const parseWrittenBlocks = (
    lines = []
) => {
    const blocks = [];

    let current = null;
    let previousNumber = null;

    for (
        const rawLine of lines
    ) {
        const line =
            cleanLine(rawLine);

        if (!line) {
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
                blocks.push(
                    current
                );
            }

            current = {
                sr_number:
                    detected.number,

                lines: [],
            };

            if (
                detected.text
            ) {
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
        blocks.push(current);
    }

    return blocks;
};

/*
 * --------------------------------------------------
 * MCQ BLOCK PARSER
 * --------------------------------------------------
 */

const parseMcqBlock = (
    block
) => {
    const originalLines =
        block.lines
            .map(cleanLine)
            .filter(Boolean);

    if (
        !originalLines.length
    ) {
        return null;
    }

    /*
     * --------------------------------------------------
     * First attempt:
     * detect options line-by-line.
     * --------------------------------------------------
     */

    const statementLines = [];
    const lineOptions = [];

    for (
        const line of originalLines
    ) {
        const option =
            getSingleLineOption(
                line
            );

        if (option) {
            lineOptions.push(
                option
            );
        } else {
            statementLines.push(
                line
            );
        }
    }

    let statement = "";
    let options = [];

    /*
     * If at least two options were
     * detected independently, trust
     * line structure.
     */
    if (
        lineOptions.length >= 2
    ) {
        statement =
            statementLines
                .join(" ")
                .replace(
                    /\s+/g,
                    " "
                )
                .trim();

        options =
            lineOptions;
    } else {
        /*
         * --------------------------------------------------
         * Second attempt:
         * inline option parsing.
         * --------------------------------------------------
         */

        const fullText =
            originalLines
                .join(" ")
                .replace(
                    /\s+/g,
                    " "
                )
                .trim();

        const inline =
            extractInlineOptions(
                fullText
            );

        statement =
            inline.statement;

        options =
            inline.options;
    }

    if (!statement) {
        return null;
    }

    /*
     * Remove common mark expressions.
     */
    statement =
        statement
            .replace(
                /\s*[\(\[\{]\s*\d{1,3}(?:\s*x\s*\d{1,3})?(?:\s*=\s*\d{1,3})?\s*[\)\]\}]\s*$/gi,
                ""
            )
            .trim();

    /*
     * Normalize option text.
     */
    options =
        options
            .map((option) => ({
                option_number:
                    option.option_number,

                option_text:
                    option.option_text
                        .replace(
                            /\s+/g,
                            " "
                        )
                        .trim(),
            }))
            .filter(
                (option) =>
                    option.option_text
            );

    /*
     * Remove duplicate option labels.
     */
    const uniqueOptions = [];

    for (
        const option of options
    ) {
        const exists =
            uniqueOptions.some(
                (item) =>
                    item.option_number ===
                    option.option_number
            );

        if (!exists) {
            uniqueOptions.push(
                option
            );
        }
    }

    return {
        type: "mcq",

        sr_number:
            block.sr_number,

        statement,

        options:
            uniqueOptions,

        correctOption: "",
    };
};

/*
 * --------------------------------------------------
 * WRITTEN BLOCK PARSER
 * --------------------------------------------------
 */

const parseWrittenBlock = (
    block
) => {
    let statement =
        block.lines
            .join(" ")
            .replace(
                /\s+/g,
                " "
            )
            .trim();

    statement =
        statement
            .replace(
                /\s*[\(\[\{]\s*\d{1,3}\s*[\)\]\}]\s*$/g,
                ""
            )
            .trim();

    if (!statement) {
        return null;
    }

    return {
        type: "detail",

        sr_number:
            block.sr_number,

        statement,
    };
};

/*
 * --------------------------------------------------
 * INSTRUCTIONS
 * --------------------------------------------------
 */

const extractInstruction = (
    lines = []
) => {
    const result = [];

    let collectingNote = false;

    for (
        const line of lines.slice(
            0,
            30
        )
    ) {
        const lower =
            line.toLowerCase();

        if (
            lower.startsWith("note") ||
            lower.includes("note:")
        ) {
            collectingNote = true;

            result.push(line);

            continue;
        }

        if (collectingNote) {
            if (
                lower === "facebook" ||
                lower.includes("share") ||
                lower.includes("save")
            ) {
                continue;
            }

            /*
             * Stop once actual numbered MCQs start.
             *
             * Supports:
             * 1.
             * 1)
             * 1,
             * 1:
             */
            if (
                /^\s*\d{1,3}\s*[\.,:;)]\s+/.test(
                    line
                )
            ) {
                break;
            }

            result.push(line);

            continue;
        }

        if (
            lower.includes("instruction") ||
            lower.includes("attempt") ||
            lower.includes("select") ||
            lower.includes("choose") ||
            lower.includes("answer")
        ) {
            result.push(line);
        }
    }

    return result
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
};

/*
 * --------------------------------------------------
 * MCQ SEQUENCE RECOVERY
 * --------------------------------------------------
 *
 * If OCR loses a question number:
 *
 * 14
 * 15
 * [damaged question]
 * 17
 *
 * infer the missing 16.
 *
 * We only do this when there is
 * exactly one missing number.
 */

const recoverMissingMcqNumbers = (
    questions = []
) => {
    if (
        questions.length < 3
    ) {
        return questions;
    }

    const result = [...questions];

    for (
        let index = 1;
        index < result.length - 1;
        index += 1
    ) {
        const previous =
            result[index - 1];

        const current =
            result[index];

        const next =
            result[index + 1];

        if (
            previous.sr_number + 2 ===
            next.sr_number
        ) {
            /*
             * Only repair if current number
             * is obviously wrong or duplicated.
             */
            if (
                current.sr_number ===
                previous.sr_number ||
                current.sr_number ===
                next.sr_number
            ) {
                current.sr_number =
                    previous.sr_number + 1;
            }
        }
    }

    return result;
};

/*
 * --------------------------------------------------
 * MCQ DUPLICATE CLEANUP
 * --------------------------------------------------
 */

const removeDuplicateQuestions = (
    questions = []
) => {
    const result = [];
    const seen = new Set();

    for (
        const question of questions
    ) {
        const key =
            `${question.sr_number}|${question.statement}`
                .toLowerCase()
                .replace(/\s+/g, " ")
                .trim();

        if (
            seen.has(key)
        ) {
            continue;
        }

        seen.add(key);
        result.push(question);
    }

    return result;
};

/*
 * --------------------------------------------------
 * MAIN PARSER
 * --------------------------------------------------
 */

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

    const lines =
        text
            .split("\n")
            .map(cleanLine)
            .filter(Boolean);

    /*
     * Detect MCQ mode.
     */
    const mcqMode =
        detectMcqMode(lines);

    /*
     * Extract metadata.
     */
    const year =
        extractYear(
            text,
            lines
        );

    const section =
        extractSection(text);

    const name =
        extractName(
            lines,
            year
        );

    let mcq = [];
    let detailQuestions = [];

    /*
     * ------------------------------------------------
     * CASE 1:
     * MCQ PAPER
     * ------------------------------------------------
     */

    if (mcqMode) {
        const blocks =
            parseMcqBlocks(
                lines
            );

        mcq =
            blocks
                .map(
                    parseMcqBlock
                )
                .filter(Boolean)
                .map(
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

        /*
         * Try to recover missing sequence
         * numbers.
         */
        mcq =
            recoverMissingMcqNumbers(
                mcq
            );

        /*
         * Remove exact duplicates.
         */
        mcq =
            removeDuplicateQuestions(
                mcq
            );

        /*
         * ------------------------------------------------
         * Check for written section.
         * ------------------------------------------------
         */

        const hasWrittenMarkers =
            lines.some(
                (line) => {
                    const detected =
                        detectWrittenQuestion(
                            line
                        );

                    if (!detected) {
                        return false;
                    }

                    const lower =
                        line.toLowerCase();

                    /*
                     * Don't count MCQ
                     * instruction heading.
                     */
                    if (
                        lower.includes("select") ||
                        lower.includes(
                            "best option"
                        ) ||
                        lower.includes("omr") ||
                        lower.includes(
                            "appropriate box"
                        )
                    ) {
                        return false;
                    }

                    return true;
                }
            );

        if (
            hasWrittenMarkers
        ) {
            const writtenBlocks =
                parseWrittenBlocks(
                    lines
                );

            detailQuestions =
                writtenBlocks
                    .map(
                        parseWrittenBlock
                    )
                    .filter(Boolean)
                    .map(
                        (question) => ({
                            sr_number:
                                question.sr_number,

                            statement:
                                question.statement,
                        })
                    );
        }
    } else {
        /*
         * ------------------------------------------------
         * CASE 2:
         * WRITTEN PAPER
         * ------------------------------------------------
         */

        const blocks =
            parseWrittenBlocks(
                lines
            );

        detailQuestions =
            blocks
                .map(
                    parseWrittenBlock
                )
                .filter(Boolean)
                .map(
                    (question) => ({
                        sr_number:
                            question.sr_number,

                        statement:
                            question.statement,
                    })
                );

        /*
         * ------------------------------------------------
         * CASE 3:
         * OCR missed MCQ header
         * ------------------------------------------------
         */

        if (
            detailQuestions.length === 0
        ) {
            const possibleMcqBlocks =
                parseMcqBlocks(
                    lines
                );

            mcq =
                possibleMcqBlocks
                    .map(
                        parseMcqBlock
                    )
                    .filter(
                        (question) =>
                            question &&
                            question.options
                                .length >= 2
                    )
                    .map(
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

            mcq =
                recoverMissingMcqNumbers(
                    mcq
                );

            mcq =
                removeDuplicateQuestions(
                    mcq
                );
        }
    }

    /*
     * ------------------------------------------------
     * INSTRUCTION
     * ------------------------------------------------
     */

    const instruction =
        extractInstruction(
            lines
        );

    /*
     * ------------------------------------------------
     * FINAL RESULT
     * ------------------------------------------------
     */

    return {
        name,
        year,
        instruction,
        section,
        mcq,
        detailQuestions,
    };
};