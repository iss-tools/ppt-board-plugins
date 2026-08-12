import { reactive } from 'vue';

interface PastePromptState {
  show: boolean;
  x: number;
  y: number;
  data: any[][];
}

export const pluginState = reactive<{
  pastePrompt: PastePromptState;
  resolvePrompt: ((choice: 'chart' | 'table' | 'cancel') => void) | null;
}>({
  pastePrompt: {
    show: false,
    x: 0,
    y: 0,
    data: [],
  },
  resolvePrompt: null,
});

export const requestPasteChoice = (data: any[][], mouseX: number, mouseY: number): Promise<'chart' | 'table' | 'cancel'> => {
  return new Promise((resolve) => {
    pluginState.pastePrompt.show = true;
    pluginState.pastePrompt.data = data;
    pluginState.pastePrompt.x = mouseX;
    pluginState.pastePrompt.y = mouseY;
    
    pluginState.resolvePrompt = (choice: 'chart' | 'table' | 'cancel') => {
      pluginState.pastePrompt.show = false;
      pluginState.resolvePrompt = null;
      resolve(choice);
    };
  });
};
