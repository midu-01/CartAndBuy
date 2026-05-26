// MIDU — page components for Home & PDP (desktop + mobile in one component, switch via `m` prop)

// ─────────────────────────────────────────────────────────────
// HOME
// ─────────────────────────────────────────────────────────────
function HomePage({ t, m, setPage, openProduct, recentlyViewed }) {
  const hero = MIDU_PRODUCTS[0];
  const featured = MIDU_PRODUCTS.slice(1, 5);
  const grid = MIDU_PRODUCTS.slice(5, 17);
  return (
    <div>
      {/* HERO — split layout: image + editorial copy */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: m ? '1fr' : '1.05fr 1fr',
        minHeight: m ? 'auto' : 720,
        borderBottom: `1px solid ${t.line}`,
      }}>
        <div style={{ position: 'relative', background: t.surfaceAlt, aspectRatio: m ? '4 / 5' : 'auto', minHeight: m ? 'auto' : '100%' }}>
          <div style={{ position: 'absolute', inset: 0, background: hero.swatch }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(140deg, rgba(255,255,255,0.06), rgba(0,0,0,0.18))' }} />
            <div style={{
              position: 'absolute', bottom: m ? 16 : 28, left: m ? 16 : 28,
              fontFamily: t.fontMono, fontSize: 10, fontWeight: 500,
              color: 'rgba(255,255,255,0.7)', letterSpacing: '0.22em', textTransform: 'uppercase',
            }}>FW26 / LOOK 01 — STRATUS</div>
          </div>
        </div>
        <div style={{
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          padding: m ? '40px 24px 48px' : '80px 72px',
          background: t.surface,
        }}>
          <Eyebrow t={t} style={{ marginBottom: m ? 18 : 28 }}>The FW26 Collection</Eyebrow>
          <h1 style={{
            fontFamily: t.fontDisplay,
            fontSize: m ? Math.round(t.h1Size * 0.5) : t.h1Size,
            fontWeight: t.h1Weight,
            letterSpacing: t.h1Tracking + 'em',
            lineHeight: 0.98,
            margin: 0, color: t.text,
            textWrap: 'balance',
          }}>
            A quieter
            <br />
            wardrobe.
          </h1>
          <p style={{
            fontFamily: t.fontBody, fontSize: m ? 14 : 16, lineHeight: 1.55,
            color: t.textMuted, marginTop: m ? 18 : 28, maxWidth: 440,
          }}>
            Eighteen new pieces in deadstock wool, undyed cashmere and recycled silk.
            Cut in Porto, finished by hand.
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: m ? 24 : 36, flexWrap: 'wrap' }}>
            <Btn t={t} onClick={() => openProduct(hero.id)}>Shop The Collection</Btn>
            <Btn t={t} kind="ghost">The Journal</Btn>
          </div>
        </div>
      </div>

      {/* CATEGORY LEDGER — six tiles with section labels */}
      <div style={{ padding: m ? '40px 0 16px' : '88px 56px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: m ? '0 20px 24px' : '0 0 36px' }}>
          <div>
            <Eyebrow t={t} style={{ marginBottom: 8 }}>01 — Categories</Eyebrow>
            <h2 style={{ fontFamily: t.fontDisplay, fontSize: m ? 28 : t.h2Size, fontWeight: t.h2Weight, margin: 0, color: t.text, letterSpacing: '-0.01em' }}>
              Shop by edit
            </h2>
          </div>
          {!m && <a style={{ fontFamily: t.fontBody, fontSize: 13, color: t.text, textDecoration: 'underline', textUnderlineOffset: 4, cursor: 'pointer' }}>View all</a>}
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: m ? '1fr 1fr' : 'repeat(6, 1fr)',
          gap: t.showRules ? 0 : (m ? 12 : 24),
          padding: m ? '0 20px' : 0,
          borderTop: t.showRules ? `1px solid ${t.line}` : 'none',
        }}>
          {['Outerwear','Knitwear','Shirts','Trousers','Dresses','Footwear'].map((c, i) => (
            <div key={c} style={{
              borderRight: t.showRules && (m ? i % 2 === 0 : i < 5) ? `1px solid ${t.line}` : 'none',
              borderBottom: t.showRules ? `1px solid ${t.line}` : 'none',
              padding: t.showRules ? (m ? '16px 14px' : 24) : 0,
              cursor: 'pointer',
            }}>
              <GarmentBlock t={t} color={MIDU_PRODUCTS[i*3].swatch} label={c} ratio={1.15} />
              <div style={{ marginTop: 12, fontFamily: t.fontBody, fontSize: 14, fontWeight: 500, color: t.text, display: 'flex', justifyContent: 'space-between' }}>
                <span>{c}</span>
                <span style={{ color: t.textMuted, fontSize: 12 }}>{(i+2)*4} pieces</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* EDITORIAL BREAK — wide quote */}
      <div style={{
        padding: m ? '40px 24px' : '96px 56px',
        background: t.surfaceAlt,
        borderTop: `1px solid ${t.line}`,
        borderBottom: `1px solid ${t.line}`,
        margin: m ? '24px 0 0' : '64px 0 0',
      }}>
        <Eyebrow t={t} style={{ marginBottom: m ? 14 : 24 }}>02 — Our practice</Eyebrow>
        <div style={{
          fontFamily: t.fontDisplay,
          fontSize: m ? 30 : 56,
          fontWeight: t.h1Weight,
          lineHeight: 1.05,
          letterSpacing: '-0.015em',
          color: t.text,
          maxWidth: 1100,
          textWrap: 'balance',
        }}>
          "We design pieces we want to keep wearing.
          That principle decides everything else."
        </div>
        <div style={{ marginTop: m ? 16 : 28, fontFamily: t.fontBody, fontSize: 13, color: t.textMuted }}>
          — Inés Moreau, Creative Director
        </div>
      </div>

      {/* FEATURED — large product cards */}
      <div style={{ padding: m ? '40px 20px 8px' : '88px 56px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: m ? 20 : 36 }}>
          <div>
            <Eyebrow t={t} style={{ marginBottom: 8 }}>03 — New arrivals</Eyebrow>
            <h2 style={{ fontFamily: t.fontDisplay, fontSize: m ? 28 : t.h2Size, fontWeight: t.h2Weight, margin: 0, color: t.text, letterSpacing: '-0.01em' }}>
              Newly added
            </h2>
          </div>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: m ? '1fr 1fr' : 'repeat(4, 1fr)',
          gap: m ? 16 : 32,
        }}>
          {featured.map(p => <ProductCard key={p.id} t={t} p={p} m={m} onClick={() => openProduct(p.id)} />)}
        </div>
      </div>

      {/* CATALOG GRID — gives "full catalog feel" */}
      <div style={{ padding: m ? '40px 20px' : '64px 56px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: m ? 20 : 32 }}>
          <div>
            <Eyebrow t={t} style={{ marginBottom: 8 }}>04 — The full catalog</Eyebrow>
            <h2 style={{ fontFamily: t.fontDisplay, fontSize: m ? 28 : t.h2Size, fontWeight: t.h2Weight, margin: 0, color: t.text, letterSpacing: '-0.01em' }}>
              Everything in season
            </h2>
          </div>
          {!m && (
            <div style={{ display: 'flex', gap: 22, fontFamily: t.fontBody, fontSize: 12, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              {['All', 'Outerwear', 'Knitwear', 'Footwear'].map((f, i) => (
                <a key={f} style={{ color: i === 0 ? t.text : t.textMuted, cursor: 'pointer', borderBottom: i === 0 ? `1px solid ${t.text}` : 'none', paddingBottom: 2 }}>{f}</a>
              ))}
            </div>
          )}
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: m ? '1fr 1fr' : 'repeat(4, 1fr)',
          gap: m ? 16 : 28,
          rowGap: m ? 28 : 48,
        }}>
          {grid.map(p => <ProductCard key={p.id} t={t} p={p} m={m} onClick={() => openProduct(p.id)} />)}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: m ? 32 : 56 }}>
          <Btn t={t} kind="ghost">Load 30 more</Btn>
        </div>
      </div>

      {/* RECENTLY VIEWED */}
      {recentlyViewed.length > 0 && (
        <div style={{ padding: m ? '32px 20px' : '48px 56px 80px', borderTop: `1px solid ${t.line}` }}>
          <Eyebrow t={t} style={{ marginBottom: 18 }}>Recently viewed</Eyebrow>
          <div style={{
            display: 'grid',
            gridTemplateColumns: m ? '1fr 1fr' : 'repeat(6, 1fr)',
            gap: m ? 12 : 20,
          }}>
            {recentlyViewed.slice(0, m ? 4 : 6).map(id => {
              const p = MIDU_PRODUCTS.find(x => x.id === id);
              return p ? <ProductCard key={p.id} t={t} p={p} m={m} onClick={() => openProduct(p.id)} showCat={false} /> : null;
            })}
          </div>
        </div>
      )}

      {/* SERVICES strip */}
      <div style={{
        padding: m ? '24px 20px' : '40px 56px',
        borderTop: `1px solid ${t.line}`, borderBottom: `1px solid ${t.line}`,
        display: 'grid', gridTemplateColumns: m ? '1fr 1fr' : 'repeat(4, 1fr)', gap: m ? 16 : 32,
      }}>
        {[
          { i: 'truck', h: 'Free shipping', s: 'On orders over $250' },
          { i: 'return', h: '30-day returns', s: 'No questions, no fees' },
          { i: 'leaf', h: 'Responsible', s: 'Traceable materials' },
          { i: 'heart', h: 'Made to last', s: 'Cared-for in Porto' },
        ].map(s => (
          <div key={s.h} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Icon name={s.i} size={20} color={t.text} />
            <div>
              <div style={{ fontFamily: t.fontBody, fontSize: 13, fontWeight: 500, color: t.text }}>{s.h}</div>
              <div style={{ fontFamily: t.fontBody, fontSize: 11.5, color: t.textMuted, marginTop: 2 }}>{s.s}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PRODUCT DETAIL PAGE
// ─────────────────────────────────────────────────────────────
function PDPPage({ t, m, productId, addToCart, openProduct, setPage }) {
  const p = MIDU_PRODUCTS.find(x => x.id === productId) || MIDU_PRODUCTS[0];
  const [colorIdx, setColorIdx] = React.useState(0);
  const [size, setSize] = React.useState('M');
  const [tab, setTab] = React.useState('details');
  const sizes = ['XS', 'S', 'M', 'L', 'XL'];
  const recommendations = MIDU_PRODUCTS.filter(x => x.cat === p.cat && x.id !== p.id).slice(0, 4);

  const onAdd = () => {
    addToCart({ pid: p.id, size, color: colorIdx, qty: 1 });
    setPage('cart');
  };

  return (
    <div>
      {/* breadcrumb */}
      <div style={{ padding: m ? '14px 20px' : '18px 56px', borderBottom: `1px solid ${t.line}`, fontFamily: t.fontMono, fontSize: 10.5, color: t.textMuted, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
        Shop / {p.cat} / {p.name}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: m ? '1fr' : '1.2fr 1fr' }}>
        {/* IMAGES */}
        <div style={{ background: t.surfaceAlt, borderRight: m ? 'none' : `1px solid ${t.line}` }}>
          {m ? (
            <div style={{ position: 'relative' }}>
              <GarmentBlock t={t} color={p.colors[colorIdx]} label={p.cat} ratio={1.25} />
              <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
                {[0,1,2,3].map(i => (
                  <span key={i} style={{ width: 5, height: 5, borderRadius: 999, background: i === 0 ? t.text : 'rgba(0,0,0,0.25)' }} />
                ))}
              </div>
            </div>
          ) : (
            <div style={{ padding: 0 }}>
              <GarmentBlock t={t} color={p.colors[colorIdx]} label={p.cat + ' · 01'} ratio={1.25} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderTop: `1px solid ${t.line}` }}>
                <GarmentBlock t={t} color={p.colors[colorIdx]} label="DETAIL · 02" ratio={1} style={{ borderRight: `1px solid ${t.line}` }} />
                <GarmentBlock t={t} color={p.colors[(colorIdx + 1) % p.colors.length] || p.swatch} label="FABRIC · 03" ratio={1} />
              </div>
              <GarmentBlock t={t} color={p.colors[colorIdx]} label="LOOK · 04" ratio={1.4} />
            </div>
          )}
        </div>

        {/* INFO */}
        <div style={{ padding: m ? '24px 20px 32px' : '56px 56px', position: m ? 'static' : 'sticky', top: m ? 0 : 96, alignSelf: 'start' }}>
          <Eyebrow t={t} style={{ marginBottom: 8 }}>{p.cat} · {p.tag || 'Permanent collection'}</Eyebrow>
          <h1 style={{
            fontFamily: t.fontDisplay,
            fontSize: m ? 30 : 44,
            fontWeight: t.h1Weight,
            letterSpacing: '-0.01em',
            margin: 0, color: t.text, lineHeight: 1.05,
          }}>{p.name}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 12 }}>
            <Stars t={t} value={MIDU_RATING_BREAKDOWN.avg} size={13} />
            <span style={{ fontFamily: t.fontBody, fontSize: 12, color: t.textMuted }}>
              {MIDU_RATING_BREAKDOWN.avg} · {MIDU_RATING_BREAKDOWN.count} reviews
            </span>
          </div>
          <div style={{ marginTop: 24, fontFamily: t.fontBody, fontSize: 24, fontWeight: 500, color: t.text }}>
            {fmt(p.price)}
            <span style={{ fontSize: 12, fontWeight: 400, color: t.textMuted, marginLeft: 10 }}>or 4 × {fmt(Math.round(p.price/4))} interest-free</span>
          </div>

          {/* color */}
          <div style={{ marginTop: 28 }}>
            <Eyebrow t={t} style={{ marginBottom: 12 }}>Colour · {['Stone','Sand','Ink'][colorIdx] || 'Stone'}</Eyebrow>
            <div style={{ display: 'flex', gap: 10 }}>
              {p.colors.map((c, i) => (
                <button key={i} onClick={() => setColorIdx(i)} style={{
                  width: 32, height: 32, borderRadius: '50%', background: c,
                  border: i === colorIdx ? `1.5px solid ${t.text}` : `1px solid ${t.line}`,
                  outline: i === colorIdx ? `2px solid ${t.bg}` : 'none', outlineOffset: -4,
                  cursor: 'pointer', padding: 0,
                  boxShadow: i === colorIdx ? `inset 0 0 0 2px ${t.bg}` : 'none',
                }} />
              ))}
            </div>
          </div>

          {/* size */}
          <div style={{ marginTop: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <Eyebrow t={t}>Size · {size}</Eyebrow>
              <a style={{ fontFamily: t.fontBody, fontSize: 12, color: t.text, textDecoration: 'underline', textUnderlineOffset: 3, cursor: 'pointer' }}>Size guide</a>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
              {sizes.map(s => (
                <button key={s} onClick={() => setSize(s)} style={{
                  height: 46, border: `1px solid ${s === size ? t.text : t.line}`,
                  background: s === size ? t.text : 'transparent',
                  color: s === size ? t.btnText : t.text,
                  fontFamily: t.fontBody, fontSize: 13, fontWeight: 500, cursor: 'pointer',
                  borderRadius: t.btnRadius === 999 ? 8 : 0,
                }}>{s}</button>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 24, display: 'flex', gap: 10 }}>
            <Btn t={t} onClick={onAdd} size="lg" full>Add to bag · {fmt(p.price)}</Btn>
            <button style={{
              width: 56, height: 56, border: `1px solid ${t.line}`, background: 'transparent', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: t.btnRadius === 999 ? 999 : 0,
            }}>
              <Icon name="heart" size={18} color={t.text} />
            </button>
          </div>

          {/* shipping mini */}
          <div style={{ display: 'flex', gap: 18, marginTop: 24, padding: '16px 0', borderTop: `1px solid ${t.line}`, borderBottom: `1px solid ${t.line}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon name="truck" size={16} color={t.text} />
              <span style={{ fontFamily: t.fontBody, fontSize: 12, color: t.text }}>Free shipping</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon name="return" size={16} color={t.text} />
              <span style={{ fontFamily: t.fontBody, fontSize: 12, color: t.text }}>30-day returns</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon name="check" size={16} color={t.text} />
              <span style={{ fontFamily: t.fontBody, fontSize: 12, color: t.text }}>In stock</span>
            </div>
          </div>

          {/* tabs */}
          <div style={{ marginTop: 28 }}>
            <div style={{ display: 'flex', gap: 24, borderBottom: `1px solid ${t.line}` }}>
              {['details', 'fabric', 'care'].map(k => (
                <button key={k} onClick={() => setTab(k)} style={{
                  background: 'transparent', border: 'none', padding: '8px 0',
                  fontFamily: t.fontBody, fontSize: 12, fontWeight: 500,
                  letterSpacing: '0.12em', textTransform: 'uppercase',
                  color: tab === k ? t.text : t.textMuted,
                  borderBottom: tab === k ? `1.5px solid ${t.text}` : '1.5px solid transparent',
                  cursor: 'pointer',
                  marginBottom: -1,
                }}>{k}</button>
              ))}
            </div>
            <div style={{ padding: '18px 0', fontFamily: t.fontBody, fontSize: 13.5, lineHeight: 1.65, color: t.textMuted }}>
              {tab === 'details' && (
                <p style={{ margin: 0 }}>A double-faced wool coat with concealed placket, set-in sleeves and a single back vent. Cut on the long side for a quiet, considered line. Made in our family-run atelier in Porto from deadstock Italian wool.</p>
              )}
              {tab === 'fabric' && <p style={{ margin: 0 }}>100% virgin wool, sourced from Biella (Italy). Lined with 100% viscose. Sustainably-handled deadstock fabric.</p>}
              {tab === 'care' && <p style={{ margin: 0 }}>Dry clean only. Hang on a wooden hanger. Brush gently with a soft natural-fibre brush after wear. Steam to refresh.</p>}
            </div>
          </div>
        </div>
      </div>

      {/* REVIEWS */}
      <div style={{ padding: m ? '40px 20px' : '80px 56px', borderTop: `1px solid ${t.line}` }}>
        <div style={{ display: 'grid', gridTemplateColumns: m ? '1fr' : '1fr 2fr', gap: m ? 24 : 64 }}>
          <div>
            <Eyebrow t={t} style={{ marginBottom: 12 }}>Reviews</Eyebrow>
            <div style={{ fontFamily: t.fontDisplay, fontSize: 56, fontWeight: t.h1Weight, color: t.text, lineHeight: 1 }}>
              {MIDU_RATING_BREAKDOWN.avg}
            </div>
            <Stars t={t} value={MIDU_RATING_BREAKDOWN.avg} size={14} />
            <div style={{ fontFamily: t.fontBody, fontSize: 12, color: t.textMuted, marginTop: 8 }}>
              Based on {MIDU_RATING_BREAKDOWN.count} reviews
            </div>
            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[5,4,3,2,1].map((n, i) => (
                <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontFamily: t.fontMono, fontSize: 10, color: t.textMuted, width: 14 }}>{n}</span>
                  <div style={{ flex: 1, height: 4, background: t.line, position: 'relative' }}>
                    <div style={{ position: 'absolute', inset: 0, width: MIDU_RATING_BREAKDOWN.breakdown[i] + '%', background: t.text }} />
                  </div>
                  <span style={{ fontFamily: t.fontMono, fontSize: 10, color: t.textMuted, width: 28, textAlign: 'right' }}>{MIDU_RATING_BREAKDOWN.breakdown[i]}%</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 24 }}>
              <Btn t={t} kind="ghost" size="sm">Write a review</Btn>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            {MIDU_REVIEWS.map(r => (
              <div key={r.id} style={{ paddingBottom: 24, borderBottom: `1px solid ${t.line}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                  <Stars t={t} value={r.rating} size={12} />
                  <span style={{ fontFamily: t.fontMono, fontSize: 10, color: t.textMuted, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{r.date}</span>
                </div>
                <div style={{ fontFamily: t.fontDisplay, fontSize: m ? 20 : 24, fontWeight: t.h1Weight, color: t.text, letterSpacing: '-0.005em' }}>{r.title}</div>
                <p style={{ fontFamily: t.fontBody, fontSize: 13.5, lineHeight: 1.6, color: t.textMuted, margin: '10px 0 12px' }}>{r.body}</p>
                <div style={{ fontFamily: t.fontBody, fontSize: 12, color: t.textMuted }}>{r.author} · {r.loc} · Verified buyer</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RECOMMENDED */}
      <div style={{ padding: m ? '32px 20px 48px' : '64px 56px 96px', borderTop: `1px solid ${t.line}` }}>
        <Eyebrow t={t} style={{ marginBottom: 16 }}>You may also like</Eyebrow>
        <h2 style={{ fontFamily: t.fontDisplay, fontSize: m ? 24 : 36, fontWeight: t.h2Weight, margin: '0 0 28px', color: t.text, letterSpacing: '-0.01em' }}>
          More from {p.cat.toLowerCase()}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: m ? '1fr 1fr' : 'repeat(4, 1fr)', gap: m ? 14 : 28 }}>
          {recommendations.map(rp => <ProductCard key={rp.id} t={t} p={rp} m={m} onClick={() => openProduct(rp.id)} />)}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { HomePage, PDPPage });
