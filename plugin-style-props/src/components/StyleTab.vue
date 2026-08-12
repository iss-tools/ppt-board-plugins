<template>
  <div v-if="selectedElements.length > 0" class="style-panel-overlay" @mousedown.stop @touchstart.stop>
    <div class="panel-content custom-scroll">
      <!-- ============================================== -->
      <!-- GROUP 2: ROUGH SHAPE STYLES                    -->
      <!-- ============================================== -->
      <template v-if="hasRoughShape">
        <div class="group-header">{{ t('tabs.hand_drawn_props') }} (Rough)</div>

        <div class="section">
          <div class="section-title">{{ t('tabs.stroke') }}</div>
          <div class="color-picker">
            <button v-for="color in strokeColors" :key="color" class="color-btn"
              :class="{ active: commonProps.stroke === color }" :style="{ backgroundColor: color }"
              @click="updateRoughProp('stroke', color)"></button>
            <div class="color-divider"></div>
            <button class="color-btn custom-color-btn" :class="{ active: activeColorPicker === 'roughStroke' }" :style="{
              backgroundColor: commonProps.stroke !== 'transparent' ? commonProps.stroke : '#000',
            }" @click="toggleColorPicker('roughStroke', $event)" :title="t('tabs.more_colors')"></button>
          </div>
        </div>

        <div class="section">
          <div class="section-title">{{ t('tabs.fill') }}</div>
          <div class="color-picker">
            <button class="color-btn transparent"
              :class="{ active: !commonProps.fill || commonProps.fill === 'transparent' }"
              @click="updateRoughProp('fill', 'transparent')"></button>
            <button v-for="color in fillColors" :key="color" class="color-btn"
              :class="{ active: commonProps.fill === color }" :style="{ backgroundColor: color }"
              @click="updateRoughProp('fill', color)"></button>
            <div class="color-divider"></div>
            <button class="color-btn custom-color-btn" :class="{ active: activeColorPicker === 'roughFill' }" :style="{
              backgroundColor:
                commonProps.fill !== 'transparent' && commonProps.fill
                  ? commonProps.fill
                  : '#000',
            }" @click="toggleColorPicker('roughFill', $event)" :title="t('tabs.more_colors')"></button>
          </div>
        </div>

        <div class="section">
          <div class="section-title">{{ t('tabs.fill_style') }}</div>
          <div class="icon-group">
            <button class="icon-btn" :class="{ active: commonProps.fillStyle === 'hachure' }"
              @click="updateRoughProp('fillStyle', 'hachure')" title="Hachure">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
                stroke-linecap="round" stroke-linejoin="round">
                <line x1="4" y1="20" x2="20" y2="4"></line>
                <line x1="10" y1="20" x2="20" y2="10"></line>
                <line x1="4" y1="14" x2="14" y2="4"></line>
              </svg>
            </button>
            <button class="icon-btn" :class="{ active: commonProps.fillStyle === 'cross-hatch' }"
              @click="updateRoughProp('fillStyle', 'cross-hatch')" title="Cross-hatch">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
                stroke-linecap="round" stroke-linejoin="round">
                <line x1="4" y1="20" x2="20" y2="4"></line>
                <line x1="10" y1="20" x2="20" y2="10"></line>
                <line x1="4" y1="14" x2="14" y2="4"></line>
                <line x1="4" y1="4" x2="20" y2="20"></line>
                <line x1="10" y1="4" x2="20" y2="14"></line>
                <line x1="4" y1="10" x2="14" y2="20"></line>
              </svg>
            </button>
            <button class="icon-btn" :class="{ active: commonProps.fillStyle === 'solid' }"
              @click="updateRoughProp('fillStyle', 'solid')" title="Solid">
              <div class="solid-fill-icon"></div>
            </button>
            <button class="icon-btn custom-color-btn" :class="{ active: activeColorPicker === 'roughFillImage' }"
              @click="toggleColorPicker('roughFillImage', $event)" :title="t('tabs.image_fill')">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
                stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="9" cy="9" r="2"></circle>
                <path d="M21 15l-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
              </svg>
            </button>
          </div>
        </div>

        <div class="section">
          <div class="section-title">{{ t('tabs.stroke_width') }}</div>
          <div class="icon-group">
            <button class="icon-btn" :class="{ active: commonProps.strokeWidth === 1 }"
              @click="updateRoughProp('strokeWidth', 1)">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                <line x1="4" y1="12" x2="20" y2="12"></line>
              </svg>
            </button>
            <button class="icon-btn" :class="{ active: commonProps.strokeWidth === 2 }"
              @click="updateRoughProp('strokeWidth', 2)">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <line x1="4" y1="12" x2="20" y2="12"></line>
              </svg>
            </button>
            <button class="icon-btn" :class="{ active: commonProps.strokeWidth === 4 }"
              @click="updateRoughProp('strokeWidth', 4)">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4">
                <line x1="4" y1="12" x2="20" y2="12"></line>
              </svg>
            </button>
          </div>
        </div>

        <div class="section">
          <div class="section-title">{{ t('tabs.border_style') }}</div>
          <div class="icon-group">
            <button class="icon-btn" :class="{ active: !commonProps.strokeLineDash }"
              @click="updateRoughProp('strokeLineDash', null)">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <line x1="4" y1="12" x2="20" y2="12"></line>
              </svg>
            </button>
            <button class="icon-btn" :class="{
              active: JSON.stringify(commonProps.strokeLineDash) === JSON.stringify([8, 8]),
            }" @click="updateRoughProp('strokeLineDash', [8, 8])">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
                stroke-dasharray="8 8">
                <line x1="4" y1="12" x2="20" y2="12"></line>
              </svg>
            </button>
            <button class="icon-btn" :class="{
              active: JSON.stringify(commonProps.strokeLineDash) === JSON.stringify([2, 4]),
            }" @click="updateRoughProp('strokeLineDash', [2, 4])">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
                stroke-dasharray="2 4">
                <line x1="4" y1="12" x2="20" y2="12"></line>
              </svg>
            </button>
          </div>
        </div>

        <div class="section">
          <div class="section-title">{{ t('tabs.line_style') }}</div>
          <div class="icon-group">
            <button class="icon-btn" :class="{ active: commonProps.roughness === 0 }"
              @click="updateRoughProp('roughness', 0)" title="Architect">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M4 12 L20 12"></path>
              </svg>
            </button>
            <button class="icon-btn" :class="{ active: commonProps.roughness === 1 }"
              @click="updateRoughProp('roughness', 1)" title="Normal">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M4 12 Q8 10 12 12 T20 12"></path>
              </svg>
            </button>
            <button class="icon-btn" :class="{ active: commonProps.roughness === 2 }"
              @click="updateRoughProp('roughness', 2)" title="Cartoon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M4 12 Q8 8 12 14 T20 10"></path>
              </svg>
            </button>
          </div>
        </div>

        <div class="section">
          <div class="section-title">{{ t('tabs.roughness') }} (Bowing)</div>
          <div class="opacity-slider">
            <input type="range" min="0" max="10" step="1"
              :value="commonProps.bowing !== undefined ? commonProps.bowing : 1" @input="
                e => updateRoughProp('bowing', parseFloat((e.target as HTMLInputElement).value))
              " />
            <span>{{ commonProps.bowing !== undefined ? commonProps.bowing : 1 }}</span>
          </div>
        </div>

        <div class="section">
          <div class="section-title">{{ t('tabs.corner') }}</div>
          <div class="icon-group">
            <button class="icon-btn" :class="{
              active: commonProps.borderRadius === 0 || commonProps.borderRadius === '0px',
            }" @click="updateRoughProp('borderRadius', 0)" title="Sharp">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="4" y="4" width="16" height="16"></rect>
              </svg>
            </button>
            <button class="icon-btn" :class="{
              active:
                commonProps.borderRadius !== 0 &&
                commonProps.borderRadius !== '0px' &&
                commonProps.borderRadius !== undefined,
            }" @click="updateRoughProp('borderRadius', 8)" title="Round">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="4" y="4" width="16" height="16" rx="8"></rect>
              </svg>
            </button>
          </div>
        </div>

        <div class="group-divider"></div>
      </template>

      <!-- ============================================== -->
      <!-- GROUP 3: SVG STYLES                            -->
      <!-- ============================================== -->
      <template v-if="hasSvgElement">
        <div class="group-header">{{ t('tabs.vector_props') }} (SVG)</div>

        <div class="section">
          <div class="section-title">{{ t('tabs.stroke') }}</div>
          <div class="color-picker">
            <button v-for="color in strokeColors" :key="color" class="color-btn"
              :class="{ active: commonProps.svgStroke === color }" :style="{ backgroundColor: color }"
              @click="updateSvgProp('stroke', color)"></button>
            <div class="color-divider"></div>
            <button class="color-btn custom-color-btn" :class="{ active: activeColorPicker === 'svgStroke' }" :style="{
              backgroundColor:
                commonProps.svgStroke !== 'transparent' ? commonProps.svgStroke : '#000',
            }" @click="toggleColorPicker('svgStroke', $event)" :title="t('tabs.more_colors')"></button>
          </div>
        </div>

        <div class="section">
          <div class="section-title">{{ t('tabs.fill') }}</div>
          <div class="color-picker">
            <button class="color-btn transparent"
              :class="{ active: !commonProps.svgFill || commonProps.svgFill === 'transparent' }"
              @click="updateSvgProp('fill', 'transparent')"></button>
            <button v-for="color in fillColors" :key="color" class="color-btn"
              :class="{ active: commonProps.svgFill === color }" :style="{ backgroundColor: color }"
              @click="updateSvgProp('fill', color)"></button>
            <div class="color-divider"></div>
            <button class="color-btn custom-color-btn" :class="{ active: activeColorPicker === 'svgFill' }" :style="{
              backgroundColor:
                commonProps.svgFill !== 'transparent' && commonProps.svgFill
                  ? commonProps.svgFill
                  : '#000',
            }" @click="toggleColorPicker('svgFill', $event)" :title="t('tabs.more_colors')"></button>
          </div>
        </div>

        <div class="section">
          <div class="section-title">{{ t('tabs.stroke_width') }}</div>
          <div class="icon-group">
            <button class="icon-btn" :class="{ active: commonProps.svgStrokeWidth === 1 }"
              @click="updateSvgProp('strokeWidth', 1)">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                <line x1="4" y1="12" x2="20" y2="12"></line>
              </svg>
            </button>
            <button class="icon-btn" :class="{ active: commonProps.svgStrokeWidth === 2 }"
              @click="updateSvgProp('strokeWidth', 2)">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <line x1="4" y1="12" x2="20" y2="12"></line>
              </svg>
            </button>
            <button class="icon-btn" :class="{ active: commonProps.svgStrokeWidth === 4 }"
              @click="updateSvgProp('strokeWidth', 4)">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4">
                <line x1="4" y1="12" x2="20" y2="12"></line>
              </svg>
            </button>
          </div>
        </div>

        <div class="group-divider"></div>
      </template>

      <!-- ============================================== -->
      <!-- GROUP 1: NATIVE HTML STYLES (ALWAYS SHOWN)     -->
      <!-- ============================================== -->
      <div class="group-header">{{ t('tabs.native_style') }} (Native)</div>

      <!-- 背景颜色 Background Color -->
      <div class="section">
        <div class="section-title">{{ t('tabs.background') }}</div>
        <div class="color-picker">
          <button class="color-btn transparent" :class="{
            active: !commonProps.backgroundColor || commonProps.backgroundColor === 'transparent',
          }" @click="updateNativeProp('backgroundColor', 'transparent')"></button>
          <button v-for="color in fillColors" :key="color" class="color-btn"
            :class="{ active: commonProps.backgroundColor === color }" :style="{ backgroundColor: color }"
            @click="updateNativeProp('backgroundColor', color)"></button>

          <div class="color-divider"></div>

          <button class="color-btn custom-color-btn" :class="{ active: activeColorPicker === 'backgroundColor' }"
            :style="{
              backgroundColor:
                commonProps.backgroundColor !== 'transparent' && commonProps.backgroundColor
                  ? commonProps.backgroundColor
                  : '#000',
            }" @click="toggleColorPicker('backgroundColor', $event)" :title="t('tabs.more_colors')"></button>
          
          <button class="color-btn custom-color-btn image-picker-btn"
            :class="{ active: activeColorPicker === 'backgroundImage' }"
            @click="toggleColorPicker('backgroundImage', $event)" :title="t('tabs.preset_image')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
          </button>
          
          <button class="color-btn custom-color-btn image-picker-btn"
            :class="{ active: activeColorPicker === 'backgroundGradient' }"
            @click="toggleColorPicker('backgroundGradient', $event)" :title="t('tabs.gradient') || '渐变预设'">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 2a10 10 0 0 1 0 20v-20z"></path>
            </svg>
          </button>
        </div>
      </div>

      <!-- 文本颜色 Color -->
      <div class="section">
        <div class="section-title">{{ t('tabs.text_color') }}</div>
        <div class="color-picker">
          <button v-for="color in strokeColors" :key="color" class="color-btn"
            :class="{ active: commonProps.color === color }" :style="{ backgroundColor: color }"
            @click="updateNativeProp('color', color)"></button>
          <div class="color-divider"></div>
          <button class="color-btn custom-color-btn" :class="{ active: activeColorPicker === 'color' }" :style="{
            backgroundColor: commonProps.color !== 'transparent' ? commonProps.color : '#000',
          }" @click="toggleColorPicker('color', $event)" :title="t('tabs.more_colors')"></button>
        </div>
      </div>

      <!-- 字体设置 -->
      <div class="section">
        <div class="section-title">{{ t('tabs.font') }}</div>
        <div class="icon-group">
          <!-- 默认字体 -->
          <button class="icon-btn text-btn font-btn" :class="{
            active: commonProps.fontFamily === 'Noto Sans SC' || !commonProps.fontFamily,
          }" @click="updateNativeProp('fontFamily', 'Noto Sans SC')" :title="t('tabs.default_font')"
            style="font-family: 'Noto Sans SC'">
            Ag
          </button>
          <!-- 艺术字体 -->
          <button class="icon-btn text-btn font-btn" :class="{ active: commonProps.fontFamily === 'ZCOOL KuaiLe' }"
            @click="updateNativeProp('fontFamily', 'ZCOOL KuaiLe')" :title="t('tabs.art_font')" style="font-family: 'ZCOOL KuaiLe'">{{ t('tabs.art') }}</button>
          <!-- 手写字体 -->
          <button class="icon-btn text-btn font-btn" :class="{ active: commonProps.fontFamily === 'Zhi Mang Xing' }"
            @click="updateNativeProp('fontFamily', 'Zhi Mang Xing')" :title="t('tabs.handwriting')" style="font-family: 'Zhi Mang Xing'">{{ t('tabs.hand') }}</button>
          <!-- 更多字体选择 -->
          <button class="icon-btn font-btn" :class="{ active: activeColorPicker === 'fontFamily' }"
            @click="toggleColorPicker('fontFamily', $event)" :title="t('tabs.more_fonts')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 7V4h16v3M9 20h6M12 4v16" />
            </svg>
          </button>
        </div>
      </div>

      <!-- 文字特效 -->
      <div class="section">
        <div class="section-title">{{ t('tabs.text_effect') }}</div>
        <div class="icon-group">
          <!-- 变形 -->
          <button class="icon-btn" :class="{ active: activeColorPicker === 'effect-transform' }" @click="toggleColorPicker('effect-transform', $event)" :title="t('tabs.transform')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20V4"/><path d="M8 8l4-4 4 4"/><path d="M8 16l4 4 4-4"/></svg>
          </button>
          <!-- 描边 -->
          <button class="icon-btn" :class="{ active: activeColorPicker === 'effect-stroke' }" @click="toggleColorPicker('effect-stroke', $event)" :title="t('tabs.stroke')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="12" cy="12" r="4"></circle></svg>
          </button>
          <!-- 投影 -->
          <button class="icon-btn" :class="{ active: activeColorPicker === 'effect-shadow' }" @click="toggleColorPicker('effect-shadow', $event)" :title="t('tabs.drop_shadow')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="14" height="14" rx="2" ry="2"></rect><path d="M21 7v12a2 2 0 0 1-2 2H7"></path></svg>
          </button>
          <!-- 纹理 -->
          <button class="icon-btn" :class="{ active: activeColorPicker === 'effect-texture' }" @click="toggleColorPicker('effect-texture', $event)" :title="t('tabs.texture')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="3" y1="15" x2="21" y2="15"></line><line x1="9" y1="3" x2="9" y2="21"></line><line x1="15" y1="3" x2="15" y2="21"></line></svg>
          </button>
          <!-- 渐变 -->
          <button class="icon-btn" :class="{ active: activeColorPicker === 'effect-gradient' }" @click="toggleColorPicker('effect-gradient', $event)" :title="t('tabs.gradient')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a10 10 0 0 1 0 20v-20z"></path></svg>
          </button>
          <!-- 发光 -->
          <button class="icon-btn" :class="{ active: activeColorPicker === 'effect-glow' }" @click="toggleColorPicker('effect-glow', $event)" :title="t('tabs.glow')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></svg>
          </button>
          <!-- 3D -->
          <button class="icon-btn" :class="{ active: activeColorPicker === 'effect-3d' }" @click="toggleColorPicker('effect-3d', $event)" title="3D">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
          </button>
        </div>
      </div>

      <!-- 阴影特效 -->
      <div class="section">
        <div class="section-title">{{ t('tabs.shadow_effect') }}</div>
        <div class="icon-group">
          <!-- Box-Shadow -->
          <button class="icon-btn" :class="{ active: activeColorPicker === 'boxeffect-shadow' }" @click="toggleColorPicker('boxeffect-shadow', $event)" :title="t('tabs.box_shadow')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="14" height="14" rx="2" ry="2"></rect>
              <path d="M21 7v12a2 2 0 0 1-2 2H7"></path>
            </svg>
          </button>
          <!-- Border -->
          <button class="icon-btn" :class="{ active: activeColorPicker === 'boxeffect-border' }" @click="toggleColorPicker('boxeffect-border', $event)" :title="t('tabs.border_effect')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke-dasharray="4 4"></rect>
            </svg>
          </button>
        </div>
      </div>

      <!-- 字体大小 -->
      <div class="section">
        <div class="section-title">{{ t('tabs.font_size') }}</div>
        <div class="icon-group">
          <button class="icon-btn text-btn" :class="{ active: commonProps.fontSize === 16 }"
            @click="updateNativeProp('fontSize', 16)">
            S
          </button>
          <button class="icon-btn text-btn" :class="{ active: commonProps.fontSize === 24 }"
            @click="updateNativeProp('fontSize', 24)">
            M
          </button>
          <button class="icon-btn text-btn" :class="{ active: commonProps.fontSize === 36 }"
            @click="updateNativeProp('fontSize', 36)">
            L
          </button>
          <button class="icon-btn text-btn" :class="{ active: commonProps.fontSize === 48 }"
            @click="updateNativeProp('fontSize', 48)">
            XL
          </button>
        </div>
      </div>

      <!-- 文本格式 -->
      <div class="section">
        <div class="section-title">{{ t('tabs.text_format') }}</div>
        <div class="icon-group">
          <button class="icon-btn" :class="{ active: commonProps.fontWeight === 'bold' }" @click="
            updateNativeProp('fontWeight', commonProps.fontWeight === 'bold' ? 'normal' : 'bold')
            ">
            <b style="font-family: serif">B</b>
          </button>
          <button class="icon-btn" :class="{ active: commonProps.fontStyle === 'italic' }" @click="
            updateNativeProp(
              'fontStyle',
              commonProps.fontStyle === 'italic' ? 'normal' : 'italic'
            )
            ">
            <i style="font-family: serif">I</i>
          </button>
          <button class="icon-btn" :class="{ active: commonProps.textDecoration === 'underline' }" @click="
            updateNativeProp(
              'textDecoration',
              commonProps.textDecoration === 'underline' ? 'none' : 'underline'
            )
            ">
            <u style="font-family: serif">U</u>
          </button>
          <button class="icon-btn" :class="{ active: commonProps.textDecoration === 'line-through' }" @click="
            updateNativeProp(
              'textDecoration',
              commonProps.textDecoration === 'line-through' ? 'none' : 'line-through'
            )
            ">
            <span style="text-decoration: line-through; font-family: serif">S</span>
          </button>
        </div>
      </div>

      <!-- 文本对齐 -->
      <div class="section">
        <div class="section-title">{{ t('tabs.text_align') }}</div>
        <div class="icon-group">
          <button class="icon-btn" :class="{ active: commonProps.textAlign === 'left' }"
            @click="updateNativeProp('textAlign', 'left')" :title="t('tabs.align_left')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
              stroke-linecap="round">
              <line x1="4" y1="6" x2="20" y2="6"></line>
              <line x1="4" y1="12" x2="14" y2="12"></line>
              <line x1="4" y1="18" x2="20" y2="18"></line>
            </svg>
          </button>
          <button class="icon-btn" :class="{ active: commonProps.textAlign === 'center' }"
            @click="updateNativeProp('textAlign', 'center')" :title="t('tabs.align_center')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
              stroke-linecap="round">
              <line x1="4" y1="6" x2="20" y2="6"></line>
              <line x1="8" y1="12" x2="16" y2="12"></line>
              <line x1="4" y1="18" x2="20" y2="18"></line>
            </svg>
          </button>
          <button class="icon-btn" :class="{ active: commonProps.textAlign === 'right' }"
            @click="updateNativeProp('textAlign', 'right')" :title="t('tabs.align_right')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
              stroke-linecap="round">
              <line x1="4" y1="6" x2="20" y2="6"></line>
              <line x1="10" y1="12" x2="20" y2="12"></line>
              <line x1="4" y1="18" x2="20" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>

      <!-- 垂直对齐 -->
      <div class="section">
        <div class="section-title">{{ t('tabs.vertical_align') }}</div>
        <div class="icon-group">
          <button class="icon-btn" :class="{ active: commonProps.verticalAlign === 'top' }"
            @click="updateNativeProp('verticalAlign', 'top')" :title="t('tabs.align_top')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
              stroke-linecap="round">
              <line x1="4" y1="4" x2="20" y2="4"></line>
              <line x1="8" y1="10" x2="16" y2="10"></line>
              <line x1="8" y1="16" x2="16" y2="16"></line>
            </svg>
          </button>
          <button class="icon-btn" :class="{ active: commonProps.verticalAlign === 'middle' }"
            @click="updateNativeProp('verticalAlign', 'middle')" :title="t('tabs.vertical_center')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
              stroke-linecap="round">
              <line x1="8" y1="8" x2="16" y2="8"></line>
              <line x1="4" y1="12" x2="20" y2="12"></line>
              <line x1="8" y1="16" x2="16" y2="16"></line>
            </svg>
          </button>
          <button class="icon-btn" :class="{ active: commonProps.verticalAlign === 'bottom' }"
            @click="updateNativeProp('verticalAlign', 'bottom')" :title="t('tabs.align_bottom')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
              stroke-linecap="round">
              <line x1="8" y1="8" x2="16" y2="8"></line>
              <line x1="8" y1="14" x2="16" y2="14"></line>
              <line x1="4" y1="20" x2="20" y2="20"></line>
            </svg>
          </button>
        </div>
      </div>

      <!-- 边角 Border Radius -->
      <div class="section">
        <div class="section-title">{{ t('tabs.corner') }}</div>
        <div class="icon-group">
          <button class="icon-btn" :class="{
            active:
              commonProps.nativeBorderRadius === 0 || commonProps.nativeBorderRadius === '0px',
          }" @click="updateNativeProp('borderRadius', '0px')" title="Sharp">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="4" y="4" width="16" height="16"></rect>
            </svg>
          </button>
          <button class="icon-btn" :class="{
            active:
              commonProps.nativeBorderRadius !== 0 &&
              commonProps.nativeBorderRadius !== '0px' &&
              commonProps.nativeBorderRadius !== undefined,
          }" @click="updateNativeProp('borderRadius', '16px')" title="Round">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="4" y="4" width="16" height="16" rx="8"></rect>
            </svg>
          </button>
        </div>
      </div>

      <!-- 透明度 -->
      <div class="section">
        <div class="section-title">{{ t('tabs.opacity') }}</div>
        <div class="opacity-slider">
          <input type="range" min="0" max="1" step="0.05"
            :value="commonProps.opacity !== undefined ? commonProps.opacity : 1" @input="
              e => updateNativeProp('opacity', parseFloat((e.target as HTMLInputElement).value))
            " />
          <span>{{
            Math.round((commonProps.opacity !== undefined ? commonProps.opacity : 1) * 100)
            }}</span>
        </div>
      </div>

      <!-- ============================================== -->
      <!-- GLOBAL OPERATIONS & LAYERS                     -->
      <!-- ============================================== -->
      <div class="group-divider"></div>

      <!-- 多元素对齐 (Alignment - visible for multiple elements) -->
      <template v-if="selectedElements.length > 1">
        <div class="group-header">{{ t('tabs.multi_element_align') }}</div>
        <div class="section">
          <div class="icon-group">
            <button class="icon-btn" @click="alignElements('left')" :title="t('tabs.align_left')">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <line x1="4" y1="2" x2="4" y2="22"></line>
                <rect x="8" y="6" width="12" height="4"></rect>
                <rect x="8" y="14" width="8" height="4"></rect>
              </svg>
            </button>
            <button class="icon-btn" @click="alignElements('center')" :title="t('tabs.align_horizontal_center')">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <line x1="12" y1="2" x2="12" y2="22"></line>
                <rect x="6" y="6" width="12" height="4"></rect>
                <rect x="8" y="14" width="8" height="4"></rect>
              </svg>
            </button>
            <button class="icon-btn" @click="alignElements('right')" :title="t('tabs.align_right')">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <line x1="20" y1="2" x2="20" y2="22"></line>
                <rect x="4" y="6" width="12" height="4"></rect>
                <rect x="8" y="14" width="8" height="4"></rect>
              </svg>
            </button>
            <button class="icon-btn" @click="alignElements('top')" :title="t('tabs.align_top')">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <line x1="2" y1="4" x2="22" y2="4"></line>
                <rect x="6" y="8" width="4" height="12"></rect>
                <rect x="14" y="8" width="4" height="8"></rect>
              </svg>
            </button>
            <button class="icon-btn" @click="alignElements('middle')" :title="t('tabs.align_vertical_center')">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <rect x="6" y="6" width="4" height="12"></rect>
                <rect x="14" y="8" width="4" height="8"></rect>
              </svg>
            </button>
            <button class="icon-btn" @click="alignElements('bottom')" :title="t('tabs.align_bottom')">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <line x1="2" y1="20" x2="22" y2="20"></line>
                <rect x="6" y="4" width="4" height="12"></rect>
                <rect x="14" y="8" width="4" height="8"></rect>
              </svg>
            </button>
          </div>
        </div>
      </template>

      <!-- 画布对齐 (Canvas Alignment - always visible when elements selected) -->
      <div class="group-header">{{ t('tabs.align_to_canvas') }}</div>
      <div class="section">
        <div class="section-title">{{ t('tabs.align_selected_to_canvas') }}</div>
        <div class="icon-group">
          <button class="icon-btn canvas-align-btn" @click="alignToCanvas('hcenter')" :title="t('tabs.canvas_horizontal_center')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
              stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke-dasharray="2 2"></rect>
              <line x1="12" y1="8" x2="12" y2="4" stroke="#6366f1" stroke-width="2"></line>
              <line x1="12" y1="20" x2="12" y2="16" stroke="#6366f1" stroke-width="2"></line>
              <rect x="9" y="10" width="6" height="4" rx="1" fill="#6366f1" stroke="none" opacity="0.8"></rect>
            </svg>
          </button>
          <button class="icon-btn canvas-align-btn" @click="alignToCanvas('vcenter')" :title="t('tabs.canvas_vertical_center')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
              stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke-dasharray="2 2"></rect>
              <line x1="4" y1="12" x2="8" y2="12" stroke="#6366f1" stroke-width="2"></line>
              <line x1="16" y1="12" x2="20" y2="12" stroke="#6366f1" stroke-width="2"></line>
              <rect x="10" y="9" width="4" height="6" rx="1" fill="#6366f1" stroke="none" opacity="0.8"></rect>
            </svg>
          </button>
          <button class="icon-btn canvas-align-btn" @click="alignToCanvas('center')" :title="t('tabs.canvas_center')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
              stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke-dasharray="2 2"></rect>
              <circle cx="12" cy="12" r="2.5" fill="#6366f1" stroke="none" opacity="0.8"></circle>
              <line x1="12" y1="5" x2="12" y2="8" stroke="#6366f1" stroke-width="2"></line>
              <line x1="12" y1="16" x2="12" y2="19" stroke="#6366f1" stroke-width="2"></line>
              <line x1="5" y1="12" x2="8" y2="12" stroke="#6366f1" stroke-width="2"></line>
              <line x1="16" y1="12" x2="19" y2="12" stroke="#6366f1" stroke-width="2"></line>
            </svg>
          </button>
          <button class="icon-btn canvas-align-btn" @click="alignToCanvas('left')" :title="t('tabs.canvas_align_left')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
              stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke-dasharray="2 2"></rect>
              <line x1="4" y1="5" x2="4" y2="19" stroke="#6366f1" stroke-width="2"></line>
              <rect x="4" y="10" width="6" height="4" rx="1" fill="#6366f1" stroke="none" opacity="0.8"></rect>
            </svg>
          </button>
          <button class="icon-btn canvas-align-btn" @click="alignToCanvas('right')" :title="t('tabs.canvas_align_right')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
              stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke-dasharray="2 2"></rect>
              <line x1="20" y1="5" x2="20" y2="19" stroke="#6366f1" stroke-width="2"></line>
              <rect x="14" y="10" width="6" height="4" rx="1" fill="#6366f1" stroke="none" opacity="0.8"></rect>
            </svg>
          </button>
          <button class="icon-btn canvas-align-btn" @click="alignToCanvas('top')" :title="t('tabs.canvas_align_top')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
              stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke-dasharray="2 2"></rect>
              <line x1="5" y1="4" x2="19" y2="4" stroke="#6366f1" stroke-width="2"></line>
              <rect x="10" y="4" width="4" height="6" rx="1" fill="#6366f1" stroke="none" opacity="0.8"></rect>
            </svg>
          </button>
          <button class="icon-btn canvas-align-btn" @click="alignToCanvas('bottom')" :title="t('tabs.canvas_align_bottom')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
              stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke-dasharray="2 2"></rect>
              <line x1="5" y1="20" x2="19" y2="20" stroke="#6366f1" stroke-width="2"></line>
              <rect x="10" y="14" width="4" height="6" rx="1" fill="#6366f1" stroke="none" opacity="0.8"></rect>
            </svg>
          </button>
          <button class="icon-btn canvas-align-btn" @click="alignToCanvas('fill')" :title="t('tabs.canvas_fill') || '铺满画布'">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"></rect>
              <rect x="3" y="3" width="18" height="18" rx="2" fill="#6366f1" opacity="0.4"></rect>
              <polyline points="15 3 21 3 21 9"></polyline>
              <polyline points="9 21 3 21 3 15"></polyline>
            </svg>
          </button>
        </div>
      </div>

      <div class="group-divider"></div>
      <div class="group-header">{{ t('tabs.operations') }}</div>
      <div class="section">
        <div class="icon-group">
          <button class="icon-btn" @click="duplicateSelected()" :title="t('tabs.duplicate')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>
          <button class="icon-btn" @click="deleteSelected()" :title="t('tabs.delete')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
          <template v-if="selectedElements.length > 1">
            <button class="icon-btn" @click="groupSelected()" :title="t('tabs.group')">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="4" y="4" width="6" height="6"></rect>
                <rect x="14" y="4" width="6" height="6"></rect>
                <rect x="4" y="14" width="6" height="6"></rect>
                <rect x="14" y="14" width="6" height="6"></rect>
              </svg>
            </button>
            <button class="icon-btn" @click="unGroupSelected()" :title="t('tabs.ungroup')">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M4 14v6h6M14 20h6v-6M20 10V4h-6M10 4H4v6"></path>
              </svg>
            </button>
          </template>
        </div>
      </div>

      <!-- 图层 (Layer) -->
      <div class="group-header">{{ t('tabs.layer') }}</div>
      <div class="section">
        <div class="icon-group">
          <button class="icon-btn" @click="reorderLayer('front')" :title="t('tabs.bring_to_front')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <line x1="12" y1="19" x2="12" y2="5"></line>
              <polyline points="5 12 12 5 19 12"></polyline>
              <line x1="5" y1="2" x2="19" y2="2"></line>
            </svg>
          </button>
          <button class="icon-btn" @click="reorderLayer('forward')" :title="t('tabs.bring_forward')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <line x1="12" y1="19" x2="12" y2="5"></line>
              <polyline points="5 12 12 5 19 12"></polyline>
            </svg>
          </button>
          <button class="icon-btn" @click="reorderLayer('backward')" :title="t('tabs.send_backward')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <polyline points="19 12 12 19 5 12"></polyline>
            </svg>
          </button>
          <button class="icon-btn" @click="reorderLayer('back')" :title="t('tabs.send_to_back')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <polyline points="19 12 12 19 5 12"></polyline>
              <line x1="5" y1="22" x2="19" y2="22"></line>
            </svg>
          </button>
        </div>
      </div>


    </div>
  </div>
  <n-popover :show="!!activeColorPicker" :x="colorPickerPos.left" :y="colorPickerPos.top" trigger="manual" :show-arrow="false" placement="left-start" style="padding: 0;">
    <ImagePickerPanel v-if="activeColorPicker === 'backgroundImage'" :model-value="commonProps.backgroundImage"
      @update:model-value="(val: string) => updateNativeProp('backgroundImage', val)" @close="closeColorPicker" />
    <ImagePickerPanel v-else-if="activeColorPicker === 'roughFillImage'" :model-value="commonProps.fillImage ? `url(${commonProps.fillImage})` : ''"
      @update:model-value="updateRoughImageFill" @close="closeColorPicker" />
    <FontPickerPanel v-else-if="activeColorPicker === 'fontFamily'" :model-value="commonProps.fontFamily"
      @update:model-value="(val: string) => updateNativeProp('fontFamily', val)" @close="closeColorPicker" />
    <TextEffectPickerPanel v-else-if="activeColorPicker?.startsWith('effect-')" :type="activeColorPicker.split('-')[1]" @select="applyTextEffect" />
    <BoxEffectPickerPanel v-else-if="activeColorPicker?.startsWith('boxeffect-')" :type="activeColorPicker.split('-')[1] as 'border' | 'shadow'" @select="applyBoxEffect" />
    <GradientPickerPanel v-else-if="activeColorPicker === 'backgroundGradient'" @select="applyBackgroundGradient" />
    <ColorPickerPanel v-else-if="activeColorPicker" :model-value="currentColorValue"
      @update:model-value="updateCurrentColor" @close="closeColorPicker" />
  </n-popover>
