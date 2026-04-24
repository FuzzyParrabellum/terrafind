import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export const Route = createRootRoute({
  component: () => (
    <div className="bg-stone-50 text-stone-900 font-sans antialiased flex flex-col min-h-screen">
      <Navbar />
      <Outlet />
      <Footer />
      <TanStackRouterDevtools />
    </div>
  ),
})
