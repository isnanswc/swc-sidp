import { defineStore } from 'pinia';
import { db, generateUUID, seedInitialOpnameIfEmpty } from '@/db';
import * as XLSX from 'xlsx';

export const useOpnameStore = defineStore('opnameStore', {
  state: () => ({
    opnameList: [],
    loading: false,
    filterCategory: 'ALL',
    filterStatus: 'ALL',
    searchTerm: ''
  }),

  getters: {
    totalItems: (state) => state.opnameList.length,
    matchItems: (state) => state.opnameList.filter(o => o.difference === 0).length,
    discrepancyItems: (state) => state.opnameList.filter(o => o.difference !== 0).length,

    filteredOpname: (state) => {
      return state.opnameList.filter(o => {
        const term = state.searchTerm.toLowerCase().trim();
        const matchesSearch = !term ||
          o.itemCode.toLowerCase().includes(term) ||
          o.itemName.toLowerCase().includes(term) ||
          (o.location && o.location.toLowerCase().includes(term));

        const matchesCategory = state.filterCategory === 'ALL' || o.category === state.filterCategory;
        const matchesStatus = state.filterStatus === 'ALL' || o.status === state.filterStatus;

        return matchesSearch && matchesCategory && matchesStatus;
      });
    }
  },

  actions: {
    async loadOpname() {
      this.loading = true;
      try {
        this.opnameList = await db.opname.orderBy('id').reverse().toArray();
      } catch (err) {
        console.error('Failed to load opname data:', err);
      } finally {
        this.loading = false;
      }
    },

    async addOpnameItem(itemData) {
      this.loading = true;
      try {
        const sys = parseFloat(itemData.systemStock) || 0;
        const phys = parseFloat(itemData.physicalStock) || 0;
        const diff = phys - sys;

        const newRecord = {
          ...itemData,
          systemStock: sys,
          physicalStock: phys,
          difference: diff,
          uuid: generateUUID('OPN'),
          status: itemData.status || (diff === 0 ? 'Verified' : 'Investigated'),
          synced: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        const id = await db.opname.add(newRecord);
        newRecord.id = id;
        this.opnameList.unshift(newRecord);
        return newRecord;
      } catch (err) {
        console.error('Failed to add opname item:', err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async updateOpnameItem(id, itemData) {
      try {
        const sys = parseFloat(itemData.systemStock) || 0;
        const phys = parseFloat(itemData.physicalStock) || 0;
        const diff = phys - sys;

        const updatePayload = {
          ...itemData,
          systemStock: sys,
          physicalStock: phys,
          difference: diff,
          synced: 0,
          updatedAt: new Date().toISOString()
        };
        await db.opname.update(id, updatePayload);
        const index = this.opnameList.findIndex(o => o.id === id);
        if (index !== -1) {
          this.opnameList[index] = { ...this.opnameList[index], ...updatePayload };
        }
      } catch (err) {
        console.error('Failed to update opname item:', err);
      }
    },

    async deleteOpnameItem(id) {
      try {
        await db.opname.delete(id);
        this.opnameList = this.opnameList.filter(o => o.id !== id);
      } catch (err) {
        console.error('Failed to delete opname item:', err);
      }
    },

    exportToExcel() {
      const data = this.filteredOpname.map((o, idx) => ({
        'No': idx + 1,
        'Kode Item': o.itemCode,
        'Nama Item': o.itemName,
        'Kategori': o.category,
        'Stok Sistem': o.systemStock,
        'Stok Fisik': o.physicalStock,
        'Selisih': o.difference,
        'Satuan': o.unit,
        'Lokasi': o.location,
        'Status': o.status,
        'Catatan': o.notes
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Stok Opname');
      XLSX.writeFile(wb, `Stok_Opname_${new Date().toISOString().slice(0, 10)}.xlsx`);
    }
  }
});
