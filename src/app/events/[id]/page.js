import Footer from "@/app/components/footer";
import Navbar from "@/app/components/navbar";
import { EventProvider } from "@/context/EventContext";
import EventStartBanner from "./components/banner";
import EventMaterials from "./components/material";
import EventNavigation from "./components/navigation";
import EventOverview from "./components/overview";
import EventSubjects from "./components/subjects";
import EventSummary from "./components/summary";

const Events = () => {
    return (
        <>
            <EventProvider>
                <Navbar />
            </EventProvider>

            <main className="min-h-screen bg-slate-50 px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
                <div className="mx-auto w-full max-w-[1300px]">
                    <EventSummary />

                    <div className="mt-5 lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start lg:gap-5">
                        <div className="lg:sticky lg:top-24">
                            <EventNavigation />
                        </div>

                        <div className="mt-5 space-y-5 lg:mt-0">
                            <div
                                id="overview"
                                className="scroll-mt-24"
                            >
                                <EventOverview />
                            </div>

                            <EventSubjects />

                            <div
                                id="materials"
                                className="scroll-mt-24"
                            >
                                <EventMaterials />
                            </div>

                            <EventStartBanner />
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </>
    );
};

export default Events;