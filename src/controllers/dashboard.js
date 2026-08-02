import connect from "@/lib/db"
import mongoose from "mongoose"
import { NextResponse } from "next/server"

export const deashbord = async (req) => {
    try {
        await connect()
        const database = mongoose.connection.db
        const collectionList = await database.listCollections({}, { nameOnly: true }).toArray()
        const collections = await Promise.all(
            collectionList
                .filter((item) => !item.name.startsWith("system."))
                .map(async (item) => {
                    const count = await database
                        .collection(item.name)
                        .estimatedDocumentCount();

                    const Name = item.name
                        .replace(/[-_]/g, " ")
                        .replace(/\b\w/g, (character) =>
                            character.toUpperCase()
                        );
                    return {
                        key: item.name,
                        name: Name,
                        count
                    };
                })
        );
        return NextResponse.json({
            success: true,
            collection: collections
        }, { status: 200 })
    } catch (error) {
        console.log(error);
        return NextResponse.json({
            success: false,
            message: "Something went Wrong"
        }, { status: 500 })

    }
}