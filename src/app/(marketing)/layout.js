import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"

export default function MarketingLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  )
}