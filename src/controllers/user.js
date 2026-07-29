import connect from "@/lib/db"
import sendToken from "@/lib/userToken"
import user from "@/models/user"
import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"


export const createUser = async (req) => {
    try {
        await connect()
        const body = await req.json()
        const User = await user.create(body)
        if (!User) {
            return NextResponse.json({
                success: false,
                message: "Please Enter a valid data"
            }, { status: 404 })
        }
        return sendToken(User, 201)
    } catch (error) {
        console.log(error);
        return NextResponse.json({
            success: false,
            message: "Something went wrong"
        }, { status: 500 })
    }
}

export const login = async (req) => {
    try {
        await connect()
        const { email, password: enterPassword } = await req.json()
        if (!email || !enterPassword) {
            return NextResponse.json({
                success: false,
                message: "Please enter email and Password"
            }, { status: 400 })
        }
        const User = await user.findOne({ email: email.trim().toLowerCase() }).select("+password")
        if (!User) {
            return NextResponse.json({
                success: false,
                message: "Please enter a valid email and Password"
            }, { status: 401 })
        }
        const passwordAuth = await bcrypt.compare(enterPassword, User.password)
        if (!passwordAuth) {
            return NextResponse.json({
                success: false,
                message: "Please enter a valid email and Password"
            }, { status: 401 })
        }
        return sendToken(User, 200)
    } catch (error) {
        console.log(error);
        return NextResponse.json({
            success: false,
            message: "Something went wrong"
        }, { status: 500 })
    }
}

export const logOut = async () => {
    try {
        await connect()
        const res = NextResponse.json({
            success: true,
            message: "User is logged Out"
        }, { status: 200 })
        res.cookies.delete("token")
        return res
    } catch (error) {
        console.log(error);
        return NextResponse.json({
            success: false,
            message: "Something went wrong"
        }, { status: 500 })
    }
}

export const updateUser = async (req, id) => {
    try {
        await connect()
        const { firstname, lastname, email, contactnumber, country } = await req.json()
        const User = await user.findByIdAndUpdate(
            id,
            { firstname, lastname, email, contactnumber, country },
            { new: true, runValidators: true }
        )
        if (!User) {
            return NextResponse.json({
                success: false,
                message: "User is not updated"
            }, { status: 400 })
        }
        return NextResponse.json({
            success: true,
            message: "User is updated"
        }, { status: 200 })
    } catch (error) {
        console.log(error);
        NextResponse.json({
            success: false,
            message: "Something went wrong"
        }, { status: 500 })
    }
}

export const deleteUser = async (id) => {
    try {
        await connect()
        const User = await user.findByIdAndDelete(id)
        if (!User) {
            return NextResponse.json({
                success: false,
                message: "No user is found"
            }, { status: 404 })
        }
        const res = NextResponse.json({
            success: true,
            message: "User is deleted"
        }, { status: 200 })
        res.cookies.delete("token")
        return res
    } catch (error) {
        console.log(error);
        return NextResponse.json({
            success: false,
            message: "Something went wrong"
        }, { status: 500 })
    }
}