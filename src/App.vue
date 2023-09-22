<script lang="ts" setup>
import { ref } from "vue";
const titleClass = ref("홍길동");

</script>

<template>
  {{ titleClass }}
</template>

<style>
#app {
  font-family: "나눔바른고딕OTF";
  font-size: 30px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  margin-top: 60px;
}
</style>