// screens.jsx — Home / Search / Readlist / Generator / Taste / Detail

const { BOOKS, READLISTS, SEED_READ, MOODS, GENRES, LENGTHS } = window.READ_DATA;

/* ──────────────────── HOME / FOR YOU ──────────────────── */

function HomeScreen({ ctx }) {
  const { books, readlists, readIds, reading, openBook, openReadlist, setRoute, updatePage, profile, generateReadlist, addReadlist, updateBook, deleteReadlist } = ctx;
  const aiList = readlists.find(r => r.ai);
  const editorial = readlists.filter(r => !r.ai);
  const readingIds = Object.keys(reading);
  const displayName = profile?.name || 'Reader';
  const [autoGenerating, setAutoGenerating] = React.useState(false);
  const hasTriggered = React.useRef(false);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 11) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Reader of the night';
  })();

  const runGenerate = React.useCallback(() => {
    if (readIds.length === 0) return;
    setAutoGenerating(true);
    const read = books.filter(b => readIds.includes(b.id));
    const tagFreq = {};
    read.forEach(b => (b.tags || []).forEach(t => { tagFreq[t] = (tagFreq[t] || 0) + 1; }));
    const topTags = Object.entries(tagFreq).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([t]) => t);
    const titles = read.slice(0, 5).map(b => b.title).join(', ');
    const vibe = titles ? `Books with the same feel as: ${titles}` : 'literary fiction';
    generateReadlist({ vibe, moods: topTags.length ? topTags : ['literary'], readIds, count: 8 })
      .then(result => {
        if (result?.books) {
          result.books.forEach(b => { if (b.why) updateBook(b.id, { why: b.why }); });
          addReadlist({
            id: 'gen-' + Date.now(),
            title: 'Readlist based on your past reads',
            sub: `Generated for you · ${result.books.length} books`,
            pitch: result.pitch,
            accent: '#B5A7FF',
            bookIds: result.books.map(b => b.id),
            saves: 0,
            curator: 'ReadMe AI',
            ai: true,
          });
        }
      })
      .finally(() => setAutoGenerating(false));
  }, [readIds, books, generateReadlist, addReadlist, updateBook]);

  // Auto-generate once when user has reads but no AI readlist
  React.useEffect(() => {
    if (hasTriggered.current) return;
    if (readIds.length === 0) return;
    if (aiList) return;
    hasTriggered.current = true;
    runGenerate();
  }, [readIds.length, aiList?.id]);

  const handleRegenerate = () => {
    if (aiList) deleteReadlist(aiList.id);
    hasTriggered.current = false;
    runGenerate();
  };

  return (
    <div>
      <div className="hero" data-screen-label="01 Home">
        <div className="hero-meta">
          <span>{greeting}, {displayName}</span>
          <span style={{ opacity: 0.5 }}>·</span>
          <span>{readIds.length} books on your shelf</span>
        </div>
        <h1 className="h1" style={{ fontFamily: 'var(--f-serif)', fontStyle: 'italic', fontWeight: 400 }}>
          You read like<br/>
          <span style={{ fontFamily: 'var(--f-display)', fontStyle: 'normal' }}>nobody else.</span>
        </h1>

        {readIds.length === 0 && (
          <React.Fragment>
            <p>Add books you've read and AI will build a personalised readlist just for you.</p>
            <div className="row gap-3">
              <Button variant="ink" size="lg" iconRight="arrow-right" onClick={() => setRoute({ name: 'taste' })}>
                Add your first read book
              </Button>
            </div>
          </React.Fragment>
        )}

        {readIds.length > 0 && autoGenerating && (
          <p style={{ fontFamily: 'var(--f-serif)', fontStyle: 'italic', opacity: 0.7 }}>
            Building your readlist from {readIds.length} {readIds.length === 1 ? 'book' : 'books'}…
          </p>
        )}

        {readIds.length > 0 && !autoGenerating && aiList && (
          <React.Fragment>
            <p>Based on {readIds.length} {readIds.length === 1 ? 'book' : 'books'} you've read — regenerate anytime as your shelf grows.</p>
            <div className="row gap-3">
              <Button variant="ink" size="lg" iconRight="arrow-right" onClick={() => openReadlist(aiList.id)}>
                Open your readlist
              </Button>
              <Button variant="outline" size="lg" icon="sparkle" onClick={handleRegenerate}>
                Regenerate
              </Button>
            </div>
          </React.Fragment>
        )}
      </div>

      {readingIds.length > 0 && (
        <div className="mb-7">
          <div className="section-head">
            <h2 className="h3" style={{ fontFamily: 'var(--f-serif)', fontStyle: 'italic', fontWeight: 400 }}>
              Currently <span style={{ fontFamily: 'var(--f-display)', fontStyle: 'normal' }}>reading</span>
            </h2>
            <span className="meta">{readingIds.length} {readingIds.length === 1 ? 'BOOK' : 'BOOKS'}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: readingIds.length > 1 ? '1fr 1fr' : '1fr', gap: 18 }}>
            {readingIds.map(id => {
              const b = books.find(x => x.id === id);
              const p = reading[id];
              const pct = Math.round((p.page / b.pages) * 100);
              return (
                <div key={id} className="card" style={{ background: 'var(--yellow)' }}>
                  <div className="row gap-3 mb-3">
                    <Badge color="ink">CURRENTLY READING</Badge>
                    <span className="label" style={{ color: 'rgba(10,10,10,0.6)' }}>PAGE {p.page} OF {b.pages}</span>
                  </div>
                  <div className="row gap-5">
                    <div style={{ width: 84, flexShrink: 0 }}>
                      <BookCover book={b} size="sm" onClick={() => openBook(id)} />
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div className="h3" style={{ marginBottom: 4, cursor: 'pointer' }} onClick={() => openBook(id)}>{b.title}</div>
                      <div className="label" style={{ color: 'rgba(10,10,10,0.6)', marginBottom: 14 }}>{b.author} · {pct}% through</div>
                      <MatchMeter value={pct} color="var(--ink)" />
                      <div className="row gap-2 mt-4" style={{ alignItems: 'center' }}>
                        <span className="label" style={{ color: 'rgba(10,10,10,0.65)' }}>ON PAGE</span>
                        <input type="number" value={p.page} min={0} max={b.pages}
                          onChange={e => updatePage(id, +e.target.value)}
                          style={{
                            width: 64, padding: '4px 8px',
                            border: '2px solid var(--ink)', background: 'var(--white)',
                            fontFamily: 'var(--f-mono)', fontWeight: 700, fontSize: 13,
                            textAlign: 'center', outline: 'none',
                          }} />
                        <button className="icon-btn" style={{ width: 28, height: 28, boxShadow: '2px 2px 0 var(--ink)' }}
                          onClick={() => updatePage(id, p.page + 10)} title="+10 pages">
                          <span className="mono" style={{ fontSize: 10, fontWeight: 700 }}>+10</span>
                        </button>
                        <span style={{ flex: 1 }} />
                        <Button variant="ink" size="sm" iconRight="arrow-right" onClick={() => openBook(id)}>Open</Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="section-head">
        <h2 className="h3" style={{ fontFamily: 'var(--f-serif)', fontStyle: 'italic', fontWeight: 400 }}>
          Editor's <span style={{ fontFamily: 'var(--f-display)', fontStyle: 'normal' }}>Picks</span>
        </h2>
        <span className="meta">{String(editorial.length).padStart(2,'0')} lists · refreshed weekly</span>
      </div>
      <div className="grid-4 mb-7">
        {editorial.map(r => (
          <ReadlistTile key={r.id} list={r} books={books} onOpen={() => openReadlist(r.id)} />
        ))}
      </div>

    </div>
  );
}

/* ──────────────────── READLIST DETAIL ──────────────────── */

function ReadlistScreen({ ctx, id }) {
  const { books, readlists, savedIds, toggleSave, openBook, setRoute, savedListIds, toggleSaveList, deleteReadlist } = ctx;
  const [moreOpen, setMoreOpen] = React.useState(false);

  React.useEffect(() => {
    if (!moreOpen) return;
    const close = () => setMoreOpen(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [moreOpen]);

  const list = readlists.find(r => r.id === id);
  if (!list) return <div className="empty">Readlist not found.</div>;
  const listBooks = (list.bookIds || []).map(bid => books.find(b => b.id === bid)).filter(Boolean);
  const totalPages = listBooks.reduce((s, b) => s + (b.pages || 0), 0);
  const avgMatch = listBooks.length && listBooks.some(b => b.match)
    ? Math.round(listBooks.reduce((s, b) => s + (b.match || 0), 0) / listBooks.length)
    : null;
  const dark = isDarkBg(list.accent);
  const txt = dark ? 'var(--white)' : 'var(--ink)';
  const subtxt = dark ? 'rgba(244,236,216,0.7)' : 'rgba(26,26,26,0.6)';
  const isSaved = (savedListIds || []).includes(list.id);

  const handleDelete = () => {
    deleteReadlist(list.id);
    setRoute({ name: 'library' });
  };

  const handleShare = () => {
    const text = `Check out "${list.title}" on ReadMe`;
    if (navigator.share) { navigator.share({ title: list.title, text }); }
    else if (navigator.clipboard) { navigator.clipboard.writeText(text); }
  };

  return (
    <div data-screen-label={`02 Readlist — ${list.title}`}>
      <button className="btn sm outline mb-5" onClick={() => setRoute({ name: 'home' })}>
        <Icon name="arrow-left" size={14} /> Back
      </button>

      <div className="card mb-6" style={{ background: list.accent, color: txt, padding: '36px 36px 32px', position: 'relative' }}>
        <div className="row gap-3 mb-3">
          <Badge color={dark ? 'white' : (list.ai ? 'ink' : 'white')} icon={list.ai ? 'sparkle' : 'tag'}>
            {list.ai ? 'AI READLIST' : 'EDITORIAL'}
          </Badge>
          <span className="label" style={{ color: subtxt }}>{list.curator}</span>
        </div>
        <h1 className="h1" style={{ marginBottom: 12, color: txt }}>{list.title}</h1>
        <p style={{ maxWidth: '54ch', fontSize: 17, marginBottom: 24, color: txt, opacity: dark ? 0.92 : 1 }}>{list.pitch}</p>

        <div className="row gap-3">
          <Button variant="outline" size="lg" icon={isSaved ? 'heart-fill' : 'heart'} onClick={() => toggleSaveList(list.id)}>
            {isSaved ? 'Saved' : 'Save list'}
          </Button>
          <div style={{ position: 'relative' }}>
            <Button variant="outline" size="lg" icon="more" onClick={e => { e.stopPropagation(); setMoreOpen(o => !o); }}>More</Button>
            {moreOpen && (
              <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, background: 'var(--white)', color: 'var(--ink)', border: '3px solid var(--ink)', boxShadow: '4px 4px 0 var(--ink)', zIndex: 200, minWidth: 180 }}>
                <button onClick={handleShare} style={{ display: 'block', width: '100%', padding: '12px 16px', textAlign: 'left', cursor: 'pointer', background: 'none', border: 'none', borderBottom: '2px solid var(--ink)', fontFamily: 'inherit', fontSize: 'inherit', color: 'var(--ink)' }}>Share</button>
                <button onClick={handleDelete} style={{ display: 'block', width: '100%', padding: '12px 16px', textAlign: 'left', cursor: 'pointer', background: 'none', border: 'none', fontFamily: 'inherit', fontSize: 'inherit', color: 'var(--terracotta)' }}>Delete readlist</button>
              </div>
            )}
          </div>
        </div>

        <div className="row gap-5 mt-6" style={{ paddingTop: 20, borderTop: `2px dashed ${dark ? 'rgba(244,236,216,0.35)' : 'rgba(26,26,26,0.35)'}`, flexWrap: 'wrap' }}>
          <Stat label="Books" value={listBooks.length} sub={subtxt} txt={txt} />
          <Stat label="Pages" value={totalPages.toLocaleString()} sub={subtxt} txt={txt} />
          {avgMatch !== null && <Stat label="Avg match" value={`${avgMatch}%`} sub={subtxt} txt={txt} />}
          <Stat label="Saves" value={list.saves.toLocaleString()} sub={subtxt} txt={txt} />
        </div>
      </div>

      <div className="mb-6">
        {listBooks.map((b, i) => (
          <BookRow key={b.id} book={b} idx={i} onClick={() => openBook(b.id)}
            saved={savedIds.includes(b.id)}
            onToggleSave={() => toggleSave(b.id)} />
        ))}
      </div>
    </div>
  );
}

function isDarkBg(hex) {
  if (!hex || !hex.startsWith('#')) return false;
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0,2), 16), g = parseInt(h.slice(2,4), 16), b = parseInt(h.slice(4,6), 16);
  return (0.299*r + 0.587*g + 0.114*b) < 140;
}

function Stat({ label, value, txt = 'var(--ink)', sub = 'rgba(26,26,26,0.6)' }) {
  return (
    <div>
      <div className="label" style={{ color: sub, marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: 'var(--f-display)', fontSize: 22, lineHeight: 1, color: txt }}>{value}</div>
    </div>
  );
}

/* ──────────────────── AI GENERATOR ──────────────────── */

function GeneratorScreen({ ctx }) {
  const { books, openReadlist, openBook, addReadlist, generateReadlist } = ctx;
  const [step, setStep] = React.useState(1);
  const [vibe, setVibe] = React.useState('');
  const [moods, setMoods] = React.useState([]);
  const [genres, setGenres] = React.useState([]);
  const [length, setLength] = React.useState(LENGTHS[1]);
  const [count, setCount] = React.useState(6);
  const [generating, setGenerating] = React.useState(false);
  const [generated, setGenerated] = React.useState(null);
  const [genStage, setGenStage] = React.useState('');
  const [genTime, setGenTime] = React.useState(null);

  const toggle = (arr, setArr, v) => setArr(arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v]);

  const run = async () => {
    setGenerating(true);
    setStep(4);
    const stages = [
      'Reading your shelf…',
      'Pulling 12,840 candidates…',
      'Matching mood vectors…',
      'Filtering by length…',
      'Writing reasons…',
      'Sequencing the readlist…',
    ];
    let i = 0;
    setGenStage(stages[0]);

    // Animate stages while waiting for the real API (or fallback)
    const stageTimer = setInterval(() => {
      i = Math.min(i + 1, stages.length - 1);
      setGenStage(stages[i]);
    }, 700);

    const t0 = Date.now();
    let result = null;

    try {
      result = await generateReadlist({ vibe, moods, genres, length, count, readIds: ctx.readIds });
    } catch (_) {}

    clearInterval(stageTimer);

    // Fallback to client-side mock if backend isn't available
    if (!result) {
      const pool = [...books].sort(() => Math.random() - 0.5).slice(0, count);
      result = {
        title: vibe || (moods[0] ? `${moods[0]} reads` : 'Tonight\'s readlist'),
        pitch: `A ${count}-book readlist tuned to ${moods.slice(0,2).join(' + ') || 'your current taste'}.`,
        books: pool.map(b => ({ ...b, why: b.why })),
      };
    }

    const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
    setGenTime(elapsed);

    const newList = {
      id: 'gen-' + Date.now(),
      title: 'Readlist based on your past reads',
      sub: `Generated for you · ${result.books.length} books`,
      pitch: result.pitch,
      accent: '#B5A7FF',
      bookIds: result.books.map(b => b.id),
      saves: 0,
      curator: 'ReadMe AI',
      ai: true,
    };
    setGenerated({ list: newList, books: result.books });
    setGenerating(false);
  };

  if (generated) {
    const { list, books: genBooks } = generated;
    return (
      <div data-screen-label="03 Generator — Result">
        <div className="alert mb-5">
          <Icon name="sparkle" size={20} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700 }}>Readlist generated.</div>
            <div className="caption">Took {genTime}s · Reasoned over {books.length} books · {list.bookIds.length} survived.</div>
          </div>
          <Button variant="ink" size="sm" icon="check" onClick={() => { addReadlist(list); openReadlist(list.id); }}>Save to library</Button>
        </div>

        <div className="card mb-5" style={{ background: list.accent, padding: 28 }}>
          <Badge color="ink" icon="sparkle">AI READLIST</Badge>
          <h1 className="h2" style={{ marginTop: 14, marginBottom: 10 }}>{list.title}</h1>
          <p style={{ maxWidth: '54ch', fontSize: 16, margin: 0 }}>{list.pitch}</p>
        </div>

        <div className="mb-5">
          {genBooks.map((b, i) => (
            <BookRow key={b.id} book={b} idx={i} onClick={() => openBook(b.id)}
              saved={ctx.savedIds.includes(b.id)}
              onToggleSave={() => ctx.toggleSave(b.id)} />
          ))}
        </div>

        <div className="row gap-3">
          <Button variant="primary" size="lg" icon="shuffle" onClick={() => { setGenerated(null); setStep(1); }}>Regenerate</Button>
          <Button variant="outline" size="lg" icon="edit" onClick={() => { setGenerated(null); setStep(3); }}>Tweak inputs</Button>
        </div>
      </div>
    );
  }

  return (
    <div data-screen-label="03 AI Generator">
      <div className="row gap-3 mb-4">
        <Badge color="magenta" icon="sparkle">EXPERIMENTAL</Badge>
        <span className="label" style={{ color: 'rgba(10,10,10,0.6)' }}>README AI · v0.4</span>
      </div>
      <h1 className="h1 mb-5" style={{ maxWidth: '14ch' }}>
        <span style={{ fontFamily: 'var(--f-serif)', fontStyle: 'italic' }}>Describe a vibe.</span><br />
        We'll build the readlist.
      </h1>

      <div className="stepper mb-6">
        {['Vibe', 'Mood', 'Shape', 'Run'].map((label, i) => (
          <React.Fragment key={label}>
            <div className={`step ${step > i + 1 ? 'done' : step === i + 1 ? 'active' : ''}`}>
              <div className="dot">{step > i + 1 ? <Icon name="check" size={14} stroke={3}/> : i + 1}</div>
              {label}
            </div>
            {i < 3 && <div className="connector" />}
          </React.Fragment>
        ))}
      </div>

      {step === 1 && (
        <div className="card mb-5" style={{ padding: 28 }}>
          <div className="label mb-3">STEP 01 · IN PLAIN ENGLISH</div>
          <div className="h3 mb-4" style={{ fontFamily: 'var(--f-serif)', fontStyle: 'italic', fontWeight: 400 }}>
            What are you in the mood for tonight?
          </div>
          <textarea
            className="input"
            style={{ minHeight: 120, fontSize: 18, fontFamily: 'var(--f-serif-italic)' }}
            placeholder='Try: "Something that feels like walking home in November" or "Sci-fi but quiet"'
            value={vibe} onChange={e => setVibe(e.target.value)}
          />
          <div className="row gap-2 mt-4" style={{ flexWrap: 'wrap' }}>
            {['Quiet sci-fi', 'Wreck me', 'Cosy classics', 'Brain on fire', 'Late-night read'].map(p => (
              <button key={p} className="chip" onClick={() => setVibe(p)}>{p}</button>
            ))}
          </div>
          <div className="row gap-3 mt-5" style={{ justifyContent: 'flex-end' }}>
            <Button variant="primary" iconRight="arrow-right" onClick={() => setStep(2)} disabled={!vibe.trim()}>Next: mood</Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="card mb-5" style={{ padding: 28 }}>
          <div className="label mb-3">STEP 02 · PICK 1–3 MOODS</div>
          <div className="h3 mb-4" style={{ fontFamily: 'var(--f-serif)', fontStyle: 'italic', fontWeight: 400 }}>How should it feel?</div>
          <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
            {MOODS.map(m => (
              <button key={m} className={`chip ${moods.includes(m) ? 'active' : ''}`} onClick={() => toggle(moods, setMoods, m)}>
                {m} {moods.includes(m) && <span className="x">×</span>}
              </button>
            ))}
          </div>
          <div className="row gap-3 mt-5" style={{ justifyContent: 'space-between' }}>
            <Button variant="outline" icon="arrow-left" onClick={() => setStep(1)}>Back</Button>
            <Button variant="primary" iconRight="arrow-right" onClick={() => setStep(3)} disabled={!moods.length}>Next: shape</Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="card mb-5" style={{ padding: 28 }}>
          <div className="label mb-3">STEP 03 · SHAPE THE LIST</div>

          <div className="mb-5">
            <div className="label mb-3">Genres (optional)</div>
            <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
              {GENRES.map(g => (
                <button key={g} className={`chip ${genres.includes(g) ? 'active' : ''}`} onClick={() => toggle(genres, setGenres, g)}>{g}</button>
              ))}
            </div>
          </div>

          <div className="mb-5">
            <div className="label mb-3">Length</div>
            <div className="row gap-2">
              {LENGTHS.map(l => (
                <button key={l} className={`chip ${length === l ? 'active' : ''}`} onClick={() => setLength(l)}>{l}</button>
              ))}
            </div>
          </div>

          <div className="mb-5">
            <div className="label mb-3">How many books? <span style={{ background: 'var(--yellow)', padding: '0 8px', marginLeft: 6, fontFamily: 'var(--f-display)' }}>{count}</span></div>
            <input type="range" min="3" max="12" step="1" value={count} onChange={e => setCount(+e.target.value)} style={{ width: '100%' }} />
          </div>

          <div className="row gap-3 mt-5" style={{ justifyContent: 'space-between' }}>
            <Button variant="outline" icon="arrow-left" onClick={() => setStep(2)}>Back</Button>
            <Button variant="magenta" iconRight="sparkle" size="lg" onClick={run}>Generate readlist</Button>
          </div>
        </div>
      )}

      {step === 4 && generating && (
        <div className="card center" style={{ padding: 56, background: 'var(--ink)', color: 'var(--white)' }}>
          <div className="label mb-4" style={{ color: 'var(--yellow)' }}>READING THE TEA LEAVES</div>
          <GeneratorAnim />
          <div className="h3 mt-5" style={{ color: 'var(--white)' }}>{genStage}</div>
          <div className="label mt-3" style={{ color: 'rgba(255,255,255,0.55)' }}>This usually takes ~5 seconds.</div>
        </div>
      )}

      {step >= 2 && !generating && (
        <div className="card flat mb-5" style={{ background: 'transparent', borderStyle: 'dashed', padding: 18 }}>
          <div className="label mb-3">YOUR INPUTS SO FAR</div>
          <div className="row gap-3" style={{ flexWrap: 'wrap' }}>
            {vibe && <span className="chip active">vibe: {vibe}</span>}
            {moods.map(m => <span key={m} className="chip">{m}</span>)}
            {genres.map(g => <span key={g} className="chip">{g}</span>)}
            <span className="chip">{length}</span>
            <span className="chip">{count} books</span>
          </div>
        </div>
      )}
    </div>
  );
}

