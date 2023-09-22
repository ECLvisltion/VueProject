<script setup>
import { ref, onMounted } from "@vue/runtime-core";
import { createScene } from "./scenes/TestScene.ts";


//export setup > name: "BabylonScene";

const bjsCanvas = ref(null);

onMounted(() => {
  if (bjsCanvas.value) {
    createScene(bjsCanvas.value);
  }
});

</script>

<template>
  <canvas ref="bjsCanvas" width="500" height="500" />
</template>