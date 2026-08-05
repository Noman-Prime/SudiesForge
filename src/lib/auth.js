import user from "@/models/user";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import connect from "@/lib/db";

const unauthorizedResponse = (message = "Please login") => {
    return NextResponse.json(
        {
            success: false,
            message,
        },
        { status: 401 },
    );
};

export const isAuthenticated = async (req) => {
    try {
        const token = req.cookies.get("token")?.value;

        if (!token) {
            return unauthorizedResponse();
        }

        const decoded = jwt.verify(
            token,
            process.env.USER_SECRET,
        );

        await connect();

        const verified = await user.findById(decoded.id);

        if (!verified) {
            return unauthorizedResponse();
        }

        return {
            user: verified,
        };
    } catch (error) {
        if (
            error.name === "JsonWebTokenError" ||
            error.name === "TokenExpiredError"
        ) {
            return unauthorizedResponse("Please login again");
        }

        console.error("Database authentication failed:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong",
            },
            { status: 500 },
        );
    }
};

export const isTokenAuthenticated = (req) => {
    try {
        const token = req.cookies.get("token")?.value;

        if (!token) {
            return unauthorizedResponse();
        }

        const decoded = jwt.verify(
            token,
            process.env.USER_SECRET,
        );

        if (!decoded.id || !decoded.role) {
            return unauthorizedResponse("Please login again");
        }

        return {
            user: {
                _id: decoded.id,
                role: decoded.role,
            },
        };
    } catch (error) {
        if (
            error.name === "JsonWebTokenError" ||
            error.name === "TokenExpiredError"
        ) {
            return unauthorizedResponse("Please login again");
        }

        console.error("Token authentication failed:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong",
            },
            { status: 500 },
        );
    }
};

export const isAdmin = (...roles) => {
    return (authenticatedUser) => {
        if (!roles.includes(authenticatedUser.role)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "You're not allowed",
                },
                { status: 403 },
            );
        }

        return null;
    };
};