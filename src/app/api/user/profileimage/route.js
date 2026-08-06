import { profileImage } from "@/controllers/user"
import { isAuthenticated } from "@/lib/auth"

export const POST = async (req)=>{
    const auth = await isAuthenticated(req)
    if(!auth.user){
        return auth
    }
    return profileImage(req, auth.user._id)
}