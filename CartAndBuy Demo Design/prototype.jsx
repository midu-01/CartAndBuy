// MIDU — full clickable prototype shell
// Wires pages together with page-state + cart-state + recently-viewed.
// Used twice per theme: once as a desktop frame, once inside an iOS frame.

function MIDUPrototype({ themeKey, mobile = false, initialPage = 'home', initialProduct = 'p01' }) {
  const t = MIDU_THEMES[themeKey];
  const [page, setPage] = React.useState(initialPage);
  const [productId, setProductId] = React.useState(initialProduct);
  // Seed cart so cart page isn't empty when user navigates to it directly
  const [cart, setCart] = React.useState([
    { pid: 'p01', size: 'M', color: 0, qty: 1 },
    { pid: 'p05', size: 'S', color: 0, qty: 1 },
  ]);
  const [recent, setRecent] = React.useState(['p13', 'p07', 'p24', 'p17', 'p11', 'p08']);

  const openProduct = (id) => {
    setProductId(id);
    setRecent(r => [id, ...r.filter(x => x !== id)].slice(0, 8));
    setPage('pdp');
    // scroll the scroll container, not the window
    requestAnimationFrame(() => {
      const sc = document.querySelector(`[data-midu-scroll="${themeKey}-${mobile ? 'm' : 'd'}"]`);
      if (sc) sc.scrollTop = 0;
    });
  };
  const addToCart = (item) => setCart(c => [...c, item]);
  const updateCart = (idx, qty) => setCart(c => c.map((x, i) => i === idx ? { ...x, qty } : x));
  const removeCart = (idx) => setCart(c => c.filter((_, i) => i !== idx));
  const cartCount = cart.reduce((a, x) => a + x.qty, 0);

  // hide page chrome on login + checkout (they have their own)
  const isFullBleed = page === 'login' || page === 'checkout';

  return (
    <div data-screen-label={`${themeKey} · ${mobile ? 'mobile' : 'desktop'}`} style={{
      width: '100%', height: '100%', overflow: 'hidden',
      background: t.bg, color: t.text,
      fontFamily: t.fontBody,
      display: 'flex', flexDirection: 'column',
    }}>
      {!isFullBleed && (
        mobile
          ? <MIDUHeaderMobile t={t} page={page} setPage={setPage} cartCount={cartCount} />
          : <MIDUHeader t={t} page={page} setPage={setPage} cartCount={cartCount} onLogin={() => setPage('login')} />
      )}
      <div data-midu-scroll={`${themeKey}-${mobile ? 'm' : 'd'}`} style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {page === 'home' && <HomePage t={t} m={mobile} setPage={setPage} openProduct={openProduct} recentlyViewed={recent} />}
        {page === 'pdp' && <PDPPage t={t} m={mobile} productId={productId} addToCart={addToCart} openProduct={openProduct} setPage={setPage} />}
        {page === 'cart' && <CartPage t={t} m={mobile} cart={cart} updateCart={updateCart} removeCart={removeCart} setPage={setPage} openProduct={openProduct} />}
        {page === 'checkout' && <CheckoutPage t={t} m={mobile} cart={cart} setPage={setPage} />}
        {page === 'login' && <LoginPage t={t} m={mobile} setPage={setPage} />}
        {!isFullBleed && <MIDUFooter t={t} m={mobile} />}
      </div>

      {/* Mobile bottom-nav bar when on home/pdp */}
      {mobile && !isFullBleed && (
        <div style={{
          flex: '0 0 auto',
          display: 'flex', justifyContent: 'space-around', alignItems: 'center',
          height: 56, borderTop: `1px solid ${t.line}`, background: t.surface,
          padding: '0 8px',
        }}>
          {[
            { id: 'home', i: 'menu', l: 'Shop' },
            { id: 'search', i: 'search', l: 'Search' },
            { id: 'login', i: 'user', l: 'Account' },
            { id: 'cart', i: 'bag', l: 'Bag' },
          ].map(item => (
            <button key={item.id} onClick={() => setPage(item.id === 'search' ? 'home' : item.id)} style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              color: page === item.id ? t.text : t.textMuted,
            }}>
              <Icon name={item.i} size={20} />
              <span style={{ fontFamily: t.fontBody, fontSize: 9.5, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{item.l}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

window.MIDUPrototype = MIDUPrototype;
