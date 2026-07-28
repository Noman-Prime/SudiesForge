import { EventProvider } from "@/context/EventContext"
import Navbar from "./components/navbar"

const Home = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <EventProvider >
        <Navbar />
      </EventProvider>
    </div>
  )
}

export default Home