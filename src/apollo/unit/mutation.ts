import { gql } from 'graphql-request';

export const CREATE_UNIT_MUTATION = gql`
mutation CreateUnit($input: CreateUnitInput!) {
  createUnit(input: $input) {
    status
    message
    tap
    unit {
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

export const UPDATE_UNIT_MUTATION = gql`
mutation UpdateUnit($input: UpdateUnitInput!) {
  updateUnit(input: $input) {
    status
    message
    tap
    unit {
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

export const DELETE_UNIT_MUTATION = gql`
mutation DeleteUnit($input: DeleteUnitInput!) {
  deleteUnit(input: $input) {
    status
    message
    tap
  }
}`;
