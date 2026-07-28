import mongoose from "mongoose"
const connect = async() =>{
    try {
        const result = await mongoose.connect(process.env.DB_URL)
        if(result){
            console.log("Database is active")
        }
    } catch (error) {
        console.log(error);
        console.log("Database is not connected")
    }
}

export default connect