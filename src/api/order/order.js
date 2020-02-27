/**
 * Created by lk on 17/6/4.
 */
import axios from "../../utils/axios";

// 列表
export function orderList(query) {
    return axios({
        url: "/admin/order/order/index",
        method: "get",
        params: query
    });
}

// 详情
export function orderRead(query) {
    return axios({
        url: "/admin/order/order/read",
        method: "get",
        params: query
    });
}

// 发货
export function orderPush(data) {
    return axios({
        url: "/admin/order/order/push",
        method: "post",
        data: data
    });
}
