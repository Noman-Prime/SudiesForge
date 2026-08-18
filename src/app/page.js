import { EventProvider } from "@/context/EventContext"
import Navbar from "./components/navbar"
import Slider from "./components/slider"
import CategoryCollection from "./components/resources"
import PopularEvents from "./components/popular"
import RecentOpened from "./components/recent"
import PopularSubjects from "./components/subjects"
import FreeEducationBanner from "./components/free"
import Footer from "./components/footer"
import PastPapers from "./components/latest"
import PastPaperPage from "./components/latest"
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
      <PastPaperPage />
      <FreeEducationBanner />
      <Footer />
    </div>
  )
}

export default Home