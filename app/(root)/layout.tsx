import { ChildProps } from "@/types"
import { CustomerAuthProvider } from "@/components/providers/customer-auth"
import Navbar from "./_components/navbar"
import Footer from "./_components/footer"
import ParticleField from "./_components/particleField"
import MotionEffects from "@/components/shared/motion-effects"

function Layout({children}: ChildProps) {
  return (
    <CustomerAuthProvider>
    {/* Particle ring background: home page only (a lighter one on phones) */}
    <ParticleField />
    {/* Scroll reveals, card tilt, magnetic buttons, scroll progress */}
    <MotionEffects />
    <main className="relative z-10">
    <Navbar/>
<div className='container'>{children}</div>
    <Footer/>
</main>
    </CustomerAuthProvider>
  )
}

export default Layout
