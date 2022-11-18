<script setup lang="ts">
import { Atom } from "atom";
import { AtomRender } from "@atom/vue";

const { atom } = defineProps({
  atom: Atom,
});
</script>

<template>
  <div>VueApp <AtomRender :atom="atom.getChlidAtom('app')" /></div>
</template>
