export const UserModel = {
  id: "uuid",
  name: "string",
  email: "string",
  password: "hashed string",
  role: "string?",      
  access_flag: "string?", 
  mfa_secret: "string?",        
  mfa_enabled: "boolean",
  is_email_verified: "boolean",
  created_at: "timestamp",
  updated_at: "timestamp",
};
