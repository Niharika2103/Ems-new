// models/User.ts
export interface User {
  id: string; // uuid
  name: string;
  email: string;
  password: string;
  role: 'superadmin' | 'admin' | 'employee';
  created_at?: string; // timestamp without time zone
  phone?: string;
  address?: string;
  mfa_secret?: string;
  mfa_enabled: boolean;
  is_email_verified: boolean;
  profile_photo?: string;
  employee_id?: string;
  department?: string;
  date_of_joining?: string; // date
  dob?: string; // date
  gender?: string;
  resume?: string;
  emergency_contact?: string;
  rcre_id?: string;
  rcre_date?: string; // date
  access_flag: 'y' | 'n';
}