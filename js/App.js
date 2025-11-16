class App {
  constructor() {
    this.audioProcessor = new AudioProcessor();
    this.visualizationEngine = new VisualizationEngine(
      "audioCanvas",
      this.audioProcessor
    ); // Add audioProcessor here!
    this.uiManager = new UIManager(this);
    this.exportManager = new ExportManager(this.visualizationEngine);

    // Inicialização
    this.init();
  }

  init() {
    // TODO: inicializar a aplicação
    console.log("App inicializada");
    this.uiManager.updatePropertiesPanel();
  }

  async startMicrophone() {
    console.log("Iniciando microfone...");

    try {
      // Parar qualquer áudio anterior
      this.stopAudio();

      // Iniciar captura do microfone
      await this.audioProcessor.startMicrophone();

      // Atualizar UI
      this.uiManager.setButtonStates(true);
      this.uiManager.updateAudioInfo({ status: "Microfone ativo", level: 0 });

      // Iniciar visualização
      if (!this.visualizationEngine.isRunning) {
        this.visualizationEngine.start();
      }

      this.isRunning = true;

      // Iniciar monitorização de níveis
      this.startAudioLevelMonitoring();
    } catch (error) {
      console.error("Erro ao iniciar microfone:", error);
      this.uiManager.showError(`Erro ao acessar microfone: ${error.message}`);
      this.uiManager.setButtonStates(false);
    }
  }
  async loadAudioFile(file) {
    console.log("Carregando ficheiro de áudio:", file.name);

    try {
      this.stopAudio();

      await this.audioProcessor.loadAudioFile(file);

      this.uiManager.setButtonStates(true);
      this.uiManager.updateAudioInfo({
        status: `Reproduzindo: ${file.name}`,
        level: 0,
      });

      // Iniciar visualização
      if (!this.visualizationEngine.isRunning) {
        this.visualizationEngine.start();
      }

      this.isRunning = true;

      // Iniciar monitorização de níveis
      this.startAudioLevelMonitoring();
    } catch (error) {
      console.error("Erro ao carregar ficheiro:", error);
      this.uiManager.showError(`Erro ao carregar ficheiro: ${error.message}`);
      this.uiManager.setButtonStates(false);
    }
  }

  stopAudio() {
    console.log("Parando áudio...");

    // Parar processamento de áudio
    this.audioProcessor.stop();

    // Parar monitorização de níveis
    if (this.audioLevelInterval) {
      clearInterval(this.audioLevelInterval);
      this.audioLevelInterval = null;
    }

    // Atualizar UI
    this.uiManager.setButtonStates(false);
    this.uiManager.updateAudioInfo({ status: "Parado", level: 0 });

    this.isRunning = false;
  }

  setVisualization(type) {
  console.log(`Definindo visualização: ${type}`);

  const success = this.visualizationEngine.setVisualization(type);

  if (success) {
    
    this.uiManager.updatePropertiesPanel();
  } else {
    this.uiManager.showError(`Tipo de visualização inválido: ${type}`);
  }

  return success;
}

  exportFrame() {
    console.log("Exportando frame...");
    this.exportManager.exportAsPNG();
  }

  startAudioLevelMonitoring() {
    // Limpar intervalo anterior se existir
    if (this.audioLevelInterval) {
      clearInterval(this.audioLevelInterval);
    }

    // Atualizar nível de áudio a cada 100ms
    this.audioLevelInterval = setInterval(() => {
      if (this.isRunning && this.audioProcessor.isPlaying) {
        const level = this.audioProcessor.calculateAudioLevel();
        this.uiManager.updateAudioInfo({
          status: this.audioProcessor.mediaStream
            ? "Microfone ativo"
            : "Reproduzindo",
          level: Math.round(level * 100),
        });
      }
    }, 100);
  }

  destroy() {
    console.log("Destruindo aplicação...");

    // Parar áudio
    this.stopAudio();

    // Parar visualização
    this.visualizationEngine.stop();

    // Limpar listeners
    window.removeEventListener("resize", this.visualizationEngine.resize);

    // Limpar referências
    this.audioProcessor = null;
    this.visualizationEngine = null;
    this.uiManager = null;
    this.exportManager = null;
  }
}
