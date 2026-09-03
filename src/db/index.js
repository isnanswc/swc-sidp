import Dexie from 'dexie';

export const db = new Dexie('MLabelDB');

// Define database schema
db.version(4).stores({
  labels: '++id, uniqId, supplier, spk, lot, turunan, jenis, type, kode, thickness, width, length, meter, joint, netto, paperCore, kodePack, subKode, status, treatment, od, tanggal, jenisPrint, verified, synced, createdAt, updatedAt',
  tasks: '++id, uuid, taskCode, title, category, status, priority, dueDate, assignee, synced, createdAt, updatedAt',
  opname: '++id, uuid, itemCode, itemName, category, systemStock, physicalStock, difference, unit, location, notes, status, synced, createdAt, updatedAt',
  settings: 'key, value, updatedAt'
});

db.version(5).stores({
  labels: '++id, uniqId, supplier, spk, lot, turunan, jenis, type, kode, thickness, width, length, meter, joint, netto, paperCore, kodePack, subKode, status, treatment, od, tanggal, jenisPrint, verified, synced, createdAt, updatedAt',
  tasks: '++id, uuid, taskCode, title, category, status, priority, dueDate, assignee, synced, createdAt, updatedAt',
  opname: '++id, uuid, itemCode, itemName, category, systemStock, physicalStock, difference, unit, location, notes, status, synced, createdAt, updatedAt',
  settings: 'key, value, updatedAt',
  film_configs: '++id, jenis, kodeFormula, tipeBahan, jenisBahan, kategoriFilm, keterangan, supplier, density, createdAt, updatedAt',
  mesin_list: '++id, nama, active, createdAt',
  jenis_list: '++id, nama, active, createdAt',
  jenis_bahan_list: '++id, nama, active, createdAt',
  kategori_film_list: '++id, nama, active, createdAt',
  tipe_bahan_list: '++id, nama, active, createdAt'
});

db.version(6).stores({
  labels: '++id, uniqId, supplier, spk, lot, turunan, jenis, type, kode, thickness, width, length, meter, joint, netto, paperCore, kodePack, subKode, status, treatment, od, tanggal, jenisPrint, verified, synced, createdAt, updatedAt',
  tasks: '++id, uuid, taskCode, title, category, status, priority, dueDate, assignee, synced, createdAt, updatedAt',
  opname: '++id, uuid, itemCode, itemName, category, systemStock, physicalStock, difference, unit, location, notes, status, synced, createdAt, updatedAt',
  settings: 'key, value, updatedAt',
  film_configs: '++id, jenis, kodeFormula, tipeBahan, jenisBahan, kategoriFilm, keterangan, supplier, density, createdAt, updatedAt',
  mesin_list: '++id, nama, active, createdAt',
  operator_list: '++id, nama, mesin, kodeGrup, kodeOperator, active, createdAt, updatedAt',
  jenis_list: '++id, nama, active, createdAt',
  jenis_bahan_list: '++id, nama, active, createdAt',
  kategori_film_list: '++id, nama, active, createdAt',
  tipe_bahan_list: '++id, nama, active, createdAt'
});

db.version(7).stores({
  labels: '++id, uniqId, supplier, spk, lot, turunan, operator, kodeOperator, jenis, type, kode, thickness, width, length, meter, joint, netto, paperCore, kodePack, subKode, status, treatment, od, tanggal, jenisPrint, verified, synced, createdAt, updatedAt',
  tasks: '++id, uuid, taskCode, title, category, status, priority, dueDate, assignee, synced, createdAt, updatedAt',
  opname: '++id, uuid, itemCode, itemName, category, systemStock, physicalStock, difference, unit, location, notes, status, synced, createdAt, updatedAt',
  settings: 'key, value, updatedAt',
  film_configs: '++id, jenis, kodeFormula, tipeBahan, jenisBahan, kategoriFilm, keterangan, supplier, density, createdAt, updatedAt',
  mesin_list: '++id, nama, active, createdAt',
  operator_list: '++id, nama, mesin, kodeGrup, kodeOperator, active, createdAt, updatedAt',
  jenis_list: '++id, nama, active, createdAt',
  jenis_bahan_list: '++id, nama, active, createdAt',
  kategori_film_list: '++id, nama, active, createdAt',
  tipe_bahan_list: '++id, nama, active, createdAt'
});

db.version(8).stores({
  labels: '++id, uniqId, supplier, spk, lot, turunan, operator, kodeOperator, jenis, type, kode, thickness, width, length, meter, joint, netto, paperCore, kodePack, subKode, status, treatment, od, tanggal, jenisPrint, verified, synced, createdAt, updatedAt',
  tasks: '++id, uuid, taskCode, title, category, status, priority, dueDate, assignee, synced, createdAt, updatedAt',
  opname: '++id, uuid, itemCode, itemName, category, systemStock, physicalStock, difference, unit, location, notes, status, synced, createdAt, updatedAt',
  settings: 'key, value, updatedAt',
  film_configs: '++id, jenis, kodeFormula, tipeBahan, jenisBahan, kategoriFilm, keterangan, supplier, density, createdAt, updatedAt',
  mesin_list: '++id, nama, praKodePack, active, createdAt',
  operator_list: '++id, nama, mesin, kodeGrup, kodeOperator, active, createdAt, updatedAt',
  jenis_list: '++id, nama, active, createdAt',
  jenis_bahan_list: '++id, nama, active, createdAt',
  kategori_film_list: '++id, nama, active, createdAt',
  tipe_bahan_list: '++id, nama, active, createdAt',
  label_signs: '++id, name, triggerType, triggerValue, badgeText, textColor, bgColor, active, createdAt, updatedAt'
});

