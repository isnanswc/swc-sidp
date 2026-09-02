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

// Initial Standard Data Generator for 100 accurate labels
export function generate100StandardDummyLabels() {
  const labels = [];
  const lotPlans = [
    // ── HARI 1: 2026-08-24 (24 Roll) ──
    {
      date: '2026-08-24', shift: 1, mesin: 'SLITTING', operator: 'UMAR', kodeOp: 'G',
      lot: 'M01240826C101', spk: '01/VIII/SPK/2026', jenis: 'VMCPP', kode: 'M01', type: 'METALIZED',
      thick: '20', width: '1000', length: '4000', meter: '4000', joint: '0', density: 0.91, od: 'OD2.4+PLASMA',
      chartings: ['A', 'B', 'C', 'D'], countPerCharting: 2 // 8 rolls (GA01..GA02, GB01..GB02, GC01..GC02, GD01..GD02)
    },
    {
      date: '2026-08-24', shift: 1, mesin: 'SLITTING', operator: 'UMAR', kodeOp: 'G',
      lot: 'L01240826C102', spk: '02/VIII/SPK/2026', jenis: 'CPP', kode: 'L01', type: 'TRANSPARENT',
      thick: '25', width: '1200', length: '3000', meter: '3000', joint: '0', density: 0.91, od: '',
      chartings: ['A', 'B', 'C'], countPerCharting: 2 // 6 rolls (HA01..HA02, HB01..HB02, HC01..HC02)
    },
    {
      date: '2026-08-24', shift: 2, mesin: 'SLITTING', operator: 'INDRA', kodeOp: 'I',
      lot: 'SF151240826C103', spk: '03/VIII/SPK/2026', jenis: 'VMPET', kode: 'SF151', type: 'METALIZED',
      thick: '12', width: '800', length: '6000', meter: '6000', joint: '0', density: 1.4, od: 'OD2.8+PLASMA',
      chartings: ['A', 'B'], countPerCharting: 2 // 4 rolls (IA01..IA02, IB01..IB02)
    },
    {
      date: '2026-08-24', shift: 2, mesin: 'REWIND', operator: 'INDRA', kodeOp: 'I',
      lot: 'M02240826C104', spk: '04/VIII/SPK/2026', jenis: 'VMCPP', kode: 'M02', type: 'METALIZED',
      thick: '18', width: '1100', length: '5000', meter: '5000', joint: '0', density: 0.91, od: 'OD2.2+PLASMA',
      chartings: ['A', 'B'], countPerCharting: 3 // 6 rolls (JA01..JA03, JB01..JB03)
    },

    // ── HARI 2: 2026-08-23 (20 Roll) ──
    {
      date: '2026-08-23', shift: 1, mesin: 'SLITTING', operator: 'UMAR', kodeOp: 'G',
      lot: 'M01230826C201', spk: '05/VIII/SPK/2026', jenis: 'VMCPP', kode: 'M01', type: 'METALIZED',
      thick: '20', width: '1000', length: '4000', meter: '4000', joint: '0', density: 0.91, od: 'OD2.4+PLASMA',
      chartings: ['A', 'B', 'C'], countPerCharting: 2 // 6 rolls
    },
    {
      date: '2026-08-23', shift: 2, mesin: 'CASTING', operator: 'AGUS', kodeOp: 'A',
      lot: 'L02230826C202', spk: '06/VIII/SPK/2026', jenis: 'CPP', kode: 'L02', type: 'TRANSPARENT',
      thick: '30', width: '1050', length: '2500', meter: '2500', joint: '0', density: 0.91, od: '',
      chartings: ['A', 'B'], countPerCharting: 4 // 8 rolls
    },
    {
      date: '2026-08-23', shift: 3, mesin: 'METALIZE', operator: 'DEDI', kodeOp: 'D',
      lot: 'M03230826C203', spk: '07/VIII/SPK/2026', jenis: 'VMCPP', kode: 'M03', type: 'METALIZED',
      thick: '20', width: '1000', length: '4000', meter: '4000', joint: '0', density: 0.91, od: 'OD2.5+PLASMA',
      chartings: ['A', 'B'], countPerCharting: 3 // 6 rolls
    },

    // ── HARI 3: 2026-08-22 (18 Roll) ──
    {
      date: '2026-08-22', shift: 1, mesin: 'SLITTING', operator: 'HENDRA', kodeOp: 'H',
      lot: 'L06220826C301', spk: '08/VIII/SPK/2026', jenis: 'CPP', kode: 'L06', type: 'MATTE',
      thick: '20', width: '1000', length: '4000', meter: '4000', joint: '0', density: 0.91, od: '',
      chartings: ['A', 'B', 'C'], countPerCharting: 2 // 6 rolls
    },
    {
      date: '2026-08-22', shift: 1, mesin: 'REWIND', operator: 'HENDRA', kodeOp: 'H',
      lot: 'M04220826C302', spk: '09/VIII/SPK/2026', jenis: 'VMCPP', kode: 'M04', type: 'METALIZED',
      thick: '15', width: '1200', length: '5000', meter: '5000', joint: '0', density: 0.91, od: 'OD2.0',
      chartings: ['A', 'B'], countPerCharting: 3 // 6 rolls
    },
    {
      date: '2026-08-22', shift: 2, mesin: 'SLITTING', operator: 'INDRA', kodeOp: 'I',
      lot: 'M01220826C303', spk: '10/VIII/SPK/2026', jenis: 'VMCPP', kode: 'M01', type: 'METALIZED',
      thick: '20', width: '1000', length: '4000', meter: '4000', joint: '0', density: 0.91, od: 'OD2.4+PLASMA',
      chartings: ['A', 'B', 'C'], countPerCharting: 2 // 6 rolls
    },

    // ── HARI 4: 2026-08-21 (16 Roll) ──
    {
      date: '2026-08-21', shift: 1, mesin: 'SLITTING', operator: 'UMAR', kodeOp: 'G',
      lot: 'L01210826C401', spk: '11/VIII/SPK/2026', jenis: 'CPP', kode: 'L01', type: 'TRANSPARENT',
      thick: '25', width: '1000', length: '4000', meter: '4000', joint: '0', density: 0.91, od: '',
      chartings: ['A', 'B', 'C'], countPerCharting: 2 // 6 rolls
    },
    {
      date: '2026-08-21', shift: 2, mesin: 'METALIZE', operator: 'EKO', kodeOp: 'E',
      lot: 'M02210826C402', spk: '12/VIII/SPK/2026', jenis: 'VMCPP', kode: 'M02', type: 'METALIZED',
      thick: '18', width: '1100', length: '5000', meter: '5000', joint: '0', density: 0.91, od: 'OD2.2+PLASMA',
      chartings: ['A', 'B'], countPerCharting: 3 // 6 rolls
    },
    {
      date: '2026-08-21', shift: 3, mesin: 'CASTING', operator: 'BUDI', kodeOp: 'B',
      lot: 'C8-GETAS210826C403', spk: '13/VIII/SPK/2026', jenis: 'LLDPE', kode: 'C8-GETAS', type: 'LLDPE',
      thick: '30', width: '1000', length: '3000', meter: '3000', joint: '0', density: 0.91, od: '',
      chartings: ['A', 'B'], countPerCharting: 2 // 4 rolls
    },

    // ── HARI 5: 2026-08-20 (12 Roll) ──
    {
      date: '2026-08-20', shift: 1, mesin: 'SLITTING', operator: 'HENDRA', kodeOp: 'H',
      lot: 'M05200826C501', spk: '14/VIII/SPK/2026', jenis: 'VMCPP', kode: 'M05', type: 'GLOSSY',
      thick: '20', width: '1000', length: '4000', meter: '4000', joint: '0', density: 0.91, od: 'OD2.4',
      chartings: ['A', 'B', 'C'], countPerCharting: 2 // 6 rolls
    },
    {
      date: '2026-08-20', shift: 2, mesin: 'REWIND', operator: 'LUKMAN', kodeOp: 'L',
      lot: 'L02200826C502', spk: '15/VIII/SPK/2026', jenis: 'CPP', kode: 'L02', type: 'TRANSPARENT',
      thick: '25', width: '1200', length: '3000', meter: '3000', joint: '0', density: 0.91, od: '',
      chartings: ['A', 'B'], countPerCharting: 3 // 6 rolls
    },

    // ── HARI 6: 2026-08-19 (10 Roll) ──
    {
      date: '2026-08-19', shift: 1, mesin: 'SLITTING', operator: 'UMAR', kodeOp: 'G',
      lot: 'M01190826C601', spk: '16/VIII/SPK/2026', jenis: 'VMCPP', kode: 'M01', type: 'METALIZED',
      thick: '20', width: '1000', length: '4000', meter: '4000', joint: '0', density: 0.91, od: 'OD2.4+PLASMA',
      chartings: ['A', 'B'], countPerCharting: 2 // 4 rolls
    },
    {
      date: '2026-08-19', shift: 2, mesin: 'CASTING', operator: 'CANDRA', kodeOp: 'C',
      lot: 'L01190826C602', spk: '17/VIII/SPK/2026', jenis: 'CPP', kode: 'L01', type: 'TRANSPARENT',
      thick: '25', width: '1000', length: '4000', meter: '4000', joint: '0', density: 0.91, od: '',
      chartings: ['A', 'B', 'C'], countPerCharting: 2 // 6 rolls
    }
  ];

  let globalRollIdx = 1;

  for (const plan of lotPlans) {
    for (let cIdx = 0; cIdx < plan.chartings.length; cIdx++) {
      const chartLetter = plan.chartings[cIdx];
      for (let seq = 1; seq <= plan.countPerCharting; seq++) {
        const seqStr = String(seq).padStart(2, '0');
        const turunan = `${plan.kodeOp}${chartLetter}${seqStr}`;
        const subKode = String(globalRollIdx).padStart(4, '0');
        const kodePack = generateKodePack(plan.date, plan.mesin);
        const netto = ((parseFloat(plan.thick) * parseFloat(plan.width) * parseFloat(plan.length) * plan.density) / 1000000).toFixed(2);
        const paperCore = calculatePaperCore(plan.width);

        let status = 'PASS';
        if (globalRollIdx % 16 === 0) status = 'HOLD';
        else if (globalRollIdx % 33 === 0) status = 'REJECT';

        labels.push({
          uniqId: generateUniqID('LBL'),
          supplier: 'INHOUSE',
          spk: plan.spk,
          tanggal: plan.date,
          tanggalShift: plan.date,
          tanggalManual: '',
          mesin: plan.mesin,
          jenis: plan.jenis,
          type: plan.type,
          kode: plan.kode,
          thickness: plan.thick,
          width: plan.width,
          length: plan.length,
          meter: plan.meter,
          joint: plan.joint,
          netto,
          paperCore,
          kodePack,
          subKodeType: status === 'REJECT' ? 'reject' : status === 'HOLD' ? 'hold' : 'numeric',
          subKodeNumeric: String(globalRollIdx),
          subKode: status === 'REJECT' ? 'REJECT' : status === 'HOLD' ? '0000' : subKode,
          status,
          treatment: globalRollIdx % 2 === 0 ? 'INSIDE' : 'OUTSIDE',
          od: plan.od,
          lot: plan.lot,
          turunan,
          operator: plan.operator,
          kodeOperator: plan.kodeOp,
          keterangan: status === 'PASS' ? 'Standard QC Pass' : status === 'HOLD' ? 'Tahan inspeksi lab' : 'Reject visual defect',
          jenisPrint: 'FINISH GOODS',
          synced: 0,
          createdAt: new Date(`${plan.date}T08:00:00.000Z`).toISOString(),
          updatedAt: new Date().toISOString()
        });

        globalRollIdx++;
      }
    }
  }

  return labels;
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

// Initial Sample Data Generator for Tasks
export async function seedInitialTasksIfEmpty() {
  const isSeeded = await getSetting('tasks_seeded_flag_v1');
  if (isSeeded) return;

  const count = await db.tasks.count();
  if (count > 0) {
    await saveSetting('tasks_seeded_flag_v1', true);
    return;
  }
  await saveSetting('tasks_seeded_flag_v1', true);

  const sampleTasks = [
    {
      uuid: generateUniqID('TSK'),
      taskCode: 'TSK-1001',
      title: 'Kalibrasi Sensor Mesin Slitting 01',
      category: 'Maintenance',
      status: 'In Progress',
      priority: 'High',
      assignee: 'Budi Santoso',
      dueDate: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
      qrPayload: 'QR-MAINT-SLIT-01',
      description: 'Lakukan kalibrasi presisi pada sensor tegangan dan pisau roll.',
      synced: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      uuid: generateUniqID('TSK'),
      taskCode: 'TSK-1002',
      title: 'Pemeriksaan Visual Roll VMCPP Lot M01',
      category: 'QC Inspection',
      status: 'Pending',
      priority: 'Medium',
      assignee: 'Siti Rahma',
      dueDate: new Date(Date.now() + 86400000 * 1).toISOString().slice(0, 10),
      qrPayload: 'QR-QC-VMCPP-M01',
      description: 'Cek keseragaman lapisan metalized dan optical density.',
      synced: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  await db.tasks.bulkAdd(sampleTasks);
}

// Initial Sample Data Generator for Stock Opname
export async function seedInitialOpnameIfEmpty() {
  const isSeeded = await getSetting('opname_seeded_flag_v1');
  if (isSeeded) return;

  const count = await db.opname.count();
  if (count > 0) {
    await saveSetting('opname_seeded_flag_v1', true);
    return;
  }
  await saveSetting('opname_seeded_flag_v1', true);

  const sampleOpname = [
    {
      uuid: generateUniqID('OPN'),
      itemCode: 'RAW-CPP-12',
      itemName: 'Jumbo Roll CPP 12 Micron 1200mm',
      category: 'Raw Material',
      systemStock: 45,
      physicalStock: 44,
      difference: -1,
      unit: 'Roll',
      location: 'Rak A-02',
      notes: '1 roll rusak kemasan luar, di-quarantine',
      status: 'Investigated',
      synced: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      uuid: generateUniqID('OPN'),
      itemCode: 'FG-VMCPP-18',
      itemName: 'Finished Roll VMCPP 18 Micron 1000mm',
      category: 'Finished Goods',
      systemStock: 120,
      physicalStock: 120,
      difference: 0,
      unit: 'Roll',
      location: 'Gudang Utama B-05',
      notes: 'Stok cocok dan sesuai',
      status: 'Verified',
      synced: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  await db.opname.bulkAdd(sampleOpname);
}

// Initial Sample Data Generator for Inventory Management System (Master Items & Stock)
export async function seedInitialInventoryIfEmpty() {
  const isAlreadySeeded = await getSetting('inventory_seeded_flag_v1');
  if (isAlreadySeeded) return;

  const count = await db.inventory_items.count();
  if (count > 0) {
    await saveSetting('inventory_seeded_flag_v1', true);
    return;
  }

  await saveSetting('inventory_seeded_flag_v1', true);

  const sampleMasterItems = [
    {
      descriptionExcel: 'VMCPP M06 20MC 1060MM 6500M 6" OD2.4+PLASMA',
      descriptionNav: 'FILM VMCPP M06 20MCX1060MMX6500M 6INCH OD2.4+PLASMA',
      sourceNo: 'RM-VMCPP-M06-20-1060',
      jenis: 'VMCPP',
      kodeFormula: 'M06',
      thickness: '20',
      width: '1060',
      length: '6500',
      core: '6',
      od: 'OD2.4+PLASMA',
      tanda: 'A',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      descriptionExcel: 'VMCPP M06 20MC 1000MM 6000M 6" OD2.4+PLASMA',
      descriptionNav: 'FILM VMCPP M06 20MCX1000MMX6000M 6INCH OD2.4+PLASMA',
      sourceNo: 'RM-VMCPP-M06-20-1000',
      jenis: 'VMCPP',
      kodeFormula: 'M06',
      thickness: '20',
      width: '1000',
      length: '6000',
      core: '6',
      od: 'OD2.4+PLASMA',
      tanda: 'B',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      descriptionExcel: 'VMPET M04 12MC 1020MM 8000M 3" OD2.2+CORONA',
      descriptionNav: 'FILM VMPET M04 12MCX1020MMX8000M 3INCH OD2.2+CORONA',
      sourceNo: 'RM-VMPET-M04-12-1020',
      jenis: 'VMPET',
      kodeFormula: 'M04',
      thickness: '12',
      width: '1020',
      length: '8000',
      core: '3',
      od: 'OD2.2+CORONA',
      tanda: 'C',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      descriptionExcel: 'CPP G01 25MC 1250MM 4000M 3" PLAIN',
      descriptionNav: 'FILM CPP G01 25MCX1250MMX4000M 3INCH PLAIN',
      sourceNo: 'RM-CPP-G01-25-1250',
      jenis: 'CPP',
      kodeFormula: 'G01',
      thickness: '25',
      width: '1250',
      length: '4000',
      core: '3',
      od: 'PLAIN',
      tanda: 'P',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      descriptionExcel: 'PET P01 12MC 1050MM 12000M 6" CHEMICAL',
      descriptionNav: 'FILM PET P01 12MCX1050MMX12000M 6INCH CHEMICAL',
      sourceNo: 'RM-PET-P01-12-1050',
      jenis: 'PET',
      kodeFormula: 'P01',
      thickness: '12',
      width: '1050',
      length: '12000',
      core: '6',
      od: 'CHEMICAL',
      tanda: 'X',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  await db.inventory_items.bulkAdd(sampleMasterItems);

  // Initial Sample Stock Upload
  const today = new Date().toISOString().slice(0, 10);
  const sampleUpload = {
    uploadDate: today,
    fileName: 'Saldo_Awal_Stock_Gudang.xlsx',
    totalSku: 5,
    totalRoll: 184,
    uploadedBy: 'Admin Inventory',
    itemsJson: JSON.stringify([
      { descriptionExcel: 'VMCPP M06 20MC 1060MM 6500M 6" OD2.4+PLASMA', totalRoll: 48 },
      { descriptionExcel: 'VMCPP M06 20MC 1000MM 6000M 6" OD2.4+PLASMA', totalRoll: 32 },
      { descriptionExcel: 'VMPET M04 12MC 1020MM 8000M 3" OD2.2+CORONA', totalRoll: 50 },
      { descriptionExcel: 'CPP G01 25MC 1250MM 4000M 3" PLAIN', totalRoll: 24 },
      { descriptionExcel: 'PET P01 12MC 1050MM 12000M 6" CHEMICAL', totalRoll: 30 }
    ]),
    createdAt: new Date().toISOString()
  };

  await db.inventory_stock_uploads.add(sampleUpload);

  // Initial Current Stocks
  const initialStocks = [
    {
      itemKey: 'VMCPP_M06_20_1060_6500_6',
      descriptionExcel: 'VMCPP M06 20MC 1060MM 6500M 6" OD2.4+PLASMA',
      descriptionNav: 'FILM VMCPP M06 20MCX1060MMX6500M 6INCH OD2.4+PLASMA',
      sourceNo: 'RM-VMCPP-M06-20-1060',
      totalRoll: 48,
      totalKg: (48 * 125.57).toFixed(2),
      lastUploadDate: today,
      updatedAt: new Date().toISOString()
    },
    {
      itemKey: 'VMCPP_M06_20_1000_6000_6',
      descriptionExcel: 'VMCPP M06 20MC 1000MM 6000M 6" OD2.4+PLASMA',
      descriptionNav: 'FILM VMCPP M06 20MCX1000MMX6000M 6INCH OD2.4+PLASMA',
      sourceNo: 'RM-VMCPP-M06-20-1000',
      totalRoll: 32,
      totalKg: (32 * 109.2).toFixed(2),
      lastUploadDate: today,
      updatedAt: new Date().toISOString()
    },
    {
      itemKey: 'VMPET_M04_12_1020_8000_3',
      descriptionExcel: 'VMPET M04 12MC 1020MM 8000M 3" OD2.2+CORONA',
      descriptionNav: 'FILM VMPET M04 12MCX1020MMX8000M 3INCH OD2.2+CORONA',
      sourceNo: 'RM-VMPET-M04-12-1020',
      totalRoll: 50,
      totalKg: (50 * 137.09).toFixed(2),
      lastUploadDate: today,
      updatedAt: new Date().toISOString()
    },
    {
      itemKey: 'CPP_G01_25_1250_4000_3',
      descriptionExcel: 'CPP G01 25MC 1250MM 4000M 3" PLAIN',
      descriptionNav: 'FILM CPP G01 25MCX1250MMX4000M 3INCH PLAIN',
      sourceNo: 'RM-CPP-G01-25-1250',
      totalRoll: 24,
      totalKg: (24 * 113.75).toFixed(2),
      lastUploadDate: today,
      updatedAt: new Date().toISOString()
    },
    {
      itemKey: 'PET_P01_12_1050_12000_6',
      descriptionExcel: 'PET P01 12MC 1050MM 12000M 6" CHEMICAL',
      descriptionNav: 'FILM PET P01 12MCX1050MMX12000M 6INCH CHEMICAL',
      sourceNo: 'RM-PET-P01-12-1050',
      totalRoll: 30,
      totalKg: (30 * 211.68).toFixed(2),
      lastUploadDate: today,
      updatedAt: new Date().toISOString()
    }
  ];

  await db.inventory_current_stocks.bulkAdd(initialStocks);
}
