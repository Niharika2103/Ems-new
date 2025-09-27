// models/Registration.ts
export interface Registration {
  id: string; // uuid
  user_id: string; // references user_employees_master.id
  email_otp?: string;
  otp_code?: string;
  otp_expiry?: string; // timestamptz
  reset_token?: string;
  reset_token_expiry?: string; // timestamptz
  is_approved: boolean;
  is_temp_admin: boolean;
  temp_admin_expiry?: string; // timestamptz
}