</template>

<script setup lang="ts">
import { useI18n } from '../composables/useI18n';
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useCanvasContext, CanvasEventNames } from '@iss-ai/ppt-board';
import { NPopover } from 'naive-ui';
import { fonts as fontsList } from '../assets/font';
import ImagePickerPanel from './ImagePickerPanel.vue';
import FontPickerPanel from './FontPickerPanel.vue';
import ColorPickerPanel from './ColorPickerPanel.vue';
import TextEffectPickerPanel from './TextEffectPickerPanel.vue';
import BoxEffectPickerPanel from './BoxEffectPickerPanel.vue';
import GradientPickerPanel from './GradientPickerPanel.vue';

const ctx = useCanvasContext();
const { t } = useI18n();
const pluginApi = ctx.api;
const canvasState = ctx.state;

const selectedElements = ref<any[]>([]);
const isFontMenuOpen = ref(false);
const activeColorPicker = ref<string | null>(null);

const strokeColors = ['#000000', '#e03131', '#2f9e44', '#1971c2', '#f08c00'];
const fillColors = ['#ffc9c9', '#b2f2bb', '#a5d8ff', '#ffec99', '#eebefa'];

const commonProps = ref<Record<string, any>>({});
const isAdvancedOpen = ref(false);
const advPropsText = ref('');
const advStyleText = ref('');
const advSlotsText = ref('');

