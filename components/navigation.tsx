"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Vote, Settings, Home } from "lucide-react"

export function Navigation() {
  const pathname = usePathname()

  return (
    <Card className="mb-6 bg-white/95 backdrop-blur border-blue-300 shadow-lg">
      <CardContent className="p-4">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button
                variant={pathname === "/" ? "default" : "ghost"}
                className={
                  pathname === "/" ? "bg-blue-600 hover:bg-blue-700 text-white" : "text-blue-700 hover:bg-blue-100"
                }
              >
                <Vote className="h-4 w-4 mr-2" />
                Votación Electoral
              </Button>
            </Link>
            <Link href="/admin">
              <Button
                variant={pathname === "/admin" ? "default" : "ghost"}
                className={
                  pathname === "/admin" ? "bg-red-600 hover:bg-red-700 text-white" : "text-red-700 hover:bg-red-100"
                }
              >
                <Settings className="h-4 w-4 mr-2" />
                Administración JCE
              </Button>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Home className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-gray-700 font-medium">
              {pathname === "/" ? "Sistema de Votación" : "Panel Administrativo JCE"}
            </span>
          </div>
        </nav>
      </CardContent>
    </Card>
  )
}
