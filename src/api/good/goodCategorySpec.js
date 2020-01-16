/**
 * Created by lk on 17/6/4.
 */
import axios from "../../utils/axios";

// 列表
export function goodCategorySpecList(query) {
    return axios({
        url: "/admin/good/category_spec/index",
        method: "get",
        params: query
    });
}

// 保存
export function goodCategorySpecSave(data, formName, method = "post") {
    var url =
        formName === "add"
            ? "/admin/good/category_spec/save"
            : "/admin/good/category_spec/edit";
    return axios({
        url: url,
        method: method,
        data: data
    });
}

// 删除
export function goodCategorySpecDelete(data) {
    return axios({
        url: "/admin/good/category_spec/delete",
        method: "post",
        data: data
    });
}
