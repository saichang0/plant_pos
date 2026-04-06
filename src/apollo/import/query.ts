import { gql } from 'graphql-request';

export const GET_PURCHASE_ORDERS_QUERY = gql`
query GetPurchaseOrders {
  getPurchaseOrders {
    status
    message
    purchaseOrders {
      id
      supplierId
      userId
      orderDate
      totalPrice
      status
      supplier {
        id
        name
        phoneNumber
        email
        address
      }
      user {
        id
        firstName
        lastName
      }
      purchaseOrderDetails {
        id
        orderId
        productId
        quantity
        product {
          id
          name
          salePrice
          costPrice
        }
      }
      stockReceptions {
        id
        receptionDate
        totalActualPrice
      }
    }
  }
}`;

export const GET_PURCHASE_ORDER_QUERY = gql`
query GetPurchaseOrder($id: ID!) {
  getPurchaseOrder(id: $id) {
    status
    message
    purchaseOrder {
      id
      supplierId
      userId
      orderDate
      totalPrice
      status
      supplier {
        id
        name
        phoneNumber
        email
        address
      }
      user {
        id
        firstName
        lastName
      }
      purchaseOrderDetails {
        id
        orderId
        productId
        quantity
        product {
          id
          name
          salePrice
          costPrice
        }
      }
      stockReceptions {
        id
        receptionDate
        totalActualPrice
      }
    }
  }
}`;

export const GET_IMPORTS_QUERY = gql`
query GetStockReceptions {
  getStockReceptions {
    status
    message
    stockReceptions {
      id
      purchaseOrderId
      userId
      receptionDate
      totalActualPrice
      purchaseOrder {
        id
        supplierId
        orderDate
        totalPrice
        status
        supplier {
          id
          name
        }
      }
      user {
        id
        firstName
        lastName
      }
      stockReceptionDetails {
        id
        receptionId
        productId
        quantityReceived
        actualCostPrice
        status
        product {
          id
          name
          imageUrl
          salePrice
        }
      }
    }
  }
}`;

export const GET_IMPORT_QUERY = gql`
query GetStockReception($id: ID!) {
  getStockReception(id: $id) {
    status
    message
    stockReception {
      id
      purchaseOrderId
      userId
      receptionDate
      totalActualPrice
      purchaseOrder {
        id
        supplierId
        orderDate
        totalPrice
        status
        supplier {
          id
          name
        }
      }
      user {
        id
        firstName
        lastName
      }
      stockReceptionDetails {
        id
        receptionId
        productId
        quantityReceived
        actualCostPrice
        status
        product {
          id
          name
        }
      }
    }
  }
}`;
