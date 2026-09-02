export type MachineType = 'ALL' | 'CASTING' | 'METALIZE' | 'SLITTING' | 'REWIND' | 'SML' | string;
export type LabelStatus = 'PASS' | 'OK' | 'HOLD' | 'REJECT';
export type TreatmentSide = 'INSIDE' | 'OUTSIDE' | 'CORONA' | 'PLASMA' | 'NONE' | string;

export interface RollLabel {
  id?: number;
  uniqId: string;
  supplier?: string;
  spk: string;
  tanggal: string;
  tanggalShift?: string;
  tanggalManual?: string;
  mesin: string;
  jenis: string;
  type: string;
  kode: string;
  thickness: string | number;
  width: string | number;
  length: string | number;
  meter?: string | number;
  joint?: string | number;
  netto: string | number;
  paperCore?: string | number;
  diameterCore?: string | number;
  kodePack?: string;
  subKodeType?: 'numeric' | 'reject' | 'hold' | string;
  subKodeNumeric?: string;
  subKode?: string;
  status: LabelStatus;
  treatment?: TreatmentSide;
  od?: string;
  lot: string;
  turunan?: string;
  operator?: string;
  kodeOperator?: string;
  keterangan?: string;
  jenisPrint?: string;
  verified?: number;
  verifiedAt?: string | null;
  verifiedBy?: string | null;
  synced?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface LabelStatistics {
  total: number;
  slitting: number;
  rewind: number;
  sml: number;
  statusPass: number;
  statusHold: number;
  statusReject: number;
  totalBerat: string;
}

export interface MachineSheet {
  id: string;
  label: string;
  shortLabel: string;
}
