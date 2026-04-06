"use client"

import { useState } from "react"
import { Camera, Heart, LogOut } from "lucide-react"
import { logoutAction } from "@/app/actions/auth"
import { Card, CardContent } from "@/components/ui/card"

export function OnboardingForm() {
  const [isPending, setIsPending] = useState(false)

  async function handleSelect(userType: "creator" | "fan") {
    if (isPending) return
    setIsPending(true)

    const res = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userType }),
    })

    if (res.ok) {
      // API already refreshed the JWT cookie, full reload so proxy reads it
      window.location.href = "/"
      return
    }

    setIsPending(false)
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">¿Qué te trae por acá?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Elegí cómo querés usar Only
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card
          className={`cursor-pointer transition-all ${isPending ? "pointer-events-none opacity-50" : "hover:border-primary/50"}`}
          onClick={() => handleSelect("creator")}
        >
          <CardContent className="flex flex-col items-center gap-3 py-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
              <Camera className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="font-medium">Soy creador</p>
              <p className="text-xs text-muted-foreground">
                Quiero compartir mi contenido exclusivo
              </p>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all ${isPending ? "pointer-events-none opacity-50" : "hover:border-primary/50"}`}
          onClick={() => handleSelect("fan")}
        >
          <CardContent className="flex flex-col items-center gap-3 py-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100">
              <Heart className="h-6 w-6 text-rose-600" />
            </div>
            <div>
              <p className="font-medium">Soy fan</p>
              <p className="text-xs text-muted-foreground">
                Quiero ver contenido de mis creadores favoritos
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="text-center">
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          onClick={() => logoutAction()}
        >
          <LogOut className="h-3.5 w-3.5" />
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}
