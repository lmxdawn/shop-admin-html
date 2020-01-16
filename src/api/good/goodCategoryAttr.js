/**
 * Created by lk on 17/6/4.
 */
import axios from "../../utils/axios";

// 列表
export function goodCategoryAttrList(query) {
    return axios({
        url: "/admin/good/category_attr/index",
        method: "get",
        params: query
    });
}

// 保存
export function goodCategoryAttrSave(data, formName, method = "post") {
    var url =
        formName === "add"
            ? "/admin/good/category_attr/save"
            : "/admin/good/category_attr/edit";
    return axios({
        url: url,
        method: method,
        data: data
    });
}

// 删除
export function goodCategoryAttrDelete(data) {
    return axios({
        url: "/admin/good/category_attr/delete",
        method: "post",
        data: data
    });
}
