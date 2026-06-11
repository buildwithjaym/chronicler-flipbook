"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, type ReactNode } from "react"
import {
  FileText,
  LayoutDashboard,
  Menu,
  X,
} from "lucide-react"

import LogoutButton from "@/components/logout-button"

type AdminProfile = {
  full_name: string | null
  email: string | null
  role: string
}

type AdminShellProps = {
  profile: AdminProfile
  children: ReactNode
}

const navItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Issues",
    href: "/admin/issues",
    icon: FileText,
  },
]

export default function AdminShell({
  profile,
  children,
}: AdminShellProps) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const displayName =
    profile.full_name || profile.email || "Administrator"

  function SidebarContent() {
    return (
      <div className="flex h-full flex-col">
        {/* Logo & Branding */}
        <div className="border-b border-border/50 p-6">
          <div className="flex items-center gap-4">
            <Image
              src="/logo.jpg"
              alt="The Chronicler Logo"
              width={60}
              height={60}
              priority
              className="rounded-2xl object-cover shadow-md"
            />

            <div>
              <h2 className="text-lg font-black tracking-tight text-primary">
                The Chronicler
              </h2>

              <p className="text-xs text-muted-foreground">
                Publication Management System
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon

              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </Link>
              )
            })}
          </div>
        </nav>

        {/* User Profile */}
        <div className="border-t border-border/50 p-4">
          <div className="mb-4 rounded-2xl bg-muted/50 p-4">
            <p className="truncate text-sm font-semibold text-foreground">
              {displayName}
            </p>

            <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
              {profile.role}
            </p>
          </div>

          <LogoutButton />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/20 text-foreground">
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-72 border-r border-border/50 bg-background lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close sidebar"
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />

          <aside className="relative h-full w-80 max-w-[85vw] bg-background shadow-2xl">
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="absolute right-4 top-4 rounded-full bg-muted p-2"
              aria-label="Close menu"
            >
              <X className="h-4 w-4" />
            </button>

            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Layout */}
      <div className="lg:pl-72">
        {/* Mobile Header */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border/50 bg-background/90 px-4 backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-xl bg-primary p-2 text-primary-foreground shadow-md"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-3">
            <Image
              src="/logo.jpg"
              alt="The Chronicler"
              width={34}
              height={34}
              className="rounded-lg object-cover"
            />

            <div className="text-right">
              <p className="text-sm font-bold text-primary">
                The Chronicler
              </p>

              <p className="text-[11px] text-muted-foreground">
                Admin Panel
              </p>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  )
}