db.version(9).stores({
  labels: '++id, uniqId, supplier, spk, lot, turunan, operator, kodeOperator, jenis, type, kode, thickness, width, length, meter, joint, netto, paperCore, kodePack, subKode, status, treatment, od, tanggal, jenisPrint, verified, synced, createdAt, updatedAt',
  tasks: '++id, uuid, taskCode, title, category, status, priority, dueDate, assignee, synced, createdAt, updatedAt',
  opname: '++id, uuid, itemCode, itemName, category, systemStock, physicalStock, difference, unit, location, notes, status, synced, createdAt, updatedAt',
  settings: 'key, value, updatedAt',
  film_configs: '++id, jenis, kodeFormula, tipeBahan, jenisBahan, kategoriFilm, keterangan, supplier, density, createdAt, updatedAt',
  mesin_list: '++id, nama, praKodePack, active, createdAt',
  operator_list: '++id, nama, mesin, kodeGrup, kodeOperator, active, createdAt, updatedAt',
  jenis_list: '++id, nama, active, createdAt',
  jenis_bahan_list: '++id, nama, active, createdAt',
  kategori_film_list: '++id, nama, active, createdAt',
  tipe_bahan_list: '++id, nama, active, createdAt',
  inventory_items: '++id, descriptionExcel, descriptionNav, sourceNo, jenis, kodeFormula, thickness, width, length, core, od, tanda, createdAt, updatedAt',
  inventory_stock_uploads: '++id, uploadDate, fileName, totalSku, totalRoll, uploadedBy, itemsJson, createdAt',
  inventory_current_stocks: '++id, itemKey, descriptionExcel, descriptionNav, sourceNo, totalRoll, totalKg, lastUploadDate, updatedAt'
});

db.version(10).stores({
  labels: '++id, uniqId, supplier, spk, lot, turunan, operator, kodeOperator, jenis, type, kode, thickness, width, length, meter, joint, netto, paperCore, kodePack, subKode, status, treatment, od, tanggal, jenisPrint, verified, synced, createdAt, updatedAt',
  tasks: '++id, uuid, taskCode, title, category, status, priority, dueDate, assignee, synced, createdAt, updatedAt',
  opname: '++id, uuid, itemCode, itemName, category, systemStock, physicalStock, difference, unit, location, notes, status, synced, createdAt, updatedAt',
  settings: 'key, value, updatedAt',
  film_configs: '++id, jenis, kodeFormula, tipeBahan, jenisBahan, kategoriFilm, keterangan, supplier, density, createdAt, updatedAt',
  mesin_list: '++id, nama, praKodePack, active, createdAt',
  operator_list: '++id, nama, mesin, kodeGrup, kodeOperator, active, createdAt, updatedAt',
  jenis_list: '++id, nama, active, createdAt',
  jenis_bahan_list: '++id, nama, active, createdAt',
  kategori_film_list: '++id, nama, active, createdAt',
  tipe_bahan_list: '++id, nama, active, createdAt',
  label_signs: '++id, name, triggerType, triggerValue, badgeText, textColor, bgColor, active, createdAt, updatedAt',
  inventory_items: '++id, descriptionExcel, descriptionNav, sourceNo, jenis, kodeFormula, thickness, width, length, core, od, tanda, createdAt, updatedAt',
  inventory_stock_uploads: '++id, uploadDate, fileName, totalSku, totalRoll, uploadedBy, itemsJson, createdAt',
  inventory_current_stocks: '++id, itemKey, descriptionExcel, descriptionNav, sourceNo, totalRoll, totalKg, lastUploadDate, updatedAt',
  wip_rolls: '++id, uuid, tanggalSpk, spk, lot, jenis, kodeFormula, thickness, width, length, core, od, tanda, beratAktual, beratTeori, lokasiAktif, posisiAktif, descriptionExcel, descriptionNav, keterangan, status, createdAt, updatedAt'
});

db.version(11).stores({
  labels: '++id, uniqId, supplier, spk, lot, turunan, operator, kodeOperator, jenis, type, kode, thickness, width, length, meter, joint, netto, paperCore, kodePack, subKode, status, treatment, od, tanggal, jenisPrint, verified, synced, createdAt, updatedAt',
  tasks: '++id, uuid, taskCode, title, category, status, priority, dueDate, assignee, synced, createdAt, updatedAt',
  opname: '++id, uuid, itemCode, itemName, category, systemStock, physicalStock, difference, unit, location, notes, status, synced, createdAt, updatedAt',
  settings: 'key, value, updatedAt',
  film_configs: '++id, jenis, kodeFormula, tipeBahan, jenisBahan, kategoriFilm, keterangan, supplier, density, createdAt, updatedAt',
  mesin_list: '++id, nama, praKodePack, active, createdAt',
  operator_list: '++id, nama, mesin, kodeGrup, kodeOperator, active, createdAt, updatedAt',
  jenis_list: '++id, nama, active, createdAt',
  jenis_bahan_list: '++id, nama, active, createdAt',
  kategori_film_list: '++id, nama, active, createdAt',
  tipe_bahan_list: '++id, nama, active, createdAt',
  label_signs: '++id, name, triggerType, triggerValue, badgeText, textColor, bgColor, active, createdAt, updatedAt',
  inventory_items: '++id, descriptionExcel, descriptionNav, sourceNo, jenis, kodeFormula, thickness, width, length, core, od, tanda, createdAt, updatedAt',
  inventory_stock_uploads: '++id, uploadDate, fileName, totalSku, totalRoll, uploadedBy, itemsJson, createdAt',
  inventory_current_stocks: '++id, itemKey, descriptionExcel, descriptionNav, sourceNo, totalRoll, totalKg, lastUploadDate, updatedAt',
  wip_rolls: '++id, uuid, tanggalSpk, spk, lot, jenis, kodeFormula, thickness, width, length, core, od, tanda, beratAktual, beratTeori, lokasiAktif, posisiAktif, descriptionExcel, descriptionNav, keterangan, status, createdAt, updatedAt',
  scan_reports: '++id, uuid, name, tanggal, machine, totalShifts, totalRolls, totalResinKg, totalRollsKg, totalWasteKg, balanceDiffKg, shiftsJson, createdAt, updatedAt'
});