const syncAdvancedData = (firstElement: any) => {
  if (!firstElement) {
    advPropsText.value = '';
    advStyleText.value = '';
    advSlotsText.value = '';
    return;
  }

  const elProps = firstElement.props || {};
  const customProps = { ...elProps };
  delete customProps.style;
  delete customProps.slots;

  advPropsText.value =
    Object.keys(customProps).length > 0 ? JSON.stringify(customProps, null, 2) : '';

  if (typeof elProps.style === 'string') {
    advStyleText.value = elProps.style;
  } else if (typeof elProps.style === 'object') {
    advStyleText.value = JSON.stringify(elProps.style, null, 2);
  } else {
    advStyleText.value = '';
  }

  if (elProps.slots) {
    advSlotsText.value =
      typeof elProps.slots === 'string' ? elProps.slots : JSON.stringify(elProps.slots, null, 2);
  } else {
    advSlotsText.value = '';
  }
};

const updateAdvProps = () => {
  if (!pluginApi || !pluginApi.elements || !pluginApi.elements.update) return;
  let parsedProps: any = {};
  try {
    if (advPropsText.value.trim()) parsedProps = JSON.parse(advPropsText.value);
  } catch (e) {
    return;
  }
  selectedElements.value.forEach(el => {
    const newProps = { ...(el.props || {}) };
    Object.keys(newProps).forEach(k => {
      if (k !== 'style' && k !== 'slots') delete newProps[k];
    });
    Object.assign(newProps, parsedProps);
    pluginApi.elements.update(el.id, { props: newProps });
  });
};

