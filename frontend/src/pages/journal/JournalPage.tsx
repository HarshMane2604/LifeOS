import { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Calendar, Save, AlertCircle } from 'lucide-react';
import api from '@/lib/api';
import { JournalEntry, Mood } from '@/types/life';

const MOODS: { value: Mood; emoji: string; label: string }[] = [
  { value: 'amazing', emoji: '🤩', label: 'Amazing' },
  { value: 'good', emoji: '😊', label: 'Good' },
  { value: 'okay', emoji: '😐', label: 'Okay' },
  { value: 'bad', emoji: '😔', label: 'Bad' },
  { value: 'terrible', emoji: '😭', label: 'Terrible' },
];

export default function JournalPage() {
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [mood, setMood] = useState<Mood | null>(null);
  const [energyLevel, setEnergyLevel] = useState<number | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Write your thoughts here...',
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert sm:prose-base focus:outline-none min-h-[300px]',
      },
    },
  });

  useEffect(() => {
   
  // eslint-disable-next-line react-hooks/immutability
    fetchEntry(date);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  async function fetchEntry(targetDate: string) {
    try {
      setLoading(true);
      const data = await api.get<JournalEntry>(`/journal/${targetDate}`);
      setEntry(data);
      setMood(data.mood);
      setEnergyLevel(data.energy_level);
      editor?.commands.setContent(data.thoughts || '');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (err.response?.status === 404) {
        // No entry for this date yet
        setEntry(null);
        setMood(null);
        setEnergyLevel(null);
        editor?.commands.setContent('');
      } else {
        console.error('Failed to fetch journal entry', err);
      }
    } finally {
      setLoading(false);
    }
  };

  async function handleSave() {
    try {
      setSaving(true);
      const payload = {
        date,
        thoughts: editor?.getHTML(),
        mood,
        energy_level: energyLevel,
      };

      if (entry) {
        // Update
        const updated = await api.put<JournalEntry>(`/journal/${entry.id}`, payload);
        setEntry(updated);
      } else {
        // Create
        const created = await api.post<JournalEntry>('/journal', payload);
        setEntry(created);
      }
    } catch (err) {
      console.error('Failed to save journal entry', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: 800, margin: '0 auto' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Daily Journal</h1>
          <p className="page-description">Reflect on your day, capture your thoughts.</p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Calendar size={16} style={{ position: 'absolute', left: 12, top: 11, color: 'var(--color-text-muted)' }} />
            <input
              type="date"
              className="input-field"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{ paddingLeft: 36, width: 160 }}
            />
          </div>
          <button className="btn-primary" onClick={handleSave} disabled={saving || loading}>
            <Save size={16} style={{ marginRight: 8 }} />
            {saving ? 'Saving...' : 'Save Entry'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-muted">Loading entry...</div>
      ) : (
        <div className="glass-card" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* Mood & Energy */}
          <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--color-text-secondary)' }}>How are you feeling?</p>
              <div style={{ display: 'flex', gap: 8 }}>
                {MOODS.map(m => (
                  <button
                    key={m.value}
                    onClick={() => setMood(m.value)}
                    style={{
                      background: mood === m.value ? 'var(--color-bg-tertiary)' : 'transparent',
                      border: `1px solid ${mood === m.value ? 'var(--color-border)' : 'transparent'}`,
                      borderRadius: 'var(--radius-md)',
                      padding: '8px 12px',
                      fontSize: 18,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    title={m.label}
                  >
                    {m.emoji}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ flex: 1, minWidth: 200 }}>
              <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--color-text-secondary)' }}>Energy Level (1-10)</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={energyLevel || 5}
                  onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
                  style={{ flex: 1, accentColor: 'var(--color-accent-violet)' }}
                />
                <span className="font-mono-financial" style={{ fontSize: 16, fontWeight: 600 }}>{energyLevel || '-'}</span>
              </div>
            </div>
          </div>

          <hr style={{ borderColor: 'var(--color-border)', margin: '8px 0' }} />

          {/* Rich Text Editor */}
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: 'var(--color-text-secondary)' }}>Today's Thoughts</p>
            
            {/* Editor Toolbar */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 12, padding: 8, background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
              <button onClick={() => editor?.chain().focus().toggleBold().run()} className={`btn-secondary ${editor?.isActive('bold') ? 'active' : ''}`} style={{ padding: '4px 8px', fontSize: 13 }}>Bold</button>
              <button onClick={() => editor?.chain().focus().toggleItalic().run()} className={`btn-secondary ${editor?.isActive('italic') ? 'active' : ''}`} style={{ padding: '4px 8px', fontSize: 13 }}>Italic</button>
              <div style={{ width: 1, background: 'var(--color-border)', margin: '0 4px' }} />
              <button onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} className={`btn-secondary ${editor?.isActive('heading', { level: 2 }) ? 'active' : ''}`} style={{ padding: '4px 8px', fontSize: 13 }}>H2</button>
              <button onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} className={`btn-secondary ${editor?.isActive('heading', { level: 3 }) ? 'active' : ''}`} style={{ padding: '4px 8px', fontSize: 13 }}>H3</button>
              <div style={{ width: 1, background: 'var(--color-border)', margin: '0 4px' }} />
              <button onClick={() => editor?.chain().focus().toggleBulletList().run()} className={`btn-secondary ${editor?.isActive('bulletList') ? 'active' : ''}`} style={{ padding: '4px 8px', fontSize: 13 }}>Bullet List</button>
              <button onClick={() => editor?.chain().focus().toggleOrderedList().run()} className={`btn-secondary ${editor?.isActive('orderedList') ? 'active' : ''}`} style={{ padding: '4px 8px', fontSize: 13 }}>Numbered List</button>
            </div>

            <div style={{
              minHeight: 400,
              padding: 16,
              background: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              fontSize: 15,
              lineHeight: 1.6
            }}>
              <EditorContent editor={editor} />
            </div>
            
            {/* Minimal css for TipTap placeholder */}
            <style>{`
              .tiptap p.is-editor-empty:first-child::before {
                color: var(--color-text-muted);
                content: attr(data-placeholder);
                float: left;
                height: 0;
                pointer-events: none;
              }
            `}</style>
          </div>

        </div>
      )}
    </div>
  );
}
