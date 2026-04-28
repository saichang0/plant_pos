import { gql } from 'graphql-request';

export const CREATE_PRODUCT_MUTATION = gql`
mutation CreateProduct($input: ProductInput!) {
  createProduct(input: $input) {
    status
    message
    tap
    data {
      id
      categoryId
      name
      imageUrl
      description
      size
      unit {
        id
        name
        weightInGrams
      }
      weightPerUnit
      ageMonths
      stockQuantity
      stockWeight
      costPrice
      salePrice
      pricePerHalfBag
      pricePer12Kg
      pricePerKg
      discount
      isSpecialOffer
      isActive
      isPopular
      createdBy
      createdAt
      updatedAt
    }
  }
}`;

export const UPDATE_PRODUCT_MUTATION = gql`
mutation UpdateProduct($id: ID!, $input: ProductInput!) {
  updateProduct(id: $id, input: $input) {
    status
    message
    tap
    data {
      id
      categoryId
      name
      imageUrl
      description
      size
      unit {
        id
        name
        weightInGrams
      }
      weightPerUnit
      ageMonths
      stockQuantity
      stockWeight
      costPrice
      salePrice
      pricePerHalfBag
      pricePer12Kg
      pricePerKg
      discount
      isSpecialOffer
      isActive
      isPopular
      createdBy
      createdAt
      updatedAt
    }
  }
}`;

export const DELETE_PRODUCT_MUTATION = gql`
mutation DeleteProduct($id: ID!) {
  deleteProduct(id: $id) {
    status
    message
    tap
  }
}`;
