import { gql } from 'graphql-request';

export const GET_DASHBOARD_QUERY = gql`
query GetDashboard {
  getDashboard {
    status
    message
    data {
      todaySales
      todayOrders
      weekSales
      weekOrders
      monthSales
      monthOrders
      totalProducts
      lowStockCount
      pendingPurchaseOrders
      dailyStats {
        date
        totalSales
        orderCount
      }
      weeklyStats {
        date
        totalSales
        orderCount
      }
      topProducts {
        productId
        name
        imageUrl
        totalQuantity
        totalRevenue
      }
    }
  }
}`;
