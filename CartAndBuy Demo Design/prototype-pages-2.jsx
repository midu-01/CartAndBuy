// MIDU — Cart, Checkout, Login pages

// ─────────────────────────────────────────────────────────────
// CART
// ─────────────────────────────────────────────────────────────
function CartPage({ t, m, cart, updateCart, removeCart, setPage, openProduct }) {
  const items = cart.map(c => ({ ...c, p: MIDU_PRODUCTS.find(x => x.id === c.pid) })).filter(x => x.p);
  const subtotal = items.reduce((a, x) => a + x.p.price * x.qty, 0);
  const shipping = subtotal > 250 ? 0 : 25;
  const total = subtotal + shipping;
  const recommendations = MIDU_PRODUCTS.slice(20, 24);

  return (
    <div>
      <div style={{ padding: m ? '24px 20px 8px' : '48px 56px 16px', borderBottom: `1px solid ${t.line}` }}>
        <Eyebrow t={t} style={{ marginBottom: 12 }}>Shopping bag</Eyebrow>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <h1 style={{
            fontFamily: t.fontDisplay,
            fontSize: m ? 36 : 56,
            fontWeight: t.h1Weight,
            letterSpacing: t.h1Tracking + 'em',
            margin: 0, color: t.text, lineHeight: 1,
          }}>Your bag</h1>
          <span style={{ fontFamily: t.fontBody, fontSize: 13, color: t.textMuted }}>{items.length} item{items.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {items.length === 0 ? (
        <div style={{ padding: m ? '64px 20px' : '120px 56px', textAlign: 'center' }}>
          <Eyebrow t={t} style={{ marginBottom: 16 }}>Empty</Eyebrow>
          <div style={{ fontFamily: t.fontDisplay, fontSize: m ? 28 : 44, fontWeight: t.h1Weight, color: t.text, letterSpacing: '-0.01em', marginBottom: 24 }}>
            Your bag is quiet.
          </div>
          <Btn t={t} onClick={() => setPage('home')}>Discover the collection</Btn>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: m ? '1fr' : '1.6fr 1fr', gap: 0 }}>
          {/* ITEMS */}
          <div style={{ borderRight: m ? 'none' : `1px solid ${t.line}` }}>
            {items.map((it, idx) => (
              <div key={idx} style={{
                display: 'grid',
                gridTemplateColumns: m ? '100px 1fr' : '140px 1fr',
                gap: m ? 16 : 28,
                padding: m ? '20px' : '32px 56px',
                borderBottom: `1px solid ${t.line}`,
              }}>
                <div onClick={() => openProduct(it.p.id)} style={{ cursor: 'pointer' }}>
                  <GarmentBlock t={t} color={it.p.colors[it.color] || it.p.swatch} label={it.p.cat} ratio={1.25} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <Eyebrow t={t} style={{ marginBottom: 6 }}>{it.p.cat}</Eyebrow>
                    <div style={{ fontFamily: t.fontDisplay, fontSize: m ? 18 : 22, fontWeight: t.h2Weight, color: t.text, letterSpacing: '-0.005em', lineHeight: 1.15 }}>
                      {it.p.name}
                    </div>
                    <div style={{ marginTop: 8, fontFamily: t.fontBody, fontSize: 12, color: t.textMuted, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                      <span>Size · {it.size}</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        Colour · <span style={{ width: 10, height: 10, borderRadius: '50%', background: it.p.colors[it.color], display: 'inline-block', border: `1px solid ${t.line}` }} />
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', border: `1px solid ${t.line}` }}>
                      <button onClick={() => updateCart(idx, Math.max(1, it.qty - 1))} style={{ width: 34, height: 34, background: 'transparent', border: 'none', cursor: 'pointer', color: t.text }}>
                        <Icon name="minus" size={14} />
                      </button>
                      <span style={{ width: 30, textAlign: 'center', fontFamily: t.fontBody, fontSize: 13, color: t.text }}>{it.qty}</span>
                      <button onClick={() => updateCart(idx, it.qty + 1)} style={{ width: 34, height: 34, background: 'transparent', border: 'none', cursor: 'pointer', color: t.text }}>
                        <Icon name="plus" size={14} />
                      </button>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: t.fontBody, fontSize: 15, fontWeight: 500, color: t.text }}>{fmt(it.p.price * it.qty)}</div>
                      <a onClick={() => removeCart(idx)} style={{ fontFamily: t.fontBody, fontSize: 11, color: t.textMuted, textDecoration: 'underline', textUnderlineOffset: 3, cursor: 'pointer', marginTop: 6, display: 'inline-block' }}>Remove</a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {/* gift note */}
            <div style={{ padding: m ? 20 : '32px 56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
              <div>
                <Eyebrow t={t} style={{ marginBottom: 6 }}>Complimentary</Eyebrow>
                <div style={{ fontFamily: t.fontBody, fontSize: 13, color: t.text }}>Add a hand-written gift note at checkout</div>
              </div>
              <Btn t={t} kind="ghost" size="sm">Add note</Btn>
            </div>
          </div>

          {/* SUMMARY */}
          <div style={{ padding: m ? 20 : 40, background: t.surfaceAlt, alignSelf: 'start', position: m ? 'static' : 'sticky', top: m ? 0 : 96 }}>
            <Eyebrow t={t} style={{ marginBottom: 18 }}>Order summary</Eyebrow>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Row t={t} label="Subtotal" value={fmt(subtotal)} />
              <Row t={t} label={"Shipping" + (shipping === 0 ? ' · Free' : '')} value={shipping === 0 ? '—' : fmt(shipping)} />
              <Row t={t} label="Estimated tax" value="Calc. at checkout" muted />
              <div style={{ height: 1, background: t.line, margin: '8px 0' }} />
              <Row t={t} label="Total" value={fmt(total)} big />
            </div>
            <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Btn t={t} onClick={() => setPage('checkout')} size="lg" full>Checkout securely</Btn>
              <Btn t={t} kind="link" onClick={() => setPage('home')}>← Continue shopping</Btn>
            </div>
            <div style={{ marginTop: 24, padding: 16, border: `1px solid ${t.line}`, fontFamily: t.fontMono, fontSize: 10.5, color: t.textMuted, letterSpacing: '0.1em', textTransform: 'uppercase', textAlign: 'center' }}>
              Free shipping unlocked
            </div>
          </div>
        </div>
      )}

      {/* RECOMMENDED */}
      <div style={{ padding: m ? '40px 20px 64px' : '64px 56px 96px', borderTop: `1px solid ${t.line}` }}>
        <Eyebrow t={t} style={{ marginBottom: 16 }}>You may also like</Eyebrow>
        <h2 style={{ fontFamily: t.fontDisplay, fontSize: m ? 24 : 36, fontWeight: t.h2Weight, margin: '0 0 28px', color: t.text, letterSpacing: '-0.01em' }}>
          Complete the look
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: m ? '1fr 1fr' : 'repeat(4, 1fr)', gap: m ? 14 : 28 }}>
          {recommendations.map(p => <ProductCard key={p.id} t={t} p={p} m={m} onClick={() => openProduct(p.id)} />)}
        </div>
      </div>
    </div>
  );
}

function Row({ t, label, value, big, muted }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <span style={{ fontFamily: t.fontBody, fontSize: big ? 14 : 13, color: muted ? t.textMuted : t.text }}>{label}</span>
      <span style={{ fontFamily: big ? t.fontDisplay : t.fontBody, fontSize: big ? 24 : 13, fontWeight: big ? 500 : 500, color: muted ? t.textMuted : t.text }}>{value}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CHECKOUT
// ─────────────────────────────────────────────────────────────
function CheckoutPage({ t, m, cart, setPage }) {
  const [step, setStep] = React.useState(1); // 1: contact+ship  2: shipping method 3: payment 4: confirm
  const [pay, setPay] = React.useState('card');
  const items = cart.map(c => ({ ...c, p: MIDU_PRODUCTS.find(x => x.id === c.pid) })).filter(x => x.p);
  const subtotal = items.reduce((a, x) => a + x.p.price * x.qty, 0);
  const shipping = step >= 2 ? (subtotal > 250 ? 0 : 25) : 0;
  const total = subtotal + shipping;

  if (step === 4) return <ConfirmationPage t={t} m={m} setPage={setPage} total={total} items={items} />;

  return (
    <div>
      {/* slim header — checkout has reduced chrome */}
      <div style={{ padding: m ? '18px 20px' : '20px 56px', borderBottom: `1px solid ${t.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <a onClick={() => setPage('home')} style={{
          fontFamily: t.fontDisplay, fontSize: m ? 20 : 24, fontWeight: 400,
          letterSpacing: '0.32em', color: t.text, cursor: 'pointer',
        }}>MIDU</a>
        <a onClick={() => setPage('cart')} style={{
          fontFamily: t.fontBody, fontSize: 12, fontWeight: 500,
          letterSpacing: '0.1em', textTransform: 'uppercase',
          color: t.text, cursor: 'pointer',
        }}>← Back to bag</a>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: m ? '1fr' : '1.5fr 1fr' }}>
        <div style={{ padding: m ? '24px 20px 32px' : '48px 56px', borderRight: m ? 'none' : `1px solid ${t.line}` }}>
          {/* steps */}
          <div style={{ display: 'flex', gap: m ? 12 : 24, marginBottom: 36, alignItems: 'center' }}>
            {[{n: 1, l: 'Contact & shipping'}, {n: 2, l: 'Delivery'}, {n: 3, l: 'Payment'}].map((s, i) => (
              <React.Fragment key={s.n}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    width: 22, height: 22, borderRadius: '50%',
                    border: `1px solid ${step >= s.n ? t.text : t.line}`,
                    background: step >= s.n ? t.text : 'transparent',
                    color: step >= s.n ? t.btnText : t.textMuted,
                    fontFamily: t.fontMono, fontSize: 10, fontWeight: 600,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  }}>{step > s.n ? '✓' : s.n}</span>
                  <span style={{
                    fontFamily: t.fontBody, fontSize: 11.5, fontWeight: 500,
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    color: step >= s.n ? t.text : t.textMuted,
                    display: m && i !== step - 1 ? 'none' : 'inline',
                  }}>{s.l}</span>
                </div>
                {i < 2 && <span style={{ flex: m ? 0 : 1, height: 1, background: t.line, display: m ? 'none' : 'block' }} />}
              </React.Fragment>
            ))}
          </div>

          {step === 1 && (
            <div>
              <Eyebrow t={t} style={{ marginBottom: 16 }}>Contact</Eyebrow>
              <Field t={t} label="Email" defaultValue="ines.moreau@gmail.com" />
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, fontFamily: t.fontBody, fontSize: 12, color: t.textMuted }}>
                <input type="checkbox" defaultChecked style={{ accentColor: t.text }} /> Email me with news and offers
              </label>

              <Eyebrow t={t} style={{ marginTop: 36, marginBottom: 16 }}>Shipping address</Eyebrow>
              <div style={{ display: 'grid', gridTemplateColumns: m ? '1fr' : '1fr 1fr', gap: 14 }}>
                <Field t={t} label="First name" defaultValue="Inés" />
                <Field t={t} label="Last name" defaultValue="Moreau" />
              </div>
              <div style={{ marginTop: 14 }}>
                <Field t={t} label="Address" defaultValue="14 Rue de Sévigné" />
              </div>
              <div style={{ marginTop: 14 }}>
                <Field t={t} label="Apartment, suite (optional)" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: m ? '1fr' : '1fr 1fr 1fr', gap: 14, marginTop: 14 }}>
                <Field t={t} label="City" defaultValue="Paris" />
                <Field t={t} label="Postal code" defaultValue="75004" />
                <Field t={t} label="Country" defaultValue="France" />
              </div>
              <div style={{ marginTop: 14 }}>
                <Field t={t} label="Phone" defaultValue="+33 6 12 34 56 78" />
              </div>
              <div style={{ marginTop: 28 }}>
                <Btn t={t} onClick={() => setStep(2)} size="lg" full>Continue to delivery →</Btn>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <Eyebrow t={t} style={{ marginBottom: 16 }}>Delivery method</Eyebrow>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { id: 'std', name: 'Standard delivery', sub: '3-5 business days · DHL Express', price: 'Free' },
                  { id: 'exp', name: 'Express delivery', sub: '1-2 business days · DHL Priority', price: '$24' },
                  { id: 'pick', name: 'Atelier pickup', sub: 'Pick up at MIDU Paris, Rue de Turenne', price: 'Free' },
                ].map((m_, i) => (
                  <label key={m_.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: 18, border: `1px solid ${i === 0 ? t.text : t.line}`,
                    cursor: 'pointer', gap: 16,
                  }}>
                    <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                      <span style={{
                        width: 16, height: 16, borderRadius: '50%', border: `1.5px solid ${t.text}`,
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {i === 0 && <span style={{ width: 8, height: 8, borderRadius: '50%', background: t.text }} />}
                      </span>
                      <div>
                        <div style={{ fontFamily: t.fontBody, fontSize: 14, fontWeight: 500, color: t.text }}>{m_.name}</div>
                        <div style={{ fontFamily: t.fontBody, fontSize: 12, color: t.textMuted, marginTop: 3 }}>{m_.sub}</div>
                      </div>
                    </div>
                    <div style={{ fontFamily: t.fontBody, fontSize: 13, fontWeight: 500, color: t.text }}>{m_.price}</div>
                  </label>
                ))}
              </div>
              <div style={{ marginTop: 28, display: 'flex', gap: 12 }}>
                <Btn t={t} kind="ghost" onClick={() => setStep(1)}>← Back</Btn>
                <Btn t={t} onClick={() => setStep(3)} size="md" full>Continue to payment →</Btn>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <Eyebrow t={t} style={{ marginBottom: 16 }}>Payment</Eyebrow>
              <div style={{ display: 'grid', gridTemplateColumns: m ? '1fr 1fr' : 'repeat(4, 1fr)', gap: 8, marginBottom: 20 }}>
                {[
                  { id: 'card', l: 'Card' },
                  { id: 'paypal', l: 'PayPal' },
                  { id: 'apple', l: 'Apple Pay' },
                  { id: 'klarna', l: 'Klarna · 4×' },
                ].map(o => (
                  <button key={o.id} onClick={() => setPay(o.id)} style={{
                    padding: '14px 8px', border: `1px solid ${pay === o.id ? t.text : t.line}`,
                    background: pay === o.id ? t.text : 'transparent',
                    color: pay === o.id ? t.btnText : t.text,
                    fontFamily: t.fontBody, fontSize: 12, fontWeight: 500,
                    letterSpacing: '0.08em', textTransform: 'uppercase',
                    cursor: 'pointer', borderRadius: t.btnRadius === 999 ? 8 : 0,
                  }}>{o.l}</button>
                ))}
              </div>
              {pay === 'card' && (
                <div>
                  <Field t={t} label="Card number" placeholder="•••• •••• •••• ••••" />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 14 }}>
                    <Field t={t} label="Expiry" placeholder="MM / YY" />
                    <Field t={t} label="CVC" placeholder="•••" />
                  </div>
                  <div style={{ marginTop: 14 }}>
                    <Field t={t} label="Name on card" defaultValue="Inés Moreau" />
                  </div>
                </div>
              )}
              {pay !== 'card' && (
                <div style={{ padding: 24, border: `1px solid ${t.line}`, fontFamily: t.fontBody, fontSize: 13, color: t.textMuted, textAlign: 'center' }}>
                  You will be redirected to complete your payment with {pay}.
                </div>
              )}

              <Eyebrow t={t} style={{ marginTop: 32, marginBottom: 14 }}>Billing</Eyebrow>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: t.fontBody, fontSize: 13, color: t.text }}>
                <input type="checkbox" defaultChecked style={{ accentColor: t.text }} /> Same as shipping address
              </label>

              <div style={{ marginTop: 32, display: 'flex', gap: 12 }}>
                <Btn t={t} kind="ghost" onClick={() => setStep(2)}>← Back</Btn>
                <Btn t={t} onClick={() => setStep(4)} size="md" full>Place order · {fmt(total)}</Btn>
              </div>

              <div style={{ marginTop: 18, fontFamily: t.fontMono, fontSize: 10, color: t.textMuted, textAlign: 'center', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Secured by Stripe · 256-bit SSL
              </div>
            </div>
          )}
        </div>

        {/* SUMMARY */}
        <div style={{ padding: m ? 20 : 40, background: t.surfaceAlt }}>
          <Eyebrow t={t} style={{ marginBottom: 18 }}>In your bag</Eyebrow>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {items.map((it, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '60px 1fr auto', gap: 14, alignItems: 'center' }}>
                <div style={{ position: 'relative' }}>
                  <GarmentBlock t={t} color={it.p.colors[it.color] || it.p.swatch} label="" ratio={1.2} />
                  <span style={{
                    position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: '50%',
                    background: t.text, color: t.btnText, fontFamily: t.fontMono, fontSize: 10, fontWeight: 600,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  }}>{it.qty}</span>
                </div>
                <div>
                  <div style={{ fontFamily: t.fontBody, fontSize: 13, fontWeight: 500, color: t.text, lineHeight: 1.25 }}>{it.p.name}</div>
                  <div style={{ fontFamily: t.fontBody, fontSize: 11, color: t.textMuted, marginTop: 3 }}>Size {it.size}</div>
                </div>
                <div style={{ fontFamily: t.fontBody, fontSize: 13, fontWeight: 500, color: t.text }}>{fmt(it.p.price * it.qty)}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 22, padding: '14px 0', borderTop: `1px solid ${t.line}`, display: 'flex', gap: 8 }}>
            <input placeholder="Promo code" style={{
              flex: 1, padding: '10px 12px', border: `1px solid ${t.line}`,
              fontFamily: t.fontBody, fontSize: 12, color: t.text, background: 'transparent',
              outline: 'none', borderRadius: 0,
            }} />
            <Btn t={t} kind="ghost" size="sm">Apply</Btn>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 16, borderTop: `1px solid ${t.line}` }}>
            <Row t={t} label="Subtotal" value={fmt(subtotal)} />
            <Row t={t} label={shipping === 0 ? 'Shipping · Free' : 'Shipping'} value={shipping === 0 ? '—' : fmt(shipping)} />
            <Row t={t} label="Tax (est.)" value={fmt(Math.round(subtotal * 0.2))} muted />
            <div style={{ height: 1, background: t.line, margin: '6px 0' }} />
            <Row t={t} label="Total · EUR" value={fmt(total)} big />
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ t, label, defaultValue, placeholder }) {
  const [val, setVal] = React.useState(defaultValue || '');
  const [focus, setFocus] = React.useState(false);
  const filled = val.length > 0 || focus;
  return (
    <div style={{ position: 'relative' }}>
      <label style={{
        position: 'absolute', left: 14, top: filled ? 6 : 16,
        fontFamily: t.fontBody, fontSize: filled ? 10 : 13,
        color: filled ? t.textMuted : t.textMuted,
        letterSpacing: filled ? '0.1em' : 'normal',
        textTransform: filled ? 'uppercase' : 'none',
        transition: 'all .15s', pointerEvents: 'none',
      }}>{label}</label>
      <input
        value={val}
        placeholder={focus ? placeholder : ''}
        onChange={(e) => setVal(e.target.value)}
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        style={{
          width: '100%', boxSizing: 'border-box',
          padding: '22px 14px 8px',
          border: `1px solid ${focus ? t.text : t.line}`,
          background: 'transparent',
          fontFamily: t.fontBody, fontSize: 14, color: t.text,
          outline: 'none', borderRadius: 0,
        }}
      />
    </div>
  );
}

function ConfirmationPage({ t, m, setPage, total, items }) {
  return (
    <div style={{ padding: m ? '60px 20px 80px' : '120px 56px', textAlign: 'center', maxWidth: 720, margin: '0 auto' }}>
      <div style={{
        width: 64, height: 64, borderRadius: '50%', background: t.text,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px',
      }}>
        <Icon name="check" size={28} color={t.btnText} />
      </div>
      <Eyebrow t={t} style={{ marginBottom: 16 }}>Order #MD-2026-04812</Eyebrow>
      <h1 style={{ fontFamily: t.fontDisplay, fontSize: m ? 40 : 64, fontWeight: t.h1Weight, letterSpacing: t.h1Tracking + 'em', color: t.text, lineHeight: 1.05, margin: 0 }}>
        Thank you,<br />Inés.
      </h1>
      <p style={{ fontFamily: t.fontBody, fontSize: m ? 14 : 16, color: t.textMuted, lineHeight: 1.55, marginTop: 24, maxWidth: 480, marginLeft: 'auto', marginRight: 'auto' }}>
        Your order is being prepared at our atelier in Porto. You'll receive a confirmation by email shortly, and a tracking number within 24 hours.
      </p>
      <div style={{ marginTop: 40, padding: 24, border: `1px solid ${t.line}`, textAlign: 'left' }}>
        {items.map((it, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < items.length-1 ? `1px solid ${t.line}` : 'none' }}>
            <span style={{ fontFamily: t.fontBody, fontSize: 13, color: t.text }}>{it.p.name} · Size {it.size}</span>
            <span style={{ fontFamily: t.fontBody, fontSize: 13, fontWeight: 500, color: t.text }}>{fmt(it.p.price * it.qty)}</span>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 16, marginTop: 12, borderTop: `1px solid ${t.text}` }}>
          <span style={{ fontFamily: t.fontBody, fontSize: 14, fontWeight: 500, color: t.text }}>Total paid</span>
          <span style={{ fontFamily: t.fontDisplay, fontSize: 22, fontWeight: 500, color: t.text }}>{fmt(total)}</span>
        </div>
      </div>
      <div style={{ marginTop: 32, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Btn t={t} onClick={() => setPage('home')}>Back to home</Btn>
        <Btn t={t} kind="ghost">View order</Btn>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// LOGIN / SIGN UP
// ─────────────────────────────────────────────────────────────
function LoginPage({ t, m, setPage }) {
  const [mode, setMode] = React.useState('signin');
  return (
    <div style={{ display: 'grid', gridTemplateColumns: m ? '1fr' : '1fr 1fr', minHeight: m ? 'auto' : 800 }}>
      {/* Brand side */}
      <div style={{
        background: t.surfaceAlt, padding: m ? '32px 24px' : '80px 64px',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        borderRight: m ? 'none' : `1px solid ${t.line}`,
        minHeight: m ? 220 : 'auto', position: 'relative', overflow: 'hidden',
      }}>
        <Eyebrow t={t}>MIDU members</Eyebrow>
        <div>
          <h1 style={{
            fontFamily: t.fontDisplay,
            fontSize: m ? 36 : 64,
            fontWeight: t.h1Weight,
            letterSpacing: t.h1Tracking + 'em',
            margin: 0, color: t.text, lineHeight: 1,
          }}>
            A standing
            <br />
            invitation.
          </h1>
          <p style={{ fontFamily: t.fontBody, fontSize: m ? 13 : 14.5, color: t.textMuted, lineHeight: 1.55, marginTop: m ? 16 : 24, maxWidth: 420 }}>
            Members receive early access to capsules, free alterations for life, and an invitation to our seasonal atelier visits.
          </p>
          {!m && (
            <div style={{ marginTop: 56, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {['Early access to every new collection','Complimentary garment care for life','Personal styling appointments','Members-only events in Paris & Porto'].map(b => (
                <div key={b} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <Icon name="check" size={14} color={t.text} />
                  <span style={{ fontFamily: t.fontBody, fontSize: 13, color: t.text }}>{b}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        {!m && (
          <div style={{ fontFamily: t.fontMono, fontSize: 10.5, color: t.textMuted, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
            EST. 2019 · PARIS · PORTO
          </div>
        )}
      </div>

      {/* Form side */}
      <div style={{ padding: m ? '32px 24px 48px' : '80px 64px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ maxWidth: 420, width: '100%', margin: '0 auto' }}>
          {/* tabs */}
          <div style={{ display: 'flex', borderBottom: `1px solid ${t.line}`, marginBottom: 32 }}>
            {[{ id: 'signin', l: 'Sign in' }, { id: 'signup', l: 'Create account' }].map(tab => (
              <button key={tab.id} onClick={() => setMode(tab.id)} style={{
                flex: 1, background: 'transparent', border: 'none',
                padding: '14px 0',
                fontFamily: t.fontBody, fontSize: 12, fontWeight: 500,
                letterSpacing: '0.12em', textTransform: 'uppercase',
                color: mode === tab.id ? t.text : t.textMuted,
                borderBottom: mode === tab.id ? `2px solid ${t.text}` : '2px solid transparent',
                marginBottom: -1, cursor: 'pointer',
              }}>{tab.l}</button>
            ))}
          </div>

          {mode === 'signin' ? (
            <div>
              <Field t={t} label="Email" defaultValue="ines.moreau@gmail.com" />
              <div style={{ marginTop: 14 }}>
                <Field t={t} label="Password" placeholder="••••••••" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: t.fontBody, fontSize: 12, color: t.text }}>
                  <input type="checkbox" defaultChecked style={{ accentColor: t.text }} /> Keep me signed in
                </label>
                <a style={{ fontFamily: t.fontBody, fontSize: 12, color: t.text, textDecoration: 'underline', textUnderlineOffset: 3, cursor: 'pointer' }}>Forgot password?</a>
              </div>
              <div style={{ marginTop: 28 }}>
                <Btn t={t} onClick={() => setPage('home')} size="lg" full>Sign in</Btn>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '28px 0' }}>
                <div style={{ flex: 1, height: 1, background: t.line }} />
                <span style={{ fontFamily: t.fontMono, fontSize: 10, color: t.textMuted, letterSpacing: '0.16em', textTransform: 'uppercase' }}>or</span>
                <div style={{ flex: 1, height: 1, background: t.line }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Btn t={t} kind="ghost" full>Continue with Apple</Btn>
                <Btn t={t} kind="ghost" full>Continue with Google</Btn>
              </div>

              <div style={{ marginTop: 28, fontFamily: t.fontBody, fontSize: 12, color: t.textMuted, textAlign: 'center' }}>
                Not a member yet?{' '}
                <a onClick={() => setMode('signup')} style={{ color: t.text, textDecoration: 'underline', textUnderlineOffset: 3, cursor: 'pointer' }}>Create an account</a>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <Field t={t} label="First name" />
                <Field t={t} label="Last name" />
              </div>
              <div style={{ marginTop: 14 }}><Field t={t} label="Email" /></div>
              <div style={{ marginTop: 14 }}><Field t={t} label="Password" placeholder="At least 8 characters" /></div>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginTop: 18, fontFamily: t.fontBody, fontSize: 12, color: t.textMuted, lineHeight: 1.5 }}>
                <input type="checkbox" defaultChecked style={{ accentColor: t.text, marginTop: 3 }} />
                <span>I'd like to receive occasional emails from MIDU — new collections, atelier news, and members-only invitations.</span>
              </label>
              <div style={{ marginTop: 24 }}>
                <Btn t={t} onClick={() => setPage('home')} size="lg" full>Create account</Btn>
              </div>
              <div style={{ marginTop: 18, fontFamily: t.fontBody, fontSize: 11, color: t.textMuted, textAlign: 'center', lineHeight: 1.5 }}>
                By creating an account, you agree to MIDU's <a style={{ color: t.text, textDecoration: 'underline', textUnderlineOffset: 3 }}>Terms of Service</a> and <a style={{ color: t.text, textDecoration: 'underline', textUnderlineOffset: 3 }}>Privacy Policy</a>.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { CartPage, CheckoutPage, LoginPage, Field, Row });
