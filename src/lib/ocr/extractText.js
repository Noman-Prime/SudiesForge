import path from "path";
import { createWorker } from "tesseract.js";
import sharp from "sharp";

const normalizeOcrOptionLabels = (text = "") => {
    return text
        .replace(/\(\s*8\s*\)/g, "(B)")
        .replace(/\(\s*Â©\s*\)/g, "(C)")
        .replace(/\(\s*Q\s*\)/g, "(D)")
        .replace(/\(\s*Â®\s*\)/g, "(B)")
        .replace(/\(\s*AY\s*/g, "(A)")
        .replace(/\(\s*AQ\s*/g, "(A)");
};

export const extractTextFromImage = async (buffer) => {
    const processedImage = await sharp(buffer)
        .rotate()
        .resize({
            width: 2400,
            withoutEnlargement: false,
        })
        .grayscale()
        .normalize()
        .sharpen({
            sigma: 1.2,
        })
        .png()
        .toBuffer();

    const workerPath = path.join(
        process.cwd(),
        "node_modules",
        "tesseract.js",
        "src",
        "worker-script",
        "node",
        "index.js"
    );

    const worker = await createWorker("eng", 1, {
        workerPath,
    });

    try {
        await worker.setParameters({
            tessedit_pageseg_mode: "6",
            preserve_interword_spaces: "1",
        });

        const result = await worker.recognize(processedImage);

        return {
            text: normalizeOcrOptionLabels(result.data.text),
            confidence: result.data.confidence,
        };
    } finally {
        await worker.terminate();
    }
};