const updateAdvStyle = () => {
  if (!pluginApi || !pluginApi.elements || !pluginApi.elements.update) return;
  selectedElements.value.forEach(el => {
    const newProps = { ...(el.props || {}) };
    if (advStyleText.value.trim()) {
      try {
        newProps.style = JSON.parse(advStyleText.value);
      } catch (e) {
        newProps.style = advStyleText.value;
      }
    } else {
      delete newProps.style;
    }
    pluginApi.elements.update(el.id, { props: newProps });
  });
};

const updateAdvSlots = () => {
  if (!pluginApi || !pluginApi.elements || !pluginApi.elements.update) return;
  selectedElements.value.forEach(el => {
    const newProps = { ...(el.props || {}) };
    if (advSlotsText.value.trim()) {
      try {
        newProps.slots = JSON.parse(advSlotsText.value);
      } catch (e) {
        newProps.slots = advSlotsText.value;
      }
    } else {
      delete newProps.slots;
    }
    pluginApi.elements.update(el.id, { props: newProps });
  });
};

const updateSelectedElements = () => {
  if (ctx.state && ctx.state.runtime && ctx.state.runtime.activeElements && ctx.state.runtime.selectedIds) {
    selectedElements.value = ctx.state.runtime.activeElements.filter((e: any) =>
      ctx.state.runtime.selectedIds.has(e.id)
    );
    computeCommonProps();
    syncAdvancedData(selectedElements.value[0]);
  } else if (canvasState && canvasState.runtime && canvasState.runtime.activeElements && canvasState.runtime.selectedIds) {
    selectedElements.value = canvasState.runtime.activeElements.filter((e: any) =>
      canvasState.runtime.selectedIds.has(e.id)
    );
    computeCommonProps();
    syncAdvancedData(selectedElements.value[0]);
  } else {
    selectedElements.value = [];
    computeCommonProps();
  }
};

