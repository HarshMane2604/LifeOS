import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Plus, GripVertical, CheckCircle2, Circle, Clock } from 'lucide-react';
import api from '@/lib/api';
import ResizableSplitPane from '../../components/ui/ResizableSplitPane';
import { Task, TaskStatus } from '@/types/life';
import { formatCurrency } from '@/lib/utils'; // if needed later

// Helper to group tasks by status
const groupTasks = (tasks: Task[]) => {
  const columns: Record<TaskStatus, Task[]> = {
    todo: [],
    in_progress: [],
    done: [],
    cancelled: []
  };
  tasks.forEach(task => {
    if (columns[task.status]) {
      columns[task.status].push(task);
    }
  });
  // Sort by order within each column
  Object.keys(columns).forEach(key => {
    columns[key as TaskStatus].sort((a, b) => a.order - b.order);
  });
  return columns;
};

const columnTitles: Record<TaskStatus, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done',
  cancelled: 'Cancelled'
};

const columnColors: Record<TaskStatus, string> = {
  todo: 'var(--color-bg-secondary)',
  in_progress: 'var(--color-accent-violet-glow)',
  done: 'var(--color-accent-emerald-glow)',
  cancelled: 'var(--color-bg-tertiary)'
};

export default function GoalsPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [columns, setColumns] = useState<Record<TaskStatus, Task[]>>(groupTasks([]));
  const [loading, setLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    setColumns(groupTasks(tasks));
  }, [tasks]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await api.get<Task[]>('/tasks');
      setTasks(data);
    } catch (err) {
      console.error('Failed to fetch tasks', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const sourceStatus = source.droppableId as TaskStatus;
    const destStatus = destination.droppableId as TaskStatus;

    const sourceCol = Array.from(columns[sourceStatus]);
    const destCol = sourceStatus === destStatus ? sourceCol : Array.from(columns[destStatus]);

    const [movedTask] = sourceCol.splice(source.index, 1);

    // Update the task status and order optimisticly
    movedTask.status = destStatus;
    destCol.splice(destination.index, 0, movedTask);

    // Reassign order
    destCol.forEach((task, index) => {
      task.order = index;
    });

    setColumns({
      ...columns,
      [sourceStatus]: sourceCol,
      [destStatus]: destCol,
    });

    // Update backend
    try {
      await api.put(`/tasks/${draggableId}`, {
        status: destStatus,
        order: destination.index
      });
      // Optionally update other tasks orders in destination column if strictly needed in backend
    } catch (err) {
      console.error('Failed to update task status', err);
      // Revert on failure
      fetchTasks();
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      const newTask = await api.post<Task>('/tasks', {
        title: newTaskTitle,
        status: 'todo',
        priority: 'medium',
        order: columns.todo.length
      });
      setTasks([...tasks, newTask]);
      setNewTaskTitle('');
    } catch (err) {
      console.error('Failed to create task', err);
    }
  };

  const activeColumns: TaskStatus[] = ['todo', 'in_progress', 'done'];

  if (loading) return <div className="p-8">Loading tasks...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Goals & Tasks</h1>
          <p className="page-description">Manage your projects and tasks in a Kanban flow.</p>
        </div>
      </div>

      {/* Quick Add Task */}
      <form onSubmit={handleAddTask} style={{ marginBottom: 24, display: 'flex', gap: 12 }}>
        <input
          type="text"
          className="input-field"
          placeholder="What needs to be done?"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          style={{ maxWidth: 400 }}
        />
        <button type="submit" className="btn-primary">
          <Plus size={18} style={{ marginRight: 8 }} />
          Add Task
        </button>
      </form>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <ResizableSplitPane minWidth={250}>
          {activeColumns.map((status) => (
            <div key={status} style={{
              background: columnColors[status],
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              minHeight: 500,
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)'
            }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                {columnTitles[status]}
                <span className="badge" style={{ background: 'var(--color-bg-tertiary)' }}>
                  {columns[status].length}
                </span>
              </h3>

              <Droppable droppableId={status}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'background 0.2s ease',
                      background: snapshot.isDraggingOver ? 'rgba(255,255,255,0.02)' : 'transparent',
                      borderRadius: 'var(--radius-md)'
                    }}
                  >
                    {columns[status].map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            style={{
                              marginBottom: 2,
                              ...provided.draggableProps.style,
                              background: 'var(--color-bg-secondary)',
                              padding: '12px 16px',
                              borderRadius: 'var(--radius-md)',
                              border: '1px solid var(--color-border)',
                              boxShadow: snapshot.isDragging ? '0 8px 24px rgba(0,0,0,0.2)' : 'none',
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: 12
                            }}
                          >
                            <div {...provided.dragHandleProps} style={{ marginTop: 2, cursor: 'grab', color: 'var(--color-text-muted)' }}>
                              <GripVertical size={16} />
                            </div>
                            <div style={{ flex: 1 }}>
                              <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>{task.title}</p>
                              {task.due_date && (
                                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <Clock size={12} />
                                  {new Date(task.due_date).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                            <div>
                              {task.status === 'done' ? (
                                <CheckCircle2 size={18} color="var(--color-accent-emerald)" />
                              ) : (
                                <Circle size={18} color="var(--color-border)" />
                              )}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </ResizableSplitPane>
      </DragDropContext>
    </div>
  );
}
