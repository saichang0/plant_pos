import { gql } from 'graphql-request';

export const GET_USER_QUERY = gql`
query GetUser($id: ID!) {
  getUser(id: $id) {
    status
    message
    user {
      id
      firstName
      lastName
      phoneNumber
      email
      profileImageUrl
      shopName
      bankAccountImageUrl
      role
      status
      createdAt
      updatedAt
    }
  }
}`;
