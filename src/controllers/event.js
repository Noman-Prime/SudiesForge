import connect from "@/lib/db";
import event from "@/models/event";
import { NextResponse } from "next/server";

export const createEvent = async(req) => {
    try {
        await connect()
        const body = await req.json();
        const Event = await event.create(body);
        return NextResponse.json({
            success: true,
            message: "Event is created",
            Event,
        }, { status: 201 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({
            success: false,
            message: "Something went wrong",
        }, { status: 500 });
    }
};

export const getAllEvents = async() => {
    try {
        await connect()
        const Events = await event.find()
        if (!Events || Events.length === 0) {
            return NextResponse.json({
                success: false,
                message: "No event is Found"
            }, { status: 404 })
        }
        return NextResponse.json({
            success: true,
            message: "All Events are given",
            lenght: Events.length,
            event: Events
        }, { status: 200 })
    } catch (error) {
        console.log(error);
        return NextResponse.json({
            success: false,
            message: "Something went wrong"
        }, { status: 500 })
    }
}