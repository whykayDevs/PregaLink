
export const CONSULTATION_DURATION = 30

export function getAppointmentEndTime(startTime) {
    const [hours, minutes] = startTime.split(':').map(Number)

    const totalMinutes = hours * 60 + minutes + CONSULTATION_DURATION
    const endHours = Math.floor(totalMinutes / 60) % 24
    const endMinutes = totalMinutes % 60

    return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`
}
