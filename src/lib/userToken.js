import { NextResponse } from "next/server"

const sendToken = (user, statusCode) => {
    const token = user.jsonwebtoken()
    const res = NextResponse.json({
        success: true,
        token: token
    }, { status: statusCode })
    res.cookies.set("token", token, {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        secure: true,
        httpOnly: true,
        sameSite: "lax"
    })
    return res
}

export default sendToken