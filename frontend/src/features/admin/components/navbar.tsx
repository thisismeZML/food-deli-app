import { ModeToggle } from "@/components/ui/mode-toggle";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { DynamicBreadcrumb } from "./breadcrumb";
const Navbar = () => {
  return (
    <header
      className={`fixed top-0 z-30 h-16 transition-all duration-300 right-0 left-(--sidebar-width)
`}
    >
      <div className="px-6 h-full flex items-center relative">
        <SidebarTrigger variant="outline" className="hidden" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-full pointer-events-none">
          <span className="font-semibold text-lg"></span>
        </div>
        <div className="flex justify-between items-center w-full mr-12">
          <div className={`font-semibold  text-[#051463]`}>
            <DynamicBreadcrumb />
          </div>
          <div>
            {ModeToggle()}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
