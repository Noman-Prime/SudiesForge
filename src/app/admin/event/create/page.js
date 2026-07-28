"use client";

import axios from "axios";
import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Create = () => {
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
        <main className="min-h-screen bg-gray-100 px-4 py-12">
            <div className="mx-auto max-w-xl rounded-2xl bg-white p-8 shadow-lg">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-900">Create Event</h1>
                    <p className="mt-2 text-sm text-gray-500">Enter the event information below.</p>
                </div>

                <div className="space-y-6">
                    <div>
                        <label htmlFor="name" className="mb-2 block text-sm font-semibold text-gray-700">Event name</label>
                        <input id="name" type="text" name="name" value={data.name} onChange={fillData} placeholder="Enter event name" className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200" />
                    </div>

                    <button type="button" onClick={sendData} className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700">Create Event</button>
                </div>
            </div>

            <ToastContainer position="top-right" />
        </main>
    );
};

export default Create;