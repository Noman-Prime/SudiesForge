"use client";

import { useUser } from "@/context/userContext";
import axios from "axios";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  GraduationCap,
  Plus,
  Settings2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const Events = () => {
  const navigate = useRouter();
  const { user } = useUser();

  const [events, setEvents] = useState([]);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const accountName = user
    ? `${user.firstname || ""} ${user.lastname || ""}`.trim()
    : "Administrator";

  const getEvents = async () => {
    try {
      const result = await axios.get("/api/events", {
        withCredentials: true,
      });

      if (result.data.success) {
        setEvents(result.data.event);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (user === undefined) {
      return;
    }

    if (!user || user.role !== "admin") {
      navigate.push("/");
      return;
    }

    getEvents();
  }, [user]);

  const formatDate = (date) => {
    if (!date) {
      return "Not available";
    }

    return new Intl.DateTimeFormat("en-PK", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  };

  if (user === undefined) {
    return null;
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb]">
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
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold uppercase text-[#102a63] sm:h-10 sm:w-10 sm:text-sm">
                {user.firstname?.charAt(0) || "A"}
              </div>

              <div className="min-w-0">
                <span className="block truncate text-[11px] font-bold text-white sm:max-w-[220px] sm:text-sm">
                  {accountName}
                </span>

                <span className="block truncate text-[9px] text-blue-200 sm:max-w-[220px] sm:text-xs">
                  {user.email}
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

      <div className="mx-auto w-full max-w-[1500px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        <nav className="mb-5 flex items-center gap-2 text-sm">
          <Link
            href="/admin"
            className="flex items-center gap-1.5 font-semibold text-slate-500 transition hover:text-blue-700"
          >
            <ArrowLeft size={16} />
            Dashboard
          </Link>

          <ChevronRight size={15} className="text-slate-400" />

          <span className="font-semibold text-blue-700">Events</span>
        </nav>

        <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <p className="m-0 text-sm font-semibold text-blue-700">
              Website Material
            </p>

            <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
              Events Management
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Create and manage educational events such as PPSC, MDCAT and other
              examinations.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate.push("/admin/events/create")}
            className="flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-800 sm:w-auto"
          >
            <Plus size={18} />
            Create Event
          </button>
        </section>

        <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-4 py-4 sm:px-6">
            <h2 className="text-base font-bold text-slate-950">All Events</h2>

            <p className="mt-1 text-xs text-slate-500">
              Manage events and their related subjects.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 bg-slate-50/70 p-3 sm:gap-4 sm:p-6 lg:grid-cols-4">
            {events.map((item) => (
              <article
                key={item._id}
                className="group flex min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md sm:p-5"
              >
                <button
                  type="button"
                  onClick={() =>
                    navigate.push(`/admin/subjects/${item._id}`)
                  }
                  aria-label={`View subjects for ${item.name}`}
                  className="flex min-w-0 flex-1 flex-col rounded-xl text-left outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                >
                  <div className="flex items-start justify-between gap-2 sm:gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-sm font-bold uppercase text-blue-700 transition group-hover:bg-blue-700 group-hover:text-white sm:h-12 sm:w-12 sm:rounded-2xl sm:text-base">
                      {item.name?.charAt(0) || "E"}
                    </div>

                    <div className="flex items-center gap-1 rounded-lg bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-700 sm:gap-1.5 sm:text-xs">
                      <BookOpen size={13} />

                      <span className="hidden sm:inline">View Subjects</span>

                      <ChevronRight size={13} />
                    </div>
                  </div>

                  <div className="mt-3 min-w-0 sm:mt-4">
                    <p className="m-0 truncate text-sm font-bold text-slate-950 sm:text-lg">
                      {item.name}
                    </p>

                    <div className="mt-1.5 flex min-w-0 items-center gap-1.5 text-[10px] font-medium text-slate-500 sm:mt-2 sm:gap-2 sm:text-xs">
                      <CalendarDays size={13} className="shrink-0" />

                      <span className="truncate">
                        {formatDate(item.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="my-3 h-px bg-slate-100 sm:my-4" />

                  <div className="mb-3 hidden items-center justify-between gap-3 sm:flex">
                    <span className="text-xs font-semibold text-slate-400">
                      Event ID
                    </span>

                    <span className="max-w-[150px] truncate rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-[10px] font-semibold text-slate-600">
                      {item._id}
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    navigate.push(`/admin/events/${item._id}`)
                  }
                  className="mt-auto flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-blue-700 px-2 text-[11px] font-bold text-white transition hover:bg-blue-800 sm:h-11 sm:gap-2 sm:rounded-xl sm:px-4 sm:text-sm"
                >
                  <Settings2 size={15} />
                  Manage Event
                </button>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
};

export default Events;