import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import Link from "next/link"

export default function AuthenticatedLayout({ children }) {
  return (
    <div className="relative">
      {/* Mobile Sheet/Drawer */}
      <Sheet>
        <SheetTrigger asChild className="absolute left-4 top-4 lg:hidden">
          <Button variant="outline" size="icon">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] sm:w-[400px]">
          <nav className="flex flex-col gap-4">
            <Link href="/dashboard" className="text-lg font-semibold">
              Dashboard
            </Link>
            <Link href="/profile" className="text-lg font-semibold">
              Profile
            </Link>
            <Link href="/settings" className="text-lg font-semibold">
              Settings
            </Link>
          </nav>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex h-screen w-64 flex-col fixed left-0 top-0 bottom-0 border-r bg-background">
        <div className="p-6">
          <h2 className="text-lg font-semibold">Navigation</h2>
        </div>
        <nav className="flex flex-col gap-4 p-6">
          <Link href="/dashboard" className="text-lg font-semibold">
            Dashboard
          </Link>
          <Link href="/profile" className="text-lg font-semibold">
            Profile
          </Link>
          <Link href="/settings" className="text-lg font-semibold">
            Settings
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64">
        {children}
      </div>
    </div>
  )
}