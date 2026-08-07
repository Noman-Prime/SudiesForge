"use client";

import { useUser } from "@/context/userContext";
import axios from "axios";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronDown,
  ExternalLink,
  GraduationCap,
  Settings2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Create = () => {
  const navigate = useRouter();
  const { user } = useUser();

  const [data, setData] = useState({
    name: "",
  });

  const [showUserMenu, setShowUserMenu] = useState(false);

  const accountName = user
    ? `${user.firstname || ""} ${user.lastname || ""}`.trim() ||
    "Administrator"
    : "Administrator";

  const fillData = (e) => {
    setData((pre) => ({
      ...pre,
      [e.target.name]: e.target.value,
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

        navigate.push("/admin/events");

        setData({
          name: "",
        });
      }
    } catch (error) {
      console.log(error.response?.data?.message);

      toast.error(
        error.response?.data?.message || "Event is not created",
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-50 bg-[#102a63] px-3 py-2 text-white shadow-sm sm:px-6">
        <div className="mx-auto flex h-14 w-full max-w-[1500px] items-center gap-2 sm:h-16 sm:gap-4">
          <Link
            href="/admin"
            className="flex min-w-0 max-w-[48%] items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-2.5 py-2 text-white shadow-sm backdrop-blur-xl transition hover:bg-white/15 sm:max-w-none sm:gap-3 sm:px-4"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[#102a63] sm:h-10 sm:w-10">
              <GraduationCap size={21} />
            </div>

            <div className="min-w-0">
              <span className="block truncate text-[11px] font-bold text-white sm:text-sm">
                StudiesForge
              </span>

              <span className="block truncate text-[9px] text-blue-200 sm:text-xs">
                Admin Console
              </span>
            </div>
          </Link>

          <div className="relative ml-auto min-w-0 max-w-[52%] sm:max-w-none">
            <button
              type="button"
              aria-label="Open admin account menu"
              aria-haspopup="menu"
              aria-expanded={showUserMenu}
              onClick={() =>
                setShowUserMenu((previousValue) => !previousValue)
              }
              className="flex w-full min-w-0 items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-2.5 py-2 text-left text-white shadow-sm backdrop-blur-xl transition hover:bg-white/15 sm:gap-3 sm:px-4"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white text-xs font-bold uppercase text-[#102a63] sm:h-10 sm:w-10 sm:text-sm">
                {user?.profileimage?.url ? (
                  <img
                    src={user.profileimage.url}
                    alt={accountName}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  user?.firstname?.charAt(0) || "A"
                )}
              </div>

              <div className="min-w-0">
                <span className="block truncate text-[11px] font-bold text-white sm:max-w-[220px] sm:text-sm">
                  {accountName}
                </span>

                <span className="block truncate text-[9px] text-blue-200 sm:max-w-[220px] sm:text-xs">
                  {user?.email || "admin@studiesforge.com"}
                </span>
              </div>

              <ChevronDown
                size={15}
                className={`shrink-0 text-blue-200 transition-transform duration-200 ${showUserMenu ? "rotate-180" : "rotate-0"
                  }`}
              />
            </button>

            <div
              role="menu"
              className={`absolute right-0 top-full w-52 origin-top-right pt-2 transition-all duration-200 sm:w-56 ${showUserMenu
                  ? "visible pointer-events-auto translate-y-0 opacity-100"
                  : "invisible pointer-events-none translate-y-2 opacity-0"
                }`}
            >
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-2 text-slate-800 shadow-xl">
                <Link
                  href="/"
                  role="menuitem"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition hover:bg-blue-50 hover:text-blue-700"
                >
                  <ExternalLink size={17} />
                  View Website
                </Link>

                <Link
                  href="/admin/settings"
                  role="menuitem"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition hover:bg-blue-50 hover:text-blue-700"
                >
                  <Settings2 size={17} />
                  Settings
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-slate-100 px-4 py-8 sm:min-h-[calc(100vh-80px)]">
        <div className="grid w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md md:grid-cols-[0.85fr_1.15fr]">
          <section className="flex flex-col justify-between bg-blue-600 px-6 py-8 sm:px-8 md:px-9 md:py-10">
            <div>
              <button
                type="button"
                onClick={() => navigate.back()}
                aria-label="Go back"
                className="flex w-fit items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/20"
              >
                <ArrowLeft size={17} />
                Back
              </button>

              <div className="mt-6 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-sm font-bold text-blue-600">
                  SF
                </div>

                <span className="text-base font-bold text-white">
                  StudiesForge
                </span>
              </div>

              <div className="mt-10 md:mt-14">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-100">
                  Event management
                </p>

                <h1 className="mt-3 text-2xl font-bold leading-tight text-white sm:text-3xl">
                  Create a new educational event
                </h1>

                <p className="mt-4 text-sm leading-6 text-blue-100">
                  Add a clear event name so students can easily find the right
                  learning content.
                </p>
              </div>
            </div>

            <p className="mt-10 text-xs leading-5 text-blue-100">
              Your new event will automatically appear in the website
              navigation.
            </p>
          </section>

          <section className="flex items-center bg-white px-6 py-8 sm:px-8 md:px-10 md:py-10">
            <div className="w-full">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">
                New event
              </p>

              <h2 className="mt-2 text-2xl font-bold text-slate-900">
                Event information
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Enter the event name below.
              </p>

              <div className="mt-7">
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Event name
                </label>

                <input
                  id="name"
                  type="text"
                  name="name"
                  value={data.name}
                  onChange={fillData}
                  placeholder="For example: MDCAT"
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />

                <p className="mt-2 text-xs text-slate-500">
                  Use a short and recognizable name.
                </p>
              </div>

              <button
                type="button"
                onClick={sendData}
                className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                Create event
              </button>
            </div>
          </section>
        </div>

        <ToastContainer position="top-right" />
      </main>
    </div>
  );
};

export default Create;