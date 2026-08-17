import connect from "@/lib/db"
import pastpaper from "@/models/pastpaper"
import { NextResponse } from "next/server"

export const createPastpaper = async (req) => {
    try {
        await connect()
        const body = await req.json()
        const Pastpaper = await pastpaper.create(body)
        return NextResponse.json({
            success: true,
            message: "pastpaper is created",
            pastpaper: Pastpaper
        }, { status: 201 })
    } catch (error) {
        console.log(error);
        return NextResponse.json({
            success: false,
            message: "Something went wrong"
        }, { status: 500 })
    }
};

export const updatePastpaper = async (req, id) => {
    try {
        await connect()
        const body = await req.json()
        const Pastpaper = await pastpaper.findByIdAndUpdate(id, body, { new: true, runValidators: true })
        if (!Pastpaper) {
            return NextResponse.json({
                success: false,
                message: "Pastpaper is not found"
            }, { status: 404 })
        }
        return NextResponse.json({
            success: true,
            message: "Pastpaper  is updated",
            pastpaper: Pastpaper
        }, { status: 200 })
    } catch (error) {
        console.log(error);
        return NextResponse.json({
            success: false,
            message: "Something went wrong"
        }, { status: 500 })
    }
}

export const getPastpaper = async (req, id) => {
    try {
        await connect()
        const Pastpaper = await pastpaper.findById(id)
        if (!Pastpaper) {
            return NextResponse.json({
                success: false,
                message: "Pastpaper  is not found"
            }, { status: 404 })
        }
        return NextResponse.json({
            success: true,
            message: "Pastpaper  is found",
            pastpaper: Pastpaper
        }, { status: 200 })
    } catch (error) {
        console.log(error);
        return NextResponse.json({
            success: false,
            message: "Something went wrong"
        }, { status: 500 })
    }
}

export const getAllPastpaper = async () => {
    try {
        await connect()
        const Pastpapers = await pastpaper.find().populate("event")
        if (!Pastpapers || Pastpapers.length === 0) {
            return NextResponse.json({
                success: false,
                message: "Pastpaper  is not found"
            }, { status: 404 })
        }
        return NextResponse.json({
            success: true,
            message: "Pastpaper  is found",
            pastpapers: Pastpapers
        }, { status: 200 })
    } catch (error) {
        console.log(error);
        return NextResponse.json({
            success: false,
            message: "Something went wrong"
        }, { status: 500 })
    }
}

export const deletePastpaper = async (req, id) => {
    try {
        await connect()
        const Pastpaper = await pastpaper.findByIdAndDelete(id)
        if (!Pastpaper) {
            return NextResponse.json({
                success: false,
                message: "Pastpaper  is not found"
            }, { status: 404 })
        }
        return NextResponse.json({
            success: true,
            message: "Pastpaper  is deleted"
        }, { status: 200 })
    } catch (error) {
        console.log(error);
        return NextResponse.json({
            success: false,
            message: "Something went wrong"
        }, { status: 500 })
    }
}