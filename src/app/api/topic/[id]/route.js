
import { deleteTopic, getTopic, updateTopic } from "@/controllers/topic"
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

    return updateTopic(req, id)
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

    return deleteTopic(req, id)
}

export const GET = async (req, { params }) =>{
    const { id } = await params

    return getTopic(req, id)
}

