import { useEffect, useRef } from 'react'
import './Sky.css'

type Star = {
  x: number
  y: number
  radius: number
  haloRadius: number
  baseAlpha: number
  dimming: number
  twinkleSpeed: number
  phase: number
}

type Meteor = {
  launchTime: number
  duration: number
  startX: number
  startY: number
  deltaX: number
  deltaY: number
  length: number
  trailWidth: number
}

const STAR_COUNT = 260
const METEOR_INTERVAL_MIN = 3000
const METEOR_INTERVAL_MAX = 10000

const randomBetween = (min: number, max: number) => Math.random() * (max - min) + min

const createStars = (count: number): Star[] =>
  Array.from({ length: count }, () => {
    const radius = Math.pow(Math.random(), 0.35) * 0.4 + 0.1
    const haloRadius = radius * randomBetween(2.4, 3.6)

    return {
      x: Math.random(),
      y: Math.random(),
      radius,
      haloRadius,
      baseAlpha: randomBetween(0.56, 0.74),
      dimming: randomBetween(0.42, 0.72),
      twinkleSpeed: randomBetween(0.35, 1.15),
      phase: randomBetween(0, Math.PI * 2),
    }
  })

const drawBackground = (ctx: CanvasRenderingContext2D, width: number, height: number, seconds: number) => {
  ctx.save()
  ctx.globalCompositeOperation = 'source-over'
  ctx.globalAlpha = 1
  ctx.fillStyle = '#02020f'
  ctx.fillRect(0, 0, width, height)

  const largest = Math.max(width, height)

  const drift1x = width * (0.28 + 0.08 * Math.sin(seconds * 0.05))
  const drift1y = height * (0.22 + 0.07 * Math.cos(seconds * 0.045))
  const gradient1 = ctx.createRadialGradient(drift1x, drift1y, largest * 0.05, drift1x, drift1y, largest * 0.65)
  gradient1.addColorStop(0, 'rgba(42, 62, 140, 0.32)')
  gradient1.addColorStop(1, 'rgba(4, 4, 20, 0)')

  ctx.globalCompositeOperation = 'lighter'
  ctx.globalAlpha = 0.55
  ctx.fillStyle = gradient1
  ctx.fillRect(0, 0, width, height)

  const drift2x = width * (0.72 + 0.09 * Math.sin(seconds * 0.032 + 1.3))
  const drift2y = height * (0.18 + 0.1 * Math.sin(seconds * 0.04 + 2.1))
  const gradient2 = ctx.createRadialGradient(drift2x, drift2y, largest * 0.03, drift2x, drift2y, largest * 0.55)
  gradient2.addColorStop(0, 'rgba(86, 49, 180, 0.28)')
  gradient2.addColorStop(1, 'rgba(6, 6, 17, 0)')

  ctx.globalAlpha = 0.48
  ctx.fillStyle = gradient2
  ctx.fillRect(0, 0, width, height)

  const gradientBottom = ctx.createLinearGradient(0, 0, 0, height)
  gradientBottom.addColorStop(0, 'rgba(2, 4, 14, 0)')
  gradientBottom.addColorStop(1, 'rgba(9, 12, 32, 0.7)')

  ctx.globalAlpha = 0.9
  ctx.fillStyle = gradientBottom
  ctx.fillRect(0, 0, width, height)

  ctx.restore()
}