db.version(12).stores({
  labels: '++id, uniqId, supplier, spk, lot, turunan, operator, kodeOperator, jenis, type, kode, thickness, width, length, meter, joint, netto, paperCore, kodePack, subKode, status, treatment, od, tanggal, jenisPrint, verified, synced, createdAt, updatedAt',
  tasks: '++id, uuid, taskCode, title, category, status, priority, dueDate, assignee, synced, createdAt, updatedAt',
  opname: '++id, uuid, itemCode, itemName, category, systemStock, physicalStock, difference, unit, location, notes, status, synced, createdAt, updatedAt',
  settings: 'key, value, updatedAt',
  film_configs: '++id, jenis, kodeFormula, tipeBahan, jenisBahan, kategoriFilm, keterangan, supplier, density, createdAt, updatedAt',
  mesin_list: '++id, nama, praKodePack, active, createdAt',
  operator_list: '++id, nama, mesin, kodeGrup, kodeOperator, active, createdAt, updatedAt',
  jenis_list: '++id, nama, active, createdAt',
  jenis_bahan_list: '++id, nama, active, createdAt',
  kategori_film_list: '++id, nama, active, createdAt',
  tipe_bahan_list: '++id, nama, active, createdAt',
  label_signs: '++id, name, triggerType, triggerValue, badgeText, textColor, bgColor, active, createdAt, updatedAt',
  inventory_items: '++id, descriptionExcel, descriptionNav, sourceNo, jenis, kodeFormula, thickness, width, length, core, od, tanda, createdAt, updatedAt',
  inventory_stock_uploads: '++id, uploadDate, fileName, totalSku, totalRoll, uploadedBy, itemsJson, createdAt',
  inventory_current_stocks: '++id, itemKey, descriptionExcel, descriptionNav, sourceNo, totalRoll, totalKg, lastUploadDate, updatedAt',
  wip_rolls: '++id, uuid, updateId, tanggalSpk, spk, lot, jenis, kodeFormula, thickness, width, length, core, od, tanda, beratAktual, beratTeori, lokasiAktif, posisiAktif, descriptionExcel, descriptionNav, keterangan, status, createdAt, updatedAt',
  scan_reports: '++id, uuid, name, tanggal, machine, totalShifts, totalRolls, totalResinKg, totalRollsKg, totalWasteKg, balanceDiffKg, shiftsJson, createdAt, updatedAt',
  wip_updates: '++id, uuid, title, tanggal, fileName, totalRolls, totalKg, isActive, rollsJson, createdAt, updatedAt'
});

db.version(13).stores({
  labels: '++id, uniqId, supplier, spk, lot, turunan, operator, kodeOperator, jenis, type, kode, thickness, width, length, meter, joint, netto, paperCore, kodePack, subKode, status, treatment, od, tanggal, jenisPrint, verified, synced, createdAt, updatedAt',
  tasks: '++id, uuid, taskCode, title, category, status, priority, dueDate, assignee, synced, createdAt, updatedAt',
  opname: '++id, uuid, itemCode, itemName, category, systemStock, physicalStock, difference, unit, location, notes, status, synced, createdAt, updatedAt',
  settings: 'key, value, updatedAt',
  film_configs: '++id, jenis, kodeFormula, tipeBahan, jenisBahan, kategoriFilm, keterangan, supplier, density, createdAt, updatedAt',
  mesin_list: '++id, nama, praKodePack, active, createdAt',
  operator_list: '++id, nama, mesin, kodeGrup, kodeOperator, active, createdAt, updatedAt',
  jenis_list: '++id, nama, active, createdAt',
  jenis_bahan_list: '++id, nama, active, createdAt',
  kategori_film_list: '++id, nama, active, createdAt',
  tipe_bahan_list: '++id, nama, active, createdAt',
  label_signs: '++id, name, triggerType, triggerValue, badgeText, textColor, bgColor, active, createdAt, updatedAt',
  inventory_items: '++id, descriptionExcel, descriptionNav, sourceNo, jenis, kodeFormula, thickness, width, length, core, od, tanda, createdAt, updatedAt',
  inventory_stock_uploads: '++id, uploadDate, fileName, totalSku, totalRoll, uploadedBy, itemsJson, createdAt',
  inventory_current_stocks: '++id, itemKey, descriptionExcel, descriptionNav, sourceNo, totalRoll, totalKg, lastUploadDate, updatedAt',
  wip_rolls: '++id, uuid, updateId, tanggalSpk, spk, lot, jenis, kodeFormula, thickness, width, length, core, od, tanda, beratAktual, beratTeori, lokasiAktif, posisiAktif, descriptionExcel, descriptionNav, keterangan, status, createdAt, updatedAt',
  scan_reports: '++id, uuid, name, tanggal, machine, totalShifts, totalRolls, totalResinKg, totalRollsKg, totalWasteKg, balanceDiffKg, shiftsJson, createdAt, updatedAt',
  wip_updates: '++id, uuid, title, tanggal, fileName, totalRolls, totalKg, isActive, rollsJson, createdAt, updatedAt',
  location_list: '++id, nama, jenis, alias, kapasitas, keterangan, active, createdAt, updatedAt'
});

db.version(14).stores({
  labels: '++id, uniqId, supplier, spk, lot, turunan, operator, kodeOperator, jenis, type, kode, thickness, width, length, meter, joint, netto, paperCore, kodePack, subKode, status, treatment, od, tanggal, jenisPrint, verified, synced, createdAt, updatedAt',
  tasks: '++id, uuid, taskCode, title, category, status, priority, dueDate, assignee, synced, createdAt, updatedAt',
  opname: '++id, uuid, itemCode, itemName, category, systemStock, physicalStock, difference, unit, location, notes, status, synced, createdAt, updatedAt',
  settings: 'key, value, updatedAt',
  film_configs: '++id, jenis, kodeFormula, alias, tipeBahan, jenisBahan, kategoriFilm, keterangan, supplier, density, createdAt, updatedAt',
  mesin_list: '++id, nama, praKodePack, active, createdAt',
  operator_list: '++id, nama, mesin, kodeGrup, kodeOperator, active, createdAt, updatedAt',
  jenis_list: '++id, nama, active, createdAt',
  jenis_bahan_list: '++id, nama, active, createdAt',
  kategori_film_list: '++id, nama, active, createdAt',
  tipe_bahan_list: '++id, nama, active, createdAt',
  label_signs: '++id, name, triggerType, triggerValue, badgeText, textColor, bgColor, active, createdAt, updatedAt',
  inventory_items: '++id, descriptionExcel, descriptionNav, sourceNo, jenis, kodeFormula, thickness, width, length, core, od, tanda, createdAt, updatedAt',
  inventory_stock_uploads: '++id, uploadDate, fileName, totalSku, totalRoll, uploadedBy, itemsJson, createdAt',
  inventory_current_stocks: '++id, itemKey, descriptionExcel, descriptionNav, sourceNo, totalRoll, totalKg, lastUploadDate, updatedAt',
  wip_rolls: '++id, uuid, updateId, tanggalSpk, spk, lot, jenis, kodeFormula, thickness, width, length, core, od, tanda, beratAktual, beratTeori, lokasiAktif, posisiAktif, descriptionExcel, descriptionNav, keterangan, status, createdAt, updatedAt',
  scan_reports: '++id, uuid, name, tanggal, machine, totalShifts, totalRolls, totalResinKg, totalRollsKg, totalWasteKg, balanceDiffKg, shiftsJson, createdAt, updatedAt',
  wip_updates: '++id, uuid, title, tanggal, fileName, totalRolls, totalKg, isActive, rollsJson, createdAt, updatedAt',
  location_list: '++id, nama, jenis, alias, kapasitas, keterangan, active, createdAt, updatedAt',
  standard_lengths: '++id, thickness, maxPanjangFg, maxPanjangJumbo, active, createdAt, updatedAt'
});

