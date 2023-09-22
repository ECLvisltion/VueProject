<script lang="ts" setup>
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
  font-size: 30px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  margin-top: 60px;
}
</style>