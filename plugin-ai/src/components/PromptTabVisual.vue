<template>
  <n-scrollbar class="custom-scroll" style="height: 100%; padding-right: 12px;">
    <div class="style-panel-overlay">

      <div class="group-header">{{ t("visual.page_size") }}</div>
      <div class="section">
        <div class="section-title">{{ t("visual.resolution") }}</div>
        <div class="icon-group wrap">
          <button v-for="res in resolutionPresets" :key="res.value" class="visual-pill"
            :class="{ active: formData.styleConfig.resolution === res.value }"
            @click="formData.styleConfig.resolution = res.value">
            <span style="white-space: pre-line; text-align: center; line-height: 1.2;">{{ res.label }}</span>
          </button>
        </div>
        <div style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">
          <n-input v-model:value="customResWidth" size="small" :placeholder="t('visual.width')" style="width: 70px" />
          <span style="color: #888">×</span>
          <n-input v-model:value="customResHeight" size="small" :placeholder="t('visual.height')" style="width: 70px" />
          <n-button size="small" @click="applyCustomResolution">{{ t("common.apply_btn") }}</n-button>
        </div>
      </div>

      <div class="section">
        <div class="section-title">{{ t("visual.aspect_ratio") }}</div>
        <div class="icon-group wrap">
          <button v-for="ratio in ratioOptions" :key="ratio.value" class="visual-pill"
            :class="{ active: formData.styleConfig.aspectRatio === ratio.value }"
            @click="formData.styleConfig.aspectRatio = ratio.value">
            {{ ratio.label }}
          </button>
        </div>
      </div>

      <div class="group-divider"></div>
      <div class="group-header">{{ t("visual.visual_design") }}</div>

      <div class="section">
        <div class="section-title">{{ t("visual.layout") }}</div>
        <div class="visual-grid layout-grid">
          <div v-for="s in layoutOptions" :key="s.value" class="visual-card"
            :class="{ active: isSelected('layout', s.value) }" @click="toggleMulti('layout', s.value)">
            <div v-if="s.svg" class="visual-preview layout-preview" v-html="s.svg"></div>
            <div v-else class="visual-preview empty-preview">{{ t('common.none') }}</div>
            <span class="visual-name">{{ tOpt(s.label) }}</span>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">{{ t("visual.color_palette") }}</div>
        <div class="visual-grid color-grid">
          <div v-for="s in colorOptions" :key="s.value" class="visual-card"
            :class="{ active: isSelected('colorPalette', s.value) }"
            @click="toggleMulti('colorPalette', s.value)">
            <div v-if="s.gradient" class="visual-preview color-preview" :style="{ background: s.gradient }"></div>
            <div v-else class="visual-preview empty-preview">{{ t('common.none') }}</div>
            <span class="visual-name">{{ tOpt(s.label) }}</span>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">{{ t("visual.language") }}</div>
        <div class="icon-group wrap">
          <button v-for="s in languageOptions" :key="s.value" class="icon-btn text-btn"
            :class="{ active: isSelected('language', s.value) }" @click="toggleMulti('language', s.value)">
            {{ tOpt(s.label) }}
          </button>
        </div>
      </div>

      <div class="section">
        <div class="section-title">{{ t("visual.font_size") }}</div>
        <div class="icon-group wrap">
          <button v-for="s in fontSizeOptions" :key="s.value" class="icon-btn text-btn"
            :class="{ active: isSelected('fontSize', s.value) }" @click="toggleMulti('fontSize', s.value)">
            {{ tOpt(s.label) }}
          </button>
        </div>
      </div>

      <div class="section">
        <div class="section-title">{{ t("visual.font") }}</div>
        <div class="visual-grid font-grid">
          <div v-for="s in fontOptions" :key="s.value" class="visual-card"
            :class="{ active: isSelected('font', s.value) }" @click="toggleMulti('font', s.value)">
            <div v-if="s.fontFamily" class="visual-preview font-preview" :style="{ fontFamily: s.fontFamily }">Aa
            </div>
            <div v-else class="visual-preview empty-preview">{{ t('common.none') }}</div>
            <span class="visual-name">{{ tOpt(s.label) }}</span>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">{{ t("visual.page_style") }}</div>
        <div class="visual-grid style-grid">
          <button v-for="s in styleOptions" :key="s.value" class="visual-chip"
            :class="{ active: isSelected('style', s.value) }" @click="toggleMulti('style', s.value)">
            {{ tOpt(s.label) }}
          </button>
        </div>
      </div>

      <div class="group-divider"></div>
      <div class="group-header">{{ t("visual.effects") }}</div>

      <div class="section">
        <div class="section-title">{{ t("visual.shadow") }}</div>
        <div class="visual-grid effect-grid">
          <div v-for="s in effectOptions" :key="s.value" class="visual-card"
            :class="{ active: isSelected('shadow', s.value) }" @click="toggleMulti('shadow', s.value)">
            <div v-if="s.effectStyle" class="visual-preview effect-preview">
              <div class="effect-box" :style="s.effectStyle"></div>
            </div>
            <div v-else class="visual-preview empty-preview">{{ t('common.none') }}</div>
            <span class="visual-name">{{ tOpt(s.label) }}</span>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">{{ t("visual.text_effect") }}</div>
        <div class="visual-grid effect-grid">
          <div v-for="s in textEffectOptions" :key="s.value" class="visual-card"
            :class="{ active: isSelected('textEffect', s.value) }" @click="toggleMulti('textEffect', s.value)">
            <div v-if="s.textStyle" class="visual-preview text-effect-preview"
              style="font-weight: 800; font-size: 15px; color: #fff;">
              <div :style="s.textStyle">Ag</div>
            </div>
            <div v-else class="visual-preview empty-preview">{{ t('common.none') }}</div>
            <span class="visual-name">{{ tOpt(s.label) }}</span>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">{{ t("visual.shapes") }}</div>
        <div class="icon-group wrap">
          <button v-for="s in shapeOptions" :key="s.value" class="icon-btn text-btn"
            :class="{ active: isSelected('shapes', s.value) }" @click="toggleMulti('shapes', s.value)">
            {{ tOpt(s.label) }}
          </button>
        </div>
      </div>

      <div class="section">
        <div class="section-title">{{ t("visual.border_sketch") }}</div>
        <div class="icon-group wrap">
          <button v-for="s in borderOptions" :key="s.value" class="icon-btn text-btn"
            :class="{ active: isSelected('borderSketch', s.value) }"
            @click="toggleMulti('borderSketch', s.value)">
            {{ tOpt(s.label) }}
          </button>
        </div>
      </div>

      <div class="group-divider"></div>
      <div class="group-header">{{ t("visual.advanced") }}</div>

      <div class="section">
        <div class="section-title">{{ t("visual.switches") }}</div>
        <div class="icon-group wrap switch-group">
          <label class="switch-item" :class="{ active: formData.styleConfig.bgm }">
            <input type="checkbox" v-model="formData.styleConfig.bgm" />
            <span>BGM</span>
          </label>
          <label class="switch-item" :class="{ active: formData.styleConfig.supportImage }">
            <input type="checkbox" v-model="formData.styleConfig.supportImage" />
            <span>{{ t("visual.support_image") }}</span>
          </label>
          <label class="switch-item" :class="{ active: formData.styleConfig.supportSound }">
            <input type="checkbox" v-model="formData.styleConfig.supportSound" />
            <span>{{ t("visual.support_sound") }}</span>
          </label>
        </div>
      </div>
    </div>
  </n-scrollbar>