const drawStars = (
  ctx: CanvasRenderingContext2D,
  stars: Star[],
  seconds: number,
  width: number,
  height: number,
  prefersReducedMotion: boolean
) => {
  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  ctx.globalAlpha = 1

  for (const star of stars) {
    const twinkleBase = prefersReducedMotion ? 0.5 : 0.5 + 0.5 * Math.sin(seconds * star.twinkleSpeed + star.phase)
    const intensity = star.baseAlpha - star.dimming * twinkleBase
    const coreAlpha = Math.min(1, Math.max(0.18, intensity))
    const haloAlpha = coreAlpha * 0.45
    const x = star.x * width
    const y = star.y * height

    const gradient = ctx.createRadialGradient(x, y, star.radius * 0.2, x, y, star.haloRadius)
    gradient.addColorStop(0, `rgba(255, 255, 255, ${coreAlpha})`)
    gradient.addColorStop(0.45, `rgba(210, 220, 255, ${haloAlpha})`)
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')

    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(x, y, star.haloRadius, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = `rgba(255, 255, 255, ${coreAlpha})`
    ctx.beginPath()
    ctx.arc(x, y, Math.max(0.45, star.radius * 0.9), 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.restore()
}

const drawMeteors = (
  ctx: CanvasRenderingContext2D,
  meteors: Meteor[],
  timestamp: number,
  prefersReducedMotion: boolean
) => {
  if (!meteors.length) {
    return
  }

  ctx.save()
  ctx.globalCompositeOperation = 'lighter'

  for (let index = meteors.length - 1; index >= 0; index -= 1) {
    const meteor = meteors[index]
    const elapsed = timestamp - meteor.launchTime

    if (elapsed <= 0) {
      continue
    }

    const progress = elapsed / meteor.duration

    if (progress >= 1) {
      meteors.splice(index, 1)
      continue
    }

    const easedProgress = prefersReducedMotion ? Math.min(progress, 1) : Math.pow(progress, 0.92)
    const lightProgress = progress > 0.95 ? (1 - progress) / 0.05 : 1;
    const x = meteor.startX + meteor.deltaX * easedProgress
    const y = meteor.startY + meteor.deltaY * easedProgress
    const totalTravel = Math.hypot(meteor.deltaX, meteor.deltaY) || 1
    const unitX = meteor.deltaX / totalTravel
    const unitY = meteor.deltaY / totalTravel

    const tailX = x - unitX * meteor.length
    const tailY = y - unitY * meteor.length
    const glowStrength = Math.sin(Math.PI * Math.min(progress, 1))

    const gradient = ctx.createLinearGradient(tailX, tailY, x, y)
    gradient.addColorStop(0, `rgba(170, 130, 255, 0)`)
    gradient.addColorStop(0.55, `rgba(200, 150, 255, ${0.5 * lightProgress})`)
    gradient.addColorStop(1, `rgba(255, 255, 255, ${0.95 * lightProgress})`)

    ctx.globalAlpha = 0.24 + 0.76 * glowStrength
    ctx.lineWidth = meteor.trailWidth
    ctx.lineCap = 'round'
    ctx.strokeStyle = gradient

    ctx.beginPath()
    ctx.moveTo(tailX, tailY)
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  ctx.restore()
}

const scheduleMeteor = (
  meteors: Meteor[],
  size: { width: number; height: number },
  prefersReducedMotion: boolean,
  meteorTimeouts: Set<number>,
  lifecycle: { running: boolean }
) => {
  if (prefersReducedMotion || !lifecycle.running) {
    return
  }

  const timeout = window.setTimeout(() => {
    meteorTimeouts.delete(timeout)
    if (!lifecycle.running) {
      return
    }

    const now = performance.now()
    const delay = randomBetween(0, 1200)
    const duration = randomBetween(4800, 8400)
    const startX = randomBetween(-size.width * 0.1, size.width * 1.05)
    let startY = randomBetween(-size.height * 0.15, size.height * 0.25)
    const deltaX = randomBetween(size.width * 0.4, size.width * 0.6)
    const deltaY = randomBetween(size.height * 0.45, size.height * 0.75)
    const length = randomBetween(110, 200)
    const trailWidth = randomBetween(1.2, 2)

    if (startX > 0) startY = -startY;

    meteors.push({
      launchTime: now + delay,
      duration,
      startX,
      startY,
      deltaX,
      deltaY,
      length,
      trailWidth,
    })

    scheduleMeteor(meteors, size, prefersReducedMotion, meteorTimeouts, lifecycle)
  }, randomBetween(METEOR_INTERVAL_MIN, METEOR_INTERVAL_MAX))

  meteorTimeouts.add(timeout)
}

function Sky() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const meteorsRef = useRef<Meteor[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    const meteors = meteorsRef.current

    if (!canvas) {
      return
    }

    const ctx = canvas.getContext('2d', { alpha: false })

    if (!ctx) {
      return
    }

    const stars = createStars(STAR_COUNT)
    meteors.length = 0
    const meteorTimeouts = new Set<number>()
    const size = { width: 0, height: 0 }
    const lifecycle = { running: true }
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let animationFrameId = 0

    const applySize = () => {
      size.width = window.innerWidth
      size.height = window.innerHeight
      const dpr = window.devicePixelRatio || 1

      canvas.width = Math.round(size.width * dpr)
      canvas.height = Math.round(size.height * dpr)
      canvas.style.width = `${size.width}px`
      canvas.style.height = `${size.height}px`

      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.scale(dpr, dpr)
    }

    applySize()

    let resizeTimer = 0
    const handleResize = () => {
      window.clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(() => {
        applySize()
      }, 100)
    }

    window.addEventListener('resize', handleResize)

    const render = (timestamp: number) => {
      if (!lifecycle.running) {
        return
      }

      const seconds = timestamp / 1000
      ctx.clearRect(0, 0, size.width, size.height)
      drawBackground(ctx, size.width, size.height, seconds)
      drawStars(ctx, stars, seconds, size.width, size.height, prefersReducedMotion)
      drawMeteors(ctx, meteors, timestamp, prefersReducedMotion)

      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(render)
      }
    }

    const startAnimation = () => {
      if (prefersReducedMotion) {
        render(performance.now())
      } else {
        animationFrameId = requestAnimationFrame(render)
      }
    }

    const kickstartMeteors = () => {
      if (prefersReducedMotion) {
        return
      }

      const now = performance.now()
      const startX = randomBetween(size.width * 0.1, size.width * 0.9)
      let startY = randomBetween(-size.height * 0.1, size.height * 0.2)
      if (startX > 0) startY = -startY
      meteors.push({
        launchTime: now + randomBetween(500, 1500),
        duration: randomBetween(5000, 7800),
        startX,
        startY,
        deltaX: randomBetween(size.width * 0.4, size.width * 0.6),
        deltaY: randomBetween(size.height * 0.48, size.height * 0.7),
        length: randomBetween(120, 190),
        trailWidth: randomBetween(1.2, 1.8),
      })

      scheduleMeteor(meteors, size, prefersReducedMotion, meteorTimeouts, lifecycle)
    }

    startAnimation()
    kickstartMeteors()

    return () => {
      lifecycle.running = false
      window.cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
      window.clearTimeout(resizeTimer)
      meteorTimeouts.forEach((timeoutId) => window.clearTimeout(timeoutId))
      meteorTimeouts.clear()
      meteors.length = 0
    }
  }, [])

  return (
    <div className="sky">
      <canvas ref={canvasRef} className="sky__canvas" />
    </div>
  )
}

export default Sky
