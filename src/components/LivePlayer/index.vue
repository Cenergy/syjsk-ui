<template>
    <easy-player
    ref="playerRef"
    live
    muted
    :autoplay="autoplay"
    :reconnection="reconnection"
    :video-url="url"
    :has-audio="false"
    @error="handleTimeout"
    @dblclick.native="fullscreen" />
</template>
<script>
import EasyPlayer from '@easydarwin/easyplayer';

export default {
    components: {
        EasyPlayer
    },
    props: {
        autoplay: {
            type: Boolean,
            default: true
        },
        reconnection: {
            type: Boolean,
            default: true
        },
        url: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            
        };
    },
    methods: {
        fullscreen() {
            this.$refs.playerRef.setFullscreen();
        },
        handleTimeout() {
            // this.$message.warning('视频已断开，请稍后重试！');
            console.error("超时" + this.url)
        }
    },
    beforeDestroy() {
        console.log(this.$refs.playerRef)
        this.$refs.playerRef.destroyPlayer();
    }
}
</script>
<style scoped></style>