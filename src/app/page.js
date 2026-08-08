import { EventProvider } from "@/context/EventContext"
import Navbar from "./components/navbar"
import Slider from "./components/slider"
import CategoryCollection from "./components/resources"
import PopularEvents from "./components/popular"
import RecentOpened from "./components/recent"
import PopularSubjects from "./components/subjects"
import LatestResources from "./components/latest"
import FreeEducationBanner from "./components/free"
import Footer from "./components/footer"
const Home = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <EventProvider >
        <Navbar />
      </EventProvider>
      <Slider />
      <CategoryCollection />
      <PopularEvents />
      <RecentOpened />
      <PopularSubjects />
      <LatestResources />
      <FreeEducationBanner />
      <Footer />
    </div>
  )
}

export default Home