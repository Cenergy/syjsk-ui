<template>
<div class="common-aside">
    <template
    v-for="item of menuItemList">
        <div
        v-if="item.children"
        class="common-aside-item">
            <span :class="item.icon" style="font-size: 30px;"></span>
            <span>{{ item.text }}</span>
            <div
            class="common-aside-item-children">
                <router-link
                v-for="(child, idx2) of item.children"
                :key="idx2"
                :to="child.to"
                v-slot="childScope"
                custom>
                <div
                    :class="['common-aside-item-children-item', childScope.isActive&&'active']"
                    @click.stop="childScope.navigate">
                    {{ child.text }}
                </div>
                </router-link>
            </div>
        </div>
        <router-link
        v-else
        :to="item.to"
        v-slot="scope"
        custom>
        <div
        :class="['common-aside-item', scope.isActive&&'active']"
        @click.stop="scope.navigate">
            <span :class="item.icon" style="font-size: 30px;"></span>
            <span>{{ item.text }}</span>
        </div>
    </router-link>
    </template>
</div>
</template>
<script>
export default {
    props: {
        menuItemList: {
            type: Array,
            default() {
                return []
            }
        }
    }
}
</script>
<style lang="scss" scoped>
.common-aside {
    flex-shrink: 0;
    position: relative;
    width: 110px;
    height: 100%;
    background-color: #FFF;
    display: flex;
    flex-direction: column;
    z-index: 3;

    .common-aside-item {
        cursor: pointer;
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        color: #7D8FBC;
        padding: 10px 0px;
        &:has(.active) {
            color: #13A1ED;
        }
        &:hover > .common-aside-item-children {
            display: flex;
        }
        & + .common-aside-item {
            border-top: 1px solid #0C1529;
        }
        .common-aside-item-children {
            display: none;
            flex-direction: column;
            position: absolute;
            top: 0;
            left: 100%;
            min-width: 140px;
            color: #7BACD2;
            background-color: rgba(13, 43, 61, 0.8);
            border: 1px solid #13A1ED;
            border-left: none;
            .common-aside-item-children-item {
                font-size: 14px;
                padding: 7px 10px;
                display: flex;
                flex-direction: column;
                align-items: center;
            }
        }
    }
}

.common-aside-item,
.common-aside-item-children-item {
    &.active,
    &:hover {
        color: #13A1ED;
    }
}
</style>