<template>
  <div>
    <!-- SCREEN PREVIEW MODAL -->
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto animate-fade-in"
      @click="close"
    >
      <div
        class="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-4 sm:p-6 max-h-[95vh] overflow-y-auto"
        @click.stop
      >
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <div class="flex items-center gap-2">
            <h3 class="text-base font-black text-slate-900">
              Pratinjau Cetak Label ({{ previewItems.length }} Label / {{ previewPages.length }} Lembar Halaman)
            </h3>
          </div>
          <button
            @click="close"
            class="text-slate-400 hover:text-slate-600 font-bold text-lg cursor-pointer"
          >
            ✕
          </button>
        </div>

        <!-- SCREEN PREVIEW DISPLAY -->
        <div class="my-4 space-y-6">
          <div
            v-for="(page, pageIdx) in previewPages"
            :key="pageIdx"
            class="p-4 border border-slate-200 rounded-xl bg-slate-50 space-y-4"
          >
            <div class="text-[11px] font-bold text-blue-800 pb-1 border-b border-slate-200 flex items-center justify-between">
              <span>📄 Lembar Halaman Ke-{{ pageIdx + 1 }}</span>
              <span>{{ page.length }} Label</span>
            </div>

            <div
              v-for="(item, itemIdx) in page"
              :key="item.id"
              class="label-item-wrapper"
            >
              <div class="label-preview-content bg-white shadow-xs">
                <table class="label-table">
                  <tbody>
                    <!-- ROW 1: Header Brand, Date, QR -->
                    <tr>
                      <td
                        v-if="getLabelSign(item)"
                        :style="{ backgroundColor: getLabelSign(item).bgColor + ' !important', color: (getLabelSign(item).textColor || '#ffffff') + ' !important' }"
                        class="dynamic-corner-sign"
                      >
                        {{ getLabelSign(item).badgeText }}
                      </td>
                      <td v-else style="width: 10px;"></td>

                      <td colspan="4" style="padding: 1px; text-align: center;">
                        <span style="font-family: 'Impact', 'Arial Black', sans-serif; font-size: 18px; color: #d61c1c; letter-spacing: 0.5px; display: block; line-height: 1.1;">
                          PT. SAPTAWARNA CEMERLANG
                        </span>
                      </td>

                      <td style="padding: 1px; font-size: 11px; font-weight: bold; white-space: nowrap; text-align: center;">
                        {{ formatTanggalIndonesia(item.tanggal) }}
                      </td>

                      <td style="width: 52px; padding: 1px; text-align: center;">
                        <img
                          :src="`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(
                            `${getDisplayJenis(item)} ${item.kode} ${item.thickness} MC X ${item.width} MM = ${item.length}|${item.lot}${item.turunan}|${item.kodePack}${item.subKode}`
                          )}`"
                          alt="QR"
                          style="width: 44px; height: 44px; margin: 0 auto; display: block;"
                        />
                      </td>
                    </tr>

                    <!-- ROW 2: Film Type & SPK & Month Image (Center) -->
                    <tr>
                      <td colspan="5" style="padding: 1px; font-weight: bold; font-size: 15px; text-align: center;">
                        {{ getDisplayJenis(item) }}({{ item.type }}) <span style="color: red;">{{ item.kode }}</span>
                      </td>
                      <td style="padding: 1px; font-weight: bold; font-size: 11px; text-align: center;">
                        {{ item.spk }}
                      </td>
                      <td rowspan="7" style="text-align: center; vertical-align: middle; padding: 1px; width: 48px;">
                        <img
                          :src="`./gambar/${getMonthName(item.tanggal).toLowerCase()}.png`"
                          :alt="getMonthName(item.tanggal)"
                          style="max-height: 75px; max-width: 38px; margin: 0 auto; display: block;"
                          @error="(e) => e.target.src = `https://isnanswc.github.io/gambar/${getMonthName(item.tanggal).toLowerCase()}.png`"
                        />
                      </td>
                    </tr>

                    <!-- ROW 3: Thick, Netto, Treatment (All Center) -->
                    <tr>
                      <td style="padding: 1px; font-size: 9.5px; text-align: center;"><strong>Thick</strong></td>
                      <td style="position: relative; padding: 0.5px; font-size: 15px; font-weight: bold; text-align: center;">
                        <span>{{ item.thickness }}</span>
                        <span style="position: absolute; top: 1px; right: 2px; font-size: 7px; font-weight: bold; color: #4b5563; line-height: 1;">MC</span>
                      </td>
                      <td style="padding: 1px; font-size: 9.5px; text-align: center;"><strong>Netto</strong></td>
                      <td style="position: relative; padding: 0.5px; font-size: 15px; font-weight: bold; text-align: center;">
                        <span>{{ item.netto }}</span>
                        <span style="position: absolute; top: 1px; right: 2px; font-size: 7px; font-weight: bold; color: #4b5563; line-height: 1;">KG</span>
                      </td>
                      <td style="padding: 1px; font-size: 9.5px; text-align: center;"><strong>Treatment</strong></td>
                      <td style="padding: 1px; color: red; font-weight: bold; font-size: 9.5px; text-align: center;">{{ item.treatment }}</td>
                    </tr>

                    <!-- ROW 4: Width, Paper Core, OD+Plasma (All Center) -->
                    <tr>
                      <td style="padding: 1px; font-size: 9.5px; text-align: center;"><strong>Width</strong></td>
                      <td style="position: relative; padding: 0.5px; font-size: 15px; font-weight: bold; text-align: center;">
                        <span>{{ item.width }}</span>
                        <span style="position: absolute; top: 1px; right: 2px; font-size: 7px; font-weight: bold; color: #4b5563; line-height: 1;">MM</span>
                      </td>
                      <td style="padding: 1px; font-size: 9.5px; text-align: center;"><strong>Paper Core</strong></td>
                      <td style="position: relative; padding: 0.5px; font-size: 15px; text-align: center;">
                        <span>{{ item.paperCore }}</span>
                        <span style="position: absolute; top: 1px; right: 2px; font-size: 7px; font-weight: bold; color: #4b5563; line-height: 1;">KG</span>
                      </td>
                      <td style="padding: 1px; font-size: 9.5px; text-align: center;"><strong>OD+Plasma</strong></td>
                      <td style="padding: 1px; color: red; font-weight: bold; font-size: 10.5px; text-align: center; word-break: break-all;">
                        {{ item.od }}
                      </td>
                    </tr>

                    <!-- ROW 5: Length, Joint, Meter (All Center) -->
                    <tr>
                      <td style="padding: 1px; font-size: 9.5px; text-align: center;"><strong>Length</strong></td>
                      <td style="position: relative; padding: 0.5px; font-size: 15px; font-weight: bold; text-align: center;">
                        <span>{{ item.length }}</span>
                        <span style="position: absolute; top: 1px; right: 2px; font-size: 7px; font-weight: bold; color: #4b5563; line-height: 1;">M</span>
                      </td>
                      <td style="padding: 1px; font-size: 9.5px; text-align: center;"><strong>Joint</strong></td>
                      <td style="padding: 0.5px; font-size: 15px; text-align: center;">
                        {{ item.joint !== undefined && item.joint !== '' ? item.joint : '0' }}
                      </td>
                      <td style="padding: 1px; font-size: 9.5px; text-align: center;"><strong>Meter</strong></td>
                      <td style="position: relative; padding: 0.5px; font-size: 13.5px; text-align: center;">
                        <span>{{ (item.meter && String(item.meter) !== String(item.length) && String(item.meter).trim() !== '') ? item.meter : '-' }}</span>
                        <span v-if="item.meter && String(item.meter) !== String(item.length) && String(item.meter).trim() !== '' && item.meter !== '-'" style="position: absolute; top: 1px; right: 2px; font-size: 7px; font-weight: bold; color: #4b5563; line-height: 1;">M</span>
                      </td>
                    </tr>

                    <!-- ROW 6: Supplier, Lot, Turunan (All Center) -->
                    <tr>
                      <td style="padding: 1px; background-color: #f0f0f0; font-size: 9.5px; text-align: center;"><strong>{{ item.supplier || '-' }}</strong></td>
                      <td colspan="4" style="padding: 1px; font-size: 15px; font-weight: bold; text-align: center;">{{ formatLotVisual(item.lot, item.supplier) }}</td>
                      <td style="padding: 1px; font-size: 12px; font-weight: bold; text-align: center;">{{ item.turunan }}</td>
                    </tr>

                    <!-- ROW 7: Code Pack & Status (All Center) -->
                    <tr>
                      <td style="padding: 1px; font-size: 9.5px; text-align: center;"><strong>Code Pack:</strong></td>
                      <td colspan="3" style="padding: 1px; font-size: 13.5px; text-align: center;">
                        <strong>{{ item.kodePack }}<span style="color: red;">{{ item.subKode }}</span></strong>
                      </td>
                      <td style="padding: 1px; font-size: 9.5px; text-align: center;"><strong>STATUS</strong></td>
                      <td :class="item.status === 'HOLD' ? 'label-fail' : item.status === 'REJECT' ? 'label-reject' : 'label-pass'" style="font-size: 9.5px; text-align: center;">
                        {{ item.status }}
                      </td>
                    </tr>

                    <!-- ROW 8: Keterangan (All Center) -->
                    <tr>
                      <td style="padding: 1px; font-size: 9.5px; text-align: center;"><strong>Ket:</strong></td>
                      <td colspan="5" style="padding: 1px; font-size: 9.5px; text-align: center;">{{ item.keterangan || '-' }}</td>
                    </tr>
                  </tbody>
                </table>

                <div class="label-footer-info" style="display: flex; justify-content: space-between; align-items: center; width: 100%; height: 16px; padding: 2px 4px 1px 4px; box-sizing: border-box; line-height: 1; border-top: 1px dashed #cbd5e1; margin-top: 2px;">
                  <strong><span style="font-size: 8.5px; font-family: monospace; letter-spacing: 0.25px; color: #000;">ID: {{ item.uniqId }}</span></strong>
                  <span style="font-size: 8px; font-family: Arial, sans-serif; color: #1f2937; font-weight: 600;">Cetak: {{ currentDateTimeString }}</span>
                </div>
              </div>

              <!-- Garis Bantu Putus-Putus dengan Icon Gunting -->
              <div
                v-if="(itemIdx + 1) % 4 !== 0"
                class="cut-line"
              >
                <svg class="cut-scissor-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="6" cy="6" r="3" />
                  <circle cx="6" cy="18" r="3" />
                  <line x1="20" y1="4" x2="8.12" y2="15.88" />
                  <line x1="14.47" y1="14.48" x2="20" y2="20" />
                  <line x1="8.12" y1="8.12" x2="12" y2="12" />
                </svg>
                <span class="cut-dash"></span>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Footer -->
        <div class="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100">
          <button
            @click="close"
            class="px-4 py-2 rounded-xl text-xs font-bold bg-zinc-100 hover:bg-zinc-200 text-zinc-700 cursor-pointer"
          >
            Tutup
          </button>
          <button
            @click="$emit('print')"
            class="px-6 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/25 flex items-center gap-2 cursor-pointer"
          >
            🖨️ Cetak {{ previewItems.length }} Label ({{ previewPages.length }} Halaman)
          </button>
        </div>
      </div>
    </div>

    <!-- DEDICATED TELEPORTED PRINT CONTAINER (ONLY VISIBLE DURING BROWSER PRINT) -->
    <teleport to="body">
      <div v-if="modelValue" id="printOnlyArea">
        <div
          v-for="(page, pageIdx) in previewPages"
          :key="pageIdx"
          class="print-page"
        >
          <div
            v-for="(item, itemIdx) in page"
            :key="item.id"
            class="label-item-wrapper"
          >
            <div class="label-preview-content">
              <table class="label-table">
                <tbody>
                  <!-- ROW 1: Header Brand, Date, QR -->
                  <tr>
                    <td
                      v-if="getLabelSign(item)"
                      :style="{ backgroundColor: getLabelSign(item).bgColor + ' !important', color: (getLabelSign(item).textColor || '#ffffff') + ' !important' }"
                      class="dynamic-corner-sign"
                    >
                      {{ getLabelSign(item).badgeText }}
                    </td>
                    <td v-else style="width: 10px;"></td>

                    <td colspan="4" style="padding: 1px; text-align: center;">
                      <span style="font-family: 'Impact', 'Arial Black', sans-serif; font-size: 18px; color: #d61c1c; letter-spacing: 0.5px; display: block; line-height: 1.1;">
                        PT. SAPTAWARNA CEMERLANG
                      </span>
                    </td>

                    <td style="padding: 1px; font-size: 11px; font-weight: bold; white-space: nowrap; text-align: center;">
                      {{ formatTanggalIndonesia(item.tanggal) }}
                    </td>

                    <td style="width: 52px; padding: 1px; text-align: center;">
                      <img
                        :src="`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(
                          `${getDisplayJenis(item)} ${item.kode} ${item.thickness} MC X ${item.width} MM = ${item.length}|${item.lot}${item.turunan}|${item.kodePack}${item.subKode}`
                        )}`"
                        alt="QR"
                        style="width: 44px; height: 44px; margin: 0 auto; display: block;"
                      />
                    </td>
                  </tr>

                  <!-- ROW 2: Film Type & SPK & Month Image (Center) -->
                  <tr>
                    <td colspan="5" style="padding: 1px; font-weight: bold; font-size: 15px; text-align: center;">
                      {{ getDisplayJenis(item) }}({{ item.type }}) <span style="color: red;">{{ item.kode }}</span>
                    </td>
                    <td style="padding: 1px; font-weight: bold; font-size: 11px; text-align: center;">
                      {{ item.spk }}
                    </td>
                    <td rowspan="7" style="text-align: center; vertical-align: middle; padding: 1px; width: 48px;">
                      <img
                        :src="`./gambar/${getMonthName(item.tanggal).toLowerCase()}.png`"
                        :alt="getMonthName(item.tanggal)"
                        style="max-height: 75px; max-width: 38px; margin: 0 auto; display: block;"
                        @error="(e) => e.target.src = `https://isnanswc.github.io/gambar/${getMonthName(item.tanggal).toLowerCase()}.png`"
                      />
                    </td>
                  </tr>

                  <!-- ROW 3: Thick, Netto, Treatment (All Center) -->
                  <tr>
                    <td style="padding: 1px; font-size: 9.5px; text-align: center;"><strong>Thick</strong></td>
                    <td style="position: relative; padding: 0.5px; font-size: 15px; font-weight: bold; text-align: center;">
                      <span>{{ item.thickness }}</span>
                      <span style="position: absolute; top: 1px; right: 2px; font-size: 7px; font-weight: bold; color: #4b5563; line-height: 1;">MC</span>
                    </td>
                    <td style="padding: 1px; font-size: 9.5px; text-align: center;"><strong>Netto</strong></td>
                    <td style="position: relative; padding: 0.5px; font-size: 15px; font-weight: bold; text-align: center;">
                      <span>{{ item.netto }}</span>
                      <span style="position: absolute; top: 1px; right: 2px; font-size: 7px; font-weight: bold; color: #4b5563; line-height: 1;">KG</span>
                    </td>
                    <td style="padding: 1px; font-size: 9.5px; text-align: center;"><strong>Treatment</strong></td>
                    <td style="padding: 1px; color: red; font-weight: bold; font-size: 9.5px; text-align: center;">{{ item.treatment }}</td>
                  </tr>

                  <!-- ROW 4: Width, Paper Core, OD+Plasma (All Center) -->
                  <tr>
                    <td style="padding: 1px; font-size: 9.5px; text-align: center;"><strong>Width</strong></td>
                    <td style="position: relative; padding: 0.5px; font-size: 15px; font-weight: bold; text-align: center;">
                      <span>{{ item.width }}</span>
                      <span style="position: absolute; top: 1px; right: 2px; font-size: 7px; font-weight: bold; color: #4b5563; line-height: 1;">MM</span>
                    </td>
                    <td style="padding: 1px; font-size: 9.5px; text-align: center;"><strong>Paper Core</strong></td>
                    <td style="position: relative; padding: 0.5px; font-size: 15px; text-align: center;">
                      <span>{{ item.paperCore }}</span>
                      <span style="position: absolute; top: 1px; right: 2px; font-size: 7px; font-weight: bold; color: #4b5563; line-height: 1;">KG</span>
                    </td>
                    <td style="padding: 1px; font-size: 9.5px; text-align: center;"><strong>OD+Plasma</strong></td>
                    <td style="padding: 1px; color: red; font-weight: bold; font-size: 10.5px; text-align: center; word-break: break-all;">
                      {{ item.od }}
                    </td>
                  </tr>

                  <!-- ROW 5: Length, Joint, Meter (All Center) -->
                  <tr>
                    <td style="padding: 1px; font-size: 9.5px; text-align: center;"><strong>Length</strong></td>
                    <td style="position: relative; padding: 0.5px; font-size: 15px; font-weight: bold; text-align: center;">
                      <span>{{ item.length }}</span>
                      <span style="position: absolute; top: 1px; right: 2px; font-size: 7px; font-weight: bold; color: #4b5563; line-height: 1;">M</span>
                    </td>
                    <td style="padding: 1px; font-size: 9.5px; text-align: center;"><strong>Joint</strong></td>
                    <td style="padding: 0.5px; font-size: 15px; text-align: center;">
                      {{ item.joint !== undefined && item.joint !== '' ? item.joint : '0' }}
                    </td>
                    <td style="padding: 1px; font-size: 9.5px; text-align: center;"><strong>Meter</strong></td>
                    <td style="position: relative; padding: 0.5px; font-size: 13.5px; text-align: center;">
                      <span>{{ (item.meter && String(item.meter) !== String(item.length) && String(item.meter).trim() !== '') ? item.meter : '-' }}</span>
                      <span v-if="item.meter && String(item.meter) !== String(item.length) && String(item.meter).trim() !== '' && item.meter !== '-'" style="position: absolute; top: 1px; right: 2px; font-size: 7px; font-weight: bold; color: #4b5563; line-height: 1;">M</span>
                    </td>
                  </tr>

                  <!-- ROW 6: Supplier, Lot, Turunan (All Center) -->
                  <tr>
                    <td style="padding: 1px; background-color: #f0f0f0; font-size: 9.5px; text-align: center;"><strong>{{ item.supplier || '-' }}</strong></td>
                    <td colspan="4" style="padding: 1px; font-size: 15px; font-weight: bold; text-align: center;">{{ formatLotVisual(item.lot, item.supplier) }}</td>
                    <td style="padding: 1px; font-size: 12px; font-weight: bold; text-align: center;">{{ item.turunan }}</td>
                  </tr>

                  <!-- ROW 7: Code Pack & Status (All Center) -->
                  <tr>
                    <td style="padding: 1px; font-size: 9.5px; text-align: center;"><strong>Code Pack:</strong></td>
                    <td colspan="3" style="padding: 1px; font-size: 13.5px; text-align: center;">
                      <strong>{{ item.kodePack }}<span style="color: red;">{{ item.subKode }}</span></strong>
                    </td>
                    <td style="padding: 1px; font-size: 9.5px; text-align: center;"><strong>STATUS</strong></td>
                    <td :class="item.status === 'HOLD' ? 'label-fail' : item.status === 'REJECT' ? 'label-reject' : 'label-pass'" style="font-size: 9.5px; text-align: center;">
                      {{ item.status }}
                    </td>
                  </tr>

                  <!-- ROW 8: Keterangan (All Center) -->
                  <tr>
                    <td style="padding: 1px; font-size: 9.5px; text-align: center;"><strong>Ket:</strong></td>
                    <td colspan="5" style="padding: 1px; font-size: 9.5px; text-align: center;">{{ item.keterangan || '-' }}</td>
                  </tr>
                </tbody>
              </table>

              <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; padding-top: 3px; padding-bottom: 2px; box-sizing: border-box; line-height: 1.2;">
                <strong><span style="font-size: 8px; font-family: monospace; letter-spacing: 0.2px; color: #000;">{{ item.uniqId }}</span></strong>
                <span style="font-size: 8px; font-family: Arial, sans-serif; color: #1f2937;">{{ currentDateTimeString }}</span>
              </div>
            </div>

            <!-- Garis Bantu Putus-Putus dengan Icon Gunting -->
            <div
              v-if="(itemIdx + 1) % 4 !== 0"
              class="cut-line"
            >
              <svg class="cut-scissor-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="6" cy="6" r="3" />
                <circle cx="6" cy="18" r="3" />
                <line x1="20" y1="4" x2="8.12" y2="15.88" />
                <line x1="14.47" y1="14.48" x2="20" y2="20" />
                <line x1="8.12" y1="8.12" x2="12" y2="12" />
              </svg>
              <span class="cut-dash"></span>
            </div>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { formatLotVisual } from '@/services/aiAutomationService';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  previewItems: { type: Array, default: () => [] },
  previewPages: { type: Array, default: () => [] },
  currentDateTimeString: { type: String, default: '' },
  formatTanggalIndonesia: { type: Function, required: true },
  getMonthName: { type: Function, required: true },
  getLabelSign: { type: Function, required: true },
  getDisplayJenis: { type: Function, default: null }
});

const getDisplayJenis = (item) => {
  if (props.getDisplayJenis) return props.getDisplayJenis(item);
  return item?.alias || item?.jenis || '';
};

const emit = defineEmits(['update:modelValue', 'print']);

const close = () => {
  emit('update:modelValue', false);
};
</script>
