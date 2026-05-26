// MIDU — shared UI primitives, parameterized by theme
// All components receive `t` (theme) plus `m` (mobile boolean) when relevant.

// Eyebrow text — small caps line above titles
function Eyebrow({ t, children, style = {} }) {
  const e = t.eyebrow;
  return (
    <div style={{
      fontFamily: e.font === 'mono' ? t.fontMono : t.fontBody,
      fontSize: e.size,
      fontWeight: e.weight,
      letterSpacing: e.tracking + 'em',
      textTransform: e.upper ? 'uppercase' : 'none',
      color: t.textMuted,
      ...style,
    }}>{children}</div>
  );
}

// Button — primary / ghost / link
function Btn({ t, kind = 'primary', children, onClick, full, size = 'md', style = {} }) {
  const heights = { sm: 36, md: 48, lg: 56 };
  const padX = { sm: 18, md: 28, lg: 36 };
  const base = {
    fontFamily: t.fontBody,
    fontSize: size === 'lg' ? 14 : 13,
    fontWeight: 500,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    height: heights[size],
    padding: `0 ${padX[size]}px`,
    borderRadius: t.btnRadius,
    border: 'none',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: full ? '100%' : 'auto',
    transition: 'opacity .15s, background .15s',
    whiteSpace: 'nowrap',
  };
  const variants = {
    primary: { background: t.btnBg, color: t.btnText },
    ghost: { background: 'transparent', color: t.text, border: `1px solid ${t.lineStrong}` },
    link: { background: 'transparent', color: t.text, padding: 0, height: 'auto', textDecoration: 'underline', textUnderlineOffset: 4, letterSpacing: '0.04em', textTransform: 'none' },
  };
  return (
    <button onClick={onClick} style={{ ...base, ...variants[kind], ...style }}>
      {children}
    </button>
  );
}

// Star rating — filled count out of 5
function Stars({ t, value = 5, size = 12, color }) {
  const c = color || t.text;
  return (
    <div style={{ display: 'inline-flex', gap: 2, color: c, fontFamily: t.fontBody }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ fontSize: size, opacity: i <= Math.round(value) ? 1 : 0.22 }}>★</span>
      ))}
    </div>
  );
}

// Image placeholder — solid color block w/ optional subtle stripe + label
function GarmentBlock({ color, label, ratio = 1.25, t, style = {} }) {
  // Use the color directly; add a soft inner stripe so it doesn't feel flat
  return (
    <div style={{
      width: '100%',
      aspectRatio: '1 / ' + ratio,
      background: color,
      position: 'relative',
      overflow: 'hidden',
      borderRadius: t.cardRadius,
      ...style,
    }}>
      {/* soft fold/shadow */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(110deg, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.08) 100%)',
      }} />
      <div style={{
        position: 'absolute', left: 10, bottom: 8,
        fontFamily: t.fontMono, fontSize: 9, fontWeight: 500,
        color: 'rgba(255,255,255,0.55)', letterSpacing: '0.14em', textTransform: 'uppercase',
        mixBlendMode: 'difference',
      }}>{label}</div>
    </div>
  );
}

// Product card — used on home, listing, recommendations
function ProductCard({ t, p, onClick, m = false, showCat = true }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        cursor: 'pointer',
        padding: t.productPad,
        border: t.showRules ? `1px solid ${t.line}` : 'none',
        background: t.surface,
        position: 'relative',
      }}
    >
      <GarmentBlock t={t} color={p.swatch} label={p.cat} ratio={1.28} />
      {p.tag && (
        <div style={{
          position: 'absolute', top: t.productPad + 10, left: t.productPad + 10,
          background: t.surface, color: t.text,
          fontFamily: t.fontMono, fontSize: 9, fontWeight: 500,
          letterSpacing: '0.18em', textTransform: 'uppercase',
          padding: '5px 8px', border: `1px solid ${t.line}`,
        }}>{p.tag}</div>
      )}
      <div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          {showCat && <Eyebrow t={t} style={{ marginBottom: 4 }}>{p.cat}</Eyebrow>}
          <div style={{
            fontFamily: t.fontBody, fontSize: m ? 13 : 14, fontWeight: t.productNameWeight,
            color: t.text, letterSpacing: '-0.005em',
            textDecoration: hover ? 'underline' : 'none', textUnderlineOffset: 3,
          }}>{p.name}</div>
        </div>
        <div style={{ fontFamily: t.fontBody, fontSize: m ? 13 : 14, fontWeight: 500, color: t.text, whiteSpace: 'nowrap' }}>
          {fmt(p.price)}
        </div>
      </div>
      {/* color dots */}
      <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
        {p.colors.slice(0, 4).map((c, i) => (
          <span key={i} style={{
            width: 10, height: 10, borderRadius: '50%', background: c,
            border: c === '#ffffff' || c === '#f4f1ea' ? `1px solid ${t.line}` : 'none',
          }} />
        ))}
      </div>
    </div>
  );
}

