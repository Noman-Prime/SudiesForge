"use client";

import axios from "axios";
import Link from "next/link";
import {
  BookOpenCheck,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  ListChecks,
} from "lucide-react";
import { useEffect, useState } from "react";

/* =========================================================
   SOCIAL ICONS
========================================================= */

const FacebookIcon = () => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    className="h-4 w-4"
  >
    <path
      fill="currentColor"
      d="M14 8h3V4h-3c-3.31 0-6 2.69-6 6v2H5v4h3v8h4v-8h3l1-4h-4v-2c0-1.1.9-2 2-2Z"
    />
  </svg>
);

const YoutubeIcon = () => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    className="h-4 w-4"
  >
    <rect
      x="2"
      y="5"
      width="20"
      height="14"
      rx="4"
      fill="currentColor"
    />

    <path
      d="m10 9 5 3-5 3V9Z"
      fill="white"
    />
  </svg>
);

const InstagramIcon = () => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <rect
      x="3"
      y="3"
      width="18"
      height="18"
      rx="5"
    />

    <circle
      cx="12"
      cy="12"
      r="4"
    />

    <circle
      cx="17.5"
      cy="6.5"
      r="1"
      fill="currentColor"
      stroke="none"
    />
  </svg>
);

const LinkedinIcon = () => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    className="h-4 w-4"
    fill="currentColor"
  >
    <rect
      x="3"
      y="9"
      width="4"
      height="12"
      rx="1"
    />

    <circle
      cx="5"
      cy="5"
      r="2"
    />

    <path d="M10 9h4v1.7c1-1.3 2.4-2.1 4-2.1 3.1 0 4 2 4 5.3V21h-4v-6.3c0-1.5-.3-2.7-1.9-2.7-1.9 0-2.1 1.5-2.1 3.1V21h-4V9Z" />
  </svg>
);

const WhatsappIcon = () => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    className="h-[17px] w-[17px]"
    fill="currentColor"
  >
    <path d="M12.04 2C6.52 2 2.03 6.42 2.03 11.87c0 1.74.46 3.44 1.34 4.93L2 22l5.35-1.38a10.1 10.1 0 0 0 4.68 1.17h.01c5.52 0 10.01-4.42 10.01-9.87C22.05 6.46 17.56 2 12.04 2Zm0 17.98h-.01a8.3 8.3 0 0 1-4.23-1.15l-.3-.18-3.18.82.85-3.06-.2-.32a8.02 8.02 0 0 1-1.25-4.22c0-4.46 3.73-8.08 8.32-8.08 4.58 0 8.31 3.64 8.31 8.13 0 4.44-3.73 8.06-8.31 8.06Zm4.56-6.04c-.25-.12-1.48-.72-1.71-.8-.23-.08-.4-.12-.57.12-.17.25-.65.8-.8.97-.15.16-.3.18-.55.06-1.47-.72-2.44-1.29-3.42-2.93-.26-.44.26-.41.75-1.36.08-.17.04-.31-.02-.43-.06-.13-.57-1.36-.78-1.86-.2-.49-.41-.42-.57-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.85-.88 2.07s.9 2.4 1.03 2.57c.12.16 1.77 2.66 4.29 3.73.6.26 1.07.41 1.43.52.6.18 1.15.16 1.58.1.48-.07 1.48-.6 1.69-1.17.21-.58.21-1.07.15-1.18-.06-.1-.23-.16-.48-.29Z" />
  </svg>
);

/* =========================================================
   LINKS
========================================================= */

const resourceLinks = [
  { name: "Subjects", href: "/subjects" },
  { name: "Chapters", href: "/chapters" },
  { name: "Topics", href: "/topics" },
  { name: "MCQs Read Mode", href: "/mcqs/read" },
  { name: "MCQs Test Mode", href: "/mcqs/test" },
  { name: "Past Papers", href: "/past-papers" },
];

const companyLinks = [
  { name: "About Us", href: "/about" },
  { name: "Contact Us", href: "/contact" },
  { name: "Disclaimer", href: "/disclaimer" },
];

const supportLinks = [
  { name: "Help Center", href: "/help" },
  { name: "Suggestions", href: "/suggestions" },
  { name: "Report an Error", href: "/report-error" },
  { name: "Corrections", href: "/corrections" },
];

const legalLinks = [
  { name: "Privacy Policy", href: "/privacy-policy" },
  { name: "Terms of Use", href: "/terms" },
];

/* =========================================================
   SOCIAL DATA
========================================================= */

