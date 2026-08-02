import { login } from "@/controllers/user"
import { isAuthenticated } from "@/lib/auth"

export const POST = async(req)=>{
    return login(req)
}