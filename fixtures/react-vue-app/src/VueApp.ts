import { App } from "./App";
import { r, view } from "atom";
import VueAppView from "./VueAppView.vue";

export const VueApp = r("VueApp", () => {
  App("app");
  view(VueAppView);
});