const socialLinks = [
  {
    id: "facebook",
    name: "Facebook",
    platform: "facebook",
    url: "#",
  },
  {
    id: "youtube",
    name: "YouTube",
    platform: "youtube",
    url: "#",
  },
  {
    id: "instagram",
    name: "Instagram",
    platform: "instagram",
    url: "#",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    platform: "linkedin",
    url: "#",
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    platform: "whatsapp",
    url: "#",
  },
];

const socialStyles = {
  facebook: {
    icon: FacebookIcon,
    className:
      "border-blue-600 bg-blue-600 hover:bg-blue-700",
  },

  youtube: {
    icon: YoutubeIcon,
    className:
      "border-red-600 bg-red-600 hover:bg-red-700",
  },

  instagram: {
    icon: InstagramIcon,
    className:
      "border-pink-600 bg-pink-600 hover:bg-pink-700",
  },

  linkedin: {
    icon: LinkedinIcon,
    className:
      "border-sky-700 bg-sky-700 hover:bg-sky-800",
  },

  whatsapp: {
    icon: WhatsappIcon,
    className:
      "border-emerald-600 bg-emerald-600 hover:bg-emerald-700",
  },
};

/* =========================================================
   FOOTER HEADING
========================================================= */

const FooterHeading = ({ children }) => {
  return (
    <div className="flex items-center gap-2">
      <span className="h-4 w-1 rounded-full bg-blue-600" />

      <h2 className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#071a4a] sm:text-xs">
        {children}
      </h2>
    </div>
  );
};

/* =========================================================
   FOOTER LINK
========================================================= */

const FooterLink = ({ href, children }) => {
  return (
    <Link
      href={href}
      className="group inline-flex min-w-0 items-center gap-1.5 rounded-md py-1 text-[11px] font-medium text-slate-500 transition-all duration-200 hover:translate-x-1 hover:text-blue-700 sm:text-xs"
    >
      <ChevronRight
        size={13}
        strokeWidth={2}
        className="shrink-0 text-slate-300 transition-colors duration-200 group-hover:text-blue-600"
      />

      <span className="truncate">
        {children}
      </span>
    </Link>
  );
};

/* =========================================================
   FOOTER
========================================================= */

