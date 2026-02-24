import "./styles.css";
import { arrayMove } from "@dnd-kit/sortable";
import { useState } from "react";
import { TreeNode } from "./TreeNode";
import { TreeNodeType } from "./types";

import {
  DndContext,
  DragEndEvent,
  closestCenter,
} from "@dnd-kit/core";

interface Props {
  data: TreeNodeType[];
}

export const TreeView = ({ data }: Props) => {
  const [tree, setTree] = useState<TreeNodeType[]>(data);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const findPath = (
    nodes: TreeNodeType[],
    id: string,
    path: TreeNodeType[] = []
  ): TreeNodeType[] | null => {
    for (const node of nodes) {
      if (node.id === id) return [...path, node];
      if (node.children) {
        const found = findPath(node.children, id, [
          ...path,
          node,
        ]);
        if (found) return found;
      }
    }
    return null;
  };

  const removeNode = (
    nodes: TreeNodeType[],
    id: string
  ): TreeNodeType[] =>
    nodes
      .filter((n) => n.id !== id)
      .map((n) => ({
        ...n,
        children: n.children
          ? removeNode(n.children, id)
          : undefined,
      }));

  const insertNodeAt = (
    nodes: TreeNodeType[],
    parentId: string | null,
    node: TreeNodeType
  ): TreeNodeType[] => {
    if (parentId === null) return [...nodes, node];

    return nodes.map((n) =>
      n.id === parentId
        ? {
            ...n,
            children: [...(n.children || []), node],
          }
        : {
            ...n,
            children: n.children
              ? insertNodeAt(n.children, parentId, node)
              : undefined,
          }
    );
  };

  const isDescendant = (
    parent: TreeNodeType,
    targetId: string
  ): boolean => {
    if (!parent.children) return false;
    for (const child of parent.children) {
      if (child.id === targetId) return true;
      if (isDescendant(child, targetId)) return true;
    }
    return false;
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activePath = findPath(tree, String(active.id));
    const overPath = findPath(tree, String(over.id));
    if (!activePath || !overPath) return;

    const activeNode = activePath[activePath.length - 1];
    const overNode = overPath[overPath.length - 1];

    if (isDescendant(activeNode, overNode.id)) return;

    setTree((prev) => {
      const removed = removeNode(prev, activeNode.id);
      return insertNodeAt(
        removed,
        overNode.id,
        activeNode
      );
    });
  };

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="tree">
        {tree.map((node) => (
          <TreeNode
            key={node.id}
            node={node}
            depth={0}
            tree={tree}
            setTree={setTree}
            expanded={expanded}
            toggleExpand={toggleExpand}
          />
        ))}
      </div>
    </DndContext>
  );
};