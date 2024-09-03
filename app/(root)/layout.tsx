import { ChildProps } from "@/types"
import Navbar from "./_components/navbar"

function Layout({children}: ChildProps) {
  return (
    <main>
    <Navbar/>
<div className='container'>{children}</div>

</main>
  )
}

export default Layout