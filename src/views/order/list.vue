<template>

    <div>
        <el-form :inline="true" :model="query" class="query-form" size="mini">
            <el-form-item class="query-form-item" label="订单号">
                <el-input v-model="query.order_num" placeholder="订单号"/>
            </el-form-item>
            <el-form-item class="query-form-item" label="用户ID">
                <el-input v-model="query.member_id" placeholder="用户ID"/>
            </el-form-item>
            <el-form-item class="query-form-item" label="状态">
                <el-select v-model="query.status" placeholder="状态">
                    <el-option label="全部" value=""/>
                    <el-option label="待付款" :value="0"/>
                    <el-option label="待发货" :value="1"/>
                    <el-option label="待发货" :value="2"/>
                    <el-option label="待评价" :value="3"/>
                    <el-option label="已取消" :value="4"/>
                    <el-option label="已完成" :value="5"/>
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button-group>
                    <el-button type="primary" icon="el-icon-refresh" @click="onReset"/>
                    <el-button type="primary" icon="search" @click="onSubmit">查询</el-button>
                </el-button-group>
            </el-form-item>
        </el-form>
        <el-table
            v-loading="loading"
            :data="list"
            style="width: 100%;"
            max-height="500">
            <el-table-column
                label="ID"
                width="100"
                prop="id">
            </el-table-column>
            <el-table-column label="用户头像" width="140" align="center">
                <template slot-scope="scope">
                    <el-image
                        style="width: 100px; height: 100px"
                        :src="scope.row.avatar"
                        :preview-src-list="[scope.row.avatar]"
                        fit="contain">
                    </el-image>
                </template>
            </el-table-column>
            <el-table-column
                    label="用户昵称"
                    width="140"
                    prop="name">
            </el-table-column>
            <el-table-column
                label="订单编号"
                prop="order_num">
            </el-table-column>
            <el-table-column label="提交时间" width="200" align="center">
                <template slot-scope="scope">{{scope.row.create_time}}</template>
            </el-table-column>
            <el-table-column label="订单金额" width="140" align="center">
                <template slot-scope="scope">￥{{scope.row.money}}</template>
            </el-table-column>
            <el-table-column label="实付金额" width="140" align="center">
                <template slot-scope="scope">￥{{scope.row.pay_money}}</template>
            </el-table-column>
            <el-table-column label="支付方式" width="130" align="center">
                <template slot-scope="scope">{{scope.row.pay_type | payTypeFilterName}}</template>
            </el-table-column>
            <el-table-column label="订单状态" width="130" align="center">
                <template slot-scope="scope">{{scope.row.status | statusFilterName}}</template>
            </el-table-column>
            <el-table-column label="操作">
                <template slot-scope="scope">
                    <el-button type="text" size="small" @click.native="handleForm(scope.$index, scope.row)">操作</el-button>
                </template>
            </el-table-column>
        </el-table>

        <el-pagination
            :page-size="query.limit"
            @current-change="handleCurrentChange"
            layout="prev, pager, next"
            :total="total">
        </el-pagination>

        <!--表单-->
        <el-dialog
            title="订单信息"
            :visible.sync="formVisible"
            :before-close="hideForm"
            width="85%"
            top="5vh">
            <div style="margin-top: 20px">
                <span class="font-small">操作</span>
            </div>
            <div style="margin-top: 20px">
                <el-button @click.native="handlePush" type="danger" v-if="order.status === 1">确认发货</el-button>
            </div>

            <div style="margin-top: 20px">
                <span class="font-small">订单信息</span>
            </div>
            <div class="table-layout">
                <el-row>
                    <el-col :span="6" class="table-cell-title">编号</el-col>
                    <el-col :span="6" class="table-cell-title">数量</el-col>
                    <el-col :span="6" class="table-cell-title">订单金额</el-col>
                    <el-col :span="6" class="table-cell-title">支付金额</el-col>
                </el-row>
                <el-row>
                    <el-col :span="6" class="table-cell">{{order.order_num}}</el-col>
                    <el-col :span="6" class="table-cell">{{order.count}}</el-col>
                    <el-col :span="6" class="table-cell">{{order.money}}</el-col>
                    <el-col :span="6" class="table-cell" style="color: red;">{{order.pay_money}}</el-col>
                </el-row>
            </div>
            <div style="margin-top: 20px">
                <span class="font-small">收货人信息</span>
            </div>
            <div class="table-layout">
                <el-row>
                    <el-col :span="6" class="table-cell-title">收货人</el-col>
                    <el-col :span="6" class="table-cell-title">手机号码</el-col>
                    <el-col :span="6" class="table-cell-title">收货地址</el-col>
                    <el-col :span="6" class="table-cell-title">备注</el-col>
                </el-row>
                <el-row>
                    <el-col :span="6" class="table-cell">{{order.name}}</el-col>
                    <el-col :span="6" class="table-cell">{{order.tel}}</el-col>
                    <el-col :span="6" class="table-cell">{{order.address}}</el-col>
                    <el-col :span="6" class="table-cell" style="color: red;">{{order.remark}}</el-col>
                </el-row>
            </div>
            <div style="margin-top: 20px">
                <span class="font-small">商品信息</span>
            </div>
            <el-table
                :data="goodList"
                style="width: 100%;margin-top: 20px" border>
                <el-table-column label="商品图片" width="120" align="center">
                    <template slot-scope="scope">
                        <el-image
                                style="width: 100px; height: 100px"
                                :src="scope.row.original_img_url"
                                :preview-src-list="[scope.row.original_img_url,...scope.row.imgs_url]"
                                fit="contain">
                        </el-image>
                    </template>
                </el-table-column>
                <el-table-column label="商品名称" align="center">
                    <template slot-scope="scope">
                        <p>{{scope.row.good_name}}</p>
                    </template>
                </el-table-column>
                <el-table-column label="价格" width="200" align="center">
                    <template slot-scope="scope">
                        <p>价格：￥{{scope.row.price}}</p>
                    </template>
                </el-table-column>
                <el-table-column label="数量" width="120" align="center">
                    <template slot-scope="scope">
                        {{scope.row.count}}
                    </template>
                </el-table-column>
                <el-table-column label="小计" width="120" align="center">
                    <template slot-scope="scope">
                        ￥{{scope.row.money}}
                    </template>
                </el-table-column>
            </el-table>
            <div style="margin: 20px;text-align: right;">
                合计：<span class="color-danger" style="color: red;">￥{{order.money}}</span>
            </div>
        </el-dialog>
    </div>

