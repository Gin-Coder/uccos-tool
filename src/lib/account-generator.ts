export interface GenerationSettings {
  usernameFormat: string;
  passwordFormat: string;
  emailFormat: string;
}

export interface AccountFormData {
  firstname: string;
  lastname: string;
  sucAcc: number;
  ref: number;
  qac: string;
  [key: string]: any; // Allow other fields
}

export const generateAccountCredentials = (
  data: AccountFormData,
  settings: GenerationSettings
) => {
  const replacements: { [key: string]: string } = {
    // Case sensitive replacements
    '{FIRST2}': data.firstname.substring(0, 2),
    '{FIRST3}': data.firstname.substring(0, 3),
    '{firstname}': data.firstname.toLowerCase(),
    '{lastname}': data.lastname.toLowerCase(),
    
    // Field value replacements
    '{SucAcc}': String(data.sucAcc),
    '{REF}': String(data.ref),
    '{qac}': data.qac,
    '{lead}': String(data.lead),
    '{leg}': String(data.leg),
  };

  let username = settings.usernameFormat;
  let password = settings.passwordFormat;
  let email = settings.emailFormat;

  for (const placeholder in replacements) {
    const regex = new RegExp(placeholder.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g');
    username = username.replace(regex, replacements[placeholder]);
    password = password.replace(regex, replacements[placeholder]);
    email = email.replace(regex, replacements[placeholder]);
  }
  
  // For case-insensitive placeholders like {ref}
  for (const key in data) {
      const regex = new RegExp(`{${key}}`, 'gi');
      username = username.replace(regex, String(data[key]));
      password = password.replace(regex, String(data[key]));
      email = email.replace(regex, String(data[key]));
  }

  return {
    username,
    password,
    email,
  };
};
