import { ChildProps } from "@/types"

// Re-mounted on every navigation, so each page rises in softly
export default function Template({ children }: ChildProps) {
  return <div className="page-enter">{children}</div>
}
