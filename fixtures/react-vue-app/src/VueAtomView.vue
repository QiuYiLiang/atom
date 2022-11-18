<script setup lang="ts">
import { Atom } from "atom";
import { AtomRender, useAtomValue } from "@atom/vue";

const { atom } = defineProps({
  atom: Atom,
});

const [flag] = useAtomValue(atom.getChlidAtom("switch"));

const handleClick = () => {
  atom.rootAtom.do("哈哈哈");
};
</script>

<template>
  <div>
    <button @click="handleClick">vue: {{ flag ? "hi" : "hello" }}</button>
    <AtomRender :atom="atom.getAtom('app.tree').VueRender" />
  </div>
</template>
