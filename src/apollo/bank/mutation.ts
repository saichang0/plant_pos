import { gql } from 'graphql-request';

export const CREATE_BANK_ACCOUNT_MUTATION = gql`
  mutation CreateBankAccount($input: CreateBankAccountInput!) {
    createBankAccount(input: $input) {
      status
      message
      tap
      data {
        id
        userId
        bankName
        qrImageUrl
        createdAt
        updatedAt
      }
    }
  }
`;

export const UPDATE_BANK_ACCOUNT_MUTATION = gql`
  mutation UpdateBankAccount($id: ID!, $input: UpdateBankAccountInput!) {
    updateBankAccount(id: $id, input: $input) {
      status
      message
      tap
      data {
        id
        userId
        bankName
        qrImageUrl
        createdAt
        updatedAt
      }
    }
  }
`;

export const DELETE_BANK_ACCOUNT_MUTATION = gql`
  mutation DeleteBankAccount($id: ID!) {
    deleteBankAccount(id: $id) {
      status
      message
      tap
      data {
        id
      }
    }
  }
`;
