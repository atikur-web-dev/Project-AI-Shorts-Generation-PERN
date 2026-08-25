// Frontend/src/services/orderService.ts
import api from "./api";

export interface CreateOrderResponse {
  orderId: string;
  amount: number;
  paymentURL?: string;
  message?: string;
}

export const orderService = {
  createOrder: async (subscriptionId: string) => {
    const response = await api.post("/orders", {
      subscriptionId,
    });

    return response.data as {
      success: boolean;
      message?: string;
      data?: CreateOrderResponse;
    };
  },
};
