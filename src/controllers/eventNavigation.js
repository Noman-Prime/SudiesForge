import connect from "@/lib/db"
import event from "@/models/event"
import mongoose from "mongoose"
import { NextResponse } from "next/server"

export const eventNavigation = async (req, id) => {
    try {
        await connect()

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({
                success: false,
                message: "Invalid event ID"
            }, { status: 400 })
        }

        const Event = await event.findById(id)

        if (!Event) {
            return NextResponse.json({
                success: false,
                message: "Event is not found"
            }, { status: 404 })
        }

        const database = mongoose.connection.db

        if (!database) {
            return NextResponse.json({
                success: false,
                message: "Database is unavailable"
            }, { status: 500 })
        }

        const eventId = new mongoose.Types.ObjectId(id)

        const collectionList = await database
            .listCollections({}, { nameOnly: true })
            .toArray()

        const collections = []

        for (const item of collectionList) {
            if (
                item.name.startsWith("system.") ||
                item.name === "events"
            ) {
                continue
            }

            const count = await database
                .collection(item.name)
                .countDocuments({
                    event: eventId
                })

            if (count === 0) {
                continue
            }

            const name = item.name
                .replace(/[-_]/g, " ")
                .replace(/\b\w/g, (character) =>
                    character.toUpperCase()
                )

            collections.push({
                key: item.name,
                name,
                count
            })
        }

        return NextResponse.json({
            success: true,
            eventName: Event.name,
            collection: collections
        }, { status: 200 })
    } catch (error) {
        console.log(error)

        return NextResponse.json({
            success: false,
            message: "Something went wrong"
        }, { status: 500 })
    }
}