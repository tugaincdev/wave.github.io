// Processamento de Áudio
class AudioProcessor {
  constructor() {
    // Initialize AudioContext (with fallback for older browsers)
    this.audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();

    // Setup analyser and data arrays
    this.setupAnalyser();

    this.mediaStream = null; // Consistent naming for microphone stream
    this.source = null; // Track current source node
    this.isPlaying = false;
  }

  setupAnalyser() {
    this.analyser = this.audioContext.createAnalyser();

    // Configurações importantes
    this.analyser.fftSize = 2048; // Tamanho da FFT
    this.analyser.smoothingTimeConstant = 0.8; // Suavização
    this.analyser.minDecibels = -90;
    this.analyser.maxDecibels = -10;

    const bufferLength = this.analyser.frequencyBinCount; // 1024
    this.frequencyData = new Uint8Array(bufferLength);
    this.waveformData = new Uint8Array(bufferLength * 2); // Use full fftSize for waveform
  }

  async startMicrophone() {
    console.log("Iniciando captura do microfone...");

    try {
      // Ensure AudioContext is running (resume if suspended)
      if (this.audioContext.state === "suspended") {
        await this.audioContext.resume();
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1, // Mono para análise
        },
      });

      // Store stream for cleanup
      this.mediaStream = stream;

      // Connect stream to analyser
      this.connectSource(stream);

      this.isPlaying = true;
      console.log("Microfone iniciado com sucesso!");

      // Return the stream if needed
      return Promise.resolve(stream);
    } catch (error) {
      console.error("Erro ao iniciar microfone:", error);
      throw error;
    }
  }

  async loadAudioFile(file, options = { loop: true, autoPlay: true }) {
    console.log("=== LOADING AUDIO FILE ===");
    console.log("File:", file.name, "Size:", file.size, "Type:", file.type);

    // Step 1: Resume context (user gesture like file select should allow this)
    console.log("Context state before resume:", this.audioContext.state);
    if (this.audioContext.state === "suspended") {
      await this.audioContext.resume();
      console.log("Context resumed! New state:", this.audioContext.state);
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          console.log("File read as ArrayBuffer. Decoding...");
          const audioData = e.target.result;

          // Step 2: Decode
          const audioBuffer = await this.audioContext.decodeAudioData(
            audioData
          );
          console.log("DECODE SUCCESS!");
          console.log("- Buffer length (samples):", audioBuffer.length);
          console.log("- Duration (seconds):", audioBuffer.duration);
          console.log("- Channels:", audioBuffer.numberOfChannels);
          console.log("- Sample rate:", audioBuffer.sampleRate);

          if (audioBuffer.length === 0) {
            throw new Error("Decoded buffer is empty—no audio data!");
          }

          // Step 3: Create and configure source
          const source = this.audioContext.createBufferSource();
          source.buffer = audioBuffer;
          if (options.loop) {
            source.loop = true;
            console.log("Loop enabled.");
          }
          console.log("Source created. Buffer assigned.");

          // Step 4: Connect (routes to analyser -> speakers)
          this.connectSource(source);
          console.log("Source connected to analyser/destination.");

          // Step 5: Start playback
          if (options.autoPlay) {
            console.log("Starting playback at time 0...");
            source.start(0);
            console.log(
              "start() called. Context state now:",
              this.audioContext.state
            );
          } else {
            console.log("Auto-play disabled—call source.start() manually.");
          }

          this.isPlaying = true;
          console.log("=== LOAD COMPLETE: isPlaying =", this.isPlaying, "===");
          resolve({ source, buffer: audioBuffer }); // Return both for control
        } catch (error) {
          console.error("=== DECODE/PLAY ERROR ===", error);
          reject(error);
        }
      };
      reader.onerror = () => {
        const error = new Error(
          `File read failed: ${reader.error?.message || "Unknown error"}`
        );
        console.error("=== READER ERROR ===", error);
        reject(error);
      };
      reader.readAsArrayBuffer(file);
    });
  }

  stop() {
    // Parar processamento de áudio
    console.log("Parando processamento de áudio...");

    // Parar streams (microphone)
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    // Parar sources (buffer source has stop, media source does not - so check)
    if (this.source && typeof this.source.stop === "function") {
      this.source.stop();
    }

    // Disconnect everything
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    if (this.analyser) {
      this.analyser.disconnect();
    }

    // Suspender contexto (optional, for power saving)
    if (this.audioContext) {
      this.audioContext.suspend();
    }

    this.isPlaying = false;
  }

  update() {
    // Atualizar dados de áudio
    if (this.analyser && this.isPlaying) {
      // Dados de frequência (FFT)
      this.analyser.getByteFrequencyData(this.frequencyData);

      // Dados de waveform (domínio do tempo)
      this.analyser.getByteTimeDomainData(this.waveformData);
    }
  }

  getFrequencyData() {
    // Obter dados de frequência
    return this.frequencyData;
  }

  getWaveformData() {
    // Obter dados de forma de onda
    return this.waveformData;
  }

  calculateAudioLevel() {
    // Calcular nível de áudio (média RMS simples dos dados de frequência)
    if (!this.isPlaying || this.frequencyData.length === 0) {
      return 0;
    }

    let sum = 0;
    for (let i = 0; i < this.frequencyData.length; i++) {
      sum += this.frequencyData[i];
    }
    const average = sum / this.frequencyData.length;
    // Map to 0-1 range (normalized from 0-255)
    return average / 255;
  }

  connectSource(source) {
    // Limpar conexões anteriores
    if (this.source) {
      this.source.disconnect();
    }
    this.source = source;

    // Conectar source -> analyser -> destination
    if (source instanceof MediaStream) {
      const mediaSource = this.audioContext.createMediaStreamSource(source);
      mediaSource.connect(this.analyser);
      this.source = mediaSource;
    } else {
      source.connect(this.analyser);
      this.source = source;
    }

    // Conectar para output (opcional - para ouvir)
    this.analyser.connect(this.audioContext.destination);
  }
}

