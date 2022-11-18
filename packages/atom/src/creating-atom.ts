import { Atom } from "./index";

const creatingAtoms: Atom[] = [];

export const getCurrentCreatingAtom = () =>
  creatingAtoms[creatingAtoms.length - 1];

export const pushCreatingAtoms = creatingAtoms.push.bind(creatingAtoms);

export const popCreatingAtoms = creatingAtoms.pop.bind(creatingAtoms);
