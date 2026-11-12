import { ChildProps } from "@/types"
import { CustomerAuthProvider } from "@/components/providers/customer-auth"
import Navbar from "./_components/navbar"
import Footer from "./_components/footer"
import SiteMotion from "./_components/siteMotion"

function Layout({children}: ChildProps) {
  return (
    <CustomerAuthProvider>
    <main className="public-site relative z-10">
    <SiteMotion />
    <Navbar/>
<div className='container'>{children}</div>
    <Footer/>
</main>
    </CustomerAuthProvider>
  )
}

export default Layout
