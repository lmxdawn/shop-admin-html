<template>

    <div class="app-container">
        <el-form :inline="true" :model="query" class="query-form" size="mini">
            <el-form-item label="分类" prop="category_id">
                <el-cascader style="width: 300px;" v-model="query.category_id" :options="categoryList" :props="{ checkStrictly: true }" size="mini"></el-cascader>
            </el-form-item>
            <el-form-item>
                <el-button-group>
                    <el-button type="primary" icon="el-icon-refresh" @click="onReset" />
                    <el-button type="primary" icon="search" @click="onSubmit">查询</el-button>
                    <el-button type="primary" @click.native="handleForm(null,null)">新增</el-button>
                </el-button-group>
            </el-form-item>
        </el-form>
        <el-table
            v-loading="loading"
            :data="list"
            style="width: 100%;"
        >
            <el-table-column
                label="ID"
                prop="good_id"
            />
            <el-table-column
                label="名称"
                prop="good_name"
            />
            <el-table-column
                label="售价"
                prop="shop_price"
            />
            <el-table-column
                label="市场价"
                prop="market_price"
            />
            <el-table-column
                label="成本价"
                prop="cost_price"
            />
            <el-table-column
                label="状态"
            >
                <template slot-scope="scope">
                    <el-tag :type="scope.row.status | statusFilterType">{{ scope.row.status | statusFilterName }}</el-tag>
                </template>
            </el-table-column>
            <el-table-column
                label="操作"
            >
                <template slot-scope="scope">
                    <el-button type="text" size="small" @click.native="handleForm(scope.$index, scope.row)">编辑
                    </el-button>
                    <el-button type="text" size="small" @click.native="handleDel(scope.$index, scope.row)">删除
                    </el-button>
                </template>
            </el-table-column>
        </el-table>

        <el-pagination
            :page-size="query.limit"
            layout="prev, pager, next"
            :total="total"
            @current-change="handleCurrentChange"
        />

        <!--表单-->
        <el-dialog
            :title="formMap[formName]"
            :visible.sync="formVisible"
            :before-close="hideForm"
            width="85%"
            top="5vh"
        >
            <el-form :model="formData" :rules="formRules" ref="dataForm">
                <el-tabs v-model="tabName">
                    <el-tab-pane label="通用信息" name="first">
                        <el-form-item label="状态" prop="status">
                            <el-radio-group v-model="formData.status">
                                <el-radio :label="1">上架</el-radio>
                                <el-radio :label="0">下架</el-radio>
                            </el-radio-group>
                        </el-form-item>
                        <el-form-item label="分类" prop="category_id">
                            <el-cascader @change="categoryChange" style="width: 400px;" v-model="formData.category_id" :options="categoryList" size="medium"></el-cascader>
                        </el-form-item>
                        <el-form-item label="名称" prop="good_name">
                            <el-input v-model="formData.good_name" auto-complete="off" />
                        </el-form-item>
                        <el-form-item label="简介" prop="good_remark">
                            <el-input v-model="formData.good_remark" auto-complete="off" />
                        </el-form-item>
                        <el-form-item label="售价" prop="shop_price">
                            <el-input v-model="formData.shop_price" auto-complete="off" />
                        </el-form-item>
                        <el-form-item label="市场价" prop="market_price">
                            <el-input v-model="formData.market_price" auto-complete="off" />
                        </el-form-item>
                        <el-form-item label="成本价" prop="cost_price">
                            <el-input v-model="formData.cost_price" auto-complete="off" />
                        </el-form-item>
                        <el-form-item label="商品重量" prop="weight">
                            <el-input v-model="formData.weight" auto-complete="off" />
                        </el-form-item>
                        <el-form-item label="商品体积（m³为单位）" prop="volume">
                            <el-input v-model="formData.volume" auto-complete="off" />
                        </el-form-item>
                        <el-form-item label="虚拟销售量" prop="virtual_sales_sum">
                            <el-input v-model="formData.virtual_sales_sum" auto-complete="off" />
                        </el-form-item>
                        <el-form-item label="主图" prop="original_img">
                            <div class="block" style="width: 100%;display: inline-block;">
                                <el-image :src="formData.original_img_url" :preview-src-list="[formData.original_img_url]" style="width: 100px;height: 100px;">
                                    <div slot="error" class="image-slot">
                                        <i class="el-icon-picture-outline"></i>
                                    </div>
                                </el-image>
                                <upload ext="png,jpg,jpeg" @on-select="onSelectOriginalImg"></upload>
                            </div>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品信息" name="second">
                        <el-form-item label="图片列表" prop="imgs">
                            <div class="block" style="width: 100%;display: inline-block;">
                                <div v-for="(item, index) in formData.imgs_url" :key="index" style="display: inline-block;position: relative;">
                                    <el-image :src="item" :preview-src-list="formData.imgs_url" style="width: 100px;height: 100px;">
                                        <div slot="error" class="image-slot">
                                            <i class="el-icon-picture-outline"></i>
                                        </div>
                                    </el-image>
                                    <span class="image-delete" @click="onDeleteImgs(index)">×</span>
                                </div>
                                <upload ext="png,jpg,jpeg" @on-select="onSelectImgs"></upload>
                            </div>
                        </el-form-item>
                        <el-form-item label="详情" prop="details" v-if="formVisible">
                            <tinymce style="display: inline-block;width: 100%;" :height="300" v-model="formData.details"/>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品规格" name="third">商品规格</el-tab-pane>
                    <el-tab-pane label="商品属性" name="fourth">
                        <el-form-item v-for="(item, index) in attrList" :key="item.id" :label="item.name">
                            <el-select v-if="item.type === 1" v-model="formData.attr[index].value">
                                <el-option
                                    v-for="(valueItem, valueIndex) in item.value"
                                    :key="valueIndex"
                                    :label="valueItem"
                                    :value="valueItem">
                                </el-option>
                            </el-select>
                            <el-input v-else v-model="formData.attr[index].value" auto-complete="off" />
                        </el-form-item>
                    </el-tab-pane>
                </el-tabs>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="hideForm">取消</el-button>
                <el-button type="primary" :loading="formLoading" @click.native="formSubmit()">提交</el-button>
            </div>
        </el-dialog>
    </div>

