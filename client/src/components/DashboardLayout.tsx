import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { startLogin } from "@/const";
import { roleLabel } from "@/lib/tickets";
import {
  BarChart3,
  BookOpenCheck,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  PlusCircle,
} from "lucide-react";
import { useLocation } from "wouter";

const menuItems = [
  { icon: LayoutDashboard, label: "Tickets", path: "/" },
  { icon: PlusCircle, label: "Nuevo ticket", path: "/tickets/nuevo" },
  { icon: BarChart3, label: "Indicadores", path: "/indicadores" },
  { icon: BookOpenCheck, label: "Documentación", path: "/documentacion" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { loading, user, logout } = useAuth();
  const [location, setLocation] = useLocation();

  if (loading) {
    return <div className="grid min-h-screen place-items-center bg-[#f4f7f9] text-sm text-slate-500">Preparando SoporteYa…</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#f4f7f9] px-4 py-16">
        <div className="mx-auto flex max-w-md flex-col items-center gap-8 rounded-[2rem] border border-white/80 bg-white p-10 text-center shadow-[0_28px_80px_-40px_rgba(15,42,67,.4)]">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-[#102a43] text-white shadow-xl shadow-slate-300">
            <LifeBuoy className="h-8 w-8" />
          </div>
          <div>
            <p className="eyebrow">SoporteYa</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-slate-950">Mesa de ayuda con trazabilidad</h1>
            <p className="mt-4 text-sm leading-6 text-slate-600">Inicia sesión para crear, atender y supervisar tickets con permisos por rol.</p>
          </div>
          <Button onClick={() => startLogin()} size="lg" className="w-full rounded-xl bg-[#1261a0] shadow-lg shadow-sky-900/15 hover:bg-[#0f5389]">
            Iniciar sesión
          </Button>
        </div>
      </div>
    );
  }

  const activeItem = menuItems.find(item => item.path === location)
    ?? menuItems.find(item => item.path !== "/" && location.startsWith(item.path));

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" className="border-r border-slate-800 bg-[#0d263a] text-white">
        <SidebarHeader className="h-20 justify-center px-3">
          <div className="flex items-center gap-3 overflow-hidden px-1">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/10 text-sky-200"><LifeBuoy className="h-5 w-5" /></div>
            <div className="min-w-0 group-data-[collapsible=icon]:hidden">
              <span className="block truncate font-semibold tracking-tight">SoporteYa</span>
              <span className="block text-[10px] uppercase tracking-[.18em] text-sky-200/65">Control de servicio</span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent className="gap-0 px-2">
          <SidebarMenu>
            {menuItems.map(item => {
              const isActive = location === item.path || (item.path !== "/" && location.startsWith(item.path));
              return (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    isActive={isActive}
                    onClick={() => setLocation(item.path)}
                    tooltip={item.label}
                    className="h-11 rounded-xl font-medium text-slate-300 transition-all hover:bg-white/10 hover:text-white data-[active=true]:bg-white data-[active=true]:text-[#102a43]"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-white/10 group-data-[collapsible=icon]:justify-center">
                <Avatar className="h-9 w-9 shrink-0 border border-white/15">
                  <AvatarFallback className="bg-sky-100 text-xs font-bold text-[#102a43]">{user.name?.charAt(0).toUpperCase() || "S"}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                  <p className="truncate text-sm font-semibold text-white">{user.name || "Usuario"}</p>
                  <p className="mt-1 truncate text-[11px] text-slate-400">{roleLabel(user.supportRole)}</p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={logout} className="cursor-pointer text-rose-700 focus:text-rose-700">
                <LogOut className="mr-2 h-4 w-4" /> Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-slate-200/70 bg-white/90 px-3 backdrop-blur md:hidden">
          <SidebarTrigger className="h-9 w-9 rounded-lg" />
          <span className="text-sm font-semibold text-slate-800">{activeItem?.label || "SoporteYa"}</span>
        </div>
        <main className="min-h-screen flex-1 bg-[#f4f7f9] p-4 sm:p-6 lg:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}

