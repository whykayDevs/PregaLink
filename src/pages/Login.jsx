
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword, auth } from '../auth'
import { db } from '../firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { motion, AnimatePresence } from 'motion/react'
import {
    Heart,
    Mail,
    LockKeyhole,
    Eye,
    EyeOff,
    ArrowRight,
    ShieldCheck,
    Stethoscope,
    Baby,
    CheckCircle2,
    LoaderCircle,
    X,
} from 'lucide-react'

function Login() {
    const navigate = useNavigate()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [toast, setToast] = useState(null)

    useEffect(() => {
        if (!toast) return

        const timer = setTimeout(() => setToast(null), 4000)
        return () => clearTimeout(timer)
    }, [toast])

    const handleLogin = async (event) => {
        event.preventDefault()
        setError('')
        setToast(null)
        setLoading(true)

        try {
            const userCredential = await signInWithEmailAndPassword(
                auth,
                email.trim(),
                password
            )

            const user = userCredential.user

            // 1. Check whether this account is an admin.
            const adminRef = doc(db, 'admins', user.uid)
            const adminSnapshot = await getDoc(adminRef)

            let profile
            let destination

            if (adminSnapshot.exists()) {
                // Admins do not need a document in the users collection.
                profile = { role: 'admin' }
                destination = '/admin-dashboard'
            } else {
                // 2. If not an admin, check the regular user profile.
                const userRef = doc(db, 'users', user.uid)
                const userSnapshot = await getDoc(userRef)

                if (!userSnapshot.exists()) {
                    // Create a patient profile for a new regular account.
                    profile = {
                        fullName:
                            user.displayName || user.email.split('@')[0],
                        email: user.email,
                        role: 'patient',
                        createdAt: new Date().toISOString(),
                        verificationStatus: 'not_required',
                    }

                    await setDoc(userRef, profile)
                } else {
                    profile = userSnapshot.data()
                }

                // 3. Direct the user according to their role.
                if (profile.role === 'doctor') {
                    destination =
                        profile.verificationStatus === 'approved'
                            ? '/doctor-dashboard'
                            : profile.verificationSubmittedAt
                                ? '/verification-pending'
                                : '/professional-verification'
                } else if (profile.role === 'patient') {
                    destination = '/patient-dashboard'
                } else {
                    throw new Error('This account has an invalid user role.')
                }
            }

            setToast({
                type: 'success',
                message: 'Login successful! Welcome back.',
            })

            setTimeout(() => navigate(destination), 1200)
        } catch (error) {
            console.error('Login error:', error)

            if (
                error.code === 'auth/invalid-credential' ||
                error.code === 'auth/wrong-password' ||
                error.code === 'auth/user-not-found'
            ) {
                setError(
                    'Incorrect email or password. Please check your details.'
                )
            } else if (error.code === 'auth/invalid-email') {
                setError('Please enter a valid email address.')
            } else if (error.code === 'auth/too-many-requests') {
                setError(
                    'Too many attempts. Please wait a while before trying again.'
                )
            } else if (error.code === 'auth/network-request-failed') {
                setError('Connection failed. Check your internet and try again.')
            } else if (error.code === 'permission-denied' ||
                error.code === 'firestore/permission-denied') {
                setError(
                    'Access was denied by Firestore. Please check the database permissions.'
                )
            } else {
                setError('Unable to sign in. Please try again.')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="min-h-screen overflow-hidden bg-[#FAF8F2] text-[#164744]">
            {/* Notification */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        role="status"
                        aria-live="polite"
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 30 }}
                        className={`fixed right-4 top-4 z-[60] flex max-w-sm items-center gap-3 rounded-2xl px-5 py-4 text-sm text-white shadow-xl sm:right-6 sm:top-6 ${toast.type === 'success'
                            ? 'bg-emerald-800'
                            : 'bg-red-700'
                            }`}
                    >
                        <CheckCircle2 size={21} />
                        <p>{toast.message}</p>
                        <button
                            type="button"
                            aria-label="Dismiss notification"
                            onClick={() => setToast(null)}
                            className="ml-2"
                        >
                            <X size={17} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Navigation */}
            <header className="relative z-10 border-b border-[#164744]/10 bg-[#FAF8F2]/90 backdrop-blur-lg">
                <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
                    <Link
                        to="/"
                        className="text-2xl font-bold tracking-tight sm:text-3xl"
                    >
                        Prega<span className="text-[#C58A3C]">Link</span>
                    </Link>

                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-sm font-semibold transition hover:text-[#C58A3C]"
                    >
                        <ArrowRight className="rotate-180" size={17} />
                        Back to home
                    </Link>
                </nav>
            </header>

            {/* Login content */}
            <section className="relative mx-auto grid min-h-[calc(100vh-73px)] max-w-7xl items-center gap-10 px-5 py-10 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:py-14">
                <div className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-[#E6EBDD]/70 blur-3xl" />
                <div className="pointer-events-none absolute bottom-10 right-0 h-64 w-64 rounded-full bg-[#F0DEC7]/50 blur-3xl" />

                {/* Left visual panel */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.65 }}
                    className="relative z-10 hidden lg:block"
                >
                    <div className="inline-flex items-center gap-2 rounded-full bg-[#E2ECE1] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#164744]">
                        <Heart size={15} />
                        Care for every journey
                    </div>

                    <h1 className="mt-7 max-w-xl text-5xl font-bold leading-[1.15] tracking-tight xl:text-6xl">
                        Welcome back to your{' '}
                        <span className="text-[#C58A3C]">care journey.</span>
                    </h1>

                    <p className="mt-5 max-w-lg text-base leading-8 text-[#627674]">
                        Connect with maternal healthcare professionals, manage
                        your care, and keep your pregnancy journey organised.
                    </p>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative mt-8 max-w-lg"
                    >
                        <div className="absolute inset-3 rounded-[35px] bg-[#E2E9D7] rotate-[-3deg]" />

                        <div className="relative overflow-hidden rounded-[35px] border-4 border-white shadow-xl shadow-[#164744]/10">
                            <img
                                src="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=1000&q=85"
                                alt="Woman smiling in a warm, welcoming portrait"
                                className="h-[330px] w-full object-cover object-center"
                            />

                            <div className="absolute inset-0 bg-gradient-to-t from-[#164744]/70 via-transparent to-transparent" />

                            <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-3 text-white">
                                <div>
                                    <p className="text-lg font-bold">
                                        Your wellbeing matters
                                    </p>
                                    <p className="mt-1 text-sm text-white/80">
                                        Thoughtful care, every step of the way.
                                    </p>
                                </div>
                                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
                                    <Heart size={25} />
                                </span>
                            </div>
                        </div>

                        <motion.div
                            animate={{ y: [0, -7, 0] }}
                            transition={{ duration: 3.5, repeat: Infinity }}
                            className="absolute -right-4 top-8 flex items-center gap-3 rounded-2xl bg-white p-3 shadow-lg sm:-right-6 sm:p-4"
                        >
                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E2ECE1]">
                                <Baby size={22} />
                            </span>
                            <div>
                                <p className="text-sm font-bold">Every stage</p>
                                <p className="mt-1 text-xs text-[#627674]">
                                    Matters to us
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>

                    <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-[#536D6B]">
                        <span className="flex items-center gap-2">
                            <ShieldCheck size={18} className="text-[#56836D]" />
                            Your account
                        </span>
                        <span className="flex items-center gap-2">
                            <Stethoscope size={18} className="text-[#56836D]" />
                            Your care
                        </span>
                    </div>
                </motion.div>

                {/* Login form */}
                <motion.div
                    initial={{ opacity: 0, y: 22 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="relative z-10 mx-auto w-full max-w-md"
                >
                    <div className="mb-7 text-center lg:hidden">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E2ECE1]">
                            <Heart size={27} />
                        </div>
                        <h1 className="mt-4 text-3xl font-bold">
                            Welcome back
                        </h1>
                        <p className="mt-2 text-sm text-[#627674]">
                            Continue your maternal care journey.
                        </p>
                    </div>

                    <div className="rounded-[30px] border border-[#E7E2D8] bg-white p-6 shadow-xl shadow-[#164744]/5 sm:p-9">
                        <div className="hidden lg:block">
                            <span className="inline-flex items-center gap-2 rounded-full bg-[#F5EADB] px-3 py-1.5 text-xs font-semibold text-[#8A642F]">
                                <Heart size={14} />
                                Welcome back
                            </span>
                            <h2 className="mt-4 text-3xl font-bold tracking-tight">
                                Sign in to PregaLink
                            </h2>
                            <p className="mt-3 text-sm leading-6 text-[#627674]">
                                Enter your account details to continue.
                            </p>
                        </div>

                        <form
                            className="space-y-5 lg:mt-7"
                            onSubmit={handleLogin}
                        >
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        role="alert"
                                        initial={{ opacity: 0, height: 0, y: -5 }}
                                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="flex items-start gap-2 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm leading-6 text-red-700">
                                            <X size={18} className="mt-0.5 shrink-0" />
                                            {error}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div>
                                <label
                                    htmlFor="email"
                                    className="mb-2 block text-sm font-semibold"
                                >
                                    Email address
                                </label>

                                <div className="flex items-center gap-3 rounded-2xl border border-[#D8DDD5] bg-[#FAF9F5] px-4 transition focus-within:border-[#164744] focus-within:ring-4 focus-within:ring-[#164744]/10">
                                    <Mail size={19} className="shrink-0 text-[#81918A]" />
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(event) => setEmail(event.target.value)}
                                        placeholder="you@example.com"
                                        autoComplete="email"
                                        required
                                        className="w-full min-w-0 bg-transparent py-3.5 text-sm outline-none placeholder:text-[#A1AAA4]"
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="mb-2 flex items-center justify-between gap-3">
                                    <label
                                        htmlFor="password"
                                        className="block text-sm font-semibold"
                                    >
                                        Password
                                    </label>
                                </div>

                                <div className="flex items-center gap-3 rounded-2xl border border-[#D8DDD5] bg-[#FAF9F5] px-4 transition focus-within:border-[#164744] focus-within:ring-4 focus-within:ring-[#164744]/10">
                                    <LockKeyhole size={19} className="shrink-0 text-[#81918A]" />
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(event) => setPassword(event.target.value)}
                                        placeholder="Enter your password"
                                        autoComplete="current-password"
                                        required
                                        className="w-full min-w-0 bg-transparent py-3.5 text-sm outline-none placeholder:text-[#A1AAA4]"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((current) => !current)}
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                        className="shrink-0 rounded-lg p-1.5 text-[#627674] transition hover:bg-[#E9EEE8] hover:text-[#164744]"
                                    >
                                        {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                                    </button>
                                </div>
                            </div>

                            <motion.button
                                type="submit"
                                disabled={loading}
                                whileHover={loading ? undefined : { scale: 1.01 }}
                                whileTap={loading ? undefined : { scale: 0.98 }}
                                className="flex w-full items-center justify-center gap-3 rounded-full bg-[#164744] px-5 py-4 text-sm font-bold text-white shadow-md shadow-[#164744]/15 transition hover:bg-[#205B56] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading ? (
                                    <>
                                        <LoaderCircle size={19} className="animate-spin" />
                                        Signing in...
                                    </>
                                ) : (
                                    <>
                                        Sign in to your account
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </motion.button>
                        </form>

                        <div className="my-6 flex items-center gap-3">
                            <div className="h-px flex-1 bg-[#E9E7DF]" />
                            <span className="text-xs text-[#89958F]">
                                NEW TO PREGALINK?
                            </span>
                            <div className="h-px flex-1 bg-[#E9E7DF]" />
                        </div>

                        <Link
                            to="/register"
                            className="flex w-full items-center justify-center gap-2 rounded-full border border-[#164744]/20 px-5 py-3.5 text-sm font-semibold text-[#164744] transition hover:border-[#164744] hover:bg-[#F0F5F0]"
                        >
                            Create an account
                            <ArrowRight size={17} />
                        </Link>

                        <div className="mt-6 flex items-start justify-center gap-2 text-center text-xs leading-5 text-[#7A8982]">
                            <ShieldCheck size={16} className="mt-0.5 shrink-0" />
                            Sign in securely to access your account.
                        </div>
                    </div>

                    <p className="mt-6 text-center text-xs text-[#81918A]">
                        Your health journey deserves thoughtful care.
                    </p>
                </motion.div>
            </section>
        </main>
    )
}

export default Login
