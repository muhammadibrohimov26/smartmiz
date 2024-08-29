import { ChildProps } from "@/types"
import Navbar from "../_components/navbar"

function Layout({children}: ChildProps) {
  return (
    <div>
        <Navbar/>
        {children}
    </div>
  )
}

export default Layout