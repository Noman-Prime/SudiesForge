import { EventProvider } from "@/context/EventContext"
import Navbar from "./components/navbar"
import Slider from "./components/slider"

const Home = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <EventProvider >
        <Navbar />
      </EventProvider>
      <Slider />
    </div>
  )
}

export default Home