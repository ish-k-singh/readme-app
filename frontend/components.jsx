// components.jsx — UI primitives, sidebar, topbar, player, modal

function Icon({ name, size = 18, stroke = 2.4 }) {
  const props = {
    width: size, height: size,
    viewBox: '0 0 24 24',
    fill: 'none', stroke: 'currentColor', strokeWidth: stroke,
    strokeLinecap: 'square', strokeLinejoin: 'miter',
  };
  switch (name) {
    case 'home': return <svg {...props}><path d="M3 11 L12 3 L21 11" /><path d="M5 10 V21 H19 V10" /></svg>;
    case 'search': return <svg {...props}><circle cx="11" cy="11" r="6" /><path d="M16 16 L21 21" /></svg>;
    case 'library': return <svg {...props}><rect x="3" y="3" width="4" height="18" /><rect x="9" y="3" width="4" height="18" /><path d="M16 4 L20 6 L17 20 L13 18 Z" /></svg>;
    case 'sparkle': return <svg {...props}><path d="M12 3 L13.5 9 L20 10.5 L13.5 12 L12 18 L10.5 12 L4 10.5 L10.5 9 Z" /><path d="M19 3 L20 6 L23 7 L20 8 L19 11" /></svg>;
    case 'user': return <svg {...props}><circle cx="12" cy="8" r="4" /><path d="M4 21 C4 16 8 14 12 14 C16 14 20 16 20 21" /></svg>;
    case 'heart': return <svg {...props}><path d="M12 21 C 6 17 3 13 3 9 C 3 6 5 4 8 4 C 10 4 11 5 12 7 C 13 5 14 4 16 4 C 19 4 21 6 21 9 C 21 13 18 17 12 21 Z" /></svg>;
    case 'heart-fill': return <svg {...props} fill="currentColor"><path d="M12 21 C 6 17 3 13 3 9 C 3 6 5 4 8 4 C 10 4 11 5 12 7 C 13 5 14 4 16 4 C 19 4 21 6 21 9 C 21 13 18 17 12 21 Z" /></svg>;
    case 'plus': return <svg {...props}><path d="M12 5 V19 M5 12 H19" /></svg>;
    case 'check': return <svg {...props}><path d="M4 12 L10 18 L20 6" /></svg>;
    case 'x': return <svg {...props}><path d="M5 5 L19 19 M19 5 L5 19" /></svg>;
    case 'play': return <svg {...props} fill="currentColor" stroke="none"><polygon points="6,4 20,12 6,20" /></svg>;
    case 'pause': return <svg {...props}><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>;
    case 'skip': return <svg {...props}><polygon points="4,4 14,12 4,20" /><line x1="18" y1="4" x2="18" y2="20" /></svg>;
    case 'shuffle': return <svg {...props}><path d="M3 6 H8 L20 18 H22" /><path d="M3 18 H8 L20 6 H22" /><polyline points="19,3 22,6 19,9" /><polyline points="19,15 22,18 19,21" /></svg>;
    case 'arrow-right': return <svg {...props}><path d="M5 12 H20 M14 6 L20 12 L14 18" /></svg>;
    case 'arrow-left': return <svg {...props}><path d="M19 12 H4 M10 6 L4 12 L10 18" /></svg>;
    case 'bell': return <svg {...props}><path d="M6 16 V11 C6 7 8 5 12 5 C16 5 18 7 18 11 V16 L20 18 H4 Z" /><path d="M10 21 H14" /></svg>;
    case 'settings': return <svg {...props}><circle cx="12" cy="12" r="3" /><path d="M12 3 V6 M12 18 V21 M3 12 H6 M18 12 H21 M5.6 5.6 L7.7 7.7 M16.3 16.3 L18.4 18.4 M5.6 18.4 L7.7 16.3 M16.3 7.7 L18.4 5.6" /></svg>;
    case 'book': return <svg {...props}><path d="M4 5 C 6 4 10 4 12 5 V20 C 10 19 6 19 4 20 Z" /><path d="M12 5 C 14 4 18 4 20 5 V20 C 18 19 14 19 12 20" /></svg>;
    case 'star': return <svg {...props} fill="currentColor" stroke="none"><polygon points="12,2 14.5,9 22,9 16,13.5 18.5,21 12,16.5 5.5,21 8,13.5 2,9 9.5,9" /></svg>;
    case 'star-o': return <svg {...props}><polygon points="12,2 14.5,9 22,9 16,13.5 18.5,21 12,16.5 5.5,21 8,13.5 2,9 9.5,9" /></svg>;
    case 'menu': return <svg {...props}><path d="M3 6 H21 M3 12 H21 M3 18 H21" /></svg>;
    case 'more': return <svg {...props} fill="currentColor" stroke="none"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>;
    case 'filter': return <svg {...props}><path d="M3 5 H21 L14 13 V20 L10 18 V13 Z" /></svg>;
    case 'edit': return <svg {...props}><path d="M4 20 H8 L20 8 L16 4 L4 16 Z" /><path d="M14 6 L18 10" /></svg>;
    case 'trash': return <svg {...props}><path d="M5 7 H19 L18 21 H6 Z" /><path d="M9 7 V4 H15 V7" /></svg>;
    case 'clock': return <svg {...props}><circle cx="12" cy="12" r="9" /><path d="M12 7 V12 L16 14" /></svg>;
    case 'tag': return <svg {...props}><path d="M3 12 V3 H12 L21 12 L12 21 Z" /><circle cx="8" cy="8" r="1.5" fill="currentColor" /></svg>;
    default: return <svg {...props}><rect x="4" y="4" width="16" height="16" /></svg>;
  }
}

