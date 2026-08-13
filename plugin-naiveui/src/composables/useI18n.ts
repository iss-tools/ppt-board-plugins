import { computed } from 'vue';
import { useCanvasContext } from '@iss-ai/ppt-board';
import zh from '../locales/zh';
import en from '../locales/en';

type Language = 'zh' | 'en';
const messages: Record<Language, any> = { zh, en };

export function useI18n() {
  const ctx = useCanvasContext();

  const currentLang = computed<Language>(() => {
    const lang = ctx.state?.editor?.language || 'zh';
    return lang.startsWith('en') ? 'en' : 'zh';
  });

  const t = (key: string, replacements?: Record<string, string | number>) => {
    const keys = key.split('.');
    let val = messages[currentLang.value];
    for (const k of keys) {
      if (val) val = val[k];
    }
    
    let str = val || key;
    if (typeof str === 'string' && replacements) {
      Object.keys(replacements).forEach(k => {
        str = str.replace(`{${k}}`, String(replacements[k]));
      });
    }
    
    return str;
  };

  return { t, currentLang };
}
