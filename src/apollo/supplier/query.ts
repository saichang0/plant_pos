import { gql } from 'graphql-request';

export const GET_SUPPLIERS_QUERY = gql`
query GetSuppliers {
  getSuppliers {
    status
    message
    suppliers {
      id
      name
      phoneNumber
      email
      address
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

export const GET_SUPPLIER_QUERY = gql`
query GetSupplier($id: ID!) {
  getSupplier(id: $id) {
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
      purchaseOrders {
        id
        orderDate
        totalPrice
        status
      }
    }
  }
}`;
