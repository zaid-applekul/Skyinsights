export const preprocessImage = async (imageFile: File): Promise<number[][]> => {
  return new Promise((resolve) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    img.onload = () => {
      // Resize to 224x224 (common input size for CNN models)
      canvas.width = 224;
      canvas.height = 224;
      
      ctx.drawImage(img, 0, 0, 224, 224);
      
      const imageData = ctx.getImageData(0, 0, 224, 224);
      const data = imageData.data;
      
      // Convert to normalized RGB values
      const processedData: number[][] = [];
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i] / 255;
        const g = data[i + 1] / 255;
        const b = data[i + 2] / 255;
        processedData.push([r, g, b]);
      }
      
      resolve(processedData);
    };
    
    img.src = URL.createObjectURL(imageFile);
  });
};

export const extractImageFeatures = (imageData: number[][]): number[] => {
  // Simple feature extraction - in a real implementation, this would be much more sophisticated
  const features: number[] = [];
  
  // Calculate color statistics
  let rSum = 0, gSum = 0, bSum = 0;
  let rVar = 0, gVar = 0, bVar = 0;
  
  imageData.forEach(([r, g, b]) => {
    rSum += r;
    gSum += g;
    bSum += b;
  });
  
  const rMean = rSum / imageData.length;
  const gMean = gSum / imageData.length;
  const bMean = bSum / imageData.length;
  
  imageData.forEach(([r, g, b]) => {
    rVar += Math.pow(r - rMean, 2);
    gVar += Math.pow(g - gMean, 2);
    bVar += Math.pow(b - bMean, 2);
  });
  
  rVar /= imageData.length;
  gVar /= imageData.length;
  bVar /= imageData.length;
  
  features.push(rMean, gMean, bMean, rVar, gVar, bVar);
  
  // Add texture features (simplified edge detection)
  let edgeCount = 0;
  const width = 224;
  for (let i = 0; i < imageData.length - width - 1; i++) {
    if (i % width === width - 1) continue;
    
    const [r1, g1, b1] = imageData[i];
    const [r2, g2, b2] = imageData[i + 1];
    const [r3, g3, b3] = imageData[i + width];
    
    const horizontalEdge = Math.abs((r1 + g1 + b1) - (r2 + g2 + b2));
    const verticalEdge = Math.abs((r1 + g1 + b1) - (r3 + g3 + b3));
    
    if (horizontalEdge > 0.1 || verticalEdge > 0.1) {
      edgeCount++;
    }
  }
  
  features.push(edgeCount / imageData.length);
  
  return features;
};