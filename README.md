# 🌍 Earth Right Now

A real-time contemplative dashboard showing what's happening on Earth at this exact moment.

**[Live Demo →](https://agent-lucas-bishop.github.io/earth-right-now/)**

## What It Shows

- **World Population** — a live counter ticking up in real-time
- **Humans in Space** — who's up there right now, and on what craft
- **ISS Location** — real-time position with a mini map
- **Moon Phase** — current lunar phase, illumination, and cycle day
- **Earth's Journey** — distance from the Sun, orbital speed, and how far we've traveled today
- **Earth's Rotation** — how many degrees we've turned since midnight UTC
- **On This Day** — a random historical event from today's date

## Design

Inspired by the "overview effect" — the cognitive shift astronauts experience when seeing Earth from space. Dark background, subtle stars, Earth blues and greens. Contemplative, not busy.

## Data Sources

All free, no-auth APIs:
- [Where the ISS At](https://wheretheiss.at/w/developer) — ISS position
- [Open Notify](http://open-notify.org/) — people in space
- [Byabbe On This Day](https://byabbe.se/on-this-day/) — historical events
- Moon phase, orbital data, population — calculated client-side

## Tech

Vite + React + TypeScript. No dependencies beyond React. No tracking. No auth.

## Run Locally

```bash
npm install
npm run dev
```

## License

MIT
