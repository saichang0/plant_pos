import { gql } from 'graphql-request';

export const GET_CATEGORIES_QUERY = gql`
query GetCategories {
  getCategories {
    status
    message
    categories {
      id
      name
    }
  }
}`;
