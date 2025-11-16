class SpectrumVisualization extends AudioVisualization {
  constructor(canvas, audioProcessor) {
    super(canvas, audioProcessor);
    this.name = "Spectrum";
    this.properties = {
      barWidth: 4,
      barSpacing: 2,
    };
  }

  draw() {
    this.clearCanvas();
    const data = this.normalizeData();
    const { width, height } = this.canvas;
    const { barWidth, barSpacing } = this.properties;

    const totalBarWidth = barWidth + barSpacing;
    const numBars = Math.floor(width / totalBarWidth);

    const gradient = this.createGradient();

    // Add glow effect
    this.ctx.shadowBlur = 20;
    this.ctx.shadowColor = "#ff00ff";

    for (let i = 0; i < numBars && i < data.length; i++) {
      //data aimplified
      const barHeight = Math.pow(data[i], 0.7) * height * 0.9;
      const x = i * totalBarWidth;
      const y = height - barHeight;

      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(x, y, barWidth, barHeight);
    }

    this.ctx.shadowBlur = 0;
  }
}

