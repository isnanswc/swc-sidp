import { defineStore } from 'pinia';
import { ref } from 'vue';
import { db, saveSetting, getSetting } from '@/db';
import { supabase } from '@/services/supabaseClient';

export const useFpbStore = defineStore('fpb', () => {
  const fpbList = ref([]);
  const itemSuggestions = ref([]);
  const isLoading = ref(false);

  // Helper sync FPB records ke Cloud (Supabase settings key 'fpb_records_registry')
  const syncFpbToCloud = async () => {
    try {
      if (!db.fpb_records) return;
      const allRecords = await db.fpb_records.toArray();
      await saveSetting('fpb_records_registry', allRecords);

      // Juga simpan item suggestions ke cloud
      if (db.fpb_items) {
        const allItems = await db.fpb_items.toArray();
        await saveSetting('fpb_items_registry', allItems);
      }
    } catch (e) {
      console.warn('[fpbStore] Cloud sync notice:', e.message || e);
    }
  };

  // Helper pull FPB records dari Cloud jika ada data baru dari device lain
  const pullFpbFromCloud = async () => {
    try {
      const cloudData = await getSetting('fpb_records_registry', null);
      if (Array.isArray(cloudData) && cloudData.length > 0 && db.fpb_records) {
        const localList = await db.fpb_records.toArray();
        const localMap = new Map(localList.map(r => [r.uuid || r.nomorFpb, r]));

        for (const cr of cloudData) {
          const key = cr.uuid || cr.nomorFpb;
          const exist = localMap.get(key);
          if (!exist) {
            const { id, ...cleanRec } = cr;
            await db.fpb_records.add(cleanRec);
          } else {
            const cloudTime = new Date(cr.updatedAt || 0).getTime();
            const localTime = new Date(exist.updatedAt || 0).getTime();
            if (cloudTime > localTime) {
              await db.fpb_records.update(exist.id, {
                ...cr,
                id: exist.id
              });
            }
          }
        }
      }

      // Pull item suggestions
      const cloudItems = await getSetting('fpb_items_registry', null);
      if (Array.isArray(cloudItems) && cloudItems.length > 0 && db.fpb_items) {
        for (const ci of cloudItems) {
          const trimmed = String(ci.namaBarang || '').trim();
          if (!trimmed) continue;
          const existItem = await db.fpb_items.where('namaBarang').equalsIgnoreCase(trimmed).first();
          if (!existItem) {
            const { id, ...cleanItem } = ci;
            await db.fpb_items.add(cleanItem);
          }
        }
      }
    } catch (e) {
      console.warn('[fpbStore] Pull cloud notice:', e.message || e);
    }
  };

  // Default master barang pendukung yang biasa diminta di pabrik film
  const DEFAULT_FPB_ITEMS = [
    { namaBarang: 'Lakban Bening 2 Inch (Daimaru)', satuanDefault: 'Roll' },
    { namaBarang: 'Lakban Coklat 2 Inch', satuanDefault: 'Roll' },
    { namaBarang: 'Single Face Karton 120 cm', satuanDefault: 'Roll' },
    { namaBarang: 'Single Face Karton 140 cm', satuanDefault: 'Roll' },
    { namaBarang: 'Single Face Karton 160 cm', satuanDefault: 'Roll' },
    { namaBarang: 'Kain Majun Putih Bersih', satuanDefault: 'Kg' },
    { namaBarang: 'Kain Majun Warna Jahit', satuanDefault: 'Kg' },
    { namaBarang: 'Plastik Wrapping Stretch Film 50 cm', satuanDefault: 'Roll' },
    { namaBarang: 'Sarung Tangan Benang Putih (Bintik)', satuanDefault: 'Pasang' },
    { namaBarang: 'Sarung Tangan Karet Nitrile', satuanDefault: 'Box' },
    { namaBarang: 'Cutter Besar L-500', satuanDefault: 'Pcs' },
    { namaBarang: 'Isi Cutter Besar (Blade L-150)', satuanDefault: 'Tube' },
    { namaBarang: 'Spidol Marker Permanent Hitam (Snowman)', satuanDefault: 'Pcs' },
    { namaBarang: 'Spidol Marker Permanent Merah', satuanDefault: 'Pcs' },
    { namaBarang: 'Spidol Marker Permanent Biru', satuanDefault: 'Pcs' },
    { namaBarang: 'Kertas Label Thermal 100x150 mm', satuanDefault: 'Roll' },
    { namaBarang: 'Ribbon Barcode Wax Resin 110mm x 300m', satuanDefault: 'Roll' },
    { namaBarang: 'Sponge Busa Roll', satuanDefault: 'Pcs' },
    { namaBarang: 'Alkohol 70% / Solvent Pembersih', satuanDefault: 'Liter' },
    { namaBarang: 'Minyak Pelumas Silikon Spray', satuanDefault: 'Kaleng' }
  ];

  // Inisialisasi daftar saran item dari IndexedDB dan Cloud
  const loadItemSuggestions = async () => {
    try {
      if (!db.fpb_items) return;
      const count = await db.fpb_items.count();
      if (count === 0) {
        // Coba pull dulu dari cloud jika ada
        await pullFpbFromCloud();
      }
      
      const countAfterPull = await db.fpb_items.count();
      if (countAfterPull === 0) {
        // Seed default items
        const now = new Date().toISOString();
        for (const it of DEFAULT_FPB_ITEMS) {
          await db.fpb_items.add({
            namaBarang: it.namaBarang,
            satuanDefault: it.satuanDefault,
            lastUsedAt: now,
            usageCount: 1
          });
        }
        await syncFpbToCloud();
      }
      const allItems = await db.fpb_items.orderBy('usageCount').reverse().toArray();
      itemSuggestions.value = allItems;
    } catch (err) {
      console.error('[fpbStore] Gagal memuat item suggestions:', err);
    }
  };

  // Muat semua riwayat FPB (Lokal + Cloud Sync)
  const loadFpbList = async () => {
    isLoading.value = true;
    try {
      if (!db.fpb_records) return;
      // Sinkronkan data terbaru dari Cloud Supabase
      await pullFpbFromCloud();

      const records = await db.fpb_records.orderBy('id').reverse().toArray();
      fpbList.value = records.map(r => ({
        ...r,
        items: typeof r.itemsJson === 'string' ? JSON.parse(r.itemsJson) : (r.items || [])
      }));
    } catch (err) {
      console.error('[fpbStore] Gagal memuat data FPB:', err);
    } finally {
      isLoading.value = false;
    }
  };

  // Generate Nomor FPB otomatis format: FPB/YYYYMM/NO_URUT
  const generateNomorFpb = async (deptCode = 'PROD') => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const period = `${yyyy}${mm}`;
    
    let countInPeriod = 1;
    if (db.fpb_records) {
      const records = await db.fpb_records.toArray();
      const filtered = records.filter(r => r.nomorFpb && r.nomorFpb.includes(period));
      countInPeriod = filtered.length + 1;
    }
    const cleanDept = (deptCode || 'PROD').replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 4);
    return `FPB/${cleanDept}/${period}/${String(countInPeriod).padStart(3, '0')}`;
  };

  // Simpan atau update FPB
  const saveFpb = async (payload) => {
    try {
      const now = new Date().toISOString();
      const items = Array.isArray(payload.items) ? payload.items : [];
      
      const recordData = {
        uuid: payload.uuid || `fpb_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        nomorFpb: payload.nomorFpb || await generateNomorFpb(payload.bagianDept),
        tanggal: payload.tanggal || now.slice(0, 10),
        bagianDept: payload.bagianDept || 'Produksi',
        pemohon: payload.pemohon || '',
        status: payload.status || 'PENDING',
        totalItems: items.length,
        itemsJson: JSON.stringify(items),
        synced: 1,
        updatedAt: now
      };

      let savedId;
      if (payload.id) {
        await db.fpb_records.update(payload.id, recordData);
        savedId = payload.id;
      } else {
        recordData.createdAt = now;
        savedId = await db.fpb_records.add(recordData);
      }

      // Update kamus item suggestions berdasarkan barang yang di-bon
      if (db.fpb_items) {
        for (const it of items) {
          const trimmedName = String(it.namaBarang || '').trim();
          if (!trimmedName) continue;
          
          const existing = await db.fpb_items.where('namaBarang').equalsIgnoreCase(trimmedName).first();
          if (existing) {
            await db.fpb_items.update(existing.id, {
              satuanDefault: it.satuan || existing.satuanDefault,
              lastUsedAt: now,
              usageCount: (existing.usageCount || 1) + 1
            });
          } else {
            await db.fpb_items.add({
              namaBarang: trimmedName,
              satuanDefault: it.satuan || 'Pcs',
              lastUsedAt: now,
              usageCount: 1
            });
          }
        }
      }

      // Sinkronkan ke Cloud Supabase seketika!
      await syncFpbToCloud();

      const allRecords = await db.fpb_records.orderBy('id').reverse().toArray();
      fpbList.value = allRecords.map(r => ({
        ...r,
        items: typeof r.itemsJson === 'string' ? JSON.parse(r.itemsJson) : (r.items || [])
      }));

      return { success: true, id: savedId, record: recordData };
    } catch (err) {
      console.error('[fpbStore] Gagal menyimpan FPB:', err);
      return { success: false, error: err.message };
    }
  };

  // Update status FPB (misal: selesai diterima dari gudang)
  const updateFpbStatus = async (id, status) => {
    try {
      await db.fpb_records.update(id, {
        status,
        updatedAt: new Date().toISOString()
      });
      await syncFpbToCloud();
      const allRecords = await db.fpb_records.orderBy('id').reverse().toArray();
      fpbList.value = allRecords.map(r => ({
        ...r,
        items: typeof r.itemsJson === 'string' ? JSON.parse(r.itemsJson) : (r.items || [])
      }));
      return true;
    } catch (err) {
      console.error('[fpbStore] Gagal update status FPB:', err);
      return false;
    }
  };

  // Hapus FPB
  const deleteFpb = async (id) => {
    try {
      await db.fpb_records.delete(id);
      await syncFpbToCloud();
      const allRecords = await db.fpb_records.orderBy('id').reverse().toArray();
      fpbList.value = allRecords.map(r => ({
        ...r,
        items: typeof r.itemsJson === 'string' ? JSON.parse(r.itemsJson) : (r.items || [])
      }));
      return true;
    } catch (err) {
      console.error('[fpbStore] Gagal menghapus FPB:', err);
      return false;
    }
  };

  return {
    fpbList,
    itemSuggestions,
    isLoading,
    loadItemSuggestions,
    loadFpbList,
    generateNomorFpb,
    saveFpb,
    updateFpbStatus,
    deleteFpb,
    syncFpbToCloud,
    pullFpbFromCloud
  };
});
