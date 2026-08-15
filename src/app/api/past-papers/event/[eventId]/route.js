import { eventByPastPapers } from "@/controllers/pastpaper"

export const dynamic = "force-dynamic"
export const revalidate = 0

export const GET = async (req, { params }) => {
    const { eventId } = await params

    return eventByPastPapers(req, eventId)
}