</template>

<script>
import { orderList, orderRead, orderPush } from "../../api/order/order";
export default {
    data() {
        return {
            roles: [],
            query: {
                order_num: "",
                member_id: "",
                status: "",
                page: 1,
                limit: 20,
                role_id: ""
            },
            list: [],
            total: 0,
            loading: true,
            index: null,
            formVisible: false,
            order: {},
            goodList: [],
            readLoading: false,
            pushLoading: false
        };
    },
    methods: {
        onReset() {
            this.$router.push({
                path: ""
            });
            this.query = {
                order_num: "",
                member_id: "",
                status: "",
                page: 1,
                limit: 20,
                role_id: ""
            };
            this.getList();
        },
        onSubmit() {
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
            orderList(this.query)
                .then(response => {
                    this.loading = false;
                    this.list = response.data.list || [];
                    this.total = response.data.total || 0;
                })
                .catch(() => {
                    this.loading = false;
                    this.list = [];
                    this.total = 0;
                    this.roles = [];
                });
        },
        // 隐藏表单
        hideForm() {
            // 更改值
            this.formVisible = !this.formVisible;
        },
        // 显示表单
        handleForm(index, row) {
            this.index = index;
            let para = { order_num: row.order_num };
            this.formVisible = true;
            this.readLoading = false;
            orderRead(para)
                .then(response => {
                    this.readLoading = false;
                    if (response.code) {
                        this.$message.error(response.message);
                        return false;
                    }
                    this.order = response.data.order || {};
                    this.goodList = response.data.good_list || [];
                })
                .catch(() => {
                    this.readLoading = false;
                });
        },
        // 发货
        handlePush() {
            this.$confirm("确认发货吗?", "提示", {
                type: "warning"
            })
                .then(() => {
                    let para = { order_num: this.order.order_num };
                    this.pushLoading = true;
                    orderPush(para)
                        .then(response => {
                            this.pushLoading = false;
                            if (response.code) {
                                this.$message.error(response.message);
                                return false;
                            }
                            this.$message.success("操作成功");
                            // 刷新数据
                            let row = this.list[this.index];
                            row.status = 2;
                            this.list.splice(this.index, 1, row);
                            this.order.status = 2;
                        })
                        .catch(() => {
                            this.pushLoading = false;
                        });
                })
                .catch(() => {
                    this.$message.info("取消删除");
                });
        }
    },
    filters: {
        payTypeFilterName(index) {
            const map = {
                0: "未支付",
                1: "微信",
                2: "支付宝"
            };
            return map[index];
        },
        // 状态：（0：待付款，1：待发货，2：待收货，3：待评价，4：已取消，5：已完成）
        statusFilterName(index) {
            const map = {
                0: "待付款",
                1: "待发货",
                2: "待发货",
                3: "待评价",
                4: "已取消",
                5: "已完成"
            };
            return map[index];
        }
    },
    mounted() {},
    created() {
        // 将参数拷贝进查询对象
        let query = this.$route.query;
        this.query = Object.assign(this.query, query);
        this.query.limit = parseInt(this.query.limit);
        // 加载表格数据
        this.getList();
    }
};
</script>

<style type="text/scss" lang="scss">
.table-layout {
    margin-top: 20px;
    border-left: 1px solid #dcdfe6;
    border-top: 1px solid #dcdfe6;
}
.table-cell {
    height: 60px;
    line-height: 40px;
    border-right: 1px solid #dcdfe6;
    border-bottom: 1px solid #dcdfe6;
    padding: 10px;
    font-size: 14px;
    color: #606266;
    text-align: center;
    overflow: hidden;
}
.table-cell-title {
    border-right: 1px solid #dcdfe6;
    border-bottom: 1px solid #dcdfe6;
    padding: 10px;
    background: #F2F6FC;
    text-align: center;
    font-size: 14px;
    color: #303133;
}
</style>
