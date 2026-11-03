<template>
  <div class="barcode-wrapper flex flex-col items-center justify-center">
    <svg 
      v-if="bars.length > 0"
      :viewBox="`0 0 ${totalWidth} ${height}`" 
      :width="width || '100%'" 
      :height="height" 
      preserveAspectRatio="none"
      class="block"
    >
      <rect 
        v-for="(b, idx) in bars" 
        :key="idx" 
        :x="b.x" 
        :y="0" 
        :width="b.w" 
        :height="height" 
        fill="#000000" 
      />
    </svg>
    <div 
      v-if="showText && value" 
      class="barcode-text font-mono font-bold tracking-wider text-black text-center select-none"
      :style="{ fontSize: textSize || '10px', marginTop: textMarginTop || '1px' }"
    >
      {{ value }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  value: { type: String, default: '' },
  height: { type: [Number, String], default: 36 },
  width: { type: String, default: '' },
  showText: { type: Boolean, default: true },
  textSize: { type: String, default: '10px' },
  textMarginTop: { type: String, default: '1px' },
  quietZone: { type: Number, default: 10 }
});

// Code 128 Pattern Dictionary (Values 0 - 106)
// Each pattern represents 6 widths (bar, space, bar, space, bar, space) total 11 units.
// Stop pattern (106) is 2331112 (13 units).
const CODE128_PATTERNS = [
  "212222", "222122", "222221", "121223", "121322", "131222", "122213", "122312", "132212", "221213", // 0-9
  "221312", "231212", "112232", "122132", "122231", "113222", "123122", "123221", "223211", "221132", // 10-19
  "221231", "213212", "223112", "312131", "311222", "321122", "321221", "312212", "322112", "322211", // 20-29
  "212123", "212321", "232121", "111323", "131123", "131321", "112313", "132113", "132311", "211313", // 30-39
  "231113", "231311", "112133", "112331", "132131", "113123", "113321", "133121", "313121", "211331", // 40-49
  "231131", "213113", "213311", "213131", "311123", "311321", "331121", "312113", "312311", "332111", // 50-59
  "314111", "221411", "431111", "111224", "111422", "121124", "121421", "141122", "141221", "112214", // 60-69
  "112412", "122114", "122411", "142112", "142211", "241211", "221114", "413111", "241112", "134111", // 70-79
  "111242", "121142", "121241", "114212", "124112", "124211", "411212", "421112", "421211", "212141", // 80-89
  "214121", "412121", "111143", "111341", "131141", "114113", "114311", "411113", "411311", "113141", // 90-99
  "114131", "311141", "411131", "211412", "211214", "211232", "2331112"                                // 100-106
];

const encodeCode128B = (text) => {
  if (!text) return [];
  const clean = String(text);
  const codes = [];

  // Start B code is 104
  codes.push(104);
  let checkSum = 104;

  for (let i = 0; i < clean.length; i++) {
    const charCode = clean.charCodeAt(i);
    // ASCII 32 to 126
    let code = charCode - 32;
    if (code < 0 || code > 94) code = 0; // fallback to space
    codes.push(code);
    checkSum += code * (i + 1);
  }

  // Check digit
  codes.push(checkSum % 103);
  // Stop code is 106
  codes.push(106);

  return codes;
};

const barcodeLayout = computed(() => {
  const text = (props.value || '').trim();
  if (!text) return { bars: [], totalWidth: 100 };

  const codes = encodeCode128B(text);
  const bars = [];
  let currentX = props.quietZone;

  for (let cIdx = 0; cIdx < codes.length; cIdx++) {
    const pattern = CODE128_PATTERNS[codes[cIdx]];
    if (!pattern) continue;

    for (let p = 0; p < pattern.length; p++) {
      const width = parseInt(pattern[p], 10);
      const isBar = p % 2 === 0;

      if (isBar) {
        bars.push({ x: currentX, w: width });
      }
      currentX += width;
    }
  }

  currentX += props.quietZone;
  return { bars, totalWidth: currentX };
});

const bars = computed(() => barcodeLayout.value.bars);
const totalWidth = computed(() => barcodeLayout.value.totalWidth);
</script>

<style scoped>
.barcode-wrapper {
  user-select: none;
}
</style>
