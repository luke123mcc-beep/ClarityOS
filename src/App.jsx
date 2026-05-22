import { useState, useRef, useEffect } from 'react';

const OPENING = "What's in your way right now?";

export default function App() {
  const [messages, setMessages] = useState([]); // {role, content}
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const scrollerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    scrollerRef.current?.scrollTo({
      top: scrollerRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, busy]);

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    setError(null);

    const next = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setInput('');
    setBusy(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
      setMessages((m) => [...m, { role: 'assistant', content: data.text }]);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const reset = () => {
    if (busy) return;
    setMessages([]);
    setError(null);
    setInput('');
    inputRef.current?.focus();
  };

  return (
    <div style={styles.shell}>
      <header style={styles.header}>
        <div style={styles.brand}>ClarityOS</div>
        <button onClick={reset} style={styles.resetBtn} disabled={busy || messages.length === 0}>
          New session
        </button>
      </header>

      <div ref={scrollerRef} style={styles.scroller}>
        <div style={styles.thread}>
          {messages.length === 0 && (
            <div style={styles.opening}>
              <div style={styles.openingText}>{OPENING}</div>
              <div style={styles.openingHint}>One sentence. The thing actually in your way — not the polished version.</div>
            </div>
          )}

          {messages.map((m, i) => (
            <Message key={i} role={m.role} content={m.content} />
          ))}

          {busy && (
            <div style={{ ...styles.row, ...styles.assistantRow }}>
              <div style={styles.thinking}>thinking…</div>
            </div>
          )}

          {error && (
            <div style={styles.error}>
              <strong>Error:</strong> {error}
            </div>
          )}
        </div>
      </div>

      <div style={styles.composer}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Type. Enter sends, Shift+Enter newline."
          rows={1}
          style={styles.input}
          disabled={busy}
          autoFocus
        />
        <button onClick={send} disabled={busy || !input.trim()} style={styles.sendBtn}>
          Send
        </button>
      </div>
    </div>
  );
}

function Message({ role, content }) {
  const isUser = role === 'user';
  return (
    <div style={{ ...styles.row, ...(isUser ? styles.userRow : styles.assistantRow) }}>
      <div style={{ ...styles.bubble, ...(isUser ? styles.userBubble : styles.assistantBubble) }}>
        {content.split('\n').map((line, i) => (
          <p key={i} style={styles.para}>{line || ' '}</p>
        ))}
      </div>
    </div>
  );
}

const styles = {
  shell: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    maxWidth: 720,
    margin: '0 auto',
    background: 'var(--bg)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 18px',
    borderBottom: '1px solid var(--border)',
  },
  brand: {
    fontWeight: 700,
    letterSpacing: '-0.01em',
    fontSize: 15,
    color: 'var(--text)',
  },
  resetBtn: {
    background: 'transparent',
    color: 'var(--text-muted)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    padding: '6px 12px',
    fontSize: 13,
  },
  scroller: {
    flex: 1,
    overflowY: 'auto',
    padding: '8px 0 16px',
  },
  thread: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
    padding: '8px 16px',
  },
  opening: {
    padding: '40px 8px 8px',
    color: 'var(--text)',
  },
  openingText: {
    fontSize: 22,
    fontWeight: 600,
    letterSpacing: '-0.01em',
    marginBottom: 10,
  },
  openingHint: {
    color: 'var(--text-muted)',
    fontSize: 14,
  },
  row: {
    display: 'flex',
    width: '100%',
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  assistantRow: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '88%',
    padding: '10px 14px',
    borderRadius: 14,
    lineHeight: 1.55,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  userBubble: {
    background: 'var(--user-bg)',
    border: '1px solid var(--border)',
    color: 'var(--text)',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    background: 'transparent',
    color: 'var(--text)',
    padding: '4px 2px',
  },
  para: {
    margin: '0 0 8px 0',
  },
  thinking: {
    color: 'var(--text-muted)',
    fontSize: 14,
    padding: '4px 2px',
  },
  error: {
    color: '#ff8a8a',
    background: 'rgba(255, 80, 80, 0.08)',
    border: '1px solid rgba(255, 80, 80, 0.3)',
    padding: '10px 12px',
    borderRadius: 10,
    fontSize: 14,
  },
  composer: {
    display: 'flex',
    gap: 8,
    padding: '12px 16px 18px',
    borderTop: '1px solid var(--border)',
    background: 'var(--bg)',
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 200,
    padding: '11px 14px',
    background: 'var(--surface)',
    color: 'var(--text)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    outline: 'none',
    resize: 'none',
    lineHeight: 1.45,
  },
  sendBtn: {
    background: 'var(--accent)',
    color: '#fff',
    border: 'none',
    padding: '0 18px',
    borderRadius: 12,
    fontWeight: 600,
    fontSize: 14,
    minHeight: 44,
  },
};
