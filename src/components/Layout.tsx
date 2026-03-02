import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useFactory } from "@/lib/factoryContext";
import { Factory, LogOut, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { activeFactory, logout } = useFactory();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 border-b bg-card flex items-center px-4 sticky top-0 z-10">
            <SidebarTrigger />
            <h1 className="ml-4 text-lg font-semibold text-foreground">Grey Manufacturing ERP</h1>

            {/* Active factory indicator */}
            {activeFactory && (
              <div className="ml-auto flex items-center gap-3">
                <div className="factory-header-badge" style={{ '--factory-color': activeFactory.color } as React.CSSProperties}>
                  <div
                    className="factory-header-dot"
                    style={{ background: activeFactory.color }}
                  />
                  <Factory className="h-3.5 w-3.5 opacity-70" />
                  <span className="factory-header-name">{activeFactory.name}</span>
                  <span className="factory-header-sep">•</span>
                  <MapPin className="h-3 w-3 opacity-60" />
                  <span className="factory-header-location">{activeFactory.location}</span>
                </div>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={logout}
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Switch Factory</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            )}
          </header>
          <main className="flex-1 p-6 bg-muted/20">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
