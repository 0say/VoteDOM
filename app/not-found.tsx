import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Home, Vote } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-red-800 to-blue-900 flex items-center justify-center">
      {/* Header Gubernamental */}
      <div className="absolute top-0 left-0 right-0 bg-white border-b-4 border-red-600 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-red-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">🇩🇴</span>
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-800">República Dominicana</h1>
              <p className="text-sm text-gray-600">Junta Central Electoral</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pt-32">
        <Card className="max-w-md mx-auto text-center bg-white/95 backdrop-blur border-red-300 shadow-2xl">
          <CardHeader>
            <div className="mx-auto p-4 bg-gradient-to-br from-red-600 to-blue-600 rounded-full w-fit mb-4 shadow-lg">
              <Vote className="h-12 w-12 text-white" />
            </div>
            <CardTitle className="text-2xl text-gray-800">Página No Encontrada</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">La página del sistema electoral que buscas no existe o ha sido movida.</p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Link href="/">
                <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white">
                  <Home className="mr-2 h-4 w-4" />
                  Ir a Votación
                </Button>
              </Link>
              <Link href="/admin">
                <Button variant="outline" className="w-full sm:w-auto border-red-300 text-red-700 hover:bg-red-50">
                  <Vote className="mr-2 h-4 w-4" />
                  Panel JCE
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
