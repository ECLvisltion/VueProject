<script setup lang="ts">
import { ref, onMounted } from "vue";
import { createScene } from "./scenes/TestScene";
const titleClass = ref("홍길동ABC");

const bjsCanvas = ref(null);

onMounted(() => {
    if (bjsCanvas.value) {
    createScene(bjsCanvas.value);
  }
});
</script>

<template>
  <canvas ref="bjsCanvas" class="bjsCanvas" />
  {{ titleClass }}
</template>

<style>
@font-face {
  font-family: "NanumBarunGothic";
  src: url("./assets/fonts/NanumBarunGothic.otf");
}

body {
  margin: 0;
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
</style>