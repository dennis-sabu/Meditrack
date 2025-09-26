User Roles

Admin

Registers hospitals.

Manages hospital-level admins.

Can deactivate hospitals or doctors.

Hospital Admin

Registers/manages doctors under their hospital.

Approves/rejects doctor accounts.

Can view hospital appointments summary.

Doctor

Profile (specialization, availability).

Manages appointments.

Uploads prescriptions & sets reminders.

Schedules next checkups.

Reviews patient medicine intake verification (photo proof).

Patient

Registers/login.

Books appointments with doctors.

Views prescriptions, medicine schedule, and reminders.

Uploads intake verification photos.

Views next visit dates & medical history.

Core Features & Flow

Auth & Roles:
Email/password or OAuth (JWT-based sessions).
Role-based access (ADMIN, HOSPITAL, DOCTOR, PATIENT).

Appointments:
Patient requests → Doctor confirms/cancels → Patient notified.

Medical Records:
Patient history (allergies, diagnoses, past prescriptions).

Prescriptions:
Medicines (with dosage, frequency, food restrictions, duration).
Upload image of prescription (optional).

Reminders & Verification:
Push/email reminders for medicines & checkups.
Patients upload photo proof of medicine intake.

Events / Next Checkup:
Doctors set events like Regular Checkup, Blood Test Review, Follow-up Consultation.
Stored in events/calendar table.



THIS APP MANAGES THE DOCTOR, HOSPITAL & ADMIN login and functionalities only. PATIENT LOGIN AND functionalies are hosted on another next js app not this one


 I've made the rough pages for the admin to control hospitals,        
  doctors verify them. in (dashboard) it contains the doctor section   
  and hospital section, with the next auth session the middle ware     
  should written the way on the routes are accessible with the role    
  in the seession. doctors dashboard list items include, 
  calendar,patients-list, schedule, settings,etc. The Hospital Admin   
  has dashboard, Patient checkuped, manage-doctors, checkup-list       
  etc.. in the sign in page we used email and password for login with  
   next js. correct the code that signup with trpc calling and         
  sigining in with next auth and all backend codes with trpc router.   
  please check all the possible fields needed to make use of all the   
  features and make changes to the backend schema file. you have to    
  create all the function im the routers and implement it them in the  
   frontend