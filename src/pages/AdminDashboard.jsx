
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'

import {
    collection,
    getDocs,
    query,
    where,
    doc,
    updateDoc,
    setDoc,
    deleteDoc,
} from 'firebase/firestore'

import { motion, AnimatePresence } from 'motion/react'
import {
    Activity,
    ArrowDownRight,
    ArrowRight,
    CalendarDays,
    Check,
    CheckCircle2,
    Clock,
    LayoutDashboard,
    LogOut,
    Menu,
    RefreshCw,
    Search,
    ShieldCheck,
    Stethoscope,
    Users,
    X,
    UserRound,
    HeartPulse,
    ClipboardCheck,
    AlertCircle,
} from 'lucide-react'
import { auth, db } from '../firebase'

const navigation = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'doctors', label: 'Doctor review', icon: Stethoscope },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'appointments', label: 'Appointments', icon: CalendarDays },
]

const panelVariants = {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -5 },
}

function AdminDashboard() {
    const navigate = useNavigate()
    const [activeSection, setActiveSection] = useState('overview')
    const [menuOpen, setMenuOpen] = useState(false)
    const [patients, setPatients] = useState([])
    const [doctors, setDoctors] = useState([])
    const [loading, setLoading] = useState(true)
    const [workingId, setWorkingId] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [notice, setNotice] = useState('')
    const [error, setError] = useState('')

    const loadData = useCallback(async () => {
        setLoading(true)
        setError('')

        try {
            const patientQuery = query(
                collection(db, 'users'),
                where('role', '==', 'patient')
            )
            const doctorQuery = query(
                collection(db, 'users'),
                where('role', '==', 'doctor')
            )

            const [patientSnapshot, doctorSnapshot] = await Promise.all([
                getDocs(patientQuery),
                getDocs(doctorQuery),
            ])

            setPatients(
                patientSnapshot.docs.map((item) => ({
                    id: item.id,
                    ...item.data(),
                }))
            )

            setDoctors(
                doctorSnapshot.docs.map((item) => ({
                    id: item.id,
                    ...item.data(),
                }))
            )
        } catch (err) {
            console.error('Unable to load admin data:', err)
            setError(
                'The dashboard could not load its data. Check the Firestore security rules and try refreshing.'
            )
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadData()
    }, [loadData])

    const handleSignOut = async () => {
        try {
            await signOut(auth)
            navigate('/login', { replace: true })
        } catch (err) {
            console.error('Sign-out failed:', err)
            setError('Unable to sign out. Please try again.')
        }
    }


    const handleDoctorDecision = async (doctor, decision) => {
        const action = decision === 'approved' ? 'approve' : 'reject'

        if (
            !window.confirm(
                `Are you sure you want to ${action} this doctor's application?`
            )
        ) {
            return
        }

        setWorkingId(doctor.id)
        setNotice('')
        setError('')

        try {
            const doctorRef = doc(db, 'users', doctor.id)
            const publicDoctorRef = doc(db, 'publicDoctors', doctor.id)

            // Update the doctor's verification status.
            await updateDoc(doctorRef, {
                verificationStatus: decision,
            })

            if (decision === 'approved') {
                // Publish only fields needed for the public doctor directory.
                await setDoc(publicDoctorRef, {
                    fullName: doctor.fullName || '',
                    role: 'doctor',
                    verificationStatus: 'approved',
                    professionalType: doctor.professionalType || '',
                    specialization: doctor.specialization || '',
                    experience: doctor.experience || '',
                    workplace: doctor.workplace || '',
                    practiceLocation: doctor.practiceLocation || '',
                    qualification: doctor.qualification || '',
                    photoURL: doctor.photoURL || '',
                    bio: doctor.bio || '',
                    services: doctor.services || [],
                    consultationFee: doctor.consultationFee ?? null,
                })
            } else {
                // Remove rejected doctors from the public directory.
                await deleteDoc(publicDoctorRef)
            }

            setNotice(
                `Doctor application ${decision === 'approved' ? 'approved' : 'rejected'
                } successfully.`
            )

            await loadData()
        } catch (err) {
            console.error('Doctor decision failed:', err)
            setError(
                'The decision could not be completed. Check the console for details.'
            )
        } finally {
            setWorkingId(null)
        }
    }


    const pendingDoctors = doctors.filter(
        (doctor) =>
            doctor.verificationStatus === 'pending' ||
            doctor.verificationStatus === 'submitted'
    )

    const filteredDoctors = doctors.filter((doctor) => {
        const term = searchTerm.toLowerCase()
        return (
            (doctor.fullName || '').toLowerCase().includes(term) ||
            (doctor.email || '').toLowerCase().includes(term) ||
            (doctor.specialization || '').toLowerCase().includes(term)
        )
    })

    const filteredPatients = patients.filter((patient) => {
        const term = searchTerm.toLowerCase()
        return (
            (patient.fullName || '').toLowerCase().includes(term) ||
            (patient.email || '').toLowerCase().includes(term)
        )
    })

    const pageTitle =
        navigation.find((item) => item.id === activeSection)?.label ||
        'Overview'

    const stats = [
        {
            label: 'Total patients',
            value: patients.length,
            icon: Users,
            color: 'bg-emerald-50 text-emerald-800',
        },
        {
            label: 'Registered doctors',
            value: doctors.length,
            icon: Stethoscope,
            color: 'bg-amber-50 text-amber-800',
        },
        {
            label: 'Awaiting review',
            value: pendingDoctors.length,
            icon: Clock,
            color: 'bg-blue-50 text-blue-800',
        },
    ]

    const changeSection = (section) => {
        setActiveSection(section)
        setMenuOpen(false)
        setSearchTerm('')
        setNotice('')
        setError('')
    }

    return (
        <div className="flex h-screen overflow-hidden bg-[#F6F7F4] text-[#183D3A]">
            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[#E7E9E2] bg-white transition-transform duration-300 md:static md:translate-x-0 ${menuOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="flex h-[76px] items-center gap-3 border-b border-[#EEF0EA] px-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#183D3A] text-[#D5B27C]">
                        <HeartPulse size={23} />
                    </div>
                    <div>
                        <p className="text-xl font-bold tracking-tight">
                            Prega<span className="text-[#B68B50]">Link</span>
                        </p>
                        <p className="text-[10px] font-semibold tracking-[0.18em] text-[#82908A]">
                            ADMIN WORKSPACE
                        </p>
                    </div>
                </div>

                <div className="px-4 pt-7">
                    <p className="mb-3 px-3 text-[10px] font-bold tracking-[0.18em] text-[#9AA39B]">
                        WORKSPACE
                    </p>

                    <nav className="space-y-1">
                        {navigation.map((item) => {
                            const Icon = item.icon
                            const active = activeSection === item.id

                            return (
                                <button
                                    key={item.id}
                                    onClick={() => changeSection(item.id)}
                                    className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition ${active
                                        ? 'bg-[#183D3A] text-white shadow-md shadow-[#183D3A]/10'
                                        : 'text-[#718078] hover:bg-[#F2F5F0] hover:text-[#183D3A]'
                                        }`}
                                >
                                    <Icon size={19} />
                                    <span className="flex-1">
                                        {item.label}
                                    </span>

                                    {item.id === 'doctors' &&
                                        pendingDoctors.length > 0 && (
                                            <span
                                                className={`rounded-full px-2 py-0.5 text-[10px] ${active
                                                    ? 'bg-white/15 text-white'
                                                    : 'bg-amber-100 text-amber-800'
                                                    }`}
                                            >
                                                {pendingDoctors.length}
                                            </span>
                                        )}
                                </button>
                            )
                        })}
                    </nav>
                </div>

                <div className="mt-auto p-4">
                    <div className="mb-4 rounded-2xl bg-[#F5F6F1] p-4">
                        <div className="flex items-center gap-2">
                            <ShieldCheck
                                size={18}
                                className="text-[#B68B50]"
                            />
                            <span className="text-xs font-semibold">
                                Secure workspace
                            </span>
                        </div>
                        <p className="mt-2 text-xs leading-5 text-[#82908A]">
                            Manage healthcare access and professional
                            verification.
                        </p>
                    </div>

                    <button
                        onClick={() => navigate('/')}
                        className="mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-[#718078] transition hover:bg-[#F2F5F0] hover:text-[#183D3A]"
                    >
                        <ArrowRight size={18} />
                        Visit homepage
                    </button>

                    <button
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
                    >
                        <LogOut size={18} />
                        Sign out
                    </button>
                </div>
            </aside>

            {/* Mobile sidebar backdrop */}
            {menuOpen && (
                <button
                    aria-label="Close navigation"
                    onClick={() => setMenuOpen(false)}
                    className="fixed inset-0 z-40 bg-black/30 md:hidden"
                />
            )}

            {/* Main panel */}
            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                <header className="flex h-[76px] shrink-0 items-center justify-between border-b border-[#E7E9E2] bg-white px-4 sm:px-7">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setMenuOpen(true)}
                            aria-label="Open navigation"
                            className="rounded-lg p-2 hover:bg-[#F2F5F0] md:hidden"
                        >
                            <Menu size={21} />
                        </button>

                        <div>
                            <p className="text-xs text-[#82908A]">
                                Workspace / {pageTitle}
                            </p>
                            <h1 className="mt-1 text-lg font-semibold sm:text-xl">
                                {pageTitle}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={loadData}
                            disabled={loading}
                            title="Refresh dashboard"
                            className="rounded-xl border border-[#E7E9E2] p-2.5 transition hover:bg-[#F5F6F1] disabled:opacity-50"
                        >
                            <RefreshCw
                                size={17}
                                className={loading ? 'animate-spin' : ''}
                            />
                        </button>

                        <div className="hidden items-center gap-2 rounded-xl bg-[#F2F5F0] px-3 py-2 sm:flex">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#183D3A] text-white">
                                <ShieldCheck size={17} />
                            </div>
                            <div>
                                <p className="text-xs font-semibold">Admin</p>
                                <p className="text-[10px] text-[#82908A]">
                                    Administrator
                                </p>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 sm:p-7">
                    {error && (
                        <div
                            role="alert"
                            className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
                        >
                            <AlertCircle size={19} className="mt-0.5 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {notice && (
                        <div className="mb-5 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                            <CheckCircle2 size={19} />
                            {notice}
                        </div>
                    )}

                    <AnimatePresence mode="wait">
                        <motion.section
                            key={activeSection}
                            variants={panelVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            transition={{ duration: 0.2 }}
                            className="mx-auto max-w-7xl"
                        >
                            {/* Overview */}
                            {activeSection === 'overview' && (
                                <div className="space-y-6">
                                    <div className="relative overflow-hidden rounded-3xl bg-[#183D3A] p-6 text-white sm:p-8">
                                        <div className="pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full border border-white/10" />
                                        <div className="pointer-events-none absolute -bottom-20 right-24 h-48 w-48 rounded-full bg-[#D5B27C]/10 blur-2xl" />

                                        <div className="relative max-w-2xl">
                                            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs text-[#E7D5B7]">
                                                <Activity size={14} />
                                                PLATFORM OVERVIEW
                                            </div>
                                            <h2 className="mt-5 text-2xl font-semibold sm:text-3xl">
                                                Welcome back, Admin
                                            </h2>
                                            <p className="mt-3 max-w-lg text-sm leading-6 text-white/70">
                                                Keep track of your community
                                                and review healthcare
                                                professionals joining PregaLink.
                                            </p>
                                            <button
                                                onClick={() =>
                                                    changeSection('doctors')
                                                }
                                                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#D5B27C] px-4 py-3 text-sm font-semibold text-[#183D3A] transition hover:bg-[#E6C99A]"
                                            >
                                                Review doctors
                                                <ArrowRight size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                        {stats.map((stat, index) => {
                                            const Icon = stat.icon

                                            return (
                                                <motion.button
                                                    key={stat.label}
                                                    onClick={() =>
                                                        changeSection(
                                                            index === 0
                                                                ? 'patients'
                                                                : index === 1
                                                                    ? 'doctors'
                                                                    : 'doctors'
                                                        )
                                                    }
                                                    whileHover={{ y: -3 }}
                                                    whileTap={{ scale: 0.99 }}
                                                    className="rounded-2xl border border-[#E7E9E2] bg-white p-5 text-left transition hover:shadow-lg hover:shadow-[#183D3A]/5 sm:p-6"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div
                                                            className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.color}`}
                                                        >
                                                            <Icon size={21} />
                                                        </div>
                                                        <ArrowDownRight
                                                            size={18}
                                                            className="text-[#A0AAA2]"
                                                        />
                                                    </div>
                                                    <p className="mt-5 text-sm text-[#718078]">
                                                        {stat.label}
                                                    </p>
                                                    <p className="mt-1 text-3xl font-semibold">
                                                        {loading
                                                            ? '…'
                                                            : stat.value}
                                                    </p>
                                                </motion.button>
                                            )
                                        })}
                                    </div>

                                    <div className="grid gap-5 xl:grid-cols-5">
                                        <div className="rounded-2xl border border-[#E7E9E2] bg-white p-5 sm:p-6 xl:col-span-3">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="font-semibold">
                                                        Doctor verification
                                                    </h3>
                                                    <p className="mt-1 text-xs text-[#82908A]">
                                                        Applications requiring
                                                        attention
                                                    </p>
                                                </div>
                                                <div className="rounded-xl bg-amber-50 p-2.5 text-amber-800">
                                                    <ClipboardCheck size={20} />
                                                </div>
                                            </div>

                                            {loading ? (
                                                <p className="py-8 text-sm text-[#82908A]">
                                                    Loading applications…
                                                </p>
                                            ) : pendingDoctors.length === 0 ? (
                                                <div className="py-8 text-center">
                                                    <CheckCircle2
                                                        size={30}
                                                        className="mx-auto text-emerald-700"
                                                    />
                                                    <p className="mt-3 text-sm font-medium">
                                                        No pending applications
                                                    </p>
                                                    <p className="mt-1 text-xs text-[#82908A]">
                                                        New submissions will
                                                        appear here.
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="mt-4 divide-y divide-[#EEF0EA]">
                                                    {pendingDoctors
                                                        .slice(0, 4)
                                                        .map((doctor) => (
                                                            <div
                                                                key={doctor.id}
                                                                className="flex items-center gap-3 py-3"
                                                            >
                                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EAF1E9]">
                                                                    <UserRound
                                                                        size={19}
                                                                    />
                                                                </div>
                                                                <div className="min-w-0 flex-1">
                                                                    <p className="truncate text-sm font-semibold">
                                                                        {doctor.fullName ||
                                                                            'Unnamed doctor'}
                                                                    </p>
                                                                    <p className="truncate text-xs text-[#82908A]">
                                                                        {doctor.specialization ||
                                                                            doctor.professionalType ||
                                                                            'Healthcare professional'}
                                                                    </p>
                                                                </div>
                                                                <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-medium text-amber-800">
                                                                    Pending
                                                                </span>
                                                            </div>
                                                        ))}
                                                </div>
                                            )}

                                            <button
                                                onClick={() =>
                                                    changeSection('doctors')
                                                }
                                                className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#9B733B] hover:text-[#183D3A]"
                                            >
                                                View all applications
                                                <ArrowRight size={15} />
                                            </button>
                                        </div>

                                        <div className="rounded-2xl border border-[#E7E9E2] bg-white p-5 sm:p-6 xl:col-span-2">
                                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF1E9] text-[#183D3A]">
                                                <ShieldCheck size={22} />
                                            </div>
                                            <h3 className="mt-4 font-semibold">
                                                Trust & safety
                                            </h3>
                                            <p className="mt-2 text-sm leading-6 text-[#718078]">
                                                Review professional credentials
                                                before granting verified
                                                doctor access.
                                            </p>
                                            <div className="mt-5 rounded-xl bg-[#F5F6F1] p-3">
                                                <p className="text-xs text-[#718078]">
                                                    Pending applications
                                                </p>
                                                <p className="mt-1 text-2xl font-semibold">
                                                    {loading
                                                        ? '…'
                                                        : pendingDoctors.length}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Doctor review */}
                            {activeSection === 'doctors' && (
                                <div className="space-y-5">
                                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                                        <div>
                                            <h2 className="text-2xl font-semibold">
                                                Doctor review
                                            </h2>
                                            <p className="mt-2 text-sm text-[#718078]">
                                                Review professional applications
                                                and their verification status.
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
                                            <Clock size={17} />
                                            {pendingDoctors.length} awaiting
                                            review
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 rounded-xl border border-[#E7E9E2] bg-white px-4 py-3">
                                        <Search
                                            size={19}
                                            className="text-[#82908A]"
                                        />
                                        <input
                                            value={searchTerm}
                                            onChange={(event) =>
                                                setSearchTerm(event.target.value)
                                            }
                                            placeholder="Search by name, email or specialization…"
                                            className="w-full bg-transparent text-sm outline-none placeholder:text-[#A0AAA2]"
                                        />
                                    </div>

                                    <div className="overflow-hidden rounded-2xl border border-[#E7E9E2] bg-white">
                                        {loading ? (
                                            <p className="p-8 text-center text-sm text-[#82908A]">
                                                Loading doctors…
                                            </p>
                                        ) : filteredDoctors.length === 0 ? (
                                            <div className="p-10 text-center">
                                                <Stethoscope
                                                    size={32}
                                                    className="mx-auto text-[#A0AAA2]"
                                                />
                                                <p className="mt-3 font-medium">
                                                    No doctors found
                                                </p>
                                                <p className="mt-1 text-sm text-[#82908A]">
                                                    Try another search or
                                                    refresh the dashboard.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-[#EEF0EA]">
                                                {filteredDoctors.map(
                                                    (doctor) => {
                                                        const pending =
                                                            doctor.verificationStatus ===
                                                            'pending' ||
                                                            doctor.verificationStatus ===
                                                            'submitted'

                                                        return (
                                                            <div
                                                                key={doctor.id}
                                                                className="flex flex-col gap-4 p-5 transition hover:bg-[#FBFCF9] sm:flex-row sm:items-center"
                                                            >
                                                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#EAF1E9] text-[#183D3A]">
                                                                    <Stethoscope
                                                                        size={
                                                                            22
                                                                        }
                                                                    />
                                                                </div>

                                                                <div className="min-w-0 flex-1">
                                                                    <p className="font-semibold">
                                                                        {doctor.fullName ||
                                                                            'Name not provided'}
                                                                    </p>
                                                                    <p className="mt-1 break-all text-sm text-[#718078]">
                                                                        {doctor.email ||
                                                                            'No email provided'}
                                                                    </p>
                                                                    <p className="mt-1 text-xs text-[#82908A]">
                                                                        {doctor.professionalType ||
                                                                            'Professional'}{' '}
                                                                        {doctor.specialization
                                                                            ? `· ${doctor.specialization}`
                                                                            : ''}
                                                                        {doctor.registrationNumber
                                                                            ? ` · Reg. ${doctor.registrationNumber}`
                                                                            : ''}
                                                                    </p>
                                                                    {doctor.qualification && (
                                                                        <p className="mt-1 text-xs text-[#82908A]">
                                                                            {
                                                                                doctor.qualification
                                                                            }
                                                                            {doctor.institution
                                                                                ? ` · ${doctor.institution}`
                                                                                : ''}
                                                                        </p>
                                                                    )}
                                                                </div>

                                                                <div className="flex flex-wrap items-center gap-2">
                                                                    <span
                                                                        className={`rounded-full px-3 py-1.5 text-xs font-medium ${doctor.verificationStatus ===
                                                                            'approved'
                                                                            ? 'bg-emerald-50 text-emerald-800'
                                                                            : doctor.verificationStatus ===
                                                                                'rejected'
                                                                                ? 'bg-red-50 text-red-700'
                                                                                : 'bg-amber-50 text-amber-800'
                                                                            }`}
                                                                    >
                                                                        {doctor.verificationStatus ||
                                                                            'Unknown status'}
                                                                    </span>

                                                                    {pending && (
                                                                        <>
                                                                            <button
                                                                                disabled={
                                                                                    workingId ===
                                                                                    doctor.id
                                                                                }
                                                                                onClick={() =>
                                                                                    handleDoctorDecision(
                                                                                        doctor,
                                                                                        'approved'
                                                                                    )
                                                                                }
                                                                                className="inline-flex items-center gap-1.5 rounded-lg bg-[#183D3A] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#24534D] disabled:opacity-50"
                                                                            >
                                                                                <Check
                                                                                    size={
                                                                                        14
                                                                                    }
                                                                                />
                                                                                Approve
                                                                            </button>
                                                                            <button
                                                                                disabled={
                                                                                    workingId ===
                                                                                    doctor.id
                                                                                }
                                                                                onClick={() =>
                                                                                    handleDoctorDecision(
                                                                                        doctor,
                                                                                        'rejected'
                                                                                    )
                                                                                }
                                                                                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                                                                            >
                                                                                <X
                                                                                    size={
                                                                                        14
                                                                                    }
                                                                                />
                                                                                Reject
                                                                            </button>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )
                                                    }
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Patients */}
                            {activeSection === 'patients' && (
                                <div className="space-y-5">
                                    <div>
                                        <h2 className="text-2xl font-semibold">
                                            Patient management
                                        </h2>
                                        <p className="mt-2 text-sm text-[#718078]">
                                            View registered patient accounts.
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-3 rounded-xl border border-[#E7E9E2] bg-white px-4 py-3">
                                        <Search
                                            size={19}
                                            className="text-[#82908A]"
                                        />
                                        <input
                                            value={searchTerm}
                                            onChange={(event) =>
                                                setSearchTerm(event.target.value)
                                            }
                                            placeholder="Search patients by name or email…"
                                            className="w-full bg-transparent text-sm outline-none placeholder:text-[#A0AAA2]"
                                        />
                                    </div>

                                    <div className="overflow-hidden rounded-2xl border border-[#E7E9E2] bg-white">
                                        {loading ? (
                                            <p className="p-8 text-center text-sm text-[#82908A]">
                                                Loading patients…
                                            </p>
                                        ) : filteredPatients.length === 0 ? (
                                            <p className="p-8 text-center text-sm text-[#82908A]">
                                                No patients found.
                                            </p>
                                        ) : (
                                            <div className="divide-y divide-[#EEF0EA]">
                                                {filteredPatients.map(
                                                    (patient) => (
                                                        <div
                                                            key={patient.id}
                                                            className="flex items-center gap-3 p-5"
                                                        >
                                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EEF0F8] text-[#535F91]">
                                                                <UserRound
                                                                    size={20}
                                                                />
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <p className="truncate text-sm font-semibold">
                                                                    {patient.fullName ||
                                                                        'Unnamed patient'}
                                                                </p>
                                                                <p className="truncate text-xs text-[#82908A]">
                                                                    {patient.email ||
                                                                        'No email provided'}
                                                                </p>
                                                            </div>
                                                            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-800">
                                                                Patient
                                                            </span>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Appointments */}
                            {activeSection === 'appointments' && (
                                <div className="space-y-5">
                                    <div>
                                        <h2 className="text-2xl font-semibold">
                                            Appointment oversight
                                        </h2>
                                        <p className="mt-2 text-sm text-[#718078]">
                                            The appointment section is ready
                                            for the booking data connection.
                                        </p>
                                    </div>

                                    <div className="rounded-2xl border border-[#E7E9E2] bg-white p-8 sm:p-12">
                                        <div className="mx-auto max-w-md text-center">
                                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EEF0F8] text-[#535F91]">
                                                <CalendarDays size={30} />
                                            </div>
                                            <h3 className="mt-5 text-lg font-semibold">
                                                Appointment data not connected
                                            </h3>
                                            <p className="mt-2 text-sm leading-6 text-[#718078]">
                                                Once the booking collection and
                                                its data structure are confirmed,
                                                we can display appointments,
                                                dates, patients and assigned
                                                healthcare professionals here.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.section>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    )
}

export default AdminDashboard
