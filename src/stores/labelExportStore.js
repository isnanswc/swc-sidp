import { defineStore } from 'pinia';
import { db, saveSetting, getSetting } from '@/db';
import { markTableDirty, pushLocalToSupabase } from '@/services/syncService';

export function formatJenisDisplay(jenis) {
  if (!jenis) return 'MET CPP FILM';
  const j = String(jenis).trim().toUpperCase();
  if (j === 'VMCPP') return 'MET CPP FILM';
  if (j === 'CPP') return 'CLEAR CPP FILM';
  if (j === 'VMPET') return 'MET PET FILM';
  if (j === 'PET') return 'CLEAR PET FILM';
  if (j.includes('VM') || j.includes('MET')) return `MET ${j.replace('VM', '').trim()} FILM`;
  return `${j} FILM`;
}

export function formatExportType(kodeFormula, thickness) {
  const k = String(kodeFormula || '').trim().toUpperCase();
  const t = String(thickness || '').trim();
  if (!k && !t) return '';
  // Strip leading E if user already included it, e.g. EM04 -> M04
  const cleanCode = k.startsWith('E') && k.length > 1 ? k.slice(1) : k;
  return `E${cleanCode}${t ? `-${t}` : ''}`;
}

export function calculateExportNetto(thickness, width, length, jenis = 'VMCPP') {
  const thick = parseFloat(thickness);
  const w = parseFloat(width);
  const l = parseFloat(length);
  if (isNaN(thick) || isNaN(w) || isNaN(l) || !thick || !w || !l) return '0.00';

  const j = String(jenis || '').toUpperCase();
  const density = ['VMPET', 'PET'].includes(j) ? 1.4 : 0.91;
  const netto = (thick * w * l * density) / 1000000;
  return isNaN(netto) ? '0.00' : netto.toFixed(2);
}

export function calculateExportCore(width, diameter = 3) {
  const w = parseFloat(width);
  if (isNaN(w) || !w) return '0.00';
  const d = parseFloat(diameter) || 3;
  const core = ((0.003077 * w + 3.01532) * d) / 6;
  return isNaN(core) ? '0.00' : core.toFixed(2);
}