db.version(15).stores({
  labels: '++id, uniqId, supplier, spk, lot, turunan, operator, kodeOperator, jenis, type, kode, thickness, width, length, meter, joint, netto, paperCore, kodePack, subKode, status, treatment, od, tanggal, jenisPrint, verified, synced, createdAt, updatedAt',
  tasks: '++id, uuid, taskCode, title, category, status, priority, dueDate, assignee, synced, createdAt, updatedAt',
  opname: '++id, uuid, itemCode, itemName, category, systemStock, physicalStock, difference, unit, location, notes, status, synced, createdAt, updatedAt',
  settings: 'key, value, updatedAt',
  film_configs: '++id, jenis, kodeFormula, alias, tipeBahan, jenisBahan, kategoriFilm, keterangan, supplier, density, createdAt, updatedAt',
  mesin_list: '++id, nama, praKodePack, active, createdAt',
  operator_list: '++id, nama, mesin, kodeGrup, kodeOperator, active, createdAt, updatedAt',
  jenis_list: '++id, nama, active, createdAt',
  jenis_bahan_list: '++id, nama, active, createdAt',
  kategori_film_list: '++id, nama, active, createdAt',
  tipe_bahan_list: '++id, nama, active, createdAt',
  label_signs: '++id, name, triggerType, triggerValue, badgeText, textColor, bgColor, active, createdAt, updatedAt',
  inventory_items: '++id, descriptionExcel, descriptionNav, sourceNo, jenis, kodeFormula, thickness, width, length, core, od, tanda, createdAt, updatedAt',
  inventory_stock_uploads: '++id, uploadDate, fileName, totalSku, totalRoll, uploadedBy, itemsJson, createdAt',
  inventory_current_stocks: '++id, itemKey, descriptionExcel, descriptionNav, sourceNo, totalRoll, totalKg, lastUploadDate, updatedAt',
  wip_rolls: '++id, uuid, updateId, tanggalSpk, spk, lot, jenis, kodeFormula, thickness, width, length, core, od, tanda, beratAktual, beratTeori, lokasiAktif, posisiAktif, descriptionExcel, descriptionNav, keterangan, status, createdAt, updatedAt',
  scan_reports: '++id, uuid, name, tanggal, machine, totalShifts, totalRolls, totalResinKg, totalRollsKg, totalWasteKg, balanceDiffKg, shiftsJson, createdAt, updatedAt',
  wip_updates: '++id, uuid, title, tanggal, fileName, totalRolls, totalKg, isActive, rollsJson, createdAt, updatedAt',
  location_list: '++id, nama, jenis, alias, kapasitas, keterangan, active, createdAt, updatedAt',
  standard_lengths: '++id, thickness, maxPanjangFg, maxPanjangJumbo, active, createdAt, updatedAt',
  resin_items: '++id, resin, kode, nomorItem, active, createdAt, updatedAt'
});

db.version(16).stores({
  labels: '++id, uuid, barcode, noPack, tanggal, spk, lot, jenis, jenisBahan, tipeBahan, supplier, kodeFormula, ketebalan, lebar, beratGross, beratNetto, beratBobin, beratSelisih, beratTeori, panjang, noJoint, operator, shift, keterangan, noMesin, line, density, tanda, core, createdAt, updatedAt',
  settings: 'key, value, updatedAt',
  film_configs: '++id, jenis, tipeBahan, jenisBahan, kategoriFilm, kodeFormula, alias, keterangan, supplier, density, active, createdAt, updatedAt',
  mesin_list: '++id, nama, praKodePack, active, createdAt, updatedAt',
  operator_list: '++id, nama, mesin, kodeGrup, kodeOperator, active, createdAt, updatedAt',
  jenis_list: '++id, nama, active, createdAt',
  jenis_bahan_list: '++id, nama, active, createdAt',
  kategori_film_list: '++id, nama, active, createdAt',
  tipe_bahan_list: '++id, nama, active, createdAt',
  label_signs: '++id, name, triggerType, triggerValue, badgeText, textColor, bgColor, active, createdAt, updatedAt',
  inventory_items: '++id, descriptionExcel, descriptionNav, sourceNo, jenis, kodeFormula, thickness, width, length, core, od, tanda, createdAt, updatedAt',
  inventory_stock_uploads: '++id, uploadDate, fileName, totalSku, totalRoll, uploadedBy, itemsJson, createdAt',
  inventory_current_stocks: '++id, itemKey, descriptionExcel, descriptionNav, sourceNo, totalRoll, totalKg, lastUploadDate, updatedAt',
  wip_rolls: '++id, uuid, updateId, tanggalSpk, spk, lot, jenis, kodeFormula, thickness, width, length, core, od, tanda, beratAktual, beratTeori, lokasiAktif, posisiAktif, descriptionExcel, descriptionNav, keterangan, status, createdAt, updatedAt',
  scan_reports: '++id, uuid, name, tanggal, machine, totalShifts, totalRolls, totalResinKg, totalRollsKg, totalWasteKg, balanceDiffKg, shiftsJson, createdAt, updatedAt',
  wip_updates: '++id, uuid, title, tanggal, fileName, totalRolls, totalKg, isActive, rollsJson, createdAt, updatedAt',
  location_list: '++id, nama, jenis, alias, kapasitas, keterangan, active, createdAt, updatedAt',
  standard_lengths: '++id, thickness, maxPanjangFg, maxPanjangJumbo, active, createdAt, updatedAt',
  resin_items: '++id, resin, kode, nomorItem, active, createdAt, updatedAt',
  bom_formulas: '++id, formula, rm, persen, active, createdAt, updatedAt'
});

