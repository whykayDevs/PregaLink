
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { AnimatePresence, motion } from 'motion/react'
import {
    Activity,
    ArrowRight,
    Bell,
    CalendarDays,
    CalendarClock,
    CheckCircle2,
    Clock,
    ClipboardList,
    Heart,
    LayoutDashboard,
    LogOut,
    Menu,
    ShieldCheck,
    Stethoscope,
    UserRound,
    Users,
    X,
} from 'lucide-react'
import { auth, signOut } from '../auth'
import { db } from '../firebase'

const navigation = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'appointments', label: 'Appointments', icon: CalendarDays },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'availability', label: 'Availability', icon: CalendarClock },
    { id: 'profile', label: 'My profile', icon: UserRound },
]

function DoctorDashboard() {
    const navigate = useNavigate()
    const [user, setUser] = useState(null)
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [activePage, setActivePage] = useState('overview')
    const [workingDays, setWorkingDays] = useState([])
    const [startTime, setStartTime] = useState('09:00')
    const [endTime, setEndTime] = useState('17:00')
    const [consultationFee, setConsultationFee] = useState('')


    const handleSaveAvailability = async () => {
        if (workingDays.length === 0) {
            setAvailabilityMessage('Please select at least one working day.')
            return
        }

        if (startTime >= endTime) {
            setAvailabilityMessage('Closing time must be later than start time.')
            return
        }

        if (!user?.uid) {
            setAvailabilityMessage('Please log in again to continue.')
            return
        }

        setSavingAvailability(true)
        setAvailabilityMessage('')

        try {
            await setDoc(
                doc(db, 'doctorAvailability', user.uid),
                {
                    doctorId: user.uid,
                    workingDays,
                    startTime,
                    endTime,
                    consultationFee: Number(consultationFee),
                    updatedAt: serverTimestamp(),
                },
                { merge: true }
            )

            setAvailabilityMessage('Your availability has been saved successfully.')
        } catch (error) {
            console.error('Error saving availability:', error)
            setAvailabilityMessage(
                `${error.code || 'Error'}: ${error.message || 'Unable to save availability.'}`
            )
        } finally {
            setSavingAvailability(false)
        }
    }

    const [menuOpen, setMenuOpen] = useState(false)
    const [loggingOut, setLoggingOut] = useState(false)
    const [savingAvailability, setSavingAvailability] = useState(false)
    const [availabilityMessage, setAvailabilityMessage] = useState('')

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

                if (!profileSnapshot.exists()) {
                    setError('We could not find your doctor profile. Please contact support.')
                    setLoading(false)
                    return
                }

                const profileData = profileSnapshot.data()

                if (profileData.role !== 'doctor') {
                    navigate('/login', { replace: true })
                    return
                }

                setProfile(profileData)
                const availabilityRef = doc(
                    db,
                    'doctorAvailability',
                    currentUser.uid
                )

                const availabilitySnapshot = await getDoc(availabilityRef)

                if (availabilitySnapshot.exists()) {
                    const availabilityData = availabilitySnapshot.data()

                    setWorkingDays(availabilityData.workingDays || [])
                    setStartTime(availabilityData.startTime || '09:00')
                    setEndTime(availabilityData.endTime || '17:00')
                    setConsultationFee(
                        availabilityData.consultationFee != null
                            ? String(availabilityData.consultationFee)
                            : ''
                    )
                }
            } catch (err) {
                console.error('Doctor profile loading error:', err)
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
        'Doctor'

    const verificationStatus = profile?.verificationStatus || 'pending'
    const isApproved = verificationStatus === 'approved'

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
        overview: 'Practice overview',
        appointments: 'Appointments',
        patients: 'Patients',
        availability: 'Manage availability',
        profile: 'My professional profile',
    }

    return (
        <main className="flex h-screen overflow-hidden bg-[#FCFAF7] text-[#183D3A]">
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
                                <Stethoscope size={22} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-white/65">DOCTOR PORTAL</p>
                                <p className="mt-1 truncate text-sm font-semibold">
                                    Clinical workspace
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-6 pb-3 pt-8 text-[10px] font-bold tracking-[0.2em] text-[#9AA49D]">
                    WORKSPACE
                </div>

                <nav className="flex-1 space-y-1 px-4">
                    {navigation.map((item) => {
                        const Icon = item.icon
                        const isActive = activePage === item.id

                        return (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => selectPage(item.id)}
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
                            <p className="truncate text-xs text-[#89948D]">Doctor account</p>
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
                            <p className="text-xs text-[#89948D]">Doctor portal</p>
                            <h1 className="mt-1 text-lg font-semibold sm:text-xl">
                                {pageTitles[activePage]}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden text-right sm:block">
                            <p className="text-sm font-semibold">{firstName}</p>
                            <p className="mt-0.5 text-xs text-[#89948D]">Doctor workspace</p>
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
                                                DOCTOR WORKSPACE
                                            </span>
                                            <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
                                                Welcome, {firstName}
                                                <span className="text-[#D5B27C]">!</span>
                                            </h2>
                                            <p className="mt-3 max-w-xl text-sm leading-7 text-white/75 sm:text-base">
                                                Your workspace for supporting expectant mothers and coordinating their care.
                                            </p>
                                            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#D5B27C] px-4 py-2.5 text-sm font-semibold text-[#183D3A]">
                                                {isApproved ? (
                                                    <>
                                                        <CheckCircle2 size={17} />
                                                        Verified doctor
                                                    </>
                                                ) : (
                                                    <>
                                                        <Clock size={17} />
                                                        Verification {verificationStatus}
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <div className="absolute bottom-8 right-10 hidden h-32 w-32 items-center justify-center rounded-full border border-white/15 bg-white/5 lg:flex">
                                            <Stethoscope size={48} strokeWidth={1.2} className="text-[#D5B27C]" />
                                        </div>
                                    </section>

                                    {!isApproved && (
                                        <section className="mt-6 rounded-2xl border border-[#E9DCC3] bg-[#FBF5EA] p-5">
                                            <div className="flex items-start gap-3">
                                                <Clock size={21} className="mt-0.5 shrink-0 text-[#9B733B]" />
                                                <div>
                                                    <h3 className="font-semibold text-[#76572D]">
                                                        Your account is awaiting approval
                                                    </h3>
                                                    <p className="mt-1 text-sm leading-6 text-[#806B4D]">
                                                        Your current verification status is “{verificationStatus}”.
                                                        Once an administrator approves your profile, your account will be marked as verified.
                                                    </p>
                                                </div>
                                            </div>
                                        </section>
                                    )}

                                    <div className="mt-9">
                                        <p className="text-xs font-semibold tracking-[0.18em] text-[#B68B50]">
                                            AT A GLANCE
                                        </p>
                                        <h2 className="mt-2 text-2xl font-semibold">Practice overview</h2>
                                        <p className="mt-2 text-sm text-[#74817A]">
                                            Your clinical activity and practice tools.
                                        </p>
                                    </div>

                                    <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                                        {[
                                            {
                                                label: 'Total patients',
                                                description: 'Patients under your care',
                                                icon: Users,
                                                color: 'bg-[#EAF1E9] text-[#183D3A]',
                                            },
                                            {
                                                label: 'Upcoming appointments',
                                                description: 'Scheduled consultations',
                                                icon: CalendarDays,
                                                color: 'bg-[#F7EFE2] text-[#9B733B]',
                                            },
                                            {
                                                label: 'Completed visits',
                                                description: 'Completed consultations',
                                                icon: CheckCircle2,
                                                color: 'bg-[#EEF0F8] text-[#535F91]',
                                            },
                                        ].map((stat, index) => {
                                            const Icon = stat.icon

                                            return (
                                                <motion.article
                                                    key={stat.label}
                                                    initial={{ opacity: 0, y: 15 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.07 }}
                                                    className="rounded-3xl border border-[#E8E7DF] bg-white p-6 sm:p-7"
                                                >
                                                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${stat.color}`}>
                                                        <Icon size={23} />
                                                    </div>
                                                    <p className="mt-5 text-sm font-medium text-[#657572]">
                                                        {stat.label}
                                                    </p>
                                                    <p className="mt-2 text-3xl font-semibold">—</p>
                                                    <p className="mt-2 text-xs text-[#89948D]">
                                                        {stat.description} · Not connected yet
                                                    </p>
                                                </motion.article>
                                            )
                                        })}
                                    </div>

                                    <section className="mt-7 rounded-3xl border border-[#E8E7DF] bg-white p-6 sm:p-7">
                                        <div className="flex items-start gap-4">
                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F7EFE2] text-[#9B733B]">
                                                <Bell size={22} />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold">Your clinical tools are taking shape</h3>
                                                <p className="mt-1 text-sm leading-6 text-[#74817A]">
                                                    Appointment scheduling and patient management will be connected as we build the booking system.
                                                </p>
                                            </div>
                                        </div>
                                    </section>
                                </>
                            )}

                            {activePage === 'appointments' && (
                                <section className="rounded-3xl border border-[#E8E7DF] bg-white p-7 sm:p-10">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F7EFE2] text-[#9B733B]">
                                        <CalendarDays size={26} />
                                    </div>
                                    <h2 className="mt-5 text-2xl font-semibold">Appointments</h2>
                                    <p className="mt-2 max-w-xl text-sm leading-7 text-[#74817A]">
                                        Your scheduled consultations will appear here once the appointment system is connected.
                                    </p>
                                </section>
                            )}


                            {activePage === 'availability' && (
                                <section className="max-w-3xl rounded-3xl border border-[#E8E7DF] bg-white p-7 sm:p-10">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF1E9] text-[#183D3A]">
                                        <CalendarDays size={26} />
                                    </div>

                                    <h2 className="mt-5 text-2xl font-semibold">
                                        Manage your availability
                                    </h2>

                                    <p className="mt-2 text-sm leading-7 text-[#74817A]">
                                        Choose the days and hours when patients can book appointments.
                                    </p>

                                    <div className="mt-8">
                                        <h3 className="font-semibold">Working days</h3>
                                        <p className="mt-1 text-sm text-[#74817A]">
                                            Select every day you normally receive patients.
                                        </p>

                                        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                                            {[
                                                'Monday',
                                                'Tuesday',
                                                'Wednesday',
                                                'Thursday',
                                                'Friday',
                                                'Saturday',
                                                'Sunday',
                                            ].map((day) => (
                                                <label
                                                    key={day}
                                                    className="flex cursor-pointer items-center gap-2 rounded-xl border border-[#E8E7DF] p-3 text-sm"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={workingDays.includes(day)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setWorkingDays([...workingDays, day])
                                                            } else {
                                                                setWorkingDays(workingDays.filter((d) => d !== day))
                                                            }
                                                        }}
                                                    />
                                                    {day}
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mt-8 grid gap-5 sm:grid-cols-2">
                                        <div>
                                            <label className="text-sm font-medium">
                                                Start time
                                            </label>
                                            <input
                                                type="time"
                                                value={startTime}
                                                onChange={(e) => setStartTime(e.target.value)}
                                                className="mt-2 w-full rounded-xl border border-[#E8E7DF] p-3 outline-none focus:border-[#183D3A]"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium">
                                                Closing time
                                            </label>
                                            <input
                                                type="time"
                                                value={endTime}
                                                onChange={(e) => setEndTime(e.target.value)}
                                                className="mt-2 w-full rounded-xl border border-[#E8E7DF] p-3 outline-none focus:border-[#183D3A]"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-[#34483A]">
                                            Consultation Fee (₦)
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="100"
                                            value={consultationFee}
                                            onChange={(e) => setConsultationFee(e.target.value)}
                                            placeholder="Enter consultation fee"
                                            className="w-full rounded-xl border border-[#E8E7DF] px-4 py-3 outline-none focus:border-[#477A57]"
                                        />
                                    </div>

                                    <div className="mt-8">
                                        {availabilityMessage && (
                                            <p className="mb-4 text-sm text-[#183D3A]" role="status">
                                                {availabilityMessage}
                                            </p>
                                        )}

                                        <button
                                            type="button"
                                            onClick={handleSaveAvailability}
                                            disabled={savingAvailability}
                                            className="rounded-xl bg-[#183D3A] px-6 py-3 font-medium text-white transition hover:bg-[#24534E] disabled:opacity-60"
                                        >
                                            {savingAvailability ? 'Saving...' : 'Save Availability'}
                                        </button>
                                    </div>


                                </section>
                            )}


                            {activePage === 'patients' && (
                                <section className="rounded-3xl border border-[#E8E7DF] bg-white p-7 sm:p-10">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF1E9] text-[#183D3A]">
                                        <ClipboardList size={26} />
                                    </div>
                                    <h2 className="mt-5 text-2xl font-semibold">Patient management</h2>
                                    <p className="mt-2 max-w-xl text-sm leading-7 text-[#74817A]">
                                        Patient records will be available here when appointments and patient assignments are implemented.
                                        Patient information will be restricted to authorised care relationships.
                                    </p>
                                </section>
                            )}

                            {activePage === 'profile' && (
                                <section className="max-w-3xl rounded-3xl border border-[#E8E7DF] bg-white p-7 sm:p-10">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF1E9] text-[#183D3A]">
                                            <UserRound size={26} />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-semibold">Professional profile</h2>
                                            <p className="mt-1 text-sm text-[#74817A]">
                                                Your registered account information
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-8 divide-y divide-[#F0F0EA]">
                                        {[
                                            ['Full name', profile?.fullName],
                                            ['Email address', profile?.email || user?.email],
                                            ['Professional type', profile?.professionalType],
                                            ['Specialization', profile?.specialization],
                                            ['Qualification', profile?.qualification],
                                            ['Registration number', profile?.registrationNumber],
                                            ['Workplace', profile?.workplace],
                                            ['Practice location', profile?.practiceLocation],
                                            ['Verification status', verificationStatus],
                                        ].map(([label, value]) => (
                                            <div key={label} className="py-4">
                                                <p className="text-xs font-medium uppercase tracking-wider text-[#89948D]">
                                                    {label}
                                                </p>
                                                <p className="mt-2 break-words font-medium capitalize">
                                                    {value || 'Not provided'}
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    <p className="mt-5 text-sm leading-6 text-[#74817A]">
                                        Profile editing can be added after the core booking workflow is working.
                                    </p>
                                </section>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    <footer className="mx-auto mt-10 flex max-w-7xl flex-col gap-2 border-t border-[#E8E7DF] py-5 text-xs text-[#89948D] sm:flex-row sm:justify-between">
                        <p>© {new Date().getFullYear()} PregaLink. Your care, connected.</p>
                        <p className="flex items-center gap-2">
                            <Activity size={14} />
                            Supporting better pregnancy care
                        </p>
                    </footer>
                </div>
            </section>
        </main>
    )
}

export default DoctorDashboard
