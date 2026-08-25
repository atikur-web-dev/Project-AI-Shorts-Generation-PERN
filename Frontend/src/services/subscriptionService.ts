// Frontend/src/services/subscriptionService.ts
import api from "./api";
import { ApiResponse } from "../types";

export interface Subscription {
  id: string;
  name: string;
  price: number;
  credits: number;
  createdAt: string;
  updatedAt: string;
}

export const subscriptionService = {
  getSubscriptions: async (): Promise<ApiResponse<Subscription[]>> => {
    const response = await api.get("/subscriptions");

    return response.data;
  },
};