db.version(17).stores({
  labels: '++id, uuid, barcode, noPack, tanggal, spk, lot, jenis, jenisBahan, tipeBahan, supplier, kodeFormula, ketebalan, lebar, beratGross, beratNetto, beratBobin, beratSelisih, beratTeori, panjang, noJoint, operator, shift, keterangan, noMesin, line, density, tanda, core, createdAt, updatedAt',
  settings: 'key, value, updatedAt',
  film_configs: '++id, jenis, tipeBahan, jenisBahan, kategoriFilm, kodeFormula, alias, keterangan, supplier, density, active, createdAt, updatedAt',
  mesin_list: '++id, nama, praKodePack, active, createdAt, updatedAt',
  operator_list: '++id, nama, mesin, kodeGrup, kodeOperator, active, createdAt, updatedAt',
  jenis_list: '++id, nama, active, createdAt',
  jenis_bahan_list: '++id, nama, active, createdAt',
  kategori_film_list: '++id, nama, active, createdAt',
  tipe_bahan_list: '++id, nama, active, createdAt',
  label_signs: '++id, name, triggerType, triggerValue, badgeText, textColor, bgColor, active, createdAt, updatedAt',
  inventory_items: '++id, descriptionExcel, descriptionNav, sourceNo, jenis, kodeFormula, thickness, width, length, core, od, tanda, createdAt, updatedAt',
  inventory_stock_uploads: '++id, uploadDate, fileName, totalSku, totalRoll, uploadedBy, itemsJson, createdAt',
  inventory_current_stocks: '++id, itemKey, descriptionExcel, descriptionNav, sourceNo, totalRoll, totalKg, lastUploadDate, updatedAt',
  wip_rolls: '++id, uuid, updateId, tanggalSpk, spk, lot, jenis, kodeFormula, thickness, width, length, core, od, tanda, beratAktual, beratTeori, lokasiAktif, posisiAktif, descriptionExcel, descriptionNav, keterangan, status, createdAt, updatedAt',
  scan_reports: '++id, uuid, name, tanggal, machine, totalShifts, totalRolls, totalResinKg, totalRollsKg, totalWasteKg, balanceDiffKg, shiftsJson, createdAt, updatedAt',
  wip_updates: '++id, uuid, title, tanggal, fileName, totalRolls, totalKg, isActive, rollsJson, createdAt, updatedAt',
  location_list: '++id, nama, jenis, alias, kapasitas, keterangan, active, createdAt, updatedAt',
  standard_lengths: '++id, thickness, maxPanjangFg, maxPanjangJumbo, active, createdAt, updatedAt',
  resin_items: '++id, resin, kode, nomorItem, active, createdAt, updatedAt',
  bom_formulas: '++id, formula, rm, persen, active, createdAt, updatedAt',
  data_rolls: '++id, uuid, kodeFg, lot, turunan, jenis, kodeFormula, thickness, width, length, core, treatment, od, slitting, rewind, sml, machineName, tanggal, tanggalFormatted, spk, kodePack, subKode, qualityStatus, createdAt, updatedAt'
});

db.version(18).stores({
  labels: '++id, uuid, barcode, noPack, tanggal, spk, lot, turunan, operator, kodeOperator, jenis, type, kode, thickness, width, length, meter, joint, netto, paperCore, kodePack, subKode, status, treatment, od, jenisPrint, verified, synced, createdAt, updatedAt',
  settings: 'key, value, updatedAt',
  film_configs: '++id, jenis, tipeBahan, jenisBahan, kategoriFilm, kodeFormula, alias, keterangan, supplier, density, active, createdAt, updatedAt',
  mesin_list: '++id, nama, praKodePack, active, createdAt, updatedAt',
  operator_list: '++id, nama, mesin, kodeGrup, kodeOperator, active, createdAt, updatedAt',
  jenis_list: '++id, nama, active, createdAt',
  jenis_bahan_list: '++id, nama, active, createdAt',
  kategori_film_list: '++id, nama, active, createdAt',
  tipe_bahan_list: '++id, nama, active, createdAt',
  label_signs: '++id, name, triggerType, triggerValue, badgeText, textColor, bgColor, active, createdAt, updatedAt',
  inventory_items: '++id, descriptionExcel, descriptionNav, sourceNo, jenis, kodeFormula, thickness, width, length, core, od, tanda, createdAt, updatedAt',
  inventory_stock_uploads: '++id, uploadDate, fileName, totalSku, totalRoll, uploadedBy, itemsJson, createdAt',
  inventory_current_stocks: '++id, itemKey, descriptionExcel, descriptionNav, sourceNo, totalRoll, totalKg, lastUploadDate, updatedAt',
  wip_rolls: '++id, uuid, updateId, tanggalSpk, spk, lot, jenis, kodeFormula, thickness, width, length, core, od, tanda, beratAktual, beratTeori, lokasiAktif, posisiAktif, descriptionExcel, descriptionNav, keterangan, status, createdAt, updatedAt',
  scan_reports: '++id, uuid, name, tanggal, machine, totalShifts, totalRolls, totalResinKg, totalRollsKg, totalWasteKg, balanceDiffKg, shiftsJson, createdAt, updatedAt',
  wip_updates: '++id, uuid, title, tanggal, fileName, totalRolls, totalKg, isActive, rollsJson, createdAt, updatedAt',
  location_list: '++id, nama, jenis, alias, kapasitas, keterangan, active, createdAt, updatedAt',
  standard_lengths: '++id, thickness, maxPanjangFg, maxPanjangJumbo, active, createdAt, updatedAt',
  resin_items: '++id, resin, kode, nomorItem, active, createdAt, updatedAt',
  bom_formulas: '++id, formula, rm, persen, active, createdAt, updatedAt',
  data_rolls: '++id, uuid, uploadId, batchId, kodeFg, lot, turunan, jenis, kodeFormula, thickness, width, length, core, treatment, od, slitting, rewind, sml, machineName, tanggal, tanggalFormatted, spk, kodePack, subKode, qualityStatus, verified, createdAt, updatedAt',
  data_roll_uploads: '++id, uuid, uploadDate, batchName, source, fileName, machine, totalRolls, totalKg, passCount, holdCount, rejectCount, uploadedBy, status, rollsJson, createdAt, updatedAt'
});

