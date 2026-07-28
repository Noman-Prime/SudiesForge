import connect from "@/lib/db"
import user from "@/models/user"
import { NextRequest, NextResponse } from "next/server"


export const createUser = async (req) => {
    try {
        await connect()
        const body = await req.json()
        const User = await user.create(body)
        if (!User) {
            return NextResponse.json({
                success: false,
                message: "Please Enter a valid data"
            }, { status: 404 })
        }
        return NextResponse.json({
            success: true,
            user: User
        }, { status: 201 })
    } catch (error) {
        console.log(error);
        return NextResponse.json({
            success: false,
            message: "Something went wrong"
        }, { status: 500 })
    }
}