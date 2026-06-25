import React, { useState } from 'react';
import { CheckCircle2, Flag, FileText, Lightbulb, Target, Type, Image as ImageIcon, Map, MousePointer2, Minus, ArrowUpRight, Square, Circle, Undo2, Redo2, Shapes, ChevronRight, Diamond, MessageCircle, Hexagon } from 'lucide-react';

interface CanvasToolbarProps {
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

export default function CanvasToolbar({ onUndo, onRedo, canUndo = false, canRedo = false }: CanvasToolbarProps) {
  const [shapesOpen, setShapesOpen] = useState(false);

  const onDragStart = (event: React.DragEvent, nodeType: string, data: any) => {
    event.dataTransfer.setData('application/reactflow/type', nodeType);
    event.dataTransfer.setData('application/reactflow/data', JSON.stringify(data));
    event.dataTransfer.effectAllowed = 'move';
  };

  const tools = [
    { icon: MousePointer2, label: 'Select', color: 'var(--color-accent-violet)', bg: 'rgba(139, 92, 246, 0.1)' },
    { icon: FileText, label: 'Note', type: 'noteNode', data: { content: 'Type your note here...' }, color: 'var(--color-accent-amber)' },
    { icon: CheckCircle2, label: 'Task', type: 'taskNode', data: { title: 'New Task', status: 'To Do', priority: 'Medium' }, color: 'var(--color-accent-emerald)' },
    { icon: Flag, label: 'Milestone', type: 'milestoneNode', data: { title: 'New Milestone', progress: 0 }, color: 'var(--color-accent-blue)' },
    { icon: Target, label: 'Goal', type: 'goalNode', data: { title: 'Major Objective', target: 'Describe goal...' }, color: 'var(--color-accent-rose)' },
    { icon: Lightbulb, label: 'Idea', type: 'ideaNode', data: { idea: 'What if we...' }, color: 'var(--color-accent-amber)' },
    { icon: Type, label: 'Heading', type: 'headingNode', data: { text: 'Heading' }, color: 'var(--color-text-primary)' },
    { icon: Map, label: 'Sticky', type: 'stickyNode', data: { content: 'Sticky Note', color: 'yellow' }, color: '#FCD34D' },
  ];

  const shapes = [
    { icon: Circle, label: 'Circle', type: 'circleNode', data: { text: 'Circle' }, color: 'var(--color-accent-blue)' },
    { icon: Square, label: 'Rectangle', type: 'rectangleNode', data: { text: 'Rectangle' }, color: 'var(--color-accent-amber)' },
    { icon: Square, label: 'Square', type: 'squareNode', data: { text: 'Square' }, color: 'var(--color-accent-rose)' },
    { icon: Diamond, label: 'Rhombus', type: 'rhombusNode', data: { text: 'Rhombus' }, color: 'var(--color-accent-emerald)' },
    { icon: MessageCircle, label: 'Bubble', type: 'bubbleNode', data: { text: 'Bubble' }, color: 'var(--color-accent-violet)' },
    { icon: Hexagon, label: 'Hexagon', type: 'hexagonNode', data: { text: 'Hexagon' }, color: 'var(--color-accent-blue)' },
    { icon: Minus, label: 'Divider', type: 'dividerNode', data: {}, color: 'var(--color-text-muted)' },
  ];

  return (
    <>
      <style>
        {`
          .canvas-toolbar-scroll::-webkit-scrollbar {
            display: none;
          }
          .canvas-toolbar-scroll {
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;  /* Firefox */
          }
        `}
      </style>
      <div 
        className="canvas-toolbar-scroll"
        style={{
          position: 'absolute',
          left: 20,
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'var(--color-bg-primary)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          padding: '8px 4px',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          zIndex: 10,
          maxHeight: 'calc(100% - 40px)',
          overflowY: 'auto',
          overflowX: 'hidden'
        }}
      >
        {tools.map((tool, i) => (
        <div
          key={i}
          draggable={!!tool.type}
          onDragStart={(e) => tool.type && onDragStart(e, tool.type, tool.data)}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: 60,
            height: 60,
            borderRadius: 'var(--radius-md)',
            cursor: tool.type ? 'grab' : 'pointer',
            background: tool.bg || 'transparent',
            transition: 'background 0.2s',
            margin: '0 4px'
          }}
          onMouseEnter={e => { if (!tool.bg) e.currentTarget.style.background = 'var(--color-bg-tertiary)'; }}
          onMouseLeave={e => { if (!tool.bg) e.currentTarget.style.background = 'transparent'; }}
          title={tool.label + (tool.type ? ' (Drag to canvas)' : '')}
        >
          <tool.icon size={20} color={tool.color} style={{ marginBottom: 4 }} />
          <span style={{ fontSize: 10, fontWeight: 600, color: tool.bg ? tool.color : 'var(--color-text-muted)' }}>{tool.label}</span>
        </div>
      ))}

