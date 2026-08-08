import {
    BookOpen,
    Sparkles,
} from "lucide-react";

const FreeEducationBanner = () => {
    return (
        <section className="bg-white px-4 py-7 sm:px-6 sm:py-9 lg:px-8 lg:py-11">
            <div className="relative mx-auto flex min-h-36 w-full max-w-[1300px] items-center overflow-hidden rounded-2xl bg-gradient-to-r from-[#061b4f] via-[#0b3476] to-[#0f55bd] px-5 py-6 shadow-[0_14px_35px_rgba(15,42,99,0.18)] sm:min-h-44 sm:px-8 lg:px-10">
                <div className="pointer-events-none absolute -left-20 -top-24 h-52 w-52 rounded-full border border-white/10" />

                <div className="pointer-events-none absolute -left-10 -top-16 h-36 w-36 rounded-full border border-white/10" />

                <div className="pointer-events-none absolute -bottom-28 right-8 h-56 w-56 rounded-full bg-blue-400/10 blur-2xl" />

                <div className="relative z-10 max-w-[68%] sm:max-w-xl">
                    <div className="mb-2 flex items-center gap-1.5 text-blue-200">
                        <Sparkles size={14} />

                        <span className="text-[9px] font-bold uppercase tracking-[0.18em] sm:text-[11px]">
                            StudiesForge Promise
                        </span>
                    </div>

                    <h2 className="text-xl font-extrabold tracking-tight text-white sm:text-3xl">
                        100% Free. Always.
                    </h2>

                    <p className="mt-2 text-[10px] leading-4 text-blue-100 sm:mt-3 sm:text-sm sm:leading-6">
                        No hidden charges. No subscriptions.
                        <span className="block">
                            Just quality education for everyone.
                        </span>
                    </p>
                </div>

                <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center sm:right-10 lg:right-20">
                    <div className="absolute h-24 w-24 rounded-full border border-white/10 sm:h-36 sm:w-36" />

                    <div className="absolute h-19 w-19 rounded-full bg-white/10 blur-md sm:h-28 sm:w-28" />

                    <div className="relative flex h-18 w-18 rotate-[-6deg] items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-white shadow-xl backdrop-blur-sm transition duration-300 hover:rotate-0 sm:h-24 sm:w-24 sm:rounded-3xl">
                        <BookOpen
                            size={35}
                            strokeWidth={1.5}
                            className="sm:h-12 sm:w-12"
                        />
                    </div>

                    <Sparkles
                        size={15}
                        className="absolute -right-1 -top-2 text-blue-200 sm:-right-3 sm:-top-4 sm:h-5 sm:w-5"
                    />
                </div>
            </div>
        </section>
    );
};

export default FreeEducationBanner;