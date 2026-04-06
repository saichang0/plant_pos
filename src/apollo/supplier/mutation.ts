import { gql } from 'graphql-request';

export const CREATE_SUPPLIER_MUTATION = gql`
mutation CreateSupplier($input: CreateSupplierInput!) {
  createSupplier(input: $input) {
    status
    message
    supplier {
      id
      name
      phoneNumber
      email
      address
      createdAt
      updatedAt
    }
  }
}`;

export const UPDATE_SUPPLIER_MUTATION = gql`
mutation UpdateSupplier($input: UpdateSupplierInput!) {
  updateSupplier(input: $input) {
    status
    message
    supplier {
      id
      name
      phoneNumber
      email
      address
      createdAt
      updatedAt
    }
  }
}`;

export const DELETE_SUPPLIER_MUTATION = gql`
mutation DeleteSupplier($input: DeleteSupplierInput!) {
  deleteSupplier(input: $input) {
    status
    message
  }
}`;
