import { type AIPromptStyle } from './useAIStorage';

export const buildVisualRequirements = (styleConfig: AIPromptStyle, scope: string, selectedElementsJson?: string) => {
  const reqs: string[] = [];

  if (styleConfig.layout && styleConfig.layout.length > 0 && !styleConfig.layout.includes('none')) {
    reqs.push(`- 布局：${styleConfig.layout.join(', ')}`);
  }
  if (styleConfig.colorPalette && styleConfig.colorPalette.length > 0 && !styleConfig.colorPalette.includes('none')) {
    reqs.push(`- 配色：${styleConfig.colorPalette.join(', ')}`);
  }
  if (styleConfig.font && styleConfig.font.length > 0 && !styleConfig.font.includes('none')) {
    reqs.push(`- 字体：${styleConfig.font.join(', ')}`);
  }
  if (styleConfig.fontSize && styleConfig.fontSize.length > 0 && !styleConfig.fontSize.includes('none')) {
    reqs.push(`- 字号大小：${styleConfig.fontSize.join(', ')}`);
  }
  const isLanguageOriginal = !styleConfig.language || styleConfig.language.length === 0 || styleConfig.language.includes('none') || styleConfig.language.includes('Original / 原文');
  if (isLanguageOriginal) {
    reqs.push(`- 输出语言（界面文字和口播解说词的语言）：请务必根据我提供给你的【主题或源文本】自动推断语言。例如：如果我的主题是用英文写的，就用英文输出；如果是中文，就用中文输出。绝对不能因为当前这份 Prompt 指南是中文，就强行把外文主题的内容翻译成中文！`);
  } else {
    reqs.push(`- 输出语言（界面文字和口播解说词必须使用此语言）：${styleConfig.language?.join(', ')}`);
  }
  if (styleConfig.style && styleConfig.style.length > 0 && !styleConfig.style.includes('none')) {
    reqs.push(`- 风格：${styleConfig.style.join(', ')}`);
  }
  if (styleConfig.shadow && !styleConfig.shadow.includes('none')) {
    reqs.push(`- 阴影：${styleConfig.shadow.join(', ')}`);
  }
  if (styleConfig.textEffect && !styleConfig.textEffect.includes('none')) {
    reqs.push(`- 文字特效：${styleConfig.textEffect.join(', ')}`);
  }
  if (styleConfig.shapes && !styleConfig.shapes.includes('none')) {
    reqs.push(`- 图形式样：${styleConfig.shapes.join(', ')}`);
  }
  if (styleConfig.borderSketch && !styleConfig.borderSketch.includes('none')) {
    reqs.push(`- 边框式样：${styleConfig.borderSketch.join(', ')}`);
  }

  let finalReq = '';
  if (reqs.length > 0) {
    finalReq += '\n\n要求：\n' + reqs.join('\n');
  }

  if (scope === 'component') {
    finalReq += `\n\n(请根据我的要求，对当前幻灯片进行局部操作（增加、删除、修改组件），返回RFC 6902 JSON Patch数组。\n**极其重要**：你的 Patch 目标是一个【以组件ID为key的对象（Map）】，绝不是整个 Document。如果要新增组件，path 必须是 \`/{新组件ID}\`（例如 \`"path": "/ele_123"\`），绝不能使用 \`/slides\` 等文档级路径！\n**更重要**：请务必把你最终输出的 JSON 代码块包裹在 <data></data> 标签中，这对我解析非常重要！)`;
    if (selectedElementsJson) {
      finalReq += `\n【作为参考，以下是我当前选中的组件 JSON 数据，如果是修改/删除操作请针对此数据生成 Patch】：\n\`\`\`json\n${selectedElementsJson}\n\`\`\``;
    } else {
      finalReq += `\n【目前未选中任何特定组件，你可以自由增加新组件，请在 Patch 中使用 "op": "add"，path 直接指向新组件ID即可。】`;
    }
  } else if (scope === 'single') {
    finalReq += `\n\n(请生成全新的单页 Slide JSON，并务必把你最终输出的 JSON 代码块包裹在 <data></data> 标签中)`;
  } else if (scope === 'multi') {
    finalReq += `\n\n(请生成完整多页 Document JSON，并务必把你最终输出的 JSON 代码块包裹在 <data></data> 标签中)`;
  }

  return finalReq;
};
