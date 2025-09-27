export interface UserEmployeeMaster {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'superadmin' | 'admin' | 'employee';
  created_at?: Date;
  phone?: string;
  address?: string;
  mfa_secret?: string;
  mfa_enabled?: boolean;
  is_email_verified?: boolean;
  profile_photo?: string;
  employee_id?: string;
  department?: string;
  date_of_joining?: Date;
  dob?: Date;
  gender?: string;
  resume?: string;
  emergency_contact?: string;
  rcre_id?: string;
  rcre_date?: Date;
  access_flag: 'y' | 'n';
}