function Button({ children, variant = 'outline', size = 'md', icon, iconRight, onClick, disabled, className = '', ...rest }) {
  const cls = `btn ${variant} ${size === 'lg' ? 'lg' : size === 'sm' ? 'sm' : ''} ${className}`.trim();
  return (
    <button className={cls} onClick={onClick} disabled={disabled} {...rest}>
      {icon && <Icon name={icon} size={size === 'lg' ? 20 : 16} />}
      <span>{children}</span>
      {iconRight && <Icon name={iconRight} size={size === 'lg' ? 20 : 16} />}
    </button>
  );
}

function Badge({ children, color = 'lilac', icon }) {
  return (
    <span className={`badge ${color}`}>
      {icon && <Icon name={icon} size={11} stroke={2.6} />}
      {children}
    </span>
  );
}

function Stars({ value, size = 14 }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  return (
    <span className="stars" style={{ height: size }}>
      {[0,1,2,3,4].map(i => (
        <Icon key={i} name={i < full ? 'star' : (i === full && half ? 'star' : 'star-o')} size={size} />
      ))}
    </span>
  );
}

function MatchMeter({ value, color = '#FFD43D' }) {
  const segs = 10;
  const filled = Math.round((value / 100) * segs);
  return (
    <div className="meter" style={{ width: '100%' }}>
      {Array.from({length: segs}, (_, i) => (
        <i key={i} style={{
          flex: 1,
          background: i < filled ? color : 'transparent',
        }} />
      ))}
    </div>
  );
}

