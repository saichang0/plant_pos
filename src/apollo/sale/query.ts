import { gql } from 'graphql-request';

export const GET_SALES_QUERY = gql`
query GetSales($status: String, $limit: Int, $offset: Int) {
  getSales(status: $status, limit: $limit, offset: $offset) {
    status
    message
    tap
    total
    sales {
      id
      code
      source
      customerId
      userId
      saleDate
      totalAmount
      taxAmount
      discountAmount
      status
      customerName
      note
      updatedAt
      customer {
        id
        firstName
        lastName
        phoneNumber
        email
        profileImageUrl
        address
      }
      customerAddress {
        id
        province
        district
        village
        country
      }
      user {
        id
        firstName
        lastName
      }
      saleDetails {
        id
        productId
        quantity
        unit {
          id
          name
        }
        weightGrams
        unitPrice
        totalPrice
        note
        product {
          id
          name
          imageUrl
          unit {
            id
            name
          }

        }
      }
      payments {
        id
        paymentMethod
        currency
        amount
        slipImageUrl
        paidAt
      }
      deliveries {
        id
        deliveryService
        branch
        trackingNumber
        status
        shippedAt
      }
    }
  }
}`;

export const GET_SALE_QUERY = gql`
query GetSale($id: ID!) {
  getSale(id: $id) {
    status
    message
    tap
    sale {
      id
      code
      source
      customerId
      userId
      saleDate
      totalAmount
      taxAmount
      discountAmount
      status
      customerName
      note
      updatedAt
      saleDetails {
        id
        productId
        quantity
        unit {
          id
          name
        }
        weightGrams
        unitPrice
        totalPrice
        note
        product {
          id
          name
          imageUrl
          unit {
            id
            name
          }

        }
      }
      payments {
        id
        paymentMethod
        currency
        amount
        paidAt
      }
    }
  }
}`;
