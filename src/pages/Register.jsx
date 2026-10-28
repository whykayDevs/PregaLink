
import { useEffect, useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import {
    Activity,
    ArrowRight,
    CheckCircle2,
    Eye,
    EyeOff,
    Heart,
    LockKeyhole,
    Mail,
    ShieldCheck,
    Stethoscope,
    UserRound,
    UserPlus,
    X,
} from 'lucide-react'
import { createUserWithEmailAndPassword, auth } from '../auth'
import { db } from '../firebase'
import { doc, setDoc } from 'firebase/firestore'

function Register() {
    const [searchParams] = useSearchParams()
    const initialRole =
        searchParams.get('role') === 'doctor' ? 'doctor' : 'patient'

    const [role, setRole] = useState(initialRole)
    const navigate = useNavigate()
    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [toast, setToast] = useState(null)

    useEffect(() => {
        if (!toast) return

        const timer = setTimeout(() => {
            setToast(null)
        }, 4000)

        return () => clearTimeout(timer)
    }, [toast])


    const handleRegister = async (event) => {
        event.preventDefault();
        setError("");
        setToast(null);
        setLoading(true);

        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                email.trim(),
                password
            );

            const user = userCredential.user;

            await setDoc(doc(db, "users", user.uid), {
                fullName: fullName.trim(),
                email: user.email,
                role: role,
                verificationStatus:
                    role === "doctor" ? "pending" : "not_required",
                createdAt: new Date().toISOString(),
            });

            console.log("Account and profile created:", user.uid);

            setToast({
                type: "success",
                message:
                    role === "doctor"
                        ? "Account created! Your doctor profile is pending verification."
                        : "Account created successfully! You can now log in.",
            });

            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (error) {
            console.error("Registration error:", error);

            if (error.code === "auth/email-already-in-use") {
                setToast({
                    type: "error",
                    message:
                        "You already have an account. Please try logging in.",
                });
            } else if (error.code === "auth/weak-password") {
                setError(
                    "Your password is too weak. Please use a stronger password."
                );
            } else if (error.code === "auth/invalid-email") {
                setError("Please enter a valid email address.");
            } else if (error.code === "auth/network-request-failed") {
                setError("Connection failed. Check your internet and try again.");
            } else {
                setError("Registration failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };


    return (
        <main className="min-h-screen bg-[#FCFAF7] text-[#183D3A]">
            {/* Notifications */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, x: 25, y: -10 }}
                        animate={{ opacity: 1, x: 0, y: 0 }}
                        exit={{ opacity: 0, x: 25 }}
                        role="status"
                        aria-live="polite"
                        className={`fixed right-4 top-4 z-50 flex max-w-sm items-start gap-3 rounded-2xl px-5 py-4 text-sm shadow-xl sm:right-6 sm:top-6 ${toast.type === 'success'
                            ? 'bg-[#183D3A] text-white'
                            : 'bg-red-700 text-white'
                            }`}
                    >
                        {toast.type === 'success' ? (
                            <CheckCircle2 size={20} className="shrink-0" />
                        ) : (
                            <X size={20} className="shrink-0" />
                        )}
                        <p>{toast.message}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <header className="border-b border-[#E8E7DF] bg-white">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
                    <Link
                        to="/"
                        className="text-2xl font-bold tracking-tight"
                    >
                        Prega<span className="text-[#B68B50]">Link</span>
                    </Link>

                    <Link
                        to="/login"
                        className="text-sm font-semibold transition hover:text-[#B68B50]"
                    >
                        Already registered?{' '}
                        <span className="underline underline-offset-4">
                            Sign in
                        </span>
                    </Link>
                </div>
            </header>

            <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-10 sm:px-8 lg:min-h-[calc(100vh-81px)] lg:grid-cols-2 lg:gap-16 lg:py-14">
                {/* Left panel */}
                <motion.section
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="hidden lg:block"
                >
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#E8E7DF] bg-white px-4 py-2 text-xs font-semibold tracking-wide text-[#657572]">
                        <Heart size={15} className="text-[#B68B50]" />
                        THOUGHTFUL CARE STARTS HERE
                    </div>

                    <h1 className="mt-7 max-w-xl text-5xl font-semibold leading-[1.15] tracking-tight xl:text-6xl">
                        Your journey deserves{' '}
                        <span className="text-[#B68B50]">connected care.</span>
                    </h1>

                    <p className="mt-6 max-w-lg text-base leading-8 text-[#657572]">
                        Create your PregaLink account to connect with
                        healthcare professionals and make your pregnancy-care
                        journey more organised.
                    </p>

                    <div className="mt-10 space-y-5">
                        <div className="flex items-start gap-4">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#EAF1E9] text-[#183D3A]">
                                <Stethoscope size={21} />
                            </div>
                            <div>
                                <h3 className="font-semibold">
                                    Connect with healthcare professionals
                                </h3>
                                <p className="mt-1 text-sm leading-6 text-[#657572]">
                                    Explore doctors and discover your care options.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F7EFE2] text-[#9B733B]">
                                <CalendarDaysIcon />
                            </div>
                            <div>
                                <h3 className="font-semibold">
                                    Keep your care journey organised
                                </h3>
                                <p className="mt-1 text-sm leading-6 text-[#657572]">
                                    Work towards a more connected care experience.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#EEF0F8] text-[#535F91]">
                                <ShieldCheck size={21} />
                            </div>
                            <div>
                                <h3 className="font-semibold">
                                    A dedicated account for your role
                                </h3>
                                <p className="mt-1 text-sm leading-6 text-[#657572]">
                                    Register as a patient or healthcare professional.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="relative mt-10 overflow-hidden rounded-3xl bg-[#183D3A] p-7 text-white">
                        <div className="absolute -right-10 -top-16 h-40 w-40 rounded-full border border-white/10" />
                        <div className="relative flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-[#D5B27C]">
                                <Heart size={25} />
                            </div>
                            <div>
                                <p className="font-semibold">
                                    Care that keeps you connected
                                </p>
                                <p className="mt-1 text-sm text-white/70">
                                    Welcome to PregaLink.
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.section>

                {/* Registration form */}
                <motion.section
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="mx-auto w-full max-w-xl"
                >
                    <div className="mb-7 text-center lg:hidden">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF1E9] text-[#183D3A]">
                            <Heart size={27} />
                        </div>
                        <p className="mt-4 text-sm text-[#657572]">
                            Start your connected care journey
                        </p>
                    </div>

                    <div className="rounded-[28px] border border-[#E8E7DF] bg-white p-6 shadow-sm sm:p-9">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF1E9] text-[#183D3A]">
                            <UserPlus size={23} />
                        </div>

                        <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
                            Create your account
                        </h2>
                        <p className="mt-3 text-sm leading-6 text-[#657572]">
                            Enter your details below to join the PregaLink community.
                        </p>

                        <form
                            className="mt-7 space-y-5"
                            onSubmit={handleRegister}
                        >
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    role="alert"
                                    className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 p-4 text-sm leading-6 text-red-700"
                                >
                                    <X size={18} className="mt-0.5 shrink-0" />
                                    <p>{error}</p>
                                </motion.div>
                            )}

                            {/* Role selector */}
                            <div>
                                <label className="mb-3 block text-sm font-semibold">
                                    I want to register as
                                </label>

                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        aria-pressed={role === 'patient'}
                                        onClick={() => setRole('patient')}
                                        className={`rounded-2xl border p-4 text-left transition duration-200 ${role === 'patient'
                                            ? 'border-[#183D3A] bg-[#EAF1E9] ring-1 ring-[#183D3A]'
                                            : 'border-[#E8E7DF] hover:border-[#AABBB0]'
                                            }`}
                                    >
                                        <UserRound
                                            size={22}
                                            className={
                                                role === 'patient'
                                                    ? 'text-[#183D3A]'
                                                    : 'text-[#82908A]'
                                            }
                                        />
                                        <span className="mt-3 block font-semibold">
                                            Patient
                                        </span>
                                        <span className="mt-1 block text-xs leading-5 text-[#657572]">
                                            I'm seeking care
                                        </span>
                                    </button>

                                    <button
                                        type="button"
                                        aria-pressed={role === 'doctor'}
                                        onClick={() => setRole('doctor')}
                                        className={`rounded-2xl border p-4 text-left transition duration-200 ${role === 'doctor'
                                            ? 'border-[#183D3A] bg-[#EAF1E9] ring-1 ring-[#183D3A]'
                                            : 'border-[#E8E7DF] hover:border-[#AABBB0]'
                                            }`}
                                    >
                                        <Stethoscope
                                            size={22}
                                            className={
                                                role === 'doctor'
                                                    ? 'text-[#183D3A]'
                                                    : 'text-[#82908A]'
                                            }
                                        />
                                        <span className="mt-3 block font-semibold">
                                            Doctor
                                        </span>
                                        <span className="mt-1 block text-xs leading-5 text-[#657572]">
                                            I'm a healthcare professional
                                        </span>
                                    </button>
                                </div>
                            </div>

                            {/* Full name */}
                            <div>
                                <label
                                    htmlFor="fullName"
                                    className="mb-2 block text-sm font-semibold"
                                >
                                    Full name
                                </label>
                                <div className="relative">
                                    <UserRound
                                        size={18}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#82908A]"
                                    />
                                    <input
                                        id="fullName"
                                        type="text"
                                        autoComplete="name"
                                        placeholder="Enter your full name"
                                        value={fullName}
                                        onChange={(event) =>
                                            setFullName(event.target.value)
                                        }
                                        required
                                        className="w-full rounded-xl border border-[#D8DDD5] bg-[#FCFAF7] py-3.5 pl-11 pr-4 text-sm outline-none transition placeholder:text-[#9AA49F] focus:border-[#B68B50] focus:ring-2 focus:ring-[#B68B50]/15"
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label
                                    htmlFor="registerEmail"
                                    className="mb-2 block text-sm font-semibold"
                                >
                                    Email address
                                </label>
                                <div className="relative">
                                    <Mail
                                        size={18}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#82908A]"
                                    />
                                    <input
                                        id="registerEmail"
                                        type="email"
                                        autoComplete="email"
                                        placeholder="you@example.com"
                                        required
                                        value={email}
                                        onChange={(event) =>
                                            setEmail(event.target.value)
                                        }
                                        className="w-full rounded-xl border border-[#D8DDD5] bg-[#FCFAF7] py-3.5 pl-11 pr-4 text-sm outline-none transition placeholder:text-[#9AA49F] focus:border-[#B68B50] focus:ring-2 focus:ring-[#B68B50]/15"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label
                                    htmlFor="registerPassword"
                                    className="mb-2 block text-sm font-semibold"
                                >
                                    Password
                                </label>
                                <div className="relative">
                                    <LockKeyhole
                                        size={18}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#82908A]"
                                    />
                                    <input
                                        id="registerPassword"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="new-password"
                                        minLength={8}
                                        placeholder="At least 8 characters"
                                        value={password}
                                        onChange={(event) =>
                                            setPassword(event.target.value)
                                        }
                                        required
                                        className="w-full rounded-xl border border-[#D8DDD5] bg-[#FCFAF7] py-3.5 pl-11 pr-12 text-sm outline-none transition placeholder:text-[#9AA49F] focus:border-[#B68B50] focus:ring-2 focus:ring-[#B68B50]/15"
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        aria-label={
                                            showPassword
                                                ? 'Hide password'
                                                : 'Show password'
                                        }
                                        className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-[#657572] transition hover:bg-[#EAF1E9]"
                                    >
                                        {showPassword ? (
                                            <EyeOff size={18} />
                                        ) : (
                                            <Eye size={18} />
                                        )}
                                    </button>
                                </div>
                                <p className="mt-2 text-xs text-[#82908A]">
                                    Use at least 8 characters.
                                </p>
                            </div>

                            {/* Doctor verification notice */}
                            <AnimatePresence mode="wait">
                                {role === 'doctor' && (
                                    <motion.div
                                        key="doctor-notice"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="flex items-start gap-3 rounded-2xl border border-[#E8E7DF] bg-[#FCFAF7] p-4">
                                            <ShieldCheck
                                                size={21}
                                                className="mt-0.5 shrink-0 text-[#B68B50]"
                                            />
                                            <div>
                                                <p className="text-sm font-semibold">
                                                    Healthcare professional verification
                                                </p>
                                                <p className="mt-1 text-xs leading-5 text-[#657572]">
                                                    Doctor accounts require
                                                    credential verification
                                                    before offering appointments.
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <button
                                type="submit"
                                disabled={loading}
                                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#183D3A] px-5 py-4 text-sm font-semibold text-white transition hover:bg-[#285650] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading ? (
                                    <>
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                                        Creating account...
                                    </>
                                ) : (
                                    <>
                                        Create {role} account
                                        <ArrowRight size={17} />
                                    </>
                                )}
                            </button>

                            <p className="text-center text-xs leading-5 text-[#82908A]">
                                By creating an account, you agree to use
                                PregaLink responsibly.
                            </p>
                        </form>

                        <div className="mt-7 border-t border-[#E8E7DF] pt-6 text-center text-sm text-[#657572]">
                            Already have an account?{' '}
                            <Link
                                to="/login"
                                className="font-semibold text-[#183D3A] underline underline-offset-4 transition hover:text-[#B68B50]"
                            >
                                Sign in
                            </Link>
                        </div>
                    </div>

                    <p className="mt-6 flex items-center justify-center gap-2 text-xs text-[#82908A]">
                        <ShieldCheck size={15} />
                        Your account is protected by Firebase Authentication.
                    </p>
                </motion.section>
            </div>

            <footer className="border-t border-[#E8E7DF] px-5 py-5 text-center text-xs text-[#82908A]">
                © {new Date().getFullYear()} PregaLink. Your care, connected.
            </footer>
        </main>
    )
}

function CalendarDaysIcon() {
    return <Activity size={21} />
}

export default Register
