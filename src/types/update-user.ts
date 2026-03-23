export interface UpdateUserPayload {
  userName?: string;
  password?: string;
  avatar?: File | null;
  re_auth_psw?:string;
}