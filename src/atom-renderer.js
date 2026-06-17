export function renderAtomSvg(element) {
  const centerX = 210;
  const centerY = 184;
  const particleTotal = element.protons + element.neutrons;
  const shellRadii = particleTotal >= 34 ? [74, 116, 158] : [64, 104, 144];
  const visibleShells = normalizeShells(element.shells);
  const gradientIds = {
    proton: `protonGradient-${element.atomicNumber}`,
    neutron: `neutronGradient-${element.atomicNumber}`,
    electron: `electronGradient-${element.atomicNumber}`
  };
  const shellMarkup = shellRadii.map((radius, index) => `<circle data-shell="${index + 1}" cx="${centerX}" cy="${centerY}" r="${radius}" class="shell" />`).join("");
  const electronMarkup = visibleShells.flatMap((count, shellIndex) => drawElectrons(count, shellRadii[shellIndex], centerX, centerY, gradientIds.electron)).join("");
  const nucleusMarkup = drawNucleus(element.protons, element.neutrons, centerX, centerY, gradientIds);

  return `<svg class="atom-svg" viewBox="0 0 420 360" role="img" aria-label="${escapeHtml(element.name)} 원자 모형" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="${gradientIds.proton}" cx="35%" cy="30%"><stop offset="0%" stop-color="#e9fbff" /><stop offset="100%" stop-color="#7fc4d8" /></radialGradient>
    <radialGradient id="${gradientIds.neutron}" cx="35%" cy="30%"><stop offset="0%" stop-color="#fff8a8" /><stop offset="100%" stop-color="#d7c900" /></radialGradient>
    <radialGradient id="${gradientIds.electron}" cx="35%" cy="30%"><stop offset="0%" stop-color="#ffe4ee" /><stop offset="100%" stop-color="#df6f92" /></radialGradient>
  </defs>
  <rect width="420" height="360" fill="#fff" rx="18" />
  <text x="22" y="34" class="title">${escapeHtml(element.atomicNumber)} ${escapeHtml(element.name)} (${escapeHtml(element.symbol)})</text>
  ${shellMarkup}
  ${electronMarkup}
  <g class="nucleus">${nucleusMarkup}</g>
</svg>`;
}

function normalizeShells(shells) {
  const firstThree = shells.slice(0, 3);
  const overflow = shells.slice(3).reduce((sum, count) => sum + count, 0);
  if (overflow > 0) firstThree[2] = (firstThree[2] || 0) + overflow;
  return firstThree;
}

function drawElectrons(count, radius, centerX, centerY, electronGradientId) {
  return Array.from({ length: count }, (_, index) => {
    const angle = -90 + (360 / count) * index;
    const point = polarToPoint(centerX, centerY, radius, angle);
    return `<g class="electron" transform="translate(${point.x.toFixed(1)} ${point.y.toFixed(1)})"><circle r="13" fill="url(#${electronGradientId})" stroke="#cf5e82" stroke-width="1.2" /><text x="0" y="0" dy="-0.02em" text-anchor="middle" dominant-baseline="middle" alignment-baseline="middle" class="particle-sign minus">-</text></g>`;
  });
}

function drawNucleus(protons, neutrons, centerX, centerY, gradientIds) {
  const radius = protons + neutrons >= 34 ? 10 : 12;
  const neutronMarkup = Array.from({ length: neutrons }, (_, index) => {
    const point = nucleusPoint(index, centerX, centerY);
    return `<circle class="neutron" cx="${point.x.toFixed(1)}" cy="${point.y.toFixed(1)}" r="${radius}" fill="url(#${gradientIds.neutron})" stroke="#beb500" stroke-width="1" />`;
  }).join("");
  const protonMarkup = Array.from({ length: protons }, (_, index) => {
    const point = nucleusPoint(index + neutrons, centerX, centerY);
    return `<g class="proton" transform="translate(${point.x.toFixed(1)} ${point.y.toFixed(1)})"><circle r="${radius}" fill="url(#${gradientIds.proton})" stroke="#69abc1" stroke-width="1" /><text x="0" y="0" dy="0.04em" text-anchor="middle" dominant-baseline="middle" alignment-baseline="middle" class="particle-sign plus">+</text></g>`;
  }).join("");
  return `<g class="neutrons">${neutronMarkup}</g><g class="protons">${protonMarkup}</g>`;
}

function nucleusPoint(index, centerX, centerY) {
  if (index === 0) return { x: centerX, y: centerY };
  const ring = Math.ceil(Math.sqrt(index));
  const angle = index * 137.5;
  return polarToPoint(centerX, centerY, ring * 7.2, angle);
}

function polarToPoint(centerX, centerY, radius, angle) {
  const radians = (angle * Math.PI) / 180;
  return { x: centerX + Math.cos(radians) * radius, y: centerY + Math.sin(radians) * radius };
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]);
}
