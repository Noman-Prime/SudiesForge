"use client";

import Link from "next/link";
import axios from "axios";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Boxes,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  GraduationCap,
  LayoutDashboard,
  Settings,
} from "lucide-react";
import { useUser } from "@/context/userContext";

const Admin = () => {
  const navigate = useRouter();
  const { user } = useUser();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [collections, setCollections] = useState([]);

  const getCollections = async () => {
    try {
      const result = await axios.get("/api/dashbord", {
        withCredentials: true,
      });

      if (result.data.success) {
        setCollections(result.data.collection);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const accountName = user
    ? `${user.firstname || ""} ${user.lastname || ""}`.trim()
    : "Administrator";

  useEffect(() => {
    if (user === undefined) {
      return;
    }

    if (!user || user.role !== "admin") {
      navigate.push("/");
      return;
    }

    getCollections();
  }, [user]);

  return (
    <main className="min-h-screen bg-[#f5f7fb]">
      <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between gap-2 border-b border-white/10 bg-[#102a63] px-2 text-white shadow-sm sm:h-[72px] sm:px-6">
        <Link
          href="/"
          aria-label="StudiesForge Admin Console"
          className="flex h-11 max-w-[48%] min-w-0 items-center gap-1.5 rounded-2xl border border-white/10 bg-white/10 px-2 text-white shadow-sm backdrop-blur-xl transition hover:bg-white/15 sm:h-12 sm:gap-3 sm:px-4"
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-[#102a63] sm:h-9 sm:w-9">
            <GraduationCap
              size={18}
              strokeWidth={2.3}
              className="sm:h-[21px] sm:w-[21px]"
            />
          </div>

          <div className="min-w-0 max-w-[82px] min-[360px]:max-w-[105px] sm:max-w-[220px]">
            <p className="m-0 truncate text-[11px] font-bold leading-4 text-white sm:text-sm">
              StudiesForge
            </p>

            <p className="m-0 truncate text-[8px] font-medium leading-3 text-white sm:text-[11px] sm:leading-4">
              Admin Console
            </p>
          </div>
        </Link>

        <div className="group relative flex max-w-[48%] justify-end">
          <button
            type="button"
            aria-label="Open admin account menu"
            aria-haspopup="menu"
            aria-expanded={showUserMenu}
            onClick={() => setShowUserMenu((previous) => !previous)}
            className="flex h-11 max-w-full min-w-0 touch-manipulation items-center gap-1.5 rounded-2xl border border-white/10 bg-white/10 px-2 text-left text-white shadow-sm backdrop-blur-xl transition hover:bg-white/15 sm:h-12 sm:gap-3 sm:px-4"
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-[11px] font-bold uppercase text-[#102a63] sm:h-9 sm:w-9 sm:text-sm">
              {user?.firstname?.charAt(0) || "A"}
            </div>

            <div className="min-w-0 max-w-[82px] min-[360px]:max-w-[105px] sm:max-w-[220px]">
              <p className="m-0 truncate text-[11px] font-bold leading-4 text-white sm:text-sm">
                {accountName}
              </p>

              <p className="m-0 truncate text-[8px] font-medium leading-3 text-white sm:text-[11px] sm:leading-4">
                {user?.email || "admin@studiesforge.com"}
              </p>
            </div>

            <ChevronDown
              size={15}
              className={`hidden shrink-0 text-white transition-transform duration-200 sm:block ${
                showUserMenu ? "rotate-180" : ""
              } group-hover:rotate-180`}
            />
          </button>

          <div
            role="menu"
            className={`absolute right-0 top-full z-[60] w-52 origin-top-right pt-2 transition-all duration-200 sm:w-56 ${
              showUserMenu
                ? "visible translate-y-0 scale-100 opacity-100"
                : "invisible translate-y-2 scale-95 opacity-0"
            } group-hover:visible group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:scale-100 group-focus-within:opacity-100`}
          >
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
              <Link
                href="/"
                role="menuitem"
                onClick={() => setShowUserMenu(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                  <ExternalLink size={17} />
                </div>

                View Website
              </Link>

              <Link
                href="/admin/settings"
                role="menuitem"
                onClick={() => setShowUserMenu(false)}
                className="mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                  <Settings size={17} />
                </div>

                Settings
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-64px)] sm:min-h-[calc(100vh-72px)]">
        <aside className="sticky top-[72px] hidden h-[calc(100vh-72px)] w-72 shrink-0 flex-col bg-[#102a63] text-white lg:flex">
          <nav className="flex-1 overflow-y-auto px-4 py-6">
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-xl bg-white px-3.5 py-3 text-left text-sm font-bold text-[#102a63] shadow-sm"
            >
              <LayoutDashboard size={19} />
              Dashboard
            </button>

            <p className="mb-3 mt-10 px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-300">
              Website Material
            </p>

            <div className="space-y-1.5">
              {collections.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    navigate.push(`/admin/${item.key}`);
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm font-semibold text-blue-100 transition hover:bg-white/10 hover:text-white"
                >
                  <Boxes size={21} />

                  <span className="flex-1">{item.name}</span>

                  <ChevronRight size={16} className="opacity-50" />
                </button>
              ))}
            </div>
          </nav>
        </aside>

        <div className="w-full min-w-0 flex-1">
          <div className="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8">
            <section className="rounded-2xl border border-slate-200 bg-white px-4 py-5 shadow-sm sm:px-6 sm:py-6 lg:px-7">
              <p className="text-xs font-semibold text-blue-700 sm:text-sm">
                Dashboard overview
              </p>

              <h1 className="mt-1 text-lg font-bold tracking-tight text-blue-900 sm:text-xl">
                Welcome back, {accountName}
              </h1>

              <p className="mt-2 text-xs leading-5 text-slate-500 sm:text-sm sm:leading-6">
                View and manage the complete StudiesForge educational content
                structure.
              </p>
            </section>

            {/* Mobile collection navigation */}
            <section className="mt-4 lg:hidden">
              <div className="mb-3 px-1">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-700">
                  Website Material
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Select a collection to manage its records and actions.
                </p>
              </div>

              <div className="space-y-2.5">
                {collections.map((item) => (
                  <Link
                    key={item.key}
                    href={`/admin/${item.key}`}
                    className="flex min-w-0 items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm transition active:scale-[0.99]"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                      <Boxes size={20} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-slate-900">
                        {item.name}
                      </p>

                      <p className="mt-0.5 text-xs text-slate-500">
                        {item.count.toLocaleString()} records
                      </p>
                    </div>

                    <ChevronRight
                      size={18}
                      className="shrink-0 text-slate-400"
                    />
                  </Link>
                ))}
              </div>
            </section>

            {/* Laptop and desktop collection cards */}
            <section className="mt-6 hidden gap-4 lg:grid lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {collections.map((item) => (
                <Link
                  key={item.key}
                  href={`/admin/${item.key}`}
                  className="min-w-0 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md sm:p-5"
                >
                  <div className="flex items-start justify-between gap-2 sm:gap-4">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-slate-500 sm:text-sm">
                        {item.name}
                      </p>

                      <p className="mt-1.5 text-2xl font-bold tracking-tight text-slate-950 sm:mt-2 sm:text-3xl">
                        {item.count.toLocaleString()}
                      </p>
                    </div>

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700 sm:h-11 sm:w-11">
                      <Boxes
                        size={19}
                        className="sm:h-[21px] sm:w-[21px]"
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </section>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Admin;