watch(
  () => canvasState?.runtime?.selectedIds,
  () => {
    updateSelectedElements();
  },
  { deep: true }
);

const applyBoxEffect = (styles: Record<string, string>) => { applyTextEffect(styles); };
const applyBackgroundGradient = (styles: Record<string, string>) => { applyTextEffect(styles); };

const applyTextEffect = (styles: Record<string, string>) => {
  if (!pluginApi || !pluginApi.elements || !pluginApi.elements.update) return;

  selectedElements.value.forEach(el => {
    let newProps: Record<string, any> = { ...el.props };
    let newStyle = getStyleObj(el.props);
    
    // Merge all styles from the preset
    Object.keys(styles).forEach(k => {
      const cssKey = k.replace(/([A-Z])/g, '-$1').toLowerCase();
      if (styles[k] === '') {
        delete newStyle[cssKey];
      } else {
        newStyle[cssKey] = styles[k];
      }
    });

    if (typeof el.props?.style === 'string') {
      newProps.style = Object.entries(newStyle)
        .map(([k, v]) => `${k}: ${v}`)
        .join('; ');
    } else {
      newProps.style = newStyle;
    }
    
    pluginApi.elements.update(el.id, { props: newProps });
  });
};

const getStyleObj = (elProps: any) => {
  const props = elProps || {};
  let styleObj: Record<string, any> = {};
  if (props.style && typeof props.style === 'object') {
    styleObj = { ...props.style };
  } else if (typeof props.style === 'string') {
    props.style.split(';').forEach((rule: string) => {
      const parts = rule.split(':');
      if (parts.length >= 2) {
        styleObj[parts[0].trim()] = parts.slice(1).join(':').trim();
      }
    });
  }
  return styleObj;
};

