import SSLCommerzPayment from "sslcommerz-lts";
import { config } from "../config/index.js";

const store_id = config.SSL_STORE_ID;
const store_passwd = config.SSL_STORE_PASSWORD;
const is_live = config.SSL_IS_LIVE;

export const initSSLCommerz = (data: any) => {
  return new SSLCommerzPayment(store_id, store_passwd, is_live);
};
