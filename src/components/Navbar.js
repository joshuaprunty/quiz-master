import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="w-full bg-foreground text-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="">
              Quiz Master
            </Link>
          </div>
          <div className="flex space-x-4">
            <Link href="/" className="hover:text-gray-300">
              Home
            </Link>
            <Link href="/testpage" className="hover:text-gray-300">
              Test Page
            </Link>
            <Link href="/login" className="hover:text-gray-300">
              Login
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}