</template>

<script setup lang="ts">
import { ref, PropType } from 'vue';
import { NScrollbar, NInput, NButton } from 'naive-ui';
import type { AIPrompt } from '../composables/useAIStorage';
import { useI18n } from '../composables/useI18n';


const { t } = useI18n();

const tOpt = (label: string) => {
  if (label.startsWith('common.')) return t(label);
  const translated = t(`visual.opt.${label}`);
  // If translation fails (returns key), strip the prefix
  if (translated === `visual.opt.${label}`) return label;
  return translated;
};


const props = defineProps({
  formData: {
    type: Object as PropType<Omit<AIPrompt, 'id'>>,
    required: true
  }
});

const customResWidth = ref('');
const customResHeight = ref('');

const applyCustomResolution = () => {
  if (customResWidth.value && customResHeight.value) {
    props.formData.styleConfig.resolution = `${customResWidth.value}x${customResHeight.value}`;
  }
};

const createOptions = (items: string[]) => [
  { label: 'common.none', value: 'none' },
  ...items.map(i => ({ label: i, value: i }))
];

const resolutionPresets = [
  { label: 'Mobile S\n320', value: '320x568' },
  { label: 'Mobile M\n375', value: '375x667' },
  { label: 'Mobile L\n425', value: '425x896' },
  { label: 'Tablet\n768', value: '768x1024' },
  { label: 'Laptop\n1024', value: '1024x768' },
  { label: 'iPad Pro\n1366', value: '1366x1024' },
  { label: '720p\nHD', value: '1280x720' },
  { label: '1080p\nFHD', value: '1920x1080' },
  { label: '2K\nQHD', value: '2560x1440' },
  { label: '4K\nUHD', value: '3840x2160' },
  { label: 'A4\nPrint', value: '794x1123' },
  { label: 'Letter\nPrint', value: '816x1056' },
];

