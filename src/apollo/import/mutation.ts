import { gql } from 'graphql-request';

export const CREATE_PURCHASE_ORDER_MUTATION = gql`
mutation CreatePurchaseOrder($input: CreatePurchaseOrderInput!) {
  createPurchaseOrder(input: $input) {
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
      }
      purchaseOrderDetails {
        id
        productId
        quantity
        product {
          id
          name
          costPrice
        }
      }
    }
  }
}`;

export const UPDATE_PURCHASE_ORDER_MUTATION = gql`
mutation UpdatePurchaseOrder($input: UpdatePurchaseOrderInput!) {
  updatePurchaseOrder(input: $input) {
    status
    message
    purchaseOrder {
      id
      totalPrice
      status
    }
  }
}`;

export const DELETE_PURCHASE_ORDER_MUTATION = gql`
mutation DeletePurchaseOrder($input: DeletePurchaseOrderInput!) {
  deletePurchaseOrder(input: $input) {
    status
    message
  }
}`;

export const CONFIRM_PURCHASE_ORDER_MUTATION = gql`
mutation ConfirmPurchaseOrder($input: ConfirmPurchaseOrderInput!) {
  confirmPurchaseOrder(input: $input) {
    status
    message
    stockReception {
      id
      purchaseOrderId
      receptionDate
      totalActualPrice
      stockReceptionDetails {
        id
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

export const UPDATE_STOCK_DETAIL_MUTATION = gql`
mutation UpdateStockReceptionDetail($input: UpdateStockReceptionDetailInput!) {
  updateStockReceptionDetail(input: $input) {
    status
    message
    stockReceptionDetail {
      id
      quantityReceived
    }
  }
}`;

export const DELETE_STOCK_DETAIL_MUTATION = gql`
mutation DeleteStockReceptionDetail($input: DeleteStockReceptionDetailInput!) {
  deleteStockReceptionDetail(input: $input) {
    status
    message
  }
}`;

export const CREATE_IMPORT_MUTATION = gql`
mutation CreateStockReception($input: CreateStockReceptionInput!) {
  createStockReception(input: $input) {
    status
    message
    stockReception {
      id
      purchaseOrderId
      userId
      receptionDate
      totalActualPrice
    }
  }
}`;

export const CREATE_IMPORT_DETAIL_MUTATION = gql`
mutation CreateStockReceptionDetail($input: CreateStockReceptionDetailInput!) {
  createStockReceptionDetail(input: $input) {
    status
    message
    stockReceptionDetail {
      id
      receptionId
      productId
      quantityReceived
      actualCostPrice
      status
    }
  }
}`;
