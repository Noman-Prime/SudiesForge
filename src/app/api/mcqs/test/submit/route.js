import { submitMcqTest } from "@/controllers/mcqs"

export const POST = async (req) => {
    return submitMcqTest(req)
}