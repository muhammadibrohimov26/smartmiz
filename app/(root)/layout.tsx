import { ChildProps } from "@/types"
import { CustomerAuthProvider } from "@/components/providers/customer-auth"
import Navbar from "./_components/navbar"
import Footer from "./_components/footer"
import ParticleField from "./_components/particleField"

function Layout({children}: ChildProps) {
  return (
    <CustomerAuthProvider>
    {/* Site-wide pointer-following background; content sits above it */}
    <ParticleField />
    <main className="relative z-10">
    <Navbar/>
<div className='container'>{children}</div>
    <Footer/>
</main>
    </CustomerAuthProvider>
  )
}

export default Layout