// Rule line — visual divider used by Grid theme
function Rule({ t, vertical = false, style = {} }) {
  return (
    <div style={{
      background: t.line,
      [vertical ? 'width' : 'height']: 1,
      [vertical ? 'height' : 'width']: '100%',
      ...style,
    }} />
  );
}

// Header row used on desktop
function MIDUHeader({ t, page, setPage, cartCount, onLogin }) {
  const navItems = ['New In', 'Women', 'Men', 'Knitwear', 'Outerwear', 'Footwear', 'Journal'];
  return (
    <div style={{ borderBottom: `1px solid ${t.line}`, background: t.surface, position: 'sticky', top: 0, zIndex: 5 }}>
      {/* announcement bar */}
      <div style={{
        background: t.text, color: t.btnText,
        fontFamily: t.fontMono, fontSize: 10.5, fontWeight: 500,
        letterSpacing: '0.18em', textTransform: 'uppercase',
        textAlign: 'center', padding: '8px 0',
      }}>
        Complimentary shipping on orders over $250 — Returns within 30 days
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 56px', gap: 32,
      }}>
        <div style={{ flex: 1, display: 'flex', gap: 22, alignItems: 'center' }}>
          {navItems.slice(0, 4).map(n => (
            <a key={n} onClick={(e) => { e.preventDefault(); setPage('home'); }} style={{
              fontFamily: t.fontBody, fontSize: 12, fontWeight: 500,
              letterSpacing: '0.12em', textTransform: 'uppercase',
              color: t.text, cursor: 'pointer', textDecoration: 'none',
            }}>{n}</a>
          ))}
        </div>
        <a onClick={() => setPage('home')} style={{
          fontFamily: t.fontDisplay, fontSize: 32, fontWeight: 400,
          letterSpacing: '0.32em', color: t.text, cursor: 'pointer',
        }}>MIDU</a>
        <div style={{ flex: 1, display: 'flex', gap: 20, alignItems: 'center', justifyContent: 'flex-end' }}>
          {navItems.slice(4).map(n => (
            <a key={n} onClick={(e) => { e.preventDefault(); setPage('home'); }} style={{
              fontFamily: t.fontBody, fontSize: 12, fontWeight: 500,
              letterSpacing: '0.12em', textTransform: 'uppercase',
              color: t.text, cursor: 'pointer', textDecoration: 'none',
            }}>{n}</a>
          ))}
          <span style={{ width: 1, height: 14, background: t.line, marginInline: 4 }} />
          <Icon name="search" />
          <a onClick={onLogin} style={{ cursor: 'pointer' }}><Icon name="user" /></a>
          <a onClick={() => setPage('cart')} style={{ cursor: 'pointer', position: 'relative' }}>
            <Icon name="bag" />
            {cartCount > 0 && (
              <span style={{
                position: 'absolute', top: -4, right: -8,
                background: t.accent === t.text ? t.text : t.accent,
                color: t.btnText,
                fontFamily: t.fontMono, fontSize: 9, fontWeight: 600,
                minWidth: 16, height: 16, borderRadius: 999,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '0 4px',
              }}>{cartCount}</span>
            )}
          </a>
        </div>
      </div>
    </div>
  );
}

// Mobile header — bag + menu + logo + search
function MIDUHeaderMobile({ t, page, setPage, cartCount, onMenu }) {
  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 5, background: t.surface, borderBottom: `1px solid ${t.line}` }}>
      <div style={{
        background: t.text, color: t.btnText,
        fontFamily: t.fontMono, fontSize: 9, fontWeight: 500,
        letterSpacing: '0.18em', textTransform: 'uppercase',
        textAlign: 'center', padding: '7px 0',
      }}>
        Free shipping over $250
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px',
      }}>
        <a onClick={onMenu} style={{ cursor: 'pointer' }}><Icon name="menu" size={20} /></a>
        <a onClick={() => setPage('home')} style={{
          fontFamily: t.fontDisplay, fontSize: 22, fontWeight: 400,
          letterSpacing: '0.32em', color: t.text, cursor: 'pointer',
        }}>MIDU</a>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <Icon name="search" size={18} />
          <a onClick={() => setPage('cart')} style={{ cursor: 'pointer', position: 'relative' }}>
            <Icon name="bag" size={18} />
            {cartCount > 0 && (
              <span style={{
                position: 'absolute', top: -4, right: -6,
                background: t.text, color: t.btnText,
                fontFamily: t.fontMono, fontSize: 8, fontWeight: 600,
                minWidth: 14, height: 14, borderRadius: 999,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '0 3px',
              }}>{cartCount}</span>
            )}
          </a>
        </div>
      </div>
    </div>
  );
}

