import pptxgen from 'pptxgenjs';

function rgbToHex(color: string): string {
  if (!color) return 'FFFFFF';
  if (color.startsWith('#')) {
    let hex = color.replace('#', '');
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('');
    } else if (hex.length === 4) {
      hex = hex.slice(0, 3).split('').map(c => c + c).join('');
    } else if (hex.length === 8) {
      hex = hex.slice(0, 6);
    }
    return hex.toUpperCase();
  }
  const rgb = color.match(/\d+/g);
  if (rgb && rgb.length >= 3) {
    return ((1 << 24) + (parseInt(rgb[0]) << 16) + (parseInt(rgb[1]) << 8) + parseInt(rgb[2])).toString(16).slice(1).toUpperCase();
  }
  return 'FFFFFF';
}

async function svgToPng(svgStr: string, width: number, height: number): Promise<string> {
  return new Promise((resolve) => {
    try {
      // Chrome's Image loader will silently reject SVGs that lack the xmlns attribute!
      if (!svgStr.includes('xmlns="http://www.w3.org/2000/svg"')) {
        svgStr = svgStr.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
      }

      const b64 = window.btoa(unescape(encodeURIComponent(svgStr)));
      const dataUrl = `data:image/svg+xml;base64,${b64}`;
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = width || img.width || 1000;
        canvas.height = height || img.height || 1000;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/png'));
        } else {
          resolve(dataUrl);
        }
      };
      img.onerror = () => {
        console.warn('[pptx-export] svgToPng failed to load image into canvas', dataUrl.substring(0, 50));
        resolve(dataUrl);
      };
      img.src = dataUrl;
    } catch (e) {
      resolve('');
    }
  });
}

async function ensurePng(dataUrl: string): Promise<string> {
  if (!dataUrl || !dataUrl.startsWith('data:image/webp')) return dataUrl;
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } else {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

export async function exportPptx(documentData: any): Promise<void> {
  const pptx = new pptxgen();

  try {
    let slideW = 10;
    let slideH = 5.625;

    // Set Layout/Config
    if (documentData.config && documentData.config.ratio) {
      if (documentData.config.ratio === '16:9') {
        pptx.layout = 'LAYOUT_16x9';
        slideW = 10;
        slideH = 5.625;
      } else if (documentData.config.ratio === '4:3') {
        pptx.layout = 'LAYOUT_4x3';
        slideW = 10;
        slideH = 7.5;
      } else {
        pptx.layout = 'LAYOUT_16x9';
      }
    }

    if (documentData.meta && documentData.meta.title) {
      pptx.title = documentData.meta.title;
    }

    const canvasW = documentData.config?.width || 1920;
    const canvasH = documentData.config?.height || 1080;
    const scaleX = slideW / canvasW;
    const scaleY = slideH / canvasH;

    const slides = documentData.slides || [];

    for (const slideData of slides) {
      const slide = pptx.addSlide();

      if (slideData.config && slideData.config.background) {
        slide.background = { color: rgbToHex(slideData.config.background) };
      } else if (documentData.config && documentData.config.background) {
        slide.background = { color: rgbToHex(documentData.config.background) };
      }

      const elements = slideData.elements || [];

      // Sort by z-index if applicable, here we just assume they are in order
      for (const el of elements) {
        const x = (el.x || 0) * scaleX;
        const y = (el.y || 0) * scaleY;
        const w = (el.width || 100) * scaleX;
        const h = (el.height || 100) * scaleY;
        const pxToPt = scaleX * 72; // Convert canvas pixels to typographic points (1 inch = 72 pt)

        if (el.type === 'text') {
          const text = el.props?.text || '';
          slide.addText(text.replace(/<[^>]+>/g, ''), {
            x, y, w, h,
            color: rgbToHex(el.props?.fill),
            fontSize: (el.props?.fontSize || 24) * pxToPt
          });
        } else if (el.type === 'shape') {
          const shapeType = el.props?.shapeType === 'circle' ? pptx.ShapeType.ellipse : pptx.ShapeType.rect;
          slide.addShape(shapeType, {
            x, y, w, h,
            fill: { color: rgbToHex(el.props?.fill) }
          });
          
          if (el.props?.text) {
             slide.addText(el.props.text.replace(/<[^>]+>/g, ''), {
                x, y, w, h, align: 'center', valign: 'middle'
             });
          }
        } else if (el.type === 'image') {
          if (el.props?.src) {
            const pngSrc = await ensurePng(el.props.src);
            slide.addImage({
              data: pngSrc,
              x, y, w, h
            });
          }
        } else if (el.type === 'echarts') {
          // pptxgenjs supports native charts
          // Extract data
          let source = el.props?.dataset?.source;
          if (source && source.length > 1) {
            // first row is headers
            const headers = source[0].slice(1);
            const chartData = [];
            for (let i = 1; i < headers.length + 1; i++) {
               const series = {
                 name: headers[i-1],
                 labels: [],
                 values: []
               };
               for (let j = 1; j < source.length; j++) {
                 series.labels.push(source[j][0]);
                 series.values.push(Number(source[j][i]) || 0);
               }
               chartData.push(series);
            }
            
            slide.addChart(pptx.ChartType.bar, chartData, { x, y, w, h });
          }
        } else if (el.type === 'e-table') {
           let source = el.props?.dataset?.source;
           if (source && source.length > 0) {
             slide.addTable(source, { x, y, w, h });
           }
        } else if (el.type === 'HtmlElement') {
           let htmlStr = el.props?.html;
           if (!htmlStr && el.props?.text) {
             htmlStr = el.props.text; // Fallback to plain text if no HTML
           }

           if (htmlStr) {
             // PRE-PROCESS: Convert all WebP images (which PowerPoint hates) to PNG
             // This universally catches <img>, CSS background-image, and <svg><image> tags!
             const webpMatches = htmlStr.match(/data:image\/webp;base64,[A-Za-z0-9+/=]+/g) || [];
             const uniqueWebps = [...new Set(webpMatches)];
             for (const webp of uniqueWebps) {
               const png = await ensurePng(webp);
               htmlStr = htmlStr.split(webp).join(png);
             }

             const parser = new DOMParser();
             const doc = parser.parseFromString(htmlStr, 'text/html');
             
             // 1. Extract raster images (<img> tags)
             const imgs = doc.querySelectorAll('img');
             for (let i = 0; i < imgs.length; i++) {
               const img = imgs[i];
               if (img.src && img.src.startsWith('data:image/')) {
                 slide.addImage({ data: img.src, x, y, w, h });
               }
             }

             // 1.5. Extract CSS background images
             const allElements = doc.querySelectorAll('*');
             for (let i = 0; i < allElements.length; i++) {
               const style = (allElements[i] as HTMLElement).style;
               if (style && style.backgroundImage) {
                 const match = style.backgroundImage.match(/url\(['"]?(data:image\/[^'"\)]+)['"]?\)/);
                 if (match && match[1]) {
                   slide.addImage({ data: match[1], x, y, w, h });
                 }
               }
             }

             // 2. Extract SVGs (Convert to PNG for PowerPoint compatibility)
             const svgs = doc.querySelectorAll('svg');
             for (let i = 0; i < svgs.length; i++) {
               try {
                 const svg = svgs[i];
                 const svgStr = new XMLSerializer().serializeToString(svg);
                 // PPTX dimensions are in inches. 
                 // We previously used 400 DPI which caused massive file bloat (13.5MB+).
                 // 192 DPI (exactly 2x 96) produces 1920x1080 resolution for a full 10-inch slide, 
                 // which matches HD screens perfectly while keeping file size reasonable.
                 const pngSrc = await svgToPng(svgStr, w * 192, h * 192);
                 slide.addImage({ data: pngSrc, x, y, w, h });
               } catch (e) {
                 console.warn('[pptx-export] Failed to serialize SVG', e);
               }
             }

             // Helper to parse font size
             const parseFontSize = (rawFontSize: string | number, scale: number = 1): number => {
               let fontSize = 18 * pxToPt; // default fallback
               if (rawFontSize) {
                 const match = rawFontSize.toString().match(/([\d.]+)(px|pt|em|rem)?/);
                 if (match) {
                   const val = parseFloat(match[1]);
                   const unit = match[2];
                   if (unit === 'px') fontSize = val * pxToPt;
                   else if (unit === 'pt') fontSize = (val * 4 / 3) * pxToPt; // CSS 1pt = 4/3px
                   else if (unit === 'em' || unit === 'rem') fontSize = val * 16 * pxToPt;
                   else fontSize = val * pxToPt; // assume px
                 } else if (!isNaN(Number(rawFontSize))) {
                   fontSize = Number(rawFontSize) * pxToPt;
                 }
               }
               return fontSize * scale;
             };

             // Helper to find cumulative scale transform
             const getCumulativeScale = (elNode: HTMLElement): number => {
               let scale = 1;
               let current: HTMLElement | null = elNode;
               while (current) {
                 if (current.style && current.style.transform) {
                   const match = current.style.transform.match(/scale\(\s*([\d.]+)/);
                   if (match) {
                     scale *= parseFloat(match[1]);
                   }
                 }
                 current = current.parentElement;
               }
               return scale;
             };

             // 3. Extract Text
             const textContainers = doc.querySelectorAll('div[data-pptx-editable="true"], span[data-pptx-editable="true"], p[data-pptx-editable="true"]');
             
             // Helper to find inherited inline style since DOMParser has no getComputedStyle
             const getInheritedStyle = (elNode: HTMLElement, prop: any): string => {
               let current: HTMLElement | null = elNode;
               while (current) {
                 if (current.style && current.style[prop]) {
                   return current.style[prop];
                 }
                 current = current.parentElement;
               }
               return '';
             };

             // Extract alignment from element props if any
             let defaultAlign = 'center';
             if (el.props?.textAlign === 'left') defaultAlign = 'left';
             if (el.props?.textAlign === 'right') defaultAlign = 'right';

             if (textContainers.length > 0) {
               const textRuns: any[] = [];
               
               textContainers.forEach(container => {
                 const extractTextRuns = (node: Node) => {
                   if (node.nodeType === Node.TEXT_NODE) {
                     let text = node.nodeValue || '';
                     if (text.trim()) {
                       text = text.replace(/[\r\n\t]+/g, ' '); // collapse formatting whitespace
                       const elNode = node.parentElement as HTMLElement;
                       
                       // Extract inline color
                       let rawColor = getInheritedStyle(elNode, 'color');
                       // Handle cases where text color is transparent but it uses a background gradient
                       if (rawColor === 'transparent') {
                         const bg = getInheritedStyle(elNode, 'background') || getInheritedStyle(elNode, 'backgroundImage');
                         if (bg) {
                           const match = bg.match(/(rgb\([^)]+\)|rgba\([^)]+\)|#[0-9a-fA-F]+)/);
                           if (match) {
                             rawColor = match[1];
                           }
                         }
                       }
                       rawColor = rawColor || el.props?.color;
                       const colorHex = rawColor ? rgbToHex(rawColor) : '000000';
                       
                       // Extract inline font size with fallback to element props
                       const rawFontSize = getInheritedStyle(elNode, 'fontSize') || (el.props?.fontSize ? `${el.props.fontSize}px` : null);
                       const scale = getCumulativeScale(elNode);
                       const fontSize = parseFontSize(rawFontSize, scale);

                       // Extract alignment
                       const alignRaw = getInheritedStyle(elNode, 'textAlign') || defaultAlign;
                       let align = 'center';
                       if (alignRaw === 'left') align = 'left';
                       if (alignRaw === 'right') align = 'right';

                       textRuns.push({
                         text: text,
                         options: { color: colorHex, fontSize: fontSize, align: align }
                       });
                     }
                   } else if (node.nodeType === Node.ELEMENT_NODE) {
                     const el = node as HTMLElement;
                     if (el.tagName.toLowerCase() === 'br') {
                       textRuns.push({ text: '\n', options: {} });
                     } else {
                       // recursively process child nodes
                       node.childNodes.forEach(child => extractTextRuns(child));
                     }
                   }
                 };
                 
                 extractTextRuns(container);
                 // Add a newline after each container if we have multiple block containers? 
                 // Usually they are distinct elements on canvas, wait, if they are multiple containers found in the same HtmlElement?
                 // Let's add a newline if textRuns already has content and this container adds more, but wait, addText handles array of runs linearly.
                 // It's probably better to just add a line break between distinct containers if they are block level.
                 textRuns.push({ text: '\n', options: {} });
               });

               if (textRuns.length > 0) {
                 // Remove the trailing newline
                 if (textRuns[textRuns.length - 1].text === '\n') {
                   textRuns.pop();
                 }
                 // Pass array to addText to retain rich formatting within the same bounding box
                 slide.addText(textRuns, { x, y, w, h, valign: 'middle' });
               }
             } else {
               // Fallback: If no editable text tags, grab entire node's raw text
               const text = doc.body.textContent || '';
               if (text.trim()) {
                 const rawColor = getInheritedStyle(doc.body, 'color') || el.props?.color;
                 const colorHex = rawColor ? rgbToHex(rawColor) : '000000';
                 
                 const rawFontSize = getInheritedStyle(doc.body, 'fontSize') || (el.props?.fontSize ? `${el.props.fontSize}px` : null);
                 const scale = getCumulativeScale(doc.body);
                 const fontSize = parseFontSize(rawFontSize, scale);

                 const alignRaw = getInheritedStyle(doc.body, 'textAlign') || defaultAlign;
                 let align = 'center';
                 if (alignRaw === 'left') align = 'left';
                 if (alignRaw === 'right') align = 'right';

                 slide.addText(text.trim(), { x, y, w, h, color: colorHex, fontSize: fontSize, align: align, valign: 'middle' });
               }
             }
           }
        }
      }
    }

    const title = documentData.meta?.title || 'exported_presentation';
    await pptx.writeFile({ fileName: `${title}.pptx` });
    console.log('[pptx-export] PPTX Export successful');
  } catch (error) {
    console.error('[pptx-export] Error exporting PPTX:', error);
    throw error;
  }
}
