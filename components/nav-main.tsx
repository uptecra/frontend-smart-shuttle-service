"use client"

import { IconFileImport, IconFileExport, IconDashboard, type Icon } from "@tabler/icons-react"
import * as XLSX from 'xlsx'

import { Button } from "@/components/ui/button"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

// Excel işlemleri için yardımcı fonksiyonlar
const exportToExcel = (data: any[], filename: string = 'export.xlsx') => {
  try {
    // Örnek veri yapısı (gerçek uygulamada bu veri props olarak gelebilir)
    const sampleData = data.length > 0 ? data : [
      { 'ID': 1, 'Ad': 'Örnek Veri 1', 'Tarih': new Date().toLocaleDateString('tr-TR') },
      { 'ID': 2, 'Ad': 'Örnek Veri 2', 'Tarih': new Date().toLocaleDateString('tr-TR') }
    ];
    
    // Excel çalışma kitabı oluştur
    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Veri');
    
    // Excel dosyasını indir
    XLSX.writeFile(wb, filename);
    
    console.log('Excel dosyası başarıyla oluşturuldu:', filename);
  } catch (error) {
    console.error('Excel export hatası:', error);
    alert('Excel dosyası oluşturulurken hata oluştu!');
  }
};

export function NavMain({
  items,
  activeTab,
  setActiveTab,
  exportData,
  onImportData,
}: {
  items: {
    title: string
    url: string
    icon?: Icon
    key: string
    subItems?: {
      title: string
      key: string
      icon?: Icon
    }[]
  }[]
  activeTab?: string
  setActiveTab?: (tab: string) => void
  exportData?: any[]
  onImportData?: (data: any[]) => void
}) {
  // Excel import fonksiyonu component içinde tanımlandı
  const importFromExcel = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const reader = new FileReader();
          reader.onload = (event) => {
            try {
              const data = new Uint8Array(event.target?.result as ArrayBuffer);
              const workbook = XLSX.read(data, { type: 'array' });
              
              // İlk sayfayı al
              const firstSheetName = workbook.SheetNames[0];
              const worksheet = workbook.Sheets[firstSheetName];
              
              // JSON formatına dönüştür
              const jsonData = XLSX.utils.sheet_to_json(worksheet);
              
              console.log('Excel dosyasından okunan veri:', jsonData);
              alert(`Excel dosyası başarıyla yüklendi! ${jsonData.length} satır veri okundu.`);
              
              // Callback ile veriyi parent component'e gönder
              if (onImportData) {
                onImportData(jsonData);
              }
              
            } catch (error) {
              console.error('Excel dosyası okuma hatası:', error);
              alert('Excel dosyası okunurken hata oluştu!');
            }
          };
          reader.readAsArrayBuffer(file);
        } catch (error) {
          console.error('Dosya okuma hatası:', error);
          alert('Dosya okunurken hata oluştu!');
        }
      }
    };
    input.click();
  };

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              tooltip="Dashboard"
              onClick={() => setActiveTab?.("dashboard")}
              className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
            >
              <IconDashboard />
              <span>Dashboard</span>
            </SidebarMenuButton>
            <Button
              size="icon"
              onClick={() => exportToExcel(exportData || [], 'dashboard-data.xlsx')}
              className="size-8 group-data-[collapsible=icon]:opacity-0 bg-transparent"
              variant="outline"
              title="Excel olarak dışa aktar"
            >
              <IconFileExport />
              <span className="sr-only">Excel Export</span>
            </Button>
            <Button
              size="icon"
              onClick={importFromExcel}
              className="size-8 group-data-[collapsible:icon]:opacity-0 bg-transparent"
              variant="outline"
              title="Excel dosyasından içe aktar"
            >
              <IconFileImport />
              <span className="sr-only">Excel Import</span>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {items.map((item) => (
            <div key={item.title}>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip={item.title}
                  onClick={() => { setActiveTab?.(item.key); if (typeof window !== 'undefined') window.location.hash = item.key; }}
                  className={activeTab === item.key ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""}
                >
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {item.subItems && (
                <div className="ml-4">
                  {item.subItems.map((subItem) => (
                    <SidebarMenuItem key={subItem.key}>
                      <SidebarMenuButton
                        tooltip={subItem.title}
                        onClick={() => { setActiveTab?.(subItem.key); if (typeof window !== 'undefined') window.location.hash = subItem.key; }}
                        className={`text-sm ${activeTab === subItem.key ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""}`}
                      >
                        {subItem.icon && <subItem.icon />}
                        <span>{subItem.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </div>
              )}
            </div>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
