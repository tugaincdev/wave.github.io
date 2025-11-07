// Processamento de Áudio
class AudioProcessor {
  constructor() {
    this.audioContext = null;
    this.analyser = null;
    this.mediaStream = null;
    this.frequencyData = new Uint8Array();
    this.waveformData = new Uint8Array();
    this.isPlaying = false;
  }

  async startMicrophone() {
    console.log("Iniciando captura do microfone...");
    // DONE?: iniciar captura do microfone
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        channelCount: 1, // Mono para análise
      },
    });

    //  Converter stream para source node
    const mediaSource = this.audioContext.createMediaStreamSource(stream);
    return mediaSource;
    // Devolver Promise
  }

  async loadAudioFile(file) {
    // DONE?: carregar ficheiro de áudio
    console.log("Carregando ficheiro de áudio...");
    const reader = new FileReader();
    reader.onload = async (e) => {
      const audioData = e.target.result;
      //  Descodificar para AudioBuffer
      const audioBuffer = await this.audioContext.decodeAudioData(audioData);

      //  Criar source a partir do buffer
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      return source;
    };
    reader.readAsArrayBuffer(file);
    // Devolver Promise
  }

  stop() {
    // DONE?: parar processamento de áudio
    console.log("Parando processamento de áudio...");

    //  Parar streams
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
    }

    //  Parar sources
    if (this.source && this.source.stop) {
      this.source.stop();
    }

    //  Suspender contexto
    if (this.audioContext) {
      this.audioContext.suspend();
    }
  }

  update() {
    // DONE?: atualizar dados de áudio

    //  Dados de frequência (FFT)
    this.analyser.getByteFrequencyData(this.frequencyData);

    //  Dados de waveform (domínio do tempo)
    this.analyser.getByteTimeDomainData(this.waveformData);
  }

  getFrequencyData() {
    // DONE?: obter dados de frequência
    return this.frequencyData;
  }

  getWaveformData() {
    // DONE?: obter dados de forma de onda
    return this.waveformData;
  }

  calculateAudioLevel() {
    // TODO: calcular nível de áudio
    return 0;
  }

  //novas dos pptx

  setupAnalyser() {
    this.analyser = this.audioContext.createAnalyser();

    //  Configurações importantes
    this.analyser.fftSize = 2048; // Tamanho da FFT
    this.analyser.smoothingTimeConstant = 0.8; //    Suavização
    this.analyser.minDecibels = -90;
    this.analyser.maxDecibels = -10;

    const bufferLength = this.analyser.frequencyBinCount; //    1024
    this.frequencyData = new Uint8Array(bufferLength);
    this.waveformData = new Uint8Array(bufferLength);
  }

  connectSource(source) {
    //  Limpar conexões anteriores
    if (this.source) {
      this.source.disconnect();
    }

    //  Conectar source -> analyser -> destination
    if (source instanceof MediaStream) {
      const mediaSource = this.audioContext.createMediaStreamSource(source);
      mediaSource.connect(this.analyser);
      this.source = mediaSource;
    } else {
      source.connect(this.analyser);
      this.source = source;
    }

    //  Conectar para output (opcional - para ouvir)
    this.analyser.connect(this.audioContext.destination);
  }
}
