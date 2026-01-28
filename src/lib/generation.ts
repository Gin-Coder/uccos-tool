import { AccountFormData, GenerationSettings } from "@/types";

export function generateAccountCredentials(
  data: AccountFormData,
  settings: GenerationSettings
): { username: string; password: string; email: string } {
  
  const replacements: { [key: string]: string } = {
    '{FIRST2}': data.firstname.substring(0, 2),
    '{FIRST3}': data.firstname.substring(0, 3),
    '{first2}': data.firstname.substring(0, 2).toLowerCase(),
    '{first3}': data.firstname.substring(0, 3).toLowerCase(),
    '{firstname}': data.firstname.toLowerCase(),
    '{lastname}': data.lastname.toLowerCase(),
    '{SucAcc}': String(data.sucAcc),
    '{REF}': String(data.ref),
    '{lead}': String(data.lead),
    '{leg}': String(data.leg),
  };

  let username = settings.usernameFormat || '';
  let password = settings.passwordFormat || '';
  let email = `${data.firstname.toLowerCase()}${data.lastname.toLowerCase().charAt(0)}@${settings.emailDomain || 'example.com'}`;


  for (const placeholder in replacements) {
    const regex = new RegExp(placeholder.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'gi');
    username = username.replace(regex, replacements[placeholder]);
    password = password.replace(regex, replacements[placeholder]);
  }

  // Fallback for any other {key}
  for (const key in data) {
      const regex = new RegExp(`{${key}}`, 'gi');
      const value = String(data[key as keyof AccountFormData]);
      username = username.replace(regex, value);
      password = password.replace(regex, value);
  }

  return { username, password, email };
}

export function validateFormData(
  data: AccountFormData,
  requiredFields: string[]
): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const field of requiredFields) {
    if (!data[field as keyof AccountFormData]) {
      errors[field] = 'Ce champ est obligatoire.';
    }
  }

  return errors;
}
