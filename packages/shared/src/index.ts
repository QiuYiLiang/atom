import { createElement } from "react";
import { h } from "vue";
import { applyReactInVue, applyVueInReact } from "veaury";

export const AtomReactRender = (props: Record<string, any> = {}) => {
  const { atom, view } = props;
  if (!atom) {
    return null;
  }

  const { type, Component } = atom.getView(view) ?? {};

  switch (type) {
    case "react":
      return createElement(Component, props);
    case "vue":
      return createElement(applyVueInReact(Component) as any, props);
    default:
      return null;
  }
};

export const AtomVueRender = {
  render(_this: any) {
    const props = _this.$attrs;

    const { atom, view } = props;
    if (!atom) {
      return null;
    }

    const { type, Component } = atom.getView(view) ?? {};

    switch (type) {
      case "react":
        return h(applyReactInVue(Component), props);
      case "vue":
        return h(Component, props);
      default:
        return null;
    }
  },
};
