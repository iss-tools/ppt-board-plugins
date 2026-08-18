import { parseZip, buildPresentation, renderSlide } from '@aiden0z/pptx-renderer';

export async function importPptx(file: File): Promise<any> {
  try {
    const ppt = await parseZip(file);
    const pres = await buildPresentation(ppt);
    console.log('[pptx-import] Parsed PPTX with pptx-renderer:', pres);

    // vue-canvas forces specific canvas dimensions based on ratio. We must scale elements to match.
    const presRatio = pres.width / pres.height;
    let ratioStr = 'auto';
    let targetW = pres.width;
    let targetH = pres.height;

    if (Math.abs(presRatio - 16 / 9) < 0.05) {
      ratioStr = '16:9';
      targetW = 1920;
      targetH = 1080;
    } else if (Math.abs(presRatio - 4 / 3) < 0.05) {
      ratioStr = '4:3';
      targetW = 1024;
      targetH = 768;
    } else {
      ratioStr = `${pres.width}:${pres.height}`;
      targetW = 1920;
      targetH = (1920 / pres.width) * pres.height;
    }

    const scaleX = targetW / pres.width;
    const scaleY = targetH / pres.height;

    const documentData: any = {
      config: {
        ratio: ratioStr,
        background: '#ffffff',
        width: targetW,
        height: targetH
      },
      slides: [] as any[],
      meta: {
        title: file.name.replace(/\.pptx$/i, '')
      }
    };

    for (const slide of pres.slides) {
      // We mount the slide into a detached container to render its elements
      const handle = renderSlide(pres, slide);
      
      // Wait for all asynchronous resources (images, embedded fonts) to load
      await handle.ready.catch((err) => console.warn('[pptx-import] slide ready warning:', err));
      
      const container = handle.element;
      let slideBg = container.style.backgroundColor || '#ffffff';

      const elements: any[] = [];
      
      // The renderer appends background, master shapes, layout shapes, then slide shapes.
      // We must extract ALL children to ensure perfect visual fidelity.
      const allChildren = Array.from(container.children);
      const slideNodesCount = slide.nodes.length;
      const bgAndMasterDOM = allChildren.slice(0, allChildren.length - slideNodesCount);
      const slideNodesDOM = allChildren.slice(-slideNodesCount);

      // Helper to parse CSS values which might be % or px
      const parseDim = (val: string, base: number, defaultVal: number) => {
        if (!val) return defaultVal;
        if (val.endsWith('%')) return (parseFloat(val) / 100) * base;
        return parseFloat(val) || defaultVal;
      };

      // 1. Map Background, Master Shapes, and Layout Shapes
      bgAndMasterDOM.forEach((el, index) => {
        const hEl = el as HTMLElement;
        if (!hEl) return;

        const rawLeft = parseDim(hEl.style.left, pres.width, 0);
        const rawTop = parseDim(hEl.style.top, pres.height, 0);
        const rawWidth = parseDim(hEl.style.width, pres.width, pres.width);
        const rawHeight = parseDim(hEl.style.height, pres.height, pres.height);

        const left = rawLeft * scaleX;
        const top = rawTop * scaleY;
        const width = rawWidth * scaleX;
        const height = rawHeight * scaleY;
        const transform = hEl.style.transform;

        hEl.style.position = 'relative';
        hEl.style.left = '0';
        hEl.style.top = '0';
        hEl.style.width = '100%';
        hEl.style.height = '100%';
        hEl.style.transform = '';
        hEl.style.margin = '0';

        // Ensure any inner SVGs scale to fill this wrapper perfectly
        const svgs = hEl.querySelectorAll('svg');
        svgs.forEach((svg) => {
          svg.setAttribute('width', '100%');
          svg.setAttribute('height', '100%');
        });

        // Wrap with CSS scale to ensure inner text and fixed pixels scale perfectly
        const scaledHtml = `<div style="width: ${rawWidth}px; height: ${rawHeight}px; transform-origin: top left; transform: scale(${scaleX}, ${scaleY});">${hEl.outerHTML}</div>`;

        elements.push({
          id: `pptx_${slide.index}_bg_master_${index}`,
          type: 'HtmlElement',
          x: left,
          y: top,
          width,
          height,
          locked: true, // Master/Layout shapes usually act as locked background
          props: {
            html: scaledHtml,
            style: { transform }
          }
        });
      });

      // 2. Map Slide specific nodes
      slide.nodes.forEach((node, index) => {
        const el = slideNodesDOM[index] as HTMLElement;
        if (!el) return;

        // Skip hidden nodes (though renderSlide might render them as hidden, we respect the AST)
        if ((node as any).hidden) return;

        const rawLeft = parseDim(el.style.left, pres.width, 0);
        const rawTop = parseDim(el.style.top, pres.height, 0);
        const rawWidth = parseDim(el.style.width, pres.width, 100);
        const rawHeight = parseDim(el.style.height, pres.height, 100);

        const left = rawLeft * scaleX;
        const top = rawTop * scaleY;
        const width = rawWidth * scaleX;
        const height = rawHeight * scaleY;
        const transform = el.style.transform;

        // Strip absolute positioning properties so HtmlElement container controls placement
        el.style.position = 'relative';
        el.style.left = '0';
        el.style.top = '0';
        el.style.width = '100%';
        el.style.height = '100%';
        el.style.transform = '';
        el.style.margin = '0';

        // Ensure any inner SVGs scale to fill this wrapper perfectly
        const svgs = el.querySelectorAll('svg');
        svgs.forEach((svg) => {
          svg.setAttribute('width', '100%');
          svg.setAttribute('height', '100%');
        });

        const scaledHtml = `<div style="width: ${rawWidth}px; height: ${rawHeight}px; transform-origin: top left; transform: scale(${scaleX}, ${scaleY});">${el.outerHTML}</div>`;

        // Extract any node-specific typing if we wanted to map to e-table / echarts in the future,
        // but for perfect fidelity, we wrap the generated HTML in HtmlElement.
        elements.push({
          id: `pptx_${slide.index}_node_${index}`,
          type: 'HtmlElement',
          x: left,
          y: top,
          width,
          height,
          props: {
            html: scaledHtml,
            style: { transform }
          }
        });
      });

      documentData.slides.push({
        elements,
        config: {
          background: slideBg
        }
      });
    }

    return documentData;
  } catch (error) {
    console.error('[pptx-import] Error:', error);
    throw error;
  }
}
