import { defineStore } from 'pinia';
import { db, getSetting, saveSetting } from '@/db';

// ── DEFAULT SEED DATA ──────────────────────────────────────────────────────────

export function getDefaultFilmAlias(jenis, kodeFormula) {
  const j = (jenis || '').trim().toUpperCase();
  const f = (kodeFormula || '').trim().toUpperCase();

  if (j === 'CPP') {
    if (f.startsWith('M')) {
      return 'TPMGS';
    }
    return 'TPTGS';
  }
  if (j === 'VMCPP') {
    if (f.startsWith('M')) {
      return 'TPMF';
    }
    return '';
  }
  return '';
}

const DEFAULT_FILM_CONFIGS = [
  { jenis: 'CPP', kodeFormula: 'M01', alias: 'TPMGS', tipeBahan: 'LG', jenisBahan: 'Transparent', kategoriFilm: 'POLOS', density: 0.91, supplier: 'INHOUSE' },
  { jenis: 'CPP', kodeFormula: 'M02', alias: 'TPMGS', tipeBahan: 'LG', jenisBahan: 'Transparent', kategoriFilm: 'POLOS', density: 0.91, supplier: 'INHOUSE' },
  { jenis: 'CPP', kodeFormula: 'M04', alias: 'TPMGS', tipeBahan: 'LG', jenisBahan: 'Transparent', kategoriFilm: 'POLOS', density: 0.91, supplier: 'INHOUSE' },
  { jenis: 'CPP', kodeFormula: 'M06', alias: 'TPMGS', tipeBahan: 'LG', jenisBahan: 'Transparent', kategoriFilm: 'POLOS', density: 0.91, supplier: 'INHOUSE' },
  { jenis: 'CPP', kodeFormula: 'M07', alias: 'TPMGS', tipeBahan: 'LG', jenisBahan: 'Transparent', kategoriFilm: 'POLOS', density: 0.91, supplier: 'INHOUSE' },
  { jenis: 'CPP', kodeFormula: 'M08', alias: 'TPMGS', tipeBahan: 'LG', jenisBahan: 'Transparent', kategoriFilm: 'POLOS', density: 0.91, supplier: 'INHOUSE' },
  { jenis: 'CPP', kodeFormula: 'M09', alias: 'TPMGS', tipeBahan: 'LG', jenisBahan: 'Transparent', kategoriFilm: 'POLOS', density: 0.91, supplier: 'INHOUSE' },
  { jenis: 'CPP', kodeFormula: 'M11', alias: 'TPMGS', tipeBahan: 'LG', jenisBahan: 'Transparent', kategoriFilm: 'POLOS', density: 0.91, supplier: 'INHOUSE' },
  { jenis: 'CPP', kodeFormula: 'M12', alias: 'TPMGS', tipeBahan: 'LG', jenisBahan: 'Transparent', kategoriFilm: 'POLOS', density: 0.91, supplier: 'INHOUSE' },
  { jenis: 'CPP', kodeFormula: 'M13', alias: 'TPMGS', tipeBahan: 'LG', jenisBahan: 'Transparent', kategoriFilm: 'POLOS', density: 0.91, supplier: 'INHOUSE' },
  { jenis: 'CPP', kodeFormula: 'M14', alias: 'TPMGS', tipeBahan: 'LG', jenisBahan: 'Transparent', kategoriFilm: 'POLOS', density: 0.91, supplier: 'INHOUSE' },
  { jenis: 'CPP', kodeFormula: 'M15', alias: 'TPMGS', tipeBahan: 'LG', jenisBahan: 'Transparent', kategoriFilm: 'POLOS', density: 0.91, supplier: 'INHOUSE' },
  { jenis: 'CPP', kodeFormula: 'M16', alias: 'TPMGS', tipeBahan: 'LG', jenisBahan: 'Transparent', kategoriFilm: 'POLOS', density: 0.91, supplier: 'INHOUSE' },
  { jenis: 'CPP', kodeFormula: 'M18', alias: 'TPMGS', tipeBahan: 'LG', jenisBahan: 'Transparent', kategoriFilm: 'POLOS', density: 0.91, supplier: 'INHOUSE' },
  { jenis: 'CPP', kodeFormula: 'M23', alias: 'TPMGS', tipeBahan: 'LG', jenisBahan: 'Transparent', kategoriFilm: 'POLOS', density: 0.91, supplier: 'INHOUSE' },
  { jenis: 'CPP', kodeFormula: 'M24', alias: 'TPMGS', tipeBahan: 'LG', jenisBahan: 'Transparent', kategoriFilm: 'POLOS', density: 0.91, supplier: 'INHOUSE' },
  { jenis: 'CPP', kodeFormula: 'M25', alias: 'TPMGS', tipeBahan: 'LG', jenisBahan: 'Transparent', kategoriFilm: 'POLOS', density: 0.91, supplier: 'INHOUSE' },
  { jenis: 'CPP', kodeFormula: 'M26', alias: 'TPMGS', tipeBahan: 'LG', jenisBahan: 'Transparent', kategoriFilm: 'POLOS', density: 0.91, supplier: 'INHOUSE' },
  { jenis: 'CPP', kodeFormula: 'M27', alias: 'TPMGS', tipeBahan: 'LG', jenisBahan: 'Transparent', kategoriFilm: 'POLOS', density: 0.91, supplier: 'INHOUSE' },
  { jenis: 'CPP', kodeFormula: 'M28', alias: 'TPMGS', tipeBahan: 'LG', jenisBahan: 'Transparent', kategoriFilm: 'POLOS', density: 0.91, supplier: 'INHOUSE' },
  { jenis: 'CPP', kodeFormula: 'M29', alias: 'TPMGS', tipeBahan: 'LG', jenisBahan: 'Transparent', kategoriFilm: 'POLOS', density: 0.91, supplier: 'INHOUSE' },
  { jenis: 'CPP', kodeFormula: 'M30', alias: 'TPMGS', tipeBahan: 'LG', jenisBahan: 'Transparent', kategoriFilm: 'POLOS', density: 0.91, supplier: 'INHOUSE' },
  { jenis: 'CPP', kodeFormula: 'M31', alias: 'TPMGS', tipeBahan: 'LG', jenisBahan: 'Transparent', kategoriFilm: 'POLOS', density: 0.91, supplier: 'INHOUSE' },
  { jenis: 'CPP', kodeFormula: 'M32', alias: 'TPMGS', tipeBahan: 'LG', jenisBahan: 'Transparent', kategoriFilm: 'POLOS', density: 0.91, supplier: 'INHOUSE' },
  { jenis: 'CPP', kodeFormula: 'M33', alias: 'TPMGS', tipeBahan: 'LG', jenisBahan: 'Transparent', kategoriFilm: 'POLOS', density: 0.91, supplier: 'INHOUSE' },
  { jenis: 'CPP', kodeFormula: 'M34', alias: 'TPMGS', tipeBahan: 'LG', jenisBahan: 'Transparent', kategoriFilm: 'POLOS', density: 0.91, supplier: 'INHOUSE' },
  { jenis: 'CPP', kodeFormula: 'M35', alias: 'TPMGS', tipeBahan: 'LG', jenisBahan: 'Transparent', kategoriFilm: 'POLOS', density: 0.91, supplier: 'INHOUSE' },
  { jenis: 'CPP', kodeFormula: 'M36', alias: 'TPMGS', tipeBahan: 'LG', jenisBahan: 'Transparent', kategoriFilm: 'POLOS', density: 0.91, supplier: 'INHOUSE' },
  { jenis: 'CPP', kodeFormula: 'M37', alias: 'TPMGS', tipeBahan: 'LG', jenisBahan: 'Transparent', kategoriFilm: 'POLOS', density: 0.91, supplier: 'INHOUSE' },
  { jenis: 'CPP', kodeFormula: 'M38', alias: 'TPMGS', tipeBahan: 'LG', jenisBahan: 'Transparent', kategoriFilm: 'POLOS', density: 0.91, supplier: 'INHOUSE' },
  { jenis: 'CPP', kodeFormula: 'M39', alias: 'TPMGS', tipeBahan: 'LG', jenisBahan: 'Transparent', kategoriFilm: 'POLOS', density: 0.91, supplier: 'INHOUSE' },
  { jenis: 'CPP', kodeFormula: 'L01', alias: 'TPTGS', tipeBahan: 'MG', jenisBahan: 'Matte', kategoriFilm: 'POLOS', density: 0.91, supplier: 'INHOUSE' },
  { jenis: 'CPP', kodeFormula: 'L02', alias: 'TPTGS', tipeBahan: 'MG', jenisBahan: 'Matte', kategoriFilm: 'POLOS', density: 0.91, supplier: 'INHOUSE' },
  { jenis: 'CPP', kodeFormula: 'L03', alias: 'TPTGS', tipeBahan: 'MG', jenisBahan: 'Matte', kategoriFilm: 'POLOS', density: 0.91, supplier: 'INHOUSE' },
  { jenis: 'VMCPP', kodeFormula: 'M01', alias: 'TPMF', tipeBahan: 'LG', jenisBahan: 'Metalized', kategoriFilm: 'METAL', density: 0.91, supplier: 'INHOUSE' },
  { jenis: 'VMCPP', kodeFormula: 'M02', alias: 'TPMF', tipeBahan: 'LG', jenisBahan: 'Metalized', kategoriFilm: 'METAL', density: 0.91, supplier: 'INHOUSE' },
  { jenis: 'VMCPP', kodeFormula: 'M07', alias: 'TPMF', tipeBahan: 'LG', jenisBahan: 'Metalized', kategoriFilm: 'METAL', density: 0.91, supplier: 'INHOUSE' },
  { jenis: 'VMCPP', kodeFormula: 'M08', alias: 'TPMF', tipeBahan: 'LG', jenisBahan: 'Metalized', kategoriFilm: 'METAL', density: 0.91, supplier: 'INHOUSE' },
  { jenis: 'VMCPP', kodeFormula: 'M09', alias: 'TPMF', tipeBahan: 'LG', jenisBahan: 'Metalized', kategoriFilm: 'METAL', density: 0.91, supplier: 'INHOUSE' },
  { jenis: 'VMCPP', kodeFormula: 'M13', alias: 'TPMF', tipeBahan: 'LG', jenisBahan: 'Metalized', kategoriFilm: 'METAL', density: 0.91, supplier: 'INHOUSE' },
  { jenis: 'VMCPP', kodeFormula: 'M14', alias: 'TPMF', tipeBahan: 'LG', jenisBahan: 'Metalized', kategoriFilm: 'METAL', density: 0.91, supplier: 'INHOUSE' },
  { jenis: 'VMCPP', kodeFormula: 'M15', alias: 'TPMF', tipeBahan: 'LG', jenisBahan: 'Metalized', kategoriFilm: 'METAL', density: 0.91, supplier: 'INHOUSE' },
  { jenis: 'VMCPP', kodeFormula: 'M16', alias: 'TPMF', tipeBahan: 'LG', jenisBahan: 'Metalized', kategoriFilm: 'METAL', density: 0.91, supplier: 'INHOUSE' },
  { jenis: 'VMCPP', kodeFormula: 'M25', alias: 'TPMF', tipeBahan: 'LG', jenisBahan: 'Metalized', kategoriFilm: 'METAL', density: 0.91, supplier: 'INHOUSE' },
  { jenis: 'VMCPP', kodeFormula: 'M26', alias: 'TPMF', tipeBahan: 'LG', jenisBahan: 'Metalized', kategoriFilm: 'METAL', density: 0.91, supplier: 'INHOUSE' },
  { jenis: 'VMCPP', kodeFormula: 'M27', alias: 'TPMF', tipeBahan: 'LG', jenisBahan: 'Metalized', kategoriFilm: 'METAL', density: 0.91, supplier: 'INHOUSE' },
  { jenis: 'VMCPP', kodeFormula: 'M28', alias: 'TPMF', tipeBahan: 'LG', jenisBahan: 'Metalized', kategoriFilm: 'METAL', density: 0.91, supplier: 'INHOUSE' },
  { jenis: 'VMCPP', kodeFormula: 'M30', alias: 'TPMF', tipeBahan: 'LG', jenisBahan: 'Metalized', kategoriFilm: 'METAL', density: 0.91, supplier: 'INHOUSE' },
  { jenis: 'VMCPP', kodeFormula: 'M31', alias: 'TPMF', tipeBahan: 'LG', jenisBahan: 'Metalized', kategoriFilm: 'METAL', density: 0.91, supplier: 'INHOUSE' },
  { jenis: 'VMCPP', kodeFormula: 'M32', alias: 'TPMF', tipeBahan: 'LG', jenisBahan: 'Metalized', kategoriFilm: 'METAL', density: 0.91, supplier: 'INHOUSE' },
  { jenis: 'VMCPP', kodeFormula: 'M33', alias: 'TPMF', tipeBahan: 'LG', jenisBahan: 'Metalized', kategoriFilm: 'METAL', density: 0.91, supplier: 'INHOUSE' },
  { jenis: 'VMCPP', kodeFormula: 'M34', alias: 'TPMF', tipeBahan: 'LG', jenisBahan: 'Metalized', kategoriFilm: 'METAL', density: 0.91, supplier: 'INHOUSE' },
  { jenis: 'VMCPP', kodeFormula: 'M35', alias: 'TPMF', tipeBahan: 'LG', jenisBahan: 'Metalized', kategoriFilm: 'METAL', density: 0.91, supplier: 'INHOUSE' },
  { jenis: 'VMCPP', kodeFormula: 'M36', alias: 'TPMF', tipeBahan: 'LG', jenisBahan: 'Metalized', kategoriFilm: 'METAL', density: 0.91, supplier: 'INHOUSE' },
  { jenis: 'VMCPP', kodeFormula: 'M37', alias: 'TPMF', tipeBahan: 'LG', jenisBahan: 'Metalized', kategoriFilm: 'METAL', density: 0.91, supplier: 'INHOUSE' },
  { jenis: 'VMCPP', kodeFormula: 'M38', alias: 'TPMF', tipeBahan: 'LG', jenisBahan: 'Metalized', kategoriFilm: 'METAL', density: 0.91, supplier: 'INHOUSE' },
  { jenis: 'PET', kodeFormula: 'M01', alias: '', tipeBahan: 'PET', jenisBahan: 'Transparent', kategoriFilm: 'POLOS', density: 1.4, supplier: 'INHOUSE' },
  { jenis: 'VMPET', kodeFormula: 'M01', alias: '', tipeBahan: 'PET', jenisBahan: 'Metalized', kategoriFilm: 'METAL', density: 1.4, supplier: 'INHOUSE' },
  { jenis: 'LLDPE', kodeFormula: 'M01', alias: '', tipeBahan: 'PE', jenisBahan: 'Transparent', kategoriFilm: 'POLOS', density: 0.92, supplier: 'INHOUSE' },
];

