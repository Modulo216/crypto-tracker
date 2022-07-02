import axiosClient from "../axios";

export function refreshTaxes() {
  return axiosClient.get('/taxes');
}