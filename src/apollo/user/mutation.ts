import { gql } from 'graphql-request';

export const UPDATE_USER_MUTATION = gql`
mutation UpdateUser($input: UpdateUserInput!) {
  updateUser(input: $input) {
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
