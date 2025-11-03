<template>
    <video
    src=""
    ref="player"
    class="hls-player"></video>
</template>
<script>
import videojs from 'video.js'

let player = null

export default {
    props: {
        url: {
            type: String,
            required: true
        }
    },
    data() {
        return {

        }
    },
    watch: {
        url: {
            handler(val) {
                player.src(val)
                player.load()
                player.play()
            }
        }
    },
    mounted() {
        player = videojs(this.$refs.player, {
            autoplay: true,
            liveui: true,
            muted: true
        })
        player.src(this.url)
        player.load()
        player.play()
    },
    destroyed() {
        player.dispose()
    }
}
</script>
<style scoped>
.hls-player {
    position: relative;
    display: block;
    overflow: hidden;
    width: 100%;
    height: 100%;
    background-color: black;
}

>>>.vjs-tech {
    width: 100%;
    height: 100%;
}

>>>.vjs-error-display {
  display: none;
}
</style>
