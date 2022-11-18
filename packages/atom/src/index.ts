import { createElement, FC, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createApp, h } from "vue";
import { AtomVueRender, AtomReactRender } from "@atom/shared";
import {
  getCurrentCreatingAtom,
  popCreatingAtoms,
  pushCreatingAtoms,
} from "./creating-atom";

type SetMethod = (
  methodIdOrMethod: Method | string,
  call?: any,
  config?: {
    internal: boolean;
    argsMatchTypes: string[];
    i18n?: any;
  }
) => void;

type SetView = (
  viewIdOrViewOrComponent: View | VIEW_ID | FC | any,
  Component?: any
) => void;

type AtomFC = (atom: Atom) => void;

type SetTransformType = (targetType: string, transform: TransformType) => void;

type CreateAtom = (
  id?: string,
  options?: {
    value?: any;
    config?: Record<string, any>;
    internal?: boolean;
    i18n?: any;
  },
  value?: any,
  isChlidAtom?: boolean
) => Atom;

type TransformType = (atom: Atom) => Atom;

const makeAtomFunction =
  (functionName: string) =>
  (...args: any) => {
    (getCurrentCreatingAtom() as any)[functionName](...args);
  };

export const method = makeAtomFunction("setMethod") as SetMethod;

export const view = makeAtomFunction("setView") as SetView;

export const transformType = makeAtomFunction(
  "setTransformType"
) as SetTransformType;

export const extend = (...createAtoms: CreateAtom[]) => {
  for (let index = 0; index < createAtoms.length; index++) {
    const createAtom = createAtoms[index];
    createAtom?.("", {}, false);
  }
};

export const createAtomStore = new Map<string, CreateAtom>();

export const Var = (atomId: string, value?: any) =>
  r("Var", () => void 0)(
    atomId,
    {
      internal: true,
    },
    value
  );

export const c = (type: string, ...args: Parameters<CreateAtom>) => {
  const createAtom = createAtomStore.get(type);
  if (createAtom) {
    return createAtom(...args);
  }
  return null;
};

export const registerAtom = (type: string, atomFC: AtomFC) => {
  const createAtom = ((id, options, isChlidAtom = true) => {
    if (!id) {
      return;
    }
    const currentCreatingAtom = getCurrentCreatingAtom();

    if (isChlidAtom) {
      const atom = new Atom(id, options);

      currentCreatingAtom?.setChlidAtom(atom);
      pushCreatingAtoms(atom);

      atomFC(atom);
      popCreatingAtoms();

      return atom;
    }

    atomFC(currentCreatingAtom);

    return currentCreatingAtom;
  }) as CreateAtom;
  createAtomStore.set(type, createAtom);
  return createAtom;
};

export const r = registerAtom;

export class Id<I = string> {
  private _id: I;
  constructor(id: I) {
    this._id = id;
  }
  get id() {
    return this._id;
  }
}

export class I18n extends Id {
  private _i18n: any;
  constructor(id: string, i18n?: any) {
    super(id);
    this.setI18n(i18n ?? id);
  }
  setI18n(i18n: any) {
    this._i18n =
      typeof i18n === "string"
        ? {
            zh: i18n,
          }
        : i18n;
  }
  get name() {
    return this._i18n["zh"];
  }
}

export class Internal extends I18n {
  private _internal: boolean;
  constructor(id: string, i18n?: any, internal = false) {
    super(id, i18n);
    this._internal = internal;
  }
  get internal() {
    return this._internal;
  }
}

export class Method extends Internal {
  private _argsMatchTypes: string[];
  private _call: (...args: any[]) => Promise<any>;
  constructor(
    id: any,
    call: any,
    {
      internal,
      argsMatchTypes = [],
      i18n,
    }: {
      internal?: boolean;
      argsMatchTypes?: string[];
      i18n?: any;
    } = {}
  ) {
    super(id, i18n, internal);
    this._argsMatchTypes = argsMatchTypes;
    this._call = call;
  }

  get call() {
    return this._call;
  }

  get argsMatchTypes() {
    return this._argsMatchTypes;
  }
}

type VIEW_TYPE = "react" | "vue";

type VIEW_ID = "default" | string;

export class View extends Id<VIEW_ID> {
  type: VIEW_TYPE;
  Component: any;
  constructor(id: any = "default", Component: any) {
    super(id);

    this.Component = Component;
    this.type = Component.render ? "vue" : "react";
  }
}

export class Atom extends Internal {
  private _value: any;
  private _config: any;
  private _type: string = "";
  private _listens = new Set<any>();
  private _methodMap = new Map<string, Method>();
  private _viewMap = new Map<VIEW_ID, View>();
  private _childAtomMap = new Map<string, Atom>();
  private _transformTypeMap = new Map<string, TransformType>();
  private _childAtomOrderSet = new Set<string>();
  private _parentAtom: Atom | null = null;

  setTransformType(type: string, transform: TransformType) {
    this._transformTypeMap.set(type, transform);
  }

  getTransformType(type: string) {
    this._transformTypeMap.get(type);
  }

  delTransformType(type: string) {
    this._transformTypeMap.delete(type);
  }

  constructor(
    id: string,
    {
      i18n,
      internal,
      type = "",
      value = null,
      config = {},
    }: {
      internal?: boolean;
      i18n?: string;
      type?: string;
      value?: any;
      config?: any;
    } = {}
  ) {
    super(id, i18n, internal);
    this._type = type;
    this.setValue(value);
    this.setConfig(config);
  }

