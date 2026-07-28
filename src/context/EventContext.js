"use client";

import { createContext, useContext, useEffect, useState } from "react";
import getEvents from "@/lib/getEvents";

const EventContext = createContext();

export const EventProvider = ({ children }) => {
    const [event, setEvent] = useState([]);

    const fetchEvents = async () => {
        const result = await getEvents();
        setEvent(result);
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    return (
        <EventContext.Provider value={{ event, setEvent }}>
            {children}
        </EventContext.Provider>
    );
};

export const useEvent = () => {
    return useContext(EventContext);
};