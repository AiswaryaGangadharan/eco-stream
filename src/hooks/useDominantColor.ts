import { useState, useEffect } from "react";

export function useDominantColor(imageUrl: string | null) {
  const [color, setColor] = useState("rgb(15, 15, 15)");

  useEffect(() => {
    if (!imageUrl) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 10;
      canvas.height = 10;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(img, 0, 0, 10, 10);

      const data = ctx.getImageData(0, 0, 10, 10).data;

      let r = 0, g = 0, b = 0;
      const total = 100;

      for (let i = 0; i < data.length; i += 4) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
      }

      const darken = 0.4;
      setColor(
        `rgb(${Math.floor((r / total) * darken)}, ${Math.floor((g / total) * darken)}, ${Math.floor((b / total) * darken)})`
      );
    };

    img.onerror = () => setColor("rgb(15, 15, 15)");
  }, [imageUrl]);

  return color;
}
