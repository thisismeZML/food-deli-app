import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useThemeStore } from "@/stores/theme.store"

export function ModeToggle() {
  const {  toggle } = useThemeStore()

  return (
    <Button
      variant="icon"
      size="icon"
      onClick={toggle}
      aria-label="Toggle theme"
      className="relative cursor-pointer"
    >
      {/* Sun */}
      <Sun
        className="h-[1.4rem] w-[1.4rem] transition-all
          scale-100 rotate-0
          dark:scale-0 dark:-rotate-90 text-yellow-500"
      />

      {/* Moon */}
      <Moon
        className="absolute h-[1.2rem] w-[1.2rem] transition-all
          scale-0 rotate-90
          dark:scale-100 dark:rotate-0 dark:text-black"
      />
    </Button>
  )
}
