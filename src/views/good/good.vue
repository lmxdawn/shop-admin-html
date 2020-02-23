<template>

    <div class="app-container">
        <el-form :inline="true" :model="query" class="query-form" size="mini">
            <el-form-item class="query-form-item" label="分类" prop="category_id">
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
            :close-on-click-modal="false"
            width="85%"
            top="5vh"
        >
            <el-form :model="formData" :rules="formRules" ref="dataForm" label-width="100px" v-loading="readLoading">
                <el-tabs v-model="tabName" type="card">
                    <el-tab-pane label="通用信息" name="first">
                        <el-form-item label="状态：" prop="status">
                            <el-radio-group v-model="formData.status">
                                <el-radio :label="1">上架</el-radio>
                                <el-radio :label="0">下架</el-radio>
                            </el-radio-group>
                        </el-form-item>
                        <el-form-item label="分类：" prop="category_id">
                            <el-cascader @change="categoryChange" style="width: 400px;" v-model="formData.category_id" :options="categoryList" size="medium"></el-cascader>
                        </el-form-item>
                        <el-form-item label="名称：" prop="good_name">
                            <el-input v-model="formData.good_name" auto-complete="off" />
                        </el-form-item>
                        <el-form-item label="简介：" prop="good_remark">
                            <el-input v-model="formData.good_remark" auto-complete="off" />
                        </el-form-item>
                        <el-form-item label="售价：" prop="shop_price">
                            <el-input v-model="formData.shop_price" auto-complete="off" />
                        </el-form-item>
                        <el-form-item label="市场价：" prop="market_price">
                            <el-input v-model="formData.market_price" auto-complete="off" />
                        </el-form-item>
                        <el-form-item label="成本价：" prop="cost_price">
                            <el-input v-model="formData.cost_price" auto-complete="off" />
                        </el-form-item>
                        <el-form-item label="商品重量：" prop="weight">
                            <el-input v-model="formData.weight" auto-complete="off" />
                        </el-form-item>
                        <el-form-item label="商品体积：" prop="volume">
                            <el-input v-model="formData.volume" auto-complete="off" />
                            <span class="text-warning">立方米（m³为单位）</span>
                        </el-form-item>
                        <el-form-item label="总库存：" prop="store_count">
                            <el-input v-model="formData.store_count" auto-complete="off" />
                            <span class="text-warning">如果商品没有sku，则用总库存</span>
                        </el-form-item>
                        <el-form-item label="虚拟销量：" prop="virtual_sales_sum">
                            <el-input v-model="formData.virtual_sales_sum" auto-complete="off" />
                            <span class="text-warning">销售量：虚拟销售量+真实销售量</span>
                        </el-form-item>
                        <el-form-item label="主图：" prop="original_img">
                            <div class="block" style="width: 100%;display: inline-block;">
                                <el-image v-if="formData.original_img_url" :src="formData.original_img_url" :preview-src-list="[formData.original_img_url]" style="width: 100px;height: 100px;">
                                    <div slot="error" class="image-slot">
                                        <i class="el-icon-picture-outline"></i>
                                    </div>
                                </el-image>
                                <upload ext="png,jpg,jpeg" @on-select="onSelectOriginalImg"></upload>
                            </div>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品信息" name="second">
                        <el-form-item label="图片列表：" prop="imgs">
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
                        <el-form-item label="详情：" prop="details" v-if="formVisible">
                            <tinymce style="display: inline-block;width: 97%;" :height="300" v-model="formData.details"/>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品规格" name="third">
                        <el-card shadow="never" :body-style="{padding: '10px'}">
                            <div v-for="(item, index) in specList" :key="index">
                                <div class="spec-item" v-if="item.value.length > 0">
                                    {{item.name}}：
                                    <el-checkbox-group v-model="spec[index].value" style="display: inline-block;">
                                        <el-checkbox v-for="(valueItem, valueIndex) in item.value" :key="valueIndex" :label="valueItem"></el-checkbox>
                                    </el-checkbox-group>
                                    <div class="spec-item" style="display: inline-block;margin-left: 10px;" v-if="item.is_add === 1">
                                        <el-input size="mini" style="width: 150px;" v-model="specValueList[index]" auto-complete="off" />
                                        <el-button size="mini" type="text" style="margin-left: 5px;" @click="specAdd(index)">新增</el-button>
                                    </div>
                                </div>
                                <el-divider></el-divider>
                            </div>
                            <div class="spec-item">
                                <el-button size="mini" type="primary" @click="createGoodSpec(index)">重新生成SKU列表</el-button>
                            </div>
                        </el-card>
                        <el-card style="margin-top: 10px;" shadow="never" :body-style="{padding: '10px'}">
                            <el-table
                                    :data="formData.good_spec_list"
                                    style="width: 100%;">
                                <el-table-column
                                        v-for="(item, index) in formData.good_spec_head_list"
                                        :key="index"
                                        :label="item.name">
                                    <template slot-scope="scope">
                                        {{ scope.row.spec_list[index] }}
                                    </template>
                                </el-table-column>
                                <el-table-column
                                        label="价格">
                                    <template slot-scope="scope">
                                        <el-input size="mini" v-model="scope.row.price" auto-complete="off" />
                                    </template>
                                </el-table-column>
                                <el-table-column
                                        label="成本价格">
                                    <template slot-scope="scope">
                                        <el-input size="mini" v-model="scope.row.cost_price" auto-complete="off" />
                                    </template>
                                </el-table-column>
                                <el-table-column
                                        label="库存">
                                    <template slot-scope="scope">
                                        <el-input size="mini" v-model="scope.row.stock" auto-complete="off" />
                                    </template>
                                </el-table-column>
                            </el-table>
                        </el-card>
                    </el-tab-pane>
                    <el-tab-pane label="商品属性" name="fourth">
                        <el-form-item v-for="(item, index) in attrList" :key="item.id" :label="item.name + '：'">
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
    goodRead,
    categoryList,
    attrList,
    specList,
    goodSave,
    goodDelete
} from "../../api/good/good";
import Upload from "../../components/File/Upload.vue";
import Tinymce from "../../components/Tinymce/index.vue";
import descartes from "../../utils/dikaerji";
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
    attr: [],
    attr_list: {},
    spec: [],
    spec_list: {},
    good_spec_list: [],
    good_spec_head_list: [],
    sku_refresh: false
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
            readQuery: {
                good_id: ""
            },
            readLoading: false,
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
            formData: {},
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
                market_price: [
                    {
                        required: true,
                        message: "请输入商品市场价",
                        trigger: "blur"
                    }
                ],
                cost_price: [
                    {
                        required: true,
                        message: "请输入商品成本价",
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
            attrListLoading: false,
            spec: [],
            specList: [],
            specValueList: [],
            specListLoading: false
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
        createGoodSpec() {
            this.$confirm(
                "刷新列表将导致sku信息重新生成，是否要刷新?",
                "提示",
                {
                    type: "warning"
                }
            )
                .then(() => {
                    let newList = [];
                    let spec = this.spec;
                    this.formData.spec = JSON.parse(JSON.stringify(spec));
                    this.formData.good_spec_head_list = [];
                    this.formData.sku_refresh = true;
                    // console.log(spec);
                    for (let item of spec) {
                        let tempNewList = [];
                        for (let valueItem of item.value) {
                            let tempItem = {
                                id: item.id,
                                name: item.name,
                                value: valueItem
                            };
                            tempNewList.push(tempItem);
                        }
                        if (tempNewList.length > 0) {
                            newList.push(tempNewList);
                            this.formData.good_spec_head_list.push({
                                id: item.id,
                                name: item.name
                            });
                        }
                    }
                    if (newList.length > 0) {
                        const descartesList = descartes(newList);
                        // console.log(descartesList);
                        let good_spec_list = [];
                        for (let item of descartesList) {
                            let specList = [];
                            for (let specIndex in item) {
                                specList.push(item[specIndex].value);
                            }
                            let tempItem = {
                                price: "",
                                cost_price: "",
                                stock: "",
                                spec_list: specList
                            };
                            good_spec_list.push(tempItem);
                        }
                        this.formData.good_spec_list = good_spec_list;
                    }
                })
                .catch(() => {});
        },
        categoryChange() {
            this.getAttrList();
            this.getSpecList();
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
            attrList({ category_id: this.formData.category_id })
                .then(response => {
                    this.attrListLoading = false;
                    const attrList = response.data.list || [];
                    for (let i = 0; i < attrList.length; i++) {
                        let value =
                            this.formData.attr_list[attrList[i].id] || "";
                        this.formData.attr.push({
                            id: attrList[i].id,
                            value: value
                        });
                    }
                    this.attrList = attrList;
                })
                .catch(e => {
                    console.log(e);
                });
        },
        getSpecList() {
            this.specListLoading = true;
            specList({ category_id: this.formData.category_id })
                .then(response => {
                    this.specListLoading = false;
                    const specList = response.data.list || [];
                    let tempList = [];
                    for (let i = 0; i < specList.length; i++) {
                        let item = specList[i];
                        let defaultItem = [];
                        let value =
                            this.formData.spec_list[item.id] || defaultItem;
                        this.formData.spec.push({
                            id: specList[i].id,
                            name: specList[i].name,
                            value: value
                        });
                        this.spec.push({
                            id: specList[i].id,
                            name: specList[i].name,
                            value: value
                        });
                        this.specValueList.push("");
                        for (let ii in value) {
                            if (
                                value[ii] &&
                                item.value.indexOf(value[ii]) === -1
                            ) {
                                item.value.unshift(value[ii]);
                            }
                        }
                        tempList.push(item);
                    }
                    this.specList = tempList;
                })
                .catch(e => {
                    console.log(e);
                });
        },
        specAdd(index) {
            let value = this.specValueList[index];
            if (value) {
                if (this.specList[index].value.indexOf(value) !== -1) {
                    this.$message.warning("规格不能重复");
                    return;
                }
                this.specValueList[index] = "";
                this.specList[index].value.push(value);
            }
        },
        onSelectOriginalImg(filePath, filePathUrl) {
            this.formData.original_img_url = filePathUrl;
            this.formData.original_img = filePath;
            console.log(this.formData.attr);
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
        getRead() {
            this.readLoading = true;
            goodRead(this.readQuery)
                .then(response => {
                    this.readLoading = false;
                    if (response.code) {
                        this.$message.error(response.message);
                        return false;
                    }
                    this.formData = JSON.parse(JSON.stringify(response.data));
                    this.formData.sku_refresh = false;
                    this.getAttrList();
                    this.getSpecList();
                })
                .catch(() => {
                    this.readLoading = false;
                });
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
            this.formVisible = false;
            // 清空表单
            this.resetForm();
            setTimeout(() => {
                this.tabName = "first";
            }, 300);
            return true;
        },
        // 显示表单
        handleForm(index, row) {
            this.spec = [];
            this.attrList = [];
            this.specList = [];
            this.specValueList = [];
            this.goodSpeHeadList = [];
            if (row !== null) {
                // this.formData = Object.assign({}, row);
                this.readQuery.good_id = row.good_id;
                this.getRead();
            } else {
                this.formData = JSON.parse(JSON.stringify(formJson));
            }
            this.formName = "add";
            if (index !== null) {
                this.index = index;
                this.formName = "edit";
            }
            this.formVisible = true;
        },
        formSubmit() {
            this.$refs["dataForm"].validate(valid => {
                if (valid) {
                    this.formLoading = true;
                    const data = JSON.parse(JSON.stringify(this.formData));
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
.spec-item {
    font-size: 12px;
    line-height: 25px;
}
.el-divider--horizontal {
    margin: 10px 0 !important;
}
</style>
