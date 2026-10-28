
import { motion } from "motion/react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import {
    Clock,
    ShieldCheck,
    LogOut,
    Heart,
    FileCheck2,
    Stethoscope,
} from "lucide-react";

function VerificationPending() {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate("/login");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#F8F7F2] flex items-center justify-center px-5 py-12">
            {/* Decorative background circles */}
            <motion.div
                animate={{ y: [0, -18, 0], x: [0, 10, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-teal-100/60 blur-3xl"
            />

            <motion.div
                animate={{ y: [0, 15, 0], x: [0, -8, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-amber-100/60 blur-3xl"
            />

            <motion.main
                initial={{ opacity: 0, y: 30, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative z-10 w-full max-w-lg rounded-3xl border border-white bg-white/90 p-7 shadow-xl shadow-teal-900/5 backdrop-blur-sm sm:p-10"
            >
                {/* Brand */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mb-8 flex items-center justify-center gap-2"
                >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-800 text-white">
                        <Heart size={21} fill="currentColor" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-teal-900">
                        PregaLink
                    </span>
                </motion.div>

                {/* Animated verification icon */}
                <div className="relative mx-auto mb-7 flex h-28 w-28 items-center justify-center">
                    <motion.div
                        animate={{ scale: [1, 1.12, 1], opacity: [0.5, 0.2, 0.5] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-0 rounded-full bg-amber-100"
                    />

                    <motion.div
                        animate={{ rotate: [0, 8, -8, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="relative flex h-20 w-20 items-center justify-center rounded-full border border-amber-200 bg-amber-50 text-amber-600"
                    >
                        <Clock size={38} strokeWidth={1.7} />
                    </motion.div>

                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                        className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full border-4 border-white bg-teal-700 text-white"
                    >
                        <ShieldCheck size={17} />
                    </motion.div>
                </div>

                {/* Heading */}
                <div className="mb-7 text-center">
                    <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-teal-700">
                        Doctor verification
                    </p>

                    <h1 className="mb-3 text-2xl font-bold leading-tight text-gray-900 sm:text-3xl">
                        Your profile is under review
                    </h1>

                    <p className="mx-auto max-w-sm text-sm leading-7 text-gray-600 sm:text-base">
                        Welcome to PregaLink! Our admin team is reviewing your
                        professional details before granting access to your
                        doctor dashboard.
                    </p>
                </div>

                {/* Status card */}
                <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-amber-600 shadow-sm">
                            <FileCheck2 size={23} />
                        </div>

                        <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900">
                                Verification status
                            </p>
                            <p className="mt-1 text-sm text-amber-700">
                                Pending review
                            </p>
                        </div>

                        <motion.span
                            animate={{ opacity: [1, 0.4, 1] }}
                            transition={{ duration: 1.8, repeat: Infinity }}
                            className="h-3 w-3 rounded-full bg-amber-500"
                        />
                    </div>
                </div>

                {/* Helpful note */}
                <div className="mb-7 flex gap-3 rounded-xl bg-teal-50 p-4">
                    <Stethoscope
                        size={20}
                        className="mt-0.5 shrink-0 text-teal-800"
                    />
                    <p className="text-sm leading-6 text-teal-900">
                        You can log in again later to check your access. Your
                        dashboard will become available once your profile has
                        been approved.
                    </p>
                </div>

                {/* Logout button */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleLogout}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-800 px-5 py-3.5 font-semibold text-white shadow-lg shadow-teal-900/10 transition-colors hover:bg-teal-900"
                >
                    <LogOut size={18} />
                    Log out
                </motion.button>

                <p className="mt-6 text-center text-xs text-gray-400">
                    Secure care starts with trusted professionals.
                </p>
            </motion.main>
        </div>
    );
}

export default VerificationPending;
