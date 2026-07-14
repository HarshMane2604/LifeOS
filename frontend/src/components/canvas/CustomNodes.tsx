import { Handle, Position, useReactFlow, NodeResizer } from '@xyflow/react';
   
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
import { CheckCircle2, Flag, FileText, Lightbulb, Target, Link as LinkIcon, DollarSign, MessageSquare, HelpCircle, AlertTriangle, X, Circle, Square } from 'lucide-react';

const DeleteButton = ({ id }: { id: string }) => {
  const { setNodes } = useReactFlow();

  return (
    <button
      className="nodrag"
      onClick={(e) => {
        e.stopPropagation();
        setNodes((nds) => nds.filter((node) => node.id !== id));
      }}
      style={{
        position: 'absolute',
        top: 8,
        right: 8,
        background: 'transparent',
        border: 'none',
        color: 'var(--color-text-muted)',
        cursor: 'pointer',
        padding: 4,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        transition: 'all 0.2s',
      }}
      title="Delete"
      onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-muted)'; e.currentTarget.style.background = 'transparent'; }}
    >
      <X size={14} />
    </button>
  );
};

// Common wrapper for nodes
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
const NodeWrapper = ({ id, children, color, style = {} }: any) => (
  <div style={{
    background: 'var(--color-bg-primary)',
    border: `2px solid ${color}`,
    borderRadius: 'var(--radius-lg)',
    padding: 16,
    width: 280,
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    position: 'relative',
    ...style
  }}>
    <Handle type="target" position={Position.Top} style={{ background: color, width: 10, height: 10 }} />
    {id && <DeleteButton id={id} />}
    {children}
    <Handle type="source" position={Position.Bottom} style={{ background: color, width: 10, height: 10 }} />
  </div>
);

