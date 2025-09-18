"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import HereMap from "@/components/here-map"
import { SiteHeader } from "@/components/site-header"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface Shuttle {
  id: string
  name: string
  morning_shift: string
  evening_shift: string
  capacity: number
  map_url: string
  coordinates: string
  distance_to_office: number
}

export default function ShuttleDetailsPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [shuttle, setShuttle] = useState<Shuttle | null>(null)
  const [passengers, setPassengers] = useState<number>(0)

  const shuttleId = useMemo(() => (typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params?.id?.[0] : ""), [params])

  useEffect(() => {
    if (!shuttleId) return
    try {
      const saved = localStorage.getItem("Shuttles")
      if (saved) {
        const list: Shuttle[] = JSON.parse(saved)
        const found = list.find(s => s.id === shuttleId) || null
        setShuttle(found)
      }
    } catch (e) {
      console.error("Failed to read shuttle from storage", e)
    }
  }, [shuttleId])

  const pickupPoints = useMemo(() => {
    const raw = shuttle?.coordinates?.trim() || ""
    if (!raw) return [] as { label: string; lat: number; lng: number }[]
    const parts = raw.split(/[;|]/).map(p => p.trim()).filter(Boolean)
    const points = parts.map((p, idx) => {
      const [latStr, lngStr] = p.split(",").map(s => s.trim())
      const lat = Number.parseFloat(latStr)
      const lng = Number.parseFloat(lngStr)
      return { label: `Pickup #${idx + 1}`, lat, lng }
    }).filter(pt => Number.isFinite(pt.lat) && Number.isFinite(pt.lng))
    return points
  }, [shuttle?.coordinates])

  const occupancyRate = useMemo(() => {
    const cap = shuttle?.capacity ?? 0
    if (cap <= 0) return 0
    return Math.min(100, Math.max(0, Math.round((passengers / cap) * 100)))
  }, [passengers, shuttle?.capacity])

  const estimatedDurationMin = useMemo(() => {
    const dist = shuttle?.distance_to_office ?? 0
    return Math.round((dist / 30) * 60)
  }, [shuttle?.distance_to_office])

  return (
    <div className="space-y-6 ">
      <SiteHeader showTrigger={false}>
        <div className="flex w-full items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{shuttle?.name ?? "Shuttle Details"}</h2>
          <p className="text-muted-foreground">Service details and route information</p>
        </div>
         
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.back()}>Back</Button>
            <Button asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          </div>
        </div>
      </SiteHeader>
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6 max-w-4xl">

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4 lg:px-6">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{shuttle ? `${shuttle.name} Overview` : "Shuttle Overview"}</CardTitle>
                    <CardDescription>Key service metrics.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {shuttle ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 max-w-[500px]">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardDescription>Total Distance (km)</CardDescription>
                            <CardTitle className="text-2xl">{shuttle.distance_to_office}</CardTitle>
                          </CardHeader>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardDescription>Estimated Duration (min)</CardDescription>
                            <CardTitle className="text-2xl">{estimatedDurationMin}</CardTitle>
                          </CardHeader>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardDescription>Passengers</CardDescription>
                            <CardTitle className="text-2xl">{passengers}</CardTitle>
                          </CardHeader>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardDescription>Pickup Points</CardDescription>
                            <CardTitle className="text-2xl">{pickupPoints.length}</CardTitle>
                          </CardHeader>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardDescription>Occupancy Rate</CardDescription>
                            <CardTitle className="text-2xl">{occupancyRate}%</CardTitle>
                          </CardHeader>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardDescription>Capacity</CardDescription>
                            <CardTitle className="text-2xl">{shuttle.capacity}</CardTitle>
                          </CardHeader>
                        </Card>
                      </div>
                    ) : (
                      <div className="py-6 text-sm text-muted-foreground">Shuttle not found in local data.</div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Pickup Points</CardTitle>
                    <CardDescription>List of pickup stops for this service.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {pickupPoints.length > 0 ? (
                      <Accordion type="single" collapsible className="w-full">
                        {pickupPoints.map((pt, idx) => (
                          <AccordionItem key={`${pt.lat}-${pt.lng}-${idx}`} value={`item-${idx}`}>
                            <AccordionTrigger>{pt.label}</AccordionTrigger>
                            <AccordionContent>
                              <div className="text-sm">
                                <div><span className="text-muted-foreground">Latitude:</span> {pt.lat}</div>
                                <div><span className="text-muted-foreground">Longitude:</span> {pt.lng}</div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    ) : (
                      <div className="text-sm text-muted-foreground">No pickup points available.</div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="sm:col-span-2 lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Map</CardTitle>
                    <CardDescription>Service route area preview.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <HereMap
                      className="h-71 w-full "
                      center={pickupPoints[0] ? { lat: pickupPoints[0].lat, lng: pickupPoints[0].lng } : undefined}
                      zoom={pickupPoints[0] ? 12 : 11}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


