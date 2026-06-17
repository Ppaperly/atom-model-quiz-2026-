export const ELEMENTS = [
  { atomicNumber: 1, symbol: "H", name: "수소", protons: 1, neutrons: 0, electrons: 1, shells: [1] },
  { atomicNumber: 2, symbol: "He", name: "헬륨", protons: 2, neutrons: 2, electrons: 2, shells: [2] },
  { atomicNumber: 3, symbol: "Li", name: "리튬", protons: 3, neutrons: 4, electrons: 3, shells: [2, 1] },
  { atomicNumber: 4, symbol: "Be", name: "베릴륨", protons: 4, neutrons: 5, electrons: 4, shells: [2, 2] },
  { atomicNumber: 5, symbol: "B", name: "붕소", protons: 5, neutrons: 6, electrons: 5, shells: [2, 3] },
  { atomicNumber: 6, symbol: "C", name: "탄소", protons: 6, neutrons: 6, electrons: 6, shells: [2, 4] },
  { atomicNumber: 7, symbol: "N", name: "질소", protons: 7, neutrons: 7, electrons: 7, shells: [2, 5] },
  { atomicNumber: 8, symbol: "O", name: "산소", protons: 8, neutrons: 8, electrons: 8, shells: [2, 6] },
  { atomicNumber: 9, symbol: "F", name: "플루오린", protons: 9, neutrons: 10, electrons: 9, shells: [2, 7] },
  { atomicNumber: 10, symbol: "Ne", name: "네온", protons: 10, neutrons: 10, electrons: 10, shells: [2, 8] },
  { atomicNumber: 11, symbol: "Na", name: "소듐(나트륨)", protons: 11, neutrons: 12, electrons: 11, shells: [2, 8, 1] },
  { atomicNumber: 12, symbol: "Mg", name: "마그네슘", protons: 12, neutrons: 12, electrons: 12, shells: [2, 8, 2] },
  { atomicNumber: 13, symbol: "Al", name: "알루미늄", protons: 13, neutrons: 14, electrons: 13, shells: [2, 8, 3] },
  { atomicNumber: 14, symbol: "Si", name: "규소", protons: 14, neutrons: 14, electrons: 14, shells: [2, 8, 4] },
  { atomicNumber: 15, symbol: "P", name: "인", protons: 15, neutrons: 16, electrons: 15, shells: [2, 8, 5] },
  { atomicNumber: 16, symbol: "S", name: "황", protons: 16, neutrons: 16, electrons: 16, shells: [2, 8, 6] },
  { atomicNumber: 17, symbol: "Cl", name: "염소", protons: 17, neutrons: 18, electrons: 17, shells: [2, 8, 7] },
  { atomicNumber: 18, symbol: "Ar", name: "아르곤", protons: 18, neutrons: 22, electrons: 18, shells: [2, 8, 8] },
  { atomicNumber: 19, symbol: "K", name: "포타슘(칼륨)", protons: 19, neutrons: 20, electrons: 19, shells: [2, 8, 8, 1] },
  { atomicNumber: 20, symbol: "Ca", name: "칼슘", protons: 20, neutrons: 20, electrons: 20, shells: [2, 8, 8, 2] }
];

export function getQuizPool() {
  return ELEMENTS.filter((element) => element.atomicNumber !== 14);
}

export function getSearchPool() {
  return [...ELEMENTS];
}

export function findElementByAtomicNumber(atomicNumber) {
  return ELEMENTS.find((element) => element.atomicNumber === Number(atomicNumber));
}

export function pickQuizElements(count = 3) {
  const pool = getQuizPool();
  return shuffle(pool).slice(0, count);
}

export function createBlankFields() {
  const identityFields = shuffle(["atomicNumber", "name", "symbol"]).slice(0, 2);
  const countField = Math.random() > 0.5 ? "protons" : "electrons";
  return [...identityFields, countField];
}

export function createQuestion(element) {
  return {
    element,
    blankFields: createBlankFields()
  };
}

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}
