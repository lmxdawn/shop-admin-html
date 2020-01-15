/**
 * Created by lk on 17/6/4.
 */
import axios from "../../utils/axios";

// 权限管理

// 获取列表
export function goodCategoryList(query) {
    return axios({
        url: "/admin/good/category/index",
        method: "get",
        params: query
    });
}

// 保存
export function goodCategorySave(data, formName, method = "post") {
    let url =
        formName !== "edit"
            ? "/admin/good/category/save"
            : "/admin/good/category/edit";
    return axios({
        url: url,
        method: method,
        data: data
    });
}

// 删除
export function goodCategoryDelete(data) {
    return axios({
        url: "/admin/good/category/delete",
        method: "post",
        data: data
    });
}
