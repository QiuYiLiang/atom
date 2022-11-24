import { Button, Popover, Tree, Upload } from "antd";
import { Atom, c, extend, r, method, transformType, Var, view } from "atom";
import { VueApp } from "./VueApp";
import { useAtomValue } from "@atom/react";
import VueAtomView from "./VueAtomView.vue";

export const Chlid3 = r("Chlid3", () => {
  const switchAtom = Var("switch", true);

  method("切换开关", () => {
    switchAtom.setValue(!switchAtom?.value);
  });

  // viewVue(VueAtomView);
});

export const Chlid2 = r("Chlid2", () => {
  Chlid3("chlid3");
});

export const Chlid1 = r("Chlid1", (atom) => {
  // atom.getParentAtom()?.do("哈哈哈");
  Chlid2("chlid2");

  view(() => {
    const chlid3 = atom.getChlidAtom("chlid2.chlid3");

    return (
      <>
        22233
        <chlid3.Render />
      </>
    );
  });
});

export const TreeDataAtom = r("TreeDataAtom", (atom) => {
  const transformChlids: any = (atoms: Atom[]) =>
    atoms
      .filter(({ internal }) => !internal)
      .map(({ baseId, name, chlidAtoms, methods }) => ({
        key: baseId,
        title: name,
        type: "atom",
        children: [
          ...transformChlids(chlidAtoms),
          ...methods
            .filter(({ internal }) => !internal)
            .map(({ id, name }) => ({
              key: `${baseId}.__method__${id}`,
              methodId: id,
              atomBaseIdId: baseId,
              title: name,
              type: "method",
            })),
        ],
      }));

  const refresh = () => {
    atom.setValue(transformChlids([atom.rootAtom]));
  };
  method("refresh", refresh);

  setTimeout(refresh, 0);
});

export const TreeAtom = r("TreeAtom", (atom) => {
  extend(App2, App3);
  const treeDataAtom = TreeDataAtom("treeDataAtom", {
    internal: true,
  });

  view(() => {
    const [treeData] = useAtomValue(treeDataAtom);

    return (
      <>
        <Tree
          defaultExpandAll
          treeData={treeData}
          titleRender={({ title, key, type, methodId, atomBaseIdId }: any) => {
            const chlidAtom = atom.getAtom(key);
            return (
              <Popover
                content={
                  <>
                    <Button
                      onClick={() => {
                        chlidAtom?.setChlidAtom("App2", "app2");
                        treeDataAtom.do("refresh");
                      }}
                    >
                      add
                    </Button>
                  </>
                }
              >
                <div
                  style={{
                    background: type === "atom" ? "green" : "yellow",
                  }}
                  onClick={() => {
                    if (type === "method") {
                      atom.getAtom(atomBaseIdId)?.do(methodId);
                    }
                  }}
                >
                  {title}
                </div>
              </Popover>
            );
          }}
        />
      </>
    );
  });
});

const App2 = r("App2", () => {
  method("你好啊", () => {
    console.log("你好啊");
  });
});

const App3 = r("App3", () => {
  method("你好啊222", () => {
    console.log("你好啊222");
  });
});

export const App = r("App", (atom) => {
  extend(App2, App3);

  transformType("String", (atom) => {
    return atom;
  });

  atom.setValue(1);

  method("哈哈哈", () => {
    atom.setValue("哈哈哈");
  });

  const tree = c("TreeAtom", "tree");

  const chlid1 = Chlid1("chlid1", {
    i18n: "子1",
  });

  // action("hih");

  view(() => {
    const [count, setCount] = useAtomValue(atom);

    return (
      <>
        <button
          onClick={() => {
            setCount(count + 1);

            atom.getChlidAtom("chlid1.chlid2.chlid3")?.do("切换开关");
          }}
        >
          {count}
        </button>

        <chlid1.Render />
        <tree.Render />
      </>
    );
  });
});

export const fileToBase64File = async (file: File) => {
  const { lastModified, name, size, webkitRelativePath } = file;
  const base64 = await blobToBase64(file);
  return {
    lastModified,
    name,
    size,
    webkitRelativePath,
    base64,
  };
};

export const blobToBase64 = (blob: Blob) =>
  new Promise((reslove) => {
    var reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onload = (e: any) => {
      reslove(e.target.result);
    };
  });

export const downloadBase64File = (base64File: any) => {
  const { base64, name } = base64File;
  const parts = base64.split(";base64,");
  const contentType = parts[0].split(":")[1];
  const raw = window.atob(parts[1]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);
  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }
  const blob = new Blob([uInt8Array], {
    type: contentType,
  });

  const aLink = document.createElement("a");
  aLink.download = name;
  aLink.href = URL.createObjectURL(blob);
  aLink.click();

  return URL.createObjectURL(blob);
};
export const ReactApp = r("ReactApp", () => {
  const vueApp = VueApp("vueApp");
  view(() => {
    return (
      <div>
        ReactApp
        <Upload
          name="file"
          customRequest={async ({ file }: any) => {
            // console.log(((window as any).bbb = file));

            const base64File = await fileToBase64File(file);

            // console.log(((window as any).aaa = base64File));
            downloadBase64File(base64File as any);
          }}
        >
          <Button>Click to Upload</Button>
        </Upload>
        <vueApp.Render />
      </div>
    );
  });
});
