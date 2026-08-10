<template>
  <div class="image-picker-flyout" :class="{ dark: isDarkTheme }">
    <div class="flyout-header">
      <div class="flyout-title">{{ t('panel.copyright_free_images') }}</div>
      <button class="upload-btn" @click="triggerUpload" :title="t('panel.upload_local_image')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="17 8 12 3 7 8"></polyline>
          <line x1="12" y1="3" x2="12" y2="15"></line>
        </svg>{{ t('panel.upload') }}</button>
      <input type="file" ref="fileInput" accept="image/*" style="display: none" @change="handleUpload" />
    </div>
    
    <div class="image-grid">
      <div v-for="id in imageIds" :key="id" 
           class="image-box" 
           :class="{ active: currentImageId === id }"
           @click="selectImage(id)">
        <img :src="`https://picsum.photos/id/${id}/100/100`" loading="lazy" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useCanvasContext } from '@iss-ai/ppt-board';
import { useI18n } from '../composables/useI18n';

const props = defineProps<{
  modelValue: string;
}>();

const ctx = useCanvasContext();
const { t } = useI18n();
const isDarkTheme = computed(() => ctx.state?.editor?.theme === 'dark');

const emit = defineEmits(['update:modelValue', 'close']);

// 30 valid image IDs from picsum (some IDs are missing, so I picked a safe range starting at 10)
const imageIds = [
  10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
  20, 21, 22, 23, 24, 25, 26, 27, 28, 29,
  30, 31, 32, 33, 34, 35, 36, 37, 38, 39
];

const currentImageId = computed(() => {
  if (!props.modelValue) return -1;
  const match = props.modelValue.match(/id\/(\d+)/);
  return match ? parseInt(match[1], 10) : -1;
});

const selectImage = (id: number) => {
  const url = `https://picsum.photos/id/${id}/800/600`;
  emit('update:modelValue', `url(${url})`);
  emit('close');
};

const fileInput = ref<HTMLInputElement | null>(null);

const triggerUpload = () => {
  if (fileInput.value) {
    fileInput.value.click();
  }
};

const handleUpload = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    const file = target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target && event.target.result) {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;
          const MAX_SIZE = 1200;
          
          if (width > MAX_SIZE || height > MAX_SIZE) {
            if (width > height) {
              height = Math.round((height * MAX_SIZE) / width);
              width = MAX_SIZE;
            } else {
              width = Math.round((width * MAX_SIZE) / height);
              height = MAX_SIZE;
            }
          }
          
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            // Compress as WebP if supported, otherwise jpeg. Quality 0.8.
            const mimeType = file.type === 'image/png' ? 'image/png' : 'image/webp';
            // PNG doesn't support quality parameter in standard toDataURL, but webp/jpeg does.
            // Using webp for good compression while preserving quality.
            const compressedDataUrl = canvas.toDataURL('image/webp', 0.8);
            emit('update:modelValue', `url(${compressedDataUrl})`);
          } else if (event.target) {
            emit('update:modelValue', `url(${event.target.result as string})`);
          }
          emit('close');
        };
        img.src = event.target.result as string;
      }
    };
    reader.readAsDataURL(file);
    target.value = ''; // Reset input
  }
};
</script>

<style scoped>
.image-picker-flyout {
  width: 280px;
  background: var(--canvas-panel-bg, #ffffff);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  cursor: default;
}

.flyout-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.flyout-title {
  font-size: 13px;
  font-weight: 500;
  color: var(--canvas-text-color, #333);
}

.upload-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  background: var(--canvas-btn-bg, #f1f3f5);
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 12px;
  color: var(--canvas-text-color, #495057);
  cursor: pointer;
  transition: all 0.2s;
}

.upload-btn:hover {
  background: var(--canvas-btn-hover-bg, #e9ecef);
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  max-height: 240px;
  overflow-y: auto;
  padding-right: 4px;
}

/* Scrollbar for image grid */
.image-grid::-webkit-scrollbar {
  width: 4px;
}
.image-grid::-webkit-scrollbar-track {
  background: transparent;
}
.image-grid::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

.image-box {
  aspect-ratio: 1;
  border-radius: 6px;
  overflow: hidden;
  border: 2px solid transparent;
  cursor: pointer;
  transition: transform 0.1s;
}

.image-box:hover {
  transform: scale(1.05);
}

.image-box.active {
  border-color: var(--canvas-active-color, #748ffc);
}

.image-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* Dark Theme Overrides */
.dark, :host-context(.dark) {
  --canvas-panel-bg: #2c2c2c;
  --canvas-btn-bg: #3a3a3a;
  --canvas-btn-hover-bg: #4a4a4a;
  --canvas-border-color: #555;
  --canvas-text-color: #e0e0e0;
  --canvas-text-muted: #aaa;
  --canvas-input-bg: #1e1e1e;
}


</style>
