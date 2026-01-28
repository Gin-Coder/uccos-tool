export interface GenerationSettings {
  id?: string;
  usernameFormat: string;
  passwordFormat: string;
  emailDomain: string;
  allowManualDate: boolean;
  requiredFields: string[];
}

export interface AccountFormData {
  firstname: string;
  middlename: string;
  lastname: string;
  lead: string;
  leg: string;
  sucAcc: string;
  ref: string;
  phone: string;
}

export interface Account extends AccountFormData {
  id: string;
  username: string;
  password: string;
  email: string;
  displayDate: string;
  createdAt: any; // Can be Date or FieldValue
}