const DEFAULT_OPERATORS = [
  { nama: 'SUDARMAJI', mesin: 'CASTING', kodeGrup: 'A', kodeOperator: 'A', active: true },
  { nama: 'AHMAD', mesin: 'CASTING', kodeGrup: 'B', kodeOperator: 'B', active: true },
  { nama: 'BAMBANG', mesin: 'CASTING', kodeGrup: 'C', kodeOperator: 'C', active: true },
  { nama: 'TUKIMIN', mesin: 'METALIZE', kodeGrup: 'D', kodeOperator: 'D', active: true },
  { nama: 'FIRMAN', mesin: 'METALIZE', kodeGrup: 'E', kodeOperator: 'E', active: true },
  { nama: 'ANWAR', mesin: 'METALIZE', kodeGrup: 'F', kodeOperator: 'F', active: true },
  { nama: 'HENDRA', mesin: 'SLITTING', kodeGrup: 'A', kodeOperator: 'H', active: true },
  { nama: 'GUNAWAN', mesin: 'SLITTING', kodeGrup: 'B', kodeOperator: 'G', active: true },
  { nama: 'WAHYU', mesin: 'SLITTING', kodeGrup: 'C', kodeOperator: 'W', active: true },
  { nama: 'JOKO', mesin: 'REWIND', kodeGrup: 'A', kodeOperator: 'J', active: true },
  { nama: 'KURNIA', mesin: 'REWIND', kodeGrup: 'B', kodeOperator: 'K', active: true },
  { nama: 'LUKMAN', mesin: 'REWIND', kodeGrup: 'C', kodeOperator: 'L', active: true },
];

const DEFAULT_MESIN = [
  { nama: 'CASTING', praKodePack: '', active: true },
  { nama: 'METALIZE', praKodePack: '', active: true },
  { nama: 'SLITTING', praKodePack: '', active: true },
  { nama: 'REWIND', praKodePack: 'R', active: true },
];

const DEFAULT_LABEL_SIGNS = [
  {
    name: 'B-Grade Film',
    triggerType: 'custom_bgrade',
    triggerValue: 'B-GRADE',
    badgeText: 'B-GRADE',
    textColor: '#ffffff',
    bgColor: '#4c1d95', // Ungu Tua
    active: true
  },
  {
    name: 'Inline Casting / SML',
    triggerType: 'mesin',
    triggerValue: 'CASTING, SML',
    badgeText: 'INLINE SML',
    textColor: '#ffffff',
    bgColor: '#15803d', // Hijau
    active: true
  }
];

