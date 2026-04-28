import { gql } from "graphql-request";

export const GET_DELIVERIES_QUERY = gql`
  query GetDeliveries {
  getDeliveries {
    status
    message
    tap
    deliveries {
      id
      saleId
      deliveryService
      branch
      trackingNumber
      status
      shippedAt
      sale {
        id
        customerId
        userId
        saleDate
        totalAmount
        taxAmount
        discountAmount
        status
        customerName
        note
        customerAddressId
        updatedAt
      }
    }
  }
}
`;