      {/* Shapes Dropdown */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: 60,
          height: 60,
          borderRadius: 'var(--radius-md)',
          cursor: 'pointer',
          background: shapesOpen ? 'var(--color-bg-tertiary)' : 'transparent',
          transition: 'background 0.2s',
          margin: '0 4px',
          position: 'relative'
        }}
        onClick={() => setShapesOpen(!shapesOpen)}
        onMouseEnter={e => { if (!shapesOpen) e.currentTarget.style.background = 'var(--color-bg-tertiary)'; }}
        onMouseLeave={e => { if (!shapesOpen) e.currentTarget.style.background = 'transparent'; }}
        title="Shapes"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Shapes size={20} color="var(--color-text-primary)" style={{ marginBottom: 4 }} />
          <ChevronRight size={12} style={{ transform: shapesOpen ? 'rotate(90deg)' : 'none', transition: '0.2s' }} />
        </div>
        <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-text-muted)' }}>Shapes</span>

        {shapesOpen && (
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              left: 70,
              top: -50,
              background: 'var(--color-bg-primary)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
              padding: '8px 0',
              display: 'flex',
              flexDirection: 'column',
              minWidth: '180px',
              zIndex: 100
            }}
          >
            <div style={{ padding: '4px 16px 8px', fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--color-border)' }}>
              Shapes (Drag to add)
            </div>
            <div style={{ padding: '8px 0' }}>
              {shapes.map((shape, i) => (
                <div
                  key={i}
                  draggable={true}
                  onDragStart={(e) => {
                    onDragStart(e, shape.type, shape.data);
                  }}
                  onDragEnd={() => setShapesOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '8px 16px',
                    cursor: 'grab',
                    transition: 'background 0.1s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg-tertiary)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  title={shape.label + ' (Drag to canvas)'}
                >
                  <shape.icon size={16} color="var(--color-text-primary)" />
                  <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>{shape.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>



      {/* Divider */}
      <div style={{ height: 1, background: 'var(--color-border)', margin: '4px 8px' }} />

      {/* Undo / Redo */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <button
          onClick={onUndo}
          disabled={!canUndo}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: 60,
            height: 50,
            borderRadius: 'var(--radius-md)',
            cursor: canUndo ? 'pointer' : 'not-allowed',
            background: 'transparent',
            border: 'none',
            color: canUndo ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
            opacity: canUndo ? 1 : 0.5,
            transition: 'background 0.2s',
            margin: '0 4px'
          }}
          onMouseEnter={e => { if (canUndo) e.currentTarget.style.background = 'var(--color-bg-tertiary)'; }}
          onMouseLeave={e => { if (canUndo) e.currentTarget.style.background = 'transparent'; }}
          title="Undo"
        >
          <Undo2 size={18} style={{ marginBottom: 4 }} />
          <span style={{ fontSize: 10, fontWeight: 600 }}>Undo</span>
        </button>

        <button
          onClick={onRedo}
          disabled={!canRedo}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: 60,
            height: 50,
            borderRadius: 'var(--radius-md)',
            cursor: canRedo ? 'pointer' : 'not-allowed',
            background: 'transparent',
            border: 'none',
            color: canRedo ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
            opacity: canRedo ? 1 : 0.5,
            transition: 'background 0.2s',
            margin: '0 4px'
          }}
          onMouseEnter={e => { if (canRedo) e.currentTarget.style.background = 'var(--color-bg-tertiary)'; }}
          onMouseLeave={e => { if (canRedo) e.currentTarget.style.background = 'transparent'; }}
          title="Redo"
        >
          <Redo2 size={18} style={{ marginBottom: 4 }} />
          <span style={{ fontSize: 10, fontWeight: 600 }}>Redo</span>
        </button>
      </div>

      </div>
    </>
  );
}
