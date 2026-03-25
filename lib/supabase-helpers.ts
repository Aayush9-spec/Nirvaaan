import { createClient } from "@/utils/supabase/client";

// ─── Types ──────────────────────────────────────────────────────────

export interface Profile {
    id: string;
    full_name: string | null;
    email: string | null;
    phone: string | null;
    role: string;
    avatar_url: string | null;
    medical_share: boolean;
    notifications: boolean;
    created_at: string;
    updated_at: string;
}

export interface Doctor {
    id: string;
    user_id: string | null;
    name: string;
    specialty: string;
    location: string | null;
    meet_link: string | null;
    image_color: string;
    available: boolean;
    bio?: string;
    consultation_fee?: number;
    experience?: number;
    phone?: string;
}

export interface Appointment {
    id: string;
    patient_id: string;
    doctor_id: string;
    date: string;
    time: string;
    type: "online" | "offline";
    status: "upcoming" | "completed" | "cancelled" | "rescheduled";
    meet_link: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
    // Joined
    doctor?: Doctor;
}

export interface RecordItem {
    id: string;
    record_id: string;
    name: string;
    dosage: string | null;
    price: number;
}

export interface MedicalRecord {
    id: string;
    record_number: string | null;
    patient_id: string;
    doctor_id: string | null;
    type: string;
    diagnosis: string | null;
    status: string;
    date: string;
    created_at: string;
    // Joined
    doctor?: Doctor;
    record_items?: RecordItem[];
}

export interface PrescriptionItem {
    name: string;
    dosage: string;
    duration: string;
}

export interface Prescription {
    id: string;
    prescription_number: string | null;
    doctor_id: string;
    patient_id: string;
    diagnosis: string | null;
    notes: string | null;
    status: string;
    created_at: string;
    prescription_items?: PrescriptionItem[];
}

export interface Notification {
    id: string;
    user_id: string;
    title: string;
    message: string;
    type: "info" | "appointment" | "lab" | "prescription" | "vitals" | "system";
    read: boolean;
    link: string | null;
    created_at: string;
}

// ─── Auth Helper ────────────────────────────────────────────────────

export async function getCurrentUserId(): Promise<string | null> {
    const supabase = createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    return user?.id ?? null;
}

// ─── Profiles ───────────────────────────────────────────────────────

export async function getProfile(userId: string): Promise<Profile | null> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

    if (error) {
        console.error("Error fetching profile:", error.message);
        return null;
    }
    return data;
}

export async function updateProfile(
    userId: string,
    updates: Partial<Pick<Profile, "full_name" | "email" | "phone" | "medical_share" | "notifications">>
): Promise<boolean> {
    const supabase = createClient();
    const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", userId);

    if (error) {
        console.error("Error updating profile:", error.message);
        return false;
    }
    return true;
}

// ─── Doctors ────────────────────────────────────────────────────────

export async function getDoctors(): Promise<Doctor[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("doctors")
        .select("*")
        .eq("available", true)
        .order("name");

    if (error) {
        console.error("Error fetching doctors:", error.message);
        return [];
    }
    return data ?? [];
}

export async function getDoctorProfile(userId: string): Promise<Doctor | null> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("doctors")
        .select("*")
        .eq("user_id", userId)
        .single();

    if (error) {
        // It's possible the user is a doctor but doesn't have a profile yet? 
        // Or if RLS is strict. But doctors should have one created?
        // Maybe return null and handle creation if needed.
        return null;
    }
    return data;
}

export async function updateDoctorProfile(
    userId: string,
    updates: Partial<Doctor>
): Promise<boolean> {
    const supabase = createClient();
    const { error } = await supabase
        .from("doctors")
        .update(updates)
        .eq("user_id", userId);

    if (error) {
        console.error("Error updating doctor profile:", error.message);
        return false;
    }
    return true;
}

// ─── Appointments ───────────────────────────────────────────────────

export async function getAppointments(
    userId: string,
    status?: "upcoming" | "completed" | "cancelled"
): Promise<Appointment[]> {
    const supabase = createClient();
    let query = supabase
        .from("appointments")
        .select("*, doctor:doctors(*)")
        .eq("patient_id", userId)
        .order("date", { ascending: true });

    if (status) {
        query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
        console.error("Error fetching appointments:", error.message);
        return [];
    }
    return data ?? [];
}

