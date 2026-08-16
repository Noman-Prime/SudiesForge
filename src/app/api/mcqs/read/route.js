import { getAllReadMcqs } from "@/controllers/mcqs"

export const dynamic = "force-dynamic"
export const revalidate = 0

export const GET = async () => {
    return getAllReadMcqs()
}