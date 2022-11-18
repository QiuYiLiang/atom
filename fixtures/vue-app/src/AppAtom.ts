import App from "./App.vue";
import { r, view } from "atom";

export const AppAtom = r("VueApp", () => {
  view(App);
});
