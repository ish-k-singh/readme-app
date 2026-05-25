// app.jsx — root, state, tweaks wiring

const { BOOKS, READLISTS, SEED_READ } = window.READ_DATA;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": ["#E8DDC4", "#F4ECD8", "#C75A3A", "#2849A3"],
  "displayFamily": "serif-mix",
  "density": "regular",
  "stroke": 3,
  "shadowOffset": 4
}/*EDITMODE-END*/;

const PALETTE_OPTIONS = [
  ['#E8DDC4', '#F4ECD8', '#C75A3A', '#2849A3'],
  ['#F4ECD8', '#E8DDC4', '#1A1A1A', '#2849A3'],
  ['#DCC9A4', '#F4ECD8', '#6B7C32', '#C75A3A'],
  ['#EDE5D2', '#F4ECD8', '#8B2635', '#2849A3'],
  ['#1A1A1A', '#3A3A3A', '#C75A3A', '#F4ECD8'],
];

const FONT_OPTIONS = [
  { id: 'serif-mix', label: 'Serif + Bold Sans', display: '"Archivo Black"', serif: '"DM Serif Display"' },
  { id: 'sans-all',  label: 'All Bold Sans',     display: '"Archivo Black"', serif: '"Archivo Black"' },
  { id: 'serif-all', label: 'All Editorial',     display: '"DM Serif Display"', serif: '"DM Serif Display"' },
];

// API base — switch to backend URL when wired up
const API = window.README_API_BASE || '';

function SignInScreen() {
  return (
    <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', background: 'var(--paper)' }}>
      <div style={{ textAlign: 'center', maxWidth: 440, padding: 40 }}>
        <div style={{ fontFamily: 'var(--f-display)', fontSize: 52, lineHeight: 1, marginBottom: 8 }}>ReadMe</div>
        <div style={{ fontFamily: 'var(--f-serif)', fontStyle: 'italic', fontSize: 20, marginBottom: 40, color: 'rgba(26,26,26,0.6)' }}>
          Your books. Your taste.
        </div>
        <button className="btn primary lg" style={{ width: '100%', justifyContent: 'center' }}
          onClick={() => window.__clerk?.openSignIn()}>
          Sign in with Google
        </button>
      </div>
    </div>
  );
}

async function getToken() {
  if (!window.__clerk?.session) return null;
  return window.__clerk.session.getToken();
}

