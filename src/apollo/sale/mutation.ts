import { gql } from 'graphql-request';

export const CREATE_FULL_SALE_MUTATION = gql`
mutation CreateFullSale($input: CreateFullSaleInput!) {
  createFullSale(input: $input) {
    status
    message
    tap
    sale {
      id
      totalAmount
      taxAmount
      discountAmount
      status
      customerName
      saleDate
      saleDetails {
        id
        productId
        quantity
        weightGrams
        unitPrice
        totalPrice
      }
    }
  }
}`;

export const UPDATE_SALE_MUTATION = gql`
mutation UpdateSale($input: UpdateSaleInput!) {
  updateSale(input: $input) {
    status
    message
    tap
    sale {
      id
      status
      totalAmount
    }
  }
}`;

export const DELETE_SALE_MUTATION = gql`
mutation DeleteSale($input: DeleteSaleInput!) {
  deleteSale(input: $input) {
    status
    message
    tap
  }
}`;
