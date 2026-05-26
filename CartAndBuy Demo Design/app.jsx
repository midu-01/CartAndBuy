// MIDU — root app: assembles the design canvas with 3 directions × (desktop + mobile)

function App() {
  const themes = ['editorial', 'grid', 'boutique'];
  return (
    <DesignCanvas>
      {/* Intro */}
      <DCSection id="intro" title="MIDU · Premium minimal e-commerce"
        subtitle="Three minimal-luxury directions, each a clickable prototype on desktop and mobile. Click any product, then add to bag → checkout → confirmation. Pages: Home · PDP · Cart · Checkout · Login.">
      </DCSection>

      {/* DESKTOP comparison row */}
      <DCSection id="desktop" title="Desktop" subtitle="1440 × 900 — full clickable flow inside each frame">
        {themes.map(k => (
          <DCArtboard key={k + '-d'} id={k + '-d'} label={MIDU_THEMES[k].label + ' · Desktop'} width={1440} height={900}>
            <MIDUPrototype themeKey={k} mobile={false} />
          </DCArtboard>
        ))}
      </DCSection>

      {/* MOBILE comparison row */}
      <DCSection id="mobile" title="Mobile" subtitle="iPhone — same prototype, responsive layout">
        {themes.map(k => (
          <DCArtboard key={k + '-m'} id={k + '-m'} label={MIDU_THEMES[k].label + ' · Mobile'} width={402} height={874}>
            <IOSDevice width={402} height={874} dark={false}>
              <MIDUPrototype themeKey={k} mobile={true} />
            </IOSDevice>
          </DCArtboard>
        ))}
      </DCSection>

      {/* MOBILE deep-link variants — show PDP & cart open per direction */}
      <DCSection id="mobile-pdp" title="Mobile · Product detail" subtitle="Deep-linked to the same PDP across directions so you can compare like-for-like">
        {themes.map(k => (
          <DCArtboard key={k + '-mp'} id={k + '-mp'} label={MIDU_THEMES[k].label + ' · PDP'} width={402} height={874}>
            <IOSDevice width={402} height={874}>
              <MIDUPrototype themeKey={k} mobile={true} initialPage="pdp" initialProduct="p01" />
            </IOSDevice>
          </DCArtboard>
        ))}
      </DCSection>

      <DCSection id="mobile-cart" title="Mobile · Bag" subtitle="Cart pre-seeded with two pieces">
        {themes.map(k => (
          <DCArtboard key={k + '-mc'} id={k + '-mc'} label={MIDU_THEMES[k].label + ' · Bag'} width={402} height={874}>
            <IOSDevice width={402} height={874}>
              <MIDUPrototype themeKey={k} mobile={true} initialPage="cart" />
            </IOSDevice>
          </DCArtboard>
        ))}
      </DCSection>

      <DCSection id="mobile-checkout" title="Mobile · Checkout" subtitle="3-step flow ending in a confirmation screen">
        {themes.map(k => (
          <DCArtboard key={k + '-mch'} id={k + '-mch'} label={MIDU_THEMES[k].label + ' · Checkout'} width={402} height={874}>
            <IOSDevice width={402} height={874}>
              <MIDUPrototype themeKey={k} mobile={true} initialPage="checkout" />
            </IOSDevice>
          </DCArtboard>
        ))}
      </DCSection>

      <DCSection id="mobile-login" title="Mobile · Sign in / Create account" subtitle="Members programme with two tabs">
        {themes.map(k => (
          <DCArtboard key={k + '-ml'} id={k + '-ml'} label={MIDU_THEMES[k].label + ' · Account'} width={402} height={874}>
            <IOSDevice width={402} height={874}>
              <MIDUPrototype themeKey={k} mobile={true} initialPage="login" />
            </IOSDevice>
          </DCArtboard>
        ))}
      </DCSection>
    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
