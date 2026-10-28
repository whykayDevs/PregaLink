
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
    collection, doc, getDoc, getDocs, query, where,
    runTransaction, serverTimestamp
} from 'firebase/firestore'
import { db, auth } from '../firebase'
import { getAppointmentEndTime } from '../utils/appointmentHelpers'
import { ArrowLeft, CalendarDays } from 'lucide-react'

const visitOptions = [
    'Antenatal check-up',
    'Follow-up visit',
    'Pregnancy concern',
    'General consultation',
]

export default function BookAppointment() {
    const { doctorId } = useParams()
    const [doctor, setDoctor] = useState(null)
    const [availability, setAvailability] = useState(null)
    const [appointmentDate, setAppointmentDate] = useState('')
    const [appointmentType, setAppointmentType] = useState('physical')
    const [selectedTime, setSelectedTime] = useState('')
    const [visitTitle, setVisitTitle] = useState(visitOptions[0])
    const [reason, setReason] = useState('')
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const now = new Date()
    const todayString = [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, '0'),
        String(now.getDate()).padStart(2, '0'),
    ].join('-')

    useEffect(() => {
        async function loadDoctor() {
            try {
                const doctorSnap = await getDoc(doc(db, 'publicDoctors', doctorId))
                if (!doctorSnap.exists()) {
                    setError('This doctor could not be found.')
                    return
                }

                const data = doctorSnap.data()
                const availabilitySnap = await getDoc(
                    doc(db, 'doctorAvailability', doctorId)
                )
                const availabilityData = availabilitySnap.exists()
                    ? availabilitySnap.data()
                    : {}

                if (data.verificationStatus !== 'approved') {
                    setError('This doctor is not currently available for booking.')
                    return
                }

                setAvailability(availabilityData)
                setDoctor({
                    name: data.fullName || 'Healthcare professional',
                    specialty: data.specialization || data.professionalType ||
                        'Maternal healthcare professional',
                    fee: availabilityData.consultationFee ??
                        data.consultationFee ?? null,
                })
            } catch (err) {
                console.error(err)
                setError('Unable to load this doctor. Please try again.')
            } finally {
                setLoading(false)
            }
        }

        if (doctorId) loadDoctor()
        else {
            setError('No doctor was selected.')
            setLoading(false)
        }
    }, [doctorId])

    const selectedDay = appointmentDate
        ? new Date(`${appointmentDate}T12:00:00`).toLocaleDateString(
            'en-US', { weekday: 'long' }
        )
        : ''

    const slots = []
    if (
        availability?.startTime &&
        availability?.endTime &&
        availability.workingDays?.includes(selectedDay)
    ) {
        const [sh, sm] = availability.startTime.split(':').map(Number)
        const [eh, em] = availability.endTime.split(':').map(Number)
        const start = sh * 60 + sm
        const end = eh * 60 + em
        const current = new Date()
        const currentMinutes = current.getHours() * 60 + current.getMinutes()

        for (let time = start; time + 30 <= end; time += 30) {
            if (appointmentDate === todayString && time <= currentMinutes) continue
            const startTime =
                `${String(Math.floor(time / 60)).padStart(2, '0')}:${String(time % 60).padStart(2, '0')}`
            slots.push({
                startTime,
                endTime: getAppointmentEndTime(startTime),
            })
        }
    }

    async function handleBooking() {
        setError('')
        setSuccess('')

        const user = auth.currentUser
        if (!user) {
            setError('Please sign in before booking an appointment.')
            return
        }
        if (!appointmentDate || !selectedTime) {
            setError('Please select an appointment date and time.')
            return
        }

        setSubmitting(true)
        try {
            const patientSnap = await getDoc(doc(db, 'users', user.uid))
            if (!patientSnap.exists() || patientSnap.data().role !== 'patient') {
                throw new Error('Please sign in with a patient account to book.')
            }

            const endTime = getAppointmentEndTime(selectedTime)
            const appointmentRef = doc(collection(db, 'appointments'))

            await runTransaction(db, async (transaction) => {
                const availabilityRef = doc(db, 'doctorAvailability', doctorId)
                const doctorRef = doc(db, 'publicDoctors', doctorId)
                const [availabilitySnap, doctorSnap] = await Promise.all([
                    transaction.get(availabilityRef),
                    transaction.get(doctorRef),
                ])

                if (!availabilitySnap.exists() ||
                    !doctorSnap.exists() ||
                    doctorSnap.data().verificationStatus !== 'approved') {
                    throw new Error('Doctor availability could not be verified.')
                }

                const confirmedQuery = query(
                    collection(db, 'appointments'),
                    where('doctorId', '==', doctorId),
                    where('appointmentDate', '==', appointmentDate),
                    where('status', '==', 'confirmed')
                )
                const booked = await getDocs(confirmedQuery)

                const startMinutes = (time) => {
                    const [h, m] = time.split(':').map(Number)
                    return h * 60 + m
                }

                for (const bookingDoc of booked.docs) {
                    const booking = bookingDoc.data()
                    if (
                        startMinutes(selectedTime) < startMinutes(booking.endTime) &&
                        startMinutes(endTime) > startMinutes(booking.startTime)
                    ) {
                        throw new Error('This time has already been booked. Please choose another.')
                    }
                }

                const currentAvailability = availabilitySnap.data()
                if (
                    !currentAvailability.workingDays?.includes(selectedDay) ||
                    startMinutes(selectedTime) < startMinutes(currentAvailability.startTime) ||
                    startMinutes(endTime) > startMinutes(currentAvailability.endTime)
                ) {
                    throw new Error('The doctor is not available at this time.')
                }

                transaction.set(appointmentRef, {
                    patientId: user.uid,
                    patientName: patientSnap.data().fullName || 'Patient',
                    doctorId,
                    doctorName: doctorSnap.data().fullName || 'Healthcare professional',
                    appointmentDate,
                    startTime: selectedTime,
                    endTime,
                    appointmentType,
                    visitTitle,
                    reason: reason.trim(),
                    fee: Number(currentAvailability.consultationFee || 0),
                    status: 'confirmed',
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                })
            })

            setSuccess(`Appointment booked! Reference: ${appointmentRef.id}`)
            setSelectedTime('')
            setReason('')
        } catch (err) {
            console.error('Booking error:', err)
            setError(err.message || 'Booking failed. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <main className="min-h-screen bg-[#F7F6F0] px-4 py-10">
            <div className="mx-auto max-w-2xl">
                <Link to="/doctors" className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-[#164744] hover:underline">
                    <ArrowLeft size={18} /> Back to doctors
                </Link>

                <div className="rounded-3xl border border-[#E8E7DF] bg-white p-6 shadow-sm sm:p-8">
                    <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#DCEBE0] text-[#164744]">
                        <CalendarDays size={24} />
                    </div>
                    <h1 className="text-2xl font-bold text-[#164744]">Book an appointment</h1>
                    <p className="mt-2 text-sm text-gray-600">Choose a suitable date and time for your consultation.</p>

                    {loading ? <p className="mt-6 text-sm text-gray-600">Loading doctor details...</p> :
                        error && !doctor ? <p className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p> :
                            doctor && <>
                                <div className="mt-6 rounded-2xl bg-[#F7F6F0] p-5">
                                    <h2 className="text-lg font-semibold text-[#164744]">{doctor.name}</h2>
                                    <p className="mt-1 text-sm text-gray-600">{doctor.specialty}</p>
                                    <p className="mt-4 text-sm font-medium text-[#164744]">
                                        Consultation fee: {doctor.fee !== null ? `₦${Number(doctor.fee).toLocaleString('en-NG')}` : 'Not provided'}
                                    </p>
                                </div>

                                <div className="mt-8 space-y-6">
                                    <div>
                                        <label htmlFor="appointmentDate" className="mb-2 block text-sm font-medium text-[#34483A]">Appointment date</label>
                                        <input id="appointmentDate" type="date" min={todayString} value={appointmentDate}
                                            onChange={(e) => { setAppointmentDate(e.target.value); setSelectedTime(''); setError(''); setSuccess('') }}
                                            className="w-full rounded-xl border border-[#E8E7DF] px-4 py-3 outline-none focus:border-[#477A57]" />
                                    </div>

                                    <div>
                                        <p className="mb-3 text-sm font-medium text-[#34483A]">Appointment type</p>
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                            {[['physical', 'Physical consultation'], ['online', 'Online consultation']].map(([value, label]) =>
                                                <label key={value} className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#E8E7DF] p-4">
                                                    <input type="radio" name="appointmentType" value={value} checked={appointmentType === value} onChange={(e) => setAppointmentType(e.target.value)} />
                                                    <span className="text-sm text-gray-700">{label}</span>
                                                </label>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="visitTitle" className="mb-2 block text-sm font-medium text-[#34483A]">Reason for visit</label>
                                        <select id="visitTitle" value={visitTitle} onChange={(e) => setVisitTitle(e.target.value)} className="w-full rounded-xl border border-[#E8E7DF] bg-white px-4 py-3">
                                            {visitOptions.map((option) => <option key={option}>{option}</option>)}
                                        </select>
                                    </div>

                                    <div>
                                        <label htmlFor="reason" className="mb-2 block text-sm font-medium text-[#34483A]">Additional details (optional)</label>
                                        <textarea id="reason" value={reason} onChange={(e) => setReason(e.target.value)} rows={3} maxLength={1000} placeholder="Share any details you would like the doctor to know." className="w-full rounded-xl border border-[#E8E7DF] px-4 py-3" />
                                    </div>

                                    <div>
                                        <p className="mb-3 text-sm font-medium text-[#34483A]">Available time slots</p>
                                        {!appointmentDate ? <p className="text-sm text-gray-500">Select an appointment date first.</p> :
                                            !availability?.workingDays?.includes(selectedDay) ? <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">This doctor does not normally work on the selected day.</p> :
                                                slots.length === 0 ? <p className="text-sm text-gray-500">No future time slots are available for this date.</p> :
                                                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                                        {slots.map((slot) =>
                                                            <button key={slot.startTime} type="button" onClick={() => setSelectedTime(slot.startTime)}
                                                                className={`rounded-xl border px-3 py-3 text-sm font-medium ${selectedTime === slot.startTime ? 'border-[#164744] bg-[#164744] text-white' : 'border-[#E8E7DF] text-[#34483A] hover:border-[#477A57]'}`}>
                                                                {slot.startTime} – {slot.endTime}
                                                            </button>
                                                        )}
                                                    </div>
                                        }
                                        {selectedTime && <p className="mt-3 text-sm text-[#164744]">Selected time: <strong>{selectedTime}</strong></p>}
                                    </div>

                                    {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
                                    {success && <p role="status" className="rounded-xl bg-green-50 p-4 text-sm text-green-800">{success}</p>}

                                    <button type="button" disabled={!appointmentDate || !selectedTime || submitting} onClick={handleBooking}
                                        className="w-full rounded-full bg-[#164744] px-5 py-3.5 text-sm font-semibold text-white hover:bg-[#205B56] disabled:cursor-not-allowed disabled:opacity-50">
                                        {submitting ? 'Booking appointment...' : 'Confirm appointment'}
                                    </button>

                                    <p className="text-xs leading-5 text-gray-500">
                                        This platform is not for emergencies. Seek urgent medical care immediately in an emergency.
                                    </p>
                                </div>
                            </>
                    }
                </div>
            </div>
        </main>
    )
}
