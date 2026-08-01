import axios from "axios";

const getEvents = async () => {
    try {
        const result = await axios.get("/api/navigation")
        if (result.data.success) {
            return result.data.event
        }
        return []
    } catch (error) {
        console.log(error.response?.data?.message);
        return []
    }
}

export default getEvents