const ratioOptions = [
  { label: '自适应', value: 'auto' },
  { label: '16:9', value: '16:9' },
  { label: '4:3', value: '4:3' },
  { label: '1:1', value: '1:1' },
  { label: '9:16', value: '9:16' },
  { label: '3:2', value: '3:2' },
  { label: '21:9', value: '21:9' },
  { label: '3:4', value: '3:4' },
  { label: 'common.none', value: 'none' },
];

const styleOptions = [
  { label: 'common.none', value: 'none' },
  { label: '极简主义', value: '极简主义' },
  { label: '科技未来', value: '科技未来' },
  { label: '商务专业', value: '商务专业' },
  { label: '扁平插画', value: '扁平插画' },
  { label: '复古报纸', value: '复古报纸' },
  { label: '赛博朋克', value: '赛博朋克' },
  { label: '毛玻璃', value: '毛玻璃' },
  { label: '新拟态', value: '新拟态' },
  { label: '3D 立体', value: '3D 立体' },
  { label: '酸性设计', value: '酸性设计' },
  { label: '手绘草图', value: '手绘草图' },
  { label: '波普艺术', value: '波普艺术' },
  { label: '包豪斯', value: '包豪斯' },
  { label: '杂志风', value: '杂志风' },
  { label: '剪纸风', value: '剪纸风' },
  { label: '水墨国风', value: '水墨国风' },
  { label: '赛璐珞', value: '赛璐珞' },
  { label: '废土风', value: '废土风' },
  { label: '孟菲斯', value: '孟菲斯' },
];

