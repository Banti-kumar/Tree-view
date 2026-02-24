import { TreeNodeType } from "./types";

export const initialTreeData: TreeNodeType[] = [
  {
    id: crypto.randomUUID(),
    name: "src",
    children: [
      {
        id: crypto.randomUUID(),
        name: "components",
        isLazy: true,
      },
      {
        id: crypto.randomUUID(),
        name: "utils",
        children: [],
      },
    ],
  },
  {
    id: crypto.randomUUID(),
    name: "package.json",
  },
];