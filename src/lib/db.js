import mongoose from "mongoose";

const connect = async () => {
    if (!process.env.DB_URL) {
        throw new Error(
            "DB_URL environment variable is missing",
        );
    }

    try {
        const connection = await mongoose.connect(
            process.env.DB_URL,
            {
                maxPoolSize: 1,
                minPoolSize: 0,
                maxIdleTimeMS: 10000,
                serverSelectionTimeoutMS: 5000,
                connectTimeoutMS: 5000,
                socketTimeoutMS: 10000,
            },
        );

        console.log("Database is active");

        return connection;
    } catch (error) {
        console.error(
            "Database connection failed:",
            error,
        );

        throw error;
    }
};

export default connect;