const Footer = () => {
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const getEvents = async () => {
      try {
        const response = await axios.get(
          "/api/events"
        );

        if (cancelled) return;

        const data = response?.data;

        if (!data?.success) {
          setEvents([]);
          return;
        }

        const eventData =
          data?.event ??
          data?.events ??
          data?.collection ??
          [];

        setEvents(
          Array.isArray(eventData)
            ? eventData
            : []
        );
      } catch (error) {
        if (!cancelled) {
          console.error(
            "Footer navigation error:",
            error
          );

          setEvents([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingEvents(false);
        }
      }
    };

    getEvents();

    return () => {
      cancelled = true;
    };
  }, []);

  const openSocialLink = (event, social) => {
    if (
      !social.url ||
      social.url === "#"
    ) {
      event.preventDefault();
    }
  };

  return (
    <footer className="relative mt-0 overflow-hidden border-t border-slate-200 bg-white">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-blue-50/80 via-blue-50/30 to-transparent" />

      <div className="relative mx-auto w-full max-w-[1240px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        {/* =====================================================
            MAIN GRID
        ===================================================== */}

        <div className="grid grid-cols-2 gap-x-6 gap-y-9 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-10 lg:grid-cols-[1.55fr_0.8fr_1fr_0.85fr_0.85fr] lg:gap-10">
          {/* ===================================================
              BRAND
          =================================================== */}

          <div className="col-span-2 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-slate-50 p-4 shadow-sm sm:p-5 lg:col-span-1">
            {/* Logo */}
            <Link
              href="/"
              className="inline-flex items-center gap-3"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#102a63] text-white shadow-md">
                <GraduationCap
                  size={25}
                  strokeWidth={1.9}
                />
              </div>

              <div className="min-w-0">
                <span className="block truncate text-lg font-black tracking-tight text-[#071a4a]">
                  StudiesForge
                </span>

                <span className="block text-[8px] font-extrabold uppercase tracking-[0.16em] text-blue-600">
                  Learn without limits
                </span>
              </div>
            </Link>

            {/* Description */}
            <p className="mt-4 max-w-md text-[11px] leading-5 text-slate-500 sm:text-xs sm:leading-6">
              A free learning platform providing
              organized educational material,
              MCQs, past papers and exam
              preparation resources for students.
            </p>

            {/* Features */}
            <div className="mt-5 grid grid-cols-1 gap-2 min-[420px]:grid-cols-3">
              <div className="flex min-w-0 items-center gap-1.5 rounded-lg border border-blue-100 bg-white px-2 py-2 text-[9px] font-bold text-blue-700">
                <CheckCircle2
                  size={13}
                  className="shrink-0"
                />

                <span className="truncate">
                  Free Learning
                </span>
              </div>

              <div className="flex min-w-0 items-center gap-1.5 rounded-lg border border-emerald-100 bg-white px-2 py-2 text-[9px] font-bold text-emerald-700">
                <BookOpenCheck
                  size={13}
                  className="shrink-0"
                />

                <span className="truncate">
                  Structured
                </span>
              </div>

              <div className="flex min-w-0 items-center gap-1.5 rounded-lg border border-violet-100 bg-white px-2 py-2 text-[9px] font-bold text-violet-700">
                <ListChecks
                  size={13}
                  className="shrink-0"
                />

                <span className="truncate">
                  Practice MCQs
                </span>
              </div>
            </div>

            {/* Social */}
            <div className="mt-6">
              <p className="text-[8px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
                Connect with us
              </p>

              <div className="mt-2.5 flex flex-wrap gap-2">
                {socialLinks.map((social) => {
                  const socialData =
                    socialStyles[
                    social.platform
                    ];

                  if (!socialData) {
                    return null;
                  }

                  const Icon =
                    socialData.icon;

                  const placeholder =
                    !social.url ||
                    social.url === "#";

                  return (
                    <a
                      key={social.id}
                      href={social.url || "#"}
                      target={
                        placeholder
                          ? undefined
                          : "_blank"
                      }
                      rel={
                        placeholder
                          ? undefined
                          : "noopener noreferrer"
                      }
                      aria-label={social.name}
                      title={
                        placeholder
                          ? `${social.name} link will be added soon`
                          : social.name
                      }
                      onClick={(event) =>
                        openSocialLink(
                          event,
                          social
                        )
                      }
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-95 ${socialData.className}`}
                    >
                      <Icon />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ===================================================
              EXAMS
          =================================================== */}

          <div className="min-w-0">
            <FooterHeading>
              Exams
            </FooterHeading>

            <nav
              aria-label="Exam links"
              className="mt-4 flex flex-col gap-1"
            >
              {loadingEvents ? (
                <>
                  <div className="h-4 w-20 animate-pulse rounded bg-slate-100" />
                  <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
                  <div className="h-4 w-16 animate-pulse rounded bg-slate-100" />
                </>
              ) : events.length > 0 ? (
                events
                  .slice(0, 6)
                  .map((event) => (
                    <FooterLink
                      key={event._id}
                      href={`/events/${event._id}`}
                    >
                      {event.name}
                    </FooterLink>
                  ))
              ) : (
                <p className="py-1 text-[10px] text-slate-400 sm:text-[11px]">
                  No exams available
                </p>
              )}
            </nav>
          </div>

          {/* ===================================================
              RESOURCES
          =================================================== */}

          <div className="min-w-0">
            <FooterHeading>
              Resources
            </FooterHeading>

            <nav
              aria-label="Resource links"
              className="mt-4 flex flex-col gap-1"
            >
              {resourceLinks.map(
                (resource) => (
                  <FooterLink
                    key={resource.name}
                    href={resource.href}
                  >
                    {resource.name}
                  </FooterLink>
                )
              )}
            </nav>
          </div>

          {/* ===================================================
              COMPANY
          =================================================== */}

          <div className="min-w-0">
            <FooterHeading>
              Company
            </FooterHeading>

            <nav
              aria-label="Company links"
              className="mt-4 flex flex-col gap-1"
            >
              {companyLinks.map(
                (company) => (
                  <FooterLink
                    key={company.name}
                    href={company.href}
                  >
                    {company.name}
                  </FooterLink>
                )
              )}
            </nav>
          </div>

          {/* ===================================================
              SUPPORT
          =================================================== */}

          <div className="min-w-0">
            <FooterHeading>
              Support
            </FooterHeading>

            <nav
              aria-label="Support links"
              className="mt-4 flex flex-col gap-1"
            >
              {supportLinks.map(
                (support) => (
                  <FooterLink
                    key={support.name}
                    href={support.href}
                  >
                    {support.name}
                  </FooterLink>
                )
              )}
            </nav>
          </div>
        </div>

        {/* =====================================================
            BOTTOM
        ===================================================== */}

        <div className="mt-9 border-t border-slate-200 pt-5 sm:mt-10">
          <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-between sm:text-left">
            <p className="text-[9px] text-slate-400 sm:text-[10px]">
              © 2026 StudiesForge. All
              rights reserved.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
              {legalLinks.map(
                (link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="text-[9px] font-semibold text-slate-400 transition-colors duration-200 hover:text-blue-700 sm:text-[10px]"
                  >
                    {link.name}
                  </Link>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;