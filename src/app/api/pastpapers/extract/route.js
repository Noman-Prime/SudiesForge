import { NextResponse } from "next/server";
import { extractTextFromImage } from "@/lib/ocr/extractText";
import { parsePastPaperText } from "@/lib/ocr/parsePastPaper";

export const runtime = "nodejs";

export async function POST(req) {
    try {
        const formData = await req.formData();
        const file = formData.get("image");

        if (!file) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Image is required",
                },
                { status: 400 }
            );
        }

        if (!file.type?.startsWith("image/")) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Only image files are allowed",
                },
                { status: 400 }
            );
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const ocrResult =
            await extractTextFromImage(buffer);

        const paperData =
            parsePastPaperText(
                ocrResult.text
            );

        console.log(
            "OCR text:",
            ocrResult.text
        );

        console.log(
            "Parsed paper:",
            paperData
        );

        return NextResponse.json(
            {
                success: true,
                message:
                    "Paper extracted successfully",
                data: paperData,
                ocr: {
                    confidence:
                        ocrResult.confidence,
                    text: ocrResult.text,
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error(
            "OCR extraction error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    error.message ||
                    "Failed to extract past paper",
            },
            { status: 500 }
        );
    }
}