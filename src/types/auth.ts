// src/types/auth.ts
export interface LoginUserInput {
  identifier: string; 
  password: string;
}

export interface RequestOTPInput {
  phoneNumber?: string;
  email?: string;
}

export interface RequestOTPResponse {
  status: boolean;
  message: string;
  tag: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  profileImageUrl: string;
  shopName: string;
  email: string;
  role: string;
  status: string;
  otp: string;
  otpExpiry: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  status: boolean;
  message: string;
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface VerifyOTPInput {
  email: string;
  otp: string;
}

export interface VerifyOTPResponse {
  status: boolean;
  message: string;
  tag?: string;
}

export interface ResetPasswordInput {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ResetPasswordResponse {
  status: boolean;
  message: string;
  user?: User;
  accessToken?: string;
  refreshToken?: string;
}

export interface Category {
  id: string;
  name: string;
}