const DEFAULT_LOCATIONS = [
  { nama: 'RAK A1A2', jenis: 'WIP JUMBO', alias: 'A1, A2, A1A2, *A1, *A2, *A1A2, RAK A1, RAK A2', kapasitas: 12, keterangan: 'Rak penyimpanan Roll Jumbo WIP A1-A2', active: true },
  { nama: 'RAK A3A4', jenis: 'WIP JUMBO', alias: 'A3, A4, A3A4, *A3, *A4, *A3A4, RAK A3, RAK A4', kapasitas: 12, keterangan: 'Rak penyimpanan Roll Jumbo WIP A3-A4', active: true },
  { nama: 'RAK B1B2', jenis: 'WIP JUMBO', alias: 'B1, B2, B1B2, *B1, *B2, *B1B2, RAK B1, RAK B2', kapasitas: 12, keterangan: 'Rak penyimpanan Roll Jumbo WIP B1-B2', active: true },
  { nama: 'RAK B3B4', jenis: 'WIP JUMBO', alias: 'B3, B4, B3B4, *B3, *B4, *B3B4, RAK B3, RAK B4', kapasitas: 12, keterangan: 'Rak penyimpanan Roll Jumbo WIP B3-B4', active: true },
  { nama: 'RAK C1C2', jenis: 'WIP JUMBO', alias: 'C1, C2, C1C2, *C1, *C2, *C1C2, RAK C1, RAK C2', kapasitas: 12, keterangan: 'Rak penyimpanan Roll Jumbo WIP C1-C2', active: true },
  { nama: 'RAK C3C4', jenis: 'WIP JUMBO', alias: 'C3, C4, C3C4, *C3, *C4, *C3C4, RAK C3, RAK C4', kapasitas: 12, keterangan: 'Rak penyimpanan Roll Jumbo WIP C3-C4', active: true },
  { nama: 'RAK D1D2', jenis: 'WIP JUMBO', alias: 'D1, D2, D1D2, *D1, *D2, *D1D2, RAK D1, RAK D2', kapasitas: 12, keterangan: 'Rak penyimpanan Roll Jumbo WIP D1-D2', active: true },
  { nama: 'RAK D3D4', jenis: 'WIP JUMBO', alias: 'D3, D4, D3D4, *D3, *D4, *D3D4, RAK D3, RAK D4', kapasitas: 12, keterangan: 'Rak penyimpanan Roll Jumbo WIP D3-D4', active: true },
  { nama: 'RAK G1G2', jenis: 'WIP JUMBO', alias: 'G1, G2, G1G2, *G1, *G2, *G1G2, RAK G1, RAK G2', kapasitas: 12, keterangan: 'Rak penyimpanan Roll Jumbo WIP G1-G2', active: true },
  { nama: 'RAK G3G4', jenis: 'WIP JUMBO', alias: 'G3, G4, G3G4, *G3, *G4, *G3G4, RAK G3, RAK G4', kapasitas: 12, keterangan: 'Rak penyimpanan Roll Jumbo WIP G3-G4', active: true },
  { nama: 'RAK H1H2', jenis: 'WIP JUMBO', alias: 'H1, H2, H1H2, *H1, *H2, *H1H2, RAK H1, RAK H2', kapasitas: 12, keterangan: 'Rak penyimpanan Roll Jumbo WIP H1-H2', active: true },
  { nama: 'RAK H3H4', jenis: 'WIP JUMBO', alias: 'H3, H4, H3H4, *H3, *H4, *H3H4, RAK H3, RAK H4', kapasitas: 12, keterangan: 'Rak penyimpanan Roll Jumbo WIP H3-H4', active: true },
  { nama: 'STAGING', jenis: 'WIP JUMBO', alias: 'STAGING, TRANSIT, TRANSIT JUMBO, AREA STAGING, 0', kapasitas: 20, keterangan: 'Area staging transit roll jumbo casting/metalize', active: true },
  { nama: 'RAK A1', jenis: 'ROLL FG', alias: 'A1, FG-A1', kapasitas: 24, keterangan: 'Rak khusus Roll Finish Goods / Produk Jadi A1', active: true },
  { nama: 'RAK A2', jenis: 'ROLL FG', alias: 'A2, FG-A2', kapasitas: 24, keterangan: 'Rak khusus Roll Finish Goods / Produk Jadi A2', active: true },
  { nama: 'RAK B1', jenis: 'ROLL FG', alias: 'B1, FG-B1', kapasitas: 24, keterangan: 'Rak khusus Roll Finish Goods / Produk Jadi B1', active: true },
  { nama: 'RAK B2', jenis: 'ROLL FG', alias: 'B2, FG-B2', kapasitas: 24, keterangan: 'Rak khusus Roll Finish Goods / Produk Jadi B2', active: true },
];

export const DEFAULT_STANDARD_LENGTHS = [
  { thickness: 12, maxPanjangFg: 12000, maxPanjangJumbo: 36300, active: true },
  { thickness: 20, maxPanjangFg: 12000, maxPanjangJumbo: 36300, active: true },
  { thickness: 25, maxPanjangFg: 12000, maxPanjangJumbo: 29300, active: true },
  { thickness: 30, maxPanjangFg: 12000, maxPanjangJumbo: 24300, active: true },
  { thickness: 35, maxPanjangFg: 12000, maxPanjangJumbo: 20500, active: true },
  { thickness: 40, maxPanjangFg: 8000, maxPanjangJumbo: 16300, active: true },
  { thickness: 50, maxPanjangFg: 6000, maxPanjangJumbo: 12300, active: true },
  { thickness: 60, maxPanjangFg: 6000, maxPanjangJumbo: 12300, active: true },
];

export function normalizeResinName(name) {
  if (!name) return '';
  return String(name).trim().replace(/\s+/g, '-').toUpperCase();
}

export const DEFAULT_RESIN_ITEMS = [
  { resin: 'F600F', kode: 'HM01', nomorItem: '1140102000001' },
  { resin: 'PPH-GF-08', kode: 'HM01', nomorItem: '1140102000001' },
  { resin: 'HD-601-CF', kode: 'HM01', nomorItem: '1140102000001' },
  { resin: 'HF8.0CM', kode: 'HM01', nomorItem: '1140102000001' },
  { resin: 'PPH-FCP80', kode: 'HM01', nomorItem: '1140102000001' },
  { resin: 'HA-510-M', kode: 'HM01', nomorItem: '1140102000001' },
  { resin: 'HD-915-CF', kode: 'HM02', nomorItem: '1140102000002' },
  { resin: 'FL-7541', kode: 'CM01', nomorItem: '1140202000001' },
  { resin: 'FL-7322', kode: 'CM01', nomorItem: '1140202000001' },
  { resin: 'RD-265-CF', kode: 'CM01', nomorItem: '1140202000001' },
  { resin: 'FL-7540-L', kode: 'CM01', nomorItem: '1140202000001' },
  { resin: 'FL-7642', kode: 'CM02', nomorItem: '1140202000002' },
  { resin: 'TF-451', kode: 'CM02', nomorItem: '1140202000002' },
  { resin: 'RD-368-CF', kode: 'CM02', nomorItem: '1140202000002' },
  { resin: 'RP-215-MYB', kode: 'CM02', nomorItem: '1140202000002' },
  { resin: 'FL-7632-L', kode: 'CC01', nomorItem: '1140201000001' },
  { resin: 'RP-215-MXB', kode: 'CC01', nomorItem: '1140201000001' },
  { resin: 'L6000N', kode: 'CC01', nomorItem: '1140201000001' },
  { resin: 'TF-403', kode: 'CC01', nomorItem: '1140201000001' },
  { resin: 'ABVT-22-NSC', kode: 'AM01', nomorItem: '1140302000001' },
  { resin: 'DF-8200', kode: 'AM02', nomorItem: '1140302000002' },
  { resin: 'ENABLE-2010', kode: 'AM03', nomorItem: '1140302000003' },
  { resin: 'EXCEED-3518', kode: 'AM04', nomorItem: '1140302000004' },
  { resin: 'ABPP-05-SC', kode: 'AC01', nomorItem: '1140301000001' },
  { resin: 'SPER-6', kode: 'AC02', nomorItem: '1140301000002' },
  { resin: 'VISTAMAXX-3588', kode: 'CC02', nomorItem: '1140201000002' },
  { resin: 'P8555-SCF', kode: 'AC03', nomorItem: '1140301000003' },
  { resin: 'P8377-SCF', kode: 'AC03', nomorItem: '1140301000003' },
  { resin: 'EVALENE', kode: 'N/A', nomorItem: '' },
  { resin: 'MATIF-105A', kode: 'N/A', nomorItem: '' },
  { resin: 'M6000N', kode: 'CM02', nomorItem: '1140202000002' },
  { resin: 'CPS-585-AK', kode: 'N/A', nomorItem: '' },
  { resin: 'SINOPEC-PPH-F08MX', kode: 'N/A', nomorItem: '' },
  { resin: 'RD-208', kode: 'N/A', nomorItem: '' },
];

