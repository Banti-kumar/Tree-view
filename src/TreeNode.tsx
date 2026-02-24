import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import { TreeNodeType } from "./types";

import {
  useSortable,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

interface Props {
  node: TreeNodeType;
  depth: number;
  tree: TreeNodeType[];
  setTree: React.Dispatch<React.SetStateAction<TreeNodeType[]>>;
  expanded: Set<string>;
  toggleExpand: (id: string) => void;
}

export const TreeNode = ({
  node,
  depth,
  tree,
  setTree,
  expanded,
  toggleExpand,
}: Props) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: node.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const [editing, setEditing] = useState(false);
  const [adding, setAdding] = useState(false);
  const [value, setValue] = useState(node.name);
  const [loading, setLoading] = useState(false);

  const isExpanded = expanded.has(node.id);

  const updateNode = (
    nodes: TreeNodeType[],
    id: string,
    name: string
  ): TreeNodeType[] =>
    nodes.map((n) =>
      n.id === id
        ? { ...n, name }
        : {
            ...n,
            children: n.children
              ? updateNode(n.children, id, name)
              : undefined,
          }
    );

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

  const insertChild = (
    nodes: TreeNodeType[],
    parentId: string,
    child: TreeNodeType
  ): TreeNodeType[] =>
    nodes.map((n) =>
      n.id === parentId
        ? {
            ...n,
            children: [...(n.children || []), child],
          }
        : {
            ...n,
            children: n.children
              ? insertChild(n.children, parentId, child)
              : undefined,
          }
    );

  const handleExpand = () => {
    if (node.isLazy && !node.children) {
      setLoading(true);
      setTimeout(() => {
        setTree((prev) =>
          insertChild(prev, node.id, {
            id: crypto.randomUUID(),
            name: "Lazy Loaded Item",
          })
        );
        setLoading(false);
      }, 800);
    }
    toggleExpand(node.id);
  };

  const handleDelete = () => {
    if (
      window.confirm(
        "Delete this node and its entire subtree?"
      )
    ) {
      setTree((prev) => removeNode(prev, node.id));
    }
  };

  const handleAdd = (name: string) => {
    if (!name.trim()) return;
    setTree((prev) =>
      insertChild(prev, node.id, {
        id: crypto.randomUUID(),
        name: name.trim(),
      })
    );
  };

  const handleUpdate = () => {
    if (!value.trim()) return;
    setTree((prev) =>
      updateNode(prev, node.id, value.trim())
    );
    setEditing(false);
  };

  return (
    <div>
      <div
        ref={setNodeRef}
        style={{
          ...style,
          paddingLeft: depth * 16,
        }}
        className="tree-node"
      >
        {(node.children || node.isLazy) && (
          <span
            className="expand-icon"
            onClick={handleExpand}
          >
            {isExpanded ? "▼" : "▶"}
          </span>
        )}

        <span
          className="drag-handle"
          {...attributes}
          {...listeners}
        >
          ☰
        </span>

        {editing ? (
          <input
            value={value}
            autoFocus
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleUpdate();
              if (e.key === "Escape") {
                setValue(node.name);
                setEditing(false);
              }
            }}
          />
        ) : (
          <span
            className="node-name"
            onDoubleClick={() => setEditing(true)}
          >
            {node.name}
          </span>
        )}

        <button onClick={() => setAdding(true)}>+</button>
        <button onClick={handleDelete}>×</button>
      </div>

      {adding && (
        <div style={{ paddingLeft: (depth + 1) * 16 }}>
          <input
            autoFocus
            placeholder="New node"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleAdd(
                  (e.target as HTMLInputElement).value
                );
                setAdding(false);
              }
              if (e.key === "Escape") setAdding(false);
            }}
          />
        </div>
      )}

      {loading && (
        <div
          className="loading"
          style={{ paddingLeft: (depth + 1) * 16 }}
        >
          Loading...
        </div>
      )}

      {isExpanded && node.children && (
        <SortableContext
          items={node.children.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              tree={tree}
              setTree={setTree}
              expanded={expanded}
              toggleExpand={toggleExpand}
            />
          ))}
        </SortableContext>
      )}
    </div>
  );
};