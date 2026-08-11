import mongoose from "mongoose"

const databaseCache =
    globalThis.studiesForgeDatabase || {
        connection: null,
        promise: null
    }

globalThis.studiesForgeDatabase = databaseCache

const connect = async () => {
    if (!process.env.DB_URL) {
        throw new Error("DB_URL environment variable is missing")
    }

    if (
        databaseCache.connection &&
        mongoose.connection.readyState === 1
    ) {
        return databaseCache.connection
    }

    if (!databaseCache.promise) {
        databaseCache.promise = mongoose.connect(
            process.env.DB_URL,
            {
                maxPoolSize: 5,
                minPoolSize: 0,
                serverSelectionTimeoutMS: 10000,
                connectTimeoutMS: 10000,
                socketTimeoutMS: 30000,
                family: 4
            }
        )
    }

    try {
        databaseCache.connection =
            await databaseCache.promise

        console.log("Database is active")

        return databaseCache.connection
    } catch (error) {
        databaseCache.connection = null
        databaseCache.promise = null

        console.log("Database connection failed:", error)

        throw error
    }
}

export default connect