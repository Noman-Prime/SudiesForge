"use client";

import axios from "axios";
import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { useEffect, useState } from "react";

const FacebookIcon = () => {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-[17px] w-[17px]"
    >
      <path
        fill="currentColor"
        d="M14 8h3V4h-3c-3.31 0-6 2.69-6 6v2H5v4h3v8h4v-8h3l1-4h-4v-2c0-1.1.9-2 2-2Z"
      />
    </svg>
  );
};

const YoutubeIcon = () => {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-[17px] w-[17px]"
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
};

const InstagramIcon = () => {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-[17px] w-[17px]"
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

      <circle cx="12" cy="12" r="4" />

      <circle
        cx="17.5"
        cy="6.5"
        r="1"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
};

const LinkedinIcon = () => {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-[17px] w-[17px]"
      fill="currentColor"
    >
      <rect
        x="3"
        y="9"
        width="4"
        height="12"
        rx="1"
      />

      <circle cx="5" cy="5" r="2" />

      <path d="M10 9h4v1.7c1-1.3 2.4-2.1 4-2.1 3.1 0 4 2 4 5.3V21h-4v-6.3c0-1.5-.3-2.7-1.9-2.7-1.9 0-2.1 1.5-2.1 3.1V21h-4V9Z" />
    </svg>
  );
};

const resourceLinks = [
  {
    name: "Notes",
    href: "/notes",
  },
  {
    name: "Video Lectures",
    href: "/lectures",
  },
  {
    name: "MCQs",
    href: "/mcqs",
  },
  {
    name: "Mock Tests",
    href: "/mock-tests",
  },
  {
    name: "Past Papers",
    href: "/past-papers",
  },
];

const companyLinks = [
  {
    name: "About Us",
    href: "/about",
  },
  {
    name: "Contact Us",
    href: "/contact",
  },
  {
    name: "Privacy Policy",
    href: "/privacy-policy",
  },
  {
    name: "Terms of Use",
    href: "/terms",
  },
  {
    name: "Disclaimer",
    href: "/disclaimer",
  },
  {
    name: "Sitemap",
    href: "/sitemap.xml",
  },
];

const supportLinks = [
  {
    name: "Help Center",
    href: "/help",
  },
  {
    name: "Suggestions",
    href: "/suggestions",
  },
  {
    name: "Report an Error",
    href: "/report-error",
  },
  {
    name: "Corrections",
    href: "/corrections",
  },
];

const socialLinks = [
  {
    name: "Facebook",
    href: "#",
    icon: FacebookIcon,
  },
  {
    name: "YouTube",
    href: "#",
    icon: YoutubeIcon,
  },
  {
    name: "Instagram",
    href: "#",
    icon: InstagramIcon,
  },
  {
    name: "LinkedIn",
    href: "#",
    icon: LinkedinIcon,
  },
];

const Footer = () => {
  const [events, setEvents] = useState([]);

  const getEvents = async () => {
    try {
      const result = await axios.get("/api/navigation");

      if (result.data.success) {
        setEvents(result.data.event || []);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getEvents();
  }, []);

  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-[#f8fbff]">
      <div className="mx-auto w-full max-w-[1300px] px-4 pb-5 pt-9 sm:px-6 sm:pb-6 sm:pt-11 lg:px-8">
        <div className="grid grid-cols-2 gap-x-5 gap-y-9 lg:grid-cols-[1.35fr_0.75fr_0.9fr_0.85fr] lg:gap-10">
          <div className="col-span-2 lg:col-span-1">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#102a63] text-white shadow-sm">
                <GraduationCap
                  size={23}
                  strokeWidth={1.9}
                />
              </div>

              <div>
                <span className="block text-base font-extrabold tracking-tight text-[#071a4a]">
                  StudiesForge
                </span>

                <span className="block text-[9px] font-semibold uppercase tracking-[0.14em] text-blue-600">
                  Learn without limits
                </span>
              </div>
            </Link>

            <p className="mt-4 max-w-xs text-xs leading-6 text-slate-500">
              Your free platform for quality education,
              exam preparation and trusted learning
              resources.
            </p>

            <div className="mt-5 flex items-center gap-2">
              {socialLinks.map((social) => {
                const Icon = social.icon;

                return (
                  <a
                    key={social.name}
                    href={social.href}
                    aria-label={social.name}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                  >
                    <Icon />
                  </a>
                );
              })}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-extrabold text-[#071a4a]">
              Exams
            </h2>

            <nav
              aria-label="Exam links"
              className="mt-4 flex flex-col items-start gap-2.5"
            >
              {events.slice(0, 6).map((event) => (
                <Link
                  key={event._id}
                  href={`/events/${event._id}`}
                  className="text-xs font-medium text-slate-500 transition hover:translate-x-1 hover:text-blue-600"
                >
                  {event.name}
                </Link>
              ))}

              <Link
                href="/events"
                className="text-xs font-bold text-blue-600 transition hover:translate-x-1 hover:text-blue-800"
              >
                All Exams
              </Link>
            </nav>
          </div>

          <div>
            <h2 className="text-sm font-extrabold text-[#071a4a]">
              Resources
            </h2>

            <nav
              aria-label="Resource links"
              className="mt-4 flex flex-col items-start gap-2.5"
            >
              {resourceLinks.map((resource) => (
                <Link
                  key={resource.name}
                  href={resource.href}
                  className="text-xs font-medium text-slate-500 transition hover:translate-x-1 hover:text-blue-600"
                >
                  {resource.name}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <div>
              <h2 className="text-sm font-extrabold text-[#071a4a]">
                Company
              </h2>

              <nav
                aria-label="Company links"
                className="mt-4 flex flex-col items-start gap-2.5"
              >
                {companyLinks.map((company) => (
                  <Link
                    key={company.name}
                    href={company.href}
                    className="text-xs font-medium text-slate-500 transition hover:translate-x-1 hover:text-blue-600"
                  >
                    {company.name}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="mt-8">
              <h2 className="text-sm font-extrabold text-[#071a4a]">
                Support
              </h2>

              <nav
                aria-label="Support links"
                className="mt-4 flex flex-col items-start gap-2.5"
              >
                {supportLinks.map((support) => (
                  <Link
                    key={support.name}
                    href={support.href}
                    className="text-xs font-medium text-slate-500 transition hover:translate-x-1 hover:text-blue-600"
                  >
                    {support.name}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>

        <div className="mt-9 border-t border-slate-200 pt-5 text-center">
          <p className="text-[10px] text-slate-500 sm:text-xs">
            © {currentYear} StudiesForge. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;