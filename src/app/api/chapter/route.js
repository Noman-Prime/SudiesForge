import { createChapter } from "@/controllers/chapter"
import { isAdmin, isAuthenticated } from "@/lib/auth"

export const POST = async (req) => {
    const auth = await isAuthenticated(req)
    if (!auth.user) {
        return auth
    }

    const admin = isAdmin("admin")(auth.user)
    if(admin){
        return admin
    }

    return createChapter(req)
}