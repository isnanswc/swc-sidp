<template>
  <div class="trivesta-logo-container flex flex-col items-center justify-center text-center select-none" :style="{ width: width || 'auto' }">
    <!-- Geometric 4-pointed dynamic star monogram -->
    <svg 
      class="trivesta-star-svg shrink-0" 
      viewBox="0 0 200 200" 
      :style="{ width: starSize || '54px', height: starSize || '54px' }"
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <!-- Orange Accent Rhombuses / Diagonal dashes -->
      <path d="M 64 52 L 76 40 L 88 52 L 76 64 Z" fill="#f59e0b" />
      <path d="M 124 52 L 136 40 L 148 52 L 136 64 Z" fill="#f59e0b" />
      <path d="M 64 148 L 76 136 L 88 148 L 76 160 Z" fill="#f59e0b" />
      <path d="M 124 148 L 136 136 L 148 148 L 136 160 Z" fill="#f59e0b" />

      <!-- Royal Blue Interlocking Geometric Ribbon Monogram -->
      <!-- Top / Center Vertical Needle & Left Wing -->
      <path 
        d="M 100 18 L 105 100 L 76 100 L 100 18 Z" 
        fill="#103e91" 
      />
      <!-- Sharp Dynamic Top-to-Right Fold -->
      <path 
        d="M 100 18 L 105 92 L 118 72 L 100 18 Z" 
        fill="#144bb2" 
      />
      <path 
        d="M 118 72 L 105 92 L 130 92 L 118 72 Z" 
        fill="#0d347d" 
      />
      <!-- Bottom Center Vertical Needle -->
      <path 
        d="M 100 182 L 95 100 L 124 100 L 100 182 Z" 
        fill="#103e91" 
      />
      <!-- Bottom-to-Left Fold -->
      <path 
        d="M 100 182 L 95 108 L 82 128 L 100 182 Z" 
        fill="#144bb2" 
      />
      <path 
        d="M 82 128 L 95 108 L 70 108 L 82 128 Z" 
        fill="#0d347d" 
      />
      <!-- Left Horizontal Star Arm -->
      <path 
        d="M 40 100 L 96 74 L 96 90 L 62 100 L 96 110 L 96 126 Z" 
        fill="#103e91" 
      />
      <!-- Right Horizontal Star Arm -->
      <path 
        d="M 160 100 L 104 74 L 104 90 L 138 100 L 104 110 L 104 126 Z" 
        fill="#103e91" 
      />
    </svg>

    <!-- Company Name -->
    <div 
      class="font-black tracking-wider text-slate-900 leading-tight uppercase"
      :style="{ fontSize: titleSize || '9.5px', fontFamily: `'Cinzel', 'Times New Roman', serif, system-ui` }"
    >
      TRIVESTA PACKAGING SDN BHD
    </div>

    <!-- Slogan / Tagline -->
    <div 
      class="text-slate-800 font-semibold tracking-wide leading-tight"
      :style="{ fontSize: sloganSize || '8px', fontFamily: `'Segoe Print', 'Caveat', 'Comic Sans MS', cursive` }"
    >
      We Protect What Matters
    </div>
  </div>
</template>

<script setup>
defineProps({
  width: { type: String, default: '' },
  starSize: { type: String, default: '48px' },
  titleSize: { type: String, default: '9px' },
  sloganSize: { type: String, default: '7.5px' }
});
</script>

<style scoped>
.trivesta-logo-container {
  display: inline-flex;
}
</style>
