"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Create = () => {
    const navigate = useRouter()
    const [data, setData] = useState({
        name: ""
    });

    const fillData = (e) => {
        setData((pre) => ({
            ...pre,
            [e.target.name]: e.target.value
        }));
    };

    const sendData = async () => {
        if (!data.name.trim()) {
            toast.error("Event name is required");
            return;
        }

        try {
            const result = await axios.post("/api/events", data);

            if (result.data.success) {
                toast.success("Event is created");
                console.log(result.data);
                navigate.push("/admin/events")
                setData({
                    name: ""
                });
            }
        } catch (error) {
            console.log(error.response?.data?.message);
            toast.error(error.response?.data?.message || "Event is not created");
        }
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8">
            <div className="grid w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md md:grid-cols-[0.85fr_1.15fr]">
                <section className="flex flex-col justify-between bg-blue-600 px-6 py-8 sm:px-8 md:px-9 md:py-10">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-sm font-bold text-blue-600">SF</div>
                            <span className="!text-base font-bold !text-white">StudiesForge</span>
                        </div>

                        <div className="mt-10 md:mt-14">
                            <p className="!text-xs font-semibold uppercase tracking-[0.16em] !text-blue-100">Event management</p>
                            <h1 className="mt-3 !text-2xl font-bold leading-tight !text-white sm:!text-3xl">Create a new educational event</h1>
                            <p className="mt-4 !text-sm leading-6 !text-blue-100">Add a clear event name so students can easily find the right learning content.</p>
                        </div>
                    </div>

                    <p className="mt-10 !text-xs leading-5 !text-blue-100">Your new event will automatically appear in the website navigation.</p>
                </section>

                <section className="flex items-center bg-white px-6 py-8 sm:px-8 md:px-10 md:py-10">
                    <div className="w-full">
                        <p className="!text-xs font-semibold uppercase tracking-[0.14em] !text-blue-600">New event</p>
                        <h2 className="mt-2 !text-2xl font-bold !text-slate-900">Event information</h2>
                        <p className="mt-2 !text-sm leading-6 !text-slate-500">Enter the event name below.</p>

                        <div className="mt-7">
                            <label htmlFor="name" className="mb-2 block !text-sm font-semibold !text-slate-700">Event name</label>
                            <input id="name" type="text" name="name" value={data.name} onChange={fillData} placeholder="For example: MDCAT" className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 !text-sm !text-slate-900 outline-none transition placeholder:!text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100" />
                            <p className="mt-2 !text-xs !text-slate-500">Use a short and recognizable name.</p>
                        </div>

                        <button type="button" onClick={sendData} className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-3 !text-sm font-semibold !text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200">Create event</button>
                    </div>
                </section>
            </div>

            <ToastContainer position="top-right" />
        </main>
    );
};

export default Create;