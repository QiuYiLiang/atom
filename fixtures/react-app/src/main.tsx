import { r, view } from "atom";
import App from "./App";
import "./index.css";

const AppAtom = r("App", () => {
  view(App);
});

AppAtom("app").mount("#root");