db.version(19).stores({
  labels: '++id, uuid, barcode, noPack, tanggal, spk, lot, turunan, operator, kodeOperator, jenis, type, kode, thickness, width, length, meter, joint, netto, paperCore, kodePack, subKode, status, treatment, od, jenisPrint, verified, synced, createdAt, updatedAt',
  settings: 'key, value, updatedAt',
  film_configs: '++id, jenis, tipeBahan, jenisBahan, kategoriFilm, kodeFormula, alias, keterangan, supplier, density, active, createdAt, updatedAt',
  mesin_list: '++id, nama, praKodePack, active, createdAt, updatedAt',
  operator_list: '++id, nama, mesin, kodeGrup, kodeOperator, active, createdAt, updatedAt',
  jenis_list: '++id, nama, active, createdAt',
  jenis_bahan_list: '++id, nama, active, createdAt',
  kategori_film_list: '++id, nama, active, createdAt',
  tipe_bahan_list: '++id, nama, active, createdAt',
  label_signs: '++id, name, triggerType, triggerValue, badgeText, textColor, bgColor, active, createdAt, updatedAt',
  inventory_items: '++id, descriptionExcel, descriptionNav, sourceNo, jenis, kodeFormula, thickness, width, length, core, od, tanda, createdAt, updatedAt',
  inventory_stock_uploads: '++id, uploadDate, fileName, totalSku, totalRoll, uploadedBy, itemsJson, createdAt',
  inventory_current_stocks: '++id, itemKey, descriptionExcel, descriptionNav, sourceNo, totalRoll, totalKg, lastUploadDate, updatedAt',
  wip_rolls: '++id, uuid, updateId, tanggalSpk, spk, lot, jenis, kodeFormula, thickness, width, length, core, od, tanda, beratAktual, beratTeori, lokasiAktif, posisiAktif, descriptionExcel, descriptionNav, keterangan, status, createdAt, updatedAt',
  scan_reports: '++id, uuid, name, tanggal, machine, totalShifts, totalRolls, totalResinKg, totalRollsKg, totalWasteKg, balanceDiffKg, shiftsJson, createdAt, updatedAt',
  wip_updates: '++id, uuid, title, tanggal, fileName, totalRolls, totalKg, isActive, rollsJson, createdAt, updatedAt',
  location_list: '++id, nama, jenis, alias, kapasitas, keterangan, active, createdAt, updatedAt',
  standard_lengths: '++id, thickness, maxPanjangFg, maxPanjangJumbo, active, createdAt, updatedAt',
  resin_items: '++id, resin, kode, nomorItem, active, createdAt, updatedAt',
  bom_formulas: '++id, formula, rm, persen, active, createdAt, updatedAt',
  data_rolls: '++id, uuid, uploadId, batchId, kodeFg, lot, turunan, jenis, kodeFormula, thickness, width, length, core, treatment, od, slitting, rewind, sml, machineName, tanggal, tanggalFormatted, spk, kodePack, subKode, qualityStatus, verified, createdAt, updatedAt',
  data_roll_uploads: '++id, uuid, uploadDate, batchName, source, fileName, machine, totalRolls, totalKg, passCount, holdCount, rejectCount, uploadedBy, status, rollsJson, createdAt, updatedAt'
});

db.version(20).stores({
  labels: '++id, uuid, barcode, noPack, tanggal, spk, lot, turunan, operator, kodeOperator, jenis, type, kode, thickness, width, length, meter, joint, netto, paperCore, kodePack, subKode, status, treatment, od, jenisPrint, verified, synced, createdAt, updatedAt',
  settings: 'key, value, updatedAt',
  film_configs: '++id, jenis, tipeBahan, jenisBahan, kategoriFilm, kodeFormula, alias, keterangan, supplier, density, active, createdAt, updatedAt',
  mesin_list: '++id, nama, praKodePack, active, createdAt, updatedAt',
  operator_list: '++id, nama, mesin, kodeGrup, kodeOperator, active, createdAt, updatedAt',
  jenis_list: '++id, nama, active, createdAt',
  jenis_bahan_list: '++id, nama, active, createdAt',
  kategori_film_list: '++id, nama, active, createdAt',
  tipe_bahan_list: '++id, nama, active, createdAt',
  label_signs: '++id, name, triggerType, triggerValue, badgeText, textColor, bgColor, active, createdAt, updatedAt',
  inventory_items: '++id, descriptionExcel, descriptionNav, sourceNo, jenis, kodeFormula, thickness, width, length, core, od, tanda, createdAt, updatedAt',
  inventory_stock_uploads: '++id, uploadDate, fileName, totalSku, totalRoll, uploadedBy, itemsJson, createdAt',
  inventory_current_stocks: '++id, itemKey, descriptionExcel, descriptionNav, sourceNo, totalRoll, totalKg, lastUploadDate, updatedAt',
  wip_rolls: '++id, uuid, updateId, tanggalSpk, spk, lot, jenis, kodeFormula, thickness, width, length, core, od, tanda, beratAktual, beratTeori, lokasiAktif, posisiAktif, descriptionExcel, descriptionNav, keterangan, status, createdAt, updatedAt',
  scan_reports: '++id, uuid, name, tanggal, machine, totalShifts, totalRolls, totalResinKg, totalRollsKg, totalWasteKg, balanceDiffKg, shiftsJson, createdAt, updatedAt',
  wip_updates: '++id, uuid, title, tanggal, fileName, totalRolls, totalKg, isActive, rollsJson, createdAt, updatedAt',
  location_list: '++id, nama, jenis, alias, kapasitas, keterangan, active, createdAt, updatedAt',
  standard_lengths: '++id, thickness, maxPanjangFg, maxPanjangJumbo, active, createdAt, updatedAt',
  resin_items: '++id, resin, kode, nomorItem, active, createdAt, updatedAt',
  bom_formulas: '++id, formula, rm, persen, active, createdAt, updatedAt',
  data_rolls: '++id, uuid, uploadId, batchId, kodeFg, lot, turunan, jenis, kodeFormula, thickness, width, length, core, treatment, od, slitting, rewind, sml, machineName, tanggal, tanggalFormatted, spk, kodePack, subKode, qualityStatus, verified, createdAt, updatedAt',
  data_roll_uploads: '++id, uuid, uploadDate, batchName, source, fileName, machine, totalRolls, totalKg, passCount, holdCount, rejectCount, uploadedBy, status, rollsJson, createdAt, updatedAt',
  users: '++id, uuid, username, name, email, role, active, createdAt, updatedAt'
});

db.version(21).stores({
  labels: '++id, uuid, barcode, noPack, tanggal, spk, lot, turunan, operator, kodeOperator, jenis, type, kode, thickness, width, length, meter, joint, netto, paperCore, kodePack, subKode, status, treatment, od, jenisPrint, verified, synced, createdAt, updatedAt',
  settings: 'key, value, updatedAt',
  film_configs: '++id, jenis, tipeBahan, jenisBahan, kategoriFilm, kodeFormula, alias, keterangan, supplier, density, active, createdAt, updatedAt',
  mesin_list: '++id, nama, praKodePack, active, createdAt, updatedAt',
  operator_list: '++id, nama, mesin, kodeGrup, kodeOperator, active, createdAt, updatedAt',
  jenis_list: '++id, nama, active, createdAt',
  jenis_bahan_list: '++id, nama, active, createdAt',
  kategori_film_list: '++id, nama, active, createdAt',
  tipe_bahan_list: '++id, nama, active, createdAt',
  label_signs: '++id, name, triggerType, triggerValue, badgeText, textColor, bgColor, active, createdAt, updatedAt',
  inventory_items: '++id, descriptionExcel, descriptionNav, sourceNo, jenis, kodeFormula, thickness, width, length, core, od, tanda, createdAt, updatedAt',
  inventory_stock_uploads: '++id, uploadDate, fileName, totalSku, totalRoll, uploadedBy, itemsJson, createdAt',
  inventory_current_stocks: '++id, itemKey, descriptionExcel, descriptionNav, sourceNo, totalRoll, totalKg, lastUploadDate, updatedAt',
  wip_rolls: '++id, uuid, updateId, tanggalSpk, spk, lot, jenis, kodeFormula, thickness, width, length, core, od, tanda, beratAktual, beratTeori, lokasiAktif, posisiAktif, descriptionExcel, descriptionNav, keterangan, status, createdAt, updatedAt',
  scan_reports: '++id, uuid, name, tanggal, machine, totalShifts, totalRolls, totalResinKg, totalRollsKg, totalWasteKg, balanceDiffKg, shiftsJson, createdAt, updatedAt',
  wip_updates: '++id, uuid, title, tanggal, fileName, totalRolls, totalKg, isActive, rollsJson, createdAt, updatedAt',
  location_list: '++id, nama, jenis, alias, kapasitas, keterangan, active, createdAt, updatedAt',
  standard_lengths: '++id, thickness, maxPanjangFg, maxPanjangJumbo, active, createdAt, updatedAt',
  resin_items: '++id, resin, kode, nomorItem, active, createdAt, updatedAt',
  bom_formulas: '++id, formula, rm, persen, active, createdAt, updatedAt',
  data_rolls: '++id, uuid, uploadId, batchId, kodeFg, lot, turunan, jenis, kodeFormula, thickness, width, length, core, treatment, od, slitting, rewind, sml, machineName, tanggal, tanggalFormatted, spk, kodePack, subKode, qualityStatus, verified, createdAt, updatedAt',
  data_roll_uploads: '++id, uuid, uploadDate, batchName, source, fileName, machine, totalRolls, totalKg, passCount, holdCount, rejectCount, uploadedBy, status, rollsJson, createdAt, updatedAt',
  users: '++id, uuid, username, name, email, role, active, createdAt, updatedAt',
  spk_plans: '++id, uuid, spkNo, docNo, formula, jenis, thickness, lebarParent, panjangParent, jumlahJumbo, totalPlannedRolls, totalPlannedMeter, totalPlannedKg, chartingJson, trimAuto, keterangan, status, source, revisionsCount, tanggal, createdAt, updatedAt',
  spk_revisions: '++id, planId, spkNo, revNumber, previousDataJson, newDataJson, changesDiffJson, reason, revisedBy, createdAt'
});

export async function saveSetting(key, value) {
  try {
    let cleanValue = value;
    if (value !== undefined) {
      try {
        cleanValue = JSON.parse(JSON.stringify(value));
      } catch (cloneErr) {
        cleanValue = value;
      }
    }
    localStorage.setItem(`mlabel_setting_${key}`, JSON.stringify(cleanValue));
    await db.settings.put({ key, value: cleanValue, updatedAt: new Date().toISOString() });
  } catch (e) {
    console.error('Failed to save setting:', e);
  }
}

export async function getSetting(key, defaultValue = null) {
  try {
    const local = localStorage.getItem(`mlabel_setting_${key}`);
    if (local !== null) return JSON.parse(local);
    const fromDb = await db.settings.get(key);
    if (fromDb && fromDb.value !== undefined) {
      localStorage.setItem(`mlabel_setting_${key}`, JSON.stringify(fromDb.value));
      return fromDb.value;
    }
  } catch (e) {
    console.error('Failed to get setting:', e);
  }
  return defaultValue;
}

// Helper for generating standard UNIQ ID
export function generateUniqID(prefix = 'LBL') {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
}

export const generateUUID = generateUniqID;

function calculateNetto(thick, width, length, jenis) {
  const faktor = ["VMPET", "PET"].includes(jenis) ? 1.4 : 0.91;
  return ((parseFloat(thick || 0) * parseFloat(width || 0) * parseFloat(length || 0) * faktor) / 1000000).toFixed(2);
}

function calculatePaperCore(width, diameterCore = 6) {
  const d = parseFloat(diameterCore) || 6;
  const base6Inch = 0.003077 * parseFloat(width || 0) + 3.01532;
  return ((base6Inch * d) / 6).toFixed(2);
}

