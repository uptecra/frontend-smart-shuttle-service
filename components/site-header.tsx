import { SidebarTrigger } from '@/components/ui/sidebar'

export function SiteHeader() {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center px-4 lg:px-6">
        <SidebarTrigger className="-ml-1" />
      </div>
    </header>
  )
}
