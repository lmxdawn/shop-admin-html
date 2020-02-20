<template>
    <div>
        <el-form :inline="true" :model="query" class="query-form" size="mini">
            <el-form-item>
                <el-button-group>
                    <el-button type="primary" icon="el-icon-refresh" @click="onReset"></el-button>
                    <el-button type="primary" icon="search" @click="onSubmit">查询</el-button>
                    <el-button type="primary" @click.native="handleForm(null,null)">新增</el-button>
                </el-button-group>
            </el-form-item>
        </el-form>

        <el-tree
            class="category-tree"
            :data="mergeList"
            :props="defaultProps"
            node-key="id"
            default-expand-all
            :expand-on-click-node="false"
            :render-content="renderContent">
        </el-tree>

        <!--表单界面-->
        <el-dialog
            :title="formMap[formName]"
            :visible.sync="formVisible"
            :before-close="hideForm"
            width="85%"
            top="5vh">
            <el-form :model="formData" :rules="formRules" ref="dataForm">
                <el-form-item label="父ID" prop="pid">
                    <el-select v-model="formData.pid" placeholder="顶级" :disabled="formName === 'edit'">
                        <el-option
                            v-for="item in treeList"
                            v-if="item.level <= 2"
                            :key="item.id"
                            :label="item.name"
                            :value="item.id">
                            <span style="float: left"><span v-html="item.html"></span>{{ item.name }}</span>
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="分类名称" prop="name">
                    <el-input type="" v-model="formData.name" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="分类图标" prop="pic">
                    <div class="block" style="width: 100%;display: inline-block;">
                        <el-image :src="formData.pic_url" style="width: 100px;height: 100px;">
                            <div slot="error" class="image-slot">
                                <i class="el-icon-picture-outline"></i>
                            </div>
                        </el-image>
                        <upload ext="png,jpg,jpeg" @on-select="onSelectPic"></upload>
                    </div>
                </el-form-item>
                <el-form-item label="导航显示" prop="is_show">
                    <el-radio-group v-model="formData.is_show">
                        <el-radio :label="0">否</el-radio>
                        <el-radio :label="1">是</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="推荐" prop="is_recommend">
                    <el-radio-group v-model="formData.is_recommend">
                        <el-radio :label="0">否</el-radio>
                        <el-radio :label="1">是</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="排序" prop="sort">
                    <el-input type="" v-model="formData.sort" auto-complete="off"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="hideForm">取消</el-button>
                <el-button type="primary" @click.native="formSubmit()" :loading="formLoading">提交</el-button>
            </div>
        </el-dialog>

        <!--属性列表-->
        <el-dialog
            title="属性列表"
            :visible.sync="attrVisible"
            :before-close="hideAttr"
            width="85%"
            top="5vh">
            <el-form :inline="true" class="query-form" size="mini">
                <el-form-item>
                    <el-button-group>
                        <el-button type="primary" icon="el-icon-refresh" @click="onAttrReset"></el-button>
                        <el-button type="primary" @click.native="handleAttrForm(null,null)">新增</el-button>
                    </el-button-group>
                </el-form-item>
            </el-form>
            <el-table
                    v-loading="attrLoading"
                    :data="attrList"
                    style="width: 100%;">
                <el-table-column
                        label="ID"
                        prop="id"
                        fixed>
                </el-table-column>
                <el-table-column
                        label="属性名称"
                        prop="name"
                        with="300"
                        :show-overflow-tooltip="true">
                </el-table-column>
                <el-table-column
                        label="类型"
                        prop="type">
                    <template slot-scope="scope">
                        <el-tag :disable-transitions="true" :type="scope.row.type === 1 ? 'success' : ''">{{scope.row.type === 1 ? '下拉选择' : '手动输入'}}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column
                        label="下拉可选值"
                        with="300"
                        :show-overflow-tooltip="true"
                        prop="value">
                    <template slot-scope="scope">
                        <span>{{scope.row.value || '无'}}</span>
                    </template>
                </el-table-column>
                <el-table-column
                        label="权重"
                        prop="sort"
                        with="300">
                </el-table-column>
                <el-table-column
                        label="操作"
                        fixed="right">
                    <template slot-scope="scope">
                        <el-button type="text" size="small" @click.native="handleAttrForm(scope.$index, scope.row)">编辑</el-button>
                        <el-button type="text" size="small" @click.native="handleAttrDel(scope.$index, scope.row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="hideAttr">关闭</el-button>
            </div>
        </el-dialog>

        <!--属性表单界面-->
        <el-dialog
                :title="attrFormMap[attrFormName]"
                :visible.sync="attrFormVisible"
                :before-close="hideAttrForm"
                append-to-body
                width="85%"
                top="5vh">
            <el-form :model="attrFormData" :rules="attrFormRules" ref="dataAttrForm">
                <el-form-item label="属性名称" prop="name">
                    <el-input type="" v-model="attrFormData.name" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="类型" prop="type">
                    <el-radio-group v-model="attrFormData.type">
                        <el-radio :label="0">手动输入</el-radio>
                        <el-radio :label="1">下拉选项</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="选项值（换行则表示一个项）" prop="value" v-if="attrFormData.type === 1">
                    <el-input type="textarea" v-model="attrFormData.value" autosize auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="排序" prop="sort">
                    <el-input type="" v-model="attrFormData.sort" auto-complete="off"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="hideAttrForm">取消</el-button>
                <el-button type="primary" @click.native="attrFormSubmit()" :loading="attrFormLoading">提交</el-button>
            </div>
        </el-dialog>

        <!--规格列表-->
        <el-dialog
            title="规格列表"
            :visible.sync="specVisible"
            :before-close="hideSpec"
            width="85%"
            top="5vh">
            <el-form :inline="true" class="query-form" size="mini">
                <el-form-item>
                    <el-button-group>
                        <el-button type="primary" icon="el-icon-refresh" @click="onSpecReset"></el-button>
                        <el-button type="primary" @click.native="handleSpecForm(null,null)">新增</el-button>
                    </el-button-group>
                </el-form-item>
            </el-form>
            <el-table
                    v-loading="specLoading"
                    :data="specList"
                    style="width: 100%;">
                <el-table-column
                        label="ID"
                        prop="id"
                        fixed>
                </el-table-column>
                <el-table-column
                        label="规格名称"
                        prop="name"
                        with="300"
                        :show-overflow-tooltip="true">
                </el-table-column>
                <el-table-column
                        label="下拉可选值"
                        with="300"
                        :show-overflow-tooltip="true"
                        prop="value">
                    <template slot-scope="scope">
                        <span>{{scope.row.value || '无'}}</span>
                    </template>
                </el-table-column>
                <el-table-column
                        label="是否支持新增"
                        prop="is_add">
                    <template slot-scope="scope">
                        <el-tag :disable-transitions="true" :type="scope.row.is_add === 1 ? 'success' : ''">{{scope.row.type === 1 ? '是' : '否'}}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column
                        label="权重"
                        prop="sort"
                        with="300">
                </el-table-column>
                <el-table-column
                        label="操作"
                        fixed="right">
                    <template slot-scope="scope">
                        <el-button type="text" size="small" @click.native="handleSpecForm(scope.$index, scope.row)">编辑</el-button>
                        <el-button type="text" size="small" @click.native="handleSpecDel(scope.$index, scope.row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="hideSpec">关闭</el-button>
            </div>
        </el-dialog>

        <!--规格表单界面-->
        <el-dialog
                :title="specFormMap[specFormName]"
                :visible.sync="specFormVisible"
                :before-close="hideSpecForm"
                append-to-body
                width="85%"
                top="5vh">
            <el-form :model="specFormData" :rules="specFormRules" ref="dataSpecForm">
                <el-form-item label="规格名称" prop="name">
                    <el-input type="" v-model="specFormData.name" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="选项值（换行则表示一个项）" prop="value">
                    <el-input type="textarea" v-model="specFormData.value" autosize auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="是否支持新增" prop="is_add">
                    <el-radio-group v-model="specFormData.is_add">
                        <el-radio :label="1">是</el-radio>
                        <el-radio :label="0">否</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="排序" prop="sort">
                    <el-input type="" v-model="specFormData.sort" auto-complete="off"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="hideSpecForm">取消</el-button>
                <el-button type="primary" @click.native="specFormSubmit()" :loading="specFormLoading">提交</el-button>
            </div>
        </el-dialog>

    </div>

