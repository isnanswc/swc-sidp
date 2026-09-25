import { defineStore } from 'pinia';
import { db, generateUUID } from '@/db';
import { supabase, syncState, broadcastRealtimeEvent } from '@/services/syncService';
import { parseTaskQrCode, calculateBeratTeori, playSuccessFeedback, playWarningFeedback, formatScanTimestamp } from '@/services/taskScannerService';

export const useTaskStore = defineStore('taskStore', {
  state: () => ({
    tasks: [],
    activeTaskId: null,
    loading: false,
    filterStatus: 'ALL', // 'ALL' | 'In Progress' | 'Completed'
    filterCategory: 'ALL',
    searchTerm: '',
    sortBy: 'newest', // 'newest' | 'oldest' | 'title'
    scannedSearchTerm: '', // search query for scanned items table in detail view
    lastScanAlert: null // { type: 'success'|'error'|'warning', message: '' }
  }),

  getters: {
    totalTasks: (state) => state.tasks.length,
    inProgressTasks: (state) => state.tasks.filter(t => t.status !== 'Completed').length,
    completedTasks: (state) => state.tasks.filter(t => t.status === 'Completed').length,

    activeTask: (state) => {
      if (!state.activeTaskId) return null;
      return state.tasks.find(t => t.id === state.activeTaskId || t.uuid === state.activeTaskId) || null;
    },

    filteredTasks: (state) => {
      let list = state.tasks.filter(t => {
        const term = state.searchTerm.toLowerCase().trim();
        const matchesSearch = !term ||
          (t.title && t.title.toLowerCase().includes(term)) ||
          (t.taskCode && t.taskCode.toLowerCase().includes(term)) ||
          (t.user && t.user.toLowerCase().includes(term)) ||
          (t.assignee && t.assignee.toLowerCase().includes(term)) ||
          (t.category && t.category.toLowerCase().includes(term)) ||
          (t.notes && t.notes.toLowerCase().includes(term));

        const matchesStatus = state.filterStatus === 'ALL' ||
          (state.filterStatus === 'Completed' ? t.status === 'Completed' : t.status !== 'Completed');

        const matchesCategory = state.filterCategory === 'ALL' || t.category === state.filterCategory;

        return matchesSearch && matchesStatus && matchesCategory;
      });

      // Sorting
      if (state.sortBy === 'newest') {
        list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      } else if (state.sortBy === 'oldest') {
        list.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
      } else if (state.sortBy === 'title') {
        list.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
      }

      return list;
    },

    /**
     * Parent Accordion Summary Generator for activeTask:
     * Format: [jenis] [kf] [thick] MC X [width] MM
     * Subgroup by length: roll count, meter, theoretical weight
     */
    activeTaskSummary: (state) => {
      if (!state.activeTaskId) {
        return { groups: [], grandTotalRoll: 0, grandTotalMeter: 0, grandTotalBeratTeori: 0 };
      }

      const task = state.tasks.find(t => t.id === state.activeTaskId || t.uuid === state.activeTaskId);
      const items = (task && Array.isArray(task.items)) ? task.items : [];

      const groupMap = new Map();
      let grandTotalRoll = 0;
      let grandTotalMeter = 0;
      let grandTotalBeratTeori = 0;

      for (const item of items) {
        const jenis = (item.jenis || 'FILM').trim().toUpperCase();
        const kf = (item.kodeFormula || '-').trim().toUpperCase();
        const thick = parseFloat(item.thickness) || 0;
        const width = parseFloat(item.width) || 0;
        const length = parseFloat(item.length) || 0;
        const beratTeori = parseFloat(item.beratTeori) || 0;

        // Group Key: [jenis] [kf] [thick] MC X [width] MM
        const groupKey = `${jenis} ${kf} ${thick ? thick + ' MC' : ''} X ${width ? width + ' MM' : ''}`.replace(/\s+/g, ' ').trim();

        if (!groupMap.has(groupKey)) {
          groupMap.set(groupKey, {
            key: groupKey,
            jenis,
            kodeFormula: kf,
            thickness: thick,
            width,
            lengthsMap: new Map(),
            totalRoll: 0,
            totalMeter: 0,
            totalBeratTeori: 0
          });
        }

        const grp = groupMap.get(groupKey);
        grp.totalRoll += 1;
        grp.totalMeter += length;
        grp.totalBeratTeori += beratTeori;

        // Subgroup by length
        const lenKey = length;
        if (!grp.lengthsMap.has(lenKey)) {
          grp.lengthsMap.set(lenKey, {
            length: lenKey,
            rollCount: 0,
            subTotalMeter: 0,
            subTotalBeratTeori: 0,
            sampleLot: item.lot || ''
          });
        }

        const sub = grp.lengthsMap.get(lenKey);
        sub.rollCount += 1;
        sub.subTotalMeter += length;
        sub.subTotalBeratTeori += beratTeori;

        grandTotalRoll += 1;
        grandTotalMeter += length;
        grandTotalBeratTeori += beratTeori;
      }

      // Format groups array with nested lengths
      const groups = Array.from(groupMap.values()).map(g => ({
        ...g,
        totalBeratTeori: parseFloat(g.totalBeratTeori.toFixed(2)),
        lengths: Array.from(g.lengthsMap.values())
          .sort((a, b) => b.length - a.length)
          .map(s => ({
            ...s,
            subTotalBeratTeori: parseFloat(s.subTotalBeratTeori.toFixed(2))
          }))
      }));

      return {
        groups,
        grandTotalRoll,
        grandTotalMeter: Math.round(grandTotalMeter),
        grandTotalBeratTeori: parseFloat(grandTotalBeratTeori.toFixed(2))
      };
    },

    /**
     * Filtered scanned items in activeTask
     */
    filteredScannedItems: (state) => {
      const task = state.tasks.find(t => t.id === state.activeTaskId || t.uuid === state.activeTaskId);
      if (!task || !Array.isArray(task.items)) return [];

      const query = (state.scannedSearchTerm || '').trim().toLowerCase();
      if (!query) return task.items;

      return task.items.filter(item => {
        return (item.lot && item.lot.toLowerCase().includes(query)) ||
          (item.turunan && item.turunan.toLowerCase().includes(query)) ||
          (item.kodePack && item.kodePack.toLowerCase().includes(query)) ||
          (item.subKode && item.subKode.toLowerCase().includes(query)) ||
          (item.jenis && item.jenis.toLowerCase().includes(query)) ||
          (item.kodeFormula && item.kodeFormula.toLowerCase().includes(query));
      });
    }
  },

  actions: {
    async loadTasks() {
      this.loading = true;
      try {
        if (!db.tasks) {
          this.tasks = [];
          return;
        }
        const records = await db.tasks.orderBy('id').reverse().toArray();
        this.tasks = records.map(r => ({
          ...r,
          items: Array.isArray(r.items) ? r.items : []
        }));
      } catch (err) {
        console.error('Failed to load tasks from Dexie:', err);
      } finally {
        this.loading = false;
      }
    },

    setActiveTask(taskId) {
      this.activeTaskId = taskId;
      this.scannedSearchTerm = '';
      this.lastScanAlert = null;
    },

    clearActiveTask() {
      this.activeTaskId = null;
      this.scannedSearchTerm = '';
      this.lastScanAlert = null;
    },

    async addTask(taskData) {
      this.loading = true;
      try {
        const nowIso = new Date().toISOString();
        const todayStr = nowIso.slice(0, 10);
        const count = this.tasks.length + 1;
        const codeNum = 1000 + count;

        const newRecord = {
          uuid: generateUUID('TSK'),
          taskCode: `TSK-${codeNum}`,
          title: taskData.title || `Tugas Produksi #${count}`,
          tanggal: taskData.tanggal || todayStr,
          user: taskData.user || 'Operator',
          assignee: taskData.assignee || taskData.user || 'Operator',
          category: taskData.category || 'Picking WIP',
          status: 'In Progress',
          notes: taskData.notes || '',
          items: [],
          synced: 0,
          createdAt: nowIso,
          updatedAt: nowIso
        };

        const id = await db.tasks.add(newRecord);
        newRecord.id = id;
        this.tasks.unshift(newRecord);

        // Sync to cloud in background
        this.pushTasksToCloud().catch(console.warn);

        return newRecord;
      } catch (err) {
        console.error('Failed to add task:', err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async updateTask(id, updates) {
      try {
        const nowIso = new Date().toISOString();
        const payload = {
          ...updates,
          synced: 0,
          updatedAt: nowIso
        };

        await db.tasks.update(id, payload);

        const idx = this.tasks.findIndex(t => t.id === id);
        if (idx !== -1) {
          this.tasks[idx] = { ...this.tasks[idx], ...payload };
        }

        this.pushTasksToCloud().catch(console.warn);
      } catch (err) {
        console.error('Failed to update task:', err);
        throw err;
      }
    },

    async updateTaskStatus(id, newStatus) {
      return this.updateTask(id, { status: newStatus });
    },

    async deleteTask(id) {
      try {
        await db.tasks.delete(id);
        this.tasks = this.tasks.filter(t => t.id !== id);
        if (this.activeTaskId === id) {
          this.activeTaskId = null;
        }
        this.pushTasksToCloud().catch(console.warn);
      } catch (err) {
        console.error('Failed to delete task:', err);
        throw err;
      }
    },

    /**
     * Add Scanned Item to Task with Anti-Duplicate Guard and Audio/Haptic Feedback
     */
    async addScannedItem(taskId, rawQrInput, scannedBy = '') {
      const task = this.tasks.find(t => t.id === taskId || t.uuid === taskId);
      if (!task) {
        playWarningFeedback();
        return { success: false, reason: 'TASK_NOT_FOUND', message: 'Tugas tidak ditemukan!' };
      }

      if (task.status === 'Completed') {
        playWarningFeedback();
        return { success: false, reason: 'TASK_LOCKED', message: 'Tugas ini sudah selesai & terkunci. Buka status tugas terlebih dahulu untuk menambah scan.' };
      }

      // 1. Decode QR code
      const parsed = parseTaskQrCode(rawQrInput);
      if (!parsed || (!parsed.lot && !parsed.rawQr)) {
        playWarningFeedback();
        this.lastScanAlert = { type: 'error', message: 'Format QR Code tidak dikenali atau kosong!' };
        return { success: false, reason: 'INVALID_QR', message: 'Format QR Code tidak dikenali!' };
      }

      const existingItems = Array.isArray(task.items) ? task.items : [];

      // 2. Intra-Task Duplicate Guard (TIDAK TERSIMPAN jika dalam SATU tugas yang sama)
      const isDuplicateInCurrentTask = existingItems.some(item => {
        if (item.rawQr && parsed.rawQr && item.rawQr === parsed.rawQr) return true;

        if (parsed.lot && item.lot === parsed.lot) {
          const t1 = (item.turunan || '').trim().toUpperCase();
          const t2 = (parsed.turunan || '').trim().toUpperCase();
          if (t1 && t2 && t1 === t2) return true;

          if (parsed.kodePack && item.kodePack === parsed.kodePack) {
            const sk1 = (item.subKode || '').trim().toUpperCase();
            const sk2 = (parsed.subKode || '').trim().toUpperCase();
            if (sk1 && sk2 && sk1 === sk2) return true;
          }
        }

        return false;
      });

      if (isDuplicateInCurrentTask) {
        playWarningFeedback();
        const dupMsg = `⚠️ Roll Duplikat! Lot "${parsed.lot} ${parsed.turunan || ''}" (Pack: ${parsed.kodePack}${parsed.subKode}) SUDAH ADA di tugas ini dan TIDAK disimpan ulang!`;
        this.lastScanAlert = { type: 'error', message: dupMsg };
        return {
          success: false,
          reason: 'DUPLICATE_SAME_TASK',
          message: dupMsg,
          item: parsed
        };
      }

      // 3. Inter-Task Cross Check (BEDA TUGAS: BISA TERSIMPAN dengan informasi riwayat tugas lain)
      let foundOtherTask = null;
      for (const otherT of this.tasks) {
        if (otherT.id === task.id || otherT.uuid === task.uuid) continue;
        const oItems = Array.isArray(otherT.items) ? otherT.items : [];
        const match = oItems.find(it => {
          if (it.rawQr && parsed.rawQr && it.rawQr === parsed.rawQr) return true;
          if (parsed.lot && it.lot === parsed.lot) {
            const t1 = (it.turunan || '').trim().toUpperCase();
            const t2 = (parsed.turunan || '').trim().toUpperCase();
            if (t1 && t2 && t1 === t2) return true;
            if (parsed.kodePack && it.kodePack === parsed.kodePack) {
              const sk1 = (it.subKode || '').trim().toUpperCase();
              const sk2 = (parsed.subKode || '').trim().toUpperCase();
              if (sk1 && sk2 && sk1 === sk2) return true;
            }
          }
          return false;
        });

        if (match) {
          foundOtherTask = {
            taskCode: otherT.taskCode,
            title: otherT.title,
            tanggal: otherT.tanggal,
            user: otherT.user || otherT.assignee || 'Operator',
            scannedAt: match.scannedAt
          };
          break;
        }
      }

      // 4. Construct new scanned item record
      const nowIso = new Date().toISOString();
      const newItem = {
        id: `scan_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        rawQr: parsed.rawQr,
        jenis: parsed.jenis || 'FILM',
        kodeFormula: parsed.kodeFormula || '-',
        thickness: parsed.thickness || 0,
        width: parsed.width || 0,
        length: parsed.length || 0,
        lot: parsed.lot || '-',
        turunan: parsed.turunan || '',
        kodePack: parsed.kodePack || '',
        subKode: parsed.subKode || '',
        beratTeori: parsed.beratTeori || 0,
        scannedAt: formatScanTimestamp(nowIso),
        scannedAtIso: nowIso,
        scannedBy: scannedBy || task.user || 'Operator',
        otherTaskNotice: foundOtherTask || null
      };

      const updatedItems = [newItem, ...existingItems];
      const now = new Date().toISOString();

      // 5. Update in local state and Dexie
      task.items = updatedItems;
      task.updatedAt = now;
      task.synced = 0;

      await db.tasks.update(task.id, {
        items: updatedItems,
        updatedAt: now,
        synced: 0
      });

      // 6. Feedback Audio & Haptic
      playSuccessFeedback();

      if (foundOtherTask) {
        this.lastScanAlert = {
          type: 'warning',
          message: `ℹ️ Tersimpan! Roll "${newItem.lot} ${newItem.turunan}" terdeteksi pernah discan pada tugas ${foundOtherTask.taskCode} (${foundOtherTask.title})!`
        };
      } else {
        this.lastScanAlert = {
          type: 'success',
          message: `✓ Berhasil scan roll: ${newItem.lot} ${newItem.turunan} (${newItem.width}mm × ${newItem.length}m, ${newItem.beratTeori} kg)`
        };
      }

      // 7. Sync in background & broadcast
      this.pushTasksToCloud().catch(console.warn);
      broadcastRealtimeEvent('tasks_updated', { taskId: task.id }).catch(() => {});

      return {
        success: true,
        item: newItem,
        wasInOtherTask: Boolean(foundOtherTask),
        otherTaskNotice: foundOtherTask
      };
    },

    async removeScannedItem(taskId, itemId) {
      const task = this.tasks.find(t => t.id === taskId || t.uuid === taskId);
      if (!task || !Array.isArray(task.items)) return;

      const updatedItems = task.items.filter(item => item.id !== itemId);
      const nowIso = new Date().toISOString();

      task.items = updatedItems;
      task.updatedAt = nowIso;
      task.synced = 0;

      await db.tasks.update(task.id, {
        items: updatedItems,
        updatedAt: nowIso,
        synced: 0
      });

      this.pushTasksToCloud().catch(console.warn);
      broadcastRealtimeEvent('tasks_updated', { taskId: task.id }).catch(() => {});
    },

    /**
     * Export all tasks list to Excel
     */
    async exportTasksListToExcel() {
      const XLSX = await import('xlsx');
      const rows = this.filteredTasks.map((t, idx) => ({
        'No': idx + 1,
        'Kode Tugas': t.taskCode,
        'Nama Tugas': t.title,
        'Tanggal': t.tanggal,
        'User / PIC': t.user || t.assignee || '-',
        'Kategori': t.category || '-',
        'Status': t.status,
        'Total Roll': Array.isArray(t.items) ? t.items.length : 0,
        'Catatan': t.notes || '-'
      }));

      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Daftar Tugas');
      XLSX.writeFile(wb, `Daftar_Manajemen_Tugas_${new Date().toISOString().slice(0, 10)}.xlsx`);
    },

    /**
     * Export single task detail with accordion summary and full roll items to Excel
     */
    async exportTaskDetailToExcel(taskId) {
      const XLSX = await import('xlsx');
      const task = this.tasks.find(t => t.id === taskId || t.uuid === taskId);
      if (!task) return;

      const items = Array.isArray(task.items) ? task.items : [];

      // Sheet 1: Rangkuman & Summary Accordion Group
      const summaryInfo = this.activeTaskSummary;
      const summaryRows = [
        { 'INFO TUGAS': 'Kode Tugas', 'DETAIL': task.taskCode },
        { 'INFO TUGAS': 'Nama Tugas', 'DETAIL': task.title },
        { 'INFO TUGAS': 'Tanggal', 'DETAIL': task.tanggal },
        { 'INFO TUGAS': 'PIC / User', 'DETAIL': task.user || task.assignee || '-' },
        { 'INFO TUGAS': 'Kategori', 'DETAIL': task.category || '-' },
        { 'INFO TUGAS': 'Status', 'DETAIL': task.status },
        { 'INFO TUGAS': 'Total Roll Fisik', 'DETAIL': `${summaryInfo.grandTotalRoll} Roll` },
        { 'INFO TUGAS': 'Total Meter Kumulatif', 'DETAIL': `${summaryInfo.grandTotalMeter.toLocaleString('id-ID')} M` },
        { 'INFO TUGAS': 'Total Berat Teori', 'DETAIL': `${summaryInfo.grandTotalBeratTeori.toLocaleString('id-ID')} kg` },
        { 'INFO TUGAS': '', 'DETAIL': '' },
        { 'INFO TUGAS': '=== SUMMARY PER UKURAN ([JENIS] [KF] [THICK] MC X [WIDTH] MM) ===', 'DETAIL': '' }
      ];

      for (const g of summaryInfo.groups) {
        summaryRows.push({
          'INFO TUGAS': `[UKURAN] ${g.key}`,
          'DETAIL': `Total: ${g.totalRoll} Roll | ${g.totalMeter.toLocaleString('id-ID')} M | ${g.totalBeratTeori} kg`
        });
        for (const len of g.lengths) {
          summaryRows.push({
            'INFO TUGAS': `  └ Panjang: ${len.length} M`,
            'DETAIL': `${len.rollCount} Roll | ${len.subTotalMeter.toLocaleString('id-ID')} M | ${len.subTotalBeratTeori} kg`
          });
        }
      }

      // Sheet 2: Rincian Seluruh Roll
      const detailRows = items.map((it, idx) => ({
        'No': idx + 1,
        'Ukuran': `${it.thickness} MC × ${it.width} MM × ${it.length} M`,
        'Jenis Film': it.jenis,
        'Kode Formula': it.kodeFormula,
        'No Lot': it.lot,
        'Turunan': it.turunan || '-',
        'Kode Pack': it.kodePack || '-',
        'Sub Kode': it.subKode || '-',
        'Berat Teori (kg)': it.beratTeori,
        'Tanggal & Jam Scan': it.scannedAt,
        'Petugas Scan': it.scannedBy || '-'
      }));

      const wb = XLSX.utils.book_new();
      const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
      const wsDetail = XLSX.utils.json_to_sheet(detailRows);

      XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary Tugas');
      XLSX.utils.book_append_sheet(wb, wsDetail, 'Rincian Roll');

      const safeName = (task.taskCode || 'Tugas').replace(/[^a-zA-Z0-9_\-]/g, '_');
      XLSX.writeFile(wb, `Rekap_${safeName}_${new Date().toISOString().slice(0, 10)}.xlsx`);
    },

    /**
     * Cloud Sync: Push Tasks to Supabase settings registry
     */
    async pushTasksToCloud() {
      if (!navigator.onLine) return;
      try {
        const allTasks = await db.tasks.toArray();
        const payload = {
          key: 'tasks_management_registry',
          value: JSON.stringify(allTasks.map(t => ({
            uuid: t.uuid,
            taskCode: t.taskCode,
            title: t.title,
            tanggal: t.tanggal,
            user: t.user,
            assignee: t.assignee,
            category: t.category,
            status: t.status,
            notes: t.notes,
            items: t.items || [],
            createdAt: t.createdAt,
            updatedAt: t.updatedAt
          }))),
          updated_at: new Date().toISOString()
        };

        await supabase.from('settings').upsert([payload], { onConflict: 'key' });

        // Mark as synced locally
        for (const t of allTasks) {
          if (t.synced === 0) {
            await db.tasks.update(t.id, { synced: 1 });
            t.synced = 1;
          }
        }
      } catch (err) {
        console.warn('[TaskStore] Push to cloud error:', err);
      }
    },

    /**
     * Cloud Sync: Pull Tasks from Supabase settings registry
     */
    async pullTasksFromCloud() {
      if (!navigator.onLine) return;
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('key, value, updated_at')
          .eq('key', 'tasks_management_registry')
          .single();

        if (error || !data || !data.value) return;

        const cloudTasks = JSON.parse(data.value);
        if (!Array.isArray(cloudTasks)) return;

        const localTasks = await db.tasks.toArray();
        const localMap = new Map(localTasks.map(t => [t.uuid, t]));

        for (const ct of cloudTasks) {
          if (!ct.uuid) continue;
          const local = localMap.get(ct.uuid);

          if (!local) {
            const { id, ...newT } = ct;
            await db.tasks.add({ ...newT, synced: 1 });
          } else {
            // Compare timestamps
            const cloudTime = new Date(ct.updatedAt || 0).getTime();
            const localTime = new Date(local.updatedAt || 0).getTime();
            if (cloudTime > localTime) {
              await db.tasks.update(local.id, { ...ct, id: local.id, synced: 1 });
            }
          }
        }

        await this.loadTasks();
      } catch (err) {
        console.warn('[TaskStore] Pull from cloud error:', err);
      }
    }
  }
});
