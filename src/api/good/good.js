/**
 * Created by lk on 17/6/4.
 */
import axios from "../../utils/axios";

// 列表
export function goodList(query) {
    return axios({
        url: "/admin/good/good/index",
        method: "get",
        params: query
    });
}

// 详情
export function goodRead(query) {
    return axios({
        url: "/admin/good/good/read",
        method: "get",
        params: query
    });
}

// 分类列表
export function categoryList(query) {
    return axios({
        url: "/admin/good/good/categoryList",
        method: "get",
        params: query
    });
}

// 属性列表
export function attrList(query) {
    return axios({
        url: "/admin/good/good/attrList",
        method: "get",
        params: query
    });
}

// 规格列表
export function specList(query) {
    return axios({
        url: "/admin/good/good/specList",
        method: "get",
        params: query
    });
}

// 保存
export function goodSave(data, formName, method = "post") {
    var url =
        formName === "add" ? "/admin/good/good/save" : "/admin/good/good/edit";
    return axios({
        url: url,
        method: method,
        data: data
    });
}

// 删除
export function goodDelete(data) {
    return axios({
        url: "/admin/good/good/delete",
        method: "post",
        data: data
    });
}
