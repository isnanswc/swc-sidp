export interface DeReportChildRoll {
  turunan: string;
  subKode: string;
  netto: number | string;
  width: number | string;
  status: 'PASS' | 'HOLD' | 'REJECT';
  keterangan?: string;
  operator?: string;
  kodeOperator?: string;
  verified?: number;
}

export interface DeReportParentRoll {
  lot: string;
  spk: string;
  mesin: string;
  tanggal: string;
  jenis: string;
  kode: string;
  type: string;
  thickness: number | string;
  width: number | string;
  length: number | string;
  nettoTeori?: number | string;
  beratParentAktual?: number | string;
  children: DeReportChildRoll[];
  totalChildNetto: number;
  selisihNetto: number;
  wasteKg?: number;
  status: 'COMPLETE' | 'PARTIAL' | 'UNVERIFIED';
}
