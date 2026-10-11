<template>
  <div class="swc-image-logo-container select-none">
    <!-- Gambar Resmi SWC dari folder gambar/logo.png -->
    <img
      :src="logoSrc"
      alt="SWC"
      class="swc-img-mono"
    />
  </div>
</template>

<script setup>
import logoAsset from '../../../gambar/logo.png';

const logoSrc = logoAsset || '/gambar/logo.png';
</script>

<style scoped>
.swc-image-logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 2px 4px;
  box-sizing: border-box;
}

.swc-img-mono {
  width: 100%;
  max-width: 135px;
  height: auto;
  max-height: 48px;
  object-fit: contain;
  display: block;
  /* Filter monokrom hitam-putih presisi dan kontras tajam untuk cetak */
  filter: grayscale(100%) contrast(250%) brightness(0.2);
  -webkit-filter: grayscale(100%) contrast(250%) brightness(0.2);
}

@media print {
  .swc-img-mono {
    filter: grayscale(100%) contrast(300%) brightness(0) !important;
    -webkit-filter: grayscale(100%) contrast(300%) brightness(0) !important;
  }
}
</style>