// Generic Input component for editable text
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
const EditableText = ({ id, field, value, placeholder, style, multiline = false }: any) => {
  const { updateNodeData } = useReactFlow();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChange = (e: any) => {
    updateNodeData(id, { [field]: e.target.value });
  };

  if (multiline) {
    return (
      <textarea
        value={value || ''}
        onChange={handleChange}
        placeholder={placeholder}
        className="nodrag"
        style={{
          width: '100%', background: 'transparent', border: 'none', outline: 'none', resize: 'none',
          color: 'var(--color-text-secondary)', fontSize: 13, minHeight: 60, ...style
        }}
      />
    );
  }

  return (
    <input
      value={value || ''}
      onChange={handleChange}
      placeholder={placeholder}
      className="nodrag"
      style={{
        width: '100%', background: 'transparent', border: 'none', outline: 'none',
        color: 'var(--color-text-primary)', fontWeight: 600, ...style
      }}
    />
  );
};

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
export function TaskNode({ id, _data }: any) {
  const color = 'var(--color-accent-violet)';
  const { updateNodeData } = useReactFlow();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleStatusChange = (e: any) => updateNodeData(id, { status: e.target.value });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handlePriorityChange = (e: any) => updateNodeData(id, { priority: e.target.value });

  return (
    <NodeWrapper id={id} color={color}>
      <input
        type="date"
        value={_data.dueDate || ''}
        onChange={(e) => updateNodeData(id, { dueDate: e.target.value })}
        className="nodrag"
        style={{
          position: 'absolute',
          top: 10,
          right: 36,
          background: 'transparent',
          border: 'none',
          outline: 'none',
          color: 'var(--color-text-muted)',
          fontSize: 11,
          fontFamily: 'inherit',
          cursor: 'pointer'
        }}
        title="Due Date"
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color }}>
        <CheckCircle2 size={16} />
        <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Task</div>
      </div>
      <EditableText id={id} field="title" value={_data.title} placeholder="Task Title" style={{ fontSize: 16, marginBottom: 8 }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--color-text-muted)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span>Status:</span>
          <select
            value={_data.status || 'To Do'}
            onChange={handleStatusChange}
            className="nodrag"
            style={{
              background: 'transparent', border: 'none', outline: 'none',
              color: 'var(--color-text-primary)', cursor: 'pointer', fontSize: 12, padding: 0
            }}
          >
            <option value="To Do" style={{ background: 'var(--color-bg-primary)' }}>To Do</option>
            <option value="In Progress" style={{ background: 'var(--color-bg-primary)' }}>In Progress</option>
            <option value="Done" style={{ background: 'var(--color-bg-primary)' }}>Done</option>
            <option value="Blocked" style={{ background: 'var(--color-bg-primary)' }}>Blocked</option>
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span>Pri:</span>
          <select
            value={_data.priority || 'Med'}
            onChange={handlePriorityChange}
            className="nodrag"
            style={{
              background: 'transparent', border: 'none', outline: 'none',
              color: 'var(--color-text-primary)', cursor: 'pointer', fontSize: 12, padding: 0
            }}
          >
            <option value="Low" style={{ background: 'var(--color-bg-primary)' }}>Low</option>
            <option value="Med" style={{ background: 'var(--color-bg-primary)' }}>Med</option>
            <option value="High" style={{ background: 'var(--color-bg-primary)' }}>High</option>
          </select>
        </div>
      </div>
    </NodeWrapper>
  );
}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
export function MilestoneNode({ id, _data }: any) {
  const color = 'var(--color-accent-emerald)';
  return (
    <NodeWrapper id={id} color={color} style={{ background: 'rgba(16, 185, 129, 0.05)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color }}>
        <Flag size={16} />
        <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Milestone</div>
      </div>
      <EditableText id={id} field="title" value={_data.title} placeholder="Milestone Name" style={{ fontSize: 16 }} />
    </NodeWrapper>
  );
}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
export function NoteNode({ id, _data }: any) {
  const color = 'var(--color-accent-amber)';
  return (
    <NodeWrapper id={id} color={color}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color }}>
        <FileText size={16} />
        <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Note</div>
      </div>
      <EditableText id={id} field="content" value={_data.content} placeholder="Take notes..." multiline />
    </NodeWrapper>
  );
}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
export function IdeaNode({ id, _data }: any) {
  const color = 'var(--color-accent-amber)';
  return (
    <NodeWrapper id={id} color={color} style={{ borderStyle: 'dashed' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color }}>
        <Lightbulb size={16} />
        <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Idea</div>
      </div>
      <EditableText id={id} field="idea" value={_data.idea} placeholder="What if..." multiline />
    </NodeWrapper>
  );
}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
export function GoalNode({ id, _data }: any) {
  const color = 'var(--color-accent-rose)';
  return (
    <NodeWrapper id={id} color={color} style={{ background: 'rgba(244, 63, 94, 0.05)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color }}>
        <Target size={16} />
        <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Goal</div>
      </div>
      <EditableText id={id} field="title" value={_data.title} placeholder="Goal Title" style={{ fontSize: 18 }} />
      <EditableText id={id} field="target" value={_data.target} placeholder="Target Details..." multiline style={{ marginTop: 8 }} />
    </NodeWrapper>
  );
}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
export function BudgetNode({ id, _data }: any) {
  const color = 'var(--color-accent-emerald)';
  return (
    <NodeWrapper id={id} color={color}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color }}>
        <DollarSign size={16} />
        <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Budget Plan</div>
      </div>
      <EditableText id={id} field="title" value={_data.title} placeholder="Budget Name" style={{ fontSize: 16, marginBottom: 12 }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
        <span style={{ color: 'var(--color-text-muted)' }}>Total:</span>
        <span style={{ fontWeight: 600 }}>₹{_data.total || 0}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 12 }}>
        <span style={{ color: 'var(--color-text-muted)' }}>Saved:</span>
        <span style={{ fontWeight: 600 }}>₹{_data.current || 0}</span>
      </div>
      <div style={{ width: '100%', height: 6, background: 'var(--color-bg-tertiary)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: `${Math.min(100, ((_data.current || 0) / (_data.total || 1)) * 100)}%`, height: '100%', background: color }} />
      </div>
    </NodeWrapper>
  );
}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ResourceNode({ id, _data }: any) {
  const color = 'var(--color-accent-cyan)';
  return (
    <NodeWrapper id={id} color={color}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color }}>
        <LinkIcon size={16} />
        <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Resource</div>
      </div>
      <EditableText id={id} field="title" value={_data.title} placeholder="Resource Name" style={{ fontSize: 14, marginBottom: 4 }} />
      <EditableText id={id} field="url" value={_data.url} placeholder="https://..." style={{ fontSize: 12, color, fontWeight: 400 }} />
    </NodeWrapper>
  );
}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
export function DecisionNode({ id, _data }: any) {
  const color = 'var(--color-accent-indigo)';
  return (
    <NodeWrapper id={id} color={color}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color }}>
        <MessageSquare size={16} />
        <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Decision</div>
      </div>
      <EditableText id={id} field="decision" value={_data.decision} placeholder="We decided to..." multiline />
    </NodeWrapper>
  );
}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
export function QuestionNode({ id, _data }: any) {
  const color = 'var(--color-accent-blue)';
  return (
    <NodeWrapper id={id} color={color}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color }}>
        <HelpCircle size={16} />
        <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Question</div>
      </div>
      <EditableText id={id} field="question" value={_data.question} placeholder="What should we...?" multiline />
    </NodeWrapper>
  );
}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
export function RiskNode({ id, _data }: any) {
  const color = 'var(--color-accent-rose)';
  return (
    <NodeWrapper id={id} color={color}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color }}>
        <AlertTriangle size={16} />
        <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Risk</div>
      </div>
      <EditableText id={id} field="risk" value={_data.risk} placeholder="Potential issue..." multiline />
    </NodeWrapper>
  );
}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
export function StickyNode({ id, _data }: any) {
  const bgColors: Record<string, string> = {
    yellow: '#FEF08A',
    blue: '#BFDBFE',
    green: '#BBF7D0',
    purple: '#E9D5FF',
    pink: '#FBCFE8',
    orange: '#FED7AA'
  };
  const color = bgColors[_data.color || 'yellow'];

  return (
    <div style={{
      background: color,
      padding: 16,
      width: 220,
      minHeight: 220,
      boxShadow: '2px 4px 12px rgba(0,0,0,0.1)',
      position: 'relative',
      transform: 'rotate(-1deg)' // Slight tilt for sticky feel
    }}>
      {id && <DeleteButton id={id} />}
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <EditableText id={id} field="content" value={_data.content} placeholder="Sticky note..." multiline style={{ color: '#000', fontSize: 15, fontWeight: 500 }} />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </div>
  );
}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
export function HeadingNode({ id, _data }: any) {
  return (
    <div style={{ padding: '8px 32px 8px 8px', position: 'relative' }}>
      {id && <DeleteButton id={id} />}
      <EditableText id={id} field="text" value={_data.text} placeholder="Heading" style={{ fontSize: 32, fontWeight: 800, color: 'var(--color-text-primary)' }} />
    </div>
  );
}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ImageNode({ id, _data }: any) {
  return (
    <div style={{ padding: 4, background: 'var(--color-bg-primary)', borderRadius: 'var(--radius-md)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', position: 'relative' }}>
      {id && <DeleteButton id={id} />}
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <img src={_data.url} alt="Canvas Image" style={{ maxWidth: 300, borderRadius: 'var(--radius-sm)' }} />
      <EditableText id={id} field="url" value={_data.url} placeholder="Image URL..." style={{ fontSize: 10, marginTop: 4, fontWeight: 400 }} />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </div>
  );
}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
export function CircleNode({ id, _data, selected }: any) {
  const color = 'var(--color-accent-blue)';
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { updateNodeData } = useReactFlow();

  return (
    <>
      <NodeResizer minWidth={60} minHeight={60} isVisible={selected} lineStyle={{ borderColor: 'var(--color-border-active)' }} />
      <div style={{
        width: '100%',
        height: '100%',
        minWidth: 120,
        minHeight: 120,
        borderRadius: '50%',
        background: _data.bgColor || 'var(--color-bg-primary)',
        border: `2px solid ${selected ? 'var(--color-border-active)' : color}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
      }}>
        <DeleteButton id={id} />
        <EditableText
          id={id}
          field="text"
          value={_data.text}
          placeholder="Circle"
          style={{ fontSize: 14, textAlign: 'center', fontWeight: 600, width: '80%' }}
        />
        <Handle type="target" position={Position.Top} className="handle-default" />
        <Handle type="source" position={Position.Bottom} className="handle-default" />
        <Handle type="target" position={Position.Left} className="handle-default" />
        <Handle type="source" position={Position.Right} className="handle-default" />
      </div>
    </>
  );
}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
export function RectangleNode({ id, _data, selected }: any) {
  const color = 'var(--color-accent-amber)';
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { updateNodeData } = useReactFlow();

  return (
    <>
      <NodeResizer minWidth={60} minHeight={60} isVisible={selected} lineStyle={{ borderColor: 'var(--color-border-active)' }} />
      <div style={{
        width: '100%',
        height: '100%',
        minWidth: 160,
        minHeight: 100,
        borderRadius: 'var(--radius-md)',
        background: _data.bgColor || 'var(--color-bg-primary)',
        border: `2px solid ${selected ? 'var(--color-border-active)' : color}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
      }}>
        <DeleteButton id={id} />
        <EditableText
          id={id}
          field="text"
          value={_data.text}
          placeholder="Rectangle"
          style={{ fontSize: 14, textAlign: 'center', fontWeight: 600, width: '90%' }}
        />
        <Handle type="target" position={Position.Top} className="handle-default" />
        <Handle type="source" position={Position.Bottom} className="handle-default" />
        <Handle type="target" position={Position.Left} className="handle-default" />
        <Handle type="source" position={Position.Right} className="handle-default" />
      </div>
    </>
  );
}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
export function SquareNode({ id, _data, selected }: any) {
  const color = 'var(--color-accent-amber)';
  return (
    <>
      <NodeResizer minWidth={60} minHeight={60} isVisible={selected} lineStyle={{ borderColor: 'var(--color-border-active)' }} />
      <div style={{
        width: '100%', height: '100%', minWidth: 120, minHeight: 120,
        borderRadius: 'var(--radius-sm)',
        background: _data.bgColor || 'var(--color-bg-primary)',
        border: `2px solid ${selected ? 'var(--color-border-active)' : color}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
        boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
      }}>
        <DeleteButton id={id} />
        <EditableText id={id} field="text" value={_data.text} placeholder="Square" style={{ fontSize: 14, textAlign: 'center', fontWeight: 600, width: '90%' }} />
        <Handle type="target" position={Position.Top} className="handle-default" />
        <Handle type="source" position={Position.Bottom} className="handle-default" />
        <Handle type="target" position={Position.Left} className="handle-default" />
        <Handle type="source" position={Position.Right} className="handle-default" />
      </div>
    </>
  );
}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
export function RhombusNode({ id, _data, selected }: any) {
  const color = 'var(--color-accent-blue)';
  return (
    <>
      <NodeResizer minWidth={60} minHeight={60} isVisible={selected} lineStyle={{ borderColor: 'var(--color-border-active)' }} />
      <div style={{
        width: '100%', height: '100%', minWidth: 120, minHeight: 120,
        background: _data.bgColor || 'var(--color-bg-primary)',
        border: `2px solid ${selected ? 'var(--color-border-active)' : color}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
        transform: 'rotate(45deg)',
        boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
      }}>
        <div style={{ transform: 'rotate(-45deg)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <EditableText id={id} field="text" value={_data.text} placeholder="Rhombus" style={{ fontSize: 14, textAlign: 'center', fontWeight: 600, width: '100px' }} />
        </div>
        <DeleteButton id={id} />
        <Handle type="target" position={Position.Top} className="handle-default" style={{ transform: 'rotate(-45deg)' }} />
        <Handle type="source" position={Position.Bottom} className="handle-default" style={{ transform: 'rotate(-45deg)' }} />
        <Handle type="target" position={Position.Left} className="handle-default" style={{ transform: 'rotate(-45deg)' }} />
        <Handle type="source" position={Position.Right} className="handle-default" style={{ transform: 'rotate(-45deg)' }} />
      </div>
    </>
  );
}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
export function BubbleNode({ id, _data, selected }: any) {
  const color = 'var(--color-accent-emerald)';
  return (
    <>
      <NodeResizer minWidth={60} minHeight={60} isVisible={selected} lineStyle={{ borderColor: 'var(--color-border-active)' }} />
      <div style={{
        width: '100%', height: '100%', minWidth: 140, minHeight: 80,
        borderRadius: '24px', borderBottomLeftRadius: '4px',
        background: _data.bgColor || 'var(--color-bg-primary)',
        border: `2px solid ${selected ? 'var(--color-border-active)' : color}`,
        padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
        boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
      }}>
        <DeleteButton id={id} />
        <EditableText id={id} field="text" value={_data.text} placeholder="Bubble" multiline style={{ fontSize: 14, textAlign: 'center', fontWeight: 500, width: '100%' }} />
        <Handle type="target" position={Position.Top} className="handle-default" />
        <Handle type="source" position={Position.Bottom} className="handle-default" />
        <Handle type="target" position={Position.Left} className="handle-default" />
        <Handle type="source" position={Position.Right} className="handle-default" />
      </div>
    </>
  );
}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
export function HexagonNode({ id, _data, selected }: any) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const color = 'var(--color-accent-violet)';
  return (
    <>
      <NodeResizer minWidth={60} minHeight={60} isVisible={selected} lineStyle={{ borderColor: 'var(--color-border-active)' }} />
      <div style={{
        width: '100%', height: '100%', minWidth: 140, minHeight: 120,
        background: _data.bgColor || 'var(--color-bg-secondary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
        clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
      }}>
        <EditableText id={id} field="text" value={_data.text} placeholder="Hexagon" style={{ fontSize: 14, textAlign: 'center', fontWeight: 600, width: '80%', zIndex: 1 }} />
        <DeleteButton id={id} />
        <Handle type="target" position={Position.Top} className="handle-default" />
        <Handle type="source" position={Position.Bottom} className="handle-default" />
        <Handle type="target" position={Position.Left} className="handle-default" />
        <Handle type="source" position={Position.Right} className="handle-default" />
      </div>
    </>
  );
}

   
   
   
   
   
   
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
export function DividerNode({ id, data, selected }: any) {
  const color = 'var(--color-text-muted)';
  return (
    <div style={{
      width: 200, height: 40,
      display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
    }}>
      <div style={{ width: '100%', height: 2, background: selected ? 'var(--color-border-active)' : color }} />
      <DeleteButton id={id} />
    </div>
  );
}
