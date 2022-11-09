<template>
    <div>
        <el-row :gutter="10">
            <el-col :span="20">
                <el-input v-model="input" placeholder="输入关键字搜索" @keyup.enter="search" class="input-with-select">
                    <!-- <template #prepend>
                        <el-select v-model="select" placeholder="查询" class="select">
                            <el-option label="Restaurant" value="1" />
                            <el-option label="Order No." value="2" />
                            <el-option label="Tel" value="3" />
                        </el-select>
                    </template> -->
                </el-input>

            </el-col>
            <el-col :span="4">
                <el-button type="primary" @click="search">搜索</el-button>
            </el-col>
        </el-row>
        <el-row :gutter="10">
            <el-col v-for="item in fileList" :span="24">
                <el-card class="box-card">
                    <el-descriptions class="margin-top" title="文件内容" :column="3" border>
                        <!-- <template #extra>
                            <el-button type="primary">Operation</el-button>
                        </template> -->
                        <el-descriptions-item v-for="value, key in item">
                            <template #label>
                                <div class="cell-item">
                                    <el-icon>
                                        <tickets />
                                    </el-icon>
                                    {{ key }}
                                </div>
                            </template>
                            <div v-html="value"></div>
                        </el-descriptions-item>
                    </el-descriptions>
                </el-card>
            </el-col>
        </el-row>
    </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { searchAll, searchByContent, searchByFilename } from "@/api/search"
import { file } from '@babel/types';
import { Tickets } from '@element-plus/icons-vue'
import { ElRow, ElCol, ElInput, ElButton, ElCard, ElDescriptions, ElDescriptionsItem, ElIcon } from 'element-plus';

const input = ref('');
const select = ref('');
const fileList = ref([]);

const search = async () => {
    let query: string = input.value;
    const res = await searchAll({ params: query });

    // 在 setup 里面复制需使用.value，但是在模板中使用不需要
    console.log(res.data);

    fileList.value = res.data;
    console.log(fileList);
}



</script>

<style lang="less" scoped>
.select {
    width: 100px;
}
</style>