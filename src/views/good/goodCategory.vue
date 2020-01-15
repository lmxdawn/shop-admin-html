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
    </div>

</template>

<script>
import {
    goodCategoryList,
    goodCategorySave,
    goodCategoryDelete
} from "../../api/good/goodCategory";
import Upload from "../../components/File/Upload.vue";
const formJson = {
    id: "",
    pid: "2",
    name: "",
    pic: "",
    pic_url: "",
    is_show: 1,
    is_recommend: 0,
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
            pidData: {},
            deleteLoading: false
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
</style>