function generateKodePack(tanggal, mesin) {
  const d = new Date(tanggal);
  const bulan = String(d.getMonth() + 1).padStart(2, '0');
  const tahun = String(d.getFullYear()).slice(-2);
  let prefix = '';
  if (mesin === 'REWIND') prefix = 'R';
  if (mesin === 'SML') prefix = 'S';
  return `${prefix}3B${bulan}${tahun}`;
}

// Zero-Seeding Policy: Generator data dummy ditiadakan
export function generate100StandardDummyLabels() {
  return [];
}

export async function seedInitialLabelsIfEmpty() {
  const isSeeded = await getSetting('labels_seeded_flag_v1');
  if (isSeeded) return;

  const count = await db.labels.count();
  if (count > 0) {
    await saveSetting('labels_seeded_flag_v1', true);
    return;
  }

  await saveSetting('labels_seeded_flag_v1', true);
  // Jangan auto-populate jika database kosong/dihapus pengguna
}

// Zero-Seeding Policy: Seed initial tasks ditiadakan
export async function seedInitialTasksIfEmpty() {
  await saveSetting('tasks_seeded_flag_v1', true);
}

// Zero-Seeding Policy: Seed initial opname ditiadakan
export async function seedInitialOpnameIfEmpty() {
  await saveSetting('opname_seeded_flag_v1', true);
}

// Zero-Seeding Policy: Seed initial inventory ditiadakan
export async function seedInitialInventoryIfEmpty() {
  await saveSetting('inventory_seeded_flag_v1', true);
}

/**
 * Pembersihan Menyeluruh Seluruh Data Dummy Lama (Zero-Seeding Policy Enforcement)
 * Menjamin database lokal pengguna bersih murni dari data dummy simulasi sebelumnya.
 */
export async function purgeAllLegacyDummyData() {
  try {

    // 1. Purge dummy labels (SPK 01/VIII..07/VIII or specific dummy lots)
    const dummyLabels = await db.labels.filter(l => 
      ['M01240826C101', 'L01240826C102', 'SF151240826C103', 'M02240826C104', 'M01230826C201', 'L02230826C202', 'M03230826C203'].includes(l.lot) ||
      ['01/VIII/SPK/2026', '02/VIII/SPK/2026', '03/VIII/SPK/2026', '04/VIII/SPK/2026', '05/VIII/SPK/2026', '06/VIII/SPK/2026', '07/VIII/SPK/2026', '08/VIII/SPK/2026', '09/VIII/SPK/2026', '10/VIII/SPK/2026'].includes(l.spk)
    ).primaryKeys();
    if (dummyLabels.length > 0) {
      await db.labels.bulkDelete(dummyLabels);
      console.log('Purged ' + dummyLabels.length + ' dummy labels');
    }

    // 2. Purge dummy operators
    const dummyOps = await db.operator_list.filter(o => 
      ['SUDARMAJI', 'AHMAD', 'BAMBANG', 'TUKIMIN', 'FIRMAN', 'ANWAR', 'HENDRA', 'GUNAWAN', 'WAHYU', 'JOKO', 'KURNIA', 'LUKMAN'].includes((o.nama || '').toUpperCase())
    ).primaryKeys();
    if (dummyOps.length > 0) {
      await db.operator_list.bulkDelete(dummyOps);
      console.log('Purged ' + dummyOps.length + ' dummy operators');
    }

    // 3. Purge dummy tasks
    const dummyTasks = await db.tasks.filter(t => ['TSK-1001', 'TSK-1002'].includes(t.taskCode)).primaryKeys();
    if (dummyTasks.length > 0) {
      await db.tasks.bulkDelete(dummyTasks);
      console.log('Purged ' + dummyTasks.length + ' dummy tasks');
    }

    // 4. Purge dummy opname
    const dummyOpname = await db.opname.filter(o => ['RAW-CPP-12', 'FG-VMCPP-18'].includes(o.itemCode)).primaryKeys();
    if (dummyOpname.length > 0) {
      await db.opname.bulkDelete(dummyOpname);
      console.log('Purged ' + dummyOpname.length + ' dummy opnames');
    }

    // 5. Purge dummy inventory items & uploads
    const dummyUploads = await db.inventory_stock_uploads.filter(u => u.fileName === 'Saldo_Awal_Stock_Gudang.xlsx').primaryKeys();
    if (dummyUploads.length > 0) {
      await db.inventory_stock_uploads.bulkDelete(dummyUploads);
      console.log('Purged ' + dummyUploads.length + ' dummy uploads');
    }
    const dummyStocks = await db.inventory_current_stocks.filter(s => 
      ['VMCPP_M06_20_1060_6500_6', 'VMCPP_M06_20_1000_6000_6', 'VMPET_M04_12_1020_8000_3', 'CPP_G01_25_1250_4000_3', 'PET_P01_12_1050_12000_6'].includes(s.itemKey)
    ).primaryKeys();
    if (dummyStocks.length > 0) {
      await db.inventory_current_stocks.bulkDelete(dummyStocks);
      console.log('Purged ' + dummyStocks.length + ' dummy stocks');
    }

    const dummyItems = await db.inventory_items.filter(i => 
      ['RM-VMCPP-M06-20-1060', 'RM-VMCPP-M06-20-1000', 'RM-VMPET-M04-12-1020', 'RM-CPP-G01-25-1250', 'RM-PET-P01-12-1050'].includes(i.sourceNo)
    ).primaryKeys();
    if (dummyItems.length > 0) {
      await db.inventory_items.bulkDelete(dummyItems);
      console.log('Purged ' + dummyItems.length + ' dummy inventory items');
    }

    // 6. Purge dummy SPK plans & revisions (Zero-Seeding Policy)
    if (db.spk_plans) {
      const dummyPlans = await db.spk_plans.filter(p => String(p.uuid || '').startsWith('spk-sample-')).primaryKeys();
      if (dummyPlans.length > 0) {
        await db.spk_plans.bulkDelete(dummyPlans);
        console.log('Purged ' + dummyPlans.length + ' dummy SPK plans');
      }
    }

    await saveSetting('purged_all_dummy_data_v2', true);
  } catch (err) {
    console.error('Error during purgeAllLegacyDummyData:', err);
  }
}
