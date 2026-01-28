import { RouterProvider } from "react-router-dom"
import router from "./routers/route"
import { Toaster } from "sonner"
import { ThemeSync } from "./components/ui/theme-sync"

const App = () => {
  return (
    <>
      <ThemeSync />
      <RouterProvider router={router} />
      <Toaster position="top-right" />
    </>
  )
}

export default App