function GeneratorAnim() {
  return (
    <svg viewBox="0 0 200 60" style={{ width: 280, height: 84 }}>
      {Array.from({ length: 10 }).map((_, i) => (
        <rect key={i} x={i * 20 + 4} y="20" width="12" height="20"
          fill="var(--yellow)" stroke="var(--white)" strokeWidth="2">
          <animate attributeName="y" values="20;8;20" dur="1.2s" begin={`${i * 0.08}s`} repeatCount="indefinite" />
          <animate attributeName="height" values="20;40;20" dur="1.2s" begin={`${i * 0.08}s`} repeatCount="indefinite" />
        </rect>
      ))}
    </svg>
  );
}

/* ──────────────────── TASTE PROFILE ──────────────────── */

function TasteScreen({ ctx }) {
  const { books, readIds, savedIds, toggleRead, openBook, reviews, openReview, importBook, generateReadlist, updateBook } = ctx;
  const [search, setSearch] = React.useState('');
  const [olResults, setOlResults] = React.useState([]);
  const [searching, setSearching] = React.useState(false);
  const [addingId, setAddingId] = React.useState(null);
  const [showRecs, setShowRecs] = React.useState(false);
  const [generating, setGenerating] = React.useState(false);
  const [aiRecs, setAiRecs] = React.useState(null);
  const API = window.README_API_BASE || '';

  React.useEffect(() => {
    if (!search || search.length < 2) { setOlResults([]); setSearching(false); return; }
    setSearching(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`${API}/api/books/search?q=${encodeURIComponent(search)}`);
        setOlResults(res.ok ? await res.json() : []);
      } catch { setOlResults([]); }
      setSearching(false);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const handleMarkRead = async (olBook) => {
    setAddingId(olBook.ol_key);
    try {
      const book = await importBook(olBook);
      if (book) { toggleRead(book.id); openBook(book.id); }
    } finally { setAddingId(null); }
  };

  const handleGenerate = async () => {
    setShowRecs(true);
    setGenerating(true);
    setAiRecs(null);
    const read = books.filter(b => readIds.includes(b.id));
    const tagFreq = {};
    read.forEach(b => (b.tags || []).forEach(t => { tagFreq[t] = (tagFreq[t] || 0) + 1; }));
    const topTags = Object.entries(tagFreq).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([t]) => t);
    const titles = read.slice(0, 5).map(b => b.title).join(', ');
    const vibe = `Books with the same feel as: ${titles}`;
    try {
      const result = await generateReadlist({ vibe, moods: topTags.length ? topTags : ['literary'], readIds, count: 6 });
      if (result?.books) {
        result.books.forEach(b => { if (b.why) updateBook(b.id, { why: b.why }); });
        setAiRecs(result.books);
      }
    } finally { setGenerating(false); }
  };

  const read = books.filter(b => readIds.includes(b.id));

  return (
    <div data-screen-label="04 Taste Profile">
      <div className="row gap-3 mb-4">
        <Badge color="lime" icon="tag">TASTE PROFILE</Badge>
        <span className="label" style={{ color: 'rgba(10,10,10,0.6)' }}>{readIds.length} BOOKS · {Object.keys(read.reduce((o, b) => { b.tags.forEach(t => o[t] = 1); return o; }, {})).length} TAGS</span>
      </div>

      <h1 className="h1 mb-5">
        <span style={{ fontFamily: 'var(--f-serif)', fontStyle: 'italic' }}>Tell us what</span><br />
        you've already read.
      </h1>
      <p style={{ maxWidth: '60ch', fontSize: 17, marginBottom: 32 }}>
        Every book you mark <span style={{ background: 'var(--lime)', padding: '0 6px', fontFamily: 'var(--f-mono)', fontWeight: 700, fontSize: 14 }}>READ</span> tunes the algorithm.
        Aim for at least 5 — more is better.
      </p>

      <div className="row gap-4 mb-5">
        <div className="search" style={{ flex: 1, boxShadow: '4px 4px 0 var(--ink)' }}>
          <Icon name="search" size={18} />
          <input
            placeholder="Search any book — powered by OpenLibrary…"
            value={search} onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Button variant="magenta" size="lg" icon="sparkle"
          disabled={readIds.length < 3 || generating}
          onClick={handleGenerate}>
          {generating ? 'Generating…' : readIds.length < 3 ? `Need ${3 - readIds.length} more` : `Recommend from ${readIds.length}`}
        </Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 18 }} className="mb-7">
        <div>
          <div className="section-head">
            <h2 className="h4">{search.length >= 2 ? 'Search results' : 'Search to add books'}</h2>
            {search.length >= 2 && <span className="meta">{searching ? 'SEARCHING…' : `${olResults.length} FOUND`}</span>}
          </div>
          {search.length < 2 ? (
            <div className="card" style={{ background: 'var(--paper-2)', padding: 32, textAlign: 'center' }}>
              <div className="label mb-3">START TYPING TO SEARCH</div>
              <div style={{ fontSize: 15, opacity: 0.65 }}>Search any book from OpenLibrary's 20M+ catalog and mark it as read to build your taste profile.</div>
            </div>
          ) : searching && olResults.length === 0 ? (
            <div className="card" style={{ background: 'var(--paper-2)', padding: 24, textAlign: 'center' }}>
              <div className="label">Searching 20 million books…</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {olResults.slice(0, 8).map(ol => {
                const alreadyRead = books.some(b => b.ol_key === ol.ol_key && readIds.includes(b.id));
                return (
                  <div key={ol.ol_key} className="card" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px' }}>
                    <div style={{ width: 36, height: 50, flexShrink: 0, border: '2px solid var(--ink)', background: 'var(--paper-2)', overflow: 'hidden' }}>
                      {ol.cover_i && <img src={`https://covers.openlibrary.org/b/id/${ol.cover_i}-S.jpg`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'var(--f-display)', fontSize: 13, lineHeight: 1.2 }}>{ol.title}</div>
                      <div className="label" style={{ color: 'rgba(10,10,10,0.55)', marginTop: 2 }}>{ol.author}{ol.year ? ` · ${ol.year}` : ''}</div>
                    </div>
                    <button
                      className={`btn sm ${alreadyRead ? '' : 'primary'}`}
                      disabled={addingId === ol.ol_key || alreadyRead}
                      onClick={() => handleMarkRead(ol)}
                      style={{ flexShrink: 0 }}
                    >
                      {alreadyRead ? '✓ Read' : addingId === ol.ol_key ? '…' : 'Mark Read'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <div className="section-head">
            <h2 className="h4">Your read pile</h2>
            <span className="meta">{readIds.length}/∞</span>
          </div>
          <div className="card" style={{ padding: 0, background: 'var(--paper-2)', minHeight: 200 }}>
            {read.length === 0 && (
              <div className="empty" style={{ border: 0, padding: 32 }}>
                <div className="label mb-3">EMPTY SHELF</div>
                <div>Tap books in the catalog to start your pile.</div>
              </div>
            )}
            {read.map(b => {
              const rv = reviews[b.id];
              return (
                <div key={b.id} style={{ padding: 14, borderBottom: '2px solid var(--ink)' }}>
                  <div className="row gap-3" style={{ alignItems: 'flex-start' }}>
                    <div style={{ width: 44, aspectRatio: '2/3', border: '2px solid var(--ink)', flexShrink: 0 }}>
                      <BookCover book={b} size="xs" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'var(--f-display)', fontSize: 14, lineHeight: 1.1 }}>{b.title}</div>
                      <div className="row gap-2 mt-3" style={{ alignItems: 'center' }}>
                        {rv?.rating ? (
                          <React.Fragment>
                            <Stars value={rv.rating} size={11} />
                            <span className="label" style={{ color: 'rgba(10,10,10,0.55)' }}>{rv.rating}/5</span>
                          </React.Fragment>
                        ) : (
                          <button className="chip" style={{ padding: '4px 8px', fontSize: 10 }} onClick={() => openReview(b.id)}>
                            + Add review
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="row gap-2">
                      {rv && (
                        <button className="icon-btn" style={{ width: 28, height: 28, boxShadow: 'none' }} onClick={() => openReview(b.id)}>
                          <Icon name="edit" size={13} stroke={2.6}/>
                        </button>
                      )}
                      <button className="icon-btn" style={{ width: 28, height: 28, boxShadow: 'none' }} onClick={() => toggleRead(b.id)}>
                        <Icon name="x" size={13} stroke={2.6}/>
                      </button>
                    </div>
                  </div>
                  {rv?.text && (
                    <p style={{ margin: '10px 0 0', paddingLeft: 56, fontFamily: 'var(--f-serif)', fontStyle: 'italic', fontSize: 13, lineHeight: 1.35, color: 'rgba(10,10,10,0.78)' }}>
                      "{rv.text}"
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {read.length > 0 && (
            <div className="mt-5">
              <div className="label mb-3">YOUR TASTE CLUSTERS</div>
              <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                {Object.entries(read.reduce((o, b) => {
                  b.tags.forEach(t => o[t] = (o[t] || 0) + 1);
                  return o;
                }, {})).sort((a,b) => b[1] - a[1]).map(([t, n]) => (
                  <span key={t} className="chip" style={{ background: n >= 2 ? 'var(--yellow)' : 'var(--white)' }}>
                    {t} <span style={{ opacity: 0.6 }}>×{n}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {showRecs && (
        <div data-screen-label="05 Recommendations">
          {generating ? (
            <div className="card" style={{ background: 'var(--paper-2)', padding: 40, textAlign: 'center' }}>
              <div className="label mb-3">AI IS READING YOUR SHELF…</div>
              <div style={{ fontFamily: 'var(--f-serif)', fontStyle: 'italic', fontSize: 17, opacity: 0.65 }}>
                Matching your taste across the catalog
              </div>
            </div>
          ) : aiRecs && aiRecs.length > 0 ? (
            <React.Fragment>
              <div className="row gap-3 mb-3">
                <Badge color="magenta" icon="sparkle">AI PICKS FOR YOU</Badge>
                <span className="label" style={{ color: 'rgba(10,10,10,0.6)' }}>BASED ON {readIds.length} BOOKS · {aiRecs.length} PICKS</span>
              </div>
              <h2 className="h2 mb-5">
                <span style={{ fontFamily: 'var(--f-serif)', fontStyle: 'italic' }}>Try these,</span>{' '}
                <span style={{ background: 'var(--ink)', color: 'var(--yellow)', padding: '0 8px' }}>then.</span>
              </h2>
              <div className="mb-6">
                {aiRecs.map((b, i) => (
                  <BookRow key={b.id} book={b} idx={i} onClick={() => openBook(b.id)}
                    saved={savedIds.includes(b.id)}
                    onToggleSave={() => ctx.toggleSave(b.id)} />
                ))}
              </div>
            </React.Fragment>
          ) : null}
        </div>
      )}
    </div>
  );
}

/* ──────────────────── SEARCH ──────────────────── */

function OLBookCard({ book, onAdd, adding }) {
  const coverUrl = book.cover_i
    ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
    : null;
  return (
    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px' }}>
      <div style={{
        width: 44, height: 60, flexShrink: 0,
        border: 'var(--stroke) solid var(--ink)',
        background: 'var(--paper-2)',
        overflow: 'hidden',
      }}>
        {coverUrl && <img src={coverUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--f-display)', fontSize: 14, lineHeight: 1.2, marginBottom: 4 }}>
          {book.title}
        </div>
        <div className="label" style={{ color: 'rgba(10,10,10,0.55)' }}>
          {book.author}{book.year ? ` · ${book.year}` : ''}{book.pages ? ` · ${book.pages}p` : ''}
        </div>
        {book.tags?.length > 0 && (
          <div style={{ marginTop: 6, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {book.tags.slice(0, 3).map(t => (
              <span key={t} className="chip" style={{ fontSize: 11, padding: '2px 8px', cursor: 'default' }}>{t}</span>
            ))}
          </div>
        )}
      </div>
      <button className="btn sm primary" onClick={onAdd} disabled={adding} style={{ flexShrink: 0 }}>
        {adding ? '…' : 'Add'}
      </button>
    </div>
  );
}

function SearchScreen({ ctx, query, setQuery }) {
  const { books, readlists, openBook, openReadlist } = ctx;
  const [filter, setFilter] = React.useState('All');
  const [olResults, setOlResults] = React.useState([]);
  const [searching, setSearching] = React.useState(false);
  const [addingId, setAddingId] = React.useState(null);
  const filters = ['All', 'Books', 'Readlists', 'Tags'];
  const API = window.README_API_BASE || '';

  const q = query.toLowerCase().trim();

  React.useEffect(() => {
    if (!q || q.length < 2) { setOlResults([]); setSearching(false); return; }
    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`${API}/api/books/search?q=${encodeURIComponent(q)}`);
        setOlResults(res.ok ? await res.json() : []);
      } catch { setOlResults([]); }
      setSearching(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [q]);

  // Only show books the user has imported (have an ol_key), not the seeded catalog
  const myBooks = books.filter(b => b.ol_key);
  const matchBooks = q ? myBooks.filter(b =>
    b.title.toLowerCase().includes(q) ||
    b.author.toLowerCase().includes(q) ||
    (b.tags || []).some(t => t.toLowerCase().includes(q))
  ) : myBooks.slice(0, 12);

  const matchLists = q ? readlists.filter(r =>
    r.title.toLowerCase().includes(q) || r.pitch.toLowerCase().includes(q)
  ) : readlists;

  const allTags = [...new Set(books.flatMap(b => b.tags || []))];
  const matchTags = q ? allTags.filter(t => t.toLowerCase().includes(q)) : allTags.slice(0, 14);

  // Hide OL results already in the local catalog
  const newOlResults = olResults.filter(ol =>
    !books.some(b => b.ol_key === ol.ol_key || b.title.toLowerCase() === ol.title.toLowerCase())
  );

  const handleAddOL = async (olBook) => {
    setAddingId(olBook.ol_key);
    try {
      const book = await ctx.importBook(olBook);
      if (book) ctx.openBook(book.id);
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div data-screen-label="06 Search">
      <h1 className="h1 mb-5">
        <span style={{ fontFamily: 'var(--f-serif)', fontStyle: 'italic' }}>Find</span>{' '}
        <span style={{ background: 'var(--yellow)', padding: '0 10px' }}>something</span> new.
      </h1>

      <div className="tabs mb-5">
        {filters.map(f => (
          <button key={f} className={`tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>

      {!q && (
        <div className="card mb-6" style={{ background: 'var(--paper-2)' }}>
          <div className="label mb-3">BROWSE BY TAG</div>
          <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
            {matchTags.map(t => (
              <button key={t} className="chip" onClick={() => setQuery(t)}>{t}</button>
            ))}
          </div>
        </div>
      )}

      {(filter === 'All' || filter === 'Books') && matchBooks.length > 0 && (
        <div className="mb-6">
          <div className="section-head">
            <h2 className="h3" style={{ fontFamily: 'var(--f-serif)', fontStyle: 'italic', fontWeight: 400 }}>Your Catalog</h2>
            <span className="meta">{matchBooks.length} MATCHES</span>
          </div>
          <div className="grid-6">
            {matchBooks.slice(0, 12).map(b => (
              <div key={b.id} onClick={() => openBook(b.id)} style={{ cursor: 'pointer' }}>
                <BookCover book={b} size="md" />
                <div style={{ marginTop: 10 }}>
                  <div style={{ fontFamily: 'var(--f-display)', fontSize: 14, lineHeight: 1.1 }}>{b.title}</div>
                  <div className="label mt-3" style={{ color: 'rgba(10,10,10,0.55)' }}>{b.author}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(filter === 'All' || filter === 'Readlists') && matchLists.length > 0 && (
        <div className="mb-6">
          <div className="section-head">
            <h2 className="h3" style={{ fontFamily: 'var(--f-serif)', fontStyle: 'italic', fontWeight: 400 }}>Readlists</h2>
            <span className="meta">{matchLists.length} MATCHES</span>
          </div>
          <div className="grid-4">
            {matchLists.map(r => <ReadlistTile key={r.id} list={r} books={books} onOpen={() => openReadlist(r.id)} />)}
          </div>
        </div>
      )}

      {(filter === 'All' || filter === 'Books') && q && (
        <div className="mb-6">
          <div className="section-head">
            <h2 className="h3" style={{ fontFamily: 'var(--f-serif)', fontStyle: 'italic', fontWeight: 400 }}>From OpenLibrary</h2>
            {searching
              ? <span className="meta">SEARCHING…</span>
              : <span className="meta">{newOlResults.length} BOOKS FOUND</span>
            }
          </div>
          {searching && newOlResults.length === 0 ? (
            <div className="card" style={{ background: 'var(--paper-2)', textAlign: 'center', padding: '32px 16px' }}>
              <div className="label">Searching 20 million books…</div>
            </div>
          ) : newOlResults.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {newOlResults.slice(0, 10).map(ol => (
                <OLBookCard
                  key={ol.ol_key}
                  book={ol}
                  adding={addingId === ol.ol_key}
                  onAdd={() => handleAddOL(ol)}
                />
              ))}
            </div>
          ) : !searching ? (
            <div className="empty"><div>No new books found outside your catalog.</div></div>
          ) : null}
        </div>
      )}

      {!q && matchBooks.length === 0 && matchLists.length === 0 && (
        <div className="empty">
          <div className="label mb-3">NO RESULTS</div>
          <div>Try a different vibe, author, or genre.</div>
        </div>
      )}
    </div>
  );
}

/* ──────────────────── LIBRARY ──────────────────── */

/* ──────────────────── CREATE READLIST MODAL ──────────────────── */

function CreateReadlistModal({ ctx, onClose }) {
  const [title, setTitle] = React.useState('');
  const [pitch, setPitch] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [olResults, setOlResults] = React.useState([]);
  const [searching, setSearching] = React.useState(false);
  const [addedBooks, setAddedBooks] = React.useState([]);
  const [importingId, setImportingId] = React.useState(null);
  const API = window.README_API_BASE || '';

  React.useEffect(() => {
    if (!search || search.length < 2) { setOlResults([]); return; }
    setSearching(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`${API}/api/books/search?q=${encodeURIComponent(search)}`);
        setOlResults(res.ok ? await res.json() : []);
      } catch { setOlResults([]); }
      setSearching(false);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const handleAdd = async (ol) => {
    if (addedBooks.some(b => b.ol_key === ol.ol_key)) return;
    setImportingId(ol.ol_key);
    try {
      const book = await ctx.importBook(ol);
      if (book) setAddedBooks(prev => [...prev, book]);
    } finally { setImportingId(null); }
  };

  const handleCreate = () => {
    if (!title.trim()) return;
    const id = `manual-${Date.now()}`;
    ctx.addReadlist({
      id, title: title.trim(), pitch: pitch.trim(),
      sub: `${addedBooks.length} books`,
      accent: '#2849A3', curator: 'You', ai: false, saves: 0,
      bookIds: addedBooks.map(b => b.id),
    });
    onClose();
  };

  return (
    <Modal onClose={onClose}>
      <h2 className="h2 mb-5">Create a readlist</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <div className="label mb-2">Title</div>
          <input className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder="My readlist name" autoFocus />
        </div>
        <div>
          <div className="label mb-2">Description <span style={{ opacity: 0.5 }}>(optional)</span></div>
          <input className="input" value={pitch} onChange={e => setPitch(e.target.value)} placeholder="What's this list about?" />
        </div>

        <div>
          <div className="label mb-2">Add books</div>
          <div className="search mb-3" style={{ boxShadow: '3px 3px 0 var(--ink)' }}>
            <Icon name="search" size={16} />
            <input placeholder="Search any book…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          {searching && <div className="label" style={{ opacity: 0.5, marginBottom: 8 }}>Searching…</div>}
          {olResults.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 220, overflowY: 'auto', marginBottom: 12 }}>
              {olResults.slice(0, 6).map(ol => {
                const added = addedBooks.some(b => b.ol_key === ol.ol_key);
                return (
                  <div key={ol.ol_key} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--paper-2)' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'var(--f-display)', fontSize: 13 }}>{ol.title}</div>
                      <div className="label" style={{ color: 'rgba(10,10,10,0.55)' }}>{ol.author}{ol.year ? ` · ${ol.year}` : ''}</div>
                    </div>
                    <button className={`btn sm ${added ? 'outline' : 'primary'}`} disabled={added || importingId === ol.ol_key} onClick={() => handleAdd(ol)}>
                      {added ? '✓' : importingId === ol.ol_key ? '…' : '+'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {addedBooks.length > 0 && (
          <div>
            <div className="label mb-2">{addedBooks.length} BOOK{addedBooks.length === 1 ? '' : 'S'} ADDED</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {addedBooks.map(b => (
                <span key={b.id} className="chip active" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {b.title}
                  <button onClick={() => setAddedBooks(p => p.filter(x => x.id !== b.id))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0, lineHeight: 1 }}>×</button>
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="row gap-3 mt-2">
          <button className="btn primary" onClick={handleCreate} disabled={!title.trim()}>Create readlist</button>
          <button className="btn outline" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </Modal>
  );
}

function LibraryScreen({ ctx }) {
  const { books, readlists, savedIds, readIds, reading, openBook, openReadlist, setRoute, updatePage, finishReading, deleteReadlist } = ctx;
  const [tab, setTab] = React.useState('Readlists');
  const [showCreate, setShowCreate] = React.useState(false);
  const tabs = ['Readlists', 'Reading', 'Saved', 'Read'];

  const saved = books.filter(b => savedIds.includes(b.id));
  const read = books.filter(b => readIds.includes(b.id));
  const readingBooks = Object.keys(reading).map(id => books.find(b => b.id === id)).filter(Boolean);

  return (
    <div data-screen-label="07 Library">
      <h1 className="h1 mb-5">Your library.</h1>
      <div className="row gap-3 mb-5">
        <div className="tabs">
          {tabs.map(t => (
            <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t} <span style={{ marginLeft: 8, opacity: 0.6, fontWeight: 400 }}>{
                t === 'Readlists' ? readlists.length :
                t === 'Reading' ? readingBooks.length :
                t === 'Saved' ? saved.length : read.length
              }</span>
            </button>
          ))}
        </div>
        <span style={{ flex: 1 }} />
        <Button variant="outline" icon="plus" onClick={() => setShowCreate(true)}>Create manually</Button>
        <Button variant="primary" icon="sparkle" onClick={() => setRoute({ name: 'generator' })}>New AI readlist</Button>
        {showCreate && <CreateReadlistModal ctx={ctx} onClose={() => setShowCreate(false)} />}
      </div>

      {tab === 'Readlists' && (
        <div className="grid-3">
          {readlists.map(r => (
            <ReadlistTile key={r.id} list={r} books={books} onOpen={() => openReadlist(r.id)} onDelete={ctx.deleteReadlist} />
          ))}
        </div>
      )}
      {tab === 'Reading' && (
        readingBooks.length ? (
          <div className="grid-3">
            {readingBooks.map(b => {
              const p = reading[b.id];
              const pct = Math.round((p.page / b.pages) * 100);
              return (
                <div key={b.id} className="card" style={{ background: 'var(--yellow)' }}>
                  <div className="row gap-3 mb-3" style={{ alignItems: 'flex-start' }}>
                    <div style={{ width: 56, flexShrink: 0 }}>
                      <BookCover book={b} size="xs" onClick={() => openBook(b.id)} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'var(--f-display)', fontSize: 16, lineHeight: 1.1, cursor: 'pointer' }} onClick={() => openBook(b.id)}>{b.title}</div>
                      <div className="label mt-3" style={{ color: 'rgba(10,10,10,0.6)' }}>{b.author}</div>
                    </div>
                  </div>
                  <div className="row gap-2 mb-3" style={{ alignItems: 'baseline' }}>
                    <span style={{ fontFamily: 'var(--f-display)', fontSize: 22, lineHeight: 1 }}>{p.page}</span>
                    <span className="label" style={{ color: 'rgba(10,10,10,0.55)' }}>/ {b.pages} · {pct}%</span>
                  </div>
                  <MatchMeter value={pct} color="var(--ink)" />
                  <div className="row gap-2 mt-4" style={{ alignItems: 'center' }}>
                    <input type="number" value={p.page} min={0} max={b.pages}
                      onChange={e => updatePage(b.id, +e.target.value)}
                      style={{ width: 64, padding: '4px 8px', border: '2px solid var(--ink)', background: 'var(--white)', fontFamily: 'var(--f-mono)', fontWeight: 700, fontSize: 13, textAlign: 'center', outline: 'none' }} />
                    <button className="chip" onClick={() => updatePage(b.id, p.page + 10)}>+10</button>
                    <span style={{ flex: 1 }} />
                    <Button variant="ink" size="sm" icon="check" onClick={() => finishReading(b.id)}>Finished</Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : <div className="empty"><div className="label mb-3">NOTHING IN PROGRESS</div>Open any book and tap <em>Start reading</em>.</div>
      )}
      {tab === 'Saved' && (
        saved.length ? (
          <div>{saved.map((b, i) => <BookRow key={b.id} book={b} idx={i} onClick={() => openBook(b.id)} saved={true} onToggleSave={() => ctx.toggleSave(b.id)} />)}</div>
        ) : <div className="empty"><div className="label mb-3">EMPTY</div>Heart books from anywhere to save them here.</div>
      )}
      {tab === 'Read' && (
        read.length ? (
          <div className="grid-5">
            {read.map(b => (
              <div key={b.id} onClick={() => openBook(b.id)} style={{ cursor: 'pointer' }}>
                <BookCover book={b} size="md" />
                <div style={{ marginTop: 10 }}>
                  <div style={{ fontFamily: 'var(--f-display)', fontSize: 14, lineHeight: 1.1 }}>{b.title}</div>
                  <div className="label mt-3" style={{ color: 'rgba(10,10,10,0.55)' }}>{b.author}</div>
                </div>
              </div>
            ))}
          </div>
        ) : <div className="empty">Nothing marked read yet. <a onClick={() => setRoute({ name: 'taste' })} style={{ cursor: 'pointer', textDecoration: 'underline' }}>Add some →</a></div>
      )}
    </div>
  );
}

/* ──────────────────── MODALS ──────────────────── */

function ReviewModal({ book, existing, onSave, onSkip }) {
  const [rating, setRating] = React.useState(existing?.rating || 0);
  const [text, setText] = React.useState(existing?.text || '');
  return (
    <Modal onClose={onSkip}>
      <div className="row gap-3 mb-3">
        <Badge color="lime" icon="check">MARKED READ</Badge>
        <span className="label" style={{ color: 'rgba(10,10,10,0.6)' }}>1/2 — A QUICK REVIEW (OPTIONAL)</span>
      </div>
      <h2 className="h2" style={{ marginBottom: 6 }}>
        <span style={{ fontFamily: 'var(--f-serif)', fontStyle: 'italic' }}>How was</span><br />
        {book.title}?
      </h2>
      <div className="label mb-5" style={{ color: 'rgba(10,10,10,0.65)' }}>{book.author}</div>

      <div className="row gap-5" style={{ alignItems: 'flex-start' }}>
        <div style={{ width: 140, flexShrink: 0 }}>
          <BookCover book={book} size="md" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="label mb-3">YOUR RATING</div>
          <div className="row gap-2 mb-5">
            {[1,2,3,4,5].map(n => (
              <button key={n} onClick={() => setRating(n)} style={{
                width: 44, height: 44,
                background: rating >= n ? 'var(--yellow)' : 'var(--white)',
                border: '3px solid var(--ink)', cursor: 'pointer',
                display: 'grid', placeItems: 'center', color: 'var(--ink)',
                boxShadow: rating >= n ? '3px 3px 0 var(--ink)' : 'none',
                transition: 'transform 80ms ease',
              }}
                onMouseDown={e => e.currentTarget.style.transform = 'translate(1px,1px)'}
                onMouseUp={e => e.currentTarget.style.transform = ''}
                onMouseLeave={e => e.currentTarget.style.transform = ''}
              >
                <Icon name={rating >= n ? 'star' : 'star-o'} size={22} />
              </button>
            ))}
            <span className="label" style={{ marginLeft: 8, alignSelf: 'center', color: 'rgba(10,10,10,0.5)' }}>
              {rating ? `${rating}/5` : 'Tap to rate'}
            </span>
          </div>

          <div className="label mb-3">YOUR ONE-LINER <span style={{ color: 'rgba(10,10,10,0.4)' }}>· {text.length}/280</span></div>
          <textarea
            className="input"
            style={{ minHeight: 96, fontSize: 16, fontFamily: 'var(--f-serif-italic)', fontStyle: 'italic' }}
            placeholder='e.g. "Quiet sci-fi with feelings. I cried on page 240."'
            maxLength={280}
            value={text}
            onChange={e => setText(e.target.value)}
          />
        </div>
      </div>

      <div className="row gap-3 mt-6" style={{ justifyContent: 'space-between' }}>
        <Button variant="outline" onClick={onSkip}>Skip for now</Button>
        <Button variant="primary" icon="check" onClick={() => onSave({ rating, text: text.trim() })}>Save review</Button>
      </div>
    </Modal>
  );
}

function BookDetail({ book, ctx, onClose }) {
  const { savedIds, readIds, reading, reviews, toggleSave, toggleRead, openReview,
          startReading, updatePage, stopReading, finishReading, addToReadlist, readlists, updateBook } = ctx;

  const [localWhy, setLocalWhy] = React.useState(book.why || null);
  const [loadingWhy, setLoadingWhy] = React.useState(false);

  React.useEffect(() => {
    if (localWhy || !book.id) return;
    const API = window.README_API_BASE;
    if (!API) return;
    setLoadingWhy(true);
    fetch(`${API}/api/books/${book.id}/why`, { method: 'POST' })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.why) { setLocalWhy(data.why); updateBook(book.id, { why: data.why }); } })
      .finally(() => setLoadingWhy(false));
  }, [book.id]);
  const isSaved = savedIds.includes(book.id);
  const isRead = readIds.includes(book.id);
  const progress = reading[book.id];
  const isReading = !!progress;
  const review = reviews[book.id];
  const pct = isReading ? Math.round((progress.page / book.pages) * 100) : 0;

  return (
    <Modal onClose={onClose}>
      <div className="row gap-5" style={{ alignItems: 'flex-start' }}>
        <div style={{ width: 220, flexShrink: 0 }}>
          <BookCover book={book} size="lg" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="row gap-3 mb-3">
            {book.tags.map(t => <span key={t} className="chip">{t}</span>)}
          </div>
          <h2 className="h2" style={{ marginBottom: 6 }}>{book.title}</h2>
          <div className="label mb-4" style={{ fontSize: 13, color: 'rgba(10,10,10,0.65)' }}>
            {book.author} · {book.year} · {book.pages} pp
          </div>

          <div className="row gap-3 mb-4">
            <Stars value={book.rating} />
            <span className="mono" style={{ fontWeight: 700 }}>{book.rating}</span>
            <span style={{ opacity: 0.5 }}>·</span>
            <span className="label" style={{ color: 'rgba(10,10,10,0.6)' }}>{book.match}% MATCH</span>
          </div>

          {isReading && (
            <div className="card mb-4" style={{ background: 'var(--yellow)', padding: 16 }}>
              <div className="row gap-3 mb-3">
                <Badge color="ink" icon="book">CURRENTLY READING</Badge>
                <span className="label" style={{ color: 'rgba(10,10,10,0.6)' }}>STARTED {progress.started}</span>
              </div>
              <div className="row gap-3 mb-3" style={{ alignItems: 'baseline' }}>
                <span style={{ fontFamily: 'var(--f-display)', fontSize: 28, lineHeight: 1 }}>{progress.page}</span>
                <span className="label" style={{ color: 'rgba(10,10,10,0.6)' }}>OF {book.pages} · {pct}%</span>
              </div>
              <MatchMeter value={pct} color="var(--ink)" />
              <div className="row gap-2 mt-4" style={{ alignItems: 'center' }}>
                <div className="label" style={{ color: 'rgba(10,10,10,0.65)' }}>UPDATE PAGE</div>
                <button className="icon-btn" style={{ width: 32, height: 32, boxShadow: '2px 2px 0 var(--ink)' }}
                  onClick={() => updatePage(book.id, progress.page - 1)}>
                  <Icon name="arrow-left" size={14} stroke={3} />
                </button>
                <input type="number" value={progress.page} min={0} max={book.pages}
                  onChange={e => updatePage(book.id, +e.target.value)}
                  style={{ width: 84, padding: '6px 10px', border: '3px solid var(--ink)', background: 'var(--white)', fontFamily: 'var(--f-mono)', fontWeight: 700, fontSize: 16, textAlign: 'center', outline: 'none' }} />
                <button className="icon-btn" style={{ width: 32, height: 32, boxShadow: '2px 2px 0 var(--ink)' }}
                  onClick={() => updatePage(book.id, progress.page + 1)}>
                  <Icon name="arrow-right" size={14} stroke={3} />
                </button>
                <span className="label" style={{ color: 'rgba(10,10,10,0.4)' }}>/ {book.pages}</span>
                <span style={{ flex: 1 }} />
                <div className="row gap-2">
                  {[10, 25, 50].map(n => (
                    <button key={n} className="chip" style={{ padding: '4px 8px', fontSize: 10 }}
                      onClick={() => updatePage(book.id, progress.page + n)}>+{n}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {(localWhy || loadingWhy) && (
            <div className="card flat mb-4" style={{ borderStyle: 'dashed', borderWidth: 2, padding: 14, background: 'transparent' }}>
              <div className="label mb-3" style={{ color: 'rgba(10,10,10,0.6)' }}>WHY README RECOMMENDS THIS</div>
              {loadingWhy
                ? <div className="label" style={{ fontStyle: 'italic', opacity: 0.5 }}>Writing a reason just for you…</div>
                : <p style={{ margin: 0, fontFamily: 'var(--f-serif)', fontStyle: 'italic', fontSize: 19, lineHeight: 1.3 }}>"{localWhy}"</p>
              }
            </div>
          )}

          {isRead && review && (
            <div className="card mb-4" style={{ background: 'var(--lime)', padding: 16 }}>
              <div className="row gap-3 mb-3">
                <Badge color="ink" icon="check">YOUR REVIEW</Badge>
                <Stars value={review.rating} size={14} />
                <span className="mono" style={{ fontWeight: 700, fontSize: 13 }}>{review.rating}/5</span>
                <span style={{ flex: 1 }} />
                <button className="chip" onClick={() => openReview(book.id)}>
                  <Icon name="edit" size={11} stroke={2.8} /> Edit
                </button>
              </div>
              {review.text ? (
                <p style={{ margin: 0, fontFamily: 'var(--f-serif)', fontStyle: 'italic', fontSize: 17, lineHeight: 1.3 }}>"{review.text}"</p>
              ) : (
                <p style={{ margin: 0, opacity: 0.6, fontSize: 14 }}>No one-liner yet — tap edit to add one.</p>
              )}
            </div>
          )}

          <div className="row gap-3" style={{ flexWrap: 'wrap' }}>
            {!isRead && !isReading && (
              <Button variant="primary" size="lg" iconRight="arrow-right" onClick={() => startReading(book.id, 1)}>
                Start reading
              </Button>
            )}
            {isReading && (
              <React.Fragment>
                <Button variant="primary" size="lg" icon="check" onClick={() => finishReading(book.id)}>Mark finished</Button>
                <Button variant="outline" size="lg" onClick={() => stopReading(book.id)}>Stop reading</Button>
              </React.Fragment>
            )}
            {isRead && (
              <Button variant="lime" size="lg" icon="check" onClick={() => toggleRead(book.id)}>Read</Button>
            )}
            <Button variant="outline" size="lg" icon={isSaved ? 'heart-fill' : 'heart'} onClick={() => toggleSave(book.id)}>
              {isSaved ? 'Saved' : 'Save'}
            </Button>
            {!isRead && !isReading && (
              <Button variant="outline" size="lg" icon="plus" onClick={() => toggleRead(book.id)}>Already read</Button>
            )}
          </div>
        </div>
      </div>

      <hr className="divider" />

      <div className="label mb-3">ADD TO A READLIST</div>
      <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
        {readlists.map(r => (
          <button key={r.id} className="chip" onClick={() => addToReadlist(r.id, book.id)}>
            <span style={{ width: 10, height: 10, background: r.accent, border: '1px solid var(--ink)', display: 'inline-block', marginRight: 6 }} />
            {r.title}
          </button>
        ))}
      </div>
    </Modal>
  );
}

/* ──────────────────── PROFILE ──────────────────── */

const INTEREST_TAGS = [
  'Sci-Fi','Fantasy','Mystery','Thriller','Horror','Romance','Historical',
  'Literary','Coming-of-Age','Dystopia','Magical Realism','Nonfiction',
  'Biography','Memoir','Self-Help','Philosophy','Psychology','Humor','Poetry',
  'Short Stories','Nature','Travel','Feminist','LGBTQ+','YA',
];

function ProfileScreen({ ctx }) {
  const { books, readlists, readIds, reading, reviews, openBook, openReadlist, setRoute, profile, updateProfile, deleteReadlist } = ctx;
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState({ name: '', bio: '', tagInterests: [] });

  const startEdit = () => { setDraft({ name: profile.name, bio: profile.bio, tagInterests: profile.tagInterests || [] }); setEditing(true); };
  const saveEdit = () => { updateProfile(draft); setEditing(false); };

  const read = books.filter(b => readIds.includes(b.id));
  const reviewed = read.filter(b => reviews[b.id]);
  const favReadlists = readlists.slice(0, 4);
  const readingBooks = Object.keys(reading).map(id => books.find(b => b.id === id)).filter(Boolean);

  const tagFreq = {};
  read.forEach(b => (b.tags || []).forEach(t => { tagFreq[t] = (tagFreq[t] || 0) + 1; }));
  const topTags = Object.entries(tagFreq).sort((a, b) => b[1] - a[1]).slice(0, 6);

  const totalPages = read.reduce((s, b) => s + (b.pages || 0), 0);
  const avgRating = reviewed.length
    ? (reviewed.reduce((s, b) => s + (reviews[b.id].rating || 0), 0) / reviewed.length).toFixed(1)
    : '—';

  const displayName = profile.name || 'Reader';
  const initials = profile.name
    ? profile.name.trim().split(/\s+/).map(w => w[0].toUpperCase()).slice(0, 2).join('')
    : '?';

  return (
    <div data-screen-label="08 Profile">
      <div className="card mb-6" style={{ padding: 36, background: 'var(--white)' }}>
        {editing ? (
          <div>
            <div className="label mb-4">EDIT PROFILE</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 480 }}>
              <div>
                <div className="label mb-2">Name</div>
                <input
                  className="input"
                  value={draft.name}
                  onChange={e => setDraft(d => ({ ...d, name: e.target.value }))}
                  placeholder="Your name"
                  autoFocus
                />
              </div>
              <div>
                <div className="label mb-2">Bio</div>
                <textarea
                  className="input"
                  value={draft.bio}
                  onChange={e => setDraft(d => ({ ...d, bio: e.target.value }))}
                  placeholder="What kind of reader are you?"
                  rows={3}
                  style={{ resize: 'vertical', fontFamily: 'var(--f-serif)', fontStyle: 'italic' }}
                />
              </div>
              <div>
                <div className="label mb-2">Reading interests <span style={{ opacity: 0.5 }}>(optional)</span></div>
                <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                  {INTEREST_TAGS.map(tag => {
                    const sel = (draft.tagInterests || []).includes(tag);
                    return (
                      <button key={tag} className={`chip ${sel ? 'active' : ''}`}
                        onClick={() => setDraft(d => ({
                          ...d,
                          tagInterests: sel
                            ? d.tagInterests.filter(t => t !== tag)
                            : [...(d.tagInterests || []), tag],
                        }))}>
                        {tag}{sel && <span className="x"> ×</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="row gap-3">
                <button className="btn primary" onClick={saveEdit}>Save</button>
                <button className="btn outline" onClick={() => setEditing(false)}>Cancel</button>
              </div>
            </div>
          </div>
        ) : (
          <div className="row gap-5" style={{ alignItems: 'flex-start' }}>
            <div style={{ width: 96, height: 96, background: 'var(--royal)', color: 'var(--white)', border: '3px solid var(--ink)', boxShadow: '4px 4px 0 var(--ink)', display: 'grid', placeItems: 'center', fontFamily: 'var(--f-display)', fontSize: 38 }}>{initials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="label mb-3" style={{ color: 'rgba(26,26,26,0.55)' }}>READER · Since {new Date().getFullYear()}</div>
              <h1 className="h1" style={{ marginBottom: 6, fontSize: 'clamp(36px, 4vw, 56px)' }}>{displayName}</h1>
              {profile.bio ? (
                <p style={{ margin: 0, maxWidth: '52ch', fontFamily: 'var(--f-serif)', fontStyle: 'italic', fontSize: 19, color: 'rgba(26,26,26,0.78)' }}>
                  "{profile.bio}"
                </p>
              ) : (
                <p style={{ margin: 0, fontFamily: 'var(--f-serif)', fontStyle: 'italic', fontSize: 17, color: 'rgba(26,26,26,0.4)' }}>
                  Add a bio to tell others what kind of reader you are.
                </p>
              )}
              {profile.tagInterests?.length > 0 && (
                <div className="row gap-2 mt-4" style={{ flexWrap: 'wrap' }}>
                  {profile.tagInterests.map(t => (
                    <span key={t} className="chip">{t}</span>
                  ))}
                </div>
              )}
            </div>
            <Button variant="outline" size="md" icon="edit" onClick={startEdit}>Edit profile</Button>
          </div>
        )}

        <div className="row gap-7 mt-6" style={{ paddingTop: 24, borderTop: '2px solid var(--ink)', flexWrap: 'wrap' }}>
          <ProfStat label="Books read" value={read.length} />
          <ProfStat label="Pages turned" value={totalPages.toLocaleString()} />
          <ProfStat label="Reading now" value={readingBooks.length} />
          <ProfStat label="Reviews" value={reviewed.length} />
          <ProfStat label="Avg rating" value={avgRating} />
        </div>
      </div>

      {readingBooks.length > 0 && (
        <div className="mb-6">
          <div className="section-head">
            <h2 className="h3" style={{ fontFamily: 'var(--f-serif)', fontStyle: 'italic', fontWeight: 400 }}>
              On the <span style={{ fontFamily: 'var(--f-display)', fontStyle: 'normal' }}>nightstand</span>
            </h2>
            <span className="meta">{readingBooks.length} BOOK{readingBooks.length === 1 ? '' : 'S'}</span>
          </div>
          <div className="grid-3">
            {readingBooks.map(b => {
              const p = reading[b.id];
              const pct = Math.round((p.page / b.pages) * 100);
              return (
                <div key={b.id} className="card" onClick={() => openBook(b.id)} style={{ cursor: 'pointer' }}>
                  <div className="row gap-3 mb-3" style={{ alignItems: 'flex-start' }}>
                    <div style={{ width: 56, flexShrink: 0 }}><BookCover book={b} size="xs" /></div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'var(--f-display)', fontSize: 16, lineHeight: 1.1 }}>{b.title}</div>
                      <div className="label mt-3" style={{ color: 'rgba(26,26,26,0.6)' }}>{b.author}</div>
                    </div>
                  </div>
                  <div className="row gap-3" style={{ alignItems: 'baseline' }}>
                    <span style={{ fontFamily: 'var(--f-display)', fontSize: 22, lineHeight: 1, color: 'var(--royal)' }}>p. {p.page}</span>
                    <span className="label" style={{ color: 'rgba(26,26,26,0.55)' }}>/ {b.pages} · {pct}%</span>
                  </div>
                  <div className="mt-3"><MatchMeter value={pct} color="var(--royal)" /></div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 18 }} className="mb-6">
        <div className="card" style={{ background: 'var(--royal)', color: 'var(--white)', padding: 28 }}>
          <Badge color="white" icon="tag">TASTE SIGNATURE</Badge>
          <h2 className="h2 mt-4" style={{ color: 'var(--white)', marginBottom: 14 }}>
            <span style={{ fontFamily: 'var(--f-serif)', fontStyle: 'italic' }}>You read</span><br />
            <span style={{ fontFamily: 'var(--f-display)' }}>quiet, careful books.</span>
          </h2>
          <p style={{ margin: 0, opacity: 0.92, maxWidth: '48ch' }}>
            From {read.length} books, your three most-repeated patterns are <em>{topTags[0]?.[0] || '—'}</em>,{' '}
            <em>{topTags[1]?.[0] || '—'}</em>, and <em>{topTags[2]?.[0] || '—'}</em>.
          </p>
          <Button variant="outline" size="md" className="mt-5" icon="arrow-right" onClick={() => setRoute({ name: 'taste' })}
            style={{ background: 'transparent', color: 'var(--white)', borderColor: 'var(--white)' }}>
            Edit taste profile
          </Button>
        </div>
        <div className="card" style={{ padding: 24 }}>
          <div className="label mb-4">TOP TAGS</div>
          <div className="col gap-3">
            {topTags.map(([tag, n], i) => {
              const max = topTags[0][1];
              return (
                <div key={tag}>
                  <div className="row" style={{ justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontFamily: 'var(--f-display)', fontSize: 14 }}>{String(i+1).padStart(2,'0')} · {tag}</span>
                    <span className="label" style={{ color: 'rgba(26,26,26,0.6)' }}>×{n}</span>
                  </div>
                  <div style={{ height: 10, background: 'var(--paper-2)', border: '2px solid var(--ink)' }}>
                    <div style={{ width: `${(n / max) * 100}%`, height: '100%', background: 'var(--royal)' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="section-head">
        <h2 className="h3" style={{ fontFamily: 'var(--f-serif)', fontStyle: 'italic', fontWeight: 400 }}>
          Favorite <span style={{ fontFamily: 'var(--f-display)', fontStyle: 'normal' }}>readlists</span>
        </h2>
        <button className="btn sm outline" onClick={() => setRoute({ name: 'library' })}>See all</button>
      </div>
      <div className="grid-4 mb-7">
        {favReadlists.map(r => <ReadlistTile key={r.id} list={r} books={books} onOpen={() => openReadlist(r.id)} onDelete={deleteReadlist} />)}
      </div>

      <div className="section-head">
        <h2 className="h3" style={{ fontFamily: 'var(--f-serif)', fontStyle: 'italic', fontWeight: 400 }}>
          Everything <span style={{ fontFamily: 'var(--f-display)', fontStyle: 'normal' }}>I've read</span>
        </h2>
        <span className="meta">{read.length} BOOKS</span>
      </div>

      {read.length === 0 ? (
        <div className="empty">
          <div className="label mb-3">EMPTY SHELF</div>
          <div>Mark a book read to start the shelf. <a onClick={() => setRoute({ name: 'taste' })} style={{ cursor: 'pointer', textDecoration: 'underline' }}>Open the catalog →</a></div>
        </div>
      ) : (
        <div className="col gap-3 mb-7">
          {read.map((b, i) => {
            const rv = reviews[b.id];
            return (
              <div key={b.id} className="card" style={{ padding: 20, cursor: 'pointer' }} onClick={() => openBook(b.id)}>
                <div className="row gap-4" style={{ alignItems: 'flex-start' }}>
                  <span className="label" style={{ color: 'rgba(26,26,26,0.45)', minWidth: 32, marginTop: 4 }}>{String(i+1).padStart(2,'0')}</span>
                  <div style={{ width: 56, flexShrink: 0 }}><BookCover book={b} size="xs" /></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="row gap-3" style={{ alignItems: 'baseline', flexWrap: 'wrap' }}>
                      <div style={{ fontFamily: 'var(--f-display)', fontSize: 22, lineHeight: 1.05 }}>{b.title}</div>
                      <div className="label" style={{ color: 'rgba(26,26,26,0.55)' }}>{b.author} · {b.year}</div>
                    </div>
                    {rv ? (
                      <div className="row gap-3 mt-3" style={{ alignItems: 'center' }}>
                        <Stars value={rv.rating} size={13} />
                        <span className="mono" style={{ fontWeight: 700, fontSize: 12 }}>{rv.rating}/5</span>
                        {rv.text && <span style={{ fontFamily: 'var(--f-serif)', fontStyle: 'italic', fontSize: 15, lineHeight: 1.35, color: 'rgba(26,26,26,0.78)' }}>"{rv.text}"</span>}
                      </div>
                    ) : <div className="label mt-3" style={{ color: 'rgba(26,26,26,0.45)' }}>NO REVIEW YET</div>}
                  </div>
                  <div style={{ flexShrink: 0 }}><Badge color="white">READ</Badge></div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ProfStat({ label, value }) {
  return (
    <div>
      <div className="label" style={{ color: 'rgba(26,26,26,0.55)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: 'var(--f-display)', fontSize: 32, lineHeight: 1 }}>{value}</div>
    </div>
  );
}

Object.assign(window, { HomeScreen, ReadlistScreen, GeneratorScreen, TasteScreen, SearchScreen, LibraryScreen, BookDetail, ReviewModal, ProfileScreen });