const computeCommonProps = () => {
  if (selectedElements.value.length === 0) {
    commonProps.value = {};
    return;
  }

  const first = selectedElements.value[0];
  let merged: Record<string, any> = { ...first.props };
  const firstStyle = getStyleObj(first.props);

  // Native HTML properties
  merged.backgroundColor =
    firstStyle.backgroundColor || first.props.backgroundColor || firstStyle.background || '';
  merged.backgroundImage = firstStyle.backgroundImage || first.props.backgroundImage || '';
  merged.color = firstStyle.color || first.props.color || '#000000';
  merged.opacity = firstStyle.opacity !== undefined ? parseFloat(firstStyle.opacity) : 1;
  merged.fontFamily = firstStyle.fontFamily || first.props.fontFamily || 'Arial';
  merged.fontSize = firstStyle.fontSize
    ? parseInt(String(firstStyle.fontSize))
    : first.props.fontSize || 16;
  merged.textAlign = firstStyle.textAlign || first.props.textAlign || 'left';
  merged.verticalAlign =
    firstStyle.verticalAlign || firstStyle['vertical-align'] || first.props.verticalAlign || 'top';
  merged.fontWeight = firstStyle.fontWeight || first.props.fontWeight || 'normal';
  merged.fontStyle = firstStyle.fontStyle || first.props.fontStyle || 'normal';
  merged.textDecoration = firstStyle.textDecoration || first.props.textDecoration || 'none';
  merged.borderRadius = first.props.borderRadius || 0;
  merged.nativeBorderRadius = firstStyle.borderRadius || '0px';

  // Svg Specific properties
  merged.svgStroke = first.props.stroke || '#000000';
  merged.svgFill = first.props.fill || 'transparent';
  merged.svgStrokeWidth = first.props.strokeWidth || 1;
  
  // Rough Specific Properties
  merged.fill = first.props.fill || 'transparent';
  merged.fillImage = first.props.fillImage || '';
  merged.fillStyle = first.props.fillStyle || 'solid';

  commonProps.value = merged;
};

const hasRoughShape = computed(() => {
  return selectedElements.value.some(el =>
    [
      'RoughElement',
      'RoughShape',
      'rect',
      'circle',
      'ellipse',
      'line',
      'arrow',
      'diamond',
      'polygon',
      'path',
    ].includes(el.type)
  );
});

const hasSvgElement = computed(() => {
  return selectedElements.value.some(el => ['svg', 'SvgElement'].includes(el.type));
});

// Update Native HTML props (goes to style, and duplicated to props if standard)
const updateNativeProp = (key: string, value: any) => {
  if (!pluginApi || !pluginApi.elements || !pluginApi.elements.update) return;
  commonProps.value[key] = value;

  selectedElements.value.forEach(el => {
    let newProps: Record<string, any> = { ...el.props };
    let newStyle = getStyleObj(el.props);
    const cssKey = key.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

    if (newStyle[key] !== undefined && key !== cssKey) {
      delete newStyle[key];
    }

    if (key === 'fontSize') {
      newStyle[cssKey] = `${value}px`;
    } else if (key === 'verticalAlign') {
      newStyle['display'] = 'flex';
      if (value === 'top') newStyle['align-items'] = 'flex-start';
      else if (value === 'middle') newStyle['align-items'] = 'center';
      else if (value === 'bottom') newStyle['align-items'] = 'flex-end';

      // Since it's now flex, ensure horizontal alignment is maintained via justify-content
      if (newStyle['text-align'] === 'left') newStyle['justify-content'] = 'flex-start';
      else if (newStyle['text-align'] === 'center') newStyle['justify-content'] = 'center';
      else if (newStyle['text-align'] === 'right') newStyle['justify-content'] = 'flex-end';
      else newStyle['justify-content'] = 'center'; // Default center if not specified
    } else if (key === 'textAlign') {
      newStyle['display'] = 'flex';
      newStyle['text-align'] = value;
      if (value === 'left') newStyle['justify-content'] = 'flex-start';
      else if (value === 'center') newStyle['justify-content'] = 'center';
      else if (value === 'right') newStyle['justify-content'] = 'flex-end';

      // Ensure vertical alignment is maintained
      if (!newStyle['align-items']) newStyle['align-items'] = 'center'; // Default middle
    } else {
      newStyle[cssKey] = value;
    }

    // Mirror to props for TextElement compatibility
    if (
      [
        'color',
        'backgroundColor',
        'fontSize',
        'fontFamily',
        'textAlign',
        'verticalAlign',
        'fontWeight',
        'fontStyle',
        'textDecoration',
        'borderRadius',
      ].includes(key)
    ) {
      newProps[key] = value;
    }

    // Serialize style
    const finalStyle = Object.keys(newStyle).length > 0 ? newStyle : undefined;
    if (finalStyle) {
      newProps.style = Object.entries(finalStyle)
        .map(([k, v]) => `${k}: ${v}`)
        .join('; ');
    }

    pluginApi.elements.update(el.id, { props: newProps });
  });
};

const fillImageInput = ref<HTMLInputElement | null>(null);

const triggerFillImageUpload = () => {
  if (fillImageInput.value) {
    fillImageInput.value.click();
  }
};

const handleFillImageUpload = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    const file = target.files[0];
    const reader = new FileReader();
    reader.onload = event => {
      if (event.target && event.target.result) {
        updateRoughProp('fillImage', event.target.result as string);
        updateRoughProp('fillStyle', 'image');
      }
    };
    reader.readAsDataURL(file);
    target.value = ''; // Reset input
  }
};

// Update Rough specific props (goes only to props)
const updateRoughProp = (key: string, value: any) => {
  if (!pluginApi || !pluginApi.elements || !pluginApi.elements.update) return;
  commonProps.value[key] = value;

  selectedElements.value.forEach(el => {
    // Only apply rough props to rough shapes
    if (
      [
        'RoughElement',
        'RoughShape',
        'rect',
        'circle',
        'ellipse',
        'line',
        'arrow',
        'diamond',
        'polygon',
        'path',
      ].includes(el.type)
    ) {
      let newProps: Record<string, any> = { ...el.props };
      newProps[key] = value;
      pluginApi.elements.update(el.id, { props: newProps });
    }
  });
};

// Update SVG specific props (goes only to props)
const updateSvgProp = (key: string, value: any) => {
  if (!pluginApi || !pluginApi.elements || !pluginApi.elements.update) return;

  if (key === 'stroke') commonProps.value.svgStroke = value;
  if (key === 'fill') commonProps.value.svgFill = value;
  if (key === 'strokeWidth') commonProps.value.svgStrokeWidth = value;

  selectedElements.value.forEach(el => {
    // Only apply svg props to svg elements
    if (['svg', 'SvgElement'].includes(el.type)) {
      let newProps: Record<string, any> = { ...el.props };
      newProps[key] = value;
      pluginApi.elements.update(el.id, { props: newProps });
    }
  });
};

