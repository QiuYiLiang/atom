import { useEffect, useState } from "react";
import { AtomReactRender } from "@atom/shared";
import { Atom } from "atom";

export const useAtomValue = (atom: Atom) => {
  if (!atom) {
    return [null, () => void 0];
  }
  const [value, setValue] = useState(atom.value);
  useEffect(() => atom.sub(setValue.bind(null)), []);
  return [value, atom.setValue.bind(atom)];
};

export const AtomRender = AtomReactRender;
