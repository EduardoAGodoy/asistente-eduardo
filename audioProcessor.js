
/**
 * AudioWorkletProcessor para capturar y enviar audio en tiempo real.
 * Este procesador se ejecuta en un hilo separado del hilo principal de la UI,
 * lo que previene bloqueos y reduce la latencia.
 */
class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    // Tamaño del búfer de audio antes de enviarlo al hilo principal.
    // 1024 muestras a 16000Hz = 64ms de audio por paquete.
    // Un buen equilibrio entre latencia y eficiencia de la red.
    this.bufferSize = 1024;
    this.buffer = new Float32Array(this.bufferSize);
    this.bufferIndex = 0;
  }

  /**
   * Se llama cada vez que hay un nuevo bloque de datos de audio disponible (generalmente 128 muestras).
   * @param {Float32Array[][]} inputs - Array de entradas de audio.
   */
  process(inputs) {
    const input = inputs[0];
    // Asegurarse de que hay un canal de audio de entrada.
    if (input && input.length > 0) {
      const inputChannel = input[0];
      
      // Llenar nuestro búfer personalizado con los datos entrantes.
      for (let i = 0; i < inputChannel.length; i++) {
        this.buffer[this.bufferIndex++] = inputChannel[i];
        
        // Una vez que el búfer está lleno, se envía al hilo principal.
        if (this.bufferIndex === this.bufferSize) {
          this.port.postMessage(this.buffer);
          this.bufferIndex = 0; // Reiniciar el índice para el siguiente paquete.
        }
      }
    }
    // Devolver true para mantener vivo el procesador.
    return true;
  }
}

// Registrar el procesador para que pueda ser instanciado desde el hilo principal.
registerProcessor('audio-processor', AudioProcessor);
