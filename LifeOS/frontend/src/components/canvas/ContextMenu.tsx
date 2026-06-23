import { CheckCircle2, Flag, FileText, Lightbulb, Target, Link, DollarSign, ListTodo, Type, Image as ImageIcon, Map, HelpCircle, AlertTriangle, MessageSquare } from 'lucide-react';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onAddNode: (type: string, data: any) => void;
}

export default function ContextMenu({ x, y, onClose, onAddNode }: ContextMenuProps) {
  const menuItems = [
    { icon: CheckCircle2, label: 'Add Task', type: 'taskNode', data: { title: 'New Task', status: 'To Do', priority: 'Medium' }, color: 'var(--color-accent-violet)' },
    { icon: Flag, label: 'Add Milestone', type: 'milestoneNode', data: { title: 'New Milestone', progress: 0 }, color: 'var(--color-accent-emerald)' },
    { icon: FileText, label: 'Add Note', type: 'noteNode', data: { content: 'Type your note here...' }, color: 'var(--color-accent-amber)' },
    { icon: Lightbulb, label: 'Add Idea', type: 'ideaNode', data: { idea: 'What if we...' }, color: 'var(--color-accent-amber)' },
    { icon: Target, label: 'Add Goal', type: 'goalNode', data: { title: 'Major Objective', target: 'Describe goal...' }, color: 'var(--color-accent-rose)' },
    { icon: Link, label: 'Add Resource', type: 'resourceNode', data: { title: 'Reference Link', url: 'https://...' }, color: 'var(--color-accent-cyan)' },
    { icon: DollarSign, label: 'Add Budget Block', type: 'budgetNode', data: { title: 'Budget Plan', total: 10000, current: 0 }, color: 'var(--color-accent-emerald)' },
    { icon: ListTodo, label: 'Add Checklist', type: 'taskNode', data: { title: 'Checklist', isChecklist: true }, color: 'var(--color-text-primary)' }, // Reusing taskNode
    { icon: Type, label: 'Add Heading', type: 'headingNode', data: { text: 'Heading' }, color: 'var(--color-text-primary)' },
    { icon: ImageIcon, label: 'Add Image', type: 'imageNode', data: { url: 'https://via.placeholder.com/300' }, color: 'var(--color-accent-violet)' },
    { icon: MessageSquare, label: 'Add Decision', type: 'decisionNode', data: { decision: 'We decided to...' }, color: 'var(--color-accent-indigo)' },
    { icon: HelpCircle, label: 'Add Question', type: 'questionNode', data: { question: 'What should we do about...?' }, color: 'var(--color-accent-blue)' },
    { icon: AlertTriangle, label: 'Add Risk', type: 'riskNode', data: { risk: 'Potential issue...' }, color: 'var(--color-accent-rose)' },
    { icon: Map, label: 'Add Sticky Note', type: 'stickyNode', data: { content: 'Sticky Note', color: 'yellow' }, color: '#FCD34D' },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        top: y,
        left: x,
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.05)',
        padding: '6px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        width: 220,
        maxHeight: 400,
        overflowY: 'auto'
      }}
      onMouseLeave={onClose}
    >
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', padding: '6px 10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Add to Canvas
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {menuItems.map((item, i) => (
          <button
            key={i}
            onClick={() => onAddNode(item.type, item.data)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              textAlign: 'left',
              padding: '8px 10px',
              background: 'transparent',
              border: 'none',
              color: 'var(--color-text-primary)',
              cursor: 'pointer',
              borderRadius: 'var(--radius-md)',
              fontSize: 13,
              fontWeight: 500,
              transition: 'background 0.1s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg-tertiary)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <item.icon size={16} color={item.color} />
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
