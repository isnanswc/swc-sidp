export interface FilmConfig {
  id?: number;
  jenis: string;
  kodeFormula: string;
  tipeBahan: string;
  jenisBahan: string;
  kategoriFilm: string;
  keterangan: string;
  supplier: string;
  density: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface OperatorItem {
  id?: number;
  nama: string;
  mesin: string;
  kodeGrup: string;
  kodeOperator: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface MesinItem {
  id?: number;
  nama: string;
  praKodePack?: string;
  active: boolean;
  createdAt?: string;
}

export interface LabelSign {
  id?: number;
  name: string;
  triggerType: string;
  triggerValue: string;
  badgeText: string;
  textColor: string;
  bgColor: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}
