
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { AnimatePresence, motion } from 'motion/react'
import {
    Activity,
    ArrowRight,
    Bell,
    CalendarDays,
    CheckCircle2,
    ClipboardList,
    Heart,
    LayoutDashboard,
    LogOut,
    Menu,
    ShieldCheck,
    Stethoscope,
    UserRound,
    X,
} from 'lucide-react'
import { auth, signOut } from '../auth'
import { db } from '../firebase'

const navigation = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'doctors', label: 'Find a doctor', icon: Stethoscope },
    { id: 'appointments', label: 'Appointments', icon: CalendarDays },
    { id: 'profile', label: 'My profile', icon: UserRound },
]

function PatientDashboard() {
    const navigate = useNavigate()
    const [user, setUser] = useState(null)
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [activePage, setActivePage] = useState('overview')
    const [menuOpen, setMenuOpen] = useState(false)
    const [loggingOut, setLoggingOut] = useState(false)

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (!currentUser) {
                navigate('/login', { replace: true })
                return
            }

            setUser(currentUser)

            try {
                const profileRef = doc(db, 'users', currentUser.uid)
                const profileSnapshot = await getDoc(profileRef)

                if (profileSnapshot.exists()) {
                    const profileData = profileSnapshot.data()

                    if (profileData.role !== 'patient') {
                        navigate('/login', { replace: true })
                        return
                    }

                    setProfile(profileData)
                } else {
                    setError('We could not find your profile. Please contact support.')
                }
            } catch (err) {
                console.error('Profile loading error:', err)
                setError('Unable to load your profile. Please try again.')
            } finally {
                setLoading(false)
            }
        })

        return () => unsubscribe()
    }, [navigate])

    const handleLogout = async () => {
        setLoggingOut(true)

        try {
            await signOut(auth)
            navigate('/login', { replace: true })
        } catch (err) {
            console.error('Logout error:', err)
            setError('Unable to sign out. Please try again.')
            setLoggingOut(false)
        }
    }

    const firstName =
        profile?.fullName?.trim()?.split(/\s+/)[0] ||
        user?.displayName?.split(/\s+/)[0] ||
        'there'

    const selectPage = (page) => {
        setActivePage(page)
        setMenuOpen(false)
    }

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#FCFAF7] text-[#183D3A]">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#E5EAE4] border-t-[#183D3A]" />
                    <p className="text-sm font-medium">Preparing your dashboard...</p>
                </div>
            </main>
        )
    }

    const pageTitles = {
        overview: 'Patient overview',
        doctors: 'Find a doctor',
        appointments: 'My appointments',
        profile: 'My profile',
    }

    return (
        <main className="flex h-screen overflow-hidden bg-[#FCFAF7] text-[#183D3A]">
            {/* Mobile overlay */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.button
                        type="button"
                        aria-label="Close navigation"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setMenuOpen(false)}
                        className="fixed inset-0 z-40 bg-[#102B29]/40 md:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-[#E8E7DF] bg-white transition-transform duration-300 md:static md:translate-x-0 ${menuOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="flex h-20 items-center justify-between border-b border-[#F0F0EA] px-6">
                    <Link to="/" className="text-2xl font-bold tracking-tight">
                        Prega<span className="text-[#B68B50]">Link</span>
                    </Link>
                    <button
                        type="button"
                        onClick={() => setMenuOpen(false)}
                        aria-label="Close menu"
                        className="rounded-lg p-2 hover:bg-[#F5F6F1] md:hidden"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="px-5 pt-7">
                    <div className="rounded-2xl bg-[#183D3A] p-4 text-white">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#D5B27C]">
                                <Heart size={22} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-white/65">PATIENT PORTAL</p>
                                <p className="mt-1 truncate text-sm font-semibold">
                                    Your care space
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-6 pb-3 pt-8 text-[10px] font-bold tracking-[0.2em] text-[#9AA49D]">
                    MENU
                </div>

                <nav className="flex-1 space-y-1 px-4">
                    {navigation.map((item) => {
                        const Icon = item.icon
                        const isActive = activePage === item.id

                        return (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => {
                                    if (item.id === 'doctors') {
                                        navigate('/doctors')
                                        setMenuOpen(false)
                                    } else {
                                        selectPage(item.id)
                                    }
                                }}
                                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition ${isActive
                                    ? 'bg-[#EAF1E9] text-[#183D3A]'
                                    : 'text-[#74817A] hover:bg-[#F7F8F4] hover:text-[#183D3A]'
                                    }`}
                            >
                                <Icon size={19} />
                                <span>{item.label}</span>
                                {isActive && (
                                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#B68B50]" />
                                )}
                            </button>
                        )
                    })}
                </nav>

                <div className="border-t border-[#F0F0EA] p-4">
                    <Link
                        to="/"
                        className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-[#74817A] transition hover:bg-[#F7F8F4] hover:text-[#183D3A]"
                    >
                        <Heart size={18} />
                        Visit homepage
                    </Link>

                    <button
                        type="button"
                        onClick={handleLogout}
                        disabled={loggingOut}
                        className="mt-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#A65B52] transition hover:bg-red-50 disabled:opacity-60"
                    >
                        <LogOut size={18} />
                        {loggingOut ? 'Signing out...' : 'Sign out'}
                    </button>

                    <div className="mt-4 flex items-center gap-3 rounded-xl bg-[#FCFAF7] p-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#DCE8DC] font-semibold text-[#183D3A]">
                            {firstName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">
                                {profile?.fullName || firstName}
                            </p>
                            <p className="truncate text-xs text-[#89948D]">Patient account</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main area */}
            <section className="flex min-w-0 flex-1 flex-col overflow-hidden">
                <header className="flex h-20 shrink-0 items-center justify-between border-b border-[#E8E7DF] bg-white px-5 sm:px-8">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setMenuOpen(true)}
                            aria-label="Open navigation"
                            className="rounded-xl border border-[#E8E7DF] p-2.5 md:hidden"
                        >
                            <Menu size={20} />
                        </button>
                        <div>
                            <p className="text-xs text-[#89948D]">Patient portal</p>
                            <h1 className="mt-1 text-lg font-semibold sm:text-xl">
                                {pageTitles[activePage]}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden text-right sm:block">
                            <p className="text-sm font-semibold">{firstName}</p>
                            <p className="mt-0.5 text-xs text-[#89948D]">Welcome back</p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EAF1E9] font-semibold text-[#183D3A]">
                            {firstName.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-5 sm:p-8">
                    {error && (
                        <div
                            role="alert"
                            className="mb-6 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700"
                        >
                            <ShieldCheck size={19} className="mt-0.5 shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activePage}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.2 }}
                            className="mx-auto max-w-7xl"
                        >
                            {activePage === 'overview' && (
                                <>
                                    <section className="relative overflow-hidden rounded-[28px] bg-[#183D3A] p-7 text-white sm:p-10">
                                        <div className="pointer-events-none absolute -right-12 -top-16 h-64 w-64 rounded-full border border-white/10" />
                                        <div className="pointer-events-none absolute -bottom-20 right-24 h-48 w-48 rounded-full bg-[#B68B50]/10 blur-2xl" />

                                        <div className="relative z-10 max-w-2xl">
                                            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-[#E7D5B7]">
                                                <Heart size={14} />
                                                YOUR PREGNANCY CARE SPACE
                                            </span>
                                            <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
                                                Welcome, {firstName}
                                                <span className="text-[#D5B27C]">!</span>
                                            </h2>
                                            <p className="mt-3 max-w-xl text-sm leading-7 text-white/75 sm:text-base">
                                                Your pregnancy journey matters. Find trusted healthcare
                                                professionals and keep your care journey organised in one place.
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => navigate('/doctors')}
                                                className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#D5B27C] px-5 py-3 text-sm font-semibold text-[#183D3A] transition hover:bg-[#E4C99F]"
                                            >
                                                Find a doctor <ArrowRight size={17} />
                                            </button>
                                        </div>
                                    </section>

                                    <div className="mt-9">
                                        <p className="text-xs font-semibold tracking-[0.18em] text-[#B68B50]">
                                            YOUR HEALTH, YOUR JOURNEY
                                        </p>
                                        <h2 className="mt-2 text-2xl font-semibold">
                                            Your care overview
                                        </h2>
                                        <p className="mt-2 text-sm text-[#74817A]">
                                            Your essential care tools, all in one place.
                                        </p>
                                    </div>

                                    <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                                        <article className="rounded-3xl border border-[#E8E7DF] bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-[#183D3A]/5">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF1E9] text-[#183D3A]">
                                                <Stethoscope size={23} />
                                            </div>
                                            <h3 className="mt-5 text-lg font-semibold">Find a doctor</h3>
                                            <p className="mt-2 text-sm leading-6 text-[#74817A]">
                                                Explore healthcare professionals and find someone suited to your care needs.
                                            </p>
                                            <Link
                                                to="/doctors"
                                                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold hover:gap-3"
                                            >
                                                Browse doctors <ArrowRight size={16} />
                                            </Link>
                                        </article>

                                        <article className="rounded-3xl border border-[#E8E7DF] bg-white p-6">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F7EFE2] text-[#9B733B]">
                                                <CalendarDays size={23} />
                                            </div>
                                            <h3 className="mt-5 text-lg font-semibold">My appointments</h3>
                                            <p className="mt-2 text-sm leading-6 text-[#74817A]">
                                                Your appointment schedule and history will appear here once booking is connected.
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => selectPage('appointments')}
                                                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#9B733B]"
                                            >
                                                View appointments <ArrowRight size={16} />
                                            </button>
                                        </article>

                                        <article className="rounded-3xl border border-[#E8E7DF] bg-white p-6 md:col-span-2 xl:col-span-1">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF0F8] text-[#535F91]">
                                                <UserRound size={23} />
                                            </div>
                                            <h3 className="mt-5 text-lg font-semibold">My profile</h3>
                                            <p className="mt-2 break-words text-sm text-[#74817A]">
                                                {profile?.email || user?.email || 'No email available'}
                                            </p>
                                            <div className="mt-5 flex items-center gap-2 border-t border-[#F0F0EA] pt-4 text-sm">
                                                <CheckCircle2 size={17} className="text-[#5D9272]" />
                                                <span className="capitalize">{profile?.role || 'patient'} account</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => selectPage('profile')}
                                                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold"
                                            >
                                                View profile <ArrowRight size={16} />
                                            </button>
                                        </article>
                                    </div>

                                    <section className="mt-7 flex flex-col gap-4 rounded-3xl border border-[#E8E7DF] bg-white p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
                                        <div className="flex items-start gap-4">
                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F7EFE2] text-[#9B733B]">
                                                <Bell size={22} />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold">Stay connected to your care</h3>
                                                <p className="mt-1 max-w-xl text-sm leading-6 text-[#74817A]">
                                                    Check your portal for updates and keep your profile information current.
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => selectPage('profile')}
                                            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-[#D8DDD5] px-5 py-3 text-sm font-semibold hover:bg-[#F5F6F1]"
                                        >
                                            View my profile <ArrowRight size={16} />
                                        </button>
                                    </section>
                                </>
                            )}

                            {activePage === 'appointments' && (
                                <section className="rounded-3xl border border-[#E8E7DF] bg-white p-7 sm:p-10">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F7EFE2] text-[#9B733B]">
                                        <CalendarDays size={26} />
                                    </div>
                                    <h2 className="mt-5 text-2xl font-semibold">Your appointments</h2>
                                    <p className="mt-2 max-w-xl text-sm leading-7 text-[#74817A]">
                                        Your bookings will appear here once appointment scheduling is connected.
                                        You can explore available healthcare professionals in the meantime.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => navigate('/doctors')}
                                        className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#183D3A] px-5 py-3 text-sm font-semibold text-white hover:bg-[#24514D]"
                                    >
                                        Find a doctor <ArrowRight size={17} />
                                    </button>
                                </section>
                            )}

                            {activePage === 'profile' && (
                                <section className="max-w-3xl rounded-3xl border border-[#E8E7DF] bg-white p-7 sm:p-10">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF1E9] text-[#183D3A]">
                                            <UserRound size={26} />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-semibold">My profile</h2>
                                            <p className="mt-1 text-sm text-[#74817A]">
                                                Your account information
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-8 divide-y divide-[#F0F0EA]">
                                        <div className="py-4">
                                            <p className="text-xs font-medium uppercase tracking-wider text-[#89948D]">Full name</p>
                                            <p className="mt-2 font-medium">{profile?.fullName || 'Not provided'}</p>
                                        </div>
                                        <div className="py-4">
                                            <p className="text-xs font-medium uppercase tracking-wider text-[#89948D]">Email address</p>
                                            <p className="mt-2 break-all font-medium">{profile?.email || user?.email || 'Not provided'}</p>
                                        </div>
                                        <div className="py-4">
                                            <p className="text-xs font-medium uppercase tracking-wider text-[#89948D]">Account type</p>
                                            <p className="mt-2 font-medium capitalize">{profile?.role || 'patient'}</p>
                                        </div>
                                    </div>

                                    <p className="mt-4 text-sm leading-6 text-[#74817A]">
                                        Profile editing can be added next, using the existing Firestore security rules.
                                    </p>
                                </section>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    <footer className="mx-auto mt-10 flex max-w-7xl flex-col gap-2 border-t border-[#E8E7DF] py-5 text-xs text-[#89948D] sm:flex-row sm:justify-between">
                        <p>© {new Date().getFullYear()} PregaLink. Your care, connected.</p>
                        <p className="flex items-center gap-2">
                            <Activity size={14} />
                            Supporting your pregnancy-care journey
                        </p>
                    </footer>
                </div>
            </section>
        </main>
    )
}

export default PatientDashboard
