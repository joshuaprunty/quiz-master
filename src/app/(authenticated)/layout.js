import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import Link from "next/link"
import DashboardNavbar from "@/components/DashboardNav"
import { GoHome } from "react-icons/go";
import { TbSettings } from "react-icons/tb";
import { IoAddCircleOutline } from "react-icons/io5";
import { FaRegUserCircle } from "react-icons/fa";
import { MdFolderOpen } from "react-icons/md";
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
          <Link href="/dashboard" className="text-lg flex items-center gap-2">
            <GoHome className="h-6 w-6" />
            Home
          </Link>
          <Link href="/profile" className="text-lg flex items-center gap-2">
            <FaRegUserCircle className="h-6 w-6" />
            Profile
          </Link>
          <Link href="/usersettings" className="text-lg flex items-center gap-2">
            <TbSettings className="h-6 w-6" />
            Settings
          </Link>
          <Link href="/dashboard/create" className="text-lg flex items-center gap-2">
            <IoAddCircleOutline className="h-6 w-6" />
            Create New
          </Link>
          <Link href="/dashboard/library" className="text-lg flex items-center gap-2">
            <MdFolderOpen className="h-6 w-6" />
            Library
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