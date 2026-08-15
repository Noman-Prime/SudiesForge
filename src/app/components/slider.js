"use client";

import axios from "axios";
import { GraduationCap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const Slider = () => {
    const [sliders, setSliders] = useState([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [paused, setPaused] = useState(false);

    const activeSliders = useMemo(() => {
        return [...sliders]
            .filter((item) => item.active)
            .sort((first, second) => new Date(first.createdAt) - new Date(second.createdAt));
    }, [sliders]);

    const getSliders = async () => {
        try {
            const result = await axios.get("/api/slider");

            if (result.data.success) {
                setSliders(result.data.sliders || []);
            } else {
                setSliders([]);
            }
        } catch (error) {
            console.log(error);
            setSliders([]);
        }
    };

    useEffect(() => {
        getSliders();
    }, []);

    useEffect(() => {
        setCurrentSlide((previous) => {
            if (activeSliders.length === 0) {
                return 0;
            }

            return Math.min(previous, activeSliders.length - 1);
        });
    }, [activeSliders.length]);

    useEffect(() => {
        if (activeSliders.length <= 1 || paused) {
            return;
        }

        const interval = window.setInterval(() => {
            setCurrentSlide((previous) => (previous + 1) % activeSliders.length);
        }, 4000);

        return () => window.clearInterval(interval);
    }, [activeSliders.length, paused]);

    if (activeSliders.length === 0) {
        return null;
    }

    const current = activeSliders[currentSlide] || activeSliders[0];
    const hasImage = current.type === "withImage" && current.image?.url;

    return (
        <section onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} aria-roledescription="carousel" aria-label="StudiesForge highlights" className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-br from-white via-blue-50/50 to-slate-50">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -right-24 -top-32 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl sm:h-96 sm:w-96" />
                <div className="absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-sky-100/70 blur-3xl sm:h-96 sm:w-96" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(37,99,235,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(37,99,235,0.025)_1px,transparent_1px)] bg-[size:36px_36px]" />
            </div>

            <div key={current._id} className="slider-content relative z-10 mx-auto min-h-[250px] w-full max-w-[1300px] sm:min-h-[310px] lg:min-h-[370px]">
                {hasImage ? (
                    <div className="grid min-h-[250px] grid-cols-[minmax(0,1.15fr)_minmax(110px,0.85fr)] items-center gap-3 px-4 pb-9 pt-5 sm:min-h-[310px] sm:grid-cols-[1.1fr_0.9fr] sm:gap-8 sm:px-8 sm:pb-11 sm:pt-7 lg:min-h-[370px] lg:gap-12 lg:px-12 xl:px-16">
                        <div className="min-w-0">
                            <div className="flex w-fit items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-3 py-1.5 shadow-sm backdrop-blur">
                                <GraduationCap size={13} className="text-blue-600" />
                                <span className="text-[7px] font-extrabold uppercase tracking-[0.16em] text-blue-700 sm:text-[9px]">StudiesForge Learning</span>
                            </div>

                            <h1 className="mt-3 max-w-3xl text-[21px] font-extrabold leading-[1.12] tracking-[-0.03em] text-[#071a4a] sm:mt-4 sm:text-[32px] lg:text-[44px]">
                                {current.heading}

                                {current.highlightedText && (
                                    <span className="mt-1 block text-blue-600">{current.highlightedText}</span>
                                )}
                            </h1>

                            {current.description && (
                                <p className="mt-3 line-clamp-3 max-w-xl text-[9px] leading-4 text-slate-600 sm:mt-4 sm:text-xs sm:leading-5 lg:text-sm lg:leading-6">
                                    {current.description}
                                </p>
                            )}
                        </div>

                        <div className="relative flex h-full min-w-0 items-center justify-center">
                            <div className="absolute h-28 w-28 rounded-full bg-blue-200/70 blur-2xl sm:h-52 sm:w-52 lg:h-72 lg:w-72" />

                            <div className="relative aspect-square w-full max-w-[120px] overflow-hidden rounded-2xl border-4 border-white bg-white shadow-[0_18px_45px_rgba(15,42,99,0.2)] sm:max-w-[210px] sm:rounded-[28px] lg:max-w-[285px] lg:rounded-[36px]">
                                <img src={current.image.url} alt={current.heading || "StudiesForge slider"} loading="eager" decoding="async" className="h-full w-full object-cover" />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex min-h-[250px] items-center justify-center px-5 pb-10 pt-6 text-center sm:min-h-[310px] sm:px-10 sm:pb-12 sm:pt-8 lg:min-h-[370px] lg:px-16">
                        <div className="relative z-10 mx-auto flex max-w-[850px] flex-col items-center">
                            <div className="flex items-center gap-2 rounded-full border border-blue-100 bg-white/85 px-3 py-1.5 shadow-sm backdrop-blur">
                                <GraduationCap size={13} className="text-blue-600" />
                                <span className="text-[7px] font-extrabold uppercase tracking-[0.16em] text-blue-700 sm:text-[9px]">StudiesForge Learning</span>
                            </div>

                            <h1 className="mt-3 text-[23px] font-extrabold leading-[1.1] tracking-[-0.035em] text-[#071a4a] sm:mt-4 sm:text-[34px] lg:text-[48px]">
                                {current.heading}

                                {current.highlightedText && (
                                    <span className="mt-1 block text-blue-600">{current.highlightedText}</span>
                                )}
                            </h1>

                            {current.description && (
                                <p className="mt-3 line-clamp-3 max-w-2xl text-[9px] leading-4 text-slate-600 sm:mt-4 sm:text-xs sm:leading-5 lg:text-sm lg:leading-6">
                                    {current.description}
                                </p>
                            )}

                            <div className="mt-4 flex items-center gap-2 sm:mt-5">
                                <span className="h-px w-8 bg-blue-200 sm:w-12" />
                                <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                                <span className="h-px w-8 bg-blue-200 sm:w-12" />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {activeSliders.length > 1 && (
                <div className="absolute bottom-3 left-1/2 z-30 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-blue-100 bg-white/85 px-2.5 py-1.5 shadow-sm backdrop-blur">
                    {activeSliders.map((item, index) => (
                        <button key={item._id} type="button" aria-label={`Show slide ${index + 1}`} aria-current={currentSlide === index ? "true" : undefined} onClick={() => setCurrentSlide(index)} className={`h-1.5 rounded-full transition-all duration-300 ${currentSlide === index ? "w-6 bg-blue-600" : "w-1.5 bg-blue-200 hover:bg-blue-400"}`} />
                    ))}
                </div>
            )}

            <style jsx>{`
                .slider-content {
                    animation: slider-change 450ms ease-out;
                }

                @keyframes slider-change {
                    from {
                        opacity: 0;
                        transform: translateY(5px);
                    }

                    to {
                        opacity: 1;
                        transform: translateY(0);
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