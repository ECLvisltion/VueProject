<script setup lang="ts">
import { ref, onMounted } from "vue";
import { createScene } from "./scenes/mainScene";

const bjsCanvas = ref(null);

onMounted(() => {
    if (bjsCanvas.value) {
    createScene(bjsCanvas.value);
  }
});
</script>

<template>
  <canvas ref="bjsCanvas" class="bjsCanvas" />
</template>

<style>
@font-face {
  font-family: "NanumBarunGothic";
  src: url("./assets/fonts/NanumBarunGothic.otf");
}

body {
  margin: 0;
  padding: 0;
}
#app {
  font-family: "NanumBarunGothic";
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
}
.bjsCanvas {
  width: 100%;
  height: 100vh;
}
</style>./scenes/mainScene