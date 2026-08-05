"use client"

import { useEffect, useRef } from "react"

const DECODE_CHARS = "ABCDEFGHJKMNPQRSTVWXYZ0123456789#/<>*"
const DECODE_DURATION = 620

type DecodeTextProps = {
  as?: "p" | "span"
  text: string
} & Omit<React.ComponentPropsWithoutRef<"p">, "children">

/**
 * Chapter marks that scramble into place once, the first time they enter the
 * viewport. Server HTML and the first client render both emit the final text,
 * so hydration always matches; the element's text node is mutated only after
 * mount, where React no longer compares it.
 */
export function DecodeText({ as: Tag = "span", text, ...props }: DecodeTextProps) {
  const elementRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const el = elementRef.current
    if (!el) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    if (!("IntersectionObserver" in window)) return

    let frame = 0
    const runDecode = () => {
      const start = performance.now()
      const step = (now: number) => {
        const progress = Math.min(1, (now - start) / DECODE_DURATION)
        const reveal = Math.floor(progress * text.length)
        let out = text.slice(0, reveal)
        for (let i = reveal; i < text.length; i++) {
          out += text[i] === " " ? " " : DECODE_CHARS[Math.floor(Math.random() * DECODE_CHARS.length)]
        }
        el.textContent = progress < 1 ? out : text
        if (progress < 1) frame = window.requestAnimationFrame(step)
      }
      frame = window.requestAnimationFrame(step)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          observer.unobserve(entry.target)
          runDecode()
        }
      },
      { threshold: 0.5 }
    )
    observer.observe(el)

    return () => {
      observer.disconnect()
      if (frame) window.cancelAnimationFrame(frame)
      el.textContent = text
    }
  }, [text])

  return (
    <Tag
      {...props}
      ref={(node) => {
        elementRef.current = node
      }}
    >
      {text}
    </Tag>
  )
}
