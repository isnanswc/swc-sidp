export interface InventoryMasterItem {
  id?: number;
  descriptionExcel: string;
  descriptionNav: string;
  sourceNo: string;
  jenis: string;
  kodeFormula: string;
  thickness: string | number;
  width: string | number;
  length: string | number;
  core: string | number;
  od: string;
  tanda?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InventoryCurrentStock {
  id?: number;
  itemKey: string;
  descriptionExcel: string;
  descriptionNav: string;
  sourceNo: string;
  totalRoll: number;
  totalPanjang?: number;
  totalKg: string | number;
  lastUploadDate?: string;
  updatedAt?: string;
}

export interface InventoryStockUpload {
  id?: number;
  uploadDate: string;
  fileName: string;
  totalSku: number;
  totalRoll: number;
  uploadedBy: string;
  itemsJson: string;
  createdAt?: string;
}
