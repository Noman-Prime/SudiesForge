import { login } from "@/controllers/user"

export const POST = async(req)=>{
    return login(req)
}