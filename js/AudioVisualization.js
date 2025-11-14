// Classe Abstrata Base para Visualizações
class AudioVisualization {
  constructor(canvas, audioProcessor) {
    if (this.constructor === AudioVisualization) {
      throw new Error(
        "AudioVisualization é uma classe abstrata e não pode ser instanciada diretamente."
      );
    }

    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.audioProcessor = audioProcessor;
    this.name = "Visualização";
    this.properties = {};
    this.testData = new Uint8Array(256);
    this.frameCount = 0;

    // Inicializar dados de teste com padrão animado
    for (let i = 0; i < this.testData.length; i++) {
      this.testData[i] = Math.sin(i / 10) * 128 + 128;
    }
  }

  draw() {
    throw new Error("Método draw() deve ser implementado pela subclasse.");
  }

  update() {
    // Atualizar estado da visualização
    this.frameCount++;

    // dados de teste com animação APENAS se não houver audioProcessor
    if (!this.audioProcessor) {
      for (let i = 0; i < this.testData.length; i++) {
        this.testData[i] = Math.sin(i / 10 + this.frameCount / 20) * 100 + 128;
      }
    }
  }

  resize(width, height) {
    // Redimensionar visualização
    this.canvas.width = width;
    this.canvas.height = height;
  }

  getProperties() {
    // Obter propriedades da visualização
    return { ...this.properties };
  }

  updateProperty(property, value) {
    // Atualizar propriedade
    if (this.properties.hasOwnProperty(property)) {
      this.properties[property] = value;
      return true;
    }
    return false;
  }

  clearCanvas() {
    // Limpar canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawGrid() {
    // Desenhar grelha de fundo
    const { width, height } = this.canvas;
    const gridSize = 50;

    this.ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    this.ctx.lineWidth = 1;

    // Linhas verticais
    for (let x = 0; x < width; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, height);
      this.ctx.stroke();
    }

    // Linhas horizontais
    for (let y = 0; y < height; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(width, y);
      this.ctx.stroke();
    }
  }

  createGradient() {
    //gradiente de cores BRILHANTES
    const gradient = this.ctx.createLinearGradient(0, this.canvas.height, 0, 0);

    gradient.addColorStop(0, "#00ffff"); // Ciano brilhante
    gradient.addColorStop(0.33, "#ff00ff"); // Magenta brilhante
    gradient.addColorStop(0.66, "#ffff00"); // Amarelo brilhante
    gradient.addColorStop(1, "#ff0080"); // Rosa brilhante

    return gradient;
  }

  normalizeData() {
    
    let data;

    
    if (this.audioProcessor && this.audioProcessor.getFrequencyData) {
      data = this.audioProcessor.getFrequencyData();
    } else {
      data = this.testData;
    }

    //valores para range 0-1
    const normalized = Array.from(data).map((value) => value / 255);

    return normalized;
  }
}
