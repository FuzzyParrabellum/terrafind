import Navbar from './components/Navbar'
import Hero from './components/Hero'
import StatsBar from './components/StatsBar'
import Sidebar from './components/Sidebar'
import ResultsList from './components/ResultsList'

export default function App() {
  return (
    <div className="bg-stone-50 text-stone-900 font-sans antialiased">
      <Navbar />
      <Hero />
      <StatsBar />
      <div className="flex min-h-screen">
        <Sidebar />
        <ResultsList />
      </div>
    </div>
  )
}
