import { r, view } from "atom";
import { A } from "./A";
import App from "./App";
import "./index.css";

const a = new A("hi");
console.log(a);

const AppAtom = r("App", () => {
  view(App);
});

AppAtom("app").mount("#root");
