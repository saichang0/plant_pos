import { gql } from "graphql-request";

export const UPDATE_DELIVERY_MUTATION = gql`
  mutation UpdateDelivery($input: UpdateDeliveryInput!) {
    updateDelivery(input: $input) {
      status
      message
      tap
      delivery {
        id
        deliveryService
        branch
        trackingNumber
        status
        shippedAt
      }
    }
  }
`;
