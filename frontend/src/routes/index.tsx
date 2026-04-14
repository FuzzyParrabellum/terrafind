import { createFileRoute } from '@tanstack/react-router'
import Hero from '../components/Hero'
import StatsBar from '../components/StatsBar'
import Sidebar from '../components/Sidebar'
import ResultsList from '../components/ResultsList'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <>
      <Hero />
      <StatsBar />
      <div className="flex min-h-screen">
        <Sidebar />
        <ResultsList />
      </div>
    </>
  )
}
