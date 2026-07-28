import axios from "axios";

const getEvents = async () => {
    try {
        const result = await axios.get("/api/events")
        if (result.data.success) {
            console.log(result.data.event);
            return result.data.event
        }
        return []
    } catch (error) {
        console.log(error.response?.data?.message);
        return []
    }
}

export default getEvents