function Sidebar({ route, setRoute, readlists, readCount, profile }) {
  const displayName = profile?.name || 'Reader';
  const initials = profile?.name
    ? profile.name.trim().split(/\s+/).map(w => w[0]?.toUpperCase()).slice(0, 2).join('')
    : '?';
  const navMain = [
    { id: 'home', icon: 'home', label: 'Home' },
    { id: 'search', icon: 'search', label: 'Search' },
    { id: 'library', icon: 'library', label: 'Your Library' },
    { id: 'profile', icon: 'user', label: 'Profile' },
  ];
  const navTools = [
    { id: 'generator', icon: 'sparkle', label: 'AI Readlist' },
    { id: 'taste', icon: 'tag', label: 'Taste Profile' },
  ];
  return (
    <aside className="sidebar">
      <div className="brand" onClick={() => setRoute({ name: 'home' })} style={{ cursor: 'pointer' }}>
        <div className="brand-mark">R</div>
        <div>
          <div className="brand-name">ReadMe</div>
          <div className="brand-tag mono">Books · on · Repeat</div>
        </div>
      </div>

      <nav className="nav">
        {navMain.map(n => (
          <button key={n.id}
            className={`nav-item ${route.name === n.id ? 'active' : ''}`}
            onClick={() => setRoute({ name: n.id })}>
            <span className="ico"><Icon name={n.icon} size={20} /></span>
            <span>{n.label}</span>
          </button>
        ))}

        <div className="nav-group-label">Tools</div>
        {navTools.map(n => (
          <button key={n.id}
            className={`nav-item ${route.name === n.id ? 'active' : ''}`}
            onClick={() => setRoute({ name: n.id })}>
            <span className="ico"><Icon name={n.icon} size={20} /></span>
            <span>{n.label}</span>
          </button>
        ))}

        <div className="nav-group-label">Your Readlists</div>
        {readlists.slice(0, 5).map(r => (
          <button key={r.id}
            className={`nav-item ${route.name === 'readlist' && route.id === r.id ? 'active' : ''}`}
            onClick={() => setRoute({ name: 'readlist', id: r.id })}
            style={{ paddingLeft: 12 }}>
            <span className="ico" style={{ width: 14, height: 14, background: r.accent, border: '2px solid var(--ink)', display: 'inline-block' }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-foot">
        <div className="row gap-3" style={{ alignItems: 'center' }}>
          <div className="avatar" style={{ cursor: 'pointer' }} onClick={() => setRoute({ name: 'profile' })}>{initials}</div>
          <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => setRoute({ name: 'profile' })}>
            <div style={{ fontWeight: 700, fontSize: 13 }}>{displayName.length > 14 ? displayName.split(' ')[0] : displayName}</div>
            <div className="label" style={{ color: 'rgba(26,26,26,0.55)' }}>{readCount} books read</div>
          </div>
          <button title="Sign out" onClick={() => window.__clerk?.signOut()}
            style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.45, padding: 4, lineHeight: 1 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}

function TopBar({ query, setQuery, setRoute }) {
  return (
    <div className="topbar">
      <div className="search">
        <Icon name="search" size={18} />
        <input
          placeholder="Search a book, an author, a vibe…"
          value={query}
          onChange={e => { setQuery(e.target.value); if (e.target.value) setRoute({ name: 'search' }); }}
          onFocus={() => setRoute({ name: 'search' })}
        />
        <span className="label" style={{ color: 'rgba(10,10,10,0.5)' }}>⌘K</span>
      </div>
      <button className="icon-btn" title="Notifications"><Icon name="bell" /></button>
      <button className="icon-btn" title="New readlist"><Icon name="plus" /></button>
    </div>
  );
}

function Player({ current, playing, setPlaying, progress, setProgress }) {
  if (!current) return null;
  const totalMin = Math.round(current.pages / 250 * 60);
  const elapsedMin = Math.round((progress / 100) * totalMin);
  const fmt = (m) => `${Math.floor(m/60)}h ${String(m%60).padStart(2,'0')}m`;
  return (
    <div className="player">
      <div className="cur">
        <div className="mini-cov"><BookCover book={current} size="xs" /></div>
        <div>
          <div className="lbl">{current.title}</div>
          <div className="sub">{current.author}</div>
        </div>
      </div>
      <div className="progress">
        <div className="controls">
          <button className="pbtn" title="Shuffle"><Icon name="shuffle" size={16} /></button>
          <button className="pbtn" title="Previous chapter"><Icon name="arrow-left" size={16} /></button>
          <button className="pbtn play" onClick={() => setPlaying(p => !p)}>
            <Icon name={playing ? 'pause' : 'play'} size={20} />
          </button>
          <button className="pbtn" title="Next book"><Icon name="skip" size={16} /></button>
          <button className="pbtn" title="More"><Icon name="more" size={16} /></button>
        </div>
        <div className="bar" onClick={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setProgress(Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100)));
        }}>
          <i style={{ width: `${progress}%` }} />
        </div>
        <div className="nums">
          <span>{fmt(elapsedMin)}</span>
          <span style={{ opacity: 0.5, padding: '0 8px' }}>·</span>
          <span>{current.pages} pp</span>
          <span style={{ opacity: 0.5, padding: '0 8px' }}>·</span>
          <span>{fmt(totalMin)}</span>
        </div>
      </div>
      <div className="row gap-2" style={{ justifyContent: 'flex-end' }}>
        <button className="pbtn" title="Save"><Icon name="heart" size={16} /></button>
        <button className="pbtn" title="Add to readlist"><Icon name="plus" size={16} /></button>
        <button className="pbtn" title="Settings"><Icon name="settings" size={16} /></button>
      </div>
    </div>
  );
}

function Modal({ children, onClose }) {
  React.useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

function BookRow({ book, idx, onClick, saved, onToggleSave, showWhy = true }) {
  return (
    <div className="book-row" onClick={onClick}>
      <div className="row-cover"><BookCover book={book} size="xs" /></div>
      <div className="row-meta">
        <div className="row gap-2" style={{ alignItems: 'baseline' }}>
          {idx != null && <span className="label" style={{ color: 'rgba(10,10,10,0.5)' }}>{String(idx + 1).padStart(2, '0')}</span>}
          <div className="row-title">{book.title}</div>
        </div>
        <div className="row-author">{book.author} · {book.year} · {book.pages} pp</div>
        {showWhy && <div className="row-why">{book.why}</div>}
        <div className="row gap-2" style={{ marginTop: 8 }}>
          {book.tags.map(t => <span key={t} className="chip" style={{ pointerEvents: 'none' }}>{t}</span>)}
        </div>
      </div>
      <div className="row-actions" onClick={e => e.stopPropagation()}>
        {book.match != null && (
          <div style={{ width: 90 }}>
            <div className="label mb-3" style={{ textAlign: 'right', fontSize: 9 }}>{book.match}% MATCH</div>
            <MatchMeter value={book.match} color="var(--royal)" />
          </div>
        )}
        <button className="icon-btn" style={{ width: 40, height: 40, color: saved ? 'var(--magenta)' : 'inherit' }} onClick={onToggleSave} title={saved ? 'Saved' : 'Save'}>
          <Icon name={saved ? 'heart-fill' : 'heart'} size={18} />
        </button>
      </div>
    </div>
  );
}

function ReadlistTile({ list, books, onOpen, onDelete }) {
  const covers = list.bookIds.slice(0, 3).map(id => books.find(b => b.id === id)).filter(Boolean);
  return (
    <div className="readlist" onClick={onOpen} style={{ position: 'relative' }}>
      {onDelete && (
        <button
          onClick={e => { e.stopPropagation(); onDelete(list.id); }}
          style={{
            position: 'absolute', top: 8, right: 8, zIndex: 10,
            width: 26, height: 26, border: 'var(--stroke) solid var(--ink)',
            background: 'var(--white)', color: 'var(--ink)',
            fontFamily: 'var(--f-mono)', fontSize: 14, fontWeight: 700,
            cursor: 'pointer', display: 'grid', placeItems: 'center',
            boxShadow: '2px 2px 0 var(--ink)',
          }}
          title="Remove readlist"
        >×</button>
      )}
      <div className="stack" style={{ background: list.accent }}>
        {covers.map((b, i) => (
          <div key={b.id} className="stack-cover" style={{
            left: `${10 + i * 22}%`,
            top: `${18 - i * 4}%`,
            transform: `rotate(${(i - 1) * 6}deg)`,
            zIndex: 3 - i,
          }}>
            <BookCover book={b} size="sm" />
          </div>
        ))}
        {list.ai && (
          <div style={{
            position: 'absolute', top: 10, right: 10,
            background: 'var(--ink)', color: 'var(--lime)',
            padding: '6px 10px', fontFamily: 'var(--f-mono)',
            fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
            textTransform: 'uppercase', border: '2px solid var(--ink)',
          }}>✦ AI</div>
        )}
      </div>
      <div className="meta">
        <div className="title">{list.title}</div>
        <div className="sub">{list.sub}</div>
        <div className="row">
          <span className="label" style={{ color: 'rgba(10,10,10,0.55)' }}>♡ {list.saves.toLocaleString()}</span>
          <span style={{ flex: 1 }} />
          <Icon name="arrow-right" size={18} />
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  Icon, Button, Badge, Stars, MatchMeter, Sidebar, TopBar, Player, Modal, BookRow, ReadlistTile,
});
