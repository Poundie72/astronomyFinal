import { useState, useEffect, useRef, useCallback } from "react";

// ─── Google Fonts ───────────────────────────────────────────────────────────
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;400;500;600;700&family=Crimson+Pro:ital,wght@0,300;0,400;0,600;1,300;1,400&family=JetBrains+Mono:wght@300;400;500&display=swap";
document.head.appendChild(fontLink);

// ─── GLOBAL STYLES ──────────────────────────────────────────────────────────
const globalStyle = document.createElement("style");
globalStyle.textContent = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #03080f; color: #c8dff5; font-family: 'Crimson Pro', Georgia, serif; overflow-x: hidden; }
  ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #03080f; }
  ::-webkit-scrollbar-thumb { background: #1a4a6a; border-radius: 2px; }
  
  @keyframes pulse-glow { 0%,100%{opacity:.6} 50%{opacity:1} }
  @keyframes drift { 0%{transform:translateY(0px) rotate(0deg)} 50%{transform:translateY(-12px) rotate(1deg)} 100%{transform:translateY(0px) rotate(0deg)} }
  @keyframes scanline { 0%{transform:translateY(-100%)} 100%{transform:translateY(100vh)} }
  @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  @keyframes twinkle { 0%,100%{opacity:.2;transform:scale(1)} 50%{opacity:.9;transform:scale(1.4)} }
  @keyframes ripple { 0%{transform:scale(0);opacity:.6} 100%{transform:scale(4);opacity:0} }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }

  .nav-btn { transition: all .2s; }
  .nav-btn:hover { background: rgba(58,180,200,.12) !important; border-color: #3ab4c8 !important; color: #7fdfee !important; }
  .nav-btn.active { background: rgba(58,180,200,.18) !important; border-color: #3ab4c8 !important; color: #a8eef8 !important; }
  
  .card { transition: transform .25s, box-shadow .25s; cursor: default; }
  .card:hover { transform: translateY(-3px); box-shadow: 0 12px 40px rgba(0,180,200,.15); }
  
  .hab-slider::-webkit-slider-thumb { -webkit-appearance:none; width:16px; height:16px; border-radius:50%; background:#3ab4c8; cursor:pointer; box-shadow:0 0 8px #3ab4c8; }
  .hab-slider::-webkit-slider-runnable-track { height:4px; border-radius:2px; background: linear-gradient(90deg,#1a3a5a,#3ab4c8); }
  .hab-slider { -webkit-appearance:none; width:100%; height:4px; outline:none; }

  .drake-slider::-webkit-slider-thumb { -webkit-appearance:none; width:14px; height:14px; border-radius:50%; background:#f7c43a; cursor:pointer; box-shadow:0 0 6px #f7c43a88; }
  .drake-slider::-webkit-slider-runnable-track { height:3px; border-radius:2px; background: linear-gradient(90deg,#1a2a1a,#4aaa44); }
  .drake-slider { -webkit-appearance:none; width:100%; height:3px; outline:none; }

  .timeline-node { transition: all .2s; }
  .timeline-node:hover { transform: scale(1.08); filter: brightness(1.3); }
  
  .exo-dot { transition: all .2s; cursor: pointer; }
  .exo-dot:hover { filter: brightness(2) drop-shadow(0 0 6px currentColor); }
  
  .biosig-btn { transition: all .2s; }
  .biosig-btn:hover { filter: brightness(1.4); }
  .biosig-btn.sel { filter: brightness(1.3) drop-shadow(0 0 6px currentColor); }
`;
document.head.appendChild(globalStyle);

// ─── DATA ────────────────────────────────────────────────────────────────────

const LIFE_TIMELINE = [
  { mya: 4500, label: "Earth forms", icon: "🌍", color: "#e87832", cat: "geo",
    desc: "Accretion of solar nebula material forms proto-Earth. Heavy bombardment by planetesimals delivers water and organics. The Moon-forming impact with Theia occurs ~4.5 Ga, stabilizing Earth's axial tilt." },
  { mya: 4100, label: "Late Heavy Bombardment", icon: "☄️", color: "#cc5522", cat: "geo",
    desc: "Intense meteorite bombardment reshapes the inner solar system. Paradoxically, this may have delivered the chemical building blocks needed for life — amino acids, nucleobases, and liquid water." },
  { mya: 3800, label: "First oceans", icon: "🌊", color: "#3a7abf", cat: "geo",
    desc: "Zircon crystals preserve evidence of liquid water by 4.4 Ga. Stable oceans form as Earth cools. Hydrothermal vents along mid-ocean ridges create chemical gradients — perfect energy sources for early life." },
  { mya: 3500, label: "First microbial life", icon: "🦠", color: "#44aa44", cat: "bio",
    desc: "Stromatolites in Western Australia record the earliest unambiguous life — mat-forming cyanobacteria-like microbes. Carbon isotope ratios in older rocks hint life may have begun by 3.8–4.1 Ga." },
  { mya: 2700, label: "Photosynthesis evolves", icon: "☀️", color: "#f7c43a", cat: "bio",
    desc: "Oxygenic photosynthesis emerges, using sunlight, water, and CO₂ to produce glucose. This single evolutionary innovation would transform Earth's atmosphere and enable the explosion of complex life." },
  { mya: 2400, label: "Great Oxidation Event", icon: "💨", color: "#88ccee", cat: "geo",
    desc: "Cyanobacteria flood the atmosphere with O₂, triggering the first global 'pollution crisis.' Most anaerobic life goes extinct. Oxygen enables ozone layer formation, shielding land from UV radiation." },
  { mya: 2000, label: "Eukaryotes emerge", icon: "🧬", color: "#cc44aa", cat: "bio",
    desc: "Endosymbiosis: an archaeon engulfs a bacterium, creating the first cell with a nucleus and mitochondria. This partnership unleashes entirely new evolutionary possibilities — sex, multicellularity, complexity." },
  { mya: 541, label: "Cambrian Explosion", icon: "🐚", color: "#44ccaa", cat: "bio",
    desc: "In ~20 million years, virtually all major animal body plans appear. Eyes, limbs, predation, nervous systems — evolution's greatest diversification event. Possibly triggered by rising oxygen and ecological arms races." },
  { mya: 66, label: "K-Pg extinction", icon: "💥", color: "#ff4422", cat: "geo",
    desc: "A 10 km asteroid ends the Cretaceous. 75% of species extinct. Mammals — small, warm-blooded survivors — radiate into ecological niches vacated by dinosaurs, eventually giving rise to primates and humans." },
  { mya: 0.3, label: "Homo sapiens", icon: "👁️", color: "#f0e0c0", cat: "bio",
    desc: "Modern humans evolve in Africa, develop language, art, and abstract thought. Within 300,000 years we decode DNA, split the atom, and send spacecraft beyond the solar system. Intelligence emerges." },
];

const EXOPLANETS = [
  { name: "Kepler-442b", x: 72, y: 35, type: "super-earth", hz: true, water: "possible", radius: 1.34, temp: -40, star: "K-dwarf", dist: 1200, color: "#4fa3e0",
    desc: "One of the most Earth-like planets known. Receives ~70% of Earth's stellar flux — slightly cold but potentially habitable with a thick atmosphere. High habitability index candidate." },
  { name: "TRAPPIST-1e", x: 28, y: 55, type: "earth-size", hz: true, water: "likely", radius: 0.92, temp: -22, star: "M-dwarf", dist: 39, color: "#44cc88",
    desc: "Orbits within the habitable zone of TRAPPIST-1, just 39 light-years away. Tidal locking is a concern, but atmospheric circulation may distribute heat. Atmospheric characterization is ongoing with JWST." },
  { name: "Proxima Cen b", x: 18, y: 30, type: "earth-size", hz: true, water: "unknown", radius: 1.07, temp: -39, star: "M-dwarf", dist: 4.2, color: "#f7a43a",
    desc: "The nearest exoplanet to Earth. Subject to intense stellar flares from its red dwarf host. Whether it can retain an atmosphere is the key open question. A prime target for future direct imaging." },
  { name: "K2-18b", x: 55, y: 20, type: "sub-neptune", hz: true, water: "detected", radius: 2.37, temp: -3, star: "M-dwarf", dist: 124, color: "#cc44aa",
    desc: "A 'Hycean world' candidate — possibly a water ocean beneath a hydrogen atmosphere. JWST detected carbon dioxide and methane, consistent with a liquid water ocean. Controversial DMS detection in 2023." },
  { name: "55 Cancri e", x: 82, y: 72, type: "super-earth", hz: false, water: "none", radius: 1.88, temp: 2573, star: "G-dwarf", dist: 41, color: "#ff5533",
    desc: "A lava world completing one orbit in 18 hours. Extremely hot with a molten surface. Possible silicate vapor atmosphere. A cautionary tale — proximity to star determines everything." },
  { name: "HD 40307g", x: 42, y: 75, type: "super-earth", hz: true, water: "possible", radius: 2.5, temp: -5, star: "K-dwarf", dist: 42, color: "#88aaff",
    desc: "A super-Earth in the habitable zone that does not appear to be tidally locked. Surface gravity 2x Earth's. If rocky, liquid water could persist. Atmospheric characterization is technologically challenging." },
  { name: "Tau Ceti e", x: 65, y: 62, type: "super-earth", hz: true, water: "possible", radius: 1.65, temp: 68, star: "G-dwarf", dist: 12, color: "#ffcc44",
    desc: "Orbits a Sun-like star only 12 light-years away. The system has a massive debris disk suggesting high asteroid/comet bombardment rates, which may threaten surface habitability. A nearby but complex case." },
  { name: "TRAPPIST-1d", x: 35, y: 38, type: "earth-size", hz: true, water: "possible", radius: 0.77, temp: 15, star: "M-dwarf", dist: 39, color: "#44eecc",
    desc: "The innermost TRAPPIST-1 habitable zone planet. Receives stellar flux similar to Mars. Less massive than Earth; atmospheric retention is uncertain. Rocky composition confirmed by transit timing." },
  { name: "Gliese 667Cc", x: 80, y: 42, type: "super-earth", hz: true, water: "possible", radius: 1.54, temp: 30, star: "M-dwarf", dist: 23, color: "#ee8844",
    desc: "A super-Earth in a triple star system. Receives similar stellar energy to Earth. The unusual stellar environment would create striking visual phenomena. Part of a complex multi-planet system." },
];

const BIOSIGNATURES = [
  { id: "oxygen", label: "O₂ / Ozone", icon: "💨", color: "#88ccee",
    strength: 85, false_pos: 15,
    desc: "Molecular oxygen is produced almost exclusively by photosynthesis. Its detection in an exoplanet atmosphere would be a strong biosignature — but abiotic sources (photolysis of water) must be ruled out via context.",
    detection: "Transit spectroscopy, direct imaging spectroscopy",
    earthExample: "~21% of Earth's atmosphere — entirely biogenic" },
  { id: "methane", label: "CH₄ + CO₂", icon: "🌿", color: "#44aa44",
    strength: 72, false_pos: 30,
    desc: "Methane and CO₂ in disequilibrium is a powerful biosignature pair. On Earth, methane is 95% biological. The two gases react and shouldn't coexist in large amounts without constant replenishment.",
    detection: "Mid-infrared spectroscopy (JWST, future missions)",
    earthExample: "CH₄ ~1.9 ppm, continuously replenished by microbes and animals" },
  { id: "dms", label: "DMS / DMDS", icon: "🦠", color: "#cc44aa",
    strength: 55, false_pos: 40,
    desc: "Dimethyl sulfide (DMS) is produced by marine phytoplankton on Earth. A tentative detection in K2-18b's atmosphere (2023) sparked debate. Abiotic production pathways exist but are less efficient.",
    detection: "Mid-infrared transit spectroscopy",
    earthExample: "Produced by marine algae; ~300 million tons/year from Earth's oceans" },
  { id: "nox", label: "N₂O", icon: "⚗️", color: "#f7c43a",
    strength: 68, false_pos: 20,
    desc: "Nitrous oxide is produced by denitrifying bacteria. No known abiotic process produces it in large quantities. On an oxygen-poor world, it might be a more detectable biosignature than O₂.",
    detection: "Near and mid-infrared spectroscopy",
    earthExample: "~0.33 ppm, 40% from natural microbial sources; rising due to agriculture" },
  { id: "vegetation", label: "Vegetation Red Edge", icon: "🌱", color: "#66ee66",
    strength: 78, false_pos: 10,
    desc: "Land plants sharply reflect near-infrared light at ~700nm — the 'red edge.' This spectral feature has no known abiotic analog and could be detected in the reflected light spectrum of an Earth-like exoplanet.",
    detection: "Direct imaging spectroscopy (requires large future telescope)",
    earthExample: "Earth's reflection spectrum shows clear red edge from vegetation coverage" },
  { id: "techno", label: "Technosignatures", icon: "📡", color: "#f7a43a",
    strength: 95, false_pos: 5,
    desc: "Industrial pollution (CFCs, NO₂ cities), radio signals, laser pulses, megastructures, waste heat — all indicate technological civilization. CFCs are unambiguous; they have no natural production pathway.",
    detection: "Radio SETI, optical SETI, atmospheric spectroscopy for CFCs",
    earthExample: "Earth leaks TV, radar, and radio signals; CFC concentrations are rising" },
];

const HABITABLE_PARAMS = [
  { id: "water", label: "Liquid Water", unit: "%", min: 0, max: 100, default: 70, color: "#3a7abf",
    impact: "water", icon: "💧",
    desc: "Universal solvent for biochemistry. Enables ion transport, protein folding, metabolic reactions. Required as known to support life — though exotic solvents (ammonia, methanol) are theoretical alternatives." },
  { id: "temp", label: "Surface Temp", unit: "°C", min: -80, max: 150, default: 15, color: "#f7c43a",
    impact: "temp", icon: "🌡️",
    desc: "Liquid water range: 0–100°C at 1 atm. Extremophiles survive -20°C to +122°C. Temperature governs chemical reaction rates and protein stability — extremes demand specialized molecular adaptations." },
  { id: "atmo", label: "Atmosphere (bar)", unit: "", min: 0, max: 10, default: 1, color: "#88ccee",
    impact: "atmo", icon: "💨",
    desc: "Pressure maintains liquid water on surface. Shields surface from UV/cosmic rays. Enables greenhouse warming. Too thick = runaway greenhouse (Venus). Too thin = freeze and radiation damage (Mars)." },
  { id: "energy", label: "Energy Flux", unit: "× Earth", min: 0.1, max: 3, default: 1, color: "#f7a43a",
    impact: "energy", icon: "⚡",
    desc: "Chemical, thermal, or radiative energy drives metabolism. On Earth: sunlight + hydrothermal vents. On icy moons: tidal heating. Too much stellar flux causes runaway greenhouse; too little means global freeze." },
  { id: "elements", label: "CHNOPS Index", unit: "%", min: 0, max: 100, default: 60, color: "#44cc88",
    impact: "elements", icon: "⚗️",
    desc: "Carbon, Hydrogen, Nitrogen, Oxygen, Phosphorus, Sulfur — the six elements of life. Availability constrains biochemical complexity. Phosphorus is notably scarce and may be a universal limiting nutrient." },
  { id: "time", label: "Stability (Gyr)", unit: "", min: 0.1, max: 10, default: 4.5, color: "#cc44aa",
    impact: "time", icon: "⏳",
    desc: "Life took ~3.5 billion years to produce intelligence on Earth. Stable stellar output, consistent orbital mechanics, and absence of sterilizing events allow time for evolutionary complexity to accumulate." },
];

const DRAKE_PARAMS = [
  { id: "R", label: "Star formation rate", unit: "stars/yr", min: 0.1, max: 10, default: 3, log: false,
    desc: "Rate of star formation in the Milky Way. Current estimates: 1–3 solar masses per year." },
  { id: "fp", label: "Fraction with planets", unit: "", min: 0, max: 1, default: 0.92, log: false,
    desc: "Recent Kepler data: ~92% of Sun-like stars have planets. Planetary systems are the rule, not the exception." },
  { id: "ne", label: "Habitable zone planets/star", unit: "", min: 0, max: 5, default: 0.4, log: false,
    desc: "Planets in the habitable zone per planetary system. Estimates range from 0.1 to 2+ depending on stellar type." },
  { id: "fl", label: "Fraction where life arises", unit: "", min: 0, max: 1, default: 0.13, log: false,
    desc: "The deepest unknown. Earth suggests life is easy once conditions are right. But we have one data point." },
  { id: "fi", label: "Fraction developing intelligence", unit: "", min: 0, max: 1, default: 0.01, log: false,
    desc: "Intelligence evolved once in 4+ billion years on Earth. Convergent evolution of eyes, limbs suggests some traits are inevitable — but intelligence may not be." },
  { id: "fc", label: "Fraction that communicates", unit: "", min: 0, max: 1, default: 0.2, log: false,
    desc: "Technological civilizations that produce detectable signals. We've been broadcasting for ~100 years out of ~300,000 years of existence." },
  { id: "L", label: "Civilization lifespan", unit: "years", min: 100, max: 1e9, default: 10000, log: true,
    desc: "How long does a technological civilization survive? The Fermi Paradox hinges on this. Self-destruction, stagnation, or expansion — civilizations may not last long." },
];

// ─── STAR FIELD COMPONENT ────────────────────────────────────────────────────
function StarField({ count = 180 }) {
  const stars = useRef(
    Array.from({ length: count }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      r: Math.random() * 1.6 + 0.3,
      delay: Math.random() * 6,
      dur: 2 + Math.random() * 5,
    }))
  );
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
      {stars.current.map((s, i) => (
        <div key={i} style={{
          position: "absolute", left: `${s.x}%`, top: `${s.y}%`,
          width: s.r, height: s.r, borderRadius: "50%",
          background: "white", opacity: 0.5,
          animation: `twinkle ${s.dur}s ${s.delay}s ease-in-out infinite`,
        }} />
      ))}
    </div>
  );
}

// ─── NAV ─────────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "solarsystem", label: "Solar System",    icon: "🪐" },
  { id: "timeline",    label: "Timeline of Life", icon: "⏳" },
  //{ id: "habzone",     label: "Habitability Lab", icon: "🌍" },
  //{ id: "exo",         label: "Exoplanet Map",    icon: "🔭" },
  //{ id: "biosig",      label: "Biosignatures",    icon: "🧬" },
  { id: "drake",       label: "Drake Equation",   icon: "📡" },
];

// ─── SOLAR SYSTEM DATA ───────────────────────────────────────────────────────
const SOLAR_PLANETS = [
  { name: "Mercury", period: 0.241,  radius: 3,   color: "#b5a99a", dist: 0.39,  moons: 0,
    desc: "The smallest planet and closest to the Sun. Surface temperatures swing from -180°C to 430°C. No atmosphere to speak of — scarred by craters. Likely has water ice in permanently shadowed polar craters.",
    type: "Terrestrial", diameter: "4,879 km", dayLen: "59 Earth days", yearLen: "88 Earth days", temp: "167°C avg",
    astrobio: 8 },
  { name: "Venus",   period: 0.615,  radius: 6,   color: "#e8cda0", dist: 0.72,  moons: 0,
    desc: "Earth's 'evil twin' — nearly identical in size but catastrophically different. Runaway greenhouse effect: 96% CO₂ atmosphere, 92 bar pressure, 462°C surface. Possible microbial life survives in cloud layers at ~50 km altitude.",
    type: "Terrestrial", diameter: "12,104 km", dayLen: "243 Earth days", yearLen: "225 Earth days", temp: "462°C",
    astrobio: 30 },
  { name: "Earth",   period: 1.000,  radius: 6.5, color: "#4fa3e0", dist: 1.00,  moons: 1,
    desc: "The only confirmed life-bearing world. Liquid water covers 71% of the surface. Active plate tectonics recycles carbon, stabilizing climate over billions of years. The Moon stabilizes axial tilt — possibly crucial for life.",
    type: "Terrestrial", diameter: "12,742 km", dayLen: "24 hours", yearLen: "365.25 days", temp: "15°C avg",
    astrobio: 100 },
  { name: "Mars",    period: 1.881,  radius: 4,   color: "#c1440e", dist: 1.52,  moons: 2,
    desc: "Once had rivers, lakes, and possibly an ocean. Lost its magnetic field ~4 Gya, then its atmosphere to solar wind. Subsurface liquid water may persist. Best candidate for past or present extraterrestrial life in our solar system.",
    type: "Terrestrial", diameter: "6,779 km", dayLen: "24.6 hours", yearLen: "687 Earth days", temp: "-60°C avg",
    astrobio: 72 },
  { name: "Jupiter", period: 11.86,  radius: 14,  color: "#c88b3a", dist: 5.20,  moons: 95,
    desc: "The solar system's guardian — its gravity deflects many comets away from Earth. Moon Europa has a subsurface ocean with more water than all Earth's oceans combined, heated by tidal flexing from Jupiter's gravity.",
    type: "Gas Giant", diameter: "139,820 km", dayLen: "9.9 hours", yearLen: "11.9 Earth years", temp: "-110°C (clouds)",
    astrobio: 85 },
  { name: "Saturn",  period: 29.46,  radius: 12,  color: "#e4d191", dist: 9.54,  moons: 146,
    desc: "Moon Enceladus shoots geysers of water vapor and organic molecules into space from a subsurface ocean — active hydrothermal chemistry confirmed. Titan has liquid methane lakes and a prebiotic chemistry rich atmosphere.",
    type: "Gas Giant", diameter: "116,460 km", dayLen: "10.7 hours", yearLen: "29.5 Earth years", temp: "-140°C (clouds)",
    astrobio: 90 },
  { name: "Uranus",  period: 84.01,  radius: 9,   color: "#7de8e8", dist: 19.19, moons: 28,
    desc: "An ice giant knocked on its side — axial tilt of 98°. The coldest planetary atmosphere at -224°C. Miranda and Ariel may harbor subsurface oceans. Less studied than other outer planets; a prime target for future missions.",
    type: "Ice Giant", diameter: "50,724 km", dayLen: "17.2 hours", yearLen: "84 Earth years", temp: "-195°C",
    astrobio: 40 },
  { name: "Neptune", period: 164.8,  radius: 8,   color: "#3f54ba", dist: 30.07, moons: 16,
    desc: "Supersonic winds up to 2,100 km/h. Moon Triton was captured from the Kuiper Belt and has active nitrogen geysers — possibly the most geologically surprising moon in the outer solar system. Internal ocean possible.",
    type: "Ice Giant", diameter: "49,244 km", dayLen: "16.1 hours", yearLen: "165 Earth years", temp: "-200°C",
    astrobio: 50 },
];

const ASTROBIO_NOTES = {
  Mercury: "Extreme temperatures and no atmosphere make surface life impossible. Impact history and polar ice are the main research interests.",
  Venus:   "Atmospheric chemical disequilibrium hints at possible aerial microbial life at 50 km altitude where conditions are mild. Phosphine detection remains controversial.",
  Earth:   "The benchmark for habitability. Liquid water, active tectonics, magnetic field, large Moon stabilizing axial tilt — all potentially critical factors.",
  Mars:    "Best candidate for past life. Liquid water flowed ~3.5 Gya. Subsurface brines may persist today. Perseverance rover is collecting samples for return to Earth.",
  Jupiter: "Europa's ocean is a premier life candidate — 2–3× more water than Earth, in contact with a rocky seafloor enabling hydrothermal chemistry like Earth's vents.",
  Saturn:  "Enceladus ejects water, organics, and H₂ — all ingredients for methanogenic life. Titan is a prebiotic chemistry laboratory with lakes of liquid methane.",
  Uranus:  "Internal oceans possible in moons Miranda and Ariel. A Uranus orbiter is NASA's top-priority flagship mission for the 2030s.",
  Neptune: "Triton's geysers and retrograde orbit suggest a captured Kuiper Belt object that may preserve primordial chemistry. Interior ocean is plausible.",
};

// ─── SOLAR SYSTEM MODULE ─────────────────────────────────────────────────────
function SolarSystemModule() {
  const canvasRef = useRef(null);
  const animRef   = useRef(null);
  const stateRef  = useRef({
    speed: 1, paused: false,
    angles: SOLAR_PLANETS.map((_, i) => (i * 0.8) % (Math.PI * 2)),
  });
  const [selected, setSelected] = useState(null);
  const [speed, setSpeed]       = useState(1);
  const [paused, setPaused]     = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const hitRef = useRef([]);

  useEffect(() => { stateRef.current.speed = speed; }, [speed]);
  useEffect(() => { stateRef.current.paused = paused; }, [paused]);

  // Colour helpers
  function hexToRgb(hex) {
    const n = parseInt(hex.replace("#",""), 16);
    return [(n>>16)&255, (n>>8)&255, n&255];
  }
  function lightenHex(hex, amt) {
    const [r,g,b] = hexToRgb(hex);
    return `rgb(${Math.min(255,r+amt)},${Math.min(255,g+amt)},${Math.min(255,b+amt)})`;
  }
  function darkenHex(hex, amt) {
    const [r,g,b] = hexToRgb(hex);
    return `rgb(${Math.max(0,r-amt)},${Math.max(0,g-amt)},${Math.max(0,b-amt)})`;
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let lastTime = 0;

    function resize() {
      const parent = canvas.parentElement;
      canvas.width  = parent.clientWidth;
      canvas.height = parent.clientHeight;
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement);

    // Seeded random
    function mkRng(seed) {
      let s = seed >>> 0;
      return () => { s = Math.imul(1664525, s) + 1013904223 >>> 0; return s / 4294967296; };
    }

    function orbitR(i, W, H) {
      const minR = Math.max(W, H) * 0.055;
      const maxR = Math.min(W * 0.47, H * 0.47);
      const logMin = Math.log(0.35), logMax = Math.log(32);
      const logD   = Math.log(SOLAR_PLANETS[i].dist);
      return minR + ((logD - logMin) / (logMax - logMin)) * (maxR - minR);
    }

    function frame(ts) {
      const dt = Math.min((ts - lastTime) / 1000, 0.05);
      lastTime = ts;
      const { speed, paused } = stateRef.current;
      const W = canvas.width, H = canvas.height;
      const cx = W / 2, cy = H / 2;

      ctx.clearRect(0, 0, W, H);

      // Starfield
      const rng = mkRng(7777);
      for (let i = 0; i < 280; i++) {
        const sx = rng() * W, sy = rng() * H;
        const ss = rng() * 1.5 + 0.3;
        const sa = 0.1 + rng() * 0.55;
        ctx.beginPath(); ctx.arc(sx, sy, ss, 0, Math.PI*2);
        ctx.fillStyle = `rgba(255,255,255,${sa})`; ctx.fill();
      }

      // Sun glow layers
      const sunR = Math.max(16, Math.min(W, H) * 0.025);
      for (let g = 6; g > 0; g--) {
        const gr = ctx.createRadialGradient(cx,cy,0, cx,cy, sunR*g*1.6);
        gr.addColorStop(0, `rgba(255,220,80,${0.07/g})`);
        gr.addColorStop(1, "rgba(255,180,0,0)");
        ctx.beginPath(); ctx.arc(cx, cy, sunR*g*1.6, 0, Math.PI*2);
        ctx.fillStyle = gr; ctx.fill();
      }
      const sunBody = ctx.createRadialGradient(cx-sunR*.3, cy-sunR*.3, sunR*.05, cx, cy, sunR);
      sunBody.addColorStop(0, "#fffde8");
      sunBody.addColorStop(0.55, "#fff7a1");
      sunBody.addColorStop(1, "#f7a43a");
      ctx.beginPath(); ctx.arc(cx, cy, sunR, 0, Math.PI*2);
      ctx.fillStyle = sunBody; ctx.fill();
      ctx.font = `bold ${Math.max(10, sunR * 0.85)}px Rajdhani, monospace`;
      ctx.fillStyle = "rgba(255,247,161,0.8)"; ctx.textAlign = "center";
      ctx.fillText("☀ Sun", cx, cy + sunR + 13);

      // Asteroid belt
      const bR1 = orbitR(3,W,H) + (orbitR(4,W,H)-orbitR(3,W,H))*0.25;
      const bR2 = orbitR(3,W,H) + (orbitR(4,W,H)-orbitR(3,W,H))*0.75;
      const brng = mkRng(55555);
      for (let i = 0; i < 350; i++) {
        const ang = brng()*Math.PI*2;
        const rad = bR1 + brng()*(bR2-bR1);
        ctx.beginPath(); ctx.arc(cx+rad*Math.cos(ang), cy+rad*Math.sin(ang), brng()*1.2+0.2, 0, Math.PI*2);
        ctx.fillStyle = `rgba(140,130,115,${0.18+brng()*0.28})`; ctx.fill();
      }

      // Orbit rings
      SOLAR_PLANETS.forEach((_, i) => {
        const oR = orbitR(i,W,H);
        ctx.beginPath(); ctx.arc(cx,cy,oR,0,Math.PI*2);
        ctx.strokeStyle = "rgba(25,55,95,0.5)";
        ctx.lineWidth = 0.8; ctx.setLineDash([2,7]); ctx.stroke(); ctx.setLineDash([]);
      });

      // Advance angles
      if (!paused) {
        SOLAR_PLANETS.forEach((p, i) => {
          stateRef.current.angles[i] += (dt * speed * 0.6) / p.period;
        });
      }

      hitRef.current = [];

      // Draw planets
      SOLAR_PLANETS.forEach((p, i) => {
        const oR  = orbitR(i,W,H);
        const ang = stateRef.current.angles[i];
        const px  = cx + oR * Math.cos(ang);
        const py  = cy + oR * Math.sin(ang);
        const scale = Math.min(W, H) / 800;
        const pr  = Math.max(3.5, p.radius * scale);
        const isSel = selected?.name === p.name;
        const isHov = hoveredIdx === i;

        hitRef.current.push({ cx: px, cy: py, r: pr + 8, i });

        // Selection / hover glow
        if (isSel || isHov) {
          const gl = ctx.createRadialGradient(px,py,0, px,py, pr*4);
          gl.addColorStop(0, p.color + "44");
          gl.addColorStop(1, "transparent");
          ctx.beginPath(); ctx.arc(px,py,pr*4,0,Math.PI*2);
          ctx.fillStyle = gl; ctx.fill();
        }

        // Saturn rings (behind planet)
        if (p.name === "Saturn") {
          ctx.save(); ctx.translate(px, py); ctx.scale(1, 0.3);
          const rIn = pr * 1.55, rOut = pr * 2.4;
          for (let rr = rIn; rr <= rOut; rr += 1.5) {
            const t = (rr-rIn)/(rOut-rIn);
            const al = (t < 0.5 ? t : 1-t) * 0.65;
            ctx.beginPath(); ctx.arc(0,0,rr,0,Math.PI*2);
            ctx.strokeStyle = `rgba(228,209,145,${al})`; ctx.lineWidth = 1.5; ctx.stroke();
          }
          ctx.restore();
        }

        // Planet body
        const pg = ctx.createRadialGradient(px-pr*.35, py-pr*.35, pr*.05, px, py, pr);
        pg.addColorStop(0, lightenHex(p.color, 55));
        pg.addColorStop(0.5, p.color);
        pg.addColorStop(1, darkenHex(p.color, 55));
        ctx.beginPath(); ctx.arc(px, py, pr, 0, Math.PI*2);
        ctx.fillStyle = pg; ctx.fill();

        if (isSel) {
          ctx.beginPath(); ctx.arc(px, py, pr+2.5, 0, Math.PI*2);
          ctx.strokeStyle = "rgba(255,255,255,.85)"; ctx.lineWidth = 1.5; ctx.stroke();
        }

        // Earth moon
        if (p.name === "Earth") {
          const ma = stateRef.current.angles[i] * 13;
          const mo = pr + 10 * scale;
          ctx.beginPath(); ctx.arc(px + mo*Math.cos(ma), py + mo*Math.sin(ma), Math.max(1.5, pr*.26), 0, Math.PI*2);
          ctx.fillStyle = "#aaaaaa"; ctx.fill();
        }

        // Label
        const showLabel = pr > 7 || isSel || isHov;
        if (showLabel) {
          const fs = Math.max(9, Math.min(14, pr * 1.5));
          ctx.font = `${isSel?"bold ":""}${fs}px Rajdhani, monospace`;
          ctx.fillStyle = isSel ? "#ffffff" : (isHov ? lightenHex(p.color,60) : p.color);
          ctx.textAlign = "center";
          ctx.fillText(p.name, px, py - pr - 5);
        }
      });

      animRef.current = requestAnimationFrame(frame);
    }

    animRef.current = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(animRef.current);
      ro.disconnect();
    };
  }, [selected, hoveredIdx]);

  function getHit(e) {
    const rect = canvasRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    for (const h of hitRef.current) {
      if (Math.hypot(mx - h.cx, my - h.cy) < h.r) return h.i;
    }
    return null;
  }

  const habColors = {100:"#44cc88",90:"#44cc88",85:"#44cc88",72:"#88cc44",50:"#f7c43a",40:"#f7a43a",30:"#ff9944",8:"#ff5533"};

  return (
    <div style={{ animation: "fadeUp .4s ease" }}>
      <h2 style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 28, fontWeight: 600, color: "#a8eef8", marginBottom: 6, letterSpacing: 2 }}>
        LIVE SOLAR SYSTEM
      </h2>
      <p style={{ color: "#6a9abf", marginBottom: 14, fontStyle: "italic", fontSize: 15 }}>
        Planets orbiting in real relative periods. Click any planet to explore its astrobiology significance.
      </p>

      {/* Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12, flexWrap: "wrap" }}>
        <button onClick={() => setPaused(p => !p)} style={{
          padding: "6px 20px", borderRadius: 20, border: "1px solid #3ab4c8",
          background: "rgba(58,180,200,.15)", color: "#a8eef8",
          fontFamily: "'Rajdhani',sans-serif", fontSize: 14, fontWeight: 600, cursor: "pointer", letterSpacing: 1 }}>
          {paused ? "▶  RESUME" : "⏸  PAUSE"}
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, color: "#4a7090", fontFamily: "'JetBrains Mono',monospace" }}>SPEED</span>
          {[0.25, 0.5, 1, 2, 5, 15].map(s => (
            <button key={s} onClick={() => setSpeed(s)} style={{
              padding: "4px 11px", borderRadius: 14, fontSize: 12, cursor: "pointer",
              fontFamily: "'JetBrains Mono',monospace", fontWeight: 600,
              border: `1px solid ${speed===s?"#f7c43a":"#1a3a5a"}`,
              background: speed===s?"rgba(247,196,58,.2)":"transparent",
              color: speed===s?"#f7c43a":"#6a9abf", transition: "all .15s" }}>
              {s}×
            </button>
          ))}
        </div>
        <span style={{ marginLeft: "auto", fontSize: 10, color: "#2a4060", fontFamily: "'JetBrains Mono',monospace" }}>
          periods to scale · distances log-compressed · click any planet
        </span>
      </div>

      {/* Canvas + detail */}
      <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 330px" : "1fr", gap: 14, transition: "all .3s" }}>
        <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #0d1f3c", background: "#020810", position: "relative" }}>
          <canvas ref={canvasRef}
            style={{ display: "block", width: "100%", height: selected ? 500 : 560 }}
            onMouseMove={e => { const i = getHit(e); setHoveredIdx(i); canvasRef.current.style.cursor = i!==null?"pointer":"default"; }}
            onMouseLeave={() => setHoveredIdx(null)}
            onClick={e => { const i = getHit(e); if (i!==null) setSelected(s => s?.name===SOLAR_PLANETS[i].name?null:SOLAR_PLANETS[i]); else setSelected(null); }}
          />
        </div>

        {selected && (
          <div style={{ padding: 18, borderRadius: 12, background: "rgba(8,22,44,.95)", border: `1px solid ${selected.color}55`, overflowY: "auto", maxHeight: 520 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom: 12 }}>
              <div>
                <h3 style={{ fontFamily:"'Rajdhani',sans-serif", fontWeight:700, fontSize:24, color:selected.color, letterSpacing:1 }}>{selected.name}</h3>
                <div style={{ color:"#4a7090", fontSize:11, fontFamily:"'JetBrains Mono',monospace" }}>{selected.type}</div>
              </div>
              <div style={{ width:40, height:40, borderRadius:"50%", background:selected.color, boxShadow:`0 0 20px ${selected.color}99`, flexShrink:0 }}/>
            </div>
            <p style={{ fontSize:13, color:"#b8d8f0", lineHeight:1.65, fontStyle:"italic", marginBottom:14 }}>{selected.desc}</p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7, marginBottom:12 }}>
              {[["Diameter",selected.diameter],["Day",selected.dayLen],["Year",selected.yearLen],["Temp",selected.temp],["Moons",selected.moons],["Orbit",`${selected.dist} AU`]].map(([k,v])=>(
                <div key={k} style={{ padding:"7px 9px", borderRadius:6, background:"rgba(0,0,0,.4)", border:"1px solid #1a3a5a" }}>
                  <div style={{ fontSize:9, color:"#4a7090", fontFamily:"'JetBrains Mono',monospace", marginBottom:2 }}>{k.toUpperCase()}</div>
                  <div style={{ fontSize:12, color:"#c8dff5", fontFamily:"'Rajdhani',sans-serif", fontWeight:600 }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ padding:"10px 12px", borderRadius:8, background:"rgba(68,180,136,.07)", border:"1px solid rgba(68,180,136,.2)", marginBottom:10 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                <span style={{ fontSize:9, color:"#44cc88", fontFamily:"'JetBrains Mono',monospace", letterSpacing:.5 }}>ASTROBIOLOGY RELEVANCE</span>
                <span style={{ fontSize:12, color: Object.entries(habColors).sort((a,b)=>b[0]-a[0]).find(([k])=>selected.astrobio>=+k)?.[1]||"#888", fontFamily:"'JetBrains Mono',monospace", fontWeight:700 }}>{selected.astrobio}/100</span>
              </div>
              <div style={{ height:5, borderRadius:3, background:"#0d1f3c", marginBottom:8 }}>
                <div style={{ height:"100%", borderRadius:3, width:`${selected.astrobio}%`, transition:"width .5s",
                  background:`linear-gradient(90deg,#44cc88,#3ab4c8)` }}/>
              </div>
              <p style={{ fontSize:11.5, color:"#6ab090", lineHeight:1.55 }}>{ASTROBIO_NOTES[selected.name]}</p>
            </div>
            <button onClick={()=>setSelected(null)} style={{ width:"100%", padding:"7px", borderRadius:8, border:"1px solid #1a3a5a", background:"transparent", color:"#4a7090", fontFamily:"'Rajdhani',sans-serif", fontSize:12, cursor:"pointer", letterSpacing:1 }}>CLOSE ✕</button>
          </div>
        )}
      </div>

      {/* Quick-select row */}
      <div style={{ display:"flex", gap:7, marginTop:12, flexWrap:"wrap" }}>
        {SOLAR_PLANETS.map(p => (
          <button key={p.name} onClick={() => setSelected(s => s?.name===p.name?null:p)}
            style={{ padding:"4px 13px", borderRadius:18, border:`1px solid ${selected?.name===p.name?p.color+"aa":"#1a3a5a"}`,
              background:selected?.name===p.name?`${p.color}22`:"transparent", color:selected?.name===p.name?p.color:"#6a9abf",
              fontFamily:"'Rajdhani',sans-serif", fontSize:12, fontWeight:600, cursor:"pointer", letterSpacing:.5, transition:"all .18s" }}>
            {p.name}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── TIMELINE MODULE ─────────────────────────────────────────────────────────
function TimelineModule() {
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("all");
  const total = 4500;
  const filtered = filter === "all" ? LIFE_TIMELINE : LIFE_TIMELINE.filter(e => e.cat === filter);

  return (
    <div style={{ animation: "fadeUp .4s ease" }}>
      <h2 style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 28, fontWeight: 600, color: "#a8eef8", marginBottom: 6, letterSpacing: 2 }}>
        TIMELINE OF LIFE ON EARTH
      </h2>
      <p style={{ color: "#6a9abf", marginBottom: 20, fontStyle: "italic", fontSize: 15 }}>
        4.5 billion years of planetary and biological evolution — and what it tells us about life elsewhere.
      </p>

      {/* Filter */}
      <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
        {[["all","All Events","#c8dff5"],["geo","Geological","#e87832"],["bio","Biological","#44aa44"]].map(([k,l,c]) => (
          <button key={k} onClick={() => setFilter(k)} style={{
            padding: "5px 14px", borderRadius: 20, border: `1px solid ${filter===k?c:"#1a3a5a"}`,
            background: filter===k?`${c}22`:"transparent", color: filter===k?c:"#6a9abf",
            fontFamily: "'Rajdhani',sans-serif", fontSize: 13, fontWeight: 600,
            letterSpacing: 1, cursor: "pointer", transition: "all .2s",
          }}>{l}</button>
        ))}
      </div>

      {/* Timeline bar */}
      <div style={{ position: "relative", marginBottom: 32 }}>
        <div style={{ height: 3, background: "linear-gradient(90deg,#1a3a6a,#3ab4c8,#1a3a6a)", borderRadius: 2, position: "relative" }}>
          {filtered.map((ev, i) => {
            const pct = 100 - (ev.mya / total) * 100;
            return (
              <div key={i} className="timeline-node" onClick={() => setSelected(selected?.mya === ev.mya ? null : ev)}
                style={{
                  position: "absolute", left: `${pct}%`, top: "50%",
                  transform: "translate(-50%,-50%)",
                  width: selected?.mya === ev.mya ? 18 : 13,
                  height: selected?.mya === ev.mya ? 18 : 13,
                  borderRadius: "50%",
                  background: ev.color,
                  border: selected?.mya === ev.mya ? `2px solid white` : "none",
                  cursor: "pointer", zIndex: 2,
                  boxShadow: `0 0 ${selected?.mya === ev.mya ? 14 : 6}px ${ev.color}88`,
                }}
                title={ev.label}
              />
            );
          })}
        </div>
        {/* Axis labels */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, color: "#4a7090", fontSize: 11, fontFamily: "'JetBrains Mono',monospace" }}>
          <span>4,500 Ma</span><span>3,000 Ma</span><span>2,000 Ma</span><span>1,000 Ma</span><span>500 Ma</span><span>Now</span>
        </div>
      </div>

      {/* Event cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 12 }}>
        {filtered.map((ev, i) => (
          <div key={i} className="card" onClick={() => setSelected(selected?.mya === ev.mya ? null : ev)}
            style={{
              padding: "14px 16px", borderRadius: 10,
              background: selected?.mya === ev.mya ? `${ev.color}18` : "rgba(10,28,50,.7)",
              border: `1px solid ${selected?.mya === ev.mya ? ev.color+"88" : "#1a3a5a"}`,
              cursor: "pointer",
            }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 20 }}>{ev.icon}</span>
              <div>
                <div style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 600, color: ev.color, fontSize: 14, letterSpacing: .5 }}>{ev.label}</div>
                <div style={{ fontSize: 11, color: "#4a7090", fontFamily: "'JetBrains Mono',monospace" }}>
                  {ev.mya >= 1000 ? `${(ev.mya/1000).toFixed(1)} Gya` : ev.mya < 1 ? `${Math.round(ev.mya*1000)} kya` : `${ev.mya} Mya`}
                </div>
              </div>
            </div>
            {selected?.mya === ev.mya && (
              <p style={{ color: "#b0cfe0", fontSize: 13.5, lineHeight: 1.6, marginTop: 8, fontStyle: "italic" }}>{ev.desc}</p>
            )}
          </div>
        ))}
      </div>
      {!selected && <p style={{ color: "#4a7090", marginTop: 16, fontSize: 13, textAlign: "center" }}>Click any event for details</p>}
    </div>
  );
}

// ─── HABITABILITY LAB ────────────────────────────────────────────────────────
function HabitabilityLab() {
  const defaults = Object.fromEntries(HABITABLE_PARAMS.map(p => [p.id, p.default]));
  const [vals, setVals] = useState(defaults);
  const [selected, setSelected] = useState(null);

  function score() {
    let s = 100;
    const v = vals;
    // Water
    if (v.water < 10) s -= 40; else if (v.water < 30) s -= 20;
    // Temp
    if (v.temp < -20 || v.temp > 122) s -= 35; else if (v.temp < 0 || v.temp > 80) s -= 15;
    // Atmo
    if (v.atmo < 0.1) s -= 30; else if (v.atmo > 8) s -= 25;
    // Energy
    if (v.energy < 0.2 || v.energy > 2.5) s -= 25; else if (v.energy < 0.5 || v.energy > 1.5) s -= 10;
    // Elements
    if (v.elements < 20) s -= 25; else if (v.elements < 40) s -= 10;
    // Time
    if (v.time < 0.5) s -= 20; else if (v.time < 2) s -= 10;
    return Math.max(0, Math.min(100, s));
  }

  const hab = score();
  const habColor = hab > 70 ? "#44cc88" : hab > 40 ? "#f7c43a" : "#ff5533";
  const habLabel = hab > 75 ? "POTENTIALLY HABITABLE" : hab > 50 ? "MARGINAL" : hab > 25 ? "HOSTILE" : "UNINHABITABLE";

  const analogues = [
    { name: "Earth", water: 70, temp: 15, atmo: 1, energy: 1, elements: 75, time: 4.5, color: "#4fa3e0" },
    { name: "Mars", water: 2, temp: -60, atmo: 0.007, energy: 0.43, elements: 40, time: 4.5, color: "#c1440e" },
    { name: "Europa", water: 100, temp: -160, atmo: 0, energy: 0.04, elements: 50, time: 4.5, color: "#aaccee" },
    { name: "Titan", water: 5, temp: -179, atmo: 1.5, energy: 0.01, elements: 30, time: 4.5, color: "#e8cda0" },
    { name: "Venus", water: 0, temp: 462, atmo: 92, energy: 1.9, elements: 35, time: 4.5, color: "#e8cda0" },
  ];

  return (
    <div style={{ animation: "fadeUp .4s ease" }}>
      <h2 style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 28, fontWeight: 600, color: "#a8eef8", marginBottom: 6, letterSpacing: 2 }}>
        HABITABILITY LABORATORY
      </h2>
      <p style={{ color: "#6a9abf", marginBottom: 20, fontStyle: "italic", fontSize: 15 }}>
        Adjust planetary parameters and calculate the habitability score. Load solar system analogues to compare.
      </p>

      {/* Score display */}
      <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 24, padding: "16px 24px", borderRadius: 12, background: "rgba(10,28,50,.8)", border: `1px solid ${habColor}44` }}>
        <div style={{ position: "relative", width: 80, height: 80 }}>
          <svg width="80" height="80" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="40" cy="40" r="34" fill="none" stroke="#1a3a5a" strokeWidth="6"/>
            <circle cx="40" cy="40" r="34" fill="none" stroke={habColor} strokeWidth="6"
              strokeDasharray={`${(hab/100)*213.6} 213.6`} strokeLinecap="round"
              style={{ transition: "stroke-dasharray .5s ease, stroke .5s" }}/>
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 20, color: habColor }}>{hab}</div>
        </div>
        <div>
          <div style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 22, color: habColor, letterSpacing: 2 }}>{habLabel}</div>
          <div style={{ color: "#6a9abf", fontSize: 13, marginTop: 4 }}>Habitability Index (0–100)</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, flexWrap: "wrap" }}>
          {analogues.map(a => (
            <button key={a.name} onClick={() => setVals({ water: a.water, temp: a.temp, atmo: a.atmo, energy: a.energy, elements: a.elements, time: a.time })}
              style={{ padding: "5px 12px", borderRadius: 20, border: `1px solid ${a.color}66`, background: `${a.color}18`,
                color: a.color, fontFamily: "'Rajdhani',sans-serif", fontSize: 12, fontWeight: 600, cursor: "pointer", letterSpacing: .5 }}>
              {a.name}
            </button>
          ))}
        </div>
      </div>

      {/* Sliders */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {HABITABLE_PARAMS.map(p => (
          <div key={p.id} className="card" onClick={() => setSelected(selected === p.id ? null : p.id)}
            style={{ padding: "14px 16px", borderRadius: 10, background: "rgba(10,28,50,.7)", border: `1px solid ${selected===p.id?p.color+"88":"#1a3a5a"}`, cursor: "pointer" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span>{p.icon}</span>
                <span style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 600, fontSize: 14, color: p.color, letterSpacing: .5 }}>{p.label}</span>
              </div>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 13, color: "#a8eef8" }}>
                {p.id === "atmo" ? vals[p.id].toFixed(2) : p.id === "energy" ? vals[p.id].toFixed(2) : p.id === "temp" ? `${vals[p.id]}°C` : vals[p.id]}{p.unit && p.id!=="temp" ? ` ${p.unit}` : ""}
              </span>
            </div>
            <input type="range" className="hab-slider" min={p.min} max={p.max}
              step={p.id === "atmo" || p.id === "energy" ? 0.01 : p.id === "time" ? 0.1 : 1}
              value={vals[p.id]}
              onChange={e => setVals(v => ({ ...v, [p.id]: parseFloat(e.target.value) }))}
              style={{ accentColor: p.color }}
            />
            {selected === p.id && <p style={{ color: "#b0cfe0", fontSize: 12.5, lineHeight: 1.55, marginTop: 8, fontStyle: "italic" }}>{p.desc}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── EXOPLANET MAP ────────────────────────────────────────────────────────────
function ExoplanetMap() {
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? EXOPLANETS : filter === "hz" ? EXOPLANETS.filter(e => e.hz) : EXOPLANETS.filter(e => e.type === filter);

  const typeColors = { "earth-size": "#44cc88", "super-earth": "#4fa3e0", "sub-neptune": "#cc44aa" };
  const waterColors = { "detected": "#3a7abf", "likely": "#44cc88", "possible": "#f7c43a", "unknown": "#888", "none": "#ff5533" };

  return (
    <div style={{ animation: "fadeUp .4s ease" }}>
      <h2 style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 28, fontWeight: 600, color: "#a8eef8", marginBottom: 6, letterSpacing: 2 }}>
        HABITABLE ZONE EXOPLANETS
      </h2>
      <p style={{ color: "#6a9abf", marginBottom: 16, fontStyle: "italic", fontSize: 15 }}>
        Confirmed or candidate exoplanets in or near their star's habitable zone. Click any world to explore.
      </p>

      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {[["all","All"],["hz","HZ Only"],["earth-size","Earth-size"],["super-earth","Super-Earth"],["sub-neptune","Sub-Neptune"]].map(([k,l]) => (
          <button key={k} onClick={() => setFilter(k)} style={{
            padding: "5px 14px", borderRadius: 20, border: `1px solid ${filter===k?"#3ab4c8":"#1a3a5a"}`,
            background: filter===k?"rgba(58,180,200,.15)":"transparent",
            color: filter===k?"#a8eef8":"#6a9abf",
            fontFamily: "'Rajdhani',sans-serif", fontSize: 12, fontWeight: 600, cursor: "pointer", letterSpacing: .5,
          }}>{l}</button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Map */}
        <div style={{ position: "relative", height: 380, background: "rgba(5,15,30,.9)", borderRadius: 12, border: "1px solid #1a3a5a", overflow: "hidden" }}>
          {/* axes labels */}
          <div style={{ position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)", fontSize: 10, color: "#4a7090", fontFamily: "'JetBrains Mono',monospace" }}>
            ← Earth-like ── distance from HZ center ── far →
          </div>
          <div style={{ position: "absolute", top: "50%", left: 8, transform: "translateY(-50%) rotate(-90deg)", fontSize: 10, color: "#4a7090", fontFamily: "'JetBrains Mono',monospace", whiteSpace: "nowrap" }}>
            ← smaller ── size ── larger →
          </div>
          {/* HZ band */}
          <div style={{ position: "absolute", left: "15%", right: "35%", top: "20%", bottom: "20%", background: "rgba(68,200,136,.06)", borderRadius: 8, border: "1px dashed rgba(68,200,136,.2)" }} />
          <div style={{ position: "absolute", left: "15%", top: "20%", fontSize: 10, color: "rgba(68,200,136,.5)", fontFamily: "'JetBrains Mono',monospace", padding: "4px 6px" }}>HZ</div>

          {EXOPLANETS.map((p, i) => {
            const isVis = filtered.includes(p);
            return (
              <div key={i} className="exo-dot" onClick={() => setSelected(selected?.name === p.name ? null : p)}
                style={{
                  position: "absolute", left: `${p.x}%`, top: `${p.y}%`,
                  width: 10 + p.radius * 3, height: 10 + p.radius * 3,
                  borderRadius: "50%", transform: "translate(-50%,-50%)",
                  background: p.color,
                  border: selected?.name === p.name ? "2px solid white" : "none",
                  boxShadow: `0 0 ${selected?.name===p.name?16:6}px ${p.color}`,
                  opacity: isVis ? 1 : 0.18,
                  cursor: "pointer",
                  transition: "all .2s",
                }}>
                {p.hz && <div style={{ position: "absolute", inset: -3, borderRadius: "50%", border: `1px solid ${p.color}44`, animation: "pulse-glow 2s infinite" }}/>}
              </div>
            );
          })}
        </div>

        {/* Detail */}
        <div>
          {selected ? (
            <div style={{ padding: 20, borderRadius: 12, background: "rgba(10,28,50,.8)", border: `1px solid ${selected.color}55`, height: 380, overflowY: "auto" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                <div>
                  <h3 style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 22, color: selected.color, letterSpacing: 1 }}>{selected.name}</h3>
                  <div style={{ color: "#6a9abf", fontSize: 13 }}>{selected.star} · {selected.dist} ly away</div>
                </div>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: selected.color, boxShadow: `0 0 16px ${selected.color}` }}/>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
                {[
                  ["Type", selected.type],
                  ["Radius", `${selected.radius}× Earth`],
                  ["Avg Temp", `${selected.temp}°C`],
                  ["In HZ", selected.hz ? "✓ Yes" : "✗ No"],
                  ["Water", selected.water],
                  ["Distance", `${selected.dist} ly`],
                ].map(([k,v]) => (
                  <div key={k} style={{ padding: "6px 10px", borderRadius: 6, background: "rgba(0,0,0,.3)", border: "1px solid #1a3a5a" }}>
                    <div style={{ fontSize: 10, color: "#4a7090", fontFamily: "'JetBrains Mono',monospace", marginBottom: 2 }}>{k}</div>
                    <div style={{ fontSize: 13, color: "#c8dff5", fontFamily: "'Rajdhani',sans-serif", fontWeight: 600 }}>{v}</div>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 13.5, color: "#b0cfe0", lineHeight: 1.65, fontStyle: "italic" }}>{selected.desc}</p>
            </div>
          ) : (
            <div style={{ height: 380, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#3a6080", fontSize: 14, fontStyle: "italic", gap: 12 }}>
              <span style={{ fontSize: 40 }}>🔭</span>
              <span>Select a planet to explore</span>
              <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
                {[["water","Water"],["type","Type"]].map(([k,l]) => (
                  <div key={k}>
                    <div style={{ fontSize: 11, color: "#4a7090", marginBottom: 6, fontFamily: "'Rajdhani',sans-serif", letterSpacing: 1 }}>{l.toUpperCase()}</div>
                    {Object.entries(k==="water"?waterColors:typeColors).map(([val,col]) => (
                      <div key={val} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: col }}/>
                        <span style={{ fontSize: 11, color: "#6a9abf" }}>{val}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Planet grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 10, marginTop: 16 }}>
        {filtered.map((p, i) => (
          <div key={i} className="card" onClick={() => setSelected(selected?.name===p.name?null:p)}
            style={{ padding: "10px 14px", borderRadius: 8, background: selected?.name===p.name?`${p.color}18`:"rgba(10,28,50,.7)", border: `1px solid ${selected?.name===p.name?p.color+"66":"#1a3a5a"}`, cursor: "pointer", display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: p.color, boxShadow: `0 0 8px ${p.color}`, flexShrink: 0 }}/>
            <div>
              <div style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 600, fontSize: 13, color: p.color }}>{p.name}</div>
              <div style={{ fontSize: 11, color: "#4a7090" }}>{p.dist} ly · {p.type}</div>
            </div>
            {p.hz && <div style={{ marginLeft: "auto", fontSize: 10, color: "#44cc88", fontFamily: "'JetBrains Mono',monospace" }}>HZ</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── BIOSIGNATURES ────────────────────────────────────────────────────────────
function BiosignaturesModule() {
  const [selected, setSelected] = useState(BIOSIGNATURES[0]);

  return (
    <div style={{ animation: "fadeUp .4s ease" }}>
      <h2 style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 28, fontWeight: 600, color: "#a8eef8", marginBottom: 6, letterSpacing: 2 }}>
        BIOSIGNATURE CATALOG
      </h2>
      <p style={{ color: "#6a9abf", marginBottom: 20, fontStyle: "italic", fontSize: 15 }}>
        Chemical and physical markers that could indicate life — and how reliably we can detect them across interstellar distances.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 20 }}>
        {/* Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {BIOSIGNATURES.map(b => (
            <div key={b.id} className="biosig-btn" onClick={() => setSelected(b)}
              style={{ padding: "12px 14px", borderRadius: 10, background: selected.id===b.id?`${b.color}20`:"rgba(10,28,50,.7)", border: `1px solid ${selected.id===b.id?b.color+"88":"#1a3a5a"}`, cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 22 }}>{b.icon}</span>
              <div>
                <div style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 600, fontSize: 15, color: b.color, letterSpacing: .5 }}>{b.label}</div>
                <div style={{ fontSize: 11, color: "#4a7090", marginTop: 2 }}>Strength: {b.strength}%</div>
              </div>
            </div>
          ))}
        </div>

        {/* Detail */}
        {selected && (
          <div style={{ padding: 24, borderRadius: 12, background: "rgba(10,28,50,.8)", border: `1px solid ${selected.color}44` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
              <span style={{ fontSize: 40 }}>{selected.icon}</span>
              <div>
                <h3 style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 26, color: selected.color, letterSpacing: 1 }}>{selected.label}</h3>
                <div style={{ color: "#6a9abf", fontSize: 13 }}>Biosignature Gas / Feature</div>
              </div>
            </div>

            {/* Confidence bars */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: "#6a9abf", fontFamily: "'Rajdhani',sans-serif", letterSpacing: .5 }}>BIOSIGNATURE STRENGTH</span>
                  <span style={{ fontSize: 13, color: selected.color, fontFamily: "'JetBrains Mono',monospace" }}>{selected.strength}%</span>
                </div>
                <div style={{ height: 8, borderRadius: 4, background: "#0d1f3c" }}>
                  <div style={{ width: `${selected.strength}%`, height: "100%", borderRadius: 4, background: `linear-gradient(90deg,${selected.color}88,${selected.color})`, transition: "width .5s" }}/>
                </div>
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: "#6a9abf", fontFamily: "'Rajdhani',sans-serif", letterSpacing: .5 }}>FALSE POSITIVE RISK</span>
                  <span style={{ fontSize: 13, color: "#ff7755", fontFamily: "'JetBrains Mono',monospace" }}>{selected.false_pos}%</span>
                </div>
                <div style={{ height: 8, borderRadius: 4, background: "#0d1f3c" }}>
                  <div style={{ width: `${selected.false_pos}%`, height: "100%", borderRadius: 4, background: "linear-gradient(90deg,#ff445588,#ff7755)", transition: "width .5s" }}/>
                </div>
              </div>
            </div>

            <p style={{ fontSize: 14.5, color: "#c8dff5", lineHeight: 1.7, marginBottom: 16, fontStyle: "italic" }}>{selected.desc}</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ padding: "12px 14px", borderRadius: 8, background: "rgba(0,0,0,.3)", border: "1px solid #1a3a5a" }}>
                <div style={{ fontSize: 10, color: "#4a7090", fontFamily: "'JetBrains Mono',monospace", marginBottom: 6 }}>DETECTION METHOD</div>
                <div style={{ fontSize: 13, color: "#a8eef8", lineHeight: 1.55 }}>{selected.detection}</div>
              </div>
              <div style={{ padding: "12px 14px", borderRadius: 8, background: "rgba(0,0,0,.3)", border: "1px solid #1a3a5a" }}>
                <div style={{ fontSize: 10, color: "#4a7090", fontFamily: "'JetBrains Mono',monospace", marginBottom: 6 }}>EARTH EXAMPLE</div>
                <div style={{ fontSize: 13, color: "#a8eef8", lineHeight: 1.55 }}>{selected.earthExample}</div>
              </div>
            </div>

            {/* Spectrum mockup */}
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 11, color: "#4a7090", fontFamily: "'JetBrains Mono',monospace", marginBottom: 8 }}>ILLUSTRATIVE ABSORPTION SPECTRUM</div>
              <div style={{ height: 60, borderRadius: 6, background: "linear-gradient(90deg,#ff333388,#ff770044,#f7c43a66,#44cc8844,#3a7abf88,#8844cc66,#440088aa)", position: "relative", overflow: "hidden" }}>
                {[20,35,48,62,75,88].map((x,i) => (
                  <div key={i} style={{ position: "absolute", left: `${x}%`, top: 0, bottom: 0, width: i%2===0?3:2, background: i%3===0?selected.color:"rgba(255,255,255,.5)", opacity: 0.8 }}/>
                ))}
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "0 8px 4px", fontSize: 9, color: "rgba(255,255,255,.4)", fontFamily: "'JetBrains Mono',monospace" }}>
                  <span>UV 300nm</span><span>VIS 550nm</span><span>NIR 1μm</span><span>MIR 10μm</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── DRAKE EQUATION ──────────────────────────────────────────────────────────
function DrakeModule() {
  const defaults = Object.fromEntries(DRAKE_PARAMS.map(p => [p.id, p.default]));
  const [vals, setVals] = useState(defaults);
  const [selected, setSelected] = useState(null);

  const N = DRAKE_PARAMS.reduce((acc, p) => acc * vals[p.id], 1);

  const presets = [
    { name: "Optimistic", color: "#44cc88", vals: { R: 3, fp: 0.95, ne: 1, fl: 0.5, fi: 0.1, fc: 0.5, L: 1e6 } },
    { name: "Conservative", color: "#f7c43a", vals: { R: 1.5, fp: 0.9, ne: 0.3, fl: 0.01, fi: 0.001, fc: 0.1, L: 300 } },
    { name: "Rare Earth", color: "#ff7755", vals: { R: 1, fp: 0.9, ne: 0.1, fl: 0.001, fi: 0.00001, fc: 0.01, L: 100 } },
    { name: "Drake (1961)", color: "#4fa3e0", vals: { R: 10, fp: 0.5, ne: 2, fl: 1, fi: 0.01, fc: 0.01, L: 10000 } },
  ];

  const Ncolor = N > 10000 ? "#44cc88" : N > 100 ? "#f7c43a" : N > 1 ? "#f7a43a" : "#ff5533";

  function fmt(v) {
    if (v >= 1e9) return `${(v/1e9).toFixed(1)}B`;
    if (v >= 1e6) return `${(v/1e6).toFixed(1)}M`;
    if (v >= 1e3) return `${(v/1e3).toFixed(1)}K`;
    if (v >= 10) return v.toFixed(0);
    if (v >= 1) return v.toFixed(1);
    return v.toExponential(1);
  }

  return (
    <div style={{ animation: "fadeUp .4s ease" }}>
      <h2 style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 28, fontWeight: 600, color: "#a8eef8", marginBottom: 6, letterSpacing: 2 }}>
        THE DRAKE EQUATION
      </h2>
      <p style={{ color: "#6a9abf", marginBottom: 20, fontStyle: "italic", fontSize: 15 }}>
        Estimate N — the number of detectable civilizations in our galaxy — by tuning each factor.
      </p>

      {/* N display */}
      <div style={{ padding: "20px 28px", borderRadius: 12, background: "rgba(10,28,50,.9)", border: `1px solid ${Ncolor}44`, marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ fontSize: 11, color: "#4a7090", fontFamily: "'JetBrains Mono',monospace", marginBottom: 4 }}>ESTIMATED CIVILIZATIONS IN MILKY WAY</div>
          <div style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 52, color: Ncolor, lineHeight: 1, letterSpacing: 2, textShadow: `0 0 30px ${Ncolor}66` }}>
            N = {fmt(N)}
          </div>
          <div style={{ color: "#6a9abf", fontSize: 13, marginTop: 6 }}>
            {N < 1 ? "We may be alone in the galaxy." : N < 10 ? "Civilizations are extremely rare." : N < 1000 ? "A few may exist — but finding them is the challenge." : "The galaxy could be teeming with intelligence."}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {presets.map(pr => (
            <button key={pr.name} onClick={() => setVals(pr.vals)}
              style={{ padding: "7px 16px", borderRadius: 20, border: `1px solid ${pr.color}66`, background: `${pr.color}18`,
                color: pr.color, fontFamily: "'Rajdhani',sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              {pr.name}
            </button>
          ))}
        </div>
      </div>

      {/* Formula display */}
      <div style={{ padding: "10px 16px", borderRadius: 8, background: "rgba(0,0,0,.4)", border: "1px solid #1a3a5a", marginBottom: 20, overflowX: "auto" }}>
        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 13, color: "#6a9abf", whiteSpace: "nowrap" }}>
          N = R* × fp × ne × fl × fi × fc × L = {" "}
          {DRAKE_PARAMS.map((p,i) => (
            <span key={p.id}>
              <span style={{ color: "#f7c43a" }}>{p.id === "L" ? fmt(vals[p.id]) : vals[p.id] < 0.01 ? vals[p.id].toExponential(2) : vals[p.id] <= 1 ? vals[p.id].toFixed(3) : vals[p.id]}</span>
              {i < DRAKE_PARAMS.length-1 && <span style={{ color: "#4a7090" }}> × </span>}
            </span>
          ))}
          <span style={{ color: "#c8dff5" }}> = <span style={{ color: Ncolor, fontWeight: 700 }}>{fmt(N)}</span></span>
        </div>
      </div>

      {/* Sliders */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {DRAKE_PARAMS.map(p => (
          <div key={p.id} className="card" onClick={() => setSelected(selected===p.id?null:p.id)}
            style={{ padding: "14px 16px", borderRadius: 10, background: "rgba(10,28,50,.7)", border: `1px solid ${selected===p.id?"#f7c43a88":"#1a3a5a"}`, cursor: "pointer" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 13, color: "#f7c43a" }}>{p.id}</span>
                <span style={{ color: "#8ab0d0", fontSize: 12, marginLeft: 8 }}>{p.label}</span>
              </div>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 13, color: "#a8eef8" }}>
                {p.log ? fmt(vals[p.id]) : vals[p.id] <= 1 ? vals[p.id].toFixed(3) : vals[p.id]}
                {p.unit ? ` ${p.unit}` : ""}
              </span>
            </div>
            <input type="range" className="drake-slider"
              min={p.log ? Math.log10(p.min) : p.min}
              max={p.log ? Math.log10(p.max) : p.max}
              step={p.log ? 0.1 : p.id === "R" ? 0.1 : p.id === "ne" ? 0.05 : 0.001}
              value={p.log ? Math.log10(vals[p.id]) : vals[p.id]}
              onChange={e => setVals(v => ({ ...v, [p.id]: p.log ? Math.pow(10,parseFloat(e.target.value)) : parseFloat(e.target.value) }))}
            />
            {selected === p.id && <p style={{ color: "#b0cfe0", fontSize: 12.5, lineHeight: 1.55, marginTop: 8, fontStyle: "italic" }}>{p.desc}</p>}
          </div>
        ))}
      </div>

      {/* Fermi Paradox note */}
      <div style={{ marginTop: 20, padding: "16px 20px", borderRadius: 10, background: "rgba(247,164,58,.08)", border: "1px solid rgba(247,164,58,.3)" }}>
        <div style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 600, fontSize: 15, color: "#f7a43a", marginBottom: 8, letterSpacing: .5 }}>THE FERMI PARADOX</div>
        <p style={{ color: "#b0cfe0", fontSize: 13.5, lineHeight: 1.65, fontStyle: "italic" }}>
          If N is large, "Where is everybody?" The galaxy is 13 billion years old — enough time for a civilization to colonize every star system at sub-light speeds many times over. 
          The silence may mean: civilizations are rare (Rare Earth), they don't last long (Great Filter ahead or behind us), 
          they communicate differently (Dark Forest), or they're here and we haven't recognized them.
        </p>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("solarsystem");

  const modules = { solarsystem: SolarSystemModule, timeline: TimelineModule, habzone: HabitabilityLab, exo: ExoplanetMap, biosig: BiosignaturesModule, drake: DrakeModule };
  const Module = modules[tab];

  return (
    <div style={{ minHeight: "100vh", position: "relative" }}>
      <StarField count={200} />

      {/* Subtle scan line */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,transparent,rgba(58,180,200,.15),transparent)", animation: "scanline 8s linear infinite", zIndex: 1, pointerEvents: "none" }}/>

      {/* Header */}
      <header style={{ position: "relative", zIndex: 10, padding: "24px 32px 0", borderBottom: "1px solid #0d1f3c" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 4 }}>
            <h1 style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 32, color: "#a8eef8", letterSpacing: 4, lineHeight: 1 }}>
              ARE WE ALONE?
            </h1>
            <span style={{ fontFamily: "'Crimson Pro',serif", fontStyle: "italic", fontSize: 16, color: "#4a7090" }}>
              The Search for Life in the Universe
            </span>
          </div>
          <p style={{ color: "#3a6080", fontSize: 12, fontFamily: "'JetBrains Mono',monospace", marginBottom: 16, letterSpacing: .5 }}>
            ASTROBIOLOGY · ASTRONOMY · GEOLOGY · BIOLOGY · SETI
          </p>

          {/* Nav */}
          <nav style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {NAV_ITEMS.map(n => (
              <button key={n.id} className={`nav-btn ${tab===n.id?"active":""}`} onClick={() => setTab(n.id)}
                style={{ padding: "8px 18px", borderRadius: "8px 8px 0 0", border: "1px solid #1a3a5a", borderBottom: "none",
                  background: tab===n.id?"rgba(58,180,200,.12)":"transparent",
                  color: tab===n.id?"#a8eef8":"#4a7090",
                  fontFamily: "'Rajdhani',sans-serif", fontSize: 14, fontWeight: 600, letterSpacing: 1, cursor: "pointer" }}>
                <span style={{ marginRight: 6 }}>{n.icon}</span>{n.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Content */}
      <main style={{ position: "relative", zIndex: 5, maxWidth: 1200, margin: "0 auto", padding: "28px 32px 60px" }}>
        <Module key={tab} />
      </main>

      {/* Footer */}
      <footer style={{ position: "relative", zIndex: 5, textAlign: "center", padding: "16px", color: "#2a4a6a", fontSize: 11, fontFamily: "'JetBrains Mono',monospace", borderTop: "1px solid #0d1f3c" }}>
        Data sources: NASA Exoplanet Archive · TRAPPIST collaboration · JWST science papers · astrobiology.nasa.gov
      </footer>
    </div>
  );
}
