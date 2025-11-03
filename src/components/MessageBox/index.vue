<template>
    <div>
        <el-form
        ref="formRef"
        label-position="top"
        class="dark"
        :model="form"
        :rules="formRules">
            <el-form-item
            prop="tels"
            label="发送对象">
            <el-cascader
                v-model="selectedList"
                :options="contactList"
                :props="{ multiple: true, value: 'phoneNumber' }"
                filterable
                class="dark"
                popper-class="dark"
                style="width: 100%;"
                @change="handleSelect"></el-cascader>
            </el-form-item>
            <el-form-item
            prop="content"
            label="短信内容">
                <el-input
                v-model="form.content"
                type="textarea"></el-input>    
            </el-form-item>
            <el-form-item>
                <el-button class="w-100 active" type="dark" @click="handleSubmit">发送</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>
<script>
import { deptUserTree } from '@/api/system/dept'
import { sendMessage } from '@/api/swfx/message'

// 通讯录反向索引，用于加速查找
const contactReverseIndex = new Map()

export default {
    props: {
        content: {
            type: String,
            defualt: ""
        }
    },
    data() {
        return {
            contactList: [],
            selectedList: [],
            form: {
                tels: '',
                content: ''
            },
            formRules: {
                content: [
                    {
                        required: true,
                        message: "请输入短信内容"
                    }
                ]
            }
        }
    },
    methods: {
        getContact() {
            deptUserTree()
            .then(res=>{
                this.contactList = res.data
                const stack = [...res.data]
                const lastParent = null
                while(stack.length) {
                    const node = stack.pop()
                    node.parents = lastParent
                    if(node.children) {
                        lastParent = node
                        stack.push(...node.children)
                    } else {
                        contactReverseIndex.set(node.phoneNumber, node)
                    }
                }
            })
        },
        handleSelect() {
            this.$nextTick(()=>{
                this.form.tels = this.selectedList.map(l=>l.at(-1)).join(',')
            })
        },
        handleSubmit() {
            // this.form.tels = this.selectedList.join(',')
            this.$refs.formRef.validate()
            .then(()=>{
                const { tels, content } = this.form
                sendMessage(tels, content)
                .then(res=>{
                    this.$message("发送成功")
                })
                // sendMess(tels, content).then(res=>{
                //     this.$message(res.msg)
                // })
            })
        }
    },
    watch: {
        content: {
            handler(content) {
                this.form.content = content
            },
            immediate: true
        }
    },
    created() {
        this.getContact()
    }
}
</script>
<style scoped>
.w-100 {
    width: 100%;
}
</style>