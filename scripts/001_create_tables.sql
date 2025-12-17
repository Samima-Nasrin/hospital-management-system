-- Create users table for system users (Admin, Doctor, Registrar, IPD)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  user_id TEXT UNIQUE NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
  role TEXT NOT NULL CHECK (role IN ('Admin', 'Doctor', 'Registrar', 'IPD')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create patients table
CREATE TABLE IF NOT EXISTS public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
  contact TEXT NOT NULL,
  address TEXT NOT NULL,
  symptoms TEXT NOT NULL,
  medical_history TEXT,
  blood_group TEXT,
  emergency_contact TEXT,
  registered_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES public.users(id),
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'Completed', 'Cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create beds table
CREATE TABLE IF NOT EXISTS public.beds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bed_number TEXT UNIQUE NOT NULL,
  ward TEXT NOT NULL,
  floor TEXT NOT NULL,
  bed_type TEXT NOT NULL CHECK (bed_type IN ('General', 'ICU', 'Private', 'Semi-Private')),
  status TEXT NOT NULL DEFAULT 'Available' CHECK (status IN ('Available', 'Occupied', 'Maintenance')),
  patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
  assigned_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create medical records table
CREATE TABLE IF NOT EXISTS public.medical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES public.users(id),
  diagnosis TEXT NOT NULL,
  prescription TEXT,
  lab_tests TEXT,
  notes TEXT,
  visit_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_user_id ON public.users(user_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_patients_patient_id ON public.patients(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON public.appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_beds_status ON public.beds(status);
CREATE INDEX IF NOT EXISTS idx_beds_patient_id ON public.beds(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_patient_id ON public.medical_records(patient_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view all users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Only admins can insert users" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Only admins can update users" ON public.users FOR UPDATE USING (true);
CREATE POLICY "Only admins can delete users" ON public.users FOR DELETE USING (true);

-- RLS Policies for patients table
CREATE POLICY "All authenticated users can view patients" ON public.patients FOR SELECT USING (true);
CREATE POLICY "Registrars can insert patients" ON public.patients FOR INSERT WITH CHECK (true);
CREATE POLICY "Authorized users can update patients" ON public.patients FOR UPDATE USING (true);
CREATE POLICY "Authorized users can delete patients" ON public.patients FOR DELETE USING (true);

-- RLS Policies for appointments table
CREATE POLICY "All users can view appointments" ON public.appointments FOR SELECT USING (true);
CREATE POLICY "Authorized users can insert appointments" ON public.appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "Authorized users can update appointments" ON public.appointments FOR UPDATE USING (true);
CREATE POLICY "Authorized users can delete appointments" ON public.appointments FOR DELETE USING (true);

-- RLS Policies for beds table
CREATE POLICY "All users can view beds" ON public.beds FOR SELECT USING (true);
CREATE POLICY "IPD staff can manage beds" ON public.beds FOR INSERT WITH CHECK (true);
CREATE POLICY "IPD staff can update beds" ON public.beds FOR UPDATE USING (true);
CREATE POLICY "IPD staff can delete beds" ON public.beds FOR DELETE USING (true);

-- RLS Policies for medical records table
CREATE POLICY "Doctors and patients can view medical records" ON public.medical_records FOR SELECT USING (true);
CREATE POLICY "Doctors can insert medical records" ON public.medical_records FOR INSERT WITH CHECK (true);
CREATE POLICY "Doctors can update medical records" ON public.medical_records FOR UPDATE USING (true);
CREATE POLICY "Authorized users can delete medical records" ON public.medical_records FOR DELETE USING (true);
