"use client"
import { Divider } from "@/components/Divider"
import { Input } from "@/components/Input"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarLink,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarSubLink,
} from "@/components/Sidebar"
import { cx, focusRing } from "@/lib/utils"
import { RiArrowDownSFill } from "@remixicon/react"
import { BookText, House, PackageSearch } from "lucide-react"
import * as React from "react"
import { Logo } from "../../../../public/Logo"
import { UserProfile } from "./UserProfile"
import { usePathname } from "next/navigation";



const navigation = [
  {
    name: "Home",
    href: "#",
    icon: House,
    notifications: false,
    active: false,
  },
  {
    name: "Inbox",
    href: "#",
    icon: PackageSearch,
    notifications: 2,
    active: false,
  },
] as const

const navigation2 = [
  {
    name: "Inventario",
    href: "#",
    icon: BookText,
    children: [
      {
        name: "Dashboard",
        href: "/quotes/overview",
        active: true,
      },
      {
        name: "Reportes de Inventario",
        href: "/inventario",
        active: false,
      },
      {
        name: "Registro Inicial",
        href: "/registro/inicial",
        active: false,
      },{
        name: "Registro Pesaje",
        href: "/registro/pesaje/primero",
        active: false,
      },
      {
        name: "Segundo Pesaje",
        href: "/registro/pesaje/segundo",
        active: false,
      },
      {
        name: "Registro de Procesamiento",
        href: "/registro/procesamiento",
        active: false,
      },

      {
        name: "Registro de Tanque",
        href: "/registro/tanque",
        active: false,
      },
      {
        name: "Registro de Salida",
      href: "/registro/salida",
      active: false,
      },
    ],
  },
  {
    name: "Proveedores",
    href: "#",
    icon: PackageSearch,
    children: [
      {
        name: "Agregar Proveedor",
        href: "/proveedores/agregar",
        active: false,
      },
      {
        name: "Padron de Proveedores",
        href: "/proveedores/padron",
        active: false,
      },
    ],
  },
] as const

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  //Determina si el enlace esta activo
  const [openMenus, setOpenMenus] = React.useState<string[]>([
    navigation2[0].name,
    navigation2[1].name,
  ])
  const toggleMenu = (name: string) => {
    setOpenMenus((prev: string[]) =>
      prev.includes(name)
        ? prev.filter((item: string) => item !== name)
        : [...prev, name],
    )
  }
  return (
    <Sidebar {...props} className="bg-gray-50 dark:bg-gray-925">
      <SidebarHeader className="px-3 py-4">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-md bg-white p-1.5 shadow-sm ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800">
            <Logo className="size-6 text-blue-500 dark:text-blue-500" />
          </span>
          <div>
            <span className="block text-sm font-semibold text-gray-900 dark:text-gray-50">
              Galeana Pepper
            </span>
            <span className="block text-xs text-gray-900 dark:text-gray-50">
              Manejo de Inventario
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <Input
              type="search"
              placeholder="Buscar sección..."
              className="[&>input]:sm:py-1.5"
            />
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="pt-0">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigation.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarLink
                    href="#"
                    isActive={item.active}
                    icon={item.icon}
                    notifications={item.notifications}
                  >
                    {item.name}
                  </SidebarLink>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <div className="px-3">
          <Divider className="my-0 py-0" />
        </div>
        <SidebarGroup>
          <SidebarGroupContent>
             <SidebarMenu className="space-y-4">
            {navigation2.map((item) => {
              // Determina si algún hijo está activo para iluminar el botón de la sección
              const isSectionActive = !!item.children?.some(
                (child) => child.href !== "#" && pathname === child.href
              );
              return (
                <SidebarMenuItem key={item.name}>
                  <button
                    onClick={() => toggleMenu(item.name)}
                    className={cx(
                      "flex w-full items-center justify-between gap-x-2.5 rounded-md p-2 text-base transition sm:text-sm",
                      isSectionActive
                        ? "bg-gray-900 text-white shadow dark:bg-blue-900 dark:text-white"
                        : "text-gray-900 hover:bg-gray-200/50 dark:text-gray-400 hover:dark:bg-gray-900 hover:dark:text-gray-50",
                      focusRing,
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <item.icon className="size-[18px] shrink-0" aria-hidden="true" />
                      {item.name}
                    </div>
                    <RiArrowDownSFill
                      className={cx(
                        openMenus.includes(item.name) ? "rotate-0" : "-rotate-90",
                        "size-5 shrink-0 transform text-gray-400 transition-transform duration-150 ease-in-out dark:text-gray-600",
                      )}
                      aria-hidden="true"
                    />
                  </button>
                  {item.children && openMenus.includes(item.name) && (
                    <SidebarMenuSub>
                      <div className="absolute inset-y-0 left-4 w-px bg-gray-300 dark:bg-gray-800" />
                      {item.children.map((child) => {
                        const isActive = child.href !== "#" && pathname === child.href;
                        return (
                          <SidebarMenuItem key={child.name}>
                            <SidebarSubLink
                              href={child.href}
                              isActive={isActive}
                              className={cx(
                                isActive
                                  ? "bg-gray-900 text-white shadow dark:bg-blue-900 dark:text-white"
                                  : "hover:bg-gray-100 hover:dark:bg-gray-800"
                              )}
                            >
                              {child.name}
                            </SidebarSubLink>
                          </SidebarMenuItem>
                        );
                      })}
                    </SidebarMenuSub>
                  )}
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="border-t border-gray-200 dark:border-gray-800" />
        <UserProfile />
      </SidebarFooter>
    </Sidebar>
  )
}
