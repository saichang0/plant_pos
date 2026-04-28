import { gql } from 'graphql-request';

export const GET_UNITS_QUERY = gql`
query GetUnits {
  getUnits {
    status
    message
    units {
      id
      name
      weightInGrams
      isActive
      createdBy
      createdAt
      updatedAt
      creator {
        id
        firstName
        lastName
      }
    }
  }
}`;
