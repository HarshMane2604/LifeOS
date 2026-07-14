import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Folder, Hash, FileText, Search, Plus, Star, MoreVertical, Settings, Brain } from 'lucide-react';
import api from '@/lib/api';

interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  is_favorite: boolean;
  updated_at: string;
}

export default function BrainPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const res = await api.get<Note[]>('/notes');
      setNotes(res);
      if (res.length > 0 && !activeNote) {
        setActiveNote(res[0]);
      }
    } catch (error) {
      console.error('Failed to fetch notes', error);
    } finally {
      setLoading(false);
    }
  };

  const createNote = async () => {
    try {
      const newNote = await api.post<Note>('/notes', {
        title: 'Untitled Note',
        content: '',
        category: 'Inbox',
        is_favorite: false
      });
      setNotes([newNote, ...notes]);
      setActiveNote(newNote);
    } catch (error) {
      console.error('Failed to create note', error);
    }
  };

  const updateNote = async (id: string, data: Partial<Note>) => {
    try {
      const updated = await api.patch<Note>(`/notes/${id}`, data);
      setNotes(notes.map(n => n.id === id ? updated : n));
      if (activeNote?.id === id) {
        setActiveNote(updated);
      }
    } catch (error) {
      console.error('Failed to update note', error);
    }
  };

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (n.content && n.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="page-container" style={{ padding: 0, height: 'calc(100vh - 64px)', display: 'flex', overflow: 'hidden' }}>
      
      {/* Sidebar - Folders & Tags */}
      <div style={{ width: 240, borderRight: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: 20 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Second Brain</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <button className="nav-item active" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 'var(--radius-md)', background: 'var(--color-bg-tertiary)', border: 'none', color: 'var(--color-text-primary)', width: '100%', textAlign: 'left', cursor: 'pointer' }}>
              <FileText size={16} /> All Notes
            </button>
            <button className="nav-item" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 'var(--radius-md)', background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', width: '100%', textAlign: 'left', cursor: 'pointer' }}>
              <Star size={16} /> Favorites
            </button>
          </div>
        </div>

        <div style={{ padding: '0 20px', flex: 1, overflowY: 'auto' }}>
          <h3 style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>Folders</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 24 }}>
            {['Inbox', 'Projects', 'Resources', 'Archive'].map(folder => (
              <div key={folder} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--color-text-secondary)', padding: '6px 8px', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>
                <Folder size={14} /> {folder}
              </div>
            ))}
          </div>

          <h3 style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>Tags</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {['ideas', 'finance', 'meeting', 'tech', 'reading'].map(tag => (
              <span key={tag} style={{ fontSize: 11, padding: '2px 8px', background: 'var(--color-bg-tertiary)', color: 'var(--color-text-secondary)', borderRadius: 12, cursor: 'pointer' }}>
                <Hash size={10} style={{ display: 'inline', marginRight: 2 }} />{tag}
              </span>
            ))}
          </div>
        </div>

        <div style={{ padding: 20, borderTop: '1px solid var(--color-border)' }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
            <Settings size={16} /> Settings
          </button>
        </div>
      </div>

      {/* Middle Pane - Note List */}
      <div style={{ width: 320, borderRight: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', background: 'var(--color-bg-primary)' }}>
        <div style={{ padding: '20px 20px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, marginRight: 12 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search notes..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '8px 12px 8px 32px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)', fontSize: 13 }}
            />
          </div>
          <button onClick={createNote} style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', background: 'var(--color-accent-violet)', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Plus size={16} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 13 }}>Loading notes...</div>
          ) : filteredNotes.length === 0 ? (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 13 }}>No notes found.</div>
          ) : (
            filteredNotes.map(note => (
              <div 
                key={note.id}
                onClick={() => setActiveNote(note)}
                style={{ 
                  padding: '16px 20px', 
                  borderBottom: '1px solid var(--color-border)', 
                  cursor: 'pointer',
                  background: activeNote?.id === note.id ? 'var(--color-bg-tertiary)' : 'transparent',
                  transition: 'background 0.2s'
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {note.title || 'Untitled Note'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{new Date(note.updated_at).toLocaleDateString()}</span>
                  <span>{note.category}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Pane - Editor */}
      <div style={{ flex: 1, background: 'var(--color-bg-primary)', display: 'flex', flexDirection: 'column' }}>
        {activeNote ? (
          <>
            <div style={{ padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <span className="badge" style={{ background: 'var(--color-bg-tertiary)', color: 'var(--color-text-secondary)', padding: '4px 10px', fontSize: 12 }}>{activeNote.category}</span>
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <button 
                  onClick={() => updateNote(activeNote.id, { is_favorite: !activeNote.is_favorite })}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: activeNote.is_favorite ? '#EAB308' : 'var(--color-text-muted)' }}
                >
                  <Star size={18} fill={activeNote.is_favorite ? '#EAB308' : 'none'} />
                </button>
                <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                  <MoreVertical size={18} />
                </button>
              </div>
            </div>
            
            <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
              <input 
                type="text"
                value={activeNote.title}
                onChange={e => {
                  const newTitle = e.target.value;
                  setActiveNote({ ...activeNote, title: newTitle });
                }}
                onBlur={e => updateNote(activeNote.id, { title: e.target.value })}
                style={{ width: '100%', fontSize: 32, fontWeight: 800, color: 'var(--color-text-primary)', background: 'transparent', border: 'none', outline: 'none', marginBottom: 20 }}
                placeholder="Note Title"
              />
              <textarea
                value={activeNote.content || ''}
                onChange={e => {
                  const newContent = e.target.value;
                  setActiveNote({ ...activeNote, content: newContent });
                }}
                onBlur={e => updateNote(activeNote.id, { content: e.target.value })}
                style={{ width: '100%', minHeight: '60vh', fontSize: 15, lineHeight: 1.6, color: 'var(--color-text-secondary)', background: 'transparent', border: 'none', outline: 'none', resize: 'none', fontFamily: 'inherit' }}
                placeholder="Start writing in markdown..."
              />
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
            <Brain size={48} style={{ marginBottom: 16, opacity: 0.2 }} />
            <p>Select a note or create a new one to start writing.</p>
          </div>
        )}
      </div>

    </div>
  );
}
