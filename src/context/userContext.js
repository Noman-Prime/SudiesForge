"use client"

import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";

export const UserContext = createContext(null)

export const GetContext = ({ children }) => {
    const [user, setUser] = useState(null)
    const getUser = async () => {
        try {
            const result = await axios.get("/api/user")
            if (result.data.success) {
                setUser(result.data.user)
            }
        } catch (error) {
            console.log(error);
            setUser(null)
        }
    }
    useEffect(() => {
        getUser()
    }, [])
    return (
    <UserContext.Provider value={{ user, setUser }}>
        {children}
    </UserContext.Provider>
    )
}

export const useUser = () => {
    return useContext(UserContext)
}
