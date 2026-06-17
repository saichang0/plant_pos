import { gql } from "graphql-request";

export const GET_DELIVERIES_QUERY = gql`
  query GetDeliveries($saleStatus: String) {
  getDeliveries(saleStatus: $saleStatus) {
    status
    message
    tap
    total
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
        code
        source
        customerId
        userId
        saleDate
        totalAmount
        totalPlant
        taxAmount
        discountAmount
        status
        customerName
        note
        customer {
          id
          firstName
          lastName
          phoneNumber
          email
        }
        customerAddress {
          id
          customerId
          province
          district
          village
          country
          isDefault
          shippingService
          createdAt
          updatedAt
        }
        confirmedAt
        updatedAt
        saleDetails {
          id
          saleId
          productId
          quantity
          unitId
          unit {
            name
            id
          }
          weightGrams
          unitPrice
          totalPrice
          note
          product {
            id
            name
            imageUrl
          }
        }
        customerAddressId
      }
    }
  }
}
`;
