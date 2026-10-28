
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import {
  Search,
  Heart,
  ShieldCheck,
  Users,
  Clock3,
  Stethoscope,
  ArrowRight,
  X,
  CalendarDays,
  CheckCircle2,
  Baby,
  RotateCcw,
  UserRound,
} from 'lucide-react'
import {
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore'
import { db } from '../firebase'

const specialties = ['All specialties']

const formatFee = (fee) =>
  fee != null ? `₦${Number(fee).toLocaleString('en-NG')}` : null



function Doctors() {
  const [search, setSearch] = useState('')
  const [specialty, setSpecialty] = useState('All specialties')
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const navigate = useNavigate()
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadDoctors() {
      try {
        setLoading(true)
        setError('')

        const doctorsQuery = query(
          collection(db, 'publicDoctors'),
          where('verificationStatus', '==', 'approved')
        )

        const snapshot = await getDocs(doctorsQuery)

        const approvedDoctors = snapshot.docs.map((document) => {
          const data = document.data()

          return {
            id: document.id,
            name: data.fullName || 'Healthcare professional',
            specialty:
              data.specialization ||
              data.professionalType ||
              'Maternal healthcare professional',
            experience: data.experience
              ? `${data.experience} years experience`
              : 'Experience not provided',
            fee: data.consultationFee ?? null,
            initials: (data.fullName || 'HP')
              .split(' ')
              .filter(Boolean)
              .slice(-2)
              .map((part) => part[0])
              .join('')
              .toUpperCase(),
            color: '#DCEBE0',
            photo: data.photoURL || '',
            description:
              data.bio ||
              'View this healthcare professional’s profile for more information.',
            services: data.services || [],
          }
        })

        setDoctors(approvedDoctors)
      } catch (err) {
        console.error('Error loading approved doctors:', err)
        setError('We could not load doctors right now. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadDoctors()
  }, [])

  const availableSpecialties = [
    'All specialties',
    ...new Set(doctors.map((doctor) => doctor.specialty)),
  ]

  const filteredDoctors = doctors.filter((doctor) => {
    const searchTerm = search.trim().toLowerCase()

    const matchesSearch =
      doctor.name.toLowerCase().includes(searchTerm) ||
      doctor.specialty.toLowerCase().includes(searchTerm)

    const matchesSpecialty =
      specialty === 'All specialties' ||
      doctor.specialty === specialty

    return matchesSearch && matchesSpecialty
  })


  function resetFilters() {
    setSearch('')
    setSpecialty('All specialties')
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#FAF8F2] text-[#164744]">
      {/* Navigation */}
      <header className="sticky top-0 z-40 border-b border-[#164744]/10 bg-[#FAF8F2]/95 backdrop-blur-lg">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link to="/" className="text-2xl font-bold tracking-tight sm:text-3xl">
            Prega<span className="text-[#C58A3C]">Link</span>
          </Link>

          <div className="flex items-center gap-4 sm:gap-8">
            <Link
              to="/"
              className="hidden text-sm transition hover:text-[#C58A3C] sm:block"
            >
              Home
            </Link>

            <span className="border-b-2 border-[#C58A3C] py-2 text-sm font-semibold">
              Find a Doctor
            </span>

            <Link
              to="/login"
              className="rounded-full bg-[#164744] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#205B56]"
            >
              Log in
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#F5F0E4] via-[#F8F6EF] to-[#E4EEE5]">
        <div className="pointer-events-none absolute -right-20 top-10 h-80 w-80 rounded-full bg-[#D6E5D6]/60 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-52 w-52 rounded-full bg-[#F0D8C1]/40 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-5 pb-14 pt-12 sm:px-8 sm:pt-16 lg:grid-cols-2 lg:gap-12 lg:pb-20">
          <motion.div
            initial={{ opacity: 0, x: -25 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.65 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-[#DDEAE0] px-4 py-2 text-xs font-semibold text-[#164744]">
              <Heart size={15} />
              Trusted Maternal Care
            </div>

            <h1 className="mt-6 max-w-xl text-4xl font-bold leading-[1.13] tracking-tight sm:text-5xl lg:text-6xl">
              Find the right doctor for your{' '}
              <span className="text-[#C58A3C]">pregnancy journey.</span>
            </h1>

            <p className="mt-5 max-w-lg text-base leading-7 text-[#536D6B] sm:text-lg">
              Explore maternal healthcare professionals and find someone who
              fits your needs.
            </p>

            <div className="mt-8 grid max-w-lg grid-cols-3 gap-3">
              {[
                { icon: ShieldCheck, label: 'Trusted care' },
                { icon: Users, label: 'Personal support' },
                { icon: Heart, label: 'Better care' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/80">
                    <Icon size={19} />
                  </span>
                  <span className="text-xs font-medium leading-4 sm:text-sm">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="relative mx-auto w-full max-w-md lg:max-w-lg"
          >
            <div className="absolute inset-x-5 bottom-0 top-8 rounded-[48%_48%_24px_24px] bg-[#E3E9D5]" />

            <div className="absolute right-0 top-6 rounded-2xl bg-white/90 p-3 shadow-lg sm:right-1">
              <Heart className="text-[#C58A3C]" size={23} />
            </div>

            <img
              src="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=850&q=85"
              alt="Expectant mother smiling"
              className="relative z-10 mx-auto h-[300px] w-full object-contain object-bottom sm:h-[390px]"
            />

            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3.5, repeat: Infinity }}
              className="absolute bottom-8 left-0 z-20 flex items-center gap-3 rounded-2xl bg-white p-3 shadow-xl sm:-left-5 sm:p-4"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#DDEAE0]">
                <Baby size={22} />
              </span>
              <div>
                <p className="text-sm font-bold">Your health matters</p>
                <p className="mt-1 text-xs text-slate-500">
                  Care through every stage
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Search */}
      <section className="relative z-20 mx-auto -mt-5 max-w-7xl px-5 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="grid gap-3 rounded-3xl border border-white bg-white p-4 shadow-xl shadow-[#164744]/5 sm:p-5 md:grid-cols-[1fr_0.85fr_auto] md:items-center"
        >
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3.5 transition focus-within:border-[#164744] focus-within:ring-2 focus-within:ring-[#164744]/10">
            <Search className="shrink-0 text-[#164744]" size={21} />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search doctor or specialty..."
              className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          </label>

          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3.5 transition focus-within:border-[#164744]">
            <Stethoscope className="shrink-0" size={21} />
            <select
              value={specialty}
              onChange={(event) => setSpecialty(event.target.value)}
              className="w-full min-w-0 bg-transparent text-sm outline-none"
            >
              {availableSpecialties.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={() => {
              document.getElementById('doctor-results')?.scrollIntoView({
                behavior: 'smooth',
              })
            }}
            className="flex items-center justify-center gap-2 rounded-full bg-[#164744] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[#205B56] active:scale-[0.98]"
          >
            <Search size={18} />
            Search
          </button>
        </motion.div>
      </section>

      {/* Doctor cards */}
      <section
        id="doctor-results"
        className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-16"
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#B87928]">
              Maternal care professionals
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Our Featured Doctors
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#627674] sm:text-base">
              Choose a professional to learn more about their services.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full bg-[#E7EFE8] px-4 py-2 text-sm font-medium">
            <Users size={17} />
            {filteredDoctors.length} results
          </div>
        </div>

        {loading && (
          <div className="mt-8 rounded-2xl bg-white p-8 text-center text-sm">
            Loading approved doctors...
          </div>
        )}

        {error && (
          <div className="mt-8 rounded-2xl bg-red-50 p-6 text-center text-sm text-red-700">
            {error}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="ml-2 font-semibold underline"
            >
              Try again
            </button>
          </div>
        )}

        <AnimatePresence mode="wait">
          {!loading && !error && filteredDoctors.length > 0 ? (
            <motion.div
              key={`${search}-${specialty}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {filteredDoctors.map((doctor, index) => (
                <motion.article
                  key={doctor.id}
                  initial={{ opacity: 0, y: 22 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: index * 0.12 }}
                  whileHover={{ y: -7 }}
                  className="group overflow-hidden rounded-3xl border border-[#E8E3D9] bg-white shadow-sm transition-shadow duration-300 hover:shadow-xl hover:shadow-[#164744]/10"
                >
                  <div className="relative m-3 mb-0 overflow-hidden rounded-[22px]">
                    <div
                      className="absolute inset-0"
                      style={{ backgroundColor: doctor.color }}
                    />

                    <img
                      src={doctor.photo}
                      alt={`Sample portrait for ${doctor.name}`}
                      loading="lazy"
                      className="relative h-56 w-full object-cover object-top transition duration-700 group-hover:scale-105"
                    />

                    <span className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#B87928] shadow-sm">
                      <Heart size={17} />
                    </span>

                    <span className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-xs font-bold shadow-sm">
                      {doctor.initials}
                    </span>

                    <span className="absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-semibold text-[#164744]">
                      Sample profile
                    </span>
                  </div>

                  <div className="p-5 pt-4 sm:p-6 sm:pt-4">
                    <h3 className="text-xl font-bold">{doctor.name}</h3>
                    <p className="mt-1 text-sm text-[#627674]">
                      {doctor.specialty}
                    </p>

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-xs text-[#536D6B]">
                      <span className="flex items-center gap-2">
                        <Clock3 size={16} />
                        {doctor.experience}
                      </span>
                      <span className="flex items-center gap-1.5 font-bold text-[#164744]">
                        <ShieldCheck size={16} />
                        {formatFee(doctor.fee)}
                      </span>
                    </div>

                    <p className="mt-5 min-h-[60px] text-sm leading-6 text-[#627674]">
                      {doctor.description}
                    </p>

                    <button
                      type="button"
                      onClick={() => setSelectedDoctor(doctor)}
                      className="mt-5 flex w-full items-center justify-center gap-3 rounded-full bg-[#164744] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#205B56] focus:outline-none focus:ring-4 focus:ring-[#164744]/15"
                    >
                      View profile
                      <ArrowRight
                        size={17}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </button>
                  </div>
                </motion.article>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 rounded-3xl border border-dashed border-[#164744]/20 bg-white px-6 py-16 text-center"
            >
              <Search size={32} className="mx-auto text-[#8CA39A]" />
              <h3 className="mt-4 text-xl font-bold">No doctors found</h3>
              <p className="mt-2 text-sm text-slate-500">
                Try another name or choose a different specialty.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#164744] px-5 py-3 text-sm font-semibold text-white hover:bg-[#205B56]"
              >
                <RotateCcw size={16} />
                Reset filters
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-8 flex items-start gap-3 rounded-2xl border border-[#E9D9BD] bg-[#F8F0E2] p-4 text-sm leading-6 text-[#785B31]">
          <ShieldCheck className="mt-1 shrink-0" size={19} />
          <p>
            <strong>Demonstration only:</strong> The doctor profiles, photos,
            experience, services, and fees are sample content. Providers have
            not been verified, and appointments cannot yet be booked here.
          </p>
        </div>
      </section>

      {/* Maternal care banner */}
      <section className="mx-auto max-w-7xl px-5 pb-14 sm:px-8">
        <div className="relative overflow-hidden rounded-[30px] bg-[#164744] px-6 py-10 text-white sm:px-10 sm:py-12">
          <div className="absolute -right-10 -top-20 h-56 w-56 rounded-full border border-white/10" />
          <div className="absolute -right-2 -top-12 h-40 w-40 rounded-full border border-white/10" />

          <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div className="flex items-start gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10">
                <Heart size={27} />
              </span>
              <div>
                <h2 className="text-2xl font-bold sm:text-3xl">
                  Your health. Our priority.
                </h2>
                <p className="mt-3 max-w-lg text-sm leading-6 text-white/75 sm:text-base">
                  Every pregnancy journey deserves compassionate support and
                  quality maternal care.
                </p>
              </div>
            </div>

            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 self-start rounded-full bg-[#E8C28A] px-6 py-3.5 text-sm font-bold text-[#164744] transition hover:bg-white sm:self-center"
            >
              Get started
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#164744]/10 bg-[#F5F1E8]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <Link to="/" className="text-2xl font-bold">
            Prega<span className="text-[#C58A3C]">Link</span>
          </Link>

          <p className="text-sm text-[#627674]">
            Your pregnancy journey, supported.
          </p>

          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#164744] hover:text-[#C58A3C]"
          >
            Back to home
            <ArrowRight size={16} />
          </Link>
        </div>
      </footer>

      {/* Doctor profile modal */}
      <AnimatePresence>
        {selectedDoctor && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#102D2B]/65 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedDoctor(null)}
          >
            <motion.section
              role="dialog"
              aria-modal="true"
              aria-labelledby="doctor-modal-title"
              initial={{ opacity: 0, y: 25, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              onClick={(event) => event.stopPropagation()}
              className="relative my-auto w-full max-w-2xl overflow-hidden rounded-3xl bg-[#FAF8F2] shadow-2xl"
            >
              <button
                type="button"
                onClick={() => setSelectedDoctor(null)}
                aria-label="Close profile"
                className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 shadow-sm transition hover:bg-[#F0E7D8]"
              >
                <X size={20} />
              </button>

              <div className="grid sm:grid-cols-[0.8fr_1.2fr]">
                <div
                  className="relative min-h-[260px] sm:min-h-full"
                  style={{ backgroundColor: selectedDoctor.color }}
                >
                  <img
                    src={selectedDoctor.photo}
                    alt={`Sample portrait for ${selectedDoctor.name}`}
                    className="absolute inset-0 h-full w-full object-cover object-top"
                  />
                </div>

                <div className="p-6 sm:p-8">
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#E1EBE2] px-3 py-1.5 text-xs font-semibold text-[#164744]">
                    <UserRound size={14} />
                    Sample profile
                  </span>

                  <h2
                    id="doctor-modal-title"
                    className="mt-4 pr-6 text-2xl font-bold"
                  >
                    {selectedDoctor.name}
                  </h2>

                  <p className="mt-2 text-sm text-[#627674]">
                    {selectedDoctor.specialty}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-4 text-sm">
                    <span className="flex items-center gap-2">
                      <Clock3 size={17} />
                      {selectedDoctor.experience}
                    </span>
                    <span className="flex items-center gap-2 font-bold">
                      <ShieldCheck size={17} />
                      {formatFee(selectedDoctor.fee)}
                    </span>
                  </div>

                  <p className="mt-5 text-sm leading-6 text-[#627674]">
                    {selectedDoctor.description}
                  </p>

                  <h3 className="mt-6 font-bold">Services</h3>
                  <div className="mt-3 space-y-3">
                    {selectedDoctor.services.map((service) => (
                      <div
                        key={service}
                        className="flex items-center gap-2 text-sm text-[#536D6B]"
                      >
                        <CheckCircle2
                          size={17}
                          className="shrink-0 text-[#56836D]"
                        />
                        {service}
                      </div>
                    ))}
                  </div>

                  <div className="mt-7 rounded-2xl bg-[#F0E8D9] p-3 text-xs leading-5 text-[#785B31]">
                    This is a demo profile. Credentials and availability are
                    not verified, and booking is not yet enabled.
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDoctor(null)
                      navigate(`/book-appointment/${selectedDoctor.id}`)
                    }}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#164744] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#205B56]"
                  >
                    <CalendarDays size={17} />
                    Book appointment
                  </button>
                </div>
              </div>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}

export default Doctors
