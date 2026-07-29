import { createUser } from "@/controllers/user"
import { isAuthenticated } from "@/lib/auth"
import { NextResponse } from "next/server"

export const POST = async (req) => {
    return createUser(req)
}

export const GET = async (req) => {
    const auth = await isAuthenticated(req)
    if (!auth.user) {
        return auth
    }
    return NextResponse.json({
        success: true,
        user: auth.user
    }, { status: 200 })
}