export async function bookAppointment(appointment: {
    patient_id: string;
    doctor_id: string;
    date: string;
    time: string;
    type: "online" | "offline";
    meet_link?: string;
    payment_status?: string;
    payment_id?: string;
    order_id?: string;
    amount?: number;
}): Promise<boolean> {
    const supabase = createClient();
    const { error } = await supabase.from("appointments").insert({
        ...appointment,
        status: "upcoming",
        payment_status: appointment.payment_status || "pending",
        amount: appointment.amount || 0,
    });

    if (error) {
        console.error("Error booking appointment:", error.message);
        return false;
    }

    // Auto-create notification
    const formattedDate = new Date(appointment.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
    await createNotification({
        user_id: appointment.patient_id,
        title: "Appointment Booked",
        message: `Your ${appointment.type} appointment on ${formattedDate} at ${appointment.time} has been confirmed.`,
        type: "appointment",
        link: "/dashboard/appointments",
    });

    return true;
}

export async function rescheduleAppointment(
    appointmentId: string,
    newDate: string
): Promise<boolean> {
    const supabase = createClient();
    const { error } = await supabase
        .from("appointments")
        .update({ date: newDate, status: "upcoming" })
        .eq("id", appointmentId);

    if (error) {
        console.error("Error rescheduling appointment:", error.message);
        return false;
    }
    return true;
}

export async function cancelAppointment(appointmentId: string): Promise<boolean> {
    const supabase = createClient();
    const { error } = await supabase
        .from("appointments")
        .update({ status: "cancelled" })
        .eq("id", appointmentId);

    if (error) {
        console.error("Error cancelling appointment:", error.message);
        return false;
    }
    return true;
}

// ─── Medical Records ────────────────────────────────────────────────

export async function getMedicalRecords(userId: string): Promise<MedicalRecord[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("medical_records")
        .select("*, doctor:doctors(*), record_items(*)")
        .eq("patient_id", userId)
        .order("date", { ascending: false });

    if (error) {
        console.error("Error fetching medical records:", error.message);
        return [];
    }
    return data ?? [];
}

export async function updateRecordStatus(
    recordId: string,
    status: string
): Promise<boolean> {
    const supabase = createClient();
    const { error } = await supabase
        .from("medical_records")
        .update({ status })
        .eq("id", recordId);

    if (error) {
        console.error("Error updating record status:", error.message);
        return false;
    }
    return true;
}

// ─── Doctor-specific: Patients ──────────────────────────────────────

export interface DoctorPatient {
    id: string;
    name: string;
    age: number | null;
    gender: string | null;
    lastVisit: string | null;
    condition: string | null;
    status: string;
    visits: number;
}

export async function getDoctorPatients(doctorUserId: string): Promise<DoctorPatient[]> {
    const supabase = createClient();

    // First get the doctor's ID from user_id
    const { data: doctorRow } = await supabase
        .from("doctors")
        .select("id")
        .eq("user_id", doctorUserId)
        .single();

    if (!doctorRow) return [];

    // Get unique patients who have appointments with this doctor
    const { data: appointments, error } = await supabase
        .from("appointments")
        .select("patient_id, date, status, profiles:patient_id(full_name, email)")
        .eq("doctor_id", doctorRow.id)
        .order("date", { ascending: false });

    if (error || !appointments) {
        console.error("Error fetching doctor patients:", error?.message);
        return [];
    }

    // Aggregate by patient
    const patientMap = new Map<string, DoctorPatient>();
    for (const apt of appointments) {
        const pid = apt.patient_id;
        const profile = apt.profiles as any;
        if (!patientMap.has(pid)) {
            patientMap.set(pid, {
                id: pid,
                name: profile?.full_name || profile?.email || "Unknown",
                age: null,
                gender: null,
                lastVisit: apt.date,
                condition: null,
                status: apt.status === "upcoming" ? "Active" : "Follow-up",
                visits: 1,
            });
        } else {
            const existing = patientMap.get(pid)!;
            existing.visits += 1;
        }
    }

    return Array.from(patientMap.values());
}

// Get patients for doctor prescription dropdown (simplified)
export async function getDoctorPatientsList(doctorUserId: string): Promise<{ id: string; name: string; lastVisit: string | null }[]> {
    const patients = await getDoctorPatients(doctorUserId);
    return patients.map((p) => ({
        id: p.id,
        name: p.name,
        lastVisit: p.lastVisit,
    }));
}

// ─── Doctor-specific: Prescriptions ─────────────────────────────────

export async function createPrescription(data: {
    doctorUserId: string;
    patientId: string;
    diagnosis: string;
    notes: string;
    medicines: PrescriptionItem[];
}): Promise<boolean> {
    const supabase = createClient();

    // Get doctor ID from user_id
    const { data: doctorRow } = await supabase
        .from("doctors")
        .select("id")
        .eq("user_id", data.doctorUserId)
        .single();

    if (!doctorRow) {
        console.error("Doctor profile not found for user");
        return false;
    }

    // Generate prescription number
    const prescNum = `RX-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Insert prescription
    const { data: prescription, error: presError } = await supabase
        .from("prescriptions")
        .insert({
            prescription_number: prescNum,
            doctor_id: doctorRow.id,
            patient_id: data.patientId,
            diagnosis: data.diagnosis,
            notes: data.notes,
            status: "sent",
        })
        .select("id")
        .single();

    if (presError || !prescription) {
        console.error("Error creating prescription:", presError?.message);
        return false;
    }

    // Insert medicine items
    if (data.medicines.length > 0) {
        const items = data.medicines
            .filter((m) => m.name.trim() !== "")
            .map((m) => ({
                prescription_id: prescription.id,
                name: m.name,
                dosage: m.dosage,
                duration: m.duration,
            }));

        if (items.length > 0) {
            const { error: itemsError } = await supabase
                .from("prescription_items")
                .insert(items);

            if (itemsError) {
                console.error("Error inserting prescription items:", itemsError.message);
            }
        }
    }

    // Also create a medical record for the patient
    const recNum = `REC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    const { data: record, error: recError } = await supabase
        .from("medical_records")
        .insert({
            record_number: recNum,
            patient_id: data.patientId,
            doctor_id: doctorRow.id,
            type: "Prescription",
            diagnosis: data.diagnosis,
            status: "Pending Order",
        })
        .select("id")
        .single();

    if (!recError && record && data.medicines.length > 0) {
        const recItems = data.medicines
            .filter((m) => m.name.trim() !== "")
            .map((m) => ({
                record_id: record.id,
                name: m.name,
                dosage: `${m.dosage} (${m.duration})`,
                price: 0.002,
            }));

        if (recItems.length > 0) {
            await supabase.from("record_items").insert(recItems);
        }
    }

    return true;
}

// ─── Vitals ─────────────────────────────────────────────────────────

export interface VitalEntry {
    id: string;
    patient_id: string;
    heart_rate: number | null;
    systolic: number | null;
    diastolic: number | null;
    spo2: number | null;
    temperature: number | null;
    respiratory_rate: number | null;
    notes: string | null;
    recorded_at: string;
}

export async function logVitals(data: {
    patient_id: string;
    heart_rate?: number;
    systolic?: number;
    diastolic?: number;
    spo2?: number;
    temperature?: number;
    respiratory_rate?: number;
    notes?: string;
}): Promise<boolean> {
    const supabase = createClient();
    const { error } = await supabase.from("vitals").insert(data);
    if (error) {
        console.error("Error logging vitals:", error.message);
        return false;
    }
    return true;
}

export async function getVitalsHistory(
    userId: string,
    limit: number = 20
): Promise<VitalEntry[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("vitals")
        .select("*")
        .eq("patient_id", userId)
        .order("recorded_at", { ascending: false })
        .limit(limit);

    if (error) {
        console.error("Error fetching vitals:", error.message);
        return [];
    }
    return data ?? [];
}

// ─── Lab Tests & Bookings ───────────────────────────────────────────

export interface LabTest {
    id: string;
    name: string;
    category: "pathlab" | "radiology";
    description: string | null;
    price: number;
    duration: string | null;
    preparation: string | null;
    available: boolean;
}

export interface LabBooking {
    id: string;
    patient_id: string;
    test_id: string;
    date: string;
    time: string | null;
    location: string;
    status: string;
    result_summary: string | null;
    created_at: string;
    // Joined
    lab_test?: LabTest;
}

export async function getLabTests(
    category: "pathlab" | "radiology"
): Promise<LabTest[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("lab_tests")
        .select("*")
        .eq("category", category)
        .eq("available", true)
        .order("name");

    if (error) {
        console.error("Error fetching lab tests:", error.message);
        return [];
    }
    return data ?? [];
}

export async function bookLabTest(booking: {
    patient_id: string;
    test_id: string;
    date: string;
    time?: string;
    location?: string;
}): Promise<boolean> {
    const supabase = createClient();
    const { error } = await supabase.from("lab_bookings").insert({
        ...booking,
        status: "booked",
    });

    if (error) {
        console.error("Error booking lab test:", error.message);
        return false;
    }

    // Auto-create notification
    const formattedDate = new Date(booking.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
    await createNotification({
        user_id: booking.patient_id,
        title: "Lab Test Booked",
        message: `Your lab test on ${formattedDate}${booking.time ? " at " + booking.time : ""} has been scheduled.${booking.location ? " Location: " + booking.location : ""}`,
        type: "lab",
        link: "/dashboard/pathlab",
    });

    return true;
}

export async function getLabBookings(
    userId: string,
    category?: "pathlab" | "radiology"
): Promise<LabBooking[]> {
    const supabase = createClient();
    let query = supabase
        .from("lab_bookings")
        .select("*, lab_test:lab_tests(*)")
        .eq("patient_id", userId)
        .order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) {
        console.error("Error fetching lab bookings:", error.message);
        return [];
    }

    // Filter by category client-side if needed
    if (category && data) {
        return data.filter((b: any) => b.lab_test?.category === category);
    }
    return data ?? [];
}

// ─── Doctor Dashboard Stats ─────────────────────────────────────────

export interface DoctorStats {
    todayAppointments: number;
    totalPatients: number;
    pendingReports: number;
    totalPrescriptions: number;
}

export async function getDoctorStats(doctorUserId: string): Promise<DoctorStats> {
    const supabase = createClient();

    const { data: doctorRow } = await supabase
        .from("doctors")
        .select("id")
        .eq("user_id", doctorUserId)
        .single();

    if (!doctorRow) {
        return { todayAppointments: 0, totalPatients: 0, pendingReports: 0, totalPrescriptions: 0 };
    }

    const today = new Date().toISOString().split("T")[0];

    // Today's appointments
    const { count: todayCount } = await supabase
        .from("appointments")
        .select("*", { count: "exact", head: true })
        .eq("doctor_id", doctorRow.id)
        .eq("date", today);

    // Total unique patients
    const { data: allApts } = await supabase
        .from("appointments")
        .select("patient_id")
        .eq("doctor_id", doctorRow.id);

    const uniquePatients = new Set(allApts?.map((a) => a.patient_id) ?? []);

    // Pending medical records
    const { count: pendingCount } = await supabase
        .from("medical_records")
        .select("*", { count: "exact", head: true })
        .eq("doctor_id", doctorRow.id)
        .eq("status", "Pending Order");

    // Total prescriptions
    const { count: prescCount } = await supabase
        .from("prescriptions")
        .select("*", { count: "exact", head: true })
        .eq("doctor_id", doctorRow.id);

    return {
        todayAppointments: todayCount ?? 0,
        totalPatients: uniquePatients.size,
        pendingReports: pendingCount ?? 0,
        totalPrescriptions: prescCount ?? 0,
    };
}

// ─── Doctor Appointments ────────────────────────────────────────────

export interface DoctorAppointment {
    id: string;
    patient_id: string;
    doctor_id: string;
    date: string;
    time: string;
    type: "online" | "offline";
    status: string;
    meet_link: string | null;
    notes: string | null;
    created_at: string;
    // Joined
    patient?: { full_name: string | null; email: string | null };
}

export async function getDoctorAppointments(
    doctorUserId: string,
    filter?: "upcoming" | "completed" | "cancelled"
): Promise<DoctorAppointment[]> {
    const supabase = createClient();

    const { data: doctorRow } = await supabase
        .from("doctors")
        .select("id")
        .eq("user_id", doctorUserId)
        .single();

    if (!doctorRow) return [];

    let query = supabase
        .from("appointments")
        .select("*, patient:profiles!appointments_patient_id_fkey(full_name, email)")
        .eq("doctor_id", doctorRow.id)
        .order("date", { ascending: true })
        .order("time", { ascending: true });

    if (filter) {
        query = query.eq("status", filter);
    }

    const { data, error } = await query;

    if (error) {
        console.error("Error fetching doctor appointments:", error.message);
        return [];
    }
    return (data ?? []) as unknown as DoctorAppointment[];
}

export async function updateAppointmentStatus(
    appointmentId: string,
    status: "upcoming" | "completed" | "cancelled"
): Promise<boolean> {
    const supabase = createClient();
    const { error } = await supabase
        .from("appointments")
        .update({ status })
        .eq("id", appointmentId);

    if (error) {
        console.error("Error updating appointment status:", error.message);
        return false;
    }
    return true;
}

export async function getNextDoctorAppointment(
    doctorUserId: string
): Promise<DoctorAppointment | null> {
    const supabase = createClient();

    const { data: doctorRow } = await supabase
        .from("doctors")
        .select("id")
        .eq("user_id", doctorUserId)
        .single();

    if (!doctorRow) return null;

    const today = new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
        .from("appointments")
        .select("*, patient:profiles!appointments_patient_id_fkey(full_name, email)")
        .eq("doctor_id", doctorRow.id)
        .eq("status", "upcoming")
        .gte("date", today)
        .order("date", { ascending: true })
        .order("time", { ascending: true })
        .limit(1)
        .single();

    if (error || !data) return null;
    return data as unknown as DoctorAppointment;
}

// ─── Diagnostics Helper ─────────────────────────────────────────────

export async function getRecentActivity(userId: string): Promise<
    { date: string; event: string; status: string; color: string }[]
> {
    const supabase = createClient();
    const activities: { date: string; event: string; status: string; color: string }[] = [];

    // Recent appointments
    const { data: apts } = await supabase
        .from("appointments")
        .select("date, status, doctor:doctors(name, specialty)")
        .eq("patient_id", userId)
        .order("date", { ascending: false })
        .limit(3);

    if (apts) {
        for (const a of apts) {
            const doc = a.doctor as any;
            activities.push({
                date: new Date(a.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                event: `Consultation — ${doc?.name || "Doctor"}`,
                status: a.status === "completed" ? "Completed" : a.status === "upcoming" ? "Scheduled" : a.status,
                color: a.status === "completed" ? "text-green-400" : "text-blue-400",
            });
        }
    }

    // Recent lab bookings
    const { data: labs } = await supabase
        .from("lab_bookings")
        .select("date, status, lab_test:lab_tests(name)")
        .eq("patient_id", userId)
        .order("created_at", { ascending: false })
        .limit(2);

    if (labs) {
        for (const l of labs) {
            const test = l.lab_test as any;
            activities.push({
                date: new Date(l.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                event: `Lab Test — ${test?.name || "Test"}`,
                status: l.status === "completed" ? "Completed" : "Scheduled",
                color: l.status === "completed" ? "text-green-400" : "text-purple-400",
            });
        }
    }

    // Recent prescriptions
    const { data: recs } = await supabase
        .from("medical_records")
        .select("date, status, diagnosis")
        .eq("patient_id", userId)
        .order("date", { ascending: false })
        .limit(2);

    if (recs) {
        for (const r of recs) {
            activities.push({
                date: new Date(r.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                event: `Prescription — ${r.diagnosis || "Medication"}`,
                status: r.status === "Delivered" ? "Delivered" : r.status,
                color: r.status === "Delivered" ? "text-purple-400" : "text-yellow-400",
            });
        }
    }

    return activities.slice(0, 5);
}

// ─── Notifications ──────────────────────────────────────────────────

export async function createNotification(notification: {
    user_id: string;
    title: string;
    message: string;
    type: Notification["type"];
    link?: string;
}): Promise<boolean> {
    const supabase = createClient();
    const { error } = await supabase.from("notifications").insert(notification);
    if (error) {
        console.error("Error creating notification:", error.message);
        return false;
    }
    return true;
}

export async function getNotifications(userId: string): Promise<Notification[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);

    if (error) {
        console.error("Error fetching notifications:", error.message);
        return [];
    }
    return data || [];
}

export async function getUnreadCount(userId: string): Promise<number> {
    const supabase = createClient();
    const { count, error } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("read", false);

    if (error) return 0;
    return count || 0;
}

export async function markNotificationRead(id: string): Promise<boolean> {
    const supabase = createClient();
    const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", id);
    return !error;
}

export async function markAllNotificationsRead(userId: string): Promise<boolean> {
    const supabase = createClient();
    const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", userId)
        .eq("read", false);
    return !error;
}

export async function deleteAllNotifications(userId: string): Promise<boolean> {
    const supabase = createClient();
    const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("user_id", userId);
    return !error;
}