export const DEFAULT_BOM_FORMULAS = [
  { formula: 'L01', rm: 'F600F', persen: 76.70 },
  { formula: 'L01', rm: 'ABPP-05-SC', persen: 0.99 },
  { formula: 'L01', rm: 'FL-7632-L', persen: 22.02 },
  { formula: 'L01', rm: 'SPER-6', persen: 0.29 },
  { formula: 'L02', rm: 'SINOPEC-PPH-F08MX', persen: 76.23 },
  { formula: 'L02', rm: 'SPER-6', persen: 0.62 },
  { formula: 'L02', rm: 'ABPP-05-SC', persen: 0.38 },
  { formula: 'L02', rm: 'FL-7632-L', persen: 22.77 },
  { formula: 'L03', rm: 'F600F', persen: 76.23 },
  { formula: 'L03', rm: 'SPER-6', persen: 0.62 },
  { formula: 'L03', rm: 'ABPP-05-SC', persen: 0.38 },
  { formula: 'L03', rm: 'TF-403', persen: 18.17 },
  { formula: 'L03', rm: 'VISTAMAXX-3588', persen: 4.60 },
  { formula: 'L04', rm: 'F600F', persen: 75.46 },
  { formula: 'L04', rm: 'SPER-6', persen: 1.70 },
  { formula: 'L04', rm: 'ABPP-05-SC', persen: 0.99 },
  { formula: 'L04', rm: 'VISTAMAXX-3588', persen: 21.85 },
  { formula: 'L05', rm: 'F600F', persen: 60.76 },
  { formula: 'L05', rm: 'SPER-6', persen: 1.24 },
  { formula: 'L05', rm: 'ABPP-05-SC', persen: 0.38 },
  { formula: 'L05', rm: 'TF-403', persen: 37.62 },
  { formula: 'M01', rm: 'F600F', persen: 70.00 },
  { formula: 'M01', rm: 'ABVT-22-NSC', persen: 0.80 },
  { formula: 'M01', rm: 'FL-7642', persen: 19.40 },
  { formula: 'M01', rm: 'FL-7541', persen: 9.80 },
  { formula: 'M02', rm: 'ENABLE-2010', persen: 1.42 },
  { formula: 'M02', rm: 'F600F', persen: 69.58 },
  { formula: 'M02', rm: 'ABVT-22-NSC', persen: 1.33 },
  { formula: 'M02', rm: 'FL-7642', persen: 21.85 },
  { formula: 'M02', rm: 'EXCEED-3518', persen: 5.82 },
  { formula: 'M03', rm: 'ENABLE-2010', persen: 2.13 },
  { formula: 'M03', rm: 'F600F', persen: 68.87 },
  { formula: 'M03', rm: 'ABVT-22-NSC', persen: 1.68 },
  { formula: 'M03', rm: 'FL-7642', persen: 17.02 },
  { formula: 'M03', rm: 'VISTAMAXX-3588', persen: 4.60 },
  { formula: 'M03', rm: 'EXCEED-3518', persen: 5.70 },
  { formula: 'M04', rm: 'ENABLE-2010', persen: 1.42 },
  { formula: 'M04', rm: 'F600F', persen: 69.58 },
  { formula: 'M04', rm: 'ABVT-22-NSC', persen: 1.91 },
  { formula: 'M04', rm: 'FL-7642', persen: 4.60 },
  { formula: 'M04', rm: 'VISTAMAXX-3588', persen: 16.79 },
  { formula: 'M04', rm: 'EXCEED-3518', persen: 5.70 },
  { formula: 'M05', rm: 'F600F', persen: 70.00 },
  { formula: 'M05', rm: 'ABVT-22-NSC', persen: 0.40 },
  { formula: 'M05', rm: 'FL-7642', persen: 19.80 },
  { formula: 'M05', rm: 'DF-8200', persen: 2.00 },
  { formula: 'M05', rm: 'FL-7541', persen: 7.80 },
  { formula: 'M06', rm: 'F600F', persen: 70.00 },
  { formula: 'M06', rm: 'ABVT-22-NSC', persen: 1.30 },
  { formula: 'M06', rm: 'FL-7642', persen: 15.00 },
  { formula: 'M06', rm: 'VISTAMAXX-3588', persen: 4.00 },
  { formula: 'M06', rm: 'RD-265-CF', persen: 9.70 },
  { formula: 'M07', rm: 'F600F', persen: 70.00 },
  { formula: 'M07', rm: 'ABVT-22-NSC', persen: 1.30 },
  { formula: 'M07', rm: 'FL-7642', persen: 15.00 },
  { formula: 'M07', rm: 'VISTAMAXX-3588', persen: 4.00 },
  { formula: 'M07', rm: 'DF-8200', persen: 1.00 },
  { formula: 'M07', rm: 'RD-265-CF', persen: 8.70 },
  { formula: 'M08', rm: 'RD-265-CF', persen: 78.70 },
  { formula: 'M08', rm: 'ABVT-22-NSC', persen: 1.30 },
  { formula: 'M08', rm: 'FL-7642', persen: 15.00 },
  { formula: 'M08', rm: 'VISTAMAXX-3588', persen: 4.00 },
  { formula: 'M08', rm: 'DF-8200', persen: 1.00 },
];

