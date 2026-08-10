import { ref } from 'vue';
import type { CanvasPluginContext } from '@iss-ai/ppt-board';
import { useAblySync } from './composables/useAblySync';

export let pluginCtx: CanvasPluginContext | null = null;
export let ablySync: ReturnType<typeof useAblySync> | null = null;

import type { CooperationPluginOptions } from './index';

export const initStore = (ctx: CanvasPluginContext, options?: CooperationPluginOptions) => {
  pluginCtx = ctx;
  ablySync = useAblySync(ctx, options);
};
