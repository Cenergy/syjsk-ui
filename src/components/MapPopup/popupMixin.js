export default {
    inject: [
        "setTitle",
        "getStcd",
        "openPopup",
        "closePopup",
        "togglePopup",
        "setWidth"
    ],
    data() {
        return {
            activeName: '0',
            baseInfo: {},
            width: '1000px'
        }
    },
    provide() {
        return {
            baseInfo: this.baseInfo
        }
    },
    methods: {
        setBaseInfo(data) {
            for(let key in data) {
                this.$set(this.baseInfo, key, data[key])
            }
        }
    },
    mounted() {
        this.setWidth(this.width)
    }
}