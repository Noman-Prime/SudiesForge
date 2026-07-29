import user from "@/models/user"
import jwt from "jsonwebtoken"
import { NextResponse } from "next/server"
import connect from "./db"

export const isAuthenticated = async (req) => {
    try {
        const token = req.cookies.get("token")?.value
        if (!token) {
            return NextResponse.json({
                success: false,
                message: "Please login"
            }, { status: 401 })
        }
        const decoded = jwt.verify(token, process.env.USER_SECRET)
        await connect()
        const verified = await user.findById(decoded.id)
        if (!verified) {
            return NextResponse.json({
                success: false,
                message: "Please Login"
            }, { status: 401 })
        }
        return { user: verified }
    } catch (error) {
        console.log(error);
        return NextResponse.json({
            success: false,
            message: "Something went wrong"
        }, { status: 500 })
    }
}

export const isAdmin = (...role) => {
    return (authenticatedUser) => {
        if (!role.includes(authenticatedUser.role)) {
            return NextResponse.json({
                success: false,
                message: "You'r not Allowed"
            }, { status: 403 })
        }
        return null
    }

}