export const useConfigStore = defineStore('configStore', {
  state: () => ({
    filmConfigs: [],
    mesinList: [],
    operatorList: [],
    labelSignList: [],
    locationList: [],
    jenisList: [],
    jenisBahanList: [],
    kategoriFilmList: [],
    tipeBahanList: [],
    standardLengthList: [],
    resinItemList: [],
    bomFormulaList: [],
    loading: false,
  }),

  getters: {
    activeJenis: (state) => state.jenisList.filter(j => j.active).map(j => j.nama),
    activeMesin: (state) => state.mesinList.filter(m => m.active).map(m => m.nama),
    activeOperators: (state) => state.operatorList.filter(o => o.active !== false),
    activeLabelSigns: (state) => state.labelSignList.filter(s => s.active !== false),
    activeLocations: (state) => state.locationList.filter(l => l.active !== false),
    activeJenisBahan: (state) => state.jenisBahanList.filter(j => j.active).map(j => j.nama),
    activeKategoriFilm: (state) => state.kategoriFilmList.filter(k => k.active).map(k => k.nama),
    activeTipeBahan: (state) => state.tipeBahanList.filter(t => t.active).map(t => t.nama),
    activeStandardLengths: (state) => state.standardLengthList.filter(s => s.active !== false),
    activeResinItems: (state) => state.resinItemList.filter(r => r.active !== false),
    activeBomFormulas: (state) => state.bomFormulaList.filter(b => b.active !== false),

    // Helper untuk mengambil panjang standard sesuai thickness roll
    getStandardLength: (state) => (thick) => {
      const t = parseFloat(thick);
      if (isNaN(t) || t <= 0) return null;
      const list = state.standardLengthList.filter(s => s.active !== false);
      if (list.length === 0) return null;

      // 1. Cari exact match thickness
      const exact = list.find(s => parseFloat(s.thickness) === t);
      if (exact) return exact;

      // 2. Jika tidak ada exact, cari selisih terdekat
      return list.reduce((prev, curr) => {
        return Math.abs(parseFloat(curr.thickness) - t) < Math.abs(parseFloat(prev.thickness) - t) ? curr : prev;
      });
    },
  },

  actions: {
    async loadAll() {
      this.loading = true;
      try {
        // Auto-sync tag parameters (Jenis Film, Tipe Bahan, Jenis Bahan, Kategori Film) from formulas
        await this.syncTagParametersFromFormulas();

        const [fc, ml, ol, ls, locs, jl, jbl, kfl, tbl, sl, ri, bf] = await Promise.all([
          db.film_configs.toArray(),
          db.mesin_list.toArray(),
          db.operator_list.toArray(),
          db.label_signs.toArray(),
          db.location_list.toArray(),
          db.jenis_list.toArray(),
          db.jenis_bahan_list.toArray(),
          db.kategori_film_list.toArray(),
          db.tipe_bahan_list.toArray(),
          db.standard_lengths.toArray(),
          db.resin_items.toArray(),
          db.bom_formulas.toArray(),
        ]);
        this.filmConfigs = fc;
        this.mesinList = ml;
        this.operatorList = ol.sort((a, b) => (a.kodeOperator || '').localeCompare(b.kodeOperator || ''));
        this.labelSignList = ls;
        this.locationList = locs;
        this.jenisList = jl;
        this.jenisBahanList = jbl;
        this.kategoriFilmList = kfl;
        this.tipeBahanList = tbl;
        this.standardLengthList = sl.sort((a, b) => parseFloat(a.thickness) - parseFloat(b.thickness));
        this.resinItemList = ri.sort((a, b) => (a.resin || '').localeCompare(b.resin || ''));
        this.bomFormulaList = bf.sort((a, b) => (a.formula || '').localeCompare(b.formula || '') || (b.persen || 0) - (a.persen || 0));

        // Migrasi data alias film_configs jika belum ada di database
        for (const item of this.filmConfigs) {
          if (item.alias === undefined || item.alias === null) {
            const defAlias = getDefaultFilmAlias(item.jenis, item.kodeFormula);
            item.alias = defAlias;
            await db.film_configs.update(item.id, { alias: defAlias });
          }
        }

        // Migrasi data kodeGrup operator jika belum ada di database
        const now = new Date().toISOString();
        for (let i = 0; i < this.operatorList.length; i++) {
          const op = this.operatorList[i];
          if (!op.kodeGrup) {
            const defaultGrp = (i % 3 === 0) ? 'A' : (i % 3 === 1) ? 'B' : 'C';
            op.kodeGrup = defaultGrp;
            if (op.id) {
              await db.operator_list.update(op.id, { kodeGrup: defaultGrp, updatedAt: now });
            }
          }
        }

        // Pastikan operator SLITTING tersedia
        const hasSlitting = this.operatorList.some(o => o.mesin && o.mesin.toUpperCase() === 'SLITTING');
        if (!hasSlitting) {
          const slittingDefaults = [
            { nama: 'HENDRA', mesin: 'SLITTING', kodeGrup: 'A', kodeOperator: 'H', active: true, createdAt: now, updatedAt: now },
            { nama: 'GUNAWAN', mesin: 'SLITTING', kodeGrup: 'B', kodeOperator: 'G', active: true, createdAt: now, updatedAt: now },
            { nama: 'WAHYU', mesin: 'SLITTING', kodeGrup: 'C', kodeOperator: 'W', active: true, createdAt: now, updatedAt: now },
          ];
          await db.operator_list.bulkAdd(slittingDefaults);
          this.operatorList = (await db.operator_list.toArray()).sort((a, b) => (a.kodeOperator || '').localeCompare(b.kodeOperator || ''));
        }

        // Bersihkan mock operator METALIZE (HERI, EKO, DIDIK) jika ada dan ganti dengan aktual (TUKIMIN, FIRMAN, ANWAR)
        const mockMetalizeNames = ['HERI', 'EKO', 'DIDIK'];
        const mockOps = this.operatorList.filter(o => o.mesin && o.mesin.toUpperCase() === 'METALIZE' && mockMetalizeNames.includes(o.nama?.toUpperCase()));
        if (mockOps.length > 0) {
          for (const mOp of mockOps) {
            if (mOp.id) await db.operator_list.delete(mOp.id);
          }
        }

        // Pastikan operator METALIZE aktual (TUKIMIN, FIRMAN, ANWAR) tersedia di database
        const actualMetalize = [
          { nama: 'TUKIMIN', mesin: 'METALIZE', kodeGrup: 'D', kodeOperator: 'D', active: true },
          { nama: 'FIRMAN', mesin: 'METALIZE', kodeGrup: 'E', kodeOperator: 'E', active: true },
          { nama: 'ANWAR', mesin: 'METALIZE', kodeGrup: 'F', kodeOperator: 'F', active: true },
        ];
        let hasChangedMetalize = mockOps.length > 0;
        for (const act of actualMetalize) {
          const exists = this.operatorList.some(o => o.mesin && o.mesin.toUpperCase() === 'METALIZE' && o.nama?.toUpperCase() === act.nama);
          if (!exists) {
            await db.operator_list.add({ ...act, createdAt: now, updatedAt: now });
            hasChangedMetalize = true;
          }
        }
        if (hasChangedMetalize) {
          this.operatorList = (await db.operator_list.toArray()).sort((a, b) => (a.kodeOperator || '').localeCompare(b.kodeOperator || ''));
        }
      } finally {
        this.loading = false;
      }
    },

    // Otomatis sinkronisasi tag parameter dari data film_configs yang terdaftar
    async syncTagParametersFromFormulas() {
      const now = new Date().toISOString();
      const allFormulas = await db.film_configs.toArray();
      if (!allFormulas.length) return;

      const [existingJenis, existingJenisBahan, existingKategori, existingTipeBahan] = await Promise.all([
        db.jenis_list.toArray(),
        db.jenis_bahan_list.toArray(),
        db.kategori_film_list.toArray(),
        db.tipe_bahan_list.toArray(),
      ]);

      const jenisSet = new Set(existingJenis.map(j => (j.nama || '').trim().toUpperCase()));
      const jbSet = new Set(existingJenisBahan.map(j => (j.nama || '').trim().toUpperCase()));
      const kfSet = new Set(existingKategori.map(k => (k.nama || '').trim().toUpperCase()));
      const tbSet = new Set(existingTipeBahan.map(t => (t.nama || '').trim().toUpperCase()));

      const toAddJenis = [];
      const toAddJb = [];
      const toAddKf = [];
      const toAddTb = [];

      for (const item of allFormulas) {
        const j = String(item.jenis || '').trim().toUpperCase();
        if (j && !jenisSet.has(j)) {
          jenisSet.add(j);
          toAddJenis.push({ nama: j, active: true, createdAt: now });
        }

        const jb = String(item.jenisBahan || '').trim();
        if (jb && !jbSet.has(jb.toUpperCase())) {
          jbSet.add(jb.toUpperCase());
          toAddJb.push({ nama: jb, active: true, createdAt: now });
        }

        const kf = String(item.kategoriFilm || '').trim();
        if (kf && !kfSet.has(kf.toUpperCase())) {
          kfSet.add(kf.toUpperCase());
          toAddKf.push({ nama: kf, active: true, createdAt: now });
        }

        const tb = String(item.tipeBahan || '').trim();
        if (tb && !tbSet.has(tb.toUpperCase())) {
          tbSet.add(tb.toUpperCase());
          toAddTb.push({ nama: tb, active: true, createdAt: now });
        }
      }

      if (toAddJenis.length > 0) await db.jenis_list.bulkAdd(toAddJenis);
      if (toAddJb.length > 0) await db.jenis_bahan_list.bulkAdd(toAddJb);
      if (toAddKf.length > 0) await db.kategori_film_list.bulkAdd(toAddKf);
      if (toAddTb.length > 0) await db.tipe_bahan_list.bulkAdd(toAddTb);
    },

    // Manual Action: Muat Template Standar Pabrik (Hanya dijalankan jika user mengklik tombol)
    async seedDefaultFactoryConfigs() {
      this.loading = true;
      try {
        const now = new Date().toISOString();
        await db.film_configs.clear();
        await db.mesin_list.clear();
        await db.operator_list.clear();
        await db.label_signs.clear();
        await db.location_list.clear();
        await db.jenis_list.clear();
        await db.jenis_bahan_list.clear();
        await db.kategori_film_list.clear();
        await db.tipe_bahan_list.clear();
        await db.standard_lengths.clear();
        await db.resin_items.clear();
        await db.bom_formulas.clear();

        await db.film_configs.bulkAdd(DEFAULT_FILM_CONFIGS.map(r => ({ ...r, createdAt: now, updatedAt: now })));
        await db.mesin_list.bulkAdd(DEFAULT_MESIN.map(r => ({ ...r, createdAt: now })));
        await db.operator_list.bulkAdd(DEFAULT_OPERATORS.map(r => ({ ...r, createdAt: now, updatedAt: now })));
        await db.label_signs.bulkAdd(DEFAULT_LABEL_SIGNS.map(r => ({ ...r, createdAt: now, updatedAt: now })));
        await db.location_list.bulkAdd(DEFAULT_LOCATIONS.map(r => ({ ...r, createdAt: now, updatedAt: now })));
        
        const jenisUnik = [...new Set(DEFAULT_FILM_CONFIGS.map(f => f.jenis))];
        await db.jenis_list.bulkAdd(jenisUnik.map(nama => ({ nama, active: true, createdAt: now })));
        
        const jbUnik = [...new Set(DEFAULT_FILM_CONFIGS.map(f => f.jenisBahan).filter(Boolean))];
        await db.jenis_bahan_list.bulkAdd(jbUnik.map(nama => ({ nama, active: true, createdAt: now })));
        
        const kfUnik = [...new Set(DEFAULT_FILM_CONFIGS.map(f => f.kategoriFilm).filter(Boolean))];
        await db.kategori_film_list.bulkAdd(kfUnik.map(nama => ({ nama, active: true, createdAt: now })));
        
        const tbUnik = [...new Set(DEFAULT_FILM_CONFIGS.map(f => f.tipeBahan).filter(Boolean))];
        await db.tipe_bahan_list.bulkAdd(tbUnik.map(nama => ({ nama, active: true, createdAt: now })));

        await db.standard_lengths.bulkAdd(DEFAULT_STANDARD_LENGTHS.map(r => ({ ...r, createdAt: now, updatedAt: now })));
        await db.resin_items.bulkAdd(DEFAULT_RESIN_ITEMS.map(r => ({ ...r, createdAt: now, updatedAt: now })));
        await db.bom_formulas.bulkAdd(DEFAULT_BOM_FORMULAS.map(r => ({ ...r, createdAt: now, updatedAt: now })));

        await saveSetting('config_seeded_flag_v1', true);
        await this.loadAll();
      } finally {
        this.loading = false;
      }
    },

    async _cleanAndEnsureMasterJumboRacks() {
      const now = new Date().toISOString();
      const allLocs = await db.location_list.toArray();

      // 1. Identifikasi dan hapus lokasi kotor WIP JUMBO yang berawalan '*', angka 0, atau sub-rak tunggal
      const standardNames = new Set(DEFAULT_LOCATIONS.map(d => d.nama.toUpperCase()));
      const dirtyIds = [];

      for (const loc of allLocs) {
        if (loc.jenis === 'WIP JUMBO') {
          const upper = (loc.nama || '').toUpperCase();
          if (
            upper.includes('*') || 
            upper === 'RAK 0' || 
            upper === '0' || 
            upper === 'RAK *0' ||
            /^(RAK\s+)?(A1|A2|A3|A4|B1|B2|B3|B4|C1|C2|C3|C4|D1|D2|D3|D4|G1|G2|G3|G4|H1|H2|H3|H4)$/i.test(upper)
          ) {
            dirtyIds.push(loc.id);
          }
        }
      }

      if (dirtyIds.length > 0) {
        await db.location_list.bulkDelete(dirtyIds);
      }

      // 2. Refresh dan pastikan 12 rak utama + STAGING terdaftar
      const currentLocs = await db.location_list.toArray();
      const existingNames = new Set(currentLocs.map(l => l.nama.toUpperCase()));
      const toAdd = [];

      for (const def of DEFAULT_LOCATIONS) {
        if (!existingNames.has(def.nama.toUpperCase())) {
          toAdd.push({ ...def, createdAt: now, updatedAt: now });
        }
      }

      if (toAdd.length > 0) {
        await db.location_list.bulkAdd(toAdd);
      }

      this.locationList = await db.location_list.toArray();
    },

    async _seedIfEmpty() {
      const isSeeded = await getSetting('config_seeded_flag_v1');
      if (isSeeded) return;

      const now = new Date().toISOString();
      const [fc, ml, ol, ls, locs, jl, jbl, kfl, tbl, sl, ri, bf] = await Promise.all([
        db.film_configs.count(),
        db.mesin_list.count(),
        db.operator_list.count(),
        db.label_signs.count(),
        db.location_list.count(),
        db.jenis_list.count(),
        db.jenis_bahan_list.count(),
        db.kategori_film_list.count(),
        db.tipe_bahan_list.count(),
        db.standard_lengths.count(),
        db.resin_items.count(),
        db.bom_formulas.count(),
      ]);

      await saveSetting('config_seeded_flag_v1', true);

      if (fc === 0) {
        await db.film_configs.bulkAdd(DEFAULT_FILM_CONFIGS.map(r => ({ ...r, createdAt: now, updatedAt: now })));
      }
      if (ml === 0) {
        await db.mesin_list.bulkAdd(DEFAULT_MESIN.map(r => ({ ...r, createdAt: now })));
      }
      if (ol === 0) {
        await db.operator_list.bulkAdd(DEFAULT_OPERATORS.map(r => ({ ...r, createdAt: now, updatedAt: now })));
      }
      if (ls === 0) {
        await db.label_signs.bulkAdd(DEFAULT_LABEL_SIGNS.map(r => ({ ...r, createdAt: now, updatedAt: now })));
      }
      if (locs === 0) {
        await db.location_list.bulkAdd(DEFAULT_LOCATIONS.map(r => ({ ...r, createdAt: now, updatedAt: now })));
      }
      if (jl === 0) {
        const jenisUnik = [...new Set(DEFAULT_FILM_CONFIGS.map(f => f.jenis))];
        await db.jenis_list.bulkAdd(jenisUnik.map(nama => ({ nama, active: true, createdAt: now })));
      }
      if (jbl === 0) {
        const jbUnik = [...new Set(DEFAULT_FILM_CONFIGS.map(f => f.jenisBahan).filter(Boolean))];
        await db.jenis_bahan_list.bulkAdd(jbUnik.map(nama => ({ nama, active: true, createdAt: now })));
      }
      if (kfl === 0) {
        const kfUnik = [...new Set(DEFAULT_FILM_CONFIGS.map(f => f.kategoriFilm).filter(Boolean))];
        await db.kategori_film_list.bulkAdd(kfUnik.map(nama => ({ nama, active: true, createdAt: now })));
      }
      if (tbl === 0) {
        const tbUnik = [...new Set(DEFAULT_FILM_CONFIGS.map(f => f.tipeBahan).filter(Boolean))];
        await db.tipe_bahan_list.bulkAdd(tbUnik.map(nama => ({ nama, active: true, createdAt: now })));
      }
      if (sl === 0) {
        await db.standard_lengths.bulkAdd(DEFAULT_STANDARD_LENGTHS.map(r => ({ ...r, createdAt: now, updatedAt: now })));
      }
      if (ri === 0) {
        await db.resin_items.bulkAdd(DEFAULT_RESIN_ITEMS.map(r => ({
          ...r,
          resin: normalizeResinName(r.resin),
          active: true,
          createdAt: now,
          updatedAt: now
        })));
      }
      if (bf === 0) {
        await db.bom_formulas.bulkAdd(DEFAULT_BOM_FORMULAS.map(r => ({
          formula: (r.formula || '').trim().toUpperCase(),
          rm: normalizeResinName(r.rm),
          persen: parseFloat(r.persen) || 0,
          active: true,
          createdAt: now,
          updatedAt: now
        })));
      }
    },

    // ── FILM CONFIGS CRUD ──────────────────────────────────────────────────────
    async addFilmConfig(row) {
      const now = new Date().toISOString();
      const jenisClean = (row.jenis || '').trim().toUpperCase();
      const kodeClean = (row.kodeFormula || '').trim().toUpperCase();
      const aliasClean = (row.alias !== undefined && row.alias !== null)
        ? String(row.alias).trim().toUpperCase()
        : getDefaultFilmAlias(jenisClean, kodeClean);

      const newConfig = {
        ...row,
        jenis: jenisClean,
        kodeFormula: kodeClean,
        alias: aliasClean,
        density: parseFloat(row.density) || 0.91,
        createdAt: now,
        updatedAt: now
      };
      const id = await db.film_configs.add(newConfig);
      this.filmConfigs.push({ ...newConfig, id });
      await this.syncTagParametersFromFormulas();
      const [jl, jbl, kfl, tbl] = await Promise.all([
        db.jenis_list.toArray(),
        db.jenis_bahan_list.toArray(),
        db.kategori_film_list.toArray(),
        db.tipe_bahan_list.toArray()
      ]);
      this.jenisList = jl;
      this.jenisBahanList = jbl;
      this.kategoriFilmList = kfl;
      this.tipeBahanList = tbl;
    },

    async updateFilmConfig(id, changes) {
      const now = new Date().toISOString();
      const jenisClean = (changes.jenis || '').trim().toUpperCase();
      const kodeClean = (changes.kodeFormula || '').trim().toUpperCase();
      const aliasClean = (changes.alias !== undefined && changes.alias !== null)
        ? String(changes.alias).trim().toUpperCase()
        : (changes.alias === '' ? '' : getDefaultFilmAlias(jenisClean, kodeClean));

      const updated = {
        ...changes,
        jenis: jenisClean,
        kodeFormula: kodeClean,
        alias: aliasClean,
        density: parseFloat(changes.density) || 0.91,
        updatedAt: now
      };
      await db.film_configs.update(id, updated);
      const idx = this.filmConfigs.findIndex(r => r.id === id);
      if (idx !== -1) {
        this.filmConfigs[idx] = { ...this.filmConfigs[idx], ...updated };
      }
      await this.syncTagParametersFromFormulas();
      const [jl, jbl, kfl, tbl] = await Promise.all([
        db.jenis_list.toArray(),
        db.jenis_bahan_list.toArray(),
        db.kategori_film_list.toArray(),
        db.tipe_bahan_list.toArray()
      ]);
      this.jenisList = jl;
      this.jenisBahanList = jbl;
      this.kategoriFilmList = kfl;
      this.tipeBahanList = tbl;
    },

    async deleteFilmConfig(id) {
      await db.film_configs.delete(id);
      this.filmConfigs = this.filmConfigs.filter(f => f.id !== id);
    },

    // ── OPERATORS CRUD ────────────────────────────────────────────────────────
    async addOperator(row) {
      const now = new Date().toISOString();
      const newOp = {
        ...row,
        nama: (row.nama || '').trim().toUpperCase(),
        kodeOperator: (row.kodeOperator || '').trim().toUpperCase(),
        kodeGrup: (row.kodeGrup || '').trim().toUpperCase(),
        mesin: (row.mesin || '').trim().toUpperCase(),
        active: row.active ?? true,
        createdAt: now,
        updatedAt: now
      };
      const id = await db.operator_list.add(newOp);
      this.operatorList.push({ ...newOp, id });
      this.operatorList.sort((a, b) => (a.kodeOperator || '').localeCompare(b.kodeOperator || ''));
    },

    async updateOperator(id, changes) {
      const now = new Date().toISOString();
      const updated = {
        ...changes,
        nama: (changes.nama || '').trim().toUpperCase(),
        kodeOperator: (changes.kodeOperator || '').trim().toUpperCase(),
        kodeGrup: (changes.kodeGrup || '').trim().toUpperCase(),
        mesin: (changes.mesin || '').trim().toUpperCase(),
        updatedAt: now
      };
      await db.operator_list.update(id, updated);
      const idx = this.operatorList.findIndex(o => o.id === id);
      if (idx !== -1) Object.assign(this.operatorList[idx], updated);
      this.operatorList.sort((a, b) => (a.kodeOperator || '').localeCompare(b.kodeOperator || ''));
    },

    async deleteOperator(id) {
      await db.operator_list.delete(id);
      this.operatorList = this.operatorList.filter(o => o.id !== id);
    },

    // ── MESIN CRUD ────────────────────────────────────────────────────────────
    async addMesin(row) {
      const now = new Date().toISOString();
      const newMesin = {
        nama: (row.nama || '').trim().toUpperCase(),
        praKodePack: (row.praKodePack || '').trim().toUpperCase(),
        active: row.active ?? true,
        createdAt: now
      };
      const id = await db.mesin_list.add(newMesin);
      this.mesinList.push({ ...newMesin, id });
    },

    async updateMesin(id, changes) {
      const updatedChanges = { ...changes };
      if (updatedChanges.nama) updatedChanges.nama = updatedChanges.nama.trim().toUpperCase();
      if (updatedChanges.praKodePack !== undefined) updatedChanges.praKodePack = updatedChanges.praKodePack.trim().toUpperCase();
      await db.mesin_list.update(id, updatedChanges);
      const idx = this.mesinList.findIndex(m => m.id === id);
      if (idx !== -1) Object.assign(this.mesinList[idx], updatedChanges);
    },

    async deleteMesin(id) {
      await db.mesin_list.delete(id);
      this.mesinList = this.mesinList.filter(m => m.id !== id);
    },

    // ── LABEL SIGNS CRUD ──────────────────────────────────────────────────────
    async addLabelSign(row) {
      const now = new Date().toISOString();
      const newSign = {
        ...row,
        badgeText: (row.badgeText || '').trim().toUpperCase(),
        active: row.active ?? true,
        createdAt: now,
        updatedAt: now
      };
      const id = await db.label_signs.add(newSign);
      this.labelSignList.push({ ...newSign, id });
    },

    async updateLabelSign(id, changes) {
      const now = new Date().toISOString();
      const updated = { ...changes, updatedAt: now };
      if (updated.badgeText) updated.badgeText = updated.badgeText.trim().toUpperCase();
      await db.label_signs.update(id, updated);
      const idx = this.labelSignList.findIndex(s => s.id === id);
      if (idx !== -1) Object.assign(this.labelSignList[idx], updated);
    },

    async deleteLabelSign(id) {
      await db.label_signs.delete(id);
      this.labelSignList = this.labelSignList.filter(s => s.id !== id);
    },

    // ── MASTER LOCATIONS (DENAH RAK & PERUNTUKAN) CRUD ────────────────────────
    async addLocation(row) {
      const now = new Date().toISOString();
      const newLoc = {
        nama: (row.nama || '').trim().toUpperCase(),
        jenis: (row.jenis || 'WIP JUMBO').trim().toUpperCase(),
        alias: (row.alias || '').trim().toUpperCase(),
        kapasitas: parseInt(row.kapasitas, 10) || 12,
        keterangan: (row.keterangan || '').trim(),
        active: row.active ?? true,
        createdAt: now,
        updatedAt: now
      };
      const id = await db.location_list.add(newLoc);
      this.locationList.push({ ...newLoc, id });
    },

    async updateLocation(id, changes) {
      const now = new Date().toISOString();
      const updated = {
        ...changes,
        nama: (changes.nama || '').trim().toUpperCase(),
        jenis: (changes.jenis || 'WIP JUMBO').trim().toUpperCase(),
        alias: (changes.alias || '').trim().toUpperCase(),
        kapasitas: parseInt(changes.kapasitas, 10) || 12,
        keterangan: (changes.keterangan || '').trim(),
        updatedAt: now
      };
      await db.location_list.update(id, updated);
      const idx = this.locationList.findIndex(l => l.id === id);
      if (idx !== -1) Object.assign(this.locationList[idx], updated);
    },

    async deleteLocation(id) {
      await db.location_list.delete(id);
      this.locationList = this.locationList.filter(l => l.id !== id);
    },

    // Shorthand / Alias Normalizer for Locations
    normalizeLocation(inputStr, contextJenis = 'WIP JUMBO') {
      if (!inputStr) return 'STAGING';
      const raw = String(inputStr).trim().toUpperCase();
      
      // Jika bernilai '0', '-', 'GUDANG', 'FLOOR', 'LANTAI', 'TRANSIT' -> STAGING
      if (
        raw === '0' || 
        raw === '-' || 
        raw === 'STAGING' || 
        raw === 'TRANSIT' ||
        ['FLOOR', 'GUDANG', 'LANTAI', 'AREA STAGING'].some(term => raw.includes(term))
      ) {
        return 'STAGING';
      }

      // Bersihkan karakter khusus seperti '*', '#', prefix 'RAK '
      const clean = raw.replace(/[*#]/g, '').trim();
      const list = this.locationList.filter(l => l.active !== false && (!contextJenis || l.jenis === contextJenis));
      
      // 1. Direct match on nama
      const exact = list.find(l => l.nama.toUpperCase() === raw || l.nama.toUpperCase() === clean || l.nama.toUpperCase() === `RAK ${clean}`);
      if (exact) return exact.nama;

      // 2. Match on aliases
      for (const loc of list) {
        if (loc.alias) {
          const aliases = loc.alias.split(',').map(a => a.trim().toUpperCase().replace(/[*#]/g, ''));
          if (aliases.includes(raw) || aliases.includes(clean) || aliases.includes(`RAK ${clean}`)) {
            return loc.nama;
          }
        }
      }

      // 3. Smart Shorthand heuristic for 12 WIP JUMBO Standard Master Racks
      if (contextJenis === 'WIP JUMBO') {
        const compact = clean.replace(/\s+/g, '').replace(/^RAK/, '');

        const pairs = [
          { pattern: /^(A1|A2|A1A2)$/, target: 'A1A2' },
          { pattern: /^(A3|A4|A3A4)$/, target: 'A3A4' },
          { pattern: /^(B1|B2|B1B2)$/, target: 'B1B2' },
          { pattern: /^(B3|B4|B3B4)$/, target: 'B3B4' },
          { pattern: /^(C1|C2|C1C2)$/, target: 'C1C2' },
          { pattern: /^(C3|C4|C3C4)$/, target: 'C3C4' },
          { pattern: /^(D1|D2|D1D2)$/, target: 'D1D2' },
          { pattern: /^(D3|D4|D3D4)$/, target: 'D3D4' },
          { pattern: /^(G1|G2|G1G2)$/, target: 'G1G2' },
          { pattern: /^(G3|G4|G3G4)$/, target: 'G3G4' },
          { pattern: /^(H1|H2|H1H2)$/, target: 'H1H2' },
          { pattern: /^(H3|H4|H3H4)$/, target: 'H3H4' },
        ];

        for (const pair of pairs) {
          if (pair.pattern.test(compact)) {
            const matchLoc = list.find(l => l.nama.toUpperCase().includes(pair.target));
            if (matchLoc) return matchLoc.nama;
            return `RAK ${pair.target}`;
          }
        }

        // Jika bukan master rack, arahkan ke STAGING
        return 'STAGING';
      }

      return raw.startsWith('RAK ') ? raw : (clean.length <= 4 ? `RAK ${clean}` : clean);
    },

    // Auto-Register / Ensure Location exists in Master Configuration
    async ensureLocationExists(rawName, contextJenis = 'WIP JUMBO') {
      if (!rawName || !rawName.trim()) return 'STAGING';
      const normalized = this.normalizeLocation(rawName, contextJenis);
      
      const existing = this.locationList.find(l => 
        l.nama.toUpperCase() === normalized.toUpperCase() ||
        (l.alias && l.alias.split(',').map(a => a.trim().toUpperCase()).includes(normalized.toUpperCase()))
      );

      if (!existing) {
        const cleanName = normalized.toUpperCase().startsWith('RAK') || normalized.toUpperCase() === 'STAGING'
          ? normalized.toUpperCase()
          : `RAK ${normalized.toUpperCase()}`;
        
        const newLoc = {
          nama: cleanName,
          jenis: contextJenis,
          alias: rawName.trim().toUpperCase(),
          kapasitas: 12,
          keterangan: `Otomatis didaftarkan dari Upload/Input WIP (${new Date().toLocaleDateString('id-ID')})`,
          active: true
        };
        await this.addLocation(newLoc);
        return cleanName;
      }
      return existing.nama;
    },

    // Batch Auto-Register Multiple Discovered Locations
    async autoRegisterDiscoveredLocations(rawNamesList, contextJenis = 'WIP JUMBO') {
      if (!Array.isArray(rawNamesList) || rawNamesList.length === 0) return 0;
      let count = 0;
      for (const name of rawNamesList) {
        if (!name || !name.trim()) continue;
        const normalized = this.normalizeLocation(name, contextJenis);
        const exists = this.locationList.some(l => 
          l.nama.toUpperCase() === normalized.toUpperCase() ||
          (l.alias && l.alias.split(',').map(a => a.trim().toUpperCase()).includes(normalized.toUpperCase()))
        );
        if (!exists) {
          await this.ensureLocationExists(name, contextJenis);
          count++;
        }
      }
      return count;
    },

    // ── STANDARD LENGTHS CRUD ───────────────────────────────────────────────
    async addStandardLength(row) {
      const now = new Date().toISOString();
      const item = {
        thickness: parseFloat(row.thickness) || 0,
        maxPanjangFg: parseFloat(row.maxPanjangFg) || 0,
        maxPanjangJumbo: parseFloat(row.maxPanjangJumbo) || 0,
        active: row.active !== false,
        createdAt: now,
        updatedAt: now
      };
      const id = await db.standard_lengths.add(item);
      this.standardLengthList.push({ id, ...item });
      this.standardLengthList.sort((a, b) => parseFloat(a.thickness) - parseFloat(b.thickness));
    },

    async updateStandardLength(id, changes) {
      const now = new Date().toISOString();
      const payload = {
        ...changes,
        thickness: parseFloat(changes.thickness) || 0,
        maxPanjangFg: parseFloat(changes.maxPanjangFg) || 0,
        maxPanjangJumbo: parseFloat(changes.maxPanjangJumbo) || 0,
        updatedAt: now
      };
      await db.standard_lengths.update(id, payload);
      const idx = this.standardLengthList.findIndex(i => i.id === id);
      if (idx !== -1) {
        Object.assign(this.standardLengthList[idx], payload);
        this.standardLengthList.sort((a, b) => parseFloat(a.thickness) - parseFloat(b.thickness));
      }
    },

    async deleteStandardLength(id) {
      await db.standard_lengths.delete(id);
      this.standardLengthList = this.standardLengthList.filter(i => i.id !== id);
    },

    // ── RESIN ITEMS CRUD ──────────────────────────────────────────────────────
    async addResinItem(row) {
      const now = new Date().toISOString();
      const item = {
        resin: normalizeResinName(row.resin),
        kode: (row.kode || '').trim().toUpperCase(),
        nomorItem: (row.nomorItem || '').trim(),
        active: row.active !== false,
        createdAt: now,
        updatedAt: now
      };
      const id = await db.resin_items.add(item);
      this.resinItemList.push({ id, ...item });
      this.resinItemList.sort((a, b) => (a.resin || '').localeCompare(b.resin || ''));
    },

    async updateResinItem(id, changes) {
      const now = new Date().toISOString();
      const payload = {
        ...changes,
        resin: changes.resin ? normalizeResinName(changes.resin) : undefined,
        kode: changes.kode !== undefined ? (changes.kode || '').trim().toUpperCase() : undefined,
        nomorItem: changes.nomorItem !== undefined ? (changes.nomorItem || '').trim() : undefined,
        updatedAt: now
      };
      // Clean undefined keys
      Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k]);

      await db.resin_items.update(id, payload);
      const idx = this.resinItemList.findIndex(i => i.id === id);
      if (idx !== -1) {
        Object.assign(this.resinItemList[idx], payload);
        this.resinItemList.sort((a, b) => (a.resin || '').localeCompare(b.resin || ''));
      }
    },

    async deleteResinItem(id) {
      await db.resin_items.delete(id);
      this.resinItemList = this.resinItemList.filter(i => i.id !== id);
    },

    // ── BOM FORMULAS CRUD ─────────────────────────────────────────────────────
    async addBomFormula(row) {
      const now = new Date().toISOString();
      const item = {
        formula: (row.formula || '').trim().toUpperCase(),
        rm: normalizeResinName(row.rm),
        persen: parseFloat(row.persen) || 0,
        active: row.active !== false,
        createdAt: now,
        updatedAt: now
      };
      const id = await db.bom_formulas.add(item);
      this.bomFormulaList.push({ id, ...item });
      this.bomFormulaList.sort((a, b) => (a.formula || '').localeCompare(b.formula || '') || (b.persen || 0) - (a.persen || 0));
    },

    async updateBomFormula(id, changes) {
      const now = new Date().toISOString();
      const payload = {
        ...changes,
        formula: changes.formula !== undefined ? (changes.formula || '').trim().toUpperCase() : undefined,
        rm: changes.rm !== undefined ? normalizeResinName(changes.rm) : undefined,
        persen: changes.persen !== undefined ? parseFloat(changes.persen) || 0 : undefined,
        updatedAt: now
      };
      Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k]);

      await db.bom_formulas.update(id, payload);
      const idx = this.bomFormulaList.findIndex(i => i.id === id);
      if (idx !== -1) {
        Object.assign(this.bomFormulaList[idx], payload);
        this.bomFormulaList.sort((a, b) => (a.formula || '').localeCompare(b.formula || '') || (b.persen || 0) - (a.persen || 0));
      }
    },

    async deleteBomFormula(id) {
      await db.bom_formulas.delete(id);
      this.bomFormulaList = this.bomFormulaList.filter(i => i.id !== id);
    },

    // ── GENERIC LIST ITEM CRUD ────────────────────────────────────────────────
    async addListItem(tableName, stateKey, nama) {
      const now = new Date().toISOString();
      const id = await db[tableName].add({ nama, active: true, createdAt: now });
      this[stateKey].push({ id, nama, active: true, createdAt: now });
    },

    async updateListItem(tableName, stateKey, id, changes) {
      await db[tableName].update(id, changes);
      const idx = this[stateKey].findIndex(i => i.id === id);
      if (idx !== -1) Object.assign(this[stateKey][idx], changes);
    },

    async deleteListItem(tableName, stateKey, id) {
      await db[tableName].delete(id);
      this[stateKey] = this[stateKey].filter(i => i.id !== id);
    },

    // ── CLEAR / WIPE CONFIG DATA ──────────────────────────────────────────────
    async clearAllConfigData() {
      await Promise.all([
        db.film_configs.clear(),
        db.bom_formulas.clear(),
        db.resin_items.clear(),
        db.mesin_list.clear(),
        db.operator_list.clear(),
        db.location_list.clear(),
        db.standard_lengths.clear(),
        db.jenis_list.clear(),
        db.jenis_bahan_list.clear(),
        db.kategori_film_list.clear(),
        db.tipe_bahan_list.clear(),
      ]);

      this.filmConfigs = [];
      this.bomFormulaList = [];
      this.resinItemList = [];
      this.mesinList = [];
      this.operatorList = [];
      this.locationList = [];
      this.standardLengthList = [];
      this.jenisList = [];
      this.jenisBahanList = [];
      this.kategoriFilmList = [];
      this.tipeBahanList = [];
    },

    async clearModuleConfigData(moduleKey) {
      if (moduleKey === 'formula_hub') {
        await Promise.all([
          db.film_configs.clear(),
          db.bom_formulas.clear(),
          db.jenis_list.clear(),
          db.jenis_bahan_list.clear(),
          db.kategori_film_list.clear(),
          db.tipe_bahan_list.clear(),
        ]);
        this.filmConfigs = [];
        this.bomFormulaList = [];
        this.jenisList = [];
        this.jenisBahanList = [];
        this.kategoriFilmList = [];
        this.tipeBahanList = [];
      } else if (moduleKey === 'resin') {
        await db.resin_items.clear();
        this.resinItemList = [];
      } else if (moduleKey === 'mesin_operator') {
        await Promise.all([
          db.mesin_list.clear(),
          db.operator_list.clear(),
        ]);
        this.mesinList = [];
        this.operatorList = [];
      } else if (moduleKey === 'gudang_standar') {
        await Promise.all([
          db.location_list.clear(),
          db.standard_lengths.clear(),
        ]);
        this.locationList = [];
        this.standardLengthList = [];
      }
    }
  }
});
