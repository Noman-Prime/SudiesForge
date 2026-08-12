import mongoose from "mongoose";

const connect = async () => {
    try {
        if (!process.env.DB_URL) {
            throw new Error("DB_URL is missing");
        }

        const connection = await mongoose.connect(
            process.env.DB_URL,
            {
                maxPoolSize: 10,
                serverSelectionTimeoutMS: 5000,
            },
        );

        console.log("Database is connected");

        return connection;
    } catch (error) {
        console.error(
            "Database is not connected:",
            error,
        );

        throw error;
    }
};

export default connect;