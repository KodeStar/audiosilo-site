import { useEffect, useRef } from 'react'
import Typed from 'typed.js'

export default function TypedHero() {
  const el = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!el.current) return
    const typed = new Typed(el.current, {
      strings: ['Audiobook Player', 'Multi User', 'Audible Replacement'],
      typeSpeed: 60,
      backDelay: 1000,
      startDelay: 1000,
      loop: true,
    })
    return () => typed.destroy()
  }, [])

  return (
    <h1 className="text-4xl sm:text-5xl my-12 font-extrabold text-center">
      Multi-platform <span ref={el} className="inline-block text-pink-600" />
    </h1>
  )
}
