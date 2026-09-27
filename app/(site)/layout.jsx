import { Navbar } from "@/components/layout/navbar"

import { Footer } from "@/components/layout/footer"

export default function SiteLayout({ children }) {
  return (
    <>
      <Navbar />
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
      <Footer />
    </>
  )
}
