import axios from "axios";
import axiosRetry from "axios-retry";
import logger from "./logger";

export const nimbusClient = axios.create({
  baseURL: "https://api.getnimbus.io",
});

axiosRetry(nimbusClient, {
  retries: 2,
  retryCondition: (err: any) => {
    return (
      axiosRetry.isNetworkOrIdempotentRequestError(err) ||
      err?.response?.status === 429
    );
  },
  retryDelay: axiosRetry.exponentialDelay,
  onMaxRetryTimesExceeded: (err: any, retryCount: number) => {
    logger.info("Max retry times for nimbus api exceeded");
  },
});
