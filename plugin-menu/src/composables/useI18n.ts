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

  const t = (key: string, replacementsOrDefault?: Record<string, string | number> | string) => {
    const keys = key.split('.');
    let val = messages[currentLang.value];
    for (const k of keys) {
      if (val) val = val[k];
    }
    
    let str = val;
    let vars: Record<string, string | number> | undefined;

    if (typeof replacementsOrDefault === 'string') {
        str = str || replacementsOrDefault;
    } else {
        str = str || key;
        vars = replacementsOrDefault;
    }

    if (typeof str === 'string' && vars) {
      Object.keys(vars).forEach(k => {
        str = str.replace(`{${k}}`, String(vars[k]));
      });
    }
    
    return str;
  };

  return { t, currentLang };
}
