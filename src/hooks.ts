import { useState, useEffect, useCallback, useRef } from 'react'

// ── Population counter (estimated, no API needed) ──
// UN estimate: ~8.12B in early 2025, growing ~0.9%/year ≈ 2.3 people/sec
const POP_BASE = 8_121_000_000
const POP_BASE_TIME = new Date('2025-01-01T00:00:00Z').getTime()
const POP_PER_MS = 2.3 / 1000

export function usePopulation() {
  const [pop, setPop] = useState(() => Math.floor(POP_BASE + (Date.now() - POP_BASE_TIME) * POP_PER_MS))
  useEffect(() => {
    const id = setInterval(() => {
      setPop(Math.floor(POP_BASE + (Date.now() - POP_BASE_TIME) * POP_PER_MS))
    }, 100)
    return () => clearInterval(id)
  }, [])
  return pop
}

// ── ISS Location ──
export interface ISSData { latitude: number; longitude: number; timestamp: number }

export function useISS(intervalMs = 5000) {
  const [data, setData] = useState<ISSData | null>(null)
  const fetch_ = useCallback(async () => {
    try {
      const r = await fetch('https://api.wheretheiss.at/v1/satellites/25544')
      const j = await r.json()
      setData({ latitude: j.latitude, longitude: j.longitude, timestamp: j.timestamp })
    } catch {}
  }, [])
  useEffect(() => { fetch_(); const id = setInterval(fetch_, intervalMs); return () => clearInterval(id) }, [fetch_, intervalMs])
  return data
}

// ── People in space ──
export interface SpaceData { number: number; people: { name: string; craft: string }[] }

export function usePeopleInSpace() {
  const [data, setData] = useState<SpaceData | null>(null)
  useEffect(() => {
    fetch('http://api.open-notify.org/astros.json')
      .then(r => r.json())
      .then(j => setData({ number: j.number, people: j.people }))
      .catch(() => {
        // Fallback: use known approximate number
        setData({ number: 7, people: [] })
      })
  }, [])
  return data
}

// ── Moon phase (calculated, no API) ──
export function useMoonPhase() {
  const [phase, setPhase] = useState(() => calcMoonPhase(new Date()))
  useEffect(() => {
    const id = setInterval(() => setPhase(calcMoonPhase(new Date())), 60000)
    return () => clearInterval(id)
  }, [])
  return phase
}

function calcMoonPhase(date: Date) {
  // Simplified lunation calculation
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  let c = 0, e = 0, jd = 0, b = 0
  if (month < 3) { c = year - 1; e = month + 12 } else { c = year; e = month }
  jd = Math.floor(365.25 * (c + 4716)) + Math.floor(30.6001 * (e + 1)) + day - 1524.5
  b = jd - 2451549.5
  const lunation = b / 29.53058867
  const age = (lunation - Math.floor(lunation)) * 29.53058867
  const fraction = age / 29.53058867
  
  let name = ''
  let emoji = ''
  if (fraction < 0.0339)      { name = 'New Moon';          emoji = '🌑' }
  else if (fraction < 0.216)  { name = 'Waxing Crescent';   emoji = '🌒' }
  else if (fraction < 0.283)  { name = 'First Quarter';     emoji = '🌓' }
  else if (fraction < 0.466)  { name = 'Waxing Gibbous';    emoji = '🌔' }
  else if (fraction < 0.533)  { name = 'Full Moon';          emoji = '🌕' }
  else if (fraction < 0.716)  { name = 'Waning Gibbous';    emoji = '🌖' }
  else if (fraction < 0.783)  { name = 'Last Quarter';      emoji = '🌗' }
  else if (fraction < 0.966)  { name = 'Waning Crescent';   emoji = '🌘' }
  else                        { name = 'New Moon';           emoji = '🌑' }

  return { name, emoji, age: Math.round(age * 10) / 10, illumination: Math.round(Math.abs(Math.cos(fraction * 2 * Math.PI) * -0.5 + 0.5) * 100) }
}

// ── Earth orbital data (calculated) ──
export function useOrbitalData() {
  const [data, setData] = useState(() => calcOrbital())
  useEffect(() => {
    const id = setInterval(() => setData(calcOrbital()), 1000)
    return () => clearInterval(id)
  }, [])
  return data
}

function calcOrbital() {
  const now = new Date()
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000)
  
  // Earth-Sun distance (simplified Kepler)
  // Perihelion ~Jan 3, aphelion ~Jul 4
  // Mean distance: 149.598M km, eccentricity: 0.0167
  const perihelionDay = 3 // Jan 3
  const daysFromPeri = ((dayOfYear - perihelionDay + 365) % 365)
  const angle = (daysFromPeri / 365.25) * 2 * Math.PI
  const meanDist = 149_598_023 // km
  const eccentricity = 0.0167086
  const dist = meanDist * (1 - eccentricity * Math.cos(angle))
  
  // Speed: ~29.78 km/s average, varies with distance
  const speed = 29.78 * (1 + eccentricity * Math.cos(angle)) // simplified
  
  // Distance traveled today
  const now_ms = now.getTime()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const secondsToday = (now_ms - startOfDay) / 1000
  const distToday = speed * secondsToday

  // Earth rotation
  const hours = now.getUTCHours() + now.getUTCMinutes() / 60 + now.getUTCSeconds() / 3600
  const rotationDeg = (hours / 24) * 360

  return {
    sunDistKm: Math.round(dist),
    sunDistAU: Math.round(dist / 149_597_870.7 * 10000) / 10000,
    speedKmS: Math.round(speed * 100) / 100,
    distTodayKm: Math.round(distToday),
    rotationDeg: Math.round(rotationDeg * 100) / 100,
  }
}

// ── On this day in history ──
export function useOnThisDay() {
  const [fact, setFact] = useState<{ year: string; text: string } | null>(null)
  const tried = useRef(false)
  useEffect(() => {
    if (tried.current) return
    tried.current = true
    const now = new Date()
    const month = now.getMonth() + 1
    const day = now.getDate()
    fetch(`https://byabbe.se/on-this-day/${month}/${day}/events.json`)
      .then(r => r.json())
      .then(j => {
        if (j.events?.length) {
          const evt = j.events[Math.floor(Math.random() * j.events.length)]
          setFact({ year: evt.year, text: evt.description })
        }
      })
      .catch(() => {
        setFact({ year: '1990', text: 'Voyager 1 took the famous "Pale Blue Dot" photograph of Earth from 6 billion kilometers away.' })
      })
  }, [])
  return fact
}

// ── Time ──
export function useClock() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return now
}
