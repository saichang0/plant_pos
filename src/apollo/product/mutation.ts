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
      ageMonths
      stockQuantity
      costPrice
      salePrice
      isSpecialOffer
      isActive
      createdBy
      deletedBy
      createdAt
      updatedAt
      deletedAt
      isFavorite
      isPopular
    }
  }
}`;

export const UPDATE_PRODUCT_STOCK_MUTATION = gql`
mutation UpdateProduct($id: ID!, $input: ProductInput!) {
  updateProduct(id: $id, input: $input) {
    status
    message
    data {
      id
      stockQuantity
    }
  }
}`;
