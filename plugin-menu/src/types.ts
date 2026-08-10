import type { InjectionKey, Ref } from 'vue';
import type { CanvasPluginContext, CanvasTheme } from '@iss-ai/ppt-board';

export type CanvasPluginApi = CanvasPluginContext['api'];

export type CanvasRuntimeState = CanvasPluginContext['state']['runtime'];

export type CanvasSelectionManager = {
  selectElement: (id: string, multi?: boolean) => void;
  deselectElement: (id: string) => void;
  clearSelection: () => void;
  setSelection: (ids: string | string[]) => void;
  selectGroup: (groupId: string) => void;
  [key: string]: any;
};

export const CANVAS_PLUGIN_API_KEY: InjectionKey<CanvasPluginApi> = Symbol('canvasPluginApi');

export const CANVAS_THEME_KEY: InjectionKey<Ref<CanvasTheme | undefined>> = Symbol('canvasTheme');

export const CANVAS_STATE_KEY: InjectionKey<CanvasRuntimeState> = Symbol('canvasState');

export const CANVAS_SELECTION_KEY: InjectionKey<CanvasSelectionManager> = Symbol('canvasSelection');

export type EditorTheme = CanvasTheme | undefined;
