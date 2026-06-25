import { useCallback, useState, useRef, useEffect } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Controls,
  Background,
  MiniMap,
  Node,
  Panel,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import ContextMenu from "./ContextMenu";
import CanvasToolbar from "./CanvasToolbar";
import {
  TaskNode,
  MilestoneNode,
  NoteNode,
  IdeaNode,
  GoalNode,
  ResourceNode,
  BudgetNode,
  DecisionNode,
  QuestionNode,
  RiskNode,
  StickyNode,
  HeadingNode,
  ImageNode,
  CircleNode,
  RectangleNode,
  SquareNode,
  RhombusNode,
  BubbleNode,
  HexagonNode,
  DividerNode,
} from "./CustomNodes";
import { useCanvasHistory } from "../../hooks/useCanvasHistory";

const nodeTypes = {
  taskNode: TaskNode,
  milestoneNode: MilestoneNode,
  noteNode: NoteNode,
  ideaNode: IdeaNode,
  goalNode: GoalNode,
  resourceNode: ResourceNode,
  budgetNode: BudgetNode,
  decisionNode: DecisionNode,
  questionNode: QuestionNode,
  riskNode: RiskNode,
  stickyNode: StickyNode,
  headingNode: HeadingNode,
  imageNode: ImageNode,
  circleNode: CircleNode,
  rectangleNode: RectangleNode,
  squareNode: SquareNode,
  rhombusNode: RhombusNode,
  bubbleNode: BubbleNode,
  hexagonNode: HexagonNode,
  dividerNode: DividerNode,
};

interface MainCanvasProps {
  initialData: any;
  onSave: (data: any) => void;
}

function Flow({ initialData, onSave }: MainCanvasProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(
    initialData?.nodes || [],
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    initialData?.edges || [],
  );
  const { screenToFlowPosition } = useReactFlow();
  const { takeSnapshot, undo, redo, canUndo, canRedo } = useCanvasHistory();

  // Context Menu State
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const [flowPos, setFlowPos] = useState({ x: 0, y: 0 });

  // Auto-save debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      // Don't save if empty on first load (prevents saving empty state immediately)
      if (nodes.length > 0 || edges.length > 0) {
        onSave({ nodes, edges });
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [nodes, edges, onSave]);

  const onConnect = useCallback(
    (params: Connection | Edge) => {
      takeSnapshot(nodes, edges);
      setEdges((eds) => addEdge({ ...params, animated: true }, eds));
    },
    [setEdges, nodes, edges, takeSnapshot],
  );

  const onPaneContextMenu = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();

      const bounds = reactFlowWrapper.current?.getBoundingClientRect();
      if (!bounds) return;

      // Position relative to the screen for the floating HTML menu
      setMenuPos({ x: event.clientX, y: event.clientY });

      // Position relative to the infinite canvas coordinate system for placing new nodes
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      setFlowPos(position);

      setMenuVisible(true);
    },
    [screenToFlowPosition],
  );

  const closeMenu = () => setMenuVisible(false);

  const onPaneClick = useCallback(() => {
    closeMenu();
  }, []);

  const addNode = (type: string, data: any) => {
    takeSnapshot(nodes, edges);
    const newNode: Node = {
      id: `${type}-${Date.now()}`,
      type,
      position: flowPos,
      data,
    };
    setNodes((nds) => nds.concat(newNode));
    closeMenu();
  };

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow/type");
      const dataStr = event.dataTransfer.getData("application/reactflow/data");

      if (typeof type === "undefined" || !type) {
        return;
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      let data = {};
      try {
        data = JSON.parse(dataStr);
      } catch (e) {}

      takeSnapshot(nodes, edges);

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data,
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, setNodes, nodes, edges, takeSnapshot],
  );

  const handleUndo = () => undo(nodes, edges, setNodes, setEdges);
  const handleRedo = () => redo(nodes, edges, setNodes, setEdges);

  return (
    <div ref={reactFlowWrapper} style={{ width: "100%", height: "100%" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onPaneContextMenu={onPaneContextMenu}
        onPaneClick={onPaneClick}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        fitView={nodes.length === 0}
        minZoom={0.1}
        maxZoom={4}
        proOptions={{ hideAttribution: true }} // Hide watermark
      >
        <Background color="var(--color-border-active)" gap={24} size={2} />
        <Controls position="top-right" orientation="horizontal" />
        <MiniMap
          nodeColor={(n) => {
            if (n.type === "noteNode") return "#F59E0B"; // amber
            if (n.type === "taskNode") return "#10B981"; // emerald
            if (n.type === "milestoneNode") return "#3B82F6"; // blue
            if (n.type === "goalNode") return "#F43F5E"; // rose
            if (n.type === "stickyNode") return "#FCD34D"; // yellow
            if (n.type === "circleNode" || n.type === "hexagonNode")
              return "#3B82F6";
            if (n.type === "squareNode" || n.type === "rectangleNode")
              return "#F59E0B";
            if (n.type === "rhombusNode") return "#10B981";
            if (n.type === "bubbleNode") return "#8B5CF6"; // violet
            return "#6B7280"; // gray fallback
          }}
          maskColor="rgba(0, 0, 0, 0.15)"
          style={{
            background: "var(--color-bg-primary)",
            border: "1px solid var(--color-border)",
            borderRadius: 8,
          }}
          pannable
          zoomable
        />

        <CanvasToolbar
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={canUndo}
          canRedo={canRedo}
        />
      </ReactFlow>

      {/* Context Menu */}
      {menuVisible && (
        <ContextMenu
          x={menuPos.x}
          y={menuPos.y}
          onClose={closeMenu}
          onAddNode={addNode}
        />
      )}
    </div>
  );
}

export default function MainCanvas(props: MainCanvasProps) {
  return (
    <ReactFlowProvider>
      <Flow {...props} />
    </ReactFlowProvider>
  );
}
