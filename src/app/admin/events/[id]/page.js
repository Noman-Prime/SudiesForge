"use client";

import { useUser } from "@/context/userContext";
import axios from "axios";
import Link from "next/link";
import {
  ChevronDown,
  ExternalLink,
  GraduationCap,
  Settings2,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const toastOptions = {
  autoClose: 3000,
  pauseOnHover: false,
  pauseOnFocusLoss: false,
  closeOnClick: true,
};

const Update = () => {
  const { id } = useParams();
  const navigate = useRouter();
  const { user } = useUser();

  const [name, setName] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoadingEvent, setIsLoadingEvent] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isBusy = isUpdating || isDeleting;

  const accountName = user
    ? `${user.firstname || ""} ${user.lastname || ""}`.trim() || "Administrator"
    : "Administrator";

  const updateEvent = async (e) => {
    e.preventDefault();

    if (isLoadingEvent || isBusy) return;

    const eventName = name.trim();

    if (!eventName) {
      toast.dismiss();
      toast.error("Event name is required", toastOptions);
      return;
    }

    setIsUpdating(true);

    try {
      const result = await axios.put(
        `/api/events/${id}`,
        { name: eventName },
        { withCredentials: true },
      );

      if (!result.data?.success) {
        toast.dismiss();
        toast.error(
          result.data?.message || "Event is not updated",
          toastOptions,
        );
        return;
      }

      setName(eventName);

      toast.dismiss();
      toast.success("Event is updated", toastOptions);

      navigate.push("/admin/events");
    } catch (error) {
      toast.dismiss();
      toast.error(
        error.response?.data?.message ||
        error.message ||
        "Event is not updated",
        toastOptions,
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteEvent = async () => {
    if (isLoadingEvent || isBusy) return;

    setIsDeleting(true);

    try {
      const result = await axios.delete(`/api/events/${id}`, {
        withCredentials: true,
      });

      if (!result.data?.success) {
        toast.dismiss();
        toast.error(
          result.data?.message || "Event is not deleted",
          toastOptions,
        );
        return;
      }

      toast.dismiss();
      toast.success("Event is deleted", toastOptions);

      navigate.push("/admin/events");
    } catch (error) {
      toast.dismiss();
      toast.error(
        error.response?.data?.message ||
        error.message ||
        "Event is not deleted",
        toastOptions,
      );
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    if (!id) return;

    const current = async () => {
      setIsLoadingEvent(true);

      try {
        const result = await axios.get(`/api/events/${id}`, {
          withCredentials: true,
        });

        if (!result.data?.success || !result.data?.event) {
          toast.dismiss();
          toast.error(
            result.data?.message || "Event could not be loaded",
            toastOptions,
          );
          setName("");
          return;
        }

        setName(result.data.event.name || "");
      } catch (error) {
        setName("");
        toast.dismiss();
        toast.error(
          error.response?.data?.message ||
          error.message ||
          "Event could not be loaded",
          toastOptions,
        );
      } finally {
        setIsLoadingEvent(false);
      }
    };

    current();
  }, [id]);

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
              onClick={() => setShowUserMenu((previousValue) => !previousValue)}
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

      <main className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-slate-100 px-4 py-8 sm:min-h-[calc(100vh-80px)] sm:px-6">
        <section className="grid w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md md:grid-cols-[0.85fr_1.15fr]">
          <aside className="flex flex-col justify-between bg-blue-600 px-6 py-7 sm:px-8 md:px-9 md:py-10">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-sm font-bold text-blue-600">
                  SF
                </div>

                <span className="text-base font-bold text-white">
                  StudiesForge
                </span>
              </div>

              <div className="mt-8 md:mt-14">
                <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-100">
                  Event management
                </p>

                <h1 className="mb-0 mt-2 text-[20px] font-bold leading-7 text-white sm:text-[22px]">
                  Manage educational event
                </h1>

                <p className="mb-0 mt-3 text-[12px] leading-5 text-blue-100">
                  Update the event name or permanently delete the selected
                  event.
                </p>
              </div>
            </div>

            <p className="mb-0 mt-8 text-[10px] leading-5 text-blue-100">
              Changes to the event will be synchronized with the website
              navigation.
            </p>
          </aside>

          <div className="flex items-center bg-white px-6 py-8 sm:px-8 md:px-10 md:py-10">
            <form className="w-full" onSubmit={updateEvent}>
              <div className="mb-6">
                <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-600">
                  Selected event
                </p>

                <h2 className="mb-0 mt-2 text-[20px] font-bold leading-7 text-slate-900">
                  Event information
                </h2>

                <p className="mb-0 mt-1 text-[12px] leading-5 text-slate-500">
                  Change the event name and save your update, or delete the
                  event.
                </p>
              </div>

              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-xs font-semibold text-slate-700"
                >
                  Event name
                </label>

                <input
                  id="name"
                  type="text"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={
                    isLoadingEvent ? "Loading event..." : "Enter event name"
                  }
                  autoComplete="off"
                  required
                  disabled={isLoadingEvent || isBusy}
                  className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-xs placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                />

                <p className="mb-0 mt-2 text-[10px] leading-4 text-slate-500">
                  Use a short and recognizable educational event name.
                </p>
              </div>

              <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                <a
                  href="/admin/events"
                  className="flex h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100"
                >
                  Cancel
                </a>

                <button
                  type="button"
                  onClick={deleteEvent}
                  disabled={isLoadingEvent || isBusy}
                  className="flex h-11 items-center justify-center rounded-lg bg-red-600 px-5 text-xs font-semibold text-white transition hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-100 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isDeleting ? "Deleting event..." : "Delete event"}
                </button>

                <button
                  type="submit"
                  disabled={isLoadingEvent || isBusy}
                  className="flex h-11 items-center justify-center rounded-lg bg-blue-600 px-5 text-xs font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isUpdating ? "Updating event..." : "Update event"}
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Update;