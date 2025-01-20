import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import Link from "next/link"
import DashboardNavbar from "@/components/DashboardNav"
export default function AuthenticatedLayout({ children }) {
  return (
    <div>
      <DashboardNavbar />

      {/* Mobile Sheet/Drawer */}
      <Sheet>
        <SheetTrigger asChild className="fixed left-4 top-4 lg:hidden z-40">
          <Button variant="outline" size="icon">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] sm:w-[400px] pt-16">
          <nav className="flex flex-col gap-4">
            <Link href="/dashboard" className="text-lg font-semibold">
              Dashboard
            </Link>
            <Link href="/profile" className="text-lg font-semibold">
              Profile
            </Link>
            <Link href="/usersettings" className="text-lg font-semibold">
              User Settings
            </Link>
          </nav>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex h-[calc(100vh-64px)] w-64 flex-col fixed left-0 top-16 bottom-0 border-r bg-background">
        <nav className="flex flex-col gap-4 p-6">
          <Link href="/dashboard" className="text-lg font-semibold">
            Dashboard Home
          </Link>
          <Link href="/profile" className="text-lg font-semibold">
            Profile
          </Link>
          <Link href="/usersettings" className="text-lg font-semibold">
            User Settings
          </Link>
          <Link href="/dashboard/create" className="text-lg font-semibold">
            Create New
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64 pt-16">
        {children}
      </div>
    </div>
  )
}