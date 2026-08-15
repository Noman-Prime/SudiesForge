import { BookOpen, Check, Sparkles } from "lucide-react";

const promises = [
    "No charges",
    "No subscriptions",
    "Open for everyone",
];

const FreeEducationBanner = () => {
    return (
        <section aria-labelledby="free-education-heading" className="bg-white px-3 py-7 sm:px-6 sm:py-9 lg:px-8">
            <div className="group relative mx-auto flex min-h-40 w-full max-w-[1200px] items-center overflow-hidden rounded-2xl border border-blue-700 bg-gradient-to-br from-[#061b4f] via-[#0b3476] to-[#0f55bd] px-5 py-6 shadow-[0_16px_40px_rgba(15,42,99,0.25)] sm:min-h-48 sm:px-8 sm:py-8 lg:px-10">
                <div className="pointer-events-none absolute -left-20 -top-24 h-52 w-52 rounded-full border border-white/10" />
                <div className="pointer-events-none absolute -left-10 -top-16 h-36 w-36 rounded-full border border-white/10" />
                <div className="pointer-events-none absolute -bottom-28 right-8 h-56 w-56 rounded-full bg-blue-400/20 blur-3xl" />
                <div className="pointer-events-none absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-white/5 to-transparent" />

                <div className="relative z-10 max-w-[68%] sm:max-w-xl">
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-300/20 bg-white/10 px-2.5 py-1.5 text-blue-100 backdrop-blur-sm">
                        <Sparkles size={13} />

                        <span className="text-[8px] font-extrabold uppercase tracking-[0.16em] sm:text-[10px]">
                            StudiesForge Promise
                        </span>
                    </div>

                    <h2 id="free-education-heading" className="mt-3 text-xl font-black tracking-tight text-white sm:text-3xl">
                        100% Free. Always.
                    </h2>

                    <p className="mt-2 max-w-lg text-[10px] leading-5 text-blue-100 sm:mt-3 sm:text-sm sm:leading-6">
                        Quality educational material without hidden charges or subscription fees.
                    </p>

                    <div className="mt-4 hidden flex-wrap gap-2 sm:flex">
                        {promises.map((item) => (
                            <span key={item} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-bold text-white backdrop-blur-sm">
                                <Check size={12} strokeWidth={2.5} />
                                {item}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center sm:right-10 lg:right-16">
                    <div className="absolute h-24 w-24 rounded-full border border-white/15 sm:h-36 sm:w-36" />
                    <div className="absolute h-20 w-20 rounded-full border border-white/10 sm:h-28 sm:w-28" />
                    <div className="absolute h-16 w-16 rounded-full bg-blue-300/20 blur-lg sm:h-24 sm:w-24" />

                    <div className="relative flex h-18 w-18 rotate-0 items-center justify-center rounded-2xl border border-white bg-white text-blue-700 shadow-2xl transition duration-300 lg:-rotate-6 lg:border-white/15 lg:bg-white/10 lg:text-white lg:backdrop-blur-md lg:group-hover:rotate-0 lg:group-hover:border-white lg:group-hover:bg-white lg:group-hover:text-blue-700 sm:h-24 sm:w-24 sm:rounded-3xl">
                        <BookOpen size={35} strokeWidth={1.6} className="sm:h-12 sm:w-12" />
                    </div>

                    <div className="absolute -right-1 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-blue-600 shadow-lg sm:-right-3 sm:-top-4 sm:h-9 sm:w-9">
                        <Sparkles size={14} className="sm:h-4 sm:w-4" />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FreeEducationBanner;