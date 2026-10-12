import { ChildProps } from "@/types"
import { CustomerAuthProvider } from "@/components/providers/customer-auth"
import Navbar from "./_components/navbar"
import Footer from "./_components/footer"

function Layout({children}: ChildProps) {
  return (
    <CustomerAuthProvider>
    <main>
    <Navbar/>
<div className='container'>{children}</div>
    <Footer/>
</main>
    </CustomerAuthProvider>
  )
}

export default Layout
