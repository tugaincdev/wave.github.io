class WaveformVisualization extends AudioVisualization {
  constructor(canvas, audioProcessor) {
    super(canvas, audioProcessor);
    this.name = "Waveform";
    this.properties = {
      lineWidth: 3,
      amplitude: 1.0,
    };
  }

  normalizeData() {
    
    let data;

    if (this.audioProcessor && this.audioProcessor.getWaveformData) {
      data = this.audioProcessor.getWaveformData();
    } else {
      data = this.testData;
    }

    return Array.from(data).map((value) => value / 255);
  }

  draw() {
    this.clearCanvas();
    const data = this.normalizeData();
    const { width, height } = this.canvas;
    const { lineWidth, amplitude } = this.properties;

    //glow effect
    this.ctx.shadowBlur = 15;
    this.ctx.shadowColor = "#00ffff";
    this.ctx.strokeStyle = this.createGradient();
    this.ctx.lineWidth = lineWidth;
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";
    this.ctx.beginPath();

    const sliceWidth = width / data.length;

    for (let i = 0; i < data.length; i++) {
      const x = i * sliceWidth;
      // Amplify waveform
      const v = (data[i] - 0.5) * amplitude * 1.5;
      const y = height / 2 + (v * height) / 2;

      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }

    this.ctx.stroke();
    this.ctx.shadowBlur = 0;
  }
}