const layoutOptions = [
  { label: 'common.none', value: 'none', svg: '' },
  { label: '居中大字', value: '居中', svg: `<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg"><rect x="12" y="5" width="36" height="30" rx="3" fill="#4a9eff" opacity=".5"/><rect x="18" y="11" width="24" height="4" rx="1" fill="#fff" opacity=".7"/><rect x="20" y="18" width="20" height="2" rx="1" fill="#fff" opacity=".5"/><rect x="22" y="24" width="16" height="2" rx="1" fill="#fff" opacity=".4"/></svg>` },
  { label: '左右分栏', value: '左右分栏', svg: `<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg"><rect x="1" y="1" width="28" height="38" rx="2" fill="#4a9eff" opacity=".7"/><rect x="31" y="1" width="28" height="38" rx="2" fill="#a0c4ff" opacity=".5"/></svg>` },
  { label: '左侧导航', value: '左侧导航', svg: `<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg"><rect x="1" y="1" width="14" height="38" rx="2" fill="#8e44ad" opacity=".7"/><rect x="17" y="1" width="42" height="38" rx="2" fill="#444" opacity=".4"/></svg>` },
  { label: '右侧导航', value: '右侧导航', svg: `<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg"><rect x="1" y="1" width="42" height="38" rx="2" fill="#444" opacity=".4"/><rect x="45" y="1" width="14" height="38" rx="2" fill="#8e44ad" opacity=".7"/></svg>` },
  { label: '瀑布流网格', value: '网格', svg: `<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg"><rect x="1" y="1" width="18" height="24" rx="2" fill="#4a9eff" opacity=".7"/><rect x="21" y="1" width="18" height="12" rx="2" fill="#a0c4ff" opacity=".5"/><rect x="21" y="15" width="18" height="10" rx="2" fill="#4a9eff" opacity=".4"/><rect x="41" y="1" width="18" height="18" rx="2" fill="#a0c4ff" opacity=".6"/><rect x="1" y="27" width="58" height="12" rx="2" fill="#555" opacity=".4"/></svg>` },
  { label: '卡片矩阵', value: '卡片矩阵', svg: `<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg"><rect x="1" y="1" width="18" height="18" rx="2" fill="#4a9eff" opacity=".6"/><rect x="21" y="1" width="18" height="18" rx="2" fill="#4a9eff" opacity=".6"/><rect x="41" y="1" width="18" height="18" rx="2" fill="#4a9eff" opacity=".6"/><rect x="1" y="21" width="18" height="18" rx="2" fill="#a0c4ff" opacity=".4"/><rect x="21" y="21" width="18" height="18" rx="2" fill="#a0c4ff" opacity=".4"/><rect x="41" y="21" width="18" height="18" rx="2" fill="#a0c4ff" opacity=".4"/></svg>` },
  { label: 'F型阅读', value: 'F型阅读', svg: `<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg"><rect x="1" y="1" width="58" height="8" rx="2" fill="#e67e22" opacity=".7"/><rect x="1" y="12" width="35" height="5" rx="2" fill="#e67e22" opacity=".5"/><rect x="1" y="20" width="20" height="19" rx="2" fill="#444" opacity=".4"/><rect x="22" y="20" width="37" height="19" rx="2" fill="#555" opacity=".3"/></svg>` },
  { label: 'Z型阅读', value: 'Z型阅读', svg: `<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg"><rect x="1" y="1" width="28" height="17" rx="2" fill="#27ae60" opacity=".6"/><rect x="31" y="1" width="28" height="17" rx="2" fill="#444" opacity=".4"/><rect x="1" y="22" width="28" height="17" rx="2" fill="#444" opacity=".4"/><rect x="31" y="22" width="28" height="17" rx="2" fill="#27ae60" opacity=".6"/></svg>` },
  { label: '三栏布局', value: '三栏', svg: `<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg"><rect x="1" y="1" width="17" height="38" rx="2" fill="#4a9eff" opacity=".7"/><rect x="21" y="1" width="18" height="38" rx="2" fill="#a0c4ff" opacity=".5"/><rect x="41" y="1" width="18" height="38" rx="2" fill="#4a9eff" opacity=".4"/></svg>` },
  { label: '侧边杂志', value: '侧边杂志', svg: `<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg"><rect x="1" y="1" width="20" height="38" rx="2" fill="#e74c3c" opacity=".7"/><rect x="23" y="1" width="36" height="18" rx="2" fill="#444" opacity=".4"/><rect x="23" y="21" width="17" height="18" rx="2" fill="#444" opacity=".3"/><rect x="42" y="21" width="17" height="18" rx="2" fill="#444" opacity=".3"/></svg>` },
  { label: '拼图画廊', value: '拼图画廊', svg: `<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg"><rect x="1" y="1" width="28" height="18" rx="2" fill="#4a9eff" opacity=".6"/><rect x="31" y="1" width="28" height="18" rx="2" fill="#27ae60" opacity=".6"/><rect x="1" y="21" width="18" height="18" rx="2" fill="#e67e22" opacity=".6"/><rect x="21" y="21" width="38" height="18" rx="2" fill="#8e44ad" opacity=".6"/></svg>` },
  { label: '对角线分割', value: '对角线', svg: `<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg"><polygon points="1,1 59,1 1,39" fill="#4a9eff" opacity=".5"/><polygon points="59,39 59,1 1,39" fill="#a0c4ff" opacity=".3"/></svg>` },
  { label: '画中画', value: '画中画', svg: `<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg"><rect x="1" y="1" width="58" height="38" rx="2" fill="#4a9eff" opacity=".3"/><rect x="15" y="10" width="30" height="20" rx="2" fill="#fff" opacity=".8"/></svg>` },
  { label: '全屏大图', value: '全屏大图', svg: `<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="60" height="40" fill="#4a9eff" opacity=".5"/><rect x="10" y="8" width="40" height="24" rx="2" fill="#fff" opacity=".15"/><rect x="14" y="13" width="22" height="4" rx="1" fill="#fff" opacity=".6"/><rect x="14" y="20" width="32" height="2" rx="1" fill="#fff" opacity=".4"/></svg>` },
];

const colorOptions = [
  { label: 'common.none', value: 'none', gradient: '' },
  { label: '午夜幽蓝', value: '深色模式', gradient: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)' },
  { label: '晨曦白露', value: '浅色模式', gradient: 'linear-gradient(135deg, #fdfbfb, #ebedee)' },
  { label: '莫兰迪高级灰', value: '莫兰迪色', gradient: 'linear-gradient(135deg, #d3d3d3, #b5b5b5, #8f8f8f)' },
  { label: '极光幻境', value: '极光', gradient: 'linear-gradient(135deg, #0d324d, #7f5a83, #00b4d8)' },
  { label: '晚霞余晖', value: '日落', gradient: 'linear-gradient(135deg, #f7971e, #ffd200, #ff5e62)' },
  { label: '霓虹赛博', value: '霓虹', gradient: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)' },
  { label: '森林青苔', value: '森林', gradient: 'linear-gradient(135deg, #134e5e, #71b280, #a8e063)' },
  { label: '玫瑰石英', value: '玫瑰色', gradient: 'linear-gradient(135deg, #f8cdda, #1d2b64, #f8cdda)' },
  { label: '深海幽梦', value: '深海', gradient: 'linear-gradient(135deg, #005c97, #363795, #00d2ff)' },
  { label: '经典黑白', value: '高对比度', gradient: 'linear-gradient(135deg, #111, #555, #ccc)' },
  { label: '紫电风暴', value: '紫电', gradient: 'linear-gradient(135deg, #360033, #0b8793, #8e0e00)' },
  { label: '梦幻马卡龙', value: '马卡龙', gradient: 'linear-gradient(135deg, #fbc2eb, #a6c1ee, #ffecd2)' },
  { label: '猩红之夜', value: '血色', gradient: 'linear-gradient(135deg, #1a1a2e, #16213e, #e94560)' },
  { label: '薄荷清新', value: '薄荷', gradient: 'linear-gradient(135deg, #00b09b, #96c93d, #ffffff)' },
  { label: '岩浆暗流', value: '岩浆', gradient: 'linear-gradient(135deg, #200122, #6f0000, #cc2b2b)' },
  { label: '极地冰原', value: '冰原', gradient: 'linear-gradient(135deg, #e0eafc, #cfdef3, #a8c0ff)' },
  { label: '黑金奢华', value: '黑金', gradient: 'linear-gradient(135deg, #1a1a1a, #4a4a4a, #d4af37)' },
  { label: '青花瓷', value: '青花瓷', gradient: 'linear-gradient(135deg, #ffffff, #f0f0f0, #003366)' },
  { label: '赛博荧光', value: '赛博', gradient: 'linear-gradient(135deg, #ff00ff, #00ffff, #00ff00)' },
  { label: '琥珀流光', value: '琥珀', gradient: 'linear-gradient(135deg, #ff7e5f, #feb47b)' },
  { label: '静谧森林', value: '静谧', gradient: 'linear-gradient(135deg, #2c3e50, #3498db)' },
];

const fontOptions = [
  { label: 'common.none', value: 'none', fontFamily: '' },
  { label: '无衬线黑体', value: '无衬线', fontFamily: 'sans-serif' },
  { label: '经典宋体', value: '衬线', fontFamily: 'serif' },
  { label: '思源黑体', value: '思源黑体', fontFamily: 'Noto Sans SC, sans-serif' },
  { label: '思源宋体', value: '思源宋体', fontFamily: 'Noto Serif SC, serif' },
  { label: '站酷快乐体', value: '站酷快乐体', fontFamily: 'ZCOOL KuaiLe, cursive' },
  { label: '站酷小薇', value: '站酷小薇', fontFamily: 'ZCOOL XiaoWei, serif' },
  { label: '马善政毛笔体', value: '马善政毛笔体', fontFamily: 'Ma Shan Zheng, cursive' },
  { label: '刘建毛草', value: '刘建毛草', fontFamily: 'Liu Jian Mao Cao, cursive' },
  { label: '龙藏体', value: '龙藏体', fontFamily: 'Long Cang, cursive' },
  { label: '智芒星', value: '智芒星', fontFamily: 'Zhi Mang Xing, cursive' },
  { label: 'Outfit (英)', value: 'Outfit', fontFamily: 'Outfit, sans-serif' },
];

const effectOptions = [
  { label: 'common.none', value: 'none', effectStyle: '' },
  { label: '轻柔弥散阴影', value: '投影', effectStyle: 'box-shadow: 0 4px 12px rgba(0,0,0,0.15);' },
  { label: '厚重质感投影', value: '厚投影', effectStyle: 'box-shadow: 0 10px 30px rgba(0,0,0,0.3);' },
  { label: '拟物凹陷内阴影', value: '内阴影', effectStyle: 'box-shadow: inset 0 2px 10px rgba(0,0,0,0.2);' },
  { label: '炫彩环境光发光', value: '发光', effectStyle: 'box-shadow: 0 0 15px rgba(99,102,241,0.6);' },
  { label: '复古硬边缘投影', value: '硬投影', effectStyle: 'box-shadow: 4px 4px 0px rgba(0,0,0,0.8);' },
  { label: '玻璃高光反射', value: '玻璃高光', effectStyle: 'background: linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 100%);' },
  { label: '新拟态凸起', value: '拟态凸起', effectStyle: 'box-shadow: 5px 5px 10px #d1d9e6, -5px -5px 10px #ffffff;' },
  { label: '新拟态凹陷', value: '拟态凹陷', effectStyle: 'box-shadow: inset 5px 5px 10px #d1d9e6, inset -5px -5px 10px #ffffff;' },
  { label: '赛博故障色偏', value: '故障', effectStyle: 'box-shadow: 3px 0 0 red, -3px 0 0 cyan;' },
];

const textEffectOptions = [
  { label: 'common.none', value: 'none', textStyle: '' },
  { label: '醒目外描边', value: '描边', textStyle: '-webkit-text-stroke: 1px currentColor;' },
  { label: '潮流文字渐变', value: '渐变', textStyle: 'background: linear-gradient(90deg, #ff8a00, #e52e71); -webkit-background-clip: text; -webkit-text-fill-color: transparent;' },
  { label: '多层立体厚度', value: '立体', textStyle: 'text-shadow: 1px 1px 0 #ccc, 2px 2px 0 #bbb, 3px 3px 0 #aaa;' },
  { label: '赛博霓虹发光', value: '霓虹', textStyle: 'text-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 20px #0ff;' },
  { label: '故障艺术抖动', value: '故障抖动', textStyle: 'text-shadow: 2px 0 red, -2px 0 cyan;' },
  { label: '水墨晕染边缘', value: '水墨晕染', textStyle: 'text-shadow: 0 0 8px rgba(0,0,0,0.8); color: transparent;' },
];

