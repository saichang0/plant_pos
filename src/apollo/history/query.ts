import { gql } from 'graphql-request';

export const STOCK_MOVEMENTS_QUERY = gql`
  query StockMovements($filter: HistoryFilter) {
    stockMovements(filter: $filter) {
      status
      message
      tap
      total
      data {
        id
        productId
        userId
        change
        quantityBefore
        quantityAfter
        reason
        referenceId
        referenceType
        note
        createdAt
        product {
          id
          name
          imageUrl
        }
        user {
          id
          firstName
          lastName
        }
      }
    }
  }
`;

export const SALES_HISTORY_QUERY = gql`
  query SalesHistory($filter: HistoryFilter, $status: String) {
    salesHistory(filter: $filter, status: $status) {
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
        totalPlant
        taxAmount
        discountAmount
        status
        customerName
        updatedAt
        customer {
          id
          firstName
          lastName
          phoneNumber
        }
        saleDetails {
          id
          productId
          quantity
          weightGrams
          unitPrice
          totalPrice
          product {
            id
            name
            imageUrl
          }
          unit {
            id
            name
          }
        }
        payments {
          id
          paymentMethod
          currency
          amount
        }
      }
    }
  }
`;
