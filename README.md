# Hospital management system

Hospital Management System – Functional Process & Data Flow Documentation

## 1. System Overview

The Hospital Management System (HMS) is an integrated digital platform designed to manage all core hospital operations including patient registration, appointment scheduling, doctor consultations, inpatient admissions, bed management, user administration, and reporting. The system centralizes data so that every department works with consistent, real-time information, reducing manual errors and improving operational efficiency.

The system is accessed by multiple user roles such as patients, reception staff, doctors, IPD staff, and administrators. Each role interacts with the system based on defined permissions, ensuring security and accountability while maintaining smooth data flow across hospital functions.

## 2. User Account Management and Authentication

The system begins with user account management. Users such as doctors, receptionists, IPD registrars, and administrators are provided secure login credentials. During login, the user enters an email or phone number along with a password. These credentials are validated against stored user records. If authentication is successful, the user is granted access to their respective dashboard; otherwise, an error response is returned.

The system also supports account registration, password recovery, password updates, logout functionality, and account deletion. All account-related data is stored securely in the user database. Any updates made to account credentials or user status are immediately reflected across the system to maintain consistency and security.

## 3. Patient Registration and Front Desk Operations

Patient interaction with the hospital begins at the reception or registration desk. When a patient arrives, the receptionist collects personal details such as name, age, gender, contact information, and address. The reason for visit and basic medical complaints are also recorded. These details are validated and stored in the patient records database.

If the patient is new, a unique patient ID is generated. For returning patients, existing records are retrieved and updated if required. Once registration is complete, the receptionist schedules an appointment by checking doctor availability based on department, specialization, and time slots. Appointment confirmation details are then shared with both the patient and the assigned doctor.

## 4. Doctor Consultation and Medical Record Handling

Doctors access the system to view their assigned patient list and appointment schedules. When a patient arrives for consultation, the doctor retrieves the patient’s complete profile, including previous medical history, test results, and past prescriptions if available.

During the consultation, the doctor records diagnosis details, prescribed medicines, suggested laboratory tests, and treatment plans. This medical information is saved into the patient’s medical record and becomes part of their permanent health history within the system.

If the doctor determines that inpatient care is required, an admission request is generated and forwarded internally for inpatient processing. This ensures continuity between outpatient consultation and inpatient services without duplicating data.

## 5. Inpatient Admission and Bed Management

When an inpatient admission request is received, the IPD registration process begins. The system checks current bed availability across wards, room categories, and departments. Bed availability data is maintained in real time to prevent conflicts or double allocation.

Once a suitable bed is identified, it is assigned to the patient, and the bed status is updated from available to occupied. The patient’s personal details and medical information are linked to the inpatient record. Any subsequent updates such as ward transfers, bed changes, or discharge are immediately reflected in the system to maintain accurate occupancy data.

This process ensures efficient utilization of hospital resources and provides staff with up-to-date information on bed status at all times.

## 6. Administrative Control and System Oversight

The administrator plays a critical role in managing the overall system. Admin responsibilities include creating user accounts, assigning roles, managing access permissions, and maintaining departmental configurations. The admin can activate or deactivate user accounts and reset login credentials when required.

Administrative users also monitor system performance and hospital operations through consolidated data views. They have access to operational statistics such as patient volumes, doctor workload, bed occupancy rates, and system usage patterns. These insights support strategic planning and decision-making.

## 7. Reporting and Information Output

The system generates various reports required for operational, clinical, and administrative purposes. These include patient registration summaries, appointment schedules, medical history reports, inpatient admission details, and bed occupancy reports.

Reports are generated using real-time data stored in the system and can be accessed by authorized users only. This ensures transparency, accountability, and compliance with hospital policies.
