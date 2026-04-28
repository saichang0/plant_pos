import { gql } from 'graphql-request';

export const CREATE_CATEGORY_MUTATION = gql`
mutation CreateCategory($input: CreateCategoryInput!) {
  createCategory(input: $input) {
    status
    message
    tap
    category {
      id
      name
      createdBy
      createdAt
      creator {
        id
        firstName
        lastName
      }
    }
  }
}`;

export const UPDATE_CATEGORY_MUTATION = gql`
mutation UpdateCategory($input: UpdateCategoryInput!) {
  updateCategory(input: $input) {
    status
    message
    tap
    category {
      id
      name
      createdBy
      createdAt
      creator {
        id
        firstName
        lastName
      }
    }
  }
}`;

export const DELETE_CATEGORY_MUTATION = gql`
mutation DeleteCategory($input: DeleteCategoryInput!) {
  deleteCategory(input: $input) {
    status
    message
    tap
  }
}`;