export const useLabelExportStore = defineStore('labelExportStore', {
  state: () => ({
    items: [],
    loading: false,
    searchQuery: '',
    filterJenis: 'ALL',
    selectedIds: [],
    isModalOpen: false,
    editingItem: null,
    isPrintModalOpen: false,
    printItems: [],
    isCloudSynced: true,
    syncNotice: ''
  }),

  getters: {
    filteredItems(state) {
      const q = state.searchQuery.trim().toLowerCase();
      const fj = state.filterJenis;

      return state.items.filter(item => {
        // Filter Jenis
        if (fj !== 'ALL') {
          const itemJenis = (item.jenis || '').toUpperCase();
          if (fj === 'VMCPP' && itemJenis !== 'VMCPP') return false;
          if (fj === 'CPP' && itemJenis !== 'CPP') return false;
        }

        if (!q) return true;

        const pack = (item.codePack || '').toLowerCase();
        const ok = (item.nomorOk || '').toLowerCase();
        const type = (item.type || '').toLowerCase();
        const kf = (item.kodeFormula || '').toLowerCase();
        const jDisplay = (item.jenisDisplay || '').toLowerCase();

        return (
          pack.includes(q) ||
          ok.includes(q) ||
          type.includes(q) ||
          kf.includes(q) ||
          jDisplay.includes(q)
        );
      });
    },

    totalRolls(state) {
      return state.items.length;
    },

    totalNettoKg(state) {
      return state.items.reduce((acc, curr) => acc + (parseFloat(curr.netto) || 0), 0).toFixed(2);
    }
  },

  actions: {
    // Sinkronisasi data ke Cloud Supabase (melalui Settings registry & push)
    async syncToCloud() {
      try {
        if (!db.export_labels) return;
        const all = await db.export_labels.toArray();
        await saveSetting('export_labels_registry', all);
        markTableDirty('export_labels');
        if (typeof navigator !== 'undefined' && navigator.onLine) {
          pushLocalToSupabase('export_labels').catch(() => {});
        }
        this.isCloudSynced = true;
      } catch (err) {
        console.warn('[labelExportStore] Cloud sync warning:', err.message || err);
      }
    },

    // Tarik data terbaru dari Cloud Supabase jika ada update
    async pullFromCloud() {
      try {
        const cloudData = await getSetting('export_labels_registry', null);
        if (Array.isArray(cloudData) && cloudData.length > 0 && db.export_labels) {
          const localItems = await db.export_labels.toArray();
          const localMap = new Map(localItems.map(i => [i.uuid || i.id, i]));
          let hasNew = false;

          for (const item of cloudData) {
            const key = item.uuid || item.id;
            const exist = localMap.get(key);
            if (!exist) {
              const { id, ...cleanItem } = item;
              await db.export_labels.add(cleanItem);
              hasNew = true;
            } else if (new Date(item.updatedAt || 0) > new Date(exist.updatedAt || 0)) {
              await db.export_labels.update(exist.id, {
                ...item,
                id: exist.id
              });
              hasNew = true;
            }
          }

          if (hasNew) {
            await this.loadExportLabels(false);
          }
        }
      } catch (e) {
        console.warn('[labelExportStore] Cloud pull notice:', e);
      }
    },

    async loadExportLabels(withPull = true) {
      this.loading = true;
      try {
        if (db.export_labels) {
          const all = await db.export_labels.toArray();
          // Sort latest created first
          all.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
          this.items = all;
        } else {
          this.items = [];
        }

        // Pull background dari cloud jika online
        if (withPull && typeof navigator !== 'undefined' && navigator.onLine) {
          this.pullFromCloud().catch(() => {});
        }
      } catch (err) {
        console.error('Error loading export labels:', err);
      } finally {
        this.loading = false;
      }
    },

    async saveExportLabel(payload) {
      try {
        const now = new Date().toISOString();
        const netto = payload.netto || calculateExportNetto(payload.thickness, payload.width, payload.length, payload.jenis);
        const core = payload.core || calculateExportCore(payload.width, payload.diameterCore || 3);
        const type = payload.type || formatExportType(payload.kodeFormula, payload.thickness);
        const jenisDisplay = payload.jenisDisplay || formatJenisDisplay(payload.jenis);

        const record = {
          codePack: String(payload.codePack || '').trim().toUpperCase(),
          nomorOk: String(payload.nomorOk || '').trim().toUpperCase(),
          jenis: String(payload.jenis || 'VMCPP').trim().toUpperCase(),
          jenisDisplay,
          kodeFormula: String(payload.kodeFormula || '').trim().toUpperCase(),
          type,
          thickness: parseFloat(payload.thickness) || 0,
          width: parseFloat(payload.width) || 0,
          length: parseFloat(payload.length) || 0,
          treatment: String(payload.treatment || 'INSIDE').trim().toUpperCase(),
          netto: String(netto),
          core: String(core),
          diameterCore: parseFloat(payload.diameterCore) || 3,
          join: String(payload.join !== undefined && payload.join !== null ? payload.join : '0').trim(),
          updatedAt: now
        };

        if (payload.id) {
          // Update existing
          await db.export_labels.update(payload.id, record);
        } else {
          // Create new
          record.uuid = crypto.randomUUID ? crypto.randomUUID() : `EXP_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
          record.createdAt = now;
          await db.export_labels.add(record);
        }

        await this.loadExportLabels(false);
        // Sync ke cloud di latar belakang
        this.syncToCloud().catch(() => {});
        return true;
      } catch (err) {
        console.error('Failed to save export label:', err);
        throw err;
      }
    },

    async deleteExportLabel(id) {
      try {
        await db.export_labels.delete(id);
        this.selectedIds = this.selectedIds.filter(x => x !== id);
        await this.loadExportLabels(false);
        this.syncToCloud().catch(() => {});
      } catch (err) {
        console.error('Failed to delete export label:', err);
        throw err;
      }
    },

    async deleteMultipleExportLabels(ids) {
      try {
        if (!ids || ids.length === 0) return;
        await db.export_labels.bulkDelete(ids);
        this.selectedIds = [];
        await this.loadExportLabels(false);
        this.syncToCloud().catch(() => {});
      } catch (err) {
        console.error('Failed to bulk delete export labels:', err);
        throw err;
      }
    },

    /**
     * Cari kecocokan data dari Manajemen Label Biasa berdasarkan Code Pack
     * MURNI READ-ONLY: Tidak mengubah atau menghapus data label biasa!
     * DIOPTIMASI: Menggunakan Dexie Indexing & batch search agar tidak freeze/lag.
     */
    async lookupStandardLabel(codePackQuery) {
      if (!codePackQuery) return null;
      const clean = String(codePackQuery).trim().toUpperCase();
      if (!clean) return null;

      try {
        if (!db.labels) return null;

        // 1. FAST PATH: Cari langsung via Index Dexie (kodePack / subKode)
        let matched = await db.labels.where('kodePack').equalsIgnoreCase(clean).first();

        // 2. Jika belum ketemu, cari di recent 1000 data label untuk pencocokan gabungan kodePack + subKode
        if (!matched) {
          const recentLabels = await db.labels.orderBy('id').reverse().limit(1000).toArray();
          matched = recentLabels.find(l => {
            const fullPack = `${l.kodePack || ''}${l.subKode || ''}`.toUpperCase();
            return fullPack && (fullPack === clean || fullPack.replace(/[\s-]/g, '') === clean.replace(/[\s-]/g, ''));
          });

          if (!matched) {
            matched = recentLabels.find(l => {
              const p = String(l.kodePack || l.noPack || '').toUpperCase();
              return p && (p === clean || p.replace(/[\s-]/g, '') === clean.replace(/[\s-]/g, ''));
            });
          }

          if (!matched && clean.length >= 4) {
            matched = recentLabels.find(l => {
              const fullPack = `${l.kodePack || ''}${l.subKode || ''}`.toUpperCase();
              return fullPack.includes(clean);
            });
          }
        }

        if (!matched) return null;

        // Petakan data ke format Label Export
        const jenis = (matched.jenis || 'VMCPP').toUpperCase();
        const kodeFormula = (matched.kode || matched.kodeFormula || '').toUpperCase();
        const thickness = parseFloat(matched.thickness) || 0;
        const width = parseFloat(matched.width) || 0;
        const length = parseFloat(matched.length || matched.meter) || 0;
        const treatment = (matched.treatment || 'INSIDE').toUpperCase();
        
        // Aturan: JOIN di Label Export = JOIN METER di Label Biasa (matched.meter)
        const joinMeter = matched.meter !== undefined && matched.meter !== null && String(matched.meter) !== '' 
          ? String(matched.meter).trim() 
          : (matched.joint && parseInt(matched.joint, 10) > 0 ? String(matched.meter || '0') : '0');

        const fullCodePack = `${matched.kodePack || ''}${matched.subKode || ''}`.trim() || matched.noPack || clean;
        const nomorOk = ''; // Sesuai permintaan: kosongkan Nomor OK saat tarik data

        const calculatedNetto = calculateExportNetto(thickness, width, length, jenis);
        const calculatedCore = calculateExportCore(width, matched.diameterCore || (parseFloat(matched.paperCore) < 4.5 && parseFloat(matched.paperCore) > 0 ? 3 : 6));

        return {
          sourceId: matched.id,
          sourceLot: matched.lot ? `${matched.lot}${matched.turunan || ''}` : '',
          codePack: fullCodePack,
          nomorOk: nomorOk,
          jenis,
          jenisDisplay: formatJenisDisplay(jenis),
          kodeFormula,
          type: formatExportType(kodeFormula, thickness),
          thickness,
          width,
          length,
          treatment,
          netto: matched.netto || calculatedNetto,
          core: matched.paperCore || calculatedCore,
          diameterCore: 3, // Standar ekspor Trivesta
          join: joinMeter || '0',
          spk: matched.spk || ''
        };
      } catch (err) {
        console.error('Error looking up standard label:', err);
        return null;
      }
    },

    /**
     * Dapatkan daftar saran Code Pack dari Manajemen Label Biasa untuk auto-suggest
     * DIOPTIMASI: Batasi pembacaan memori ke 500 roll terbaru dan batasi saran max 8 item
     */
    async getStandardLabelSuggestions(query) {
      if (!query || query.length < 2) return [];
      const q = String(query).trim().toUpperCase();

      try {
        if (!db.labels) return [];
        // Ambil dari 500 label terbaru agar responsif dan instan
        const list = await db.labels.orderBy('id').reverse().limit(500).toArray();
        const suggestions = [];
        const seen = new Set();

        for (const l of list) {
          const fullPack = `${l.kodePack || ''}${l.subKode || ''}`.toUpperCase().trim();
          if (fullPack && fullPack.includes(q) && !seen.has(fullPack)) {
            seen.add(fullPack);
            suggestions.push({
              codePack: fullPack,
              lot: `${l.lot || ''}${l.turunan || ''}`,
              spk: l.spk || '',
              jenis: l.jenis || '',
              kode: l.kode || '',
              spec: `${l.thickness || ''}mc x ${l.width || ''}mm x ${l.length || ''}m`
            });
            if (suggestions.length >= 8) break;
          }
        }
        return suggestions;
      } catch (err) {
        return [];
      }
    },

    openCreateModal() {
      this.editingItem = null;
      this.isModalOpen = true;
    },

    openEditModal(item) {
      this.editingItem = { ...item };
      this.isModalOpen = true;
    },

    closeModal() {
      this.isModalOpen = false;
      this.editingItem = null;
    },

    openPrintModal(itemsToPrint) {
      this.printItems = itemsToPrint && itemsToPrint.length > 0 ? itemsToPrint : [];
      this.isPrintModalOpen = true;
    },

    closePrintModal() {
      this.isPrintModalOpen = false;
      this.printItems = [];
    },

    toggleSelect(id) {
      const idx = this.selectedIds.indexOf(id);
      if (idx === -1) {
        this.selectedIds.push(id);
      } else {
        this.selectedIds.splice(idx, 1);
      }
    },

    selectAllFiltered() {
      const allFilteredIds = this.filteredItems.map(i => i.id);
      if (this.selectedIds.length === allFilteredIds.length) {
        this.selectedIds = [];
      } else {
        this.selectedIds = allFilteredIds;
      }
    }
  }
});
