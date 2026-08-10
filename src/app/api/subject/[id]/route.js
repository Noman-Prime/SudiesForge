import { deleteSubject, getSubject, updateSubject } from "@/controllers/subjects"
import { isAdmin, isAuthenticated } from "@/lib/auth"

export const PUT = async (req, { params }) => {
    const { id } = await params

    const auth = await isAuthenticated(req)
    if (!auth.user) {
        return auth
    }

    const admin = isAdmin("admin")(auth.user)
    if (admin) {
        return admin
    }

    return updateSubject(req, id)
}

export const GET = async (_req, { params }) => {
    const { id } = await params

    return getSubject(_req, id)

}

export const DELETE = async (req, { params }) => {
    const { id } = await params

    const auth = await isAuthenticated(req)
    if (!auth.user) {
        return auth
    }

    const admin = isAdmin("admin")(auth.user)
    if (admin) {
        return admin
    }

    return deleteSubject(req, id)
}