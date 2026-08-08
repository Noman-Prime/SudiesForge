"use client";

import axios from "axios";
import { GraduationCap } from "lucide-react";
import { useEffect, useState } from "react";

const Slider = () => {
    const [sliders, setSliders] = useState([]);
    const [currentSlide, setCurrentSlide] = useState(0);

    const getSliders = async () => {
        try {
            const result = await axios.get("/api/slider");

            if (result.data.success) {
                setSliders(result.data.sliders || []);
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        getSliders();
    }, []);

    const activeSliders = [...sliders]
        .filter((item) => item.active)
        .sort(
            (first, second) =>
                new Date(first.createdAt) -
                new Date(second.createdAt),
        );

    useEffect(() => {
        setCurrentSlide(0);
    }, [activeSliders.length]);

    useEffect(() => {
        if (activeSliders.length <= 1) {
            return;
        }

        const interval = setInterval(() => {
            setCurrentSlide(
                (previous) =>
                    (previous + 1) % activeSliders.length,
            );
        }, 3000);

        return () => clearInterval(interval);
    }, [activeSliders.length]);

    if (activeSliders.length === 0) {
        return null;
    }

    const current =
        activeSliders[currentSlide] || activeSliders[0];

    const hasImage =
        current.type === "withImage" &&
        current.image?.url;

    return (
        <section
            className={`relative h-[240px] overflow-hidden border-b border-slate-200 sm:h-[300px] md:h-[360px] lg:h-[400px] ${hasImage
                    ? "bg-gradient-to-br from-white via-[#f7faff] to-[#edf5ff]"
                    : "bg-gradient-to-br from-[#eef5ff] via-white to-[#f7faff]"
                }`}
        >
            {hasImage ? (
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute -right-20 -top-24 h-56 w-56 rounded-full bg-blue-100/80 blur-2xl sm:-right-24 sm:-top-32 sm:h-80 sm:w-80 md:-right-32 md:-top-48 md:h-[520px] md:w-[520px]" />

                    <div className="absolute -bottom-32 -left-28 h-64 w-64 rounded-full bg-sky-100/70 blur-3xl md:h-96 md:w-96" />

                    <div className="absolute inset-y-0 right-[18%] hidden w-px bg-gradient-to-b from-transparent via-blue-100 to-transparent lg:block" />
                </div>
            ) : (
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute -right-24 -top-40 h-80 w-80 rounded-full border border-blue-100/80 bg-blue-100/45 sm:h-[430px] sm:w-[430px]" />

                    <div className="absolute -right-10 -top-24 h-60 w-60 rounded-full border border-white/90 bg-white/35 sm:h-[330px] sm:w-[330px]" />

                    <div className="absolute -bottom-44 -left-32 h-80 w-80 rounded-full bg-sky-100/70 blur-2xl sm:h-[450px] sm:w-[450px]" />

                    <div className="absolute left-[12%] top-[18%] h-2 w-2 rounded-full bg-blue-300/60" />

                    <div className="absolute right-[18%] top-[26%] h-3 w-3 rounded-full bg-blue-200/60" />

                    <div className="absolute bottom-[20%] right-[10%] h-2 w-2 rounded-full bg-blue-300/50" />

                    <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(37,99,235,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(37,99,235,0.025)_1px,transparent_1px)] bg-[size:36px_36px]" />
                </div>
            )}

            <div
                key={current._id}
                className="slider-content relative z-10 mx-auto h-full w-full max-w-[1500px]"
            >
                {hasImage ? (
                    <div className="grid h-full grid-cols-[minmax(0,1.15fr)_minmax(105px,0.85fr)] items-center gap-2.5 px-4 pb-7 pt-4 sm:grid-cols-[minmax(0,1.1fr)_minmax(170px,0.9fr)] sm:gap-6 sm:px-7 sm:pb-9 sm:pt-6 md:grid-cols-[1.08fr_0.92fr] md:gap-10 md:px-12 md:py-8 lg:gap-14 lg:px-16 xl:px-20">
                        <div className="flex h-full min-w-0 flex-col justify-center overflow-hidden text-left">
                            <div className="mb-2 flex items-center gap-1.5 sm:mb-3 sm:gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-blue-600 sm:h-2 sm:w-2" />

                                <span className="truncate text-[7px] font-bold uppercase tracking-[0.16em] text-blue-600 sm:text-[9px] md:text-[10px]">
                                    StudiesForge Learning
                                </span>
                            </div>

                            <h1 className="min-w-0 font-extrabold leading-[1.1] tracking-[-0.03em] text-[#071a4a]">
                                <span className="line-clamp-2 text-[18px] sm:text-[26px] md:text-[35px] lg:text-[42px]">
                                    {current.heading}
                                </span>

                                <span className="mt-1 line-clamp-2 text-[18px] text-blue-600 sm:text-[26px] md:text-[35px] lg:text-[42px]">
                                    {current.highlightedText}
                                </span>
                            </h1>

                            <p className="mt-2.5 line-clamp-3 max-w-[570px] text-[9px] leading-4 text-slate-600 sm:mt-4 sm:text-xs sm:leading-5 md:mt-5 md:text-sm md:leading-6">
                                {current.description}
                            </p>
                        </div>

                        <div className="relative mx-auto flex h-full w-full min-w-0 items-center justify-center">
                            <div className="absolute h-[125px] w-[125px] rounded-full bg-blue-200/60 blur-xl sm:h-[195px] sm:w-[195px] md:h-[285px] md:w-[285px] lg:h-[330px] lg:w-[330px]" />

                            <div className="absolute h-[119px] w-[119px] rounded-full border border-blue-200 bg-white/65 shadow-[0_20px_60px_rgba(37,99,235,0.15)] backdrop-blur-sm sm:h-[188px] sm:w-[188px] md:h-[278px] md:w-[278px] lg:h-[318px] lg:w-[318px]" />

                            <div className="absolute h-[111px] w-[111px] rounded-full border border-white bg-blue-50/80 sm:h-[178px] sm:w-[178px] md:h-[266px] md:w-[266px] lg:h-[306px] lg:w-[306px]" />

                            <div className="relative h-[103px] w-[103px] overflow-hidden rounded-full border-[3px] border-white bg-white shadow-[0_14px_35px_rgba(15,42,99,0.2)] sm:h-[166px] sm:w-[166px] sm:border-4 md:h-[250px] md:w-[250px] lg:h-[290px] lg:w-[290px]">
                                <img
                                    src={current.image.url}
                                    alt={current.heading}
                                    loading="eager"
                                    decoding="async"
                                    className="h-full w-full rounded-full object-cover"
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="relative flex h-full items-center justify-center px-5 pb-8 pt-5 text-center sm:px-10 sm:pb-10 sm:pt-7 md:px-16 lg:px-20">
                        <div className="absolute left-[5%] top-1/2 hidden h-32 w-32 -translate-y-1/2 items-center justify-center rounded-full border border-blue-100 bg-white/60 shadow-sm lg:flex">
                            <GraduationCap
                                size={52}
                                className="text-blue-200/70"
                            />
                        </div>

                        <div className="absolute right-[5%] top-1/2 hidden h-32 w-32 -translate-y-1/2 items-center justify-center rounded-full border border-blue-100 bg-white/60 shadow-sm lg:flex">
                            <GraduationCap
                                size={52}
                                className="-rotate-12 text-blue-200/70"
                            />
                        </div>

                        <div className="relative z-10 flex max-w-[900px] flex-col items-center">
                            <div className="mb-2 flex items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-3 py-1 shadow-sm backdrop-blur-sm sm:mb-3 sm:px-4 sm:py-1.5">
                                <GraduationCap
                                    size={12}
                                    className="text-blue-600 sm:h-4 sm:w-4"
                                />

                                <span className="text-[7px] font-bold uppercase tracking-[0.18em] text-blue-700 sm:text-[9px] md:text-[10px]">
                                    StudiesForge Learning
                                </span>
                            </div>

                            <h1 className="font-extrabold leading-[1.08] tracking-[-0.035em] text-[#071a4a]">
                                <span className="line-clamp-2 text-[22px] sm:text-[30px] md:text-[40px] lg:text-[48px]">
                                    {current.heading}
                                </span>

                                <span className="mt-1 line-clamp-2 text-[22px] text-blue-600 sm:text-[30px] md:text-[40px] lg:text-[48px]">
                                    {current.highlightedText}
                                </span>
                            </h1>

                            <p className="mt-3 line-clamp-3 max-w-[680px] text-[9px] leading-4 text-slate-600 sm:mt-4 sm:text-xs sm:leading-5 md:mt-5 md:text-sm md:leading-6">
                                {current.description}
                            </p>

                            <div className="mt-3 flex items-center gap-2 sm:mt-5">
                                <span className="h-px w-8 bg-blue-200 sm:w-12" />

                                <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />

                                <span className="h-px w-8 bg-blue-200 sm:w-12" />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {activeSliders.length > 1 && (
                <div className="absolute bottom-2.5 left-1/2 z-30 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-blue-100 bg-white/70 px-2.5 py-1.5 shadow-sm backdrop-blur-sm sm:bottom-3">
                    {activeSliders.map((item, index) => (
                        <button
                            key={item._id}
                            type="button"
                            aria-label={`Show slider ${index + 1}`}
                            onClick={() => setCurrentSlide(index)}
                            className={`h-1.5 rounded-full transition-all duration-300 ${currentSlide === index
                                    ? "w-6 bg-blue-600"
                                    : "w-1.5 bg-blue-200 hover:bg-blue-300"
                                }`}
                        />
                    ))}
                </div>
            )}

            <style jsx>{`
        .slider-content {
          animation: sliderChange 450ms ease-out;
        }

        @keyframes sliderChange {
          from {
            opacity: 0;
          }

          to {
            opacity: 1;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .slider-content {
            animation: none;
          }
        }
      `}</style>
        </section>
    );
};

export default Slider;