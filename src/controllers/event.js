import connect from "@/lib/db";
import syncNavigation from "@/lib/syncNavigation";
import event from "@/models/event";
import { NextResponse } from "next/server";

export const createEvent = async (req) => {
    try {
        await connect()
        const body = await req.json();
        const Event = await event.create(body);
        await syncNavigation();
        return NextResponse.json({
            success: true,
            message: "Event is created",
            Event,
            navigationSynced: true
        }, { status: 201 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({
            success: false,
            message: "Something went wrong",
        }, { status: 500 });
    }
};

export const getAllEvents = async () => {
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
            length: Events.length,
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

export const getSingleEvent = async (id) => {
    try {
        await connect()
        const Event = await event.findById(id)
        if (!Event) {
            return NextResponse.json({
                success: false,
                message: "There is no Event find"
            }, { status: 404 })
        }
        return NextResponse.json({
            success: true,
            event: Event
        }, { status: 200 })
    } catch (error) {
        console.log(error);
        return NextResponse.json({
            success: false,
            message: "Something went wrong"
        }, { status: 500 })
    }
}

export const updateEvent = async (req, id) => {
    try {
        await connect()
        const body = await req.json()
        const Event = await event.findByIdAndUpdate(id, body, { new: true, runValidators: true })
        if (!Event) {
            return NextResponse.json({
                success: false,
                message: "No Event is found"
            }, { status: 404 })
        }
        await syncNavigation()
        return NextResponse.json({
            success: true,
            event: Event
        }, { status: 200 })
    } catch (error) {
        console.log(error);
        return NextResponse.json({
            success: false,
            message: "Something went wrong"
        }, { status: 500 })
    }
}

export const deleteEvent = async (id) => {
    try {
        await connect()
        const Event = await event.findByIdAndDelete(id)
        if (!Event) {
            return NextResponse.json({
                success: false,
                message: "No event is found"
            }, { status: 404 })
        }
        await syncNavigation()
        return NextResponse.json({
            success: true,
            message: "event is deleted"
        }, { status: 200 })
    } catch (error) {
        console.log(error);
        return NextResponse.json({
            success: false,
            message: "Something went wrong"
        }, { status: 500 })
    }
}