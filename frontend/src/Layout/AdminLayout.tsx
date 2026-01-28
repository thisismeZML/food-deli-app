import { Outlet } from "react-router-dom"
import {
  SidebarProvider,
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/features/admin/components/app-sidebar"
import Navbar from "@/features/admin/components/navbar"

const AdminLayout = () => {
  return (
    <SidebarProvider>
      <AppSidebar />
      {/* Navbar */}
            <div
                className={`fixed top-0 transition-all duration-300
                right-0 z-50 h-16 bg-muted/50 border-b shadow-sm flex items-center`}
            >
                <Navbar />
            </div>
       {/* Main content */}
            <div className="transition-all duration-300 pt-18 flex flex-col min-h-screen w-full bg-gray-100">
                <main
                    className={`grow transition-all duration-300 mx-10`}
                >
                    <div>
                        <Outlet />
                    </div>
                </main>
            </div>
    </SidebarProvider>
  )
}

export default AdminLayout
