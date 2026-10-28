
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");
const { setGlobalOptions } = require("firebase-functions");

initializeApp();
const db = getFirestore();

setGlobalOptions({ maxInstances: 10 });

const DURATION_MINUTES = 30;

function isValidDate(date) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date || "")) return false;
    const parsed = new Date(`${date}T12:00:00Z`);
    return !Number.isNaN(parsed.getTime()) &&
        parsed.toISOString().slice(0, 10) === date;
}

function minutes(time) {
    if (!/^\d{2}:\d{2}$/.test(time || "")) return -1;
    const [h, m] = time.split(":").map(Number);
    return h <= 23 && m <= 59 ? h * 60 + m : -1;
}

function overlaps(aStart, aEnd, bStart, bEnd) {
    return aStart < bEnd && aEnd > bStart;
}

exports.bookAppointment = onCall(async (request) => {
    if (!request.auth) {
        throw new HttpsError("unauthenticated", "Please sign in to book.");
    }

    const patientId = request.auth.uid;
    const {
        doctorId, appointmentDate, startTime, appointmentType,
        visitTitle, reason = "",
    } = request.data || {};

    if (
        typeof doctorId !== "string" ||
        !isValidDate(appointmentDate) ||
        !["physical", "online"].includes(appointmentType) ||
        !["Antenatal check-up", "Follow-up visit", "Pregnancy concern",
            "General consultation"].includes(visitTitle) ||
        typeof reason !== "string" || reason.length > 1000
    ) {
        throw new HttpsError("invalid-argument", "Appointment details are invalid.");
    }

    const start = minutes(startTime);
    const end = start + DURATION_MINUTES;
    if (start < 0 || start % 30 !== 0 || end > 1440) {
        throw new HttpsError("invalid-argument", "Choose a valid 30-minute slot.");
    }

    const now = new Date();
    const requestedStart = new Date(`${appointmentDate}T${startTime}:00`);
    if (Number.isNaN(requestedStart.getTime()) || requestedStart <= now) {
        throw new HttpsError("failed-precondition", "Choose a future appointment time.");
    }

    const patientRef = db.collection("users").doc(patientId);
    const doctorRef = db.collection("publicDoctors").doc(doctorId);
    const availabilityRef = db.collection("doctorAvailability").doc(doctorId);
    const appointmentRef = db.collection("appointments").doc();

    await db.runTransaction(async (tx) => {
        const [patientSnap, doctorSnap, availabilitySnap] = await Promise.all([
            tx.get(patientRef), tx.get(doctorRef), tx.get(availabilityRef),
        ]);

        if (!patientSnap.exists || patientSnap.data().role !== "patient") {
            throw new HttpsError("permission-denied", "A patient account is required.");
        }
        if (!doctorSnap.exists || doctorSnap.data().verificationStatus !== "approved") {
            throw new HttpsError("failed-precondition", "This doctor is not approved.");
        }
        if (!availabilitySnap.exists) {
            throw new HttpsError("failed-precondition", "Doctor availability is not configured.");
        }

        const availability = availabilitySnap.data();
        const weekday = new Date(`${appointmentDate}T12:00:00Z`)
            .toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" });

        if (
            !availability.workingDays?.includes(weekday) ||
            start < minutes(availability.startTime) ||
            end > minutes(availability.endTime)
        ) {
            throw new HttpsError("failed-precondition", "The doctor is not available at that time.");
        }

        const dayStart = new Date(`${appointmentDate}T00:00:00`);
        const dayEnd = new Date(`${appointmentDate}T23:59:59.999`);
        const existingQuery = db.collection("appointments")
            .where("doctorId", "==", doctorId)
            .where("appointmentDate", "==", appointmentDate)
            .where("status", "==", "confirmed");

        const existing = await tx.get(existingQuery);
        for (const doc of existing.docs) {
            const booking = doc.data();
            if (overlaps(start, end, minutes(booking.startTime), minutes(booking.endTime))) {
                throw new HttpsError("already-exists", "That time slot has just been booked. Please choose another.");
            }
        }

        const patientName = patientSnap.data().fullName || "Patient";
        const doctorName = doctorSnap.data().fullName || "Healthcare professional";

        tx.create(appointmentRef, {
            patientId,
            patientName,
            doctorId,
            doctorName,
            appointmentDate,
            startTime,
            endTime: `${String(Math.floor(end / 60)).padStart(2, "0")}:${String(end % 60).padStart(2, "0")}`,
            appointmentType,
            visitTitle,
            reason: reason.trim(),
            fee: Number(availability.consultationFee || 0),
            status: "confirmed",
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        });
    });

    return { appointmentId: appointmentRef.id, status: "confirmed" };
});

exports.cancelAppointment = onCall(async (request) => {
    if (!request.auth) {
        throw new HttpsError("unauthenticated", "Please sign in.");
    }

    const { appointmentId } = request.data || {};
    if (typeof appointmentId !== "string" || !appointmentId) {
        throw new HttpsError("invalid-argument", "Appointment ID is required.");
    }

    const ref = db.collection("appointments").doc(appointmentId);

    await db.runTransaction(async (tx) => {
        const snap = await tx.get(ref);
        if (!snap.exists) {
            throw new HttpsError("not-found", "Appointment not found.");
        }

        const appointment = snap.data();
        const uid = request.auth.uid;
        if (uid !== appointment.patientId && uid !== appointment.doctorId) {
            throw new HttpsError("permission-denied", "You cannot cancel this appointment.");
        }
        if (appointment.status !== "confirmed") {
            throw new HttpsError("failed-precondition", "This appointment is not confirmed.");
        }

        const start = new Date(`${appointment.appointmentDate}T${appointment.startTime}:00`);
        if (uid === appointment.patientId && start.getTime() - Date.now() < 2 * 60 * 60 * 1000) {
            throw new HttpsError("failed-precondition", "Patients must cancel at least 2 hours before.");
        }

        tx.update(ref, {
            status: "cancelled",
            cancelledBy: uid,
            cancelledAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        });
    });

    return { success: true };
});
