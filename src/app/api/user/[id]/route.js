import { deleteUser, getUser, updateUser } from "@/controllers/user"
import { isAdmin, isAuthenticated } from "@/lib/auth"
import { NextResponse } from "next/server"

export const GET = async (req, { params }) => {
    const { id } = await params

    const auth = await isAuthenticated(req)

    if (!auth.user) {
        return auth
    }

    const isOwner = String(auth.user._id) === String(id)

    if (!isOwner) {
        const admin = isAdmin("admin")(auth.user)

        if (admin) {
            return admin
        }
    }

    return getUser(req, id)
}

export const PUT = async (req, { params }) => {
    const { id } = await params

    const auth = await isAuthenticated(req)

    if (!auth.user) {
        return auth
    }

    const isOwner = String(auth.user._id) === String(id)

    if (!isOwner) {
        return NextResponse.json({
            success: false,
            message: "You can only update your own profile"
        }, { status: 403 })
    }

    return updateUser(req, id)
}

export const DELETE = async (req, { params }) => {
    const { id } = await params

    const auth = await isAuthenticated(req)

    if (!auth.user) {
        return auth
    }

    const isOwner = String(auth.user._id) === String(id)

    if (isOwner) {
        if (auth.user.role === "admin") {
            return NextResponse.json({
                success: false,
                message: "You cannot delete your own admin account"
            }, { status: 400 })
        }

        return deleteUser(id, true)
    }

    const admin = isAdmin("admin")(auth.user)

    if (admin) {
        return admin
    }

    return deleteUser(id)
}