// Footer
function MIDUFooter({ t, m }) {
  return (
    <div style={{ borderTop: `1px solid ${t.line}`, padding: m ? '40px 20px 28px' : '64px 56px 32px', background: t.surfaceAlt, color: t.text }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: m ? '1fr 1fr' : '2fr 1fr 1fr 1fr 1fr',
        gap: m ? 32 : 56,
      }}>
        <div>
          <div style={{ fontFamily: t.fontDisplay, fontSize: m ? 32 : 44, letterSpacing: '0.28em', color: t.text }}>MIDU</div>
          <Eyebrow t={t} style={{ marginTop: 16 }}>Considered clothing, made to last</Eyebrow>
        </div>
        {[
          { h: 'Shop', items: ['New In', 'Women', 'Men', 'Sale'] },
          { h: 'Help', items: ['Shipping', 'Returns', 'Size Guide', 'Contact'] },
          { h: 'About', items: ['Our Story', 'Materials', 'Journal'] },
          { h: 'Newsletter', items: ['Join the list', 'Press', 'Careers'] },
        ].map(col => (
          <div key={col.h}>
            <Eyebrow t={t} style={{ marginBottom: 14 }}>{col.h}</Eyebrow>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {col.items.map(i => (
                <a key={i} style={{ fontFamily: t.fontBody, fontSize: 13, color: t.text, cursor: 'pointer' }}>{i}</a>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={{ height: 1, background: t.line, margin: '40px 0 18px' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: t.fontMono, fontSize: 10.5, color: t.textMuted, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
        <span>© 2026 MIDU</span>
        <span>Privacy · Terms · Imprint</span>
      </div>
    </div>
  );
}

// Iconography — thin-stroke SVG glyphs to match minimal aesthetic
function Icon({ name, size = 18, color = 'currentColor' }) {
  const sp = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'search': return <svg {...sp}><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>;
    case 'user': return <svg {...sp}><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></svg>;
    case 'bag': return <svg {...sp}><path d="M5 8h14l-1.5 12h-11z"/><path d="M9 8a3 3 0 1 1 6 0"/></svg>;
    case 'menu': return <svg {...sp}><path d="M3 7h18M3 12h18M3 17h18"/></svg>;
    case 'close': return <svg {...sp}><path d="M5 5l14 14M19 5L5 19"/></svg>;
    case 'plus': return <svg {...sp}><path d="M12 5v14M5 12h14"/></svg>;
    case 'minus': return <svg {...sp}><path d="M5 12h14"/></svg>;
    case 'arrow-right': return <svg {...sp}><path d="M5 12h14M13 5l7 7-7 7"/></svg>;
    case 'arrow-left': return <svg {...sp}><path d="M19 12H5M11 19l-7-7 7-7"/></svg>;
    case 'check': return <svg {...sp}><path d="M4 12l5 5L20 6"/></svg>;
    case 'heart': return <svg {...sp}><path d="M12 21s-7-4.5-9.5-9C1 9 2.5 5 6.5 5c2 0 3.5 1 5.5 3 2-2 3.5-3 5.5-3 4 0 5.5 4 4 7-2.5 4.5-9.5 9-9.5 9z"/></svg>;
    case 'star': return <svg {...sp} fill={color}><path d="M12 2l3 7 7 .5-5.5 4.5L18 21l-6-3.5L6 21l1.5-7L2 9.5 9 9z"/></svg>;
    case 'truck': return <svg {...sp}><path d="M3 7h11v8H3zM14 10h4l3 3v2h-7z"/><circle cx="7" cy="17" r="1.5"/><circle cx="17" cy="17" r="1.5"/></svg>;
    case 'return': return <svg {...sp}><path d="M3 9l4-4M3 9l4 4M3 9h11a6 6 0 0 1 0 12h-3"/></svg>;
    case 'leaf': return <svg {...sp}><path d="M5 19c0-8 6-14 14-14 0 8-6 14-14 14z"/><path d="M5 19c4-4 9-7 13-9"/></svg>;
    default: return null;
  }
}

Object.assign(window, { Eyebrow, Btn, Stars, GarmentBlock, ProductCard, Rule, MIDUHeader, MIDUHeaderMobile, MIDUFooter, Icon });
