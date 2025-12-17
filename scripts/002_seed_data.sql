-- Seed initial admin user
INSERT INTO public.users (name, email, password, user_id, gender, role)
VALUES 
  ('Admin User', 'admin@hospital.com', 'admin123', 'ADM001', 'Male', 'Admin'),
  ('Dr. Sarah Johnson', 'sarah.johnson@hospital.com', 'doctor123', 'DOC001', 'Female', 'Doctor'),
  ('Dr. Michael Chen', 'michael.chen@hospital.com', 'doctor123', 'DOC002', 'Male', 'Doctor'),
  ('Dr. Emily Williams', 'emily.williams@hospital.com', 'doctor123', 'DOC003', 'Female', 'Doctor'),
  ('John Smith', 'john.smith@hospital.com', 'registrar123', 'REG001', 'Male', 'Registrar'),
  ('Lisa Anderson', 'lisa.anderson@hospital.com', 'ipd123', 'IPD001', 'Female', 'IPD')
ON CONFLICT (user_id) DO NOTHING;

-- Seed some sample patients
INSERT INTO public.patients (patient_id, name, age, gender, contact, address, symptoms, blood_group, emergency_contact)
VALUES 
  ('PAT001', 'Robert Brown', 45, 'Male', '+1234567890', '123 Main St, City', 'Fever and cough', 'A+', '+1234567899'),
  ('PAT002', 'Maria Garcia', 32, 'Female', '+1234567891', '456 Oak Ave, City', 'Headache and nausea', 'B+', '+1234567898'),
  ('PAT003', 'James Wilson', 58, 'Male', '+1234567892', '789 Pine Rd, City', 'Chest pain', 'O+', '+1234567897'),
  ('PAT004', 'Patricia Martinez', 41, 'Female', '+1234567893', '321 Elm St, City', 'Back pain', 'AB+', '+1234567896'),
  ('PAT005', 'David Lee', 67, 'Male', '+1234567894', '654 Maple Dr, City', 'Diabetes checkup', 'A-', '+1234567895')
ON CONFLICT (patient_id) DO NOTHING;

-- Seed hospital beds
INSERT INTO public.beds (bed_number, ward, floor, bed_type, status)
VALUES 
  ('A101', 'General Ward A', '1st Floor', 'General', 'Available'),
  ('A102', 'General Ward A', '1st Floor', 'General', 'Available'),
  ('A103', 'General Ward A', '1st Floor', 'General', 'Occupied'),
  ('B201', 'General Ward B', '2nd Floor', 'General', 'Available'),
  ('B202', 'General Ward B', '2nd Floor', 'General', 'Available'),
  ('ICU301', 'ICU', '3rd Floor', 'ICU', 'Available'),
  ('ICU302', 'ICU', '3rd Floor', 'ICU', 'Occupied'),
  ('ICU303', 'ICU', '3rd Floor', 'ICU', 'Available'),
  ('P401', 'Private Wing', '4th Floor', 'Private', 'Available'),
  ('P402', 'Private Wing', '4th Floor', 'Private', 'Available'),
  ('SP501', 'Semi-Private', '5th Floor', 'Semi-Private', 'Available'),
  ('SP502', 'Semi-Private', '5th Floor', 'Semi-Private', 'Available')
ON CONFLICT (bed_number) DO NOTHING;

-- Seed some appointments for today and upcoming days
INSERT INTO public.appointments (patient_id, doctor_id, appointment_date, appointment_time, status)
SELECT 
  p.id,
  d.id,
  CURRENT_DATE,
  '09:00:00'::TIME,
  'Scheduled'
FROM public.patients p
CROSS JOIN public.users d
WHERE p.patient_id = 'PAT001' AND d.user_id = 'DOC001'
ON CONFLICT DO NOTHING;

INSERT INTO public.appointments (patient_id, doctor_id, appointment_date, appointment_time, status)
SELECT 
  p.id,
  d.id,
  CURRENT_DATE,
  '10:30:00'::TIME,
  'Scheduled'
FROM public.patients p
CROSS JOIN public.users d
WHERE p.patient_id = 'PAT002' AND d.user_id = 'DOC002'
ON CONFLICT DO NOTHING;

INSERT INTO public.appointments (patient_id, doctor_id, appointment_date, appointment_time, status)
SELECT 
  p.id,
  d.id,
  CURRENT_DATE + INTERVAL '1 day',
  '11:00:00'::TIME,
  'Scheduled'
FROM public.patients p
CROSS JOIN public.users d
WHERE p.patient_id = 'PAT003' AND d.user_id = 'DOC001'
ON CONFLICT DO NOTHING;