</template>

<script>
import {
    goodList,
    categoryList,
    attrList,
    goodSave,
    goodDelete
} from "../../api/good/good";
import Upload from "../../components/File/Upload.vue";
import Tinymce from "../../components/Tinymce/index.vue";
const formJson = {
    good_id: "",
    category_id: "",
    good_name: "",
    good_remark: "",
    shop_price: "",
    market_price: "",
    cost_price: "",
    original_img: "",
    original_img_url: "",
    imgs: [],
    imgs_url: [],
    weight: "",
    volume: "",
    store_count: "",
    virtual_sales_sum: "",
    details: "",
    status: 1,
    attr: []
};
export default {
    components: {
        Upload,
        Tinymce
    },
    filters: {
        statusFilterType(status) {
            const statusMap = {
                0: "danger",
                1: "success"
            };
            return statusMap[status];
        },
        statusFilterName(status) {
            const statusMap = {
                0: "下架",
                1: "上架"
            };
            return statusMap[status];
        }
    },
    data() {
        return {
            tabName: "first",
            query: {
                category_id: "",
                page: 1,
                limit: 20
            },
            list: [],
            total: 0,
            loading: true,
            index: null,
            formName: null,
            formMap: {
                add: "新增",
                edit: "编辑"
            },
            formLoading: false,
            formVisible: false,
            formData: formJson,
            formRules: {
                category_id: [
                    {
                        required: true,
                        message: "请选择分类",
                        trigger: "change"
                    }
                ],
                good_name: [
                    {
                        required: true,
                        message: "请输入商品名称",
                        trigger: "blur"
                    }
                ],
                shop_price: [
                    {
                        required: true,
                        message: "请输入商品售价",
                        trigger: "blur"
                    }
                ],
                original_img: [
                    {
                        required: true,
                        message: "请上传商品主图",
                        trigger: "change"
                    }
                ],
                imgs: [
                    {
                        required: true,
                        message: "请上传一张商品图片",
                        trigger: "change"
                    }
                ]
            },
            deleteLoading: false,
            categoryList: [],
            attrList: [],
            attrListQuery: {
                category_id: ""
            },
            attrListLoading: false
        };
    },
    mounted() {},
    created() {
        // 将参数拷贝进查询对象
        const query = this.$route.query;
        this.query = Object.assign(this.query, query);
        this.query.limit = parseInt(this.query.limit);
        // 加载表格数据
        this.getList();
        // 加载分类列表
        this.getCategoryList();
    },
    methods: {
        categoryChange() {
            this.attrListQuery.category_id = this.formData.category_id;
            this.getAttrList();
        },
        getCategoryList() {
            categoryList()
                .then(response => {
                    this.categoryList = response.data.list || [];
                })
                .catch(() => {});
        },
        getAttrList() {
            this.attrListLoading = true;
            attrList(this.attrListQuery)
                .then(response => {
                    this.attrListLoading = false;
                    const attrList = response.data.list || [];
                    for (let _ in attrList) {
                        this.formData.attr.push({ value: "" });
                    }
                    this.attrList = attrList;
                })
                .catch(() => {});
        },
        onSelectOriginalImg(filePath, filePathUrl) {
            this.formData.original_img_url = filePathUrl;
            this.formData.original_img = filePath;
        },
        onSelectImgs(filePath, filePathUrl) {
            this.formData.imgs_url.push(filePathUrl);
            this.formData.imgs.push(filePath);
        },
        onDeleteImgs(index) {
            this.formData.imgs_url.splice(index, 1);
            this.formData.imgs.splice(index, 1);
        },
        onReset() {
            this.$router.push({
                path: ""
            });
            this.query = {
                category_id: "",
                page: 1,
                limit: 20
            };
            // 加载表格数据
            this.getList();
            // 加载分类列表
            this.getCategoryList();
        },
        onSubmit() {
            this.query.page = 1;
            this.$router.push({
                path: "",
                query: this.query
            });
            this.getList();
        },
        handleCurrentChange(val) {
            this.query.page = val;
            this.getList();
        },
        getList() {
            this.loading = true;
            goodList(this.query)
                .then(response => {
                    this.loading = false;
                    this.list = response.data.list || [];
                    this.total = response.data.total || 0;
                })
                .catch(() => {
                    this.loading = false;
                    this.list = [];
                    this.total = 0;
                });
        },
        // 刷新表单
        resetForm() {
            if (this.$refs["dataForm"]) {
                // 清空验证信息表单
                this.$refs["dataForm"].clearValidate();
                // 刷新表单
                this.$refs["dataForm"].resetFields();
            }
        },
        // 隐藏表单
        hideForm() {
            // 更改值
            this.formVisible = !this.formVisible;
            formJson.imgs = [];
            formJson.imgs_url = [];
            formJson.attr = [];
            this.formData = JSON.parse(JSON.stringify(formJson));
            // 清空表单
            this.resetForm();
            setTimeout(() => {
                this.tabName = "first";
            }, 300);
            return true;
        },
        // 显示表单
        handleForm(index, row) {
            this.formVisible = true;
            if (row !== null) {
                this.formData = Object.assign({}, row);
            }
            this.formName = "add";
            if (index !== null) {
                this.index = index;
                this.formName = "edit";
            }
        },
        formSubmit() {
            this.$refs["dataForm"].validate(valid => {
                if (valid) {
                    this.formLoading = true;
                    const data = Object.assign({}, this.formData);
                    goodSave(data, this.formName)
                        .then(response => {
                            this.formLoading = false;
                            if (response.code) {
                                this.$message.error(response.message);
                                return false;
                            }
                            this.$message.success("操作成功");
                            if (this.formName === "add") {
                                // 向头部添加数据
                                if (response.data) {
                                    const temp = Object.assign(
                                        data,
                                        response.data
                                    );
                                    this.list.unshift(temp);
                                }
                            } else {
                                this.list.splice(this.index, 1, data);
                            }
                            // 刷新表单
                            this.hideForm();
                        })
                        .catch(() => {
                            this.formLoading = false;
                        });
                }
            });
        },
        // 删除
        handleDel(index, row) {
            if (row.good_id) {
                this.$confirm("确认删除该记录吗?", "提示", {
                    type: "warning"
                })
                    .then(() => {
                        const para = { good_id: row.good_id };
                        this.deleteLoading = true;
                        goodDelete(para)
                            .then(() => {
                                this.deleteLoading = false;
                                this.$message.success("操作成功");
                                // 刷新数据
                                this.list.splice(index, 1);
                            })
                            .catch(() => {
                                this.deleteLoading = false;
                            });
                    })
                    .catch(() => {
                        this.$message.info("取消删除");
                    });
            }
        }
    }
};
</script>

<style type="text/scss" lang="scss">
.el-image {
    margin-right: 5px;
    position: relative;
}
.image-slot {
    font-size: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    background: #f5f7fa;
    color: #909399;
}
.image-delete {
    position: absolute;
    right: 5px;
    top: 0;
    cursor: pointer;
    width: 15px;
    height: 15px;
    line-height: 15px;
    text-align: center;
    font-size: 18px;
    border-radius: 50%;
    background-color: #9e9e9e;
}
.el-cascader-menu__wrap {
    height: 500px !important;
}
</style>
