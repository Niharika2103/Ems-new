export interface Registration {
  id: string;
  user_id: string;
  email_otp?: string;
  otp_code?: string;
  otp_expiry?: Date;
  reset_token?: string;
  reset_token_expiry?: Date;
  is_approved?: boolean;
  is_temp_admin?: boolean;
  temp_admin_expiry?: Date; // assuming
}