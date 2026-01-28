import React, { useEffect, useRef } from "react";
import WordCloud from "wordcloud";

const WordCloudCanvas = ({ words = [], height = "100%" }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const list = (words || [])
      .filter((w) => w?.text && Number(w.value) > 0)
      .map((w) => [String(w.text), Number(w.value)]);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (list.length === 0) return;

    WordCloud(canvas, {
      list,
      gridSize: 8,
      weightFactor: (size) => 12 + size * 14, 
      fontFamily: "Arial, sans-serif",
      color: "random-dark",
      backgroundColor: "#ffffff",
      rotateRatio: 0, 
      rotationSteps: 1,
      shuffle: true,
      drawOutOfBound: false,
      shrinkToFit: true,
    });
  }, [words, height]);

  return (
    <div style={{ width: "100%", height }}>
      <canvas
        ref={canvasRef}
        width={900}
        height={height * 2}
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 8,
        }}
      />
    </div>
  );
};

export default WordCloudCanvas;
