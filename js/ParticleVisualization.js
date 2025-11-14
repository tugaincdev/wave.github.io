class ParticleVisualization extends AudioVisualization {
  constructor(canvas, audioProcessor) {
    super(canvas, audioProcessor);
    this.name = "Particles";
    this.properties = {
      particleCount: 100,
      particleSize: 3,
    };
    this.particles = [];
    this.initParticles();
  }

  initParticles() {
    this.particles = [];
    for (let i = 0; i < this.properties.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
      });
    }
  }

  draw() {
    this.clearCanvas();
    const data = this.normalizeData();

    this.particles.forEach((p, i) => {
      const dataIndex = Math.floor((i * data.length) / this.particles.length);
      const energy = data[dataIndex];

      // Move particles based on audio energy
      p.x += p.vx * (1 + energy * 3);
      p.y += p.vy * (1 + energy * 3);

      // Wrap around edges
      if (p.x < 0) p.x = this.canvas.width;
      if (p.x > this.canvas.width) p.x = 0;
      if (p.y < 0) p.y = this.canvas.height;
      if (p.y > this.canvas.height) p.y = 0;

      //Glow effect
      this.ctx.shadowBlur = 20 * energy;
      this.ctx.shadowColor =
        i % 3 === 0 ? "#ff00ff" : i % 3 === 1 ? "#00ffff" : "#ffff00";

      //Bright colors
      const colors = ["#ff00ff", "#00ffff", "#ffff00", "#ff0080"];
      this.ctx.fillStyle = colors[i % colors.length];

      this.ctx.beginPath();
      const size = this.properties.particleSize * (1 + energy * 3);
      this.ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
      this.ctx.fill();
    });

    this.ctx.shadowBlur = 0;
  }
}
