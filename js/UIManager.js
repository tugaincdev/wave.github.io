// Gestão de UI
class UIManager {
  constructor(app) {
    this.app = app;
    this.visualizationEngine = app.visualizationEngine;
    this.audioProcessor = app.audioProcessor;

    
    this.setupEventListeners();
  }

  updatePropertiesPanel() {
    const container = document.getElementById("properties-container");
    if (!container) {
      console.warn("Container de propriedades não encontrado!");
      return;
    }

    //limpa as propriedades anteriores
    container.innerHTML = "";

    //obter props da visualização atual
    const props = this.visualizationEngine.getVisualizationProperties();

    if (Object.keys(props).length === 0) {
      container.innerHTML =
        '<p style="color: #888; font-style: italic;">Nenhuma propriedade disponível</p>';
      return;
    }

    //controlos para cada propriedade
    Object.entries(props).forEach(([key, value]) => {
      //ranges
      let min = 0,
        max = 10,
        step = 0.1;

      if (key === "barWidth") {
        min = 1;
        max = 20;
        step = 1;
      } else if (key === "barSpacing") {
        min = 0;
        max = 10;
        step = 1;
      } else if (key === "smoothing") {
        min = 0;
        max = 1;
        step = 0.05;
      } else if (key === "lineWidth") {
        min = 1;
        max = 10;
        step = 0.5;
      } else if (key === "amplitude") {
        min = 0.1;
        max = 3;
        step = 0.1;
      } else if (key === "particleCount") {
        min = 10;
        max = 500;
        step = 10;
      } else if (key === "particleSize") {
        min = 1;
        max = 10;
        step = 0.5;
      }

      const control = this.createPropertyControl(key, value, min, max, step);
      container.appendChild(control);
    });

    console.log("Painel de propriedades atualizado!");
  }

  updateAudioInfo(info, isError = false) {
    const audioStatus = document.getElementById("audioStatus");
    const audioLevel = document.getElementById("audioLevel");

    if (!audioStatus || !audioLevel) {
      console.warn("Elementos de info de áudio não encontrados!");
      return;
    }

    if (isError) {
      audioStatus.textContent = `Erro: ${info}`;
      audioStatus.style.color = "#f72585";
      audioLevel.textContent = "Nível: 0%";
    } else {
      audioStatus.textContent = `Áudio: ${info.status || "Ativo"}`;
      audioStatus.style.color = "#e6e6e6";
      audioLevel.textContent = `Nível: ${info.level || 0}%`;
    }
  }

  setButtonStates(playing) {
    const startMicBtn = document.getElementById("startMic");
    const stopAudioBtn = document.getElementById("stopAudio");

    if (startMicBtn) startMicBtn.disabled = playing;
    if (stopAudioBtn) stopAudioBtn.disabled = !playing;
  }

  showError(message) {
    const errorModal = document.getElementById("errorModal");
    const errorMessage = document.getElementById("errorMessage");

    if (!errorModal || !errorMessage) {
      console.error("Modal de erro não encontrado!");
      alert(message); // Fallback
      return;
    }

    errorMessage.textContent = message;
    errorModal.classList.remove("hidden");

    //dechar ao clicar no x
    const closeBtn = document.querySelector(".close");
    if (closeBtn) {
      closeBtn.onclick = () => {
        errorModal.classList.add("hidden");
      };
    }

    //fechar ao clicar fora
    window.onclick = (event) => {
      if (event.target === errorModal) {
        errorModal.classList.add("hidden");
      }
    };
  }

  setupEventListeners() {
    //Botao de microfone
    const startMicBtn = document.getElementById("startMic");
    if (startMicBtn) {
      startMicBtn.addEventListener("click", () => {
        this.app.startMicrophone();
      });
    }

    // Botao de parar
    const stopAudioBtn = document.getElementById("stopAudio");
    if (stopAudioBtn) {
      stopAudioBtn.addEventListener("click", () => {
        this.app.stopAudio();
      });
    }

    // Input de ficheiro
    const audioFileInput = document.getElementById("audioFile");
    if (audioFileInput) {
      audioFileInput.addEventListener("change", (e) => {
        if (e.target.files.length > 0) {
          this.app.loadAudioFile(e.target.files[0]);
        }
      });
    }

    // Seletor de visualizaçao
    const vizTypeSelect = document.getElementById("visualizationType");
    if (vizTypeSelect) {
      vizTypeSelect.addEventListener("change", (e) => {
        this.app.setVisualization(e.target.value);
      });
    }

    // Botões de exportaçao
    const exportPNGBtn = document.getElementById("exportPNG");
    if (exportPNGBtn) {
      exportPNGBtn.addEventListener("click", () => {
        this.app.exportManager.exportAsPNG();
      });
    }

    const exportJPEGBtn = document.getElementById("exportJPEG");
    if (exportJPEGBtn) {
      exportJPEGBtn.addEventListener("click", () => {
        this.app.exportManager.exportAsJPEG(0.9);
      });
    }

    console.log("Event listeners configurados!");
  }


  createPropertyControl(property, value, min, max, step) {
    const container = document.createElement("div");
    container.className = "property-control";

    // Label formatado (converte camelCase para espaços)
    const label = document.createElement("label");
    const formattedName = property.replace(/([A-Z])/g, " $1").trim();
    label.textContent =
      formattedName.charAt(0).toUpperCase() + formattedName.slice(1);
    label.htmlFor = `prop-${property}`;

    //Input range
    const input = document.createElement("input");
    input.type = "range";
    input.id = `prop-${property}`;
    input.min = min;
    input.max = max;
    input.step = step;
    input.value = value;

    //Display do valor atual
    const valueDisplay = document.createElement("span");
    valueDisplay.className = "property-value";
    valueDisplay.textContent = Number(value).toFixed(step < 1 ? 2 : 0);

    //Event listener para atualizar valor
    input.addEventListener("input", (e) => {
      const newValue = parseFloat(e.target.value);
      valueDisplay.textContent = newValue.toFixed(step < 1 ? 2 : 0);
      this.visualizationEngine.updateVisualizationProperty(property, newValue);
    });

    container.appendChild(label);
    container.appendChild(input);
    container.appendChild(valueDisplay);

    return container;
  }
}