  setChlidAtom(atomOrAtomType: Atom | string, ...args: Parameters<CreateAtom>) {
    const atom =
      atomOrAtomType instanceof Atom
        ? atomOrAtomType
        : c(atomOrAtomType, ...args);
    if (!atom) {
      return;
    }

    atom._parentAtom = this;
    this._childAtomOrderSet.add(atom.id);
    this._childAtomMap.set(atom.id, atom);
    return atom;
  }

  getChlidAtom(atomIdPath: string) {
    const atomIds = atomIdPath.split(".");

    let currentAtom: Atom | undefined = this;

    do {
      if (!currentAtom) {
        return null;
      }
      currentAtom = currentAtom._childAtomMap.get(atomIds.shift() as string);
    } while (atomIds[0]);

    return currentAtom ?? null;
  }

  delChlidAtom(atomIdPath: string) {
    this.getChlidAtom(atomIdPath)?.delete();
  }

  delete() {
    const parentAtom = this.getParentAtom();
    if (!parentAtom) {
      return;
    }
    parentAtom?._childAtomMap.delete(this.id);
    parentAtom._childAtomOrderSet.delete(this.id);
  }

  getAtom(baseId: string) {
    const [rootId, ...ids] = baseId.split(".");
    const rootAtom = this.rootAtom;

    if (ids.length === 0) {
      return rootAtom.id === rootId ? rootAtom : null;
    }
    return rootAtom.getChlidAtom(ids.join("."));
  }

  getParentAtom() {
    return this._parentAtom;
  }

  setParentAtom(atom: Atom) {
    this.getParentAtom()?.delChlidAtom(this.id);
    this._parentAtom = atom;
  }

  setView(viewIdOrViewOrComponent: View | VIEW_ID | any, Component?: any) {
    const view =
      viewIdOrViewOrComponent instanceof View
        ? viewIdOrViewOrComponent
        : typeof viewIdOrViewOrComponent === "string"
        ? new View(viewIdOrViewOrComponent, Component)
        : new View("default", viewIdOrViewOrComponent);
    this._viewMap.set(view.id, view);
  }

  getView(viewId: VIEW_ID = "default") {
    return this._viewMap.get(viewId);
  }

  delView(viewId: VIEW_ID = "default") {
    this._viewMap.delete(viewId);
  }

  setMethod(...[methodIdOrMethod, call, config]: Parameters<SetMethod>) {
    const method =
      typeof methodIdOrMethod === "string"
        ? new Method(methodIdOrMethod, call, config)
        : methodIdOrMethod;
    this._methodMap.set(method.id, method);
  }

  getMethod(methodId: string) {
    return this._methodMap.get(methodId);
  }

  delMethod(methodId: string) {
    this._methodMap.delete(methodId);
  }

  async do(methodId: string, ...args: any[]) {
    return await this.getMethod(methodId)?.call?.bind(this)?.(...args);
  }

  get baseId() {
    const ids: string[] = [];
    let rootAtom: Atom = this;

    ids.unshift(rootAtom.id);
    while (rootAtom.getParentAtom()) {
      rootAtom = rootAtom.getParentAtom() as Atom;

      ids.unshift(rootAtom.id);
    }

    return ids.join(".");
  }

  get methods() {
    const methods: Method[] = [];
    this._methodMap.forEach((method) => {
      methods.push(method);
    });
    return methods;
  }

  get chlidAtoms() {
    const chlidAtoms: Atom[] = [];
    this._childAtomOrderSet.forEach((atomId) => {
      chlidAtoms.push(this._childAtomMap.get(atomId) as Atom);
    });
    return chlidAtoms;
  }

  get rootAtom() {
    let rootAtom: Atom = this;

    while (rootAtom.getParentAtom()) {
      rootAtom = rootAtom.getParentAtom() as Atom;
    }

    return rootAtom;
  }

  get type() {
    return this._type;
  }

  get value() {
    return this._value;
  }

  get config() {
    return this._config;
  }

  setConfig(config: any) {
    this._config = config;
  }

  sub(listen: any) {
    this._listens.add(listen);
    return () => {
      this._listens.delete(listen);
    };
  }

  setValue(value: any) {
    this._value = value;
    this._listens.forEach((listen: any) => listen?.(this.value));
  }

  mount(
    containerOrSelectors: Element | DocumentFragment | string | undefined,
    viewId?: VIEW_ID
  ) {
    const container =
      typeof containerOrSelectors === "string"
        ? document.querySelector(containerOrSelectors)
        : containerOrSelectors;

    if (!container) {
      console.warn("atom 无法挂载到一个不存在的节点");
      return this;
    }

    const { type, Component } = this.getView(viewId) ?? {};

    const props = { atom: this };

    switch (type) {
      case "react":
        createRoot(container).render(
          createElement(StrictMode, null, createElement(Component, props))
        );
        break;
      case "vue":
        createApp({
          render: () => h(Component, props),
        }).mount(container as Element);
        break;
    }
    return this;
  }

  Render = ((props: Record<string, any> = {}) =>
    AtomReactRender({
      ...props,
      atom: this,
    })).bind(this);

  VueRender = {
    render: (({ $attrs }: any) =>
      AtomVueRender.render({
        $attrs: {
          ...$attrs,
          atom: this,
        },
      })).bind(this),
  };
}
