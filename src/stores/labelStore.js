import { defineStore } from 'pinia';
import { db, generateUniqID, getSetting, saveSetting } from '@/db';
import * as XLSX from 'xlsx';
import { parseContinuousLot, detectSupplier, extractCleanParentLot } from '@/services/dataRollParserService';
import { useConfigStore } from '@/stores/configStore';

export const useLabelStore = defineStore('labelStore', {
  state: () => ({
    labels: [],
    loading: false,
    searchTerm: '',
    filterMesin: 'ALL',
    filterStatus: 'ALL',
    sortBy: 'hierarki',
    sortOrder: 'asc',
    currentPage: 1,
    rowsPerPage: 25,
    selectedIds: new Set()
  }),

  getters: {
    totalCount: (state) => state.labels.length,

    duplicateKodePacks: (state) => {
      const counts = {};
      const duplicates = new Set();
      state.labels.forEach(item => {
        if (item.status !== 'HOLD' && item.status !== 'REJECT') {
          const key = (item.kodePack || '') + (item.subKode || '');
          counts[key] = (counts[key] || 0) + 1;
          if (counts[key] > 1) {
            duplicates.add(key);
          }
        }
      });
      return duplicates;
    },

    filteredLabels: (state) => {
      const term = state.searchTerm.toLowerCase().trim();
      let opList = [];
      try {
        const configStore = useConfigStore();
        opList = configStore.operatorList || [];
      } catch (e) {}

      const filtered = state.labels.filter(item => {
        let matchesOperator = (item.operator && item.operator.toLowerCase().includes(term)) ||
          (item.kodeOperator && item.kodeOperator.toLowerCase().includes(term));

        if (!matchesOperator && term && opList.length > 0) {
          const matchedOps = opList.filter(o => 
            (o.nama && o.nama.toLowerCase().includes(term)) ||
            (o.kodeOperator && o.kodeOperator.toLowerCase() === term)
          );
          if (matchedOps.length > 0) {
            matchesOperator = matchedOps.some(o => 
              (item.kodeOperator && item.kodeOperator.toUpperCase() === o.kodeOperator.toUpperCase()) ||
              (item.operator && (item.operator.toUpperCase().includes(o.kodeOperator.toUpperCase()) || item.operator.toUpperCase().includes(o.nama.toUpperCase()))) ||
              (item.turunan && item.turunan.toUpperCase().startsWith(o.kodeOperator.toUpperCase()))
            );
          }
        }

        const matchesSearch = !term || (
          (item.supplier && item.supplier.toLowerCase().includes(term)) ||
          (item.spk && item.spk.toLowerCase().includes(term)) ||
          (item.lot && item.lot.toLowerCase().includes(term)) ||
          (item.turunan && item.turunan.toLowerCase().includes(term)) ||
          matchesOperator ||
          (item.jenis && item.jenis.toLowerCase().includes(term)) ||
          (item.kode && item.kode.toLowerCase().includes(term)) ||
          (item.kodePack && item.kodePack.toLowerCase().includes(term)) ||
          (item.subKode && item.subKode.toLowerCase().includes(term)) ||
          (item.keterangan && item.keterangan.toLowerCase().includes(term)) ||
          (item.uniqId && item.uniqId.toLowerCase().includes(term))
        );

        const matchesMesin = state.filterMesin === 'ALL' || 
          item.mesin === state.filterMesin ||
          (state.filterMesin === 'SLITTING' && (item.mesin === 'SLT01' || item.mesin === 'SLT02' || (item.mesin && item.mesin.includes('SLIT')))) ||
          (state.filterMesin === 'REWIND' && (item.mesin === 'REW01' || (item.mesin && item.mesin.includes('REW')))) ||
          (state.filterMesin === 'CASTING' && (item.mesin === 'CASTING' || (item.mesin && (item.mesin.includes('CAST') || item.mesin.includes('SML'))))) ||
          (state.filterMesin === 'SML' && (item.mesin === 'SML' || (item.mesin && (item.mesin.includes('SML') || item.mesin.includes('CAST'))))) ||
          (state.filterMesin === 'METALIZE' && (item.mesin && item.mesin.includes('MET')));

        const matchesStatus = state.filterStatus === 'ALL' || item.status === state.filterStatus;

        return matchesSearch && matchesMesin && matchesStatus;
      });

      // Natural Hierarchical Slitting Comparator
      const compareHierarki = (a, b) => {
        // 1. Tanggal (Date)
        const dateA = String(a.tanggalFormatted || a.tanggal || '');
        const dateB = String(b.tanggalFormatted || b.tanggal || '');
        const dateComp = state.sortOrder === 'desc' ? dateB.localeCompare(dateA) : dateA.localeCompare(dateB);
        if (dateComp !== 0) return dateComp;

        // 2. Mesin (Machine)
        const machA = String(a.mesin || a.machineName || 'SLITTING').toUpperCase();
        const machB = String(b.mesin || b.machineName || 'SLITTING').toUpperCase();
        const machComp = machA.localeCompare(machB);
        if (machComp !== 0) return machComp;

        // 3. Base Lot (Slitting & Induk, misal M07210726A210/D108 vs M07270726B205/F104)
        const getBaseLot = (item) => {
          const full = String(item.lot || '').toUpperCase();
          const parts = full.split('/');
          if (parts.length >= 3) {
            return parts.slice(0, -1).join('/');
          }
          return full;
        };
        const baseLotA = getBaseLot(a);
        const baseLotB = getBaseLot(b);
        const lotComp = baseLotA.localeCompare(baseLotB, undefined, { numeric: true, sensitivity: 'base' });
        if (lotComp !== 0) return lotComp;

        // 4. Turunan (Set Potong & Arm: HA01 -> HC01 -> HA02 -> HC02...)
        const getTurunanKey = (item) => {
          let t = String(item.turunan || '').toUpperCase();
          if (!t && item.lot) {
            const parts = String(item.lot).split('/');
            if (parts.length >= 2) t = parts[parts.length - 1].toUpperCase();
          }
          const match = t.match(/^([A-Za-z]+)(\d+)(.*)$/);
          if (match) {
            const prefix = match[1];
            const num = parseInt(match[2], 10);
            const extra = match[3] || '';
            return { num, prefix, extra, raw: t };
          }
          return { num: 999999, prefix: t, extra: '', raw: t };
        };

        const tA = getTurunanKey(a);
        const tB = getTurunanKey(b);

        if (tA.num !== tB.num) return tA.num - tB.num;
        if (tA.prefix !== tB.prefix) return tA.prefix.localeCompare(tB.prefix);
        if (tA.extra !== tB.extra) return tA.extra.localeCompare(tB.extra);

        // 5. Kode Pack / Codepack
        const packA = `${a.kodePack || ''}${a.subKode || ''}`;
        const packB = `${b.kodePack || ''}${b.subKode || ''}`;
        const packComp = packA.localeCompare(packB, undefined, { numeric: true, sensitivity: 'base' });
        if (packComp !== 0) return packComp;

        return (Number(a.id) || 0) - (Number(b.id) || 0);
      };

      return [...filtered].sort((a, b) => {
        if (state.sortBy === 'hierarki') {
          return compareHierarki(a, b);
        }

        let cmp = 0;
        if (state.sortBy === 'id') {
          cmp = (Number(a.id) || 0) - (Number(b.id) || 0);
        } else if (state.sortBy === 'tanggal') {
          const timeA = new Date(a.tanggal || 0).getTime();
          const timeB = new Date(b.tanggal || 0).getTime();
          cmp = timeA - timeB;
        } else if (state.sortBy === 'netto') {
          cmp = (parseFloat(a.netto || a.berat) || 0) - (parseFloat(b.netto || b.berat) || 0);
        } else if (state.sortBy === 'lot') {
          const lotA = `${a.lot || ''}${a.turunan || ''}`;
          const lotB = `${b.lot || ''}${b.turunan || ''}`;
          cmp = lotA.localeCompare(lotB, undefined, { numeric: true, sensitivity: 'base' });
        } else if (state.sortBy === 'operator') {
          cmp = (a.operator || '').localeCompare(b.operator || '', undefined, { sensitivity: 'base' });
        } else if (state.sortBy === 'kodePack') {
          const packA = `${a.kodePack || ''}${a.subKode || ''}`;
          const packB = `${b.kodePack || ''}${b.subKode || ''}`;
          cmp = packA.localeCompare(packB, undefined, { numeric: true, sensitivity: 'base' });
        } else if (state.sortBy === 'spk') {
          cmp = (a.spk || '').localeCompare(b.spk || '', undefined, { numeric: true, sensitivity: 'base' });
        } else if (state.sortBy === 'status') {
          cmp = (a.status || '').localeCompare(b.status || '', undefined, { sensitivity: 'base' });
        } else if (state.sortBy === 'mesin') {
          cmp = (a.mesin || '').localeCompare(b.mesin || '', undefined, { sensitivity: 'base' });
        } else if (state.sortBy === 'supplier') {
          cmp = (a.supplier || '').localeCompare(b.supplier || '', undefined, { sensitivity: 'base' });
        } else {
          const valA = String(a[state.sortBy] || '');
          const valB = String(b[state.sortBy] || '');
          cmp = valA.localeCompare(valB, undefined, { numeric: true, sensitivity: 'base' });
        }

        // Secondary tie-breaker with natural slitting hierarchy
        if (cmp === 0) {
          cmp = compareHierarki(a, b);
        }

        return state.sortOrder === 'asc' ? cmp : -cmp;
      });
    },

    paginatedLabels() {
      const start = (this.currentPage - 1) * this.rowsPerPage;
      return this.filteredLabels.slice(start, start + this.rowsPerPage);
    },

    totalPages() {
      return Math.ceil(this.filteredLabels.length / this.rowsPerPage) || 1;
    },

    statistics() {
      const stats = {
        total: this.labels.length,
        slitting: 0,
        rewind: 0,
        casting: 0,
        metalize: 0,
        sml: 0,
        pass: 0,
        hold: 0,
        reject: 0,
        verified: 0,
        unverified: 0,
        totalNetto: 0
      };

      this.labels.forEach(item => {
        const m = (item.mesin || '').toUpperCase();
        if (m.includes('SLIT')) stats.slitting++;
        else if (m.includes('REW')) stats.rewind++;
        else if (m.includes('CAST')) stats.casting++;
        else if (m.includes('MET')) stats.metalize++;
        else if (m.includes('SML')) stats.sml++;
        else stats.slitting++;

        if (item.status === 'HOLD') stats.hold++;
        else if (item.status === 'REJECT') stats.reject++;
        else stats.pass++;

        if (item.verified === 1) stats.verified++;
        else stats.unverified++;

        stats.totalNetto += (parseFloat(item.netto || item.berat) || 0);
      });

      stats.totalNetto = parseFloat(stats.totalNetto.toFixed(2));
      return stats;
    },

    unverifiedLabels: (state) => {
      return state.labels.filter(item => !item.verified || item.verified === 0);
    },

    verifiedLabels: (state) => {
      return state.labels.filter(item => item.verified === 1);
    }
  },

  actions: {
    async loadLabels() {
      this.loading = true;
      try {
        const raw = await db.labels.orderBy('id').toArray();
        
        // Auto-normalize any old field names if present
        const standardLabels = raw.map(item => {
          let lot = item.lot || '';
          let turunan = item.turunan || '';
          let kodeOperator = item.kodeOperator || '';
          let shift = item.shift || '1';
          const supplier = item.supplier || detectSupplier(lot, item.spk);

          if (lot && !lot.includes('/')) {
            const parsed = parseContinuousLot(lot, item.mesin || 'SLITTING', supplier);
            if (parsed && parsed.parsedLot) {
              lot = parsed.parsedLot;
              turunan = turunan || parsed.turunan;
              kodeOperator = kodeOperator || parsed.kodeOperator;
              shift = shift || parsed.shift || '1';
            }
          }

          return {
            ...item,
            lot,
            turunan,
            kodeOperator: kodeOperator || (turunan ? turunan.charAt(0) : 'G'),
            operator: item.operator || (kodeOperator ? `OPERATOR ${kodeOperator}` : 'OPERATOR'),
            shift,
            supplier,
            uniqId: item.uniqId || `LBL-${Date.now().toString(36)}`,
            thickness: item.thickness || item.tebal || item.thick || '18',
            width: item.width || item.lebar || '1000',
            length: item.length || item.panjang || '3000',
            meter: item.meter !== undefined && item.meter !== null && String(item.meter) !== String(item.length) ? String(item.meter) : (item.joint && parseInt(item.joint, 10) > 0 ? String(item.meter || '') : ''),
            joint: item.joint !== undefined ? String(item.joint) : '0',
            netto: item.netto || item.berat || '49.14',
            diameterCore: item.diameterCore || (parseFloat(item.paperCore) < 4.5 && parseFloat(item.paperCore) > 0 ? '3' : '6'),
            paperCore: item.paperCore || '2.50',
            kode: item.kode || (item.lot ? item.lot.substring(0, 3) : 'M01'),
            kodePack: item.kodePack || '3B0826',
            subKode: item.subKode || '0001',
            treatment: item.treatment || 'INSIDE',
            status: item.status === 'OK' ? 'PASS' : (item.status || 'PASS'),
            jenisPrint: item.jenisPrint || 'FINISH GOODS'
          };
        });

        // Load and map all imported Data Rolls (db.data_rolls) so they are available for re-printing
        let mappedDataRolls = [];
        if (db.data_rolls) {
          const rawDataRolls = await db.data_rolls.toArray();
          const existingUuids = new Set(standardLabels.map(l => l.uniqId || l.uuid));

          mappedDataRolls = rawDataRolls
            .filter(r => !existingUuids.has(r.uuid))
            .map(r => {
              let lot = r.lot || '';
              let turunan = r.turunan || '';
              let kodeOperator = r.kodeOperator || '';
              let shift = r.shift || '';
              const supplier = r.supplier || detectSupplier(r.kodeFg || lot, r.spk);

              if (lot && !lot.includes('/')) {
                const parsed = parseContinuousLot(lot, r.machineName || (r.slitting ? 'SLITTING' : 'REWIND'), supplier);
                if (parsed && parsed.parsedLot) {
                  lot = parsed.parsedLot;
                  turunan = turunan || parsed.turunan;
                  kodeOperator = kodeOperator || parsed.kodeOperator;
                  shift = shift || parsed.shift || '';
                }
              }

              const thick = String(r.thickness || '20');
              const width = String(r.width || '1000');
              const length = String(r.length || '4000');
              const jenis = r.jenis || 'VMCPP';
              const density = ["VMPET", "PET"].includes(jenis) ? 1.4 : 0.91;
              const calcNetto = ((parseFloat(thick) * parseFloat(width) * parseFloat(length) * density) / 1000000).toFixed(2);
              const core = r.core || 6;
              const calcCore = (((0.003077 * parseFloat(width) + 3.01532) * core) / 6).toFixed(2);
              const status = (r.qualityStatus || 'PASS').toUpperCase();

              return {
                id: `roll_${r.id || r.uuid}`,
                originalRollId: r.id,
                isDataRoll: true,
                uniqId: r.uuid || `DR-${r.id}`,
                supplier,
                spk: r.spk || 'SPK/INHOUSE/2026',
                tanggal: r.tanggalFormatted || r.tanggal || new Date().toISOString().slice(0, 10),
                tanggalShift: r.tanggalFormatted || r.tanggal || new Date().toISOString().slice(0, 10),
                shift,
                tanggalManual: '',
                mesin: (r.machineName || 'SLITTING').toUpperCase(),
                jenis,
                type: jenis === 'VMCPP' ? 'METALIZED' : 'TRANSPARENT',
                kode: r.kodeFormula || 'M07',
                thickness: thick,
                width,
                length,
                meter: r.meter && String(r.meter) !== String(length) ? String(r.meter) : '',
                joint: r.joint !== undefined ? String(r.joint) : '0',
                netto: String(r.netto || calcNetto),
                paperCore: String(calcCore),
                diameterCore: String(core),
                kodePack: r.kodePack || '3B0826',
                subKode: r.subKode || '0000',
                status,
                treatment: r.treatment || 'INSIDE',
                od: r.od || '',
                lot,
                turunan,
                operator: r.operator || (kodeOperator ? `OPERATOR ${kodeOperator}` : 'OPERATOR'),
                kodeOperator: kodeOperator || (turunan ? turunan.charAt(0) : 'G'),
                reasonDefect: r.reasonDefect || '',
                keterangan: r.reasonDefect || r.keterangan || (status === 'PASS' ? 'QC Pass' : (status === 'HOLD' ? 'Hold non-standard' : 'Reject defect')),
                jenisPrint: 'FINISH GOODS',
                verified: 1,
                synced: 0,
                createdAt: r.createdAt || new Date().toISOString(),
                updatedAt: r.updatedAt || new Date().toISOString()
              };
            });
        }

        this.labels = [...standardLabels, ...mappedDataRolls];
      } catch (err) {
        console.error('Failed to load labels:', err);
      } finally {
        this.loading = false;
      }
    },

    async clearAllLabels() {
      this.loading = true;
      try {
        await db.labels.clear();
        await saveSetting('labels_initialized_flag_v1', true);
        this.labels = [];
        this.selectedIds.clear();
        this.currentPage = 1;
      } finally {
        this.loading = false;
      }
    },

    async addLabel(labelData) {
      const cleanData = { ...labelData };
      delete cleanData.id; // Pastikan id tidak null / 0 agar Dexie auto-increment

      const record = {
        ...cleanData,
        uniqId: cleanData.uniqId || generateUniqID('LBL'),
        synced: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const id = await db.labels.add(record);
      record.id = id;
      this.labels.unshift(record); // Tambahkan ke daftar langsung
      return record;
    },

    async updateLabel(id, updatedFields) {
      const payload = {
        ...updatedFields,
        synced: 0,
        updatedAt: new Date().toISOString()
      };
      await db.labels.update(id, payload);
      const idx = this.labels.findIndex(l => l.id === id);
      if (idx !== -1) {
        this.labels[idx] = { ...this.labels[idx], ...payload };
      }
    },

    async deleteLabel(id) {
      await db.labels.delete(id);
      this.labels = this.labels.filter(l => l.id !== id);
      this.selectedIds.delete(id);
      if (this.currentPage > this.totalPages) {
        this.currentPage = this.totalPages;
      }
    },

    async deleteSelectedLabels(ids) {
      await db.labels.bulkDelete(ids);
      this.labels = this.labels.filter(l => !ids.includes(l.id));
      this.selectedIds.clear();
      if (this.currentPage > this.totalPages) {
        this.currentPage = this.totalPages;
      }
    },

    async duplicateLabel(item) {
      const copy = {
        ...item,
        id: undefined,
        uniqId: generateUniqID(),
        synced: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const newId = await db.labels.add(copy);
      copy.id = newId;
      this.labels.push(copy);
      this.currentPage = this.totalPages;
      return copy;
    },

    async verifyLabels(ids, verifiedBy = 'Data Entry') {
      const now = new Date().toISOString();
      const idList = Array.isArray(ids) ? ids : [ids];
      for (const id of idList) {
        await db.labels.update(id, {
          verified: 1,
          verifiedAt: now,
          verifiedBy,
          updatedAt: now
        });
        const idx = this.labels.findIndex(l => l.id === id);
        if (idx !== -1) {
          this.labels[idx] = {
            ...this.labels[idx],
            verified: 1,
            verifiedAt: now,
            verifiedBy,
            updatedAt: now
          };
        }
      }

      // Auto-sync verified rolls into dataRollStore history batch
      try {
        const { useDataRollStore } = await import('@/stores/dataRollStore');
        const dataRollStore = useDataRollStore();
        await dataRollStore.syncVerifiedDeBatches();
      } catch (err) {
        console.warn('Auto-sync to dataRollStore:', err);
      }
    },

    async unverifyLabels(ids) {
      const now = new Date().toISOString();
      const idList = Array.isArray(ids) ? ids : [ids];
      for (const id of idList) {
        await db.labels.update(id, {
          verified: 0,
          verifiedAt: null,
          verifiedBy: null,
          updatedAt: now
        });
        const idx = this.labels.findIndex(l => l.id === id);
        if (idx !== -1) {
          this.labels[idx] = {
            ...this.labels[idx],
            verified: 0,
            verifiedAt: null,
            verifiedBy: null,
            updatedAt: now
          };
        }
      }
    },

    async updateLabelCell(id, field, value) {
      const now = new Date().toISOString();
      const payload = { [field]: value, updatedAt: now };
      await db.labels.update(id, payload);
      const idx = this.labels.findIndex(l => l.id === id);
      if (idx !== -1) {
        this.labels[idx] = { ...this.labels[idx], ...payload };
      }
    },

    async duplicateLabelsBulk(ids) {
      const idList = Array.isArray(ids) ? ids : [ids];
      const itemsToCopy = this.labels.filter(l => idList.includes(l.id));
      const newItems = [];
      for (const item of itemsToCopy) {
        const copy = {
          ...item,
          id: undefined,
          uniqId: generateUniqID(),
          verified: 0,
          verifiedAt: null,
          verifiedBy: null,
          synced: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        const newId = await db.labels.add(copy);
        copy.id = newId;
        newItems.push(copy);
      }
      this.labels.push(...newItems);
      this.currentPage = this.totalPages;
      return newItems;
    },

    exportToExcel() {
      if (this.labels.length === 0) return;
      let opList = [];
      try {
        const configStore = useConfigStore();
        opList = configStore.operatorList || [];
      } catch (e) {}

      const worksheetData = this.filteredLabels.map((item, index) => {
        const cleanParent = extractCleanParentLot(item.lot, item.turunan);
        let opName = item.operator || '';
        let opCode = item.kodeOperator || '';

        if (opList.length > 0) {
          const found = opList.find(o => 
            (opCode && o.kodeOperator && o.kodeOperator.toUpperCase() === opCode.toUpperCase()) ||
            (opName && o.nama && o.nama.toUpperCase() === opName.toUpperCase()) ||
            (opName && o.kodeOperator && o.kodeOperator.toUpperCase() === opName.toUpperCase())
          );
          if (found) {
            opName = found.nama;
            opCode = found.kodeOperator;
          }
        }

        return {
          No: index + 1,
          'UNIQ ID': item.uniqId,
          Tanggal: item.tanggal,
          Mesin: item.mesin,
          Operator: opName || (opCode ? `OPERATOR ${opCode}` : 'OPERATOR'),
          'Kode Operator': opCode,
          Supplier: item.supplier || 'INHOUSE',
          SPK: item.spk,
          'No Lot': cleanParent, // Bersih dari turunan!
          Turunan: item.turunan || '',
          Jenis: item.jenis,
          Type: item.type,
          OD: item.od,
          Treatment: item.treatment,
          Thickness: item.thickness,
          Width: item.width,
          Length: item.length,
          Joint: item.joint,
          Meter: item.meter,
          Kode: item.kode,
          'Kode Pack': item.kodePack,
          'Sub Kode': item.subKode,
          Status: item.status,
          Netto: item.netto,
          'Paper Core': item.paperCore,
          Keterangan: item.keterangan
        };
      });

      const ws = XLSX.utils.json_to_sheet(worksheetData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Data Label");
      XLSX.writeFile(wb, `LabelData_${new Date().toISOString().slice(0, 10)}.xlsx`);
    }
  }
});
