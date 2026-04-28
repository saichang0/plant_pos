import { gql } from 'graphql-request';

export const GET_PRODUCTS_QUERY = gql`
query Products($keyword: String, $paginate: PaginationInput, $filter: FilterInputProduct) {
  products(keyword: $keyword, paginate: $paginate, filter: $filter) {
    status
    message
    tap
    total
    data {
      id
      categoryId
      category {
        id
        name
      }
      name
      imageUrl
      description
      size
      ageMonths
      unit {
        id
        name
        weightInGrams
      }
      weightPerUnit

      stockQuantity
      stockWeight
      costPrice
      salePrice
      pricePerHalfBag
      pricePer12Kg
      pricePerKg
      isPopular
      isSpecialOffer
      discount
      isActive
      createdBy
      deletedBy
      createdAt
      updatedAt
      isFavorite
    }
  }
}`;

export const GET_PRODUCT_QUERY = gql`
query Product($where: entityInput) {
  product(where: $where) {
    status
    message
    tap
    data {
      id
      categoryId
      category {
        id
        name
      }
      name
      imageUrl
      description
      size
      ageMonths
      unit {
        id
        name
        weightInGrams
      }
      weightPerUnit

      stockQuantity
      stockWeight
      costPrice
      salePrice
      pricePerHalfBag
      pricePer12Kg
      pricePerKg
      isPopular
      isSpecialOffer
      discount
      isActive
      createdBy
      deletedBy
      createdAt
      updatedAt
      isFavorite
    }
  }
}`;
