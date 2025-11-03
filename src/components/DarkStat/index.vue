<template>
    <div class="dark-statstic">
        <div class="statstic-body">
            <slot>
                <span style="font-size: 16px;">
                    <span style="font-size: 18px;">{{ numFormat(value) }}</span>/{{ numFormat(total) }}
                </span>
            </slot>
        </div>
        <div class="statstic-head">{{ title }}</div>
    </div>
</template>
<script>
import { numFormat } from '@/utils/format'

export default {
    props: {
        title: {
            type: String,
            default: ''
        },
        value: {
            type: [String, Number],
            default: ''
        },
        total: {
            type: [String, Number],
            default: ''
        }
    },
    methods: {
        numFormat(val) {
            return numFormat(val, 0)
        }
    }
}
</script>
<style lang="scss" scoped>
.dark-statstic {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    color: white;
    background-image: url(./images/background.png);
    background-size: 100% 100%;

    .statstic-head {
        text-align: center;
        padding: 10px 0px;
    }

    .statstic-body {
        font-size: 20px;
        padding: 10px 0px;
        text-align: center;
    }
}
</style>