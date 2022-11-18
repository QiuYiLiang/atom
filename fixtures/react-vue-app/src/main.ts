import { App, ReactApp } from "./App";
import { VueApp } from "./VueApp";

App("app").mount("#root");
VueApp("vueApp").mount("#root2");
ReactApp("reactApp").mount("#root3");
