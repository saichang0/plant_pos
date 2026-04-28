import { gql } from 'graphql-request';

export const GET_REPORT_QUERY = gql`
query GetReport($startDate: String, $endDate: String) {
  getReport(startDate: $startDate, endDate: $endDate) {
    status
    message
    data {
      profit {
        grossRevenue
        totalCost
        netProfit
        totalOrders
        profitMargin
      }
      topProducts {
        productId
        name
        imageUrl
        categoryName
        unitName
        totalQuantity
        totalRevenue
      }
      salesByCategory {
        categoryId
        categoryName
        totalRevenue
        totalOrders
        percentage
      }
      paymentBreakdown {
        paymentMethod
        currency
        totalAmount
        transactionCount
        percentage
      }
      orderStatus {
        status
        count
        totalAmount
        percentage
      }
      receipts {
        saleId
        saleDate
        customerName
        staffName
        items {
          productName
          quantity
          unitName
          weightGrams
          unitPrice
          totalPrice
        }
        subTotal
        taxAmount
        discountAmount
        totalAmount
        status
        payments {
          method
          currency
          amount
        }
      }
    }
  }
}`;
