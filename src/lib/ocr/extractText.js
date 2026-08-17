import { createWorker } from "tesseract.js";
import path from "node:path";

export const extractTextFromImage = async (buffer) => {
    const workerPath = path.join(
        process.cwd(),
        "node_modules",
        "tesseract.js",
        "src",
        "worker-script",
        "node",
        "index.js"
    );

    const worker = await createWorker(
        "eng",
        1,
        {
            workerPath,
        }
    );

    try {
        const result = await worker.recognize(buffer);

        return {
            text: result.data.text,
            confidence: result.data.confidence,
        };
    } finally {
        await worker.terminate();
    }
};