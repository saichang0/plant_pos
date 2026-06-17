import { gql } from 'graphql-request';

export const BANK_ACCOUNTS_QUERY = gql`
  query BankAccounts {
    bankAccounts {
      status
      message
      tap
      total
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
