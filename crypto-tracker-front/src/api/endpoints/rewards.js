import {axiosClient} from "../axios";

export function refreshRewards() {
  return axiosClient.get('/rewards');
}