<script setup lang="ts">
import { ref } from "vue";
const titleClass = ref("홍길동ABC");

</script>

<template>
  {{ titleClass }}
</template>

<style>
@font-face {
  font-family: "NanumBarunGothic";
  src: url("./assets/fonts/NanumBarunGothic.otf");
}

#app {
  font-family: "NanumBarunGothic";
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  margin: 0;
}
</style>