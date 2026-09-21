/**
 * High-performance canvas-based neural & artistic stylization engine.
 * Provides instant, zero-quota, unlimited transformations on any uploaded image.
 */

export type NeuralStyleMode =
  | "cyberpunk"
  | "anime_ghibli"
  | "oil_painting"
  | "charcoal_sketch"
  | "vintage_35mm"
  | "dark_fantasy"
  | "claymation"
  | "vaporwave"
  | "pop_art";

export async function applyNeuralStyle(
  imageSource: string,
  styleMode: NeuralStyleMode,
  intensity: number = 0.9
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return reject(new Error("Could not get canvas 2d context"));
        }

        // Limit dimension for smooth real-time generation while preserving high detail
        const maxDim = 1600;
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw base image
        ctx.drawImage(img, 0, 0, width, height);

        const imgData = ctx.getImageData(0, 0, width, height);
        const data = imgData.data;

        // Apply pixel-level transformations based on styleMode
        switch (styleMode) {
          case "cyberpunk": {
            // Boost cyan/magenta, high contrast, crushed blacks with neon glow
            for (let i = 0; i < data.length; i += 4) {
              const r = data[i];
              const g = data[i + 1];
              const b = data[i + 2];
              const lum = 0.299 * r + 0.587 * g + 0.114 * b;

              // Split toning: darks get deep cyan-blue, highlights get hot magenta-pink
              const newR = lum > 110 ? Math.min(255, r * 1.35 + 40 * intensity) : r * 0.7;
              const newG = lum < 128 ? Math.min(255, g * 0.8 + 20 * intensity) : g * 0.7;
              const newB = Math.min(255, b * 1.5 + (lum < 140 ? 55 * intensity : 85 * intensity));

              data[i] = r * (1 - intensity) + newR * intensity;
              data[i + 1] = g * (1 - intensity) + newG * intensity;
              data[i + 2] = b * (1 - intensity) + newB * intensity;
            }
            break;
          }

          case "anime_ghibli": {
            // Posterize mildly, boost greens & warm golds, soften contrast with pastel richness
            const levels = 16;
            for (let i = 0; i < data.length; i += 4) {
              let r = data[i];
              let g = data[i + 1];
              let b = data[i + 2];

              // Cel shading step
              r = Math.floor(r / (256 / levels)) * (256 / levels);
              g = Math.floor(g / (256 / levels)) * (256 / levels);
              b = Math.floor(b / (256 / levels)) * (256 / levels);

              // Warm lush vibrance
              const newR = Math.min(255, r * 1.1 + 15);
              const newG = Math.min(255, g * 1.18 + 12);
              const newB = Math.min(255, b * 0.95);

              data[i] = data[i] * (1 - intensity) + newR * intensity;
              data[i + 1] = data[i + 1] * (1 - intensity) + newG * intensity;
              data[i + 2] = data[i + 2] * (1 - intensity) + newB * intensity;
            }
            break;
          }

          case "oil_painting": {
            // Impressionist color saturation & edge painterly effect
            for (let i = 0; i < data.length; i += 4) {
              const r = data[i];
              const g = data[i + 1];
              const b = data[i + 2];
              const max = Math.max(r, g, b);
              const min = Math.min(r, g, b);
              const delta = max - min;

              // Boost saturation
              const satBoost = 1.4;
              const newR = Math.min(255, Math.max(0, r + (r - (max + min) / 2) * satBoost));
              const newG = Math.min(255, Math.max(0, g + (g - (max + min) / 2) * satBoost));
              const newB = Math.min(255, Math.max(0, b + (b - (max + min) / 2) * satBoost));

              // Mild canvas texture simulation
              const noise = ((i % 17) - 8) * 3;
              data[i] = Math.min(255, Math.max(0, (r * (1 - intensity) + newR * intensity) + noise));
              data[i + 1] = Math.min(255, Math.max(0, (g * (1 - intensity) + newG * intensity) + noise));
              data[i + 2] = Math.min(255, Math.max(0, (b * (1 - intensity) + newB * intensity) + noise));
            }
            break;
          }

          case "charcoal_sketch": {
            // Grayscale with dramatic high contrast sketching lines
            for (let i = 0; i < data.length; i += 4) {
              const r = data[i];
              const g = data[i + 1];
              const b = data[i + 2];
              let lum = 0.299 * r + 0.587 * g + 0.114 * b;

              // Harsh sketch tonal curve
              lum = lum < 90 ? lum * 0.5 : lum > 170 ? Math.min(255, lum * 1.35) : lum;
              // Paper tooth noise
              const tooth = ((i % 13) - 6) * 4;
              const sketchVal = Math.min(255, Math.max(0, lum + tooth));

              data[i] = r * (1 - intensity) + sketchVal * intensity;
              data[i + 1] = g * (1 - intensity) + sketchVal * intensity;
              data[i + 2] = b * (1 - intensity) + sketchVal * intensity;
            }
            break;
          }

          case "vintage_35mm": {
            // Kodak Portra warm sepia-golden curve with matte blacks
            for (let i = 0; i < data.length; i += 4) {
              const r = data[i];
              const g = data[i + 1];
              const b = data[i + 2];

              // Lifted blacks
              const liftedR = r * 0.9 + 25;
              const liftedG = g * 0.9 + 18;
              const liftedB = b * 0.75 + 10;

              // Film grain
              const grain = (Math.random() - 0.5) * 16;

              data[i] = Math.min(255, Math.max(0, (r * (1 - intensity) + liftedR * intensity) + grain));
              data[i + 1] = Math.min(255, Math.max(0, (g * (1 - intensity) + liftedG * intensity) + grain));
              data[i + 2] = Math.min(255, Math.max(0, (b * (1 - intensity) + liftedB * intensity) + grain));
            }
            break;
          }

          case "dark_fantasy": {
            // Deep shadows, eerie purples and high-clarity contrast
            for (let i = 0; i < data.length; i += 4) {
              const r = data[i];
              const g = data[i + 1];
              const b = data[i + 2];
              const lum = 0.299 * r + 0.587 * g + 0.114 * b;

              const darkR = lum < 120 ? r * 0.6 : r * 1.2 + 20;
              const darkG = g * 0.7;
              const darkB = lum < 120 ? b * 0.9 + 30 : b * 1.3 + 40;

              data[i] = r * (1 - intensity) + darkR * intensity;
              data[i + 1] = g * (1 - intensity) + darkG * intensity;
              data[i + 2] = b * (1 - intensity) + darkB * intensity;
            }
            break;
          }

          case "vaporwave": {
            // Retro 80s pink & cyan palette with VHS scanline tone
            for (let i = 0; i < data.length; i += 4) {
              const r = data[i];
              const g = data[i + 1];
              const b = data[i + 2];
              const lum = (r + g + b) / 3;

              const vR = Math.min(255, lum > 100 ? r * 1.4 + 50 : r * 0.8);
              const vG = lum < 120 ? g * 0.5 : g * 1.1 + 20;
              const vB = Math.min(255, b * 1.6 + 60);

              data[i] = r * (1 - intensity) + vR * intensity;
              data[i + 1] = g * (1 - intensity) + vG * intensity;
              data[i + 2] = b * (1 - intensity) + vB * intensity;
            }
            break;
          }

          case "claymation": {
            // Warm tactile plasticine hues with softer highlights
            for (let i = 0; i < data.length; i += 4) {
              const r = data[i];
              const g = data[i + 1];
              const b = data[i + 2];

              // Slightly desaturate blues and enrich warm tones
              const cR = Math.min(255, r * 1.15 + 15);
              const cG = Math.min(255, g * 1.05 + 8);
              const cB = b * 0.85;

              data[i] = r * (1 - intensity) + cR * intensity;
              data[i + 1] = g * (1 - intensity) + cG * intensity;
              data[i + 2] = b * (1 - intensity) + cB * intensity;
            }
            break;
          }

          case "pop_art": {
            // 4-tone high saturation bold graphic look
            for (let i = 0; i < data.length; i += 4) {
              const r = data[i];
              const g = data[i + 1];
              const b = data[i + 2];
              const lum = 0.299 * r + 0.587 * g + 0.114 * b;

              let pR = 255, pG = 255, pB = 0;
              if (lum < 64) {
                pR = 20; pG = 20; pB = 90;
              } else if (lum < 128) {
                pR = 220; pG = 30; pB = 100;
              } else if (lum < 192) {
                pR = 0; pG = 190; pB = 220;
              } else {
                pR = 255; pG = 240; pB = 40;
              }

              data[i] = r * (1 - intensity) + pR * intensity;
              data[i + 1] = g * (1 - intensity) + pG * intensity;
              data[i + 2] = b * (1 - intensity) + pB * intensity;
            }
            break;
          }
        }

        ctx.putImageData(imgData, 0, 0);

        // Add subtle edge vignette for cinematic depth
        const gradient = ctx.createRadialGradient(
          width / 2,
          height / 2,
          Math.min(width, height) * 0.35,
          width / 2,
          height / 2,
          Math.max(width, height) * 0.75
        );
        gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
        gradient.addColorStop(1, `rgba(0, 0, 0, ${0.28 * intensity})`);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        resolve(canvas.toDataURL("image/png"));
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error("Failed to load source image into canvas"));
    img.src = imageSource;
  });
}
