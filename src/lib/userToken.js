import { NextResponse } from "next/server";

const sendToken = (user, statusCode) => {
    const token = user.jsonwebtoken();

    const response = NextResponse.json(
        {
            success: true,
            User: user,
            token,
        },
        { status: statusCode },
    );

    response.cookies.set("token", token, {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        sameSite: "lax",
    });

    return response;
};

export default sendToken;