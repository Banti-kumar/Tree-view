export type TreeNodeType = {
  id: string;
  name: string;
  children?: TreeNodeType[];
  isLazy?: boolean;
};