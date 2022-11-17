import { onBeforeMount, onUnmounted, ref } from "vue";
import { AtomVueRender } from "@atom/shared";
import { Atom } from "atom";

export const useAtomValue = (atom: Atom) => {
  if (!atom) {
    return [null, () => void 0];
  }
  const atomValue = ref(atom.value);
  const unSub = ref();
  const setAtomValue = (value: any) => {
    atomValue.value = value;
  };

  onBeforeMount(() => {
    unSub.value = atom.sub(setAtomValue.bind(null));
  });

  onUnmounted(() => {
    unSub?.value();
  });

  return [atomValue, atom.setValue.bind(atom)];
};

export const AtomRender = AtomVueRender;
