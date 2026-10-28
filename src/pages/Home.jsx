import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const phrases = ['supported.', 'connected.', 'reassured.', 'empowered.']

const features = [
  {
    number: '01',
    icon: '⌕',
    title: 'Find the right doctor',
    description: 'Explore healthcare professionals and find care that fits your needs.',
  },
  {
    number: '02',
    icon: '▦',
    title: 'Book with confidence',
    description: 'Choose a suitable appointment through a simple, organised process.',
  },
  {
    number: '03',
    icon: '♡',
    title: 'Stay connected',
    description: 'Keep your appointments and care updates together in one place.',
  },
]

function Home() {
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((current) => (current + 1) % phrases.length)
    }, 2600)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="pregalink min-h-screen overflow-hidden bg-[#F7FAF8] text-[#163D38]">

      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-emerald-900/10 bg-white/90 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link to="/" className="shrink-0 text-2xl font-extrabold tracking-tight">
            Prega<span className="text-emerald-600">Link</span>
            <span className="ml-2 hidden text-[10px] font-semibold uppercase tracking-[.2em] text-slate-400 sm:inline">
              Maternal care
            </span>
          </Link>

          <div className="hidden items-center gap-7 md:flex">
            <Link to="/" className="text-sm font-semibold text-emerald-800">Home</Link>

            <a href="#how-it-works" className="text-sm text-slate-600 transition hover:text-emerald-700">How It Works</a>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/register?role=doctor" className="hidden text-sm font-semibold text-slate-600 transition hover:text-emerald-700 lg:block">
              Join as a Doctor
            </Link>
            <Link to="/login" className="text-sm font-semibold hover:text-emerald-700">Log in</Link>
            <Link to="/register" className="rounded-full bg-emerald-800 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/15 transition hover:-translate-y-1 hover:bg-emerald-700 sm:px-5">
              Get Started ↗
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={menuOpen}
              className="rounded-xl border border-slate-200 p-2 text-xl md:hidden"
            >
              {menuOpen ? '×' : '☰'}
            </button>
          </div>
        </nav>

        {menuOpen && (
          <div className="grid gap-1 border-t border-slate-100 bg-white px-6 py-4 md:hidden">
            <Link onClick={() => setMenuOpen(false)} to="/" className="rounded-xl px-4 py-3 text-sm hover:bg-emerald-50">Home</Link>
            <a onClick={() => setMenuOpen(false)} href="#how-it-works" className="rounded-xl px-4 py-3 text-sm hover:bg-emerald-50">How It Works</a>
            <Link onClick={() => setMenuOpen(false)} to="/register?role=doctor" className="rounded-xl px-4 py-3 text-sm hover:bg-emerald-50">Join as a Doctor</Link>
          </div>
        )}
      </header>

      <main>
        {/* Hero */}
        <section className="relative isolate mx-auto grid max-w-7xl items-center gap-14 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[1.05fr_.95fr] lg:gap-12 lg:py-24">
          <div className="drift-animation pointer-events-none absolute -left-32 top-8 -z-10 h-80 w-80 rounded-full bg-emerald-200/35 blur-3xl" />
          <div className="drift-animation pointer-events-none absolute right-0 top-16 -z-10 h-72 w-72 rounded-full bg-teal-100/60 blur-3xl" />

          <div className="slide-left relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-white/90 px-4 py-2 text-xs font-semibold text-emerald-800 shadow-sm sm:text-sm">
              <span className="pulse-animation h-2.5 w-2.5 rounded-full bg-emerald-500" />
              Thoughtful care for every new beginning
            </div>

            <h1 className="mt-7 max-w-2xl text-5xl font-bold leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">
              Your pregnancy journey,
              <span className="mt-2 block min-h-[1.15em] text-emerald-700">
                <span key={phraseIndex} className="rotating-phrase">
                  {phrases[phraseIndex]}
                </span>
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
              Find trusted maternal healthcare professionals, book appointments
              with confidence, and keep your care journey connected in one place.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">

              <Link to="/register?role=patient" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-6 py-4 text-sm font-semibold text-slate-700 transition hover:-translate-y-1 hover:border-emerald-300 hover:bg-emerald-50 sm:px-7">
                <span>♡</span> Join PregaLink
              </Link>
            </div>

            <div className="fade-up delay-2 mt-9 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-2xl text-emerald-800">♡</div>
              <div>
                <p className="text-sm font-bold text-slate-800">Your care, all in one place</p>
                <p className="mt-1 text-xs text-slate-500">Discover · Book · Stay connected</p>
              </div>
            </div>
          </div>

          {/* Hero image */}
          <div className="slide-right delay-1 relative mx-auto w-full max-w-xl lg:ml-auto">
            <div className="drift-animation absolute -inset-4 rotate-3 rounded-[2.5rem] bg-gradient-to-br from-emerald-100 via-teal-50 to-amber-100 sm:-inset-5" />
            <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-amber-200/50 blur-3xl" />
            <div className="relative rounded-[2rem] border border-white bg-white p-2.5 shadow-2xl shadow-emerald-950/15 sm:p-3">
              <img src="/mothernest-hero.png" alt="Mother and child representing maternal care" className="h-[330px] w-full rounded-[1.5rem] object-cover sm:h-[450px] lg:h-[490px]" />
            </div>

            <div className="float-animation absolute -bottom-5 left-2 max-w-[250px] rounded-2xl border border-slate-100 bg-white p-4 shadow-xl sm:-left-8 sm:p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-xl text-emerald-800">✓</div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Care that connects</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">Your journey, organised in one place.</p>
                </div>
              </div>
            </div>

            <div className="float-animation absolute -right-1 top-8 hidden rounded-2xl border border-white bg-white/95 px-4 py-3 shadow-lg sm:block" style={{ animationDelay: '1.2s' }}>
              <p className="text-xs font-bold text-emerald-800">✦ Designed around you</p>
              <p className="mt-1 text-[11px] text-slate-500">A more connected experience</p>
            </div>
          </div>
        </section>

        {/* Trust strip */}
        <section className="border-y border-emerald-900/5 bg-white/80">
          <div className="mx-auto grid max-w-7xl gap-5 px-5 py-6 sm:grid-cols-3 sm:px-8">
            {[
              ['♡', 'Patient-centred care'],
              ['✚', 'Healthcare professionals'],
              ['◷', 'Organised appointments'],
            ].map(([icon, label], index) => (
              <div key={label} className={`fade-up flex items-center justify-center gap-3 ${index === 1 ? 'delay-1' : index === 2 ? 'delay-2' : ''}`}>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-xl text-emerald-700">{icon}</span>
                <span className="text-sm font-semibold text-slate-700">{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="scroll-mt-24 bg-white py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="fade-up mx-auto max-w-2xl text-center">
              <span className="text-xs font-bold uppercase tracking-[.22em] text-emerald-700 sm:text-sm">A simpler way to get care</span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                {['Every', 'step,', 'made', 'more', 'reassuring.'].map((word, index) => (
                  <span key={word} className="word-reveal mr-2" style={{ '--word-index': index }}>
                    {word}
                  </span>
                ))}
              </h2>
              <p className="mt-5 text-base leading-8 text-slate-600">
                PregaLink brings the key steps of your pregnancy-care journey into one clear, convenient experience.
              </p>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {features.map((item, index) => (
                <article key={item.number} className={`feature-card fade-up rounded-3xl border border-slate-100 bg-[#F8FAF9] p-7 sm:p-8 ${index === 1 ? 'delay-1' : index === 2 ? 'delay-2' : ''}`}>
                  <div className="flex items-center justify-between">
                    <span className="feature-icon flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-3xl text-emerald-800">{item.icon}</span>
                    <span className="text-sm font-bold tracking-widest text-emerald-700/50">{item.number}</span>
                  </div>
                  <h3 className="mt-6 text-xl font-bold text-slate-800">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">{item.description}</p>
                  <Link to="/doctors" className="animated-link mt-6 inline-flex items-center gap-2 text-sm font-bold text-emerald-800">
                    Learn more <span>→</span>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Call to action */}
        <section className="px-5 py-16 sm:px-8 sm:py-24">
          <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-emerald-950 px-6 py-12 text-center text-white sm:px-12 sm:py-16">
            <div className="drift-animation pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-emerald-600/40 blur-3xl" />
            <div className="drift-animation pointer-events-none absolute -bottom-28 -left-12 h-64 w-64 rounded-full bg-teal-500/20 blur-3xl" />
            <div className="fade-up relative">
              <span className="text-xs font-bold uppercase tracking-[.22em] text-emerald-200">Your next step starts here</span>
              <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                <span className="typewriter-text">
                  Your care journey deserves attention.
                </span>
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-emerald-100/80 sm:text-base">
                Take the next step towards a more connected pregnancy-care experience.
              </p>
              <Link
                to="/register"
                className="animated-link mt-8 inline-flex items-center gap-3 rounded-full bg-white px-7 py-4 text-sm font-bold text-emerald-950 transition hover:-translate-y-1 hover:bg-emerald-50"
              >
                Get Started ↗
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p><span className="font-extrabold text-emerald-900">PregaLink</span>{' '}— Thoughtful care for every new beginning.</p>
          <div className="flex flex-wrap gap-5">
            <Link to="/login" className="transition hover:text-emerald-800">Log in</Link>
            <Link to="/register" className="transition hover:text-emerald-800">Get Started</Link>
          </div>
          <p>© {new Date().getFullYear()} PregaLink</p>
        </div>
      </footer>
    </div>
  )
}

export default Home