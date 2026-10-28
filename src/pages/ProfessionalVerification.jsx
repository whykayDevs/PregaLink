
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
    ClipboardCheck,
    UserRound,
    Stethoscope,
    MapPin,
    GraduationCap,
    ShieldCheck,
    ArrowLeft,
    Send,
} from "lucide-react";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

const initialForm = {
    fullName: "",
    gender: "",
    professionalType: "doctor",
    phone: "",
    registrationNumber: "",
    qualification: "",
    institution: "",
    qualificationYear: "",
    specialization: "",
    experience: "",
    workplace: "",
    practiceLocation: "",
};

function ProfessionalVerification() {
    const navigate = useNavigate();
    const [form, setForm] = useState(initialForm);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadProfile = async () => {
            const currentUser = auth.currentUser;

            if (!currentUser) {
                navigate("/login");
                return;
            }

            try {
                const profileRef = doc(db, "users", currentUser.uid);
                const profileSnap = await getDoc(profileRef);

                if (profileSnap.exists()) {
                    const profile = profileSnap.data();

                    setForm((previous) => ({
                        ...previous,
                        fullName: profile.fullName || "",
                        professionalType: profile.professionalType || "doctor",
                    }));
                }
            } catch (error) {
                console.error("Unable to load professional profile:", error);
                setError("Unable to load your profile. Please refresh and try again.");
            }
        };

        loadProfile();
    }, [navigate]);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((previous) => ({ ...previous, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        const currentUser = auth.currentUser;

        if (!currentUser) {
            navigate("/login");
            return;
        }

        setLoading(true);

        try {
            const profileRef = doc(db, "users", currentUser.uid);

            await setDoc(
                profileRef,
                {
                    professionalType: form.professionalType,
                    gender: form.gender,
                    phone: form.phone.trim(),
                    registrationNumber: form.registrationNumber.trim(),
                    qualification: form.qualification.trim(),
                    institution: form.institution.trim(),
                    qualificationYear: Number(form.qualificationYear),
                    specialization: form.specialization.trim(),
                    experience: Number(form.experience),
                    workplace: form.workplace.trim(),
                    practiceLocation: form.practiceLocation.trim(),
                    verificationStatus: "pending",
                    verificationSubmittedAt: new Date().toISOString(),
                },
                { merge: true }
            );

            setSuccess(true);
        } catch (err) {
            console.error("Verification submission error:", err);
            setError(
                "We couldn't submit your application. Please check your connection and try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const fields = [
        {
            name: "phone",
            label: "Phone Number",
            placeholder: "e.g. 08012345678",
            type: "tel",
        },
        {
            name: "registrationNumber",
            label: "Professional Licence / Registration Number",
            placeholder: "Enter your official registration number",
            type: "text",
        },
        {
            name: "qualification",
            label: "Professional Qualification",
            placeholder: "e.g. MBBS or Registered Midwife qualification",
            type: "text",
        },
        {
            name: "institution",
            label: "Institution Attended",
            placeholder: "Enter the name of your university or training institution",
            type: "text",
        },
        {
            name: "qualificationYear",
            label: "Year of Qualification",
            placeholder: "e.g. 2022",
            type: "number",
        },
        {
            name: "specialization",
            label: "Specialization",
            placeholder: "e.g. Obstetrics and Gynaecology, Midwifery",
            type: "text",
        },
        {
            name: "experience",
            label: "Years of Professional Experience",
            placeholder: "e.g. 3",
            type: "number",
        },
        {
            name: "workplace",
            label: "Hospital or Clinic",
            placeholder: "Enter your current hospital or clinic, if applicable",
            type: "text",
        },
        {
            name: "practiceLocation",
            label: "Practice Location",
            placeholder: "e.g. Ibadan, Oyo State",
            type: "text",
        },
    ];

    if (success) {
        return (
            <div className="min-h-screen bg-[#F8F7F2] flex items-center justify-center px-5 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-lg rounded-3xl bg-white p-8 text-center shadow-xl sm:p-10"
                >
                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-teal-50 text-teal-800">
                        <ShieldCheck size={34} />
                    </div>

                    <h1 className="mb-3 text-2xl font-bold text-gray-900">
                        Application submitted!
                    </h1>

                    <p className="mb-5 leading-7 text-gray-600">
                        Thank you for submitting your professional details.
                        Your application is pending review. Your credentials
                        must be checked with the relevant regulatory authority
                        before your account can be approved.
                    </p>

                    <div className="mb-6 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
                        Status: <strong>Pending verification</strong>
                    </div>

                    <button
                        onClick={() => navigate("/")}
                        className="w-full rounded-xl bg-teal-800 px-5 py-3 font-semibold text-white hover:bg-teal-900"
                    >
                        Return to Home
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8F7F2] px-5 py-10 sm:py-14">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-auto max-w-3xl"
            >
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="mb-6 flex items-center gap-2 text-sm font-medium text-teal-800 hover:text-teal-950"
                >
                    <ArrowLeft size={18} />
                    Go back
                </button>

                <div className="mb-8">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-800 text-white shadow-lg">
                        <ClipboardCheck size={28} />
                    </div>

                    <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-teal-700">
                        PregaLink Professional Verification
                    </p>

                    <h1 className="mb-3 text-3xl font-bold text-gray-900 sm:text-4xl">
                        Tell us about your practice
                    </h1>

                    <p className="max-w-2xl leading-7 text-gray-600">
                        Complete this form so our admin team can review your
                        professional details. Doctors and midwives use the
                        same form, with the professional category determining
                        the appropriate verification channel.
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-7 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-9"
                >
                    <section>
                        <div className="mb-5 flex items-center gap-3">
                            <UserRound className="text-teal-800" size={22} />
                            <h2 className="text-lg font-bold text-gray-900">
                                Professional Information
                            </h2>
                        </div>

                        <div className="space-y-2">
                            <label
                                htmlFor="fullName"
                                className="text-sm font-semibold text-gray-700"
                            >
                                Full Name
                            </label>
                            <input
                                id="fullName"
                                value={form.fullName}
                                readOnly
                                placeholder="Your registered account name"
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-500"
                            />
                            <p className="text-xs text-gray-500">
                                This name comes from your PregaLink account.
                            </p>
                        </div>

                        <div className="mt-5 space-y-2">
                            <label
                                htmlFor="professionalType"
                                className="text-sm font-semibold text-gray-700"
                            >
                                Professional Category
                            </label>
                            <select
                                id="professionalType"
                                name="professionalType"
                                value={form.professionalType}
                                onChange={handleChange}
                                required
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3"
                            >
                                <option value="doctor">Medical Doctor</option>
                                <option value="midwife">Midwife</option>
                            </select>
                        </div>

                        <div className="mt-5 space-y-2">
                            <label htmlFor="gender" className="text-sm font-semibold text-gray-700">
                                Gender
                            </label>

                            <select
                                id="gender"
                                name="gender"
                                value={form.gender}
                                onChange={handleChange}
                                required
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3"
                            >
                                <option value="">Select your gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </select>
                        </div>

                        <div className="mt-5 space-y-2">
                            <label
                                htmlFor="phone"
                                className="text-sm font-semibold text-gray-700"
                            >
                                Phone Number
                            </label>
                            <input
                                id="phone"
                                name="phone"
                                type="tel"
                                value={form.phone}
                                onChange={handleChange}
                                placeholder="e.g. 08012345678"
                                required
                                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
                            />
                        </div>
                    </section>

                    <section>
                        <div className="mb-5 flex items-center gap-3">
                            <GraduationCap className="text-teal-800" size={22} />
                            <h2 className="text-lg font-bold text-gray-900">
                                Qualifications and Registration
                            </h2>
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2">
                            {fields.slice(1, 5).map((field) => (
                                <div key={field.name} className="space-y-2">
                                    <label
                                        htmlFor={field.name}
                                        className="text-sm font-semibold text-gray-700"
                                    >
                                        {field.label}
                                    </label>
                                    <input
                                        id={field.name}
                                        name={field.name}
                                        type={field.type}
                                        value={form[field.name]}
                                        onChange={handleChange}
                                        placeholder={field.placeholder}
                                        min={field.name === "qualificationYear" ? 1950 : undefined}
                                        max={field.name === "qualificationYear" ? new Date().getFullYear() : undefined}
                                        required
                                        className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
                                    />
                                </div>
                            ))}
                        </div>
                    </section>

                    <section>
                        <div className="mb-5 flex items-center gap-3">
                            <Stethoscope className="text-teal-800" size={22} />
                            <h2 className="text-lg font-bold text-gray-900">
                                Practice Details
                            </h2>
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2">
                            {fields.slice(5, 7).map((field) => (
                                <div key={field.name} className="space-y-2">
                                    <label
                                        htmlFor={field.name}
                                        className="text-sm font-semibold text-gray-700"
                                    >
                                        {field.label}
                                    </label>
                                    <input
                                        id={field.name}
                                        name={field.name}
                                        type={field.type}
                                        value={form[field.name]}
                                        onChange={handleChange}
                                        placeholder={field.placeholder}
                                        min={field.name === "experience" ? 0 : undefined}
                                        max={field.name === "experience" ? 70 : undefined}
                                        required
                                        className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="mt-5 space-y-2">
                            <label
                                htmlFor="workplace"
                                className="text-sm font-semibold text-gray-700"
                            >
                                Hospital or Clinic
                            </label>
                            <input
                                id="workplace"
                                name="workplace"
                                value={form.workplace}
                                onChange={handleChange}
                                placeholder="Enter your current hospital or clinic, if applicable"
                                required
                                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
                            />
                        </div>

                        <div className="mt-5 space-y-2">
                            <label
                                htmlFor="practiceLocation"
                                className="text-sm font-semibold text-gray-700"
                            >
                                Practice Location
                            </label>
                            <div className="relative">
                                <MapPin
                                    size={18}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                                />
                                <input
                                    id="practiceLocation"
                                    name="practiceLocation"
                                    value={form.practiceLocation}
                                    onChange={handleChange}
                                    placeholder="e.g. Ibadan, Oyo State"
                                    required
                                    className="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
                                />
                            </div>
                        </div>
                    </section>

                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                        <div className="mb-2 flex items-center gap-2 font-bold">
                            <ShieldCheck size={19} />
                            Verification notice
                        </div>
                        Submitting this form does not automatically verify your
                        credentials. The relevant professional regulatory authority
                        must be consulted before approval. Please provide accurate
                        information.
                    </div>

                    {error && (
                        <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-800 px-5 py-4 font-semibold text-white transition hover:bg-teal-900 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <Send size={18} />
                        {loading ? "Submitting application..." : "Submit for Verification"}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}

export default ProfessionalVerification;
