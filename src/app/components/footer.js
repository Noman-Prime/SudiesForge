"use client";

import axios from "axios";
import Link from "next/link";
import { BookOpenCheck, CheckCircle2, ChevronRight, GraduationCap, ListChecks } from "lucide-react";
import { useEffect, useState } from "react";

const FacebookIcon = () => {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[17px] w-[17px]">
      <path fill="currentColor" d="M14 8h3V4h-3c-3.31 0-6 2.69-6 6v2H5v4h3v8h4v-8h3l1-4h-4v-2c0-1.1.9-2 2-2Z" />
    </svg>
  );
};

const YoutubeIcon = () => {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[17px] w-[17px]">
      <rect x="2" y="5" width="20" height="14" rx="4" fill="currentColor" />
      <path d="m10 9 5 3-5 3V9Z" fill="white" />
    </svg>
  );
};

const InstagramIcon = () => {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[17px] w-[17px]" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
};

const LinkedinIcon = () => {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[17px] w-[17px]" fill="currentColor">
      <rect x="3" y="9" width="4" height="12" rx="1" />
      <circle cx="5" cy="5" r="2" />
      <path d="M10 9h4v1.7c1-1.3 2.4-2.1 4-2.1 3.1 0 4 2 4 5.3V21h-4v-6.3c0-1.5-.3-2.7-1.9-2.7-1.9 0-2.1 1.5-2.1 3.1V21h-4V9Z" />
    </svg>
  );
};

const WhatsappIcon = () => {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px]" fill="currentColor">
      <path d="M12.04 2C6.52 2 2.03 6.42 2.03 11.87c0 1.74.46 3.44 1.34 4.93L2 22l5.35-1.38a10.1 10.1 0 0 0 4.68 1.17h.01c5.52 0 10.01-4.42 10.01-9.87C22.05 6.46 17.56 2 12.04 2Zm0 17.98h-.01a8.3 8.3 0 0 1-4.23-1.15l-.3-.18-3.18.82.85-3.06-.2-.32a8.02 8.02 0 0 1-1.25-4.22c0-4.46 3.73-8.08 8.32-8.08 4.58 0 8.31 3.64 8.31 8.13 0 4.44-3.73 8.06-8.31 8.06Zm4.56-6.04c-.25-.12-1.48-.72-1.71-.8-.23-.08-.4-.12-.57.12-.17.25-.65.8-.8.97-.15.16-.3.18-.55.06-1.47-.72-2.44-1.29-3.42-2.93-.26-.44.26-.41.75-1.36.08-.17.04-.31-.02-.43-.06-.13-.57-1.36-.78-1.86-.2-.49-.41-.42-.57-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.85-.88 2.07s.9 2.4 1.03 2.57c.12.16 1.77 2.66 4.29 3.73.6.26 1.07.41 1.43.52.6.18 1.15.16 1.58.1.48-.07 1.48-.6 1.69-1.17.21-.58.21-1.07.15-1.18-.06-.1-.23-.16-.48-.29Z" />
    </svg>
  );
};

