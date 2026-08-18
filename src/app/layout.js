import { Geist, Geist_Mono } from "next/font/google";
import { GetContext } from "@/context/userContext";
import { ToastContainer } from "react-toastify";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  metadataBase: new URL("https://studiesforge.com"),

  title: {
    default: "Studies Forge | Free Study Material, Notes & MCQs",
    template: "%s | Studies Forge",
  },

  description:
    "Studies Forge provides free study material, notes, MCQs, lectures, chapters, and exam preparation resources for students preparing for competitive and professional exams in Pakistan.",

  applicationName: "Studies Forge",

  keywords: [
    "Studies Forge",
    "study material Pakistan",
    "free study material",
    "online study notes",
    "exam preparation Pakistan",
    "MCQs Pakistan",
    "competitive exam preparation",
    "MDCAT preparation",
    "PPSC preparation",
    "educational resources Pakistan",
    "free notes for students",
  ],

  authors: [
    {
      name: "Studies Forge",
      url: "https://studiesforge.com",
    },
  ],

  creator: "Studies Forge",
  publisher: "Studies Forge",

  category: "education",

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    locale: "en_PK",
    url: "https://studiesforge.com",
    siteName: "Studies Forge",
    title: "Studies Forge | Free Study Material, Notes & MCQs",
    description:
      "Free study material, notes, MCQs, lectures, and exam preparation resources for students in Pakistan.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Studies Forge",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Studies Forge | Free Study Material, Notes & MCQs",
    description:
      "Free study material, notes, MCQs, lectures, and exam preparation resources for students in Pakistan.",
    images: ["/og-image.png"],
  },

  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body
        className={`${geistSans.className} flex min-h-screen flex-col antialiased`}
      >
        <GetContext>
          {children}
        </GetContext>

        <ToastContainer
          position="top-right"
          autoClose={false}
          pauseOnHover
          pauseOnFocusLoss
          closeOnClick={false}
          closeButton
        />
      </body>
    </html>
  );
}