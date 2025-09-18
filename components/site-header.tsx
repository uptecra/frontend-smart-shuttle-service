import { SidebarTrigger } from '@/components/ui/sidebar'

export function SiteHeader({ children, showTrigger = true }: { children?: React.ReactNode; showTrigger?: boolean }) {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center px-4 lg:px-6 gap-3">
        {showTrigger ? <SidebarTrigger className="-ml-1" /> : null}
        {children}
      </div>
    </header>
  )
}
