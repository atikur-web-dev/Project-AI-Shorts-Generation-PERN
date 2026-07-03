// Backend/src/lib/sslCommerz.ts
import SSLCommerzPayment from "sslcommerz-lts";
import { config } from "../config/index.js";

const store_id = config.SSL_STORE_ID;
const store_passwd = config.SSL_STORE_PASSWORD;
const is_live = config.SSL_IS_LIVE;

export const initSSLCommerz = () => {
  return new SSLCommerzPayment(store_id, store_passwd, is_live);
};


export const getPaymentData = (order: any, req: any) => {
  return {
    total_amount: order.amount,
    currency: "BDT",
    tran_id: order.id, 

    success_url: config.SSL_SUCCESS_URL,
    fail_url: config.SSL_FAIL_URL,
    cancel_url: config.SSL_CANCEL_URL,
    ipn_url: config.SSL_IPN_URL,

    shipping_method: "None",
    product_name: order.subscription?.name || "Digital Subscription",
    product_category: "Digital",
    product_profile: "digital-goods",

    cus_name: order.user?.name || "Customer",
    cus_email: order.user?.email || "customer@example.com",
    cus_add1: "Dhaka",
    cus_add2: "Dhaka",
    cus_city: "Dhaka",
    cus_state: "Dhaka",
    cus_postcode: "1000",
    cus_country: "Bangladesh",
    cus_phone: "01711111111",
    cus_fax: "01711111111",

    ship_name: order.user?.name || "Customer",
    ship_add1: "Dhaka",
    ship_add2: "Dhaka",
    ship_city: "Dhaka",
    ship_state: "Dhaka",
    ship_postcode: "1000",
    ship_country: "Bangladesh",
  };
};
