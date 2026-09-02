export interface WipRoll {
  id?: number;
  uuid: string;
  tanggalInput?: string;
  tanggalSpk?: string;
  spk: string;
  lot: string;
  jenis: string;
  kodeFormula: string;
  thickness: string | number;
  width: string | number;
  length: string | number;
  core: string | number;
  od?: string;
  tanda?: string;
  beratTeori: number;
  beratAktual: number;
  lokasiAktif: string;
  posisiAktif: string;
  descriptionNav: string;
  descriptionExcel: string;
  keterangan?: string;
  status: 'AVAILABLE' | 'CONSUMED' | 'HOLD' | string;
  createdAt?: string;
  updatedAt?: string;
}
