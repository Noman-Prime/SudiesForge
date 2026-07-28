"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useEvent } from "@/context/EventContext";

const Navbar = () => {
    const [show, setShow] = useState(false);
    const { event } = useEvent();

    const closeMenu = () => {
        setShow(false);
    };

    return (
        <header className="sticky top-0 z-50 border-b border-slate-300 bg-slate-100 shadow-sm">
            <nav className="relative mx-auto flex min-h-[64px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link href="/" aria-label="Studies Forge homepage" onClick={closeMenu}>
                    <Image src="/logo.png" alt="Studies Forge" width={180} height={60} priority className="h-11 w-auto object-contain" />
                </Link>

                <div className="hidden items-center gap-2 md:flex">
                    <Link href="/" className="rounded-lg px-4 py-2 font-semibold text-[#1E3A8A] transition hover:bg-white">Home</Link>

                    {event.map((e) => (
                        <Link key={e._id} href={`/events/${e._id}`} className="rounded-lg px-4 py-2 font-semibold text-[#1E3A8A] transition hover:bg-white">
                            {e.name}
                        </Link>
                    ))}
                </div>

                <button onClick={() => setShow((prev) => !prev)} type="button" aria-label={show ? "Close menu" : "Open menu"} aria-expanded={show} className="flex h-10 w-10 items-center justify-center rounded-lg text-[#1E3A8A] transition hover:bg-white active:scale-95 md:hidden">
                    {show ? <X size={25} strokeWidth={2.5} /> : <Menu size={25} strokeWidth={2.5} />}
                </button>

                {show && (
                    <div className="absolute left-4 right-4 top-[72px] flex flex-col gap-2 rounded-xl border border-slate-300 bg-slate-100 p-4 shadow-xl md:hidden">
                        <Link href="/" onClick={closeMenu} className="rounded-lg bg-white px-4 py-3 font-semibold text-[#1E3A8A] transition hover:bg-slate-200">Home</Link>

                        {event.map((e) => (
                            <Link key={e._id} href={`/events/${e._id}`} onClick={closeMenu} className="rounded-lg bg-white px-4 py-3 font-semibold text-[#1E3A8A] transition hover:bg-slate-200">
                                {e.name}
                            </Link>
                        ))}
                    </div>
                )}
            </nav>
        </header>
    );
};

export default Navbar;