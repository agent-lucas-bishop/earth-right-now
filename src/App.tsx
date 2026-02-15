import { usePopulation, useISS, usePeopleInSpace, useMoonPhase, useOrbitalData, useOnThisDay, useClock } from './hooks'
import './App.css'

function formatNumber(n: number): string {
  return n.toLocaleString('en-US')
}

function Card({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <div className={`card ${className}`} style={{ animationDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="card-label">{children}</div>
}

function Value({ children, mono = false }: { children: React.ReactNode; mono?: boolean }) {
  return <div className={`card-value ${mono ? 'mono' : ''}`}>{children}</div>
}

function Sub({ children }: { children: React.ReactNode }) {
  return <div className="card-sub">{children}</div>
}

export default function App() {
  const pop = usePopulation()
  const iss = useISS()
  const space = usePeopleInSpace()
  const moon = useMoonPhase()
  const orbital = useOrbitalData()
  const fact = useOnThisDay()
  const now = useClock()

  const utc = now.toLocaleTimeString('en-US', { hour12: false, timeZone: 'UTC' })
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="app">
      <header className="header">
        <div className="earth-icon">
          <svg viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="22" fill="#1a3a5c" />
            <ellipse cx="20" cy="16" rx="8" ry="6" fill="#2d7d5f" opacity="0.8" />
            <ellipse cx="30" cy="32" rx="10" ry="7" fill="#2d7d5f" opacity="0.7" />
            <ellipse cx="12" cy="34" rx="4" ry="3" fill="#2d7d5f" opacity="0.6" />
            <circle cx="24" cy="24" r="22" stroke="rgba(74,158,255,0.2)" strokeWidth="1" fill="none" />
          </svg>
        </div>
        <h1>Earth Right Now</h1>
        <p className="subtitle">{dateStr}</p>
        <p className="utc-time">UTC {utc}</p>
      </header>

      <main className="grid">
        <Card className="population" delay={0}>
          <Label>World Population</Label>
          <Value mono>{formatNumber(pop)}</Value>
          <Sub>≈ 4.3 births & 2.0 deaths per second</Sub>
        </Card>

        <Card className="space-people" delay={100}>
          <Label>Humans in Space</Label>
          <Value>{space ? space.number : '—'}</Value>
          {space && space.people.length > 0 && (
            <div className="astronaut-list">
              {space.people.map((p, i) => (
                <span key={i} className="astronaut">
                  <span className="dot" /> {p.name} <span className="craft">({p.craft})</span>
                </span>
              ))}
            </div>
          )}
        </Card>

        <Card className="iss" delay={200}>
          <Label>ISS Location</Label>
          {iss ? (
            <>
              <Value mono>
                {iss.latitude.toFixed(4)}° {iss.latitude >= 0 ? 'N' : 'S'},{' '}
                {iss.longitude.toFixed(4)}° {iss.longitude >= 0 ? 'E' : 'W'}
              </Value>
              <Sub>Orbiting at ~28,000 km/h · ~408 km altitude</Sub>
              <div className="iss-visual">
                <div className="iss-map">
                  <div
                    className="iss-dot"
                    style={{
                      left: `${((iss.longitude + 180) / 360) * 100}%`,
                      top: `${((90 - iss.latitude) / 180) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </>
          ) : (
            <Value>Locating...</Value>
          )}
        </Card>

        <Card className="moon" delay={300}>
          <Label>Moon Phase</Label>
          <div className="moon-display">
            <span className="moon-emoji">{moon.emoji}</span>
            <div>
              <Value>{moon.name}</Value>
              <Sub>{moon.illumination}% illuminated · Day {moon.age} of cycle</Sub>
            </div>
          </div>
        </Card>

        <Card className="orbit" delay={400}>
          <Label>Earth's Journey</Label>
          <div className="orbit-stats">
            <div className="orbit-stat">
              <span className="orbit-num mono">{formatNumber(orbital.sunDistKm)}</span>
              <span className="orbit-unit">km from the Sun</span>
            </div>
            <div className="orbit-stat">
              <span className="orbit-num mono">{orbital.speedKmS}</span>
              <span className="orbit-unit">km/s orbital speed</span>
            </div>
            <div className="orbit-stat">
              <span className="orbit-num mono">{formatNumber(orbital.distTodayKm)}</span>
              <span className="orbit-unit">km traveled today</span>
            </div>
          </div>
          <Sub>You've been hurtling through space this whole time.</Sub>
        </Card>

        <Card className="rotation" delay={500}>
          <Label>Earth's Rotation</Label>
          <div className="rotation-visual">
            <div className="rotation-ring">
              <div className="rotation-marker" style={{ transform: `rotate(${orbital.rotationDeg}deg)` }}>
                <div className="rotation-dot" />
              </div>
            </div>
            <div className="rotation-info">
              <Value mono>{orbital.rotationDeg}°</Value>
              <Sub>rotated today (UTC midnight = 0°)</Sub>
            </div>
          </div>
        </Card>

        {fact && (
          <Card className="history" delay={600}>
            <Label>On This Day</Label>
            <div className="history-content">
              <span className="history-year">{fact.year}</span>
              <p className="history-text">{fact.text}</p>
            </div>
          </Card>
        )}

        <Card className="pale-blue-dot" delay={700}>
          <blockquote>
            "Look again at that dot. That's here. That's home. That's us."
            <cite>— Carl Sagan, 1994</cite>
          </blockquote>
        </Card>
      </main>

      <footer className="footer">
        <p>Data refreshes automatically · No tracking · Open source</p>
      </footer>
    </div>
  )
}
