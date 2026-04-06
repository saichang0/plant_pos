// src/services/auth.ts
import { GraphQLClient } from 'graphql-request';
import { LOGIN_MUTATION, REQUEST_OTP_MUTATION, VERIFY_USER_OTP, RESET_PASSWORD_MUTATION } from '@/src/apollo/auth/mutation';
import { BACKEND_URLS } from '@/src/lib/config';
import {
  LoginUserInput,
  LoginResponse,
  RequestOTPInput,
  RequestOTPResponse,
  VerifyOTPInput,
  VerifyOTPResponse,
  ResetPasswordInput,
  ResetPasswordResponse,
} from '@/src/types/auth';

const graphqlEndpoint = process.env.NEXT_PUBLIC_GRAPHQL_URL || BACKEND_URLS.local;
const client = new GraphQLClient(graphqlEndpoint);

export async function loginUser(input: LoginUserInput): Promise<LoginResponse> {
  const data = await client.request<{ loginUser: LoginResponse }>(LOGIN_MUTATION, { input });
  return data.loginUser;
}

export async function requestUserOTP(dataInput: RequestOTPInput): Promise<RequestOTPResponse> {
  const data = await client.request<{ requestUserOTP: RequestOTPResponse }>(REQUEST_OTP_MUTATION, { data: dataInput });
  return data.requestUserOTP;
}

export async function verifyUserOTP(dataInput: VerifyOTPInput): Promise<VerifyOTPResponse> {
  const data = await client.request<{ verifyUserOTP: VerifyOTPResponse }>(VERIFY_USER_OTP, { data: dataInput });
  return data.verifyUserOTP;
}

export async function resetUserPassword(dataInput: ResetPasswordInput): Promise<ResetPasswordResponse> {
  const data = await client.request<{ resetUserPassword: ResetPasswordResponse }>(RESET_PASSWORD_MUTATION, { data: dataInput });
  return data.resetUserPassword;
}

