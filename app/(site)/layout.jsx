import { Navbar } from "@/components/layout/navbar"

export default function SiteLayout({ children }) {
  return (
    <>
      <Navbar />
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
    </>
  )
}