</template>

<script>
import {
    goodCategoryList,
    goodCategorySave,
    goodCategoryDelete
} from "../../api/good/goodCategory";
import Upload from "../../components/File/Upload.vue";
import {
    goodCategoryAttrList,
    goodCategoryAttrSave,
    goodCategoryAttrDelete
} from "../../api/good/goodCategoryAttr";
import {
    goodCategorySpecList,
    goodCategorySpecSave,
    goodCategorySpecDelete
} from "../../api/good/goodCategorySpec";
const formJson = {
    id: "",
    pid: "",
    name: "",
    pic: "",
    pic_url: "",
    is_show: 1,
    is_recommend: 0,
    sort: ""
};
const attrFormJson = {
    id: "",
    name: "",
    type: "",
    value: "",
    sort: ""
};
const specFormJson = {
    id: "",
    name: "",
    value: "",
    is_add: "",
    sort: ""
};
export default {
    data() {
        return {
            query: {},
            mergeList: [],
            node: null,
            defaultProps: {
                children: "children",
                label: "name"
            },
            treeList: [],
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
                name: [
                    {
                        required: true,
                        message: "请输入分类名称",
                        trigger: "blur"
                    }
                ]
            },
            deleteLoading: false,
            pidData: {},
            attrQuery: {
                category_id: null
            },
            attrVisible: false,
            attrList: [],
            attrTotal: 0,
            attrLoading: false,
            attrIndex: null,
            attrFormName: null,
            attrFormMap: {
                add: "新增",
                edit: "编辑"
            },
            attrFormLoading: false,
            attrFormVisible: false,
            attrFormData: attrFormJson,
            attrFormRules: {
                name: [
                    {
                        required: true,
                        message: "请输入属性名称",
                        trigger: "blur"
                    }
                ],
                type: [
                    {
                        required: true,
                        message: "请选择属性类型",
                        trigger: "change"
                    }
                ]
            },
            attrDeleteLoading: false,
            specQuery: {
                category_id: null
            },
            specVisible: false,
            specList: [],
            specTotal: 0,
            specLoading: false,
            specIndex: null,
            specFormName: null,
            specFormMap: {
                add: "新增",
                edit: "编辑"
            },
            specFormLoading: false,
            specFormVisible: false,
            specFormData: specFormJson,
            specFormRules: {
                name: [
                    {
                        required: true,
                        message: "请输入属性名称",
                        trigger: "blur"
                    }
                ]
            },
            specDeleteLoading: false
        };
    },
    components: {
        Upload
    },
    methods: {
        /*eslint-disable */
        renderContent (h, { node, data, store }) {
            if (data.level <= 2) {
                return (
                    <span style="flex: 1; display: flex; align-items: center; justify-content: space-between; font-size: 14px; padding-right: 8px;">
                    <span>
                    <span title={ data.name }>{node.label}</span>
                    </span>
                    <span>
                <el-button style="font-size: 12px;" type="text" on-click={ () => this.handleForm(node, data, 'add') }>添加子菜单</el-button>
                <el-button style="font-size: 12px;" type="text" on-click={ () => this.handleForm(node, data, 'edit') }>编辑</el-button>
                <el-button style="font-size: 12px;" type="text" on-click={ () => this.handleDel(node, data) }>删除</el-button>
                </span>
                </span>)
            } else {
                return (
                    <span style="flex: 1; display: flex; align-items: center; justify-content: space-between; font-size: 14px; padding-right: 8px;">
                    <span>
                    <span title={ data.name }>{node.label}</span>
                    </span>
                    <span>
                <el-button style="font-size: 12px;color:#E6A23C;" type="text" on-click={ () => this.handleSpec(data) }>规格</el-button>
                <el-button style="font-size: 12px;color:#909399;" type="text" on-click={ () => this.handleAttr(data) }>属性</el-button>
                <el-button style="font-size: 12px;" type="text" on-click={ () => this.handleForm(node, data, 'edit') }>编辑</el-button>
                <el-button style="font-size: 12px;" type="text" on-click={ () => this.handleDel(node, data) }>删除</el-button>
                </span>
                </span>)
            }
        },
        onReset() {
            this.$router.push({
                path: ""
            });
            this.query = {};
            this.getList();
        },
        onSubmit() {
            this.getList();
        },
        getList() {
            this.loading = true;
            goodCategoryList(this.query)
                .then(response => {
                    this.loading = false;
                    this.mergeList = response.data.list || [];
                    this.treeList = response.data.tree_list || [];
                })
                .catch(() => {
                    this.loading = false;
                    this.mergeList = [];
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
            return true;
        },
        // 显示表单
        handleForm(node, data, formName) {
            this.formVisible = true;
            this.pidData = data || null;
            formJson.pid = (data && parseInt(data.id)) || "";
            this.formData = JSON.parse(JSON.stringify(formJson));
            if (formName === "edit") {
                this.formData = Object.assign({}, data);
                this.node = node;
            }
            this.formData.pid = !this.formData.pid ? "" : this.formData.pid;
            this.formName = formName;
            if (data && data.id) {
                this.index = this.mergeList.findIndex(d => d.id === data.id);
            }
        },
        formSubmit() {
            this.$refs["dataForm"].validate(valid => {
                if (valid) {
                    this.formLoading = true;
                    let data = Object.assign({}, this.formData);
                    goodCategorySave(data, this.formName)
                        .then(response => {
                            this.formLoading = false;
                            if (response.code) {
                                this.$message.error(response.message);
                                return false;
                            }
                            this.$message.success("操作成功");
                            this.formVisible = false;
                            if (this.formName !== "edit") {
                                if (response.data && response.data.id) {
                                    data.id = response.data.id;
                                    data.level = response.data.level;
                                    if (this.pidData) {
                                        if (!this.pidData.children) {
                                            this.$set(
                                                this.pidData,
                                                "children",
                                                []
                                            );
                                        }
                                        this.pidData.children.push(data);
                                    } else {
                                        this.mergeList.push(data);
                                    }
                                }
                            } else {
                                const parent = this.node.parent;
                                const children =
                                    parent.data.children || parent.data;
                                const index = children.findIndex(
                                    d => d.id === data.id
                                );
                                children.splice(index, 1, data);
                            }
                            // 刷新表单
                            this.resetForm();
                        })
                        .catch(() => {
                            this.formLoading = false;
                        });
                }
            });
        },
        // 删除
        handleDel(node, data) {
            if (data.children && data.children.length > 0) {
                this.$alert("请先删除子节点", "提示", {
                    confirmButtonText: "确定"
                });
                return false;
            }
            if (data.id) {
                this.$confirm("确认删除该记录吗?", "提示", {
                    type: "warning"
                })
                    .then(() => {
                        this.deleteLoading = true;
                        let para = { id: data.id };
                        goodCategoryDelete(para)
                            .then(response => {
                                this.deleteLoading = false;
                                if (response.code) {
                                    this.$message.error(response.message);
                                    return false;
                                }
                                this.$message.success("删除成功");
                                const parent = node.parent;
                                const children =
                                    parent.data.children || parent.data;
                                const index = children.findIndex(
                                    d => d.id === data.id
                                );
                                children.splice(index, 1);
                            })
                            .catch(() => {
                                this.deleteLoading = false;
                            });
                    })
                    .catch(() => {
                        this.$message.info("取消删除");
                    });
            }
        },
        onSelectPic(filePath, filePathUrl) {
            this.formData.pic = filePath;
            this.formData.pic_url = filePathUrl;
        },
        onAttrReset() {
            this.getAttrList();
        },
        // 显示属性
        handleAttr(data) {
            // 更改值
            this.attrVisible = true;
            this.attrQuery.category_id = data.id;
            this.getAttrList();
            return true;
        },
        getAttrList() {
            this.attrLoading = true;
            goodCategoryAttrList(this.attrQuery)
                .then(response => {
                    this.attrLoading = false;
                    if (response.code) {
                        this.$message.error(response.message);
                    }
                    this.attrList = response.data.list || [];
                    this.attrTotal = response.data.total || 0;
                })
                .catch(() => {
                    this.attrLoading = false;
                    this.attrList = [];
                    this.attrTotal = 0;
                });
        },
        // 隐藏属性
        hideAttr() {
            // 更改值
            this.attrVisible = !this.attrVisible;
            return true;
        },
        // 隐藏属性表单
        hideAttrForm() {
            // 更改值
            this.attrFormVisible = !this.attrFormVisible;
            this.resetAttrForm();
            return true;
        },
        // 刷新表单
        resetAttrForm() {
            if (this.$refs["dataAttrForm"]) {
                // 清空字段
                this.$refs["dataAttrForm"].resetFields();
                // 清空验证信息表单
                this.$refs["dataAttrForm"].clearValidate();
            }
        },
        // 显示表单
        handleAttrForm(index, row) {
            this.attrFormVisible = true;
            // 刷新表单
            this.attrFormData = JSON.parse(JSON.stringify(attrFormJson));
            this.attrFormData.category_id = this.attrQuery.category_id;
            if (row !== null) {
                this.attrFormData = Object.assign({}, row);
            }
            this.attrFormName = "add";
            if (index !== null) {
                this.attrIndex = index;
                this.attrFormName = "edit";
            }
        },
        attrFormSubmit() {
            this.$refs["dataAttrForm"].validate(valid => {
                if (valid) {
                    this.attrFormLoading = true;
                    let data = Object.assign({}, this.attrFormData);
                    goodCategoryAttrSave(data, this.attrFormName)
                        .then(response => {
                            this.attrFormLoading = false;
                            if (response.code) {
                                this.$message.error(response.message);
                                return false;
                            }
                            this.$message.success("操作成功");
                            if (this.attrFormName === "add") {
                                // 向头部添加数据
                                data.id = response.data.id;
                                this.attrList.unshift(data);
                            } else {
                                this.attrList.splice(this.attrIndex, 1, data);
                            }
                            this.hideAttrForm();
                        })
                        .catch(() => {
                            this.attrFormLoading = false;
                        });
                }
            });
        },
        // 删除
        handleAttrDel(index, row) {
            if (row.id) {
                this.$confirm("确认删除该记录吗?", "提示", {
                    type: "warning"
                })
                    .then(() => {
                        let para = { id: row.id };
                        this.attrDeleteLoading = true;
                        goodCategoryAttrDelete(para)
                            .then(response => {
                                this.attrDeleteLoading = false;
                                if (response.code) {
                                    this.$message.error(response.message);
                                    return false;
                                }
                                this.$message("删除成功");
                                // 刷新数据
                                this.attrList.splice(index, 1);
                            })
                            .catch(() => {
                                this.attrDeleteLoading = false;
                            });
                    })
                    .catch(() => {
                        this.$message.info("取消删除");
                    });
            }
        },
        onSpecReset() {
            this.getSpecList();
        },
        // 显示属性
        handleSpec(data) {
            // 更改值
            this.specVisible = true;
            this.specQuery.category_id = data.id;
            this.getSpecList();
            return true;
        },
        getSpecList() {
            this.specLoading = true;
            goodCategorySpecList(this.specQuery)
                .then(response => {
                    this.specLoading = false;
                    if (response.code) {
                        this.$message.error(response.message);
                    }
                    this.specList = response.data.list || [];
                    this.specTotal = response.data.total || 0;
                })
                .catch(() => {
                    this.specLoading = false;
                    this.specList = [];
                    this.specTotal = 0;
                });
        },
        // 隐藏属性
        hideSpec() {
            // 更改值
            this.specVisible = !this.specVisible;
            return true;
        },
        // 隐藏属性表单
        hideSpecForm() {
            // 更改值
            this.specFormVisible = !this.specFormVisible;
            this.resetSpecForm();
            return true;
        },
        // 刷新表单
        resetSpecForm() {
            if (this.$refs["dataSpecForm"]) {
                // 清空字段
                this.$refs["dataSpecForm"].resetFields();
                // 清空验证信息表单
                this.$refs["dataSpecForm"].clearValidate();
            }
        },
        // 显示表单
        handleSpecForm(index, row) {
            this.specFormVisible = true;
            // 刷新表单
            this.specFormData = JSON.parse(JSON.stringify(specFormJson));
            this.specFormData.category_id = this.specQuery.category_id;
            if (row !== null) {
                this.specFormData = Object.assign({}, row);
            }
            this.specFormName = "add";
            if (index !== null) {
                this.specIndex = index;
                this.specFormName = "edit";
            }
        },
        specFormSubmit() {
            this.$refs["dataSpecForm"].validate(valid => {
                if (valid) {
                    this.specFormLoading = true;
                    let data = Object.assign({}, this.specFormData);
                    goodCategorySpecSave(data, this.specFormName)
                        .then(response => {
                            this.specFormLoading = false;
                            if (response.code) {
                                this.$message.error(response.message);
                                return false;
                            }
                            this.$message.success("操作成功");
                            if (this.specFormName === "add") {
                                // 向头部添加数据
                                data.id = response.data.id;
                                this.specList.unshift(data);
                            } else {
                                this.specList.splice(this.specIndex, 1, data);
                            }
                            this.hideSpecForm();
                        })
                        .catch(() => {
                            this.specFormLoading = false;
                        });
                }
            });
        },
        // 删除
        handleSpecDel(index, row) {
            if (row.id) {
                this.$confirm("确认删除该记录吗?", "提示", {
                    type: "warning"
                })
                    .then(() => {
                        let para = { id: row.id };
                        this.specDeleteLoading = true;
                        goodCategorySpecDelete(para)
                            .then(response => {
                                this.specDeleteLoading = false;
                                if (response.code) {
                                    this.$message.error(response.message);
                                    return false;
                                }
                                this.$message("删除成功");
                                // 刷新数据
                                this.specList.splice(index, 1);
                            })
                            .catch(() => {
                                this.specDeleteLoading = false;
                            });
                    })
                    .catch(() => {
                        this.$message.info("取消删除");
                    });
            }
        }
    },
    filters: {
        statusFilterType(status) {
            const statusMap = {
                0: "gray",
                1: "success"
            };
            return statusMap[status];
        },
        statusFilterName(status) {
            const statusMap = {
                0: "禁用",
                1: "正常"
            };
            return statusMap[status];
        }
    },
    mounted() {},
    created() {
        // 加载表格数据
        this.getList();
    }
};
</script>

<style type="text/scss" lang="scss">
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
.category-tree {
    border: 1px solid #EBEEF5;
    border-bottom: none;
}
.el-tree-node__content {
    height: 40px !important;
    border-bottom: 1px solid #EBEEF5;
}
</style>
