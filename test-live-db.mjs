import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://jezbrugkasqpjrbxlaxu.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImplemJydWdrYXNxcGpyYnhsYXh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwNzA3MjYsImV4cCI6MjA4NjY0NjcyNn0.r64npK6odoVLlKDQTUUoWqdCCQKzNBfHe30-B-FbAPw";
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
    console.log("Checking profiles table...");
    const p = await supabase.from("profiles").select("*").limit(1);
    console.log("Profiles:", p.error ? p.error.message : "Success");

    console.log("Checking appointments table...");
    const a = await supabase.from("appointments").select("*").limit(1);
    console.log("Appointments:", a.error ? a.error.message : "Success");

    console.log("Checking patients table...");
    const pa = await supabase.from("patients").select("*").limit(1);
    console.log("Patients:", pa.error ? pa.error.message : "Success");
}

checkTables();
