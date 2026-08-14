import Footer from "@/app/components/footer";
import Navbar from "@/app/components/navbar";
import { EventProvider } from "@/context/EventContext";
import EventStartBanner from "./components/banner";
import EventMaterials from "./components/material";
import EventNavigation from "./components/navigation";
import EventOverview from "./components/overview";
import EventSubjects from "./components/subjects";
import EventSummary from "./components/summary";

const EventPage = () => {
    return (
        <>
            <EventProvider>
                <Navbar />
            </EventProvider>

            <main className="min-h-screen bg-slate-50 px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
                <div className="mx-auto w-full max-w-[1300px]">
                    <EventSummary />

                    <div className="mt-4 lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start lg:gap-5">
                        <aside className="lg:sticky lg:top-24">
                            <EventNavigation />
                        </aside>

                        <section className="mt-4 space-y-4 lg:mt-0">
                            <div id="overview" className="scroll-mt-24">
                                <EventOverview />
                            </div>

                            <div id="subjects" className="scroll-mt-24">
                                <EventSubjects />
                            </div>

                            <div id="materials" className="scroll-mt-24">
                                <EventMaterials />
                            </div>

                            <EventStartBanner />
                        </section>
                    </div>
                </div>
            </main>

            <Footer />
        </>
    );
};

export default EventPage;