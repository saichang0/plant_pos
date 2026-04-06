import { gql } from 'graphql-request';

export const LOGIN_MUTATION = gql`
  mutation LoginUser($input: LoginUserInput!) {
    loginUser(input: $input) {
      status
      message
      user {
        id
        firstName
        lastName
        phoneNumber
        profileImageUrl
        shopName
        email
        role
        status
        otp
        otpExpiry
        createdAt
        updatedAt
      }
      accessToken
      refreshToken
    }
  }
`;

export const REQUEST_OTP_MUTATION = gql`
  mutation RequestUserOTP($data: RequestOTPInput!) {
    requestUserOTP(data: $data) {
      status
      message
      tag
    }
  }
`;

export const VERIFY_USER_OTP = gql`
mutation VerifyUserOTP($data: VerifyOTPInput!) {
  verifyUserOTP(data: $data) {
    status
    message
    tag
  }
}`;

export const RESET_PASSWORD_MUTATION = gql`
mutation ResetUserPassword($data: ResetPassword!) {
  resetUserPassword(data: $data) {
    status
    message
    user {
      id
      firstName
      lastName
      phoneNumber
      profileImageUrl
      shopName
      email
      role
      status
      otp
      otpExpiry
      createdAt
      updatedAt
    }
    accessToken
    refreshToken
  }
}`;
