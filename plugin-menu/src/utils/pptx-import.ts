import { parseZip, buildPresentation, renderSlide } from '@aiden0z/pptx-renderer';

async function blobUrlToBase64(blobUrl: string): Promise<string> {
  if (!blobUrl || !blobUrl.startsWith('blob:')) return blobUrl;
  try {
    const res = await fetch(blobUrl);
    const blob = await res.blob();
    
    // If it's an SVG (often used for text/shapes), DO NOT compress it.
    // Compressing SVGs via Canvas can destroy them (0x0 intrinsic size) or ruin their infinite resolution.
    if (blob.type === 'image/svg+xml') {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }

    // Only compress massive raster images to save LocalStorage quota
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        
        const MAX_SIZE = 1280;
        if (width > height && width > MAX_SIZE) {
          height = Math.round(height * (MAX_SIZE / width));
          width = MAX_SIZE;
        } else if (height > MAX_SIZE) {
          width = Math.round(width * (MAX_SIZE / height));
          height = MAX_SIZE;
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // Fallback to FileReader if canvas fails
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/webp', 0.6));
      };
      img.onerror = () => {
        // Fallback to FileReader if image decoding fails
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      };
      img.src = blobUrl;
    });
  } catch (e) {
    console.error('[pptx-import] Failed to convert/compress blob', e);
    return blobUrl;
  }
}

export async function importPptx(file: File): Promise<any> {
  try {
    const buffer = await file.arrayBuffer();
    const ppt = await parseZip(buffer);
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

      // Unified recursive function to extract elements
      const extractElements = (
        node: any,
        domEl: HTMLElement,
        indexPrefix: string,
        isMaster: boolean,
        parentRawLeft: number = 0,
        parentRawTop: number = 0
      ) => {
        if (!domEl) return;
        if (node && node.hidden) return;

        // pptx-renderer positions group children relatively. 
        // We accumulate the coordinates to get the absolute position on the canvas.
        const relRawLeft = parseDim(domEl.style.left, pres.width, 0);
        const relRawTop = parseDim(domEl.style.top, pres.height, 0);
        
        const absRawLeft = parentRawLeft + relRawLeft;
        const absRawTop = parentRawTop + relRawTop;

        // If it's a group node, recurse into its children instead of pushing the group container
        if (node && node.nodeType === 'group' && node.children && node.children.length > 0) {
          let childIndex = 0;
          Array.from(domEl.children).forEach((childEl, i) => {
            if (!childEl || childEl.tagName === 'STYLE') return;
            const childNode = node.children[childIndex++];
            extractElements(childNode, childEl as HTMLElement, `${indexPrefix}_${i}`, isMaster, absRawLeft, absRawTop);
          });
          return;
        }

        const rawWidth = parseDim(domEl.style.width, pres.width, isMaster ? pres.width : 100);
        const rawHeight = parseDim(domEl.style.height, pres.height, isMaster ? pres.height : 100);

        const left = absRawLeft * scaleX;
        const top = absRawTop * scaleY;
        const width = rawWidth * scaleX;
        const height = rawHeight * scaleY;
        const transform = domEl.style.transform;

        // Strip absolute positioning properties so HtmlElement container controls placement
        domEl.style.position = 'relative';
        domEl.style.left = '0';
        domEl.style.top = '0';
        domEl.style.width = '100%';
        domEl.style.height = '100%';
        domEl.style.transform = '';
        domEl.style.margin = '0';

        // Make text containers natively editable (Hack for Route A)
        // pptx-renderer outputs the text container as a direct child <div> of the shape wrapper
        const textBodies = Array.from(domEl.children).filter(child => child.tagName === 'DIV');
        textBodies.forEach((tb) => {
          tb.setAttribute('contenteditable', 'true');
          tb.setAttribute('style', `${tb.getAttribute('style') || ''}; outline: none; cursor: text; pointer-events: auto; user-select: text; -webkit-user-select: text;`);
          // Add a data attribute to help with event delegation if you want to sync back to store later
          tb.setAttribute('data-pptx-editable', 'true');
        });

        // Ensure any inner SVGs scale to fill this wrapper perfectly
        const svgs = domEl.querySelectorAll('svg');
        svgs.forEach((svg) => {
          svg.setAttribute('width', '100%');
          svg.setAttribute('height', '100%');
          // Make sure SVG doesn't block clicks to the text body behind/above it
          svg.style.pointerEvents = 'none';
        });

        const scaledHtml = `<div style="width: ${rawWidth}px; height: ${rawHeight}px; transform-origin: top left; transform: scale(${scaleX}, ${scaleY});">${domEl.outerHTML}</div>`;

        elements.push({
          id: `pptx_${slide.index}_${isMaster ? 'bg_master' : 'node'}_${indexPrefix}`,
          type: 'HtmlElement',
          x: left,
          y: top,
          width,
          height,
          // Disable vue-canvas's default double-click textarea behavior,
          // so the native contenteditable can capture the double-click.
          isEditable: false,
          ...(isMaster ? { locked: true } : {}),
          props: {
            html: scaledHtml,
            style: { transform }
          }
        });
      };

      // 1. Map Background, Master Shapes, and Layout Shapes
      bgAndMasterDOM.forEach((el, index) => {
        // bgAndMasterDOM elements don't have corresponding AST nodes in slide.nodes
        extractElements(null, el as HTMLElement, `${index}`, true);
      });

      // 2. Map Slide specific nodes recursively
      slide.nodes.forEach((node, index) => {
        extractElements(node, slideNodesDOM[index] as HTMLElement, `${index}`, false);
      });

      // 3. Post-process to safely convert Blob URLs to Base64
      // Done asynchronously AFTER DOM extraction to avoid live HTMLCollection mutation bugs.
      // This also catches SVGs with embedded <image href="blob:..."> that querySelector('img') misses.
      for (const element of elements) {
        if (element.props && element.props.html && element.props.html.includes('blob:')) {
          const blobUrls = element.props.html.match(/blob:https?:\/\/[^\s"'<>\)]+/g) || [];
          const uniqueUrls = Array.from(new Set(blobUrls));
          let htmlStr = element.props.html;
          for (const url of uniqueUrls as string[]) {
            const base64 = await blobUrlToBase64(url);
            // Replace all occurrences of this blob URL in the string
            htmlStr = htmlStr.split(url).join(base64);
          }
          element.props.html = htmlStr;
        }
      }

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