const updateRoughImageFill = (val: string) => {
  if (!pluginApi || !pluginApi.elements || !pluginApi.elements.update) return;
  const rawUrl = val.replace(/^url\(['"]?/, '').replace(/['"]?\)$/, '');
  commonProps.value.fillImage = rawUrl;
  commonProps.value.fillStyle = 'image';

  selectedElements.value.forEach(el => {
    if (['RoughElement', 'RoughShape', 'rect', 'circle', 'ellipse', 'line', 'polygon', 'path'].includes(el.type)) {
      let newProps: Record<string, any> = { ...el.props };
      newProps.fillImage = rawUrl;
      newProps.fillStyle = 'image';
      pluginApi.elements.update(el.id, { props: newProps });
    }
  });
};

// Layer Operations
const reorderLayer = (type: 'front' | 'back' | 'forward' | 'backward') => {
  if (!canvasState || !canvasState.document || !canvasState.document.slides) return;
  const elements = [...(canvasState.document.slides[canvasState.runtime.currentSlideIndex || 0]?.elements || [])];
  const selectedIds = new Set(selectedElements.value.map(e => e.id));

  const selected = elements.filter(e => selectedIds.has(e.id));
  const unselected = elements.filter(e => !selectedIds.has(e.id));

  let newElements: any[] = [];
  if (type === 'front') {
    newElements = [...unselected, ...selected];
  } else if (type === 'back') {
    newElements = [...selected, ...unselected];
  } else if (type === 'forward') {
    newElements = [...elements];
    for (let i = newElements.length - 2; i >= 0; i--) {
      if (selectedIds.has(newElements[i].id) && !selectedIds.has(newElements[i + 1].id)) {
        [newElements[i], newElements[i + 1]] = [newElements[i + 1], newElements[i]];
      }
    }
  } else if (type === 'backward') {
    newElements = [...elements];
    for (let i = 1; i < newElements.length; i++) {
      if (selectedIds.has(newElements[i].id) && !selectedIds.has(newElements[i - 1].id)) {
        [newElements[i], newElements[i - 1]] = [newElements[i - 1], newElements[i]];
      }
    }
  }

  if (canvasState && canvasState.document && canvasState.document.slides) {
    const slideElements = canvasState.document.slides[canvasState.runtime.currentSlideIndex || 0]?.elements;
    if (slideElements) {
      slideElements.splice(0, slideElements.length, ...newElements);
    }
  }
  if (pluginApi.project && pluginApi.project.saveState) pluginApi.project.saveState();
};

// Alignment Operations
const alignElements = (type: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
  if (pluginApi.elements && pluginApi.elements.align) {
    pluginApi.elements.align(type);
  } else {
    console.warn('alignSelected API not implemented in vue-canvas yet');
  }
};

const getElementSize = (el: any): { width: number; height: number } => {
  if (el.width != null && el.height != null) {
    return { width: Number(el.width), height: Number(el.height) };
  }
  const pw = el.props?.width;
  const ph = el.props?.height;
  const styleObj = getStyleObj(el.props || {});
  const sw = styleObj.width ?? styleObj['width'];
  const sh = styleObj.height ?? styleObj['height'];
  const toNum = (v: any): number => {
    if (v == null || v === '') return 0;
    const s = String(v).trim();
    const m = s.match(/^(-?\d+(?:\.\d+)?)/);
    return m ? parseFloat(m[1]) : 0;
  };
  return {
    width: el.width != null ? Number(el.width) : toNum(pw ?? sw ?? 0),
    height: el.height != null ? Number(el.height) : toNum(ph ?? sh ?? 0),
  };
};

// Canvas Alignment - align selected elements relative to canvas edges/center
const alignToCanvas = (
  type: 'left' | 'right' | 'hcenter' | 'top' | 'bottom' | 'vcenter' | 'center' | 'fill'
) => {
  if (selectedElements.value.length === 0) return;
  const canvasW = canvasState?.runtime?.width ?? 800;
  const canvasH = canvasState?.runtime?.height ?? 600;

  // When multiple elements, compute the bounding box of all selected
  // For group-aware behavior: if a single group, treat as one; if multi, move each keeping their relative positions
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  selectedElements.value.forEach(el => {
    const { width: w, height: h } = getElementSize(el);
    if (el.x < minX) minX = el.x;
    if (el.y < minY) minY = el.y;
    if (el.x + w > maxX) maxX = el.x + w;
    if (el.y + h > maxY) maxY = el.y + h;
  });

  const bboxW = maxX - minX;
  const bboxH = maxY - minY;

  let deltaX = 0;
  let deltaY = 0;

  switch (type) {
    case 'left':
      deltaX = 0 - minX;
      break;
    case 'right':
      deltaX = canvasW - maxX;
      break;
    case 'hcenter':
      deltaX = (canvasW - bboxW) / 2 - minX;
      break;
    case 'top':
      deltaY = 0 - minY;
      break;
    case 'bottom':
      deltaY = canvasH - maxY;
      break;
    case 'vcenter':
      deltaY = (canvasH - bboxH) / 2 - minY;
      break;
    case 'center':
      deltaX = (canvasW - bboxW) / 2 - minX;
      deltaY = (canvasH - bboxH) / 2 - minY;
      break;
    case 'fill':
      deltaX = 0 - minX;
      deltaY = 0 - minY;
      break;
  }

  selectedElements.value.forEach(el => {
    const newX = Math.round((el.x + deltaX) * 100) / 100;
    const newY = Math.round((el.y + deltaY) * 100) / 100;
    const updatePayload: any = { x: newX, y: newY };
    
    if (type === 'fill') {
      updatePayload.width = canvasW;
      updatePayload.height = canvasH;
    }

    if (pluginApi && pluginApi.elements && pluginApi.elements.update) {
      pluginApi.elements.update(el.id, updatePayload);
    } else if (canvasState && canvasState.document && canvasState.document.slides) {
      const target = canvasState.document.slides[canvasState.runtime.currentSlideIndex || 0]?.elements?.find((e: any) => e.id === el.id);
      if (target) {
        target.x = newX;
        target.y = newY;
        if (type === 'fill') {
          target.width = canvasW;
          target.height = canvasH;
        }
      }
    }
  });

  if (pluginApi && pluginApi.project && pluginApi.project.saveState) {
    pluginApi.project.saveState();
  }
};

// Other Operations
const duplicateSelected = () => {
  selectedElements.value.forEach(el => {
    const clone = JSON.parse(JSON.stringify(el));
    clone.id = `el_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    clone.x += 20;
    clone.y += 20;
    delete clone.groupId;
    if (pluginApi.elements && pluginApi.elements.add) pluginApi.elements.add(clone);
  });
};

const deleteSelected = () => {
  if (pluginApi.elements && pluginApi.elements.remove) {
    pluginApi.elements.remove(selectedElements.value.map(e => e.id));
  }
};

const groupSelected = () => {
  if (pluginApi.elements && pluginApi.elements.group) pluginApi.elements.group();
};

const unGroupSelected = () => {
  if (pluginApi.elements && pluginApi.elements.ungroup) pluginApi.elements.ungroup();
};

onMounted(() => {
  updateSelectedElements();
  document.addEventListener('click', closeDropdowns);
  document.addEventListener('mousedown', closeColorPickerOutside, true);

  // Inject fonts to document
  const styleEl = document.createElement('style');
  styleEl.id = 'plugin-menu-fonts';

  let fontCSS = '';
  fontsList.forEach((font: any) => {
    if (font.file) {
      fontCSS += `
        @font-face {
          font-family: '${font.fontFamily}';
          src: url('${font.file}');
          font-weight: normal;
          font-style: normal;
          font-display: swap;
        }
      `;
    }
  });

  styleEl.innerHTML = fontCSS;
  if (!document.getElementById('plugin-menu-fonts')) {
    document.head.appendChild(styleEl);
  }
});

onUnmounted(() => {
  document.removeEventListener('click', closeDropdowns);
  document.removeEventListener('mousedown', closeColorPickerOutside, true);
});

const closeDropdowns = (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  if (!target.closest('.custom-dropdown')) {
    isFontMenuOpen.value = false;
  }
};

const colorPickerPos = ref({ top: 0, left: 0 });

const toggleColorPicker = (type: string, e: MouseEvent) => {
  if (activeColorPicker.value === type) {
    activeColorPicker.value = null;
  } else {
    activeColorPicker.value = type;
    const target = (e.currentTarget || e.target) as HTMLElement;
    const rect = target.getBoundingClientRect();
    colorPickerPos.value = {
      top: rect.top,
      left: rect.left - 12,
    };
  }
};

const currentColorValue = computed(() => {
  switch (activeColorPicker.value) {
    case 'roughStroke':
      return commonProps.value.stroke;
    case 'roughFill':
      return commonProps.value.fill;
    case 'svgStroke':
      return commonProps.value.svgStroke;
    case 'svgFill':
      return commonProps.value.svgFill;
    case 'color':
      return commonProps.value.color;
    case 'backgroundColor':
      return commonProps.value.backgroundColor;
    default:
      return 'transparent';
  }
});

const updateCurrentColor = (val: string) => {
  switch (activeColorPicker.value) {
    case 'roughStroke':
      updateRoughProp('stroke', val);
      break;
    case 'roughFill':
      updateRoughProp('fill', val);
      break;
    case 'svgStroke':
      updateSvgProp('stroke', val);
      break;
    case 'svgFill':
      updateSvgProp('fill', val);
      break;
    case 'color':
      updateNativeProp('color', val);
      break;
    case 'backgroundColor':
      updateNativeProp('backgroundColor', val);
      break;
  }
};

const closeColorPicker = () => {
  activeColorPicker.value = null;
};

const closeColorPickerOutside = (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  if (
    !target.closest('.custom-color-btn') &&
    !target.closest('.font-btn') &&
    !target.closest('.n-popover')
  ) {
    activeColorPicker.value = null;
  }
};

const updateBackgroundImage = (val: string) => {
  updateNativeProp('backgroundImage', val);
  updateNativeProp('backgroundSize', 'cover');
  updateNativeProp('backgroundPosition', 'center');
};

const updateRoughFillImage = (val: string) => {
  const match = val.match(/url\(['"]?(.*?)['"]?\)/);
  if (match) {
    updateRoughProp('fillImage', match[1]);
    updateRoughProp('fillStyle', 'image');
  }
};
</script>

<style scoped>
.style-panel-overlay {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  user-select: none;
}

.panel-content {
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.group-header {
  font-size: 13px;
  color: var(--canvas-text-color, #333);
  margin-bottom: -8px;
}

.group-divider {
  height: 1px;
  background: var(--canvas-border-color, #e9ecef);
  margin: 4px 0;
}

.section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-title {
  font-size: 11px;
  color: var(--canvas-text-muted, #868e96);
  letter-spacing: 0.5px;
}

.color-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.color-btn {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 1px solid var(--canvas-border-color, rgba(0, 0, 0, 0.1));
  cursor: pointer;
  position: relative;
  transition:
    transform 0.1s,
    box-shadow 0.1s;
}

.color-btn.transparent {
  background:
    linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc),
    linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc);
  background-size: 10px 10px;
  background-position:
    0 0,
    5px 5px;
  background-color: white;
}

.color-btn.active {
  box-shadow:
    0 0 0 2px var(--canvas-panel-bg, #fff),
    0 0 0 4px var(--canvas-active-color, #748ffc);
  z-index: 1;
}

.color-btn:hover {
  transform: scale(1.1);
}

.color-picker-trigger {
  /* removed to avoid interference, keeping div for semantic grouping if needed */
}

.color-divider {
  width: 1px;
  height: 20px;
  background: var(--canvas-border-color, rgba(0, 0, 0, 0.1));
  margin: 0 4px;
}

.image-picker-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--canvas-panel-bg, #ffffff) !important;
  color: var(--canvas-text-color, #333);
}

.image-picker-btn svg {
  width: 14px;
  height: 14px;
}

.custom-color-btn {
  border-radius: 4px;
}

.custom-color-btn.active {
  box-shadow:
    0 0 0 2px var(--canvas-panel-bg, #fff),
    0 0 0 4px var(--canvas-active-color, #748ffc);
}

.inline-color-panel {
  width: 100%;
  margin-top: 12px;
}

.icon-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.icon-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: var(--canvas-btn-bg, transparent);
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--canvas-btn-text, #495057);
  transition: all 0.2s ease;
}

.icon-btn:hover {
  background: var(--canvas-btn-hover-bg, #f1f3f5);
}

.icon-btn.active {
  background: var(--canvas-btn-active-bg, rgba(116, 143, 252, 0.15));
  color: var(--canvas-active-color, #339af0);
}

.text-btn {
  font-size: 13px;
}

.solid-fill-icon {
  width: 14px;
  height: 14px;
  background: currentColor;
  border-radius: 2px;
}

/* Custom Dropdown */
.custom-dropdown {
  position: relative;
  width: 100%;
}

.dropdown-selected {
  width: 100%;
  height: 32px;
  background: var(--canvas-btn-bg, transparent);
  border: 1px solid var(--canvas-border-color, #e9ecef);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  cursor: pointer;
  font-size: 13px;
  color: var(--canvas-btn-text, #333);
  transition: all 0.2s ease;
}

.dropdown-selected:hover {
  background: var(--canvas-btn-hover-bg, #f1f3f5);
}

.dropdown-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 1000;
}

.dropdown-menu {
  position: absolute;
  top: 36px;
  left: 0;
  width: 100%;
  background: var(--canvas-panel-bg, #fff);
  border: 1px solid var(--canvas-border-color, #e9ecef);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 110;
  max-height: 200px;
  overflow-y: auto;
  padding: 4px 0;
}

.dropdown-item {
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  color: var(--canvas-text-color, #495057);
  transition: background 0.1s ease;
}

.dropdown-item:hover {
  background: var(--canvas-btn-hover-bg, #f1f3f5);
}

.dropdown-item.active {
  background: var(--canvas-active-color, #339af0);
  color: #fff;
}

.opacity-slider {
  display: flex;
  align-items: center;
  gap: 12px;
}

.opacity-slider input[type='range'] {
  flex: 1;
  height: 4px;
  border-radius: 2px;
  background: var(--canvas-border-color, #e9ecef);
  outline: none;
  -webkit-appearance: none;
}

.opacity-slider input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--canvas-active-color, #339af0);
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.opacity-slider span {
  font-size: 12px;
  color: var(--canvas-text-muted, #868e96);
  min-width: 32px;
  text-align: right;
}

.custom-scroll::-webkit-scrollbar {
  width: 4px;
}

.custom-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scroll::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

:global([data-theme='dark']) .custom-scroll::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
}

.flyout-teleport {
  position: fixed;
  z-index: 9999;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15));
}

.flyout-arrow {
  position: absolute;
  top: 10px;
  left: -5px;
  width: 10px;
  height: 10px;
  background: var(--canvas-panel-bg, #ffffff);
  border-left: 1px solid var(--canvas-border-color, #e9ecef);
  border-bottom: 1px solid var(--canvas-border-color, #e9ecef);
  transform: rotate(45deg);
  z-index: 201;
  /* Above panel shadow, below panel content */
  pointer-events: none;
}

/* Code Editor */
.code-editor-box {
  background: var(--canvas-btn-bg, #f8f9fa);
  border: 1px solid var(--canvas-border-color, #e9ecef);
  border-radius: 8px;
  padding: 8px;
  transition: border-color 0.2s;
}

.code-editor-box:focus-within {
  border-color: #6e56cf;
  background: var(--canvas-panel-bg, #ffffff);
  box-shadow: 0 0 0 2px rgba(110, 86, 207, 0.15);
}

.code-textarea {
  width: 100%;
  border: none;
  background: transparent;
  color: #343a40;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 12px;
  line-height: 1.5;
  resize: vertical;
  min-height: 100px;
  outline: none;
}

/* Collapse Component Styles */
.collapse-item {
  /* border: 1px solid var(--canvas-border-color, #e9ecef); */
  /* border-radius: 8px; */
  /* overflow: scroll; */
  /* background: var(--canvas-panel-bg, #ffffff); */
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.collapse-item:hover {
  /* border-color: var(--canvas-active-color, #339af0); */
  /* box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); */
}

.collapse-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px 12px 0px;
  cursor: pointer;
  user-select: none;
  background: var(--canvas-bg-color, #f8f9fa);
  transition: background 0.2s ease;
}

.collapse-header:hover {
  /* background: var(--canvas-btn-hover-bg, #f1f3f5); */
}

.collapse-header .title {
  font-size: 13px;
  /* font-weight: 600; */
  color: var(--canvas-text-color, #495057);
  letter-spacing: 0.3px;
  transition: color 0.2s ease;
}

.collapse-header .arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--canvas-text-muted, #868e96);
  transition:
    transform 0.3s ease,
    color 0.2s ease;
}

.collapse-header .arrow.open {
  transform: rotate(180deg);
  color: var(--canvas-active-color, #339af0);
}

.collapse-content {
  /* padding: 14px; */
  background: var(--canvas-panel-bg, #ffffff);
  border-top: 1px solid var(--canvas-border-color, #e9ecef);
}

/* Canvas Alignment Styles */
.canvas-align-btn {
  position: relative;
  background: var(--canvas-btn-bg, #f3f4f6);
  transition: all 0.15s ease;
  border: 1px solid transparent;

  &:hover {
    background: var(--canvas-btn-hover-bg, #e5e7eb);
    transform: translateY(-1px);
    border-color: rgba(99, 102, 241, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
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
