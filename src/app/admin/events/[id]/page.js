"use client";

import DeleteConfirmationModal from "@/app/admin/components/deleteconfirmation";
import { useUser } from "@/context/userContext";
import axios from "axios";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  ChevronDown,
  CircleAlert,
  ExternalLink,
  GraduationCap,
  LoaderCircle,
  Pencil,
  Save,
  Settings2,
  Trash2,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

const toastOptions = {
  autoClose: 3000,
  pauseOnHover: false,
  pauseOnFocusLoss: false,
  closeOnClick: true,
};

const ManageEvent = () => {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();

  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [event, setEvent] = useState(null);
  const [name, setName] = useState("");
  const [savedName, setSavedName] = useState("");
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const isBusy = isUpdating || isDeleting;

  const getEvent = useCallback(async () => {
    if (!id) {
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      const result = await axios.get(`/api/events/${id}`, {
        withCredentials: true,
      });

      if (!result.data?.success || !result.data?.event) {
        setEvent(null);
        setErrorMessage(result.data?.message || "Event could not be loaded");
        return;
      }

      const currentEvent = result.data.event;

      setEvent(currentEvent);
      setName(currentEvent.name || "");
      setSavedName(currentEvent.name || "");
    } catch (error) {
      console.log(error);

      setEvent(null);
      setErrorMessage(error.response?.data?.message || error.message || "Event could not be loaded");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const updateEvent = async (submitEvent) => {
    submitEvent.preventDefault();

    if (loading || isBusy) {
      return;
    }

    const eventName = name.trim();

    if (!eventName) {
      toast.dismiss();
      toast.error("Event name is required", toastOptions);
      return;
    }

    try {
      setIsUpdating(true);

      const result = await axios.put(
        `/api/events/${id}`,
        {
          name: eventName,
        },
        {
          withCredentials: true,
        },
      );

      if (!result.data?.success) {
        toast.dismiss();
        toast.error(result.data?.message || "Event could not be updated", toastOptions);
        return;
      }

      setName(eventName);
      setSavedName(eventName);

      setEvent((previous) => ({
        ...previous,
        ...result.data.event,
        name: eventName,
      }));

      toast.dismiss();
      toast.success(result.data.message || "Event is updated", toastOptions);

      router.replace("/admin/events");
    } catch (error) {
      console.log(error);

      toast.dismiss();
      toast.error(error.response?.data?.message || error.message || "Event could not be updated", toastOptions);
    } finally {
      setIsUpdating(false);
    }
  };

  const openDeleteModal = () => {
    if (!loading && !isBusy) {
      setShowDeleteModal(true);
    }
  };

  const closeDeleteModal = useCallback(() => {
    if (!isDeleting) {
      setShowDeleteModal(false);
    }
  }, [isDeleting]);

  const deleteEvent = async () => {
    if (!id || loading || isDeleting || isUpdating) {
      return;
    }

    try {
      setIsDeleting(true);

      const result = await axios.delete(`/api/events/${id}`, {
        withCredentials: true,
      });

      if (!result.data?.success) {
        toast.dismiss();
        toast.error(result.data?.message || "Event could not be deleted", toastOptions);
        return;
      }

      setShowDeleteModal(false);

      toast.dismiss();
      toast.success(result.data.message || "Event is deleted", toastOptions);

      router.replace("/admin/events");
    } catch (error) {
      console.log(error);

      toast.dismiss();
      toast.error(error.response?.data?.message || error.message || "Event could not be deleted", toastOptions);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (date) => {
    if (!date) {
      return "Not available";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not available";
    }

    return new Intl.DateTimeFormat("en-PK", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(parsedDate);
  };

  useEffect(() => {
    getEvent();
  }, [getEvent]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f7fb]">
        <AdminHeader user={user} />

        <main className="mx-auto w-full max-w-[900px] px-4 py-7 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-5 w-40 rounded bg-slate-200" />
            <div className="mt-5 h-28 rounded-2xl bg-white" />
            <div className="mt-5 h-96 rounded-2xl bg-white" />
          </div>
        </main>
      </div>
    );
  }

  if (errorMessage || !event) {
    return (
      <div className="min-h-screen bg-[#f5f7fb]">
        <AdminHeader user={user} />
        <EventError message={errorMessage || "Event is not available"} onRetry={getEvent} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <AdminHeader user={user} />

      <main className="mx-auto w-full max-w-[900px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-2 text-xs sm:text-sm">
          <Link href="/admin/events" className="flex items-center gap-1.5 font-semibold text-slate-500 transition hover:text-blue-700">
            <ArrowLeft size={16} />
            Events
          </Link>

          <span className="text-slate-300">/</span>

          <span className="max-w-52 truncate font-semibold text-blue-700">
            {savedName || "Manage Event"}
          </span>
        </nav>

        <section className="mb-5 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="min-w-0">
            <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-blue-600">
              Event management
            </p>

            <h1 className="mt-1.5 truncate text-xl font-extrabold tracking-tight text-[#071a4a] sm:text-2xl">
              Manage {savedName}
            </h1>

            <p className="mt-1.5 max-w-2xl text-xs leading-5 text-slate-500 sm:text-sm">
              Update the event name or permanently remove the event.
            </p>
          </div>

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <GraduationCap size={23} />
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="grid md:grid-cols-[0.75fr_1.25fr]">
            <aside className="flex flex-col justify-between bg-[#102a63] px-6 py-7 sm:px-8 md:px-9 md:py-10">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-[#102a63] shadow-sm">
                  <GraduationCap size={25} />
                </div>

                <p className="mt-8 text-[9px] font-extrabold uppercase tracking-[0.16em] text-blue-200">
                  Selected event
                </p>

                <h2 className="mt-2 break-words text-xl font-extrabold leading-7 text-white">
                  {savedName}
                </h2>

                <p className="mt-3 text-xs leading-5 text-blue-100">
                  Changes to this event will also appear in the website navigation and public event pages.
                </p>
              </div>

              <div className="mt-8 space-y-3">
                <EventDate label="Created" value={formatDate(event.createdAt)} />
                <EventDate label="Last updated" value={formatDate(event.updatedAt)} />
              </div>
            </aside>

            <div className="p-5 sm:p-7 md:p-9">
              <div className="flex items-start gap-3 border-b border-slate-200 pb-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Pencil size={19} />
                </div>

                <div>
                  <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-blue-600">
                    Event information
                  </p>

                  <h2 className="mt-1 text-lg font-extrabold text-[#071a4a]">
                    Update Event
                  </h2>

                  <p className="mt-1 text-[10px] leading-5 text-slate-500 sm:text-xs">
                    Enter a short and recognizable educational event name.
                  </p>
                </div>
              </div>

              <form onSubmit={updateEvent} className="mt-6">
                <label htmlFor="name" className="mb-2 block text-xs font-bold text-slate-700">
                  Event name
                </label>

                <input id="name" type="text" name="name" value={name} onChange={(inputEvent) => setName(inputEvent.target.value)} placeholder="Enter event name" autoComplete="off" required disabled={isBusy} className="h-12 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50" />

                <p className="mt-2 text-[10px] leading-4 text-slate-500">
                  Updating the event name will not change its ID or connected references.
                </p>

                <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                  <Link href="/admin/events" className="flex h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 text-xs font-bold text-slate-600 transition hover:bg-slate-50">
                    Cancel
                  </Link>

                  <button type="submit" disabled={isBusy} className="flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400">
                    {isUpdating ? (
                      <>
                        <LoaderCircle size={16} className="animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>

              <div className="mt-8 border-t border-red-100 pt-5">
                <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                  <p className="text-xs font-extrabold text-red-700">
                    Delete Event
                  </p>

                  <p className="mt-1 text-[10px] leading-5 text-red-600 sm:text-xs">
                    The event can only be deleted after all connected subjects and their learning content have been removed.
                  </p>

                  <button type="button" onClick={openDeleteModal} disabled={isBusy} className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-xs font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-400 sm:w-auto">
                    <Trash2 size={15} />
                    Delete Event
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <DeleteConfirmationModal open={showDeleteModal} title="Delete Event?" description="This will permanently remove the event. Make sure all subjects and learning content connected to this event have already been deleted." itemName={savedName} confirmText="Delete Event" loading={isDeleting} onCancel={closeDeleteModal} onConfirm={deleteEvent} />
    </div>
  );
};

const EventDate = ({ label, value }) => {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/10 px-3 py-3">
      <CalendarDays size={16} className="shrink-0 text-blue-200" />

      <div className="min-w-0">
        <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-200">
          {label}
        </p>

        <p className="mt-0.5 truncate text-[10px] font-bold text-white">
          {value}
        </p>
      </div>
    </div>
  );
};

const EventError = ({ message, onRetry }) => {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-80px)] w-full max-w-[900px] items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500">
          <CircleAlert size={23} />
        </div>

        <h1 className="mt-4 text-lg font-extrabold text-[#071a4a]">
          Event could not be opened
        </h1>

        <p className="mt-2 text-xs leading-5 text-slate-500">
          {message}
        </p>

        <button type="button" onClick={onRetry} className="mt-5 rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-blue-700">
          Try Again
        </button>
      </div>
    </main>
  );
};

const AdminHeader = ({ user }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef(null);

  const accountName = user
    ? `${user.firstname || ""} ${user.lastname || ""}`.trim() || "Administrator"
    : "Administrator";

  useEffect(() => {
    const closeUserMenu = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", closeUserMenu);

    return () => {
      document.removeEventListener("mousedown", closeUserMenu);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-[#102a63] px-3 py-2 text-white shadow-sm sm:px-6">
      <div className="mx-auto flex h-14 w-full max-w-[1500px] items-center gap-2 sm:h-16 sm:gap-4">
        <Link href="/admin" className="flex min-w-0 max-w-[48%] items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-2.5 py-2 text-white shadow-sm backdrop-blur-xl transition hover:bg-white/15 sm:max-w-none sm:gap-3 sm:px-4">
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

        <div ref={menuRef} className="relative ml-auto min-w-0 max-w-[52%] sm:max-w-none">
          <button type="button" aria-label="Open admin account menu" aria-haspopup="menu" aria-expanded={showUserMenu} onClick={() => setShowUserMenu((previous) => !previous)} className="flex w-full min-w-0 items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-2.5 py-2 text-left text-white shadow-sm backdrop-blur-xl transition hover:bg-white/15 sm:gap-3 sm:px-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white text-xs font-bold uppercase text-[#102a63] sm:h-10 sm:w-10 sm:text-sm">
              {user?.profileimage?.url ? (
                <img src={user.profileimage.url} alt={accountName} className="h-full w-full object-cover" />
              ) : (
                user?.firstname?.charAt(0) || "A"
              )}
            </div>

            <div className="min-w-0">
              <span className="block truncate text-[11px] font-bold text-white sm:max-w-[220px] sm:text-sm">
                {accountName}
              </span>

              <span className="block truncate text-[9px] text-blue-200 sm:max-w-[220px] sm:text-xs">
                {user?.email || "Administrator"}
              </span>
            </div>

            <ChevronDown size={15} className={`shrink-0 text-blue-200 transition-transform ${showUserMenu ? "rotate-180" : ""}`} />
          </button>

          {showUserMenu && (
            <div role="menu" className="absolute right-0 top-full z-50 w-52 pt-2 sm:w-56">
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-2 text-slate-800 shadow-xl">
                <Link href="/" role="menuitem" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition hover:bg-blue-50 hover:text-blue-700">
                  <ExternalLink size={17} />
                  View Website
                </Link>

                <Link href="/admin/settings" role="menuitem" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition hover:bg-blue-50 hover:text-blue-700">
                  <Settings2 size={17} />
                  Settings
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default ManageEvent;