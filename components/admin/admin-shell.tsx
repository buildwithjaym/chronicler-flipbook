"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, type ReactNode } from "react"
import {
  BookOpenText,
  FileText,
  LayoutDashboard,
  Menu,
  UploadCloud,
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

export default function AdminShell({ profile, children }: AdminShellProps) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const displayName = profile.full_name || profile.email || "Admin"

  function SidebarContent() {
    return (
      <div className="flex h-full flex-col">
        <div className="border-b border-primary/10 p-6">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <BookOpenText className="h-6 w-6" />
          </div>

          <h2 className="text-lg font-black tracking-tight text-primary">
            The Chronicler
          </h2>

          <p className="mt-1 text-xs font-medium text-muted-foreground">
            Publication Admin
          </p>
        </div>

        <nav className="flex-1 space-y-2 p-4">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith("/admin/issues")

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.title}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-primary/10 p-4">
          <div className="mb-4 rounded-2xl bg-primary/5 p-4">
            <p className="text-sm font-bold text-foreground">{displayName}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {profile.role.toUpperCase()}
            </p>
          </div>

          <LogoutButton />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-[radial-gradient(circle_at_top,#f8fafc_0%,#eef2ff_34%,#ffffff_72%)] text-foreground">
      <aside className="fixed left-0 top-0 z-30 hidden h-dvh w-72 border-r border-primary/10 bg-white/85 shadow-xl shadow-primary/5 backdrop-blur-xl lg:block">
        <SidebarContent />
      </aside>

      {sidebarOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close sidebar"
            className="absolute inset-0 bg-black/40"
            onClick={() => setSidebarOpen(false)}
          />

          <aside className="relative h-full w-80 max-w-[85vw] border-r border-primary/10 bg-white shadow-2xl">
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="absolute right-4 top-4 rounded-full bg-primary/10 p-2 text-primary"
              aria-label="Close menu"
            >
              <X className="h-4 w-4" />
            </button>

            <SidebarContent />
          </aside>
        </div>
      ) : null}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-primary/10 bg-white/75 px-4 backdrop-blur-xl sm:px-6 lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-full bg-primary p-2 text-primary-foreground shadow-lg shadow-primary/20"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="text-right">
            <p className="text-sm font-black text-primary">The Chronicler</p>
            <p className="text-xs text-muted-foreground">Admin Panel</p>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  )
}