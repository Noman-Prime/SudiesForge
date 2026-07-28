import { deleteEvent, getSingleEvent, updateEvent } from "@/controllers/event"

export const GET = async (_req, { params }) => {
    const { id } = await params
    return getSingleEvent(id)
}

export const PUT = async (req, { params }) => {
    const { id } = await params
    return updateEvent(req, id)
}

export const DELETE = async (_req, { params }) => {
    const { id } = await params
    return deleteEvent(id)
}