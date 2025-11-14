// Motor de Visualização
class VisualizationEngine {
  constructor(canvasId, audioProcessor) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext("2d");
    this.audioProcessor = audioProcessor; // Store audio processor reference
    this.visualizations = new Map();
    this.currentVisualization = null;
    this.animationId = null;
    this.isRunning = false;

    // Inicializar visualizações
    this.initVisualizations();

    // Configurar canvas responsivo
    this.resize();
  }

  initVisualizations() {
    // Inicializar tipos de visualização COM audioProcessor
    this.visualizations.set(
      "spectrum",
      new SpectrumVisualization(this.canvas, this.audioProcessor)
    );
    this.visualizations.set(
      "waveform",
      new WaveformVisualization(this.canvas, this.audioProcessor)
    );
    this.visualizations.set(
      "particles",
      new ParticleVisualization(this.canvas, this.audioProcessor)
    );

    // Definir visualização padrão
    this.currentVisualization = this.visualizations.get("spectrum");
  }

  setVisualization(type) {
    // Definir visualização atual
    if (this.visualizations.has(type)) {
      const wasRunning = this.isRunning;

      if (wasRunning) {
        this.stop();
      }

      this.currentVisualization = this.visualizations.get(type);
      this.currentVisualization.resize(this.canvas.width, this.canvas.height);

      if (wasRunning) {
        this.start();
      }

      console.log(`Visualização definida: ${type}`);
      return true;
    }

    console.warn(`Visualização não encontrada: ${type}`);
    return false;
  }

  start() {
    // Iniciar animação
    if (this.isRunning) return;

    this.isRunning = true;
    console.log("Iniciando motor de visualização...");

    const animate = () => {
      if (!this.isRunning) return;

      //update audio data BEFORE drawing
      if (this.audioProcessor) {
        this.audioProcessor.update();
      }

      if (this.currentVisualization) {
        this.currentVisualization.update();
        this.currentVisualization.draw();
      }

      this.animationId = requestAnimationFrame(animate);
    };

    animate();
  }

  stop() {
    // Parar animação
    if (!this.isRunning) return;

    this.isRunning = false;

    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    console.log("Motor de visualização parado");
  }

  resize() {
    // Redimensionar canvas
    const parent = this.canvas.parentElement;
    const width = parent?.clientWidth || window.innerWidth;
    const height = parent?.clientHeight || window.innerHeight;

    this.canvas.width = width;
    this.canvas.height = height;

    // Redimensionar todas as visualizações
    this.visualizations.forEach((viz) => {
      viz.resize(width, height);
    });
  }

  getVisualizationProperties() {
    // Obter propriedades da visualização atual
    if (this.currentVisualization) {
      return this.currentVisualization.getProperties();
    }
    return {};
  }

  updateVisualizationProperty(property, value) {
    // Atualizar propriedade da visualização
    if (this.currentVisualization) {
      this.currentVisualization.updateProperty(property, value);
      console.log(`Propriedade atualizada: ${property} = ${value}`);
    }
  }
}