function App() {
  const [authState, setAuthState] = React.useState('loading');
  const [clerkUser, setClerkUser] = React.useState(null);
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [route, setRoute] = React.useState({ name: 'home' });
  const [books, setBooks] = React.useState(BOOKS);
  const [readlists, setReadlists] = React.useState(READLISTS);
  const [savedIds, setSavedIds] = React.useState([]);
  const [readIds, setReadIds] = React.useState([]);
  const [reading, setReading] = React.useState({});
  const [reviews, setReviews] = React.useState({});
  const [profile, setProfile] = React.useState({ name: '', bio: '', tagInterests: [] });
  const [savedListIds, setSavedListIds] = React.useState([]);
  const [reviewingId, setReviewingId] = React.useState(null);
  const [query, setQuery] = React.useState('');
  const [detailId, setDetailId] = React.useState(null);

  // Init Clerk
  React.useEffect(() => {
    const clerk = new window.Clerk(window.CLERK_PUBLISHABLE_KEY);
    window.__clerk = clerk;
    clerk.load().then(() => {
      setClerkUser(clerk.user || null);
      setAuthState(clerk.user ? 'signed-in' : 'signed-out');
      clerk.addListener(({ user }) => {
        setClerkUser(user || null);
        setAuthState(user ? 'signed-in' : 'signed-out');
      });
    });
  }, []);

  // Sync Clerk user to backend + populate profile name
  React.useEffect(() => {
    if (!clerkUser || !API) return;
    const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || clerkUser.username || 'Reader';
    setProfile(p => ({ ...p, name }));
    getToken().then(token => {
      if (!token) return;
      // Upsert user in DB
      fetch(`${API}/api/users/me`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name, email: clerkUser.primaryEmailAddress?.emailAddress || '', avatar_url: clerkUser.imageUrl || '' }),
      });
      // Load saved profile (bio, tagInterests)
      fetch(`${API}/api/users/me`, { headers: { 'Authorization': `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : null)
        .then(u => { if (u) setProfile(p => ({ ...p, bio: u.bio || '', tagInterests: u.tag_interests || [] })); });
    });
  }, [clerkUser?.id]);

  // Load books and readlists from backend on mount
  React.useEffect(() => {
    if (!API) return;
    fetch(`${API}/api/books`)
      .then(r => r.ok ? r.json() : [])
      .then(rows => { if (rows.length) setBooks(rows); });
    fetch(`${API}/api/readlists`)
      .then(r => r.ok ? r.json() : [])
      .then(rows => {
        if (rows.length) {
          setReadlists(rows);
          setSavedListIds(rows.map(r => r.id));
        }
      });
  }, []);

  React.useEffect(() => {
    const root = document.documentElement;
    const [paper, accent, accent3, accent2] = t.palette;
    root.style.setProperty('--paper', paper);
    root.style.setProperty('--yellow', accent);
    root.style.setProperty('--magenta', accent3);
    root.style.setProperty('--teal', accent2);
    root.style.setProperty('--royal', accent2);
    root.style.setProperty('--terracotta', accent3);

    const isDark = paper === '#1A1A1A' || paper === '#0A0A0A';
    root.style.setProperty('--ink', isDark ? '#F4ECD8' : '#1A1A1A');
    root.style.setProperty('--white', isDark ? '#2a2a2a' : '#F4ECD8');
    root.style.setProperty('--paper-2', isDark ? '#2a2a2a' : '#DCC9A4');
  }, [t.palette]);

  React.useEffect(() => {
    const root = document.documentElement;
    const font = FONT_OPTIONS.find(f => f.id === t.displayFamily) || FONT_OPTIONS[0];
    root.style.setProperty('--f-display', `${font.display}, "Space Grotesk", system-ui, sans-serif`);
    root.style.setProperty('--f-serif', `${font.serif}, Georgia, serif`);
  }, [t.displayFamily]);

  React.useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--stroke', `${t.stroke}px`);
    root.style.setProperty('--stroke-thick', `${t.stroke + 1}px`);
    root.style.setProperty('--stroke-thin', `${Math.max(1, t.stroke - 1)}px`);

    const o = t.shadowOffset;
    root.style.setProperty('--sh-1', `${o}px ${o}px 0 var(--ink)`);
    root.style.setProperty('--sh-2', `${o + 2}px ${o + 2}px 0 var(--ink)`);
    root.style.setProperty('--sh-3', `${o + 4}px ${o + 4}px 0 var(--ink)`);
  }, [t.stroke, t.shadowOffset]);

  React.useEffect(() => {
    const root = document.documentElement;
    const fs = t.density === 'compact' ? 14 : t.density === 'comfy' ? 17 : 16;
    root.style.fontSize = `${fs}px`;
  }, [t.density]);

  const ctx = {
    books, readlists, savedIds, readIds, reviews, reading,
    openBook: (id) => setDetailId(id),
    openReadlist: (id) => setRoute({ name: 'readlist', id }),
    setRoute,
    toggleSave: (id) => setSavedIds(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]),
    toggleRead: (id) => {
      if (readIds.includes(id)) {
        setReadIds(s => s.filter(x => x !== id));
        setReviews(r => { const c = { ...r }; delete c[id]; return c; });
      } else {
        setReadIds(s => [...s, id]);
        setReading(r => { const c = { ...r }; delete c[id]; return c; });
        setReviewingId(id);
      }
    },
    startReading: (id, page = 0) => {
      setReading(r => ({ ...r, [id]: { page, started: new Date().toISOString().slice(0, 10) } }));
      setReadIds(s => s.filter(x => x !== id));
    },
    updatePage: (id, page) => {
      const book = books.find(b => b.id === id);
      const clamped = Math.max(0, Math.min(book.pages, Math.round(page)));
      setReading(r => r[id] ? ({ ...r, [id]: { ...r[id], page: clamped } }) : r);
    },
    stopReading: (id) => {
      setReading(r => { const c = { ...r }; delete c[id]; return c; });
    },
    finishReading: (id) => {
      setReading(r => { const c = { ...r }; delete c[id]; return c; });
      setReadIds(s => s.includes(id) ? s : [...s, id]);
      setReviewingId(id);
    },
    saveReview: (id, review) => setReviews(r => ({ ...r, [id]: review })),
    deleteReview: (id) => setReviews(r => { const c = { ...r }; delete c[id]; return c; }),
    openReview: (id) => setReviewingId(id),
    profile,
    updateProfile: async (updates) => {
      setProfile(p => ({ ...p, ...updates }));
      if (API) {
        const token = await getToken();
        if (token) fetch(`${API}/api/users/me`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ bio: updates.bio, tag_interests: updates.tagInterests }),
        }).catch(() => {});
      }
    },
    savedListIds,
    toggleSaveList: (id) => setSavedListIds(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]),
    deleteReadlist: (id) => setReadlists(r => r.filter(rl => rl.id !== id)),
    updateBook: (id, updates) => setBooks(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b)),
    importBook: async (olBook) => {
      if (!API) return null;
      const res = await fetch(`${API}/api/books/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(olBook),
      });
      if (!res.ok) return null;
      const book = await res.json();
      setBooks(prev => prev.find(b => b.id === book.id) ? prev : [...prev, book]);
      return book;
    },
    addReadlist: (list) => setReadlists(r => [list, ...r]),
    addToReadlist: (rid, bid) => setReadlists(r => r.map(rl => rl.id === rid && !rl.bookIds.includes(bid) ? { ...rl, bookIds: [...rl.bookIds, bid] } : rl)),
    generateFromTaste: () => {},
    // Called by GeneratorScreen to hit the real backend
    generateReadlist: async (params) => {
      if (!API) return null;
      const res = await fetch(`${API}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      return res.ok ? res.json() : null;
    },
  };

  const detailBook = detailId ? books.find(b => b.id === detailId) : null;
  const reviewingBook = reviewingId ? books.find(b => b.id === reviewingId) : null;

  if (authState === 'loading') return (
    <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', background: 'var(--paper)', fontFamily: 'var(--f-display)', fontSize: 32 }}>
      ReadMe
    </div>
  );

  if (authState === 'signed-out') return <SignInScreen />;

  return (
    <div className="app" data-screen-label="00 ReadMe App">
      <Sidebar route={route} setRoute={setRoute} readlists={readlists} readCount={readIds.length} profile={profile} />
      <main className="main">
        <TopBar query={query} setQuery={setQuery} setRoute={setRoute} />

        {route.name === 'home' && <HomeScreen ctx={ctx} />}
        {route.name === 'search' && <SearchScreen ctx={ctx} query={query} setQuery={setQuery} />}
        {route.name === 'library' && <LibraryScreen ctx={ctx} />}
        {route.name === 'generator' && <GeneratorScreen ctx={ctx} />}
        {route.name === 'taste' && <TasteScreen ctx={ctx} />}
        {route.name === 'readlist' && <ReadlistScreen ctx={ctx} id={route.id} />}
        {route.name === 'profile' && <ProfileScreen ctx={ctx} />}
      </main>

      {detailBook && <BookDetail book={detailBook} ctx={ctx} onClose={() => setDetailId(null)} />}
      {reviewingBook && (
        <ReviewModal
          book={reviewingBook}
          existing={reviews[reviewingBook.id]}
          onSave={(rev) => { ctx.saveReview(reviewingBook.id, rev); setReviewingId(null); }}
          onSkip={() => setReviewingId(null)}
        />
      )}

      <TweaksPanel>
        <TweakSection label="Palette" />
        <TweakColor label="Theme" value={t.palette}
          options={PALETTE_OPTIONS}
          onChange={(v) => setTweak('palette', v)} />

        <TweakSection label="Typography" />
        <TweakSelect label="Display family" value={t.displayFamily}
          options={FONT_OPTIONS.map(f => ({ value: f.id, label: f.label }))}
          onChange={(v) => setTweak('displayFamily', v)} />

        <TweakSection label="Brutalism" />
        <TweakSlider label="Stroke" value={t.stroke} min={2} max={6} step={1} unit="px"
          onChange={(v) => setTweak('stroke', v)} />
        <TweakSlider label="Shadow" value={t.shadowOffset} min={0} max={10} step={1} unit="px"
          onChange={(v) => setTweak('shadowOffset', v)} />

        <TweakSection label="Layout" />
        <TweakRadio label="Density" value={t.density}
          options={['compact', 'regular', 'comfy']}
          onChange={(v) => setTweak('density', v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
