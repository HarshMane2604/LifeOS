import { useState, useCallback } from 'react';
import { Node, Edge } from '@xyflow/react';

export function useCanvasHistory() {
  const [past, setPast] = useState<{ nodes: Node[]; edges: Edge[] }[]>([]);
  const [future, setFuture] = useState<{ nodes: Node[]; edges: Edge[] }[]>([]);

  const takeSnapshot = useCallback((nodes: Node[], edges: Edge[]) => {
    setPast((p) => {
      // Don't save if it's identical to the last state
      if (p.length > 0) {
        const last = p[p.length - 1];
        if (JSON.stringify(last.nodes) === JSON.stringify(nodes) && JSON.stringify(last.edges) === JSON.stringify(edges)) {
          return p;
        }
      }
      return [...p, { nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) }];
    });
    setFuture([]);
  }, []);

  const undo = useCallback(
    (currentNodes: Node[], currentEdges: Edge[], setNodes: (n: Node[]) => void, setEdges: (e: Edge[]) => void) => {
      if (past.length === 0) return;

      const previous = past[past.length - 1];
      const newPast = past.slice(0, past.length - 1);

      setPast(newPast);
      setFuture((f) => [{ nodes: currentNodes, edges: currentEdges }, ...f]);

      setNodes(previous.nodes);
      setEdges(previous.edges);
    },
    [past]
  );

  const redo = useCallback(
    (currentNodes: Node[], currentEdges: Edge[], setNodes: (n: Node[]) => void, setEdges: (e: Edge[]) => void) => {
      if (future.length === 0) return;

      const next = future[0];
      const newFuture = future.slice(1);

      setPast((p) => [...p, { nodes: currentNodes, edges: currentEdges }]);
      setFuture(newFuture);

      setNodes(next.nodes);
      setEdges(next.edges);
    },
    [future]
  );

  return { takeSnapshot, undo, redo, canUndo: past.length > 0, canRedo: future.length > 0 };
}
