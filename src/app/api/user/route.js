import { createUser } from "@/controllers/user"

export const POST = async(req)=>{
    return createUser(req)
}