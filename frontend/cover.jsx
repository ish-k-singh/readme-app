// cover.jsx — neo-brutalist mini-poster book covers

function BookCover({ book, size = 'md', onClick, style = {} }) {
  const c = book.cover || { shape: 'block', bg: '#FFD43D', ink: '#0A0A0A', accent: '#FF5CC1' };
  const sz = {
    xs: { fontTitle: 11, fontAuthor: 6, padding: 6 },
    sm: { fontTitle: 14, fontAuthor: 7, padding: 8 },
    md: { fontTitle: 22, fontAuthor: 10, padding: 14 },
    lg: { fontTitle: 32, fontAuthor: 12, padding: 20 },
    xl: { fontTitle: 48, fontAuthor: 14, padding: 28 },
  }[size];

  const baseStyle = { background: c.bg, color: c.ink, ...style };

  return (
    <div className="cover" onClick={onClick} style={baseStyle}>
      <CoverArt c={c} book={book} sz={sz} />
    </div>
  );
}

function CoverArt({ c, book, sz }) {
  const pad = sz.padding;
  const titleStyle = { fontSize: sz.fontTitle, color: c.ink, fontFamily: '"Archivo Black", sans-serif' };
  const authorStyle = { fontSize: sz.fontAuthor, color: c.ink, opacity: 0.85 };

  switch (c.shape) {
    case 'split':
      return (
        <React.Fragment>
          <div style={{
            position: 'absolute', inset: 0,
            background: `linear-gradient(135deg, ${c.bg} 50%, ${c.accent} 50%)`,
          }} />
          <div className="cover-inner" style={{ padding: pad }}>
            <div className="c-tag" style={authorStyle}>{book.tags?.[0] || ''}</div>
            <div style={{ flex: 1 }} />
            <div className="c-title" style={titleStyle}>{book.title}</div>
            <div className="c-author" style={{ ...authorStyle, marginTop: 6 }}>{book.author}</div>
          </div>
        </React.Fragment>
      );

    case 'block':
      return (
        <div className="cover-inner" style={{ padding: pad }}>
          <div style={{ width: '40%', height: '40%', background: c.accent, border: `2px solid ${c.ink}` }} />
          <div style={{ flex: 1 }} />
          <div className="c-title" style={titleStyle}>{book.title}</div>
          <div className="c-author" style={{ ...authorStyle, marginTop: 6 }}>{book.author}</div>
        </div>
      );

    case 'serif':
      return (
        <div className="cover-inner" style={{ padding: pad, justifyContent: 'center', textAlign: 'center', alignItems: 'center' }}>
          <div style={{
            fontFamily: '"DM Serif Display", serif',
            fontStyle: 'italic',
            fontSize: sz.fontTitle * 1.15,
            lineHeight: 0.95,
            color: c.ink,
            letterSpacing: '-0.01em',
          }}>{book.title}</div>
          <div style={{ height: 2, width: '40%', background: c.accent, margin: `${pad * 0.6}px 0` }} />
          <div className="c-author" style={authorStyle}>{book.author}</div>
        </div>
      );

    case 'stripe':
      return (
        <React.Fragment>
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `repeating-linear-gradient(90deg, ${c.bg} 0 ${pad * 1.2}px, ${c.accent} ${pad * 1.2}px ${pad * 1.4}px)`,
          }} />
          <div className="cover-inner" style={{ padding: pad, justifyContent: 'flex-end' }}>
            <div style={{ background: c.ink, color: c.bg, padding: `${pad * 0.5}px ${pad * 0.6}px`, display: 'inline-block' }}>
              <div className="c-title" style={{ ...titleStyle, color: c.bg }}>{book.title}</div>
            </div>
            <div className="c-author" style={{ ...authorStyle, marginTop: 6, background: c.ink, color: c.bg, padding: `2px 6px`, display: 'inline-block', alignSelf: 'flex-start' }}>{book.author}</div>
          </div>
        </React.Fragment>
      );

    case 'circle':
      return (
        <div className="cover-inner" style={{ padding: pad, justifyContent: 'space-between' }}>
          <div className="c-tag" style={authorStyle}>R-{book.id.toUpperCase()}</div>
          <div style={{
            alignSelf: 'center',
            width: '70%', aspectRatio: 1, borderRadius: '50%',
            background: c.accent, border: `${Math.max(2, pad / 4)}px solid ${c.ink}`,
          }} />
          <div>
            <div className="c-title" style={titleStyle}>{book.title}</div>
            <div className="c-author" style={{ ...authorStyle, marginTop: 6 }}>{book.author}</div>
          </div>
        </div>
      );

    case 'arrow':
      return (
        <div className="cover-inner" style={{ padding: pad }}>
          <div className="c-tag" style={authorStyle}>{book.year}</div>
          <div style={{ flex: 1, position: 'relative' }}>
            <svg viewBox="0 0 100 100" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} preserveAspectRatio="none">
              <polygon points="10,40 70,40 70,20 95,55 70,90 70,70 10,70" fill={c.accent} stroke={c.ink} strokeWidth="3" />
            </svg>
          </div>
          <div className="c-title" style={titleStyle}>{book.title}</div>
          <div className="c-author" style={{ ...authorStyle, marginTop: 6 }}>{book.author}</div>
        </div>
      );

    case 'dot': {
      const dots = [];
      const rows = 5, cols = 4;
      for (let i = 0; i < rows * cols; i++) {
        dots.push(<div key={i} style={{ aspectRatio: 1, background: c.accent, borderRadius: '50%' }} />);
      }
      return (
        <div className="cover-inner" style={{ padding: pad }}>
          <div className="c-tag" style={authorStyle}>{book.tags?.[0]}</div>
          <div style={{
            flex: 1, display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gap: pad * 0.3, alignContent: 'center', padding: `${pad * 0.4}px 0`,
          }}>{dots}</div>
          <div className="c-title" style={titleStyle}>{book.title}</div>
          <div className="c-author" style={{ ...authorStyle, marginTop: 6 }}>{book.author}</div>
        </div>
      );
    }

    case 'wave':
      return (
        <React.Fragment>
          <svg viewBox="0 0 100 150" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
            <path d="M0 70 Q 25 50, 50 70 T 100 70 L 100 150 L 0 150 Z" fill={c.accent} stroke={c.ink} strokeWidth="2" />
            <path d="M0 90 Q 25 70, 50 90 T 100 90" fill="none" stroke={c.ink} strokeWidth="2" />
            <path d="M0 110 Q 25 90, 50 110 T 100 110" fill="none" stroke={c.ink} strokeWidth="2" />
          </svg>
          <div className="cover-inner" style={{ padding: pad }}>
            <div className="c-title" style={titleStyle}>{book.title}</div>
            <div className="c-author" style={{ ...authorStyle, marginTop: 4 }}>{book.author}</div>
          </div>
        </React.Fragment>
      );

    case 'stack': {
      const bars = [];
      for (let i = 0; i < 6; i++) {
        bars.push(<div key={i} style={{
          height: pad * 0.45,
          background: i % 2 ? c.accent : c.ink,
          width: `${50 + (i * 7) % 50}%`,
          border: `1px solid ${c.ink}`,
        }} />);
      }
      return (
        <div className="cover-inner" style={{ padding: pad }}>
          <div className="c-tag" style={authorStyle}>{book.tags?.[0]}</div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: pad * 0.25 }}>{bars}</div>
          <div className="c-title" style={titleStyle}>{book.title}</div>
          <div className="c-author" style={{ ...authorStyle, marginTop: 6 }}>{book.author}</div>
        </div>
      );
    }

    default:
      return (
        <div className="cover-inner" style={{ padding: pad }}>
          <div style={{ flex: 1 }} />
          <div className="c-title" style={titleStyle}>{book.title}</div>
          <div className="c-author" style={{ ...authorStyle, marginTop: 6 }}>{book.author}</div>
        </div>
      );
  }
}

Object.assign(window, { BookCover });
