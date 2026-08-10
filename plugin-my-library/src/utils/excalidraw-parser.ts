import type { CanvasElementData } from '@iss-ai/ppt-board';
import type { LibraryComponent } from '../store';

export interface MockPackage {
  id: string;
  name: string;
  author: string;
  description: string;
  components: LibraryComponent[];
}

export function parseExcalidrawLibrary(json: any, libName: string = 'Imported Excalidraw Lib'): MockPackage | null {
  if (json.type !== 'excalidrawlib') {
    return null;
  }

  let items: any[] = [];
  if (json.version === 1 && json.library) {
    items = json.library.map((elementsArray: any, idx: number) => ({
      id: `v1-item-${idx}`,
      elements: elementsArray
    }));
  } else if (json.libraryItems) {
    items = json.libraryItems;
  }
  const components: LibraryComponent[] = [];

  items.forEach((item: any, index: number) => {
    const parsedElements = parseExcalidrawElements(item.elements, json.files);
    
    components.push({
      id: item.id || `ex-lib-${Date.now()}-${index}`,
      name: item.name || `Component ${index + 1}`,
      createdAt: Date.now(),
      data: parsedElements.length === 1 ? parsedElements[0] : parsedElements,
    });
  });

  return {
    id: `pkg-${Date.now()}`,
    name: libName,
    author: json.source || 'Excalidraw',
    description: 'Imported from Excalidraw library JSON',
    components
  };
}


export function parseExcalidrawElements(elements: any[], files?: any): CanvasElementData[] {
  const normalizedElements = elements.map((el: any) => {
    let trueX = el.x || 0;
    let trueY = el.y || 0;
    let trueWidth = el.width || 0;
    let trueHeight = el.height || 0;
    let truePoints = el.points;
    
    const shape = el.type === 'freedraw' ? 'pen' : el.type;
    
    if (el.points && el.points.length > 0) {
      let pMinX = Infinity;
      let pMinY = Infinity;
      el.points.forEach((p: number[]) => {
        if (p[0] < pMinX) pMinX = p[0];
        if (p[1] < pMinY) pMinY = p[1];
      });
      trueX += pMinX;
      trueY += pMinY;
      truePoints = el.points.map((p: number[]) => [p[0] - pMinX, p[1] - pMinY]);
    }
    
    return { ...el, shape, trueX, trueY, trueWidth, trueHeight, truePoints };
  });

  let minX = Infinity;
  let minY = Infinity;
  normalizedElements.forEach((el: any) => {
    minX = Math.min(minX, el.trueX);
    minY = Math.min(minY, el.trueY);
  });

  return normalizedElements.map((el: any) => {
    const isText = el.type === 'text';
    const isImage = el.type === 'image';
    
    let type = 'RoughElement';
    if (isText) type = 'TextElement';
    else if (isImage) type = 'HtmlElement';
    
    const props: Record<string, any> = {
      strokeWidth: el.strokeWidth,
      strokeStyle: el.strokeStyle,
      roughness: el.roughness,
      opacity: el.opacity,
      angle: el.angle,
      groupIds: el.groupIds,
      curve: el.strokeSharpness === 'round' || (el.roundness && el.roundness.type === 2) || el.type === 'freedraw',
    };

    if (isText) {
      props.color = el.strokeColor;
      props.text = el.text;
      props.fontSize = el.fontSize;
      
      let fontFamily = 'sans-serif';
      if (el.fontFamily === 1) fontFamily = 'Long Cang, Virgil, cursive';
      else if (el.fontFamily === 2) fontFamily = 'Helvetica, Arial, sans-serif';
      else if (el.fontFamily === 3) fontFamily = 'Cascadia, monospace';
      else if (el.fontFamily === 4) fontFamily = 'Assistant, sans-serif';
      else if (typeof el.fontFamily === 'string') fontFamily = el.fontFamily;
      
      props.fontFamily = fontFamily;
      props.textAlign = el.textAlign;
    } else if (isImage) {
      props.tag = 'img';
      props.draggable = false;
      
      if (el.fileId && files && files[el.fileId]) {
        props.src = files[el.fileId].dataURL;
      } else {
        props.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><rect width="100%" height="100%" fill="%23f1f3f5"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" fill="%23adb5bd">Image Missing</text></svg>';
      }
    } else {
      props.stroke = el.strokeColor;
      props.fill = el.backgroundColor !== 'transparent' ? el.backgroundColor : undefined;
      props.fillStyle = el.fillStyle;
      props.shape = el.shape;
      if (el.truePoints) props.points = el.truePoints;
    }

    return {
      id: el.id,
      type,
      x: el.trueX - minX,
      y: el.trueY - minY,
      width: el.trueWidth,
      height: el.trueHeight,
      rotation: el.angle ? el.angle * (180 / Math.PI) : 0,
      groupId: el.groupIds && el.groupIds.length > 0 ? el.groupIds[0] : undefined,
      props
    };
  });
}
