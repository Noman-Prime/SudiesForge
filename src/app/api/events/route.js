import { createEvent, getAllEvents } from "@/controllers/event"

export const POST = async(req) =>{
    return createEvent(req)
}

export const GET = async() =>{
    return getAllEvents()
}