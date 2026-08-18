import pptxgen from 'pptxgenjs';

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
        let bg = slideData.config.background;
        if (bg.startsWith('#')) bg = bg.replace('#', '');
        slide.background = { color: bg };
      } else if (documentData.config && documentData.config.background) {
        let bg = documentData.config.background;
        if (bg.startsWith('#')) bg = bg.replace('#', '');
        slide.background = { color: bg };
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
          let color = el.props?.fill || '000000';
          if (color.startsWith('#')) color = color.replace('#', '');
          
          slide.addText(text.replace(/<[^>]+>/g, ''), {
            x, y, w, h,
            color,
            fontSize: (el.props?.fontSize || 24) * pxToPt
          });
        } else if (el.type === 'shape') {
          const shapeType = el.props?.shapeType === 'circle' ? pptx.ShapeType.ellipse : pptx.ShapeType.rect;
          let fill = el.props?.fill || 'FFFFFF';
          if (fill.startsWith('#')) fill = fill.replace('#', '');
          
          slide.addShape(shapeType, {
            x, y, w, h,
            fill: { color: fill }
          });
          
          if (el.props?.text) {
             slide.addText(el.props.text.replace(/<[^>]+>/g, ''), {
                x, y, w, h, align: 'center', valign: 'middle'
             });
          }
        } else if (el.type === 'image') {
          if (el.props?.src) {
            slide.addImage({
              data: el.props.src,
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
           const ed = el.props?.exportData;
           if (ed) {
             if ((ed.nodeType === 'shape' || ed.nodeType === 'text') && ed.text) {
               slide.addText(ed.text, { x, y, w, h, fontSize: 16 * pxToPt, color: '000000', align: 'center', valign: 'middle' });
             } else if ((ed.nodeType === 'picture' || ed.nodeType === 'bg_master') && ed.src) {
               // Only add image if src is a valid data URL (blob URLs won't work easily in pptxgenjs without fetching)
               // Fortunately, pptx-renderer usually generates blob URLs for images, which pptxgenjs might fail on.
               // We will try to add it anyway, or users can re-upload images.
               slide.addImage({ data: ed.src, x, y, w, h });
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