const fontSizeOptions = createOptions(['极小 (12-14px)', '偏小 (16-20px)', '中等 (24-32px)', '偏大 (40-56px)', '巨大 (64-120px)']);
const languageOptionsRaw = [
  { code: 'Original / 原文', flag: '🌐', label: 'Original / 原文' },
  { code: 'zh-CN', flag: '🇨🇳', label: '简体中文' },
  { code: 'en', flag: '🇺🇸', label: 'English' },
  { code: 'ko', flag: '🇰🇷', label: '한국어' },
  { code: 'ja', flag: '🇯🇵', label: '日本語' },
  { code: 'fr', flag: '🇫🇷', label: 'Français' },
  { code: 'ru', flag: '🇷🇺', label: 'Русский' },
  { code: 'de', flag: '🇩🇪', label: 'Deutsch' },
  { code: 'id', flag: '🇮🇩', label: 'Bahasa Indonesia' },
  { code: 'tl', flag: '🇵🇭', label: 'Tagalog' },
  { code: 'sq', flag: '🇦🇱', label: 'Shqip' },
  { code: 'tr', flag: '🇹🇷', label: 'Türkçe' },
  { code: 'my', flag: '🇲🇲', label: 'မြန်မာ' },
  { code: 'th', flag: '🇹🇭', label: 'ไทย' },
  { code: 'vi', flag: '🇻🇳', label: 'Tiếng Việt' },
  { code: 'pl', flag: '🇵🇱', label: 'Polski' },
  { code: 'pt', flag: '🇵🇹', label: 'Português' }
];
const languageOptions = [
  { label: 'common.none', value: 'none' },
  ...languageOptionsRaw.map(item => ({ label: `${item.flag} ${item.label}`, value: item.code }))
];
const borderOptions = createOptions(['实线边框', '虚线边框', '点状虚线', '双线边框', '手绘波浪线', '不规则草图', '科技感折线', '毛边撕裂感']);
const shapeOptions = createOptions(['基础矩形', '完美圆形', '圆角矩形', '几何多边形', '流体渐变形状', '星形', '对话气泡', '手绘涂鸦线', '像素块阵列']);

const isSelected = (field: keyof typeof props.formData.styleConfig, value: string) => {
  const current = props.formData.styleConfig[field] as string[] | undefined;
  if (!current && value === 'none') return true;
  return current?.includes(value) || false;
};

const toggleMulti = (field: keyof typeof props.formData.styleConfig, value: string) => {
  let current = (props.formData.styleConfig[field] as string[]) || [];

  if (value === 'none') {
    props.formData.styleConfig[field] = ['none'] as any;
    return;
  }

  // Remove 'none' if present
  current = current.filter(v => v !== 'none');

  if (current.includes(value)) {
    current = current.filter(v => v !== value);
  } else {
    current.push(value);
  }

  if (current.length === 0) current = ['none'];
  props.formData.styleConfig[field] = current as any;
};
</script>

<style scoped>
.style-panel-overlay {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.group-header {
  font-size: 13px;
  font-weight: 600;
  color: var(--ai-text);
  margin: 12px 0 8px 0;
  padding-left: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.group-divider {
  height: 1px;
  background-color: var(--ai-border);
  margin: 12px 0;
}

.section {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}

.section-title {
  font-size: 12px;
  color: var(--ai-text-muted);
  padding-left: 4px;
}

.icon-group {
  display: flex;
  background: var(--ai-panel-bg);
  border-radius: 8px;
  padding: 2px;
  gap: 2px;
}

.icon-group.wrap {
  flex-wrap: wrap;
  background: transparent;
  padding: 0;
  gap: 6px;
}

.icon-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: var(--ai-text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
}

.icon-btn.text-btn {
  width: auto;
  min-width: 44px;
  padding: 0 10px;
  font-size: 12px;
  background: var(--ai-panel-bg);
}

.icon-btn:hover {
  background: var(--ai-hover);
  color: var(--ai-text);
}

.icon-btn.active {
  background: var(--ai-bg);
  color: var(--ai-primary);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  font-weight: 500;
}

.icon-group.wrap .icon-btn.active {
  background: var(--ai-primary-bg, rgba(99, 102, 241, 0.15));
  color: var(--ai-primary);
  box-shadow: none;
}

/* Visual Settings Grid UI */
.visual-pill {
  background: var(--ai-panel-bg);
  border: 1px solid transparent;
  color: var(--ai-text-muted);
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 11px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
}



.visual-pill:hover {
  background: var(--ai-hover);
}



.visual-pill.active {
  background: var(--ai-primary-bg, rgba(99, 102, 241, 0.15));
  border-color: var(--ai-primary);
  color: var(--ai-primary);
  font-weight: 500;
}



.visual-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(56px, 1fr));
  gap: 6px;
}

.visual-grid.layout-grid {
  grid-template-columns: repeat(auto-fill, minmax(68px, 1fr));
}

.visual-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 5px 3px;
  border-radius: 6px;
  border: 1px solid var(--ai-border);
  background: #fafafa;
  cursor: pointer;
  transition: all 0.18s;
  user-select: none;
}



.visual-card:hover {
  background: var(--ai-hover);
  border-color: #ccc;
}



.visual-card.active {
  background: var(--ai-primary-bg, rgba(99, 102, 241, 0.15));
  border-color: var(--ai-primary);
  box-shadow: 0 0 0 1px #6366f1;
}



.visual-preview {
  width: 100%;
  height: 30px;
  overflow: hidden;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--ai-bg);
}



.visual-preview.empty-preview {
  color: var(--ai-text-muted);
  font-size: 12px;
  background: transparent !important;
}

.visual-preview.layout-preview :deep(svg) {
  width: 100%;
  height: 100%;
}

.visual-preview.color-preview {
  height: 26px;
  border-radius: 4px;
}

.visual-preview.font-preview {
  font-size: 14px;
  color: var(--ai-text);
}



.visual-preview.effect-preview {
  background: #e9e9e9;
}



.effect-box {
  width: 18px;
  height: 18px;
  background: var(--ai-bg);
  border-radius: 3px;
}



.visual-preview.text-effect-preview {
  background: #e9e9e9;
}



.visual-name {
  font-size: 10px;
  color: var(--ai-text-muted);
  text-align: center;
  line-height: 1.2;
}



.visual-card.active .visual-name {
  color: var(--ai-primary);
  font-weight: 500;
}



.visual-grid.style-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.visual-chip {
  background: var(--ai-panel-bg);
  border: 1px solid var(--ai-border);
  color: var(--ai-text-muted);
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}



.visual-chip:hover {
  background: var(--ai-hover);
}



.visual-chip.active {
  background: var(--ai-primary-bg, rgba(99, 102, 241, 0.15));
  border-color: var(--ai-primary);
  color: var(--ai-primary);
  font-weight: 500;
}



/* Switches */
.switch-group {
  display: flex;
  gap: 8px;
}

.switch-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--ai-text-muted);
  background: var(--ai-panel-bg);
  padding: 6px 12px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
}

.switch-item input {
  display: none;
}

.switch-item.active {
  background: var(--ai-primary-bg, rgba(99, 102, 241, 0.15));
  color: var(--ai-primary);
  font-weight: 500;
}

/* Dark mode tweaks */
























/* Custom Scrollbar for better looks */
.custom-scroll::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.custom-scroll::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 4px;
}

.custom-scroll::-webkit-scrollbar-track {
  background: transparent;
}


</style>