const resourceLinks = [
  {
    name: "Subjects",
    href: "/subjects",
  },
  {
    name: "Chapters",
    href: "/chapters",
  },
  {
    name: "Topics",
    href: "/topics",
  },
  {
    name: "MCQs Read Mode",
    href: "/mcqs/read",
  },
  {
    name: "MCQs Test Mode",
    href: "/mcqs/test",
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
    name: "Disclaimer",
    href: "/disclaimer",
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

const legalLinks = [
  {
    name: "Privacy Policy",
    href: "/privacy-policy",
  },
  {
    name: "Terms of Use",
    href: "/terms",
  },
];

const sampleSocialLinks = [
  {
    _id: "facebook",
    name: "Facebook",
    platform: "facebook",
    url: "#",
    active: true,
  },
  {
    _id: "youtube",
    name: "YouTube",
    platform: "youtube",
    url: "#",
    active: true,
  },
  {
    _id: "instagram",
    name: "Instagram",
    platform: "instagram",
    url: "#",
    active: true,
  },
  {
    _id: "linkedin",
    name: "LinkedIn",
    platform: "linkedin",
    url: "#",
    active: true,
  },
  {
    _id: "whatsapp",
    name: "WhatsApp",
    platform: "whatsapp",
    url: "#",
    active: true,
  },
];

const socialStyles = {
  facebook: {
    icon: FacebookIcon,
    style: "border-blue-600 bg-blue-600 text-white lg:border-slate-200 lg:bg-white lg:text-slate-500 lg:hover:border-blue-600 lg:hover:bg-blue-600 lg:hover:text-white",
  },
  youtube: {
    icon: YoutubeIcon,
    style: "border-red-600 bg-red-600 text-white lg:border-slate-200 lg:bg-white lg:text-slate-500 lg:hover:border-red-600 lg:hover:bg-red-600 lg:hover:text-white",
  },
  instagram: {
    icon: InstagramIcon,
    style: "border-pink-600 bg-pink-600 text-white lg:border-slate-200 lg:bg-white lg:text-slate-500 lg:hover:border-pink-600 lg:hover:bg-pink-600 lg:hover:text-white",
  },
  linkedin: {
    icon: LinkedinIcon,
    style: "border-sky-700 bg-sky-700 text-white lg:border-slate-200 lg:bg-white lg:text-slate-500 lg:hover:border-sky-700 lg:hover:bg-sky-700 lg:hover:text-white",
  },
  whatsapp: {
    icon: WhatsappIcon,
    style: "border-emerald-600 bg-emerald-600 text-white lg:border-slate-200 lg:bg-white lg:text-slate-500 lg:hover:border-emerald-600 lg:hover:bg-emerald-600 lg:hover:text-white",
  },
};

const FooterHeading = ({ children }) => {
  return (
    <div className="flex items-center gap-2">
      <span className="h-4 w-1 rounded-full bg-blue-600" />

      <h2 className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#071a4a] sm:text-sm">
        {children}
      </h2>
    </div>
  );
};

const FooterLink = ({ href, children }) => {
  return (
    <Link href={href} className="group flex min-h-10 w-full items-center gap-1.5 rounded-lg border border-blue-100 bg-blue-50 px-2.5 py-2 text-[10px] font-bold text-blue-700 transition active:scale-[0.98] lg:min-h-0 lg:border-transparent lg:bg-transparent lg:px-0 lg:py-0 lg:text-xs lg:font-medium lg:text-slate-500 lg:hover:translate-x-1 lg:hover:text-blue-700">
      <ChevronRight size={13} className="shrink-0 text-blue-500 transition lg:text-slate-300 lg:group-hover:text-blue-600" />
      <span className="truncate">{children}</span>
    </Link>
  );
};

const Footer = () => {
  const [events, setEvents] = useState([]);
  const [socialLinks] = useState(sampleSocialLinks);
  const [loadingEvents, setLoadingEvents] = useState(true);

  const getEvents = async () => {
    try {
      setLoadingEvents(true);

      const result = await axios.get("/api/navigation");

      if (result.data.success) {
        setEvents(result.data.event || result.data.events || []);
      } else {
        setEvents([]);
      }
    } catch (error) {
      console.log(error);
      setEvents([]);
    } finally {
      setLoadingEvents(false);
    }
  };

  useEffect(() => {
    getEvents();
  }, []);

  const currentYear = new Date().getFullYear();

  const openSocialLink = (event, social) => {
    if (!social.url || social.url === "#") {
      event.preventDefault();
    }
  };

  return (
    <footer className="relative overflow-hidden border-t border-slate-200 bg-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-blue-50/70 to-transparent" />

      <div className="relative mx-auto w-full max-w-[1200px] px-3 pb-5 pt-8 sm:px-6 sm:pb-6 sm:pt-10 lg:px-8">
        <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-6 lg:grid-cols-[1.45fr_0.75fr_0.95fr_0.8fr_0.85fr] lg:gap-9">
          <div className="col-span-2 rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 via-white to-slate-50 p-4 shadow-md sm:p-5 lg:col-span-1 lg:border-slate-200 lg:shadow-sm lg:transition lg:hover:border-blue-200 lg:hover:shadow-md">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#102a63] text-white shadow-md">
                <GraduationCap size={25} strokeWidth={1.9} />
              </div>

              <div>
                <span className="block text-base font-black tracking-tight text-[#071a4a] sm:text-lg">
                  StudiesForge
                </span>

                <span className="block text-[8px] font-extrabold uppercase tracking-[0.16em] text-blue-600 sm:text-[9px]">
                  Learn without limits
                </span>
              </div>
            </Link>

            <p className="mt-4 max-w-sm text-[11px] leading-5 text-slate-500 sm:text-xs sm:leading-6">
              A free learning platform providing organized educational material and exam preparation resources for every student.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-100 px-2.5 py-1.5 text-[8px] font-bold text-blue-700 sm:text-[9px]">
                <CheckCircle2 size={12} />
                Free Learning
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[8px] font-bold text-emerald-700 sm:text-[9px]">
                <BookOpenCheck size={12} />
                Structured Material
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1.5 text-[8px] font-bold text-violet-700 sm:text-[9px]">
                <ListChecks size={12} />
                Practice MCQs
              </span>
            </div>

            <div className="mt-5">
              <p className="text-[8px] font-extrabold uppercase tracking-[0.14em] text-slate-400 sm:text-[9px]">
                Connect with us
              </p>

              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                {socialLinks
                  .filter((social) => social.active)
                  .map((social) => {
                    const socialData = socialStyles[social.platform];
                    const Icon = socialData?.icon;

                    if (!Icon) {
                      return null;
                    }

                    const isPlaceholder = !social.url || social.url === "#";

                    return (
                      <a key={social._id} href={social.url || "#"} target={isPlaceholder ? undefined : "_blank"} rel={isPlaceholder ? undefined : "noopener noreferrer"} aria-label={social.name} title={isPlaceholder ? `${social.name} link will be added soon` : social.name} onClick={(event) => openSocialLink(event, social)} className={`flex h-9 w-9 items-center justify-center rounded-xl border shadow-md transition active:scale-95 lg:shadow-sm lg:hover:-translate-y-0.5 lg:hover:shadow-md ${socialData.style}`}>
                        <Icon />
                      </a>
                    );
                  })}
              </div>
            </div>
          </div>

          <div>
            <FooterHeading>Exams</FooterHeading>

            <nav aria-label="Exam links" className="mt-4 flex flex-col gap-2 lg:gap-2.5">
              {loadingEvents ? (
                <>
                  <div className="h-10 animate-pulse rounded-lg bg-slate-100 lg:h-4" />
                  <div className="h-10 animate-pulse rounded-lg bg-slate-100 lg:h-4" />
                  <div className="h-10 animate-pulse rounded-lg bg-slate-100 lg:h-4" />
                </>
              ) : events.length > 0 ? (
                events.slice(0, 6).map((event) => (
                  <FooterLink key={event._id} href={`/events/${event._id}`}>
                    {event.name}
                  </FooterLink>
                ))
              ) : (
                <p className="text-[10px] leading-5 text-slate-400">
                  No exams available
                </p>
              )}
            </nav>
          </div>

          <div>
            <FooterHeading>Resources</FooterHeading>

            <nav aria-label="Resource links" className="mt-4 flex flex-col gap-2 lg:gap-2.5">
              {resourceLinks.map((resource) => (
                <FooterLink key={resource.name} href={resource.href}>
                  {resource.name}
                </FooterLink>
              ))}
            </nav>
          </div>

          <div>
            <FooterHeading>Company</FooterHeading>

            <nav aria-label="Company links" className="mt-4 flex flex-col gap-2 lg:gap-2.5">
              {companyLinks.map((company) => (
                <FooterLink key={company.name} href={company.href}>
                  {company.name}
                </FooterLink>
              ))}
            </nav>
          </div>

          <div>
            <FooterHeading>Support</FooterHeading>

            <nav aria-label="Support links" className="mt-4 flex flex-col gap-2 lg:gap-2.5">
              {supportLinks.map((support) => (
                <FooterLink key={support.name} href={support.href}>
                  {support.name}
                </FooterLink>
              ))}
            </nav>
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 sm:mt-9">
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-center text-[9px] text-slate-500 sm:text-left sm:text-[10px]">
              © {currentYear} StudiesForge. All rights reserved.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
              {legalLinks.map((link) => (
                <Link key={link.name} href={link.href} className="text-[9px] font-bold text-slate-500 transition hover:text-blue-700 sm:text-[10px]">
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;