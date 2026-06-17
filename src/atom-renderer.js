export function renderAtomSvg(element) {
  const centerX = 190;
  const centerY = 160;
  const shellRadii = [58, 96, 134];
  const visibleShells = normalizeShells(element.shells);
  const shellMarkup = shellRadii.map((radius, index) => `<circle data-shell="${index + 1}" cx="${centerX}" cy="${centerY}" r="${radius}" class="shell" />`).join("");
  const electronMarkup = visibleShells.flatMap((count, shellIndex) => drawElectrons(count, shellRadii[shellIndex], centerX, centerY)).join("");
  const nucleusMarkup = drawNucleus(element.protons, element.neutrons, centerX, centerY);

  return `<svg class="atom-svg" viewBox="0 0 420 320" role="img" aria-label="${escapeHtml(element.name)} 원자 모형" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="protonGradient" cx="35%" cy="30%"><stop offset="0%" stop-color="#e9fbff" /><stop offset="100%" stop-color="#7fc4d8" /></radialGradient>
    <radialGradient id="neutronGradient" cx="35%" cy="30%"><stop offset="0%" stop-color="#fff8a8" /><stop offset="100%" stop-color="#d7c900" /></radialGradient>
    <radialGradient id="electronGradient" cx="35%" cy="30%"><stop offset="0%" stop-color="#ffe4ee" /><stop offset="100%" stop-color="#df6f92" /></radialGradient>
  </defs>
  <rect width="420" height="320" fill="#fff" rx="18" />
  ${shellMarkup}
  ${electronMarkup}
  <g class="nucleus">${nucleusMarkup}</g>
  <text x="282" y="103" class="label">중성자</text>
  <line x1="260" y1="110" x2="215" y2="142" class="label-line" />
  <text x="284" y="176" class="label">원자핵</text>
  <path d="M268 128 h28 v76 h-28" class="brace" />
  <text x="46" y="232" class="label">양성자</text>
  <line x1="118" y1="214" x2="166" y2="176" class="label-line" />
  <text x="337" y="159" class="label">전자</text>
  <line x1="314" y1="152" x2="286" y2="152" class="label-line" />
  <text x="24" y="33" class="title">${escapeHtml(element.atomicNumber)} ${escapeHtml(element.name)} (${escapeHtml(element.symbol)})</text>
</svg>`;
}

function normalizeShells(shells) {
  const firstThree = shells.slice(0, 3);
  const overflow = shells.slice(3).reduce((sum, count) => sum + count, 0);
  if (overflow > 0) firstThree[2] = (firstThree[2] || 0) + overflow;
  return firstThree;
}

function drawElectrons(count, radius, centerX, centerY) {
  return Array.from({ length: count }, (_, index) => {
    const angle = -90 + (360 / count) * index;
    const point = polarToPoint(centerX, centerY, radius, angle);
    return `<g class="electron" transform="translate(${point.x.toFixed(1)} ${point.y.toFixed(1)})"><circle r="13" fill="url(#electronGradient)" stroke="#cf5e82" stroke-width="1.2" /><text y="5" text-anchor="middle" class="particle-sign">-</text></g>`;
  });
}

function drawNucleus(protons, neutrons, centerX, centerY) {
  const particles = [...Array.from({ length: protons }, () => ({ type: "proton" })), ...Array.from({ length: neutrons }, () => ({ type: "neutron" }))];
  const radius = particles.length > 28 ? 11 : 13;
  return particles.map((particle, index) => {
    const ring = Math.floor(Math.sqrt(index));
    const angle = index * 137.5;
    const point = polarToPoint(centerX, centerY, ring * 8.2, angle);
    if (particle.type === "proton") {
      return `<g class="proton" transform="translate(${point.x.toFixed(1)} ${point.y.toFixed(1)})"><circle r="${radius}" fill="url(#protonGradient)" stroke="#69abc1" stroke-width="1" /><text y="5" text-anchor="middle" class="particle-sign plus">+</text></g>`;
    }
    return `<circle class="neutron" cx="${point.x.toFixed(1)}" cy="${point.y.toFixed(1)}" r="${radius}" fill="url(#neutronGradient)" stroke="#beb500" stroke-width="1" />`;
  }).join("");
}

function polarToPoint(centerX, centerY, radius, angle) {
  const radians = (angle * Math.PI) / 180;
  return { x: centerX + Math.cos(radians) * radius, y: centerY + Math.sin(radians) * radius };
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]);
}
