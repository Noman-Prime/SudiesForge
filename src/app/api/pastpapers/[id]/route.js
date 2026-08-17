import { deletePastpaper, getPastpaper, updatePastpaper } from "@/controllers/pastpaper"
import { isAdmin, isAuthenticated } from "@/lib/auth"

export const PUT = async (req, { params }) =>{
    const { id } = await params
    const auth = await isAuthenticated(req)
    if(!auth.user){
        return auth
    }
    const admin = isAdmin("admin")(auth.user)
    if(admin){
        return admin
    }
    return updatePastpaper(req, id)
}

export const DELETE = async (req, { params }) =>{
    const { id } = await params
    const auth = await isAuthenticated(req)
    if(!auth.user){
        return auth
    }
    const admin = isAdmin("admin")(auth.user)
    if(admin){
        return admin
    }
    return deletePastpaper(req, id)
}

export const GET = async (req, { params }) =>{
    const { id } = await params
    return getPastpaper(req, id)
}