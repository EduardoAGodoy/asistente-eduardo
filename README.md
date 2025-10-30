# Asistente Personal IA "Claudia"

Un asistente personal de IA con voz en tiempo real, integrado con los servicios de Google para gestionar correos, calendario, archivos y más, mientras ofrece asistencia contextual y organizada para proyectos personales y de trabajo.

## ✨ Características Principales

-   **Conversación en Tiempo Real:** Habla con Claudia de forma natural gracias al streaming de audio bidireccional de baja latencia.
-   **Transcripción Instantánea:** Visualiza la conversación (tanto tu voz como la de Claudia) transcrita en tiempo real.
-   **Respuesta por Voz:** Claudia responde con una voz natural generada por la API de Gemini.
-   **Gestión de Proyectos:** Un panel lateral para visualizar y organizar tus proyectos (actualmente con datos de demostración).
-   **Capacidad de Herramientas (Function Calling):** Diseñado para interactuar con sistemas externos, como realizar búsquedas web.
-   **Diseño Moderno y Responsivo:** Interfaz limpia y agradable construida con React y Tailwind CSS.

## 🛠️ Tecnologías Utilizadas

-   **Frontend:** [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
-   **Estilos:** [Tailwind CSS](https://tailwindcss.com/)
-   **IA y Voz:** [Google Gemini API (Live API)](https://ai.google.dev/docs/gemini_api_overview)
-   **Procesamiento de Audio:** [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) (específicamente `AudioContext` y `AudioWorklet` para un rendimiento óptimo).

## 📂 Estructura del Proyecto

El proyecto está organizado para mantener una clara separación de responsabilidades:

```
/
├── src/
│   ├── components/       # Componentes de React reutilizables (UI)
│   ├── services/         # Lógica de negocio y comunicación con APIs
│   ├── types.ts          # Definiciones de tipos de TypeScript
│   ├── App.tsx           # Componente principal de la aplicación
│   └── index.tsx         # Punto de entrada de React
├── .env                  # (Necesitas crearlo) Variables de entorno
├── index.html            # HTML principal
└── package.json
```

## 🚀 Cómo Empezar

Sigue estos pasos para configurar y ejecutar el proyecto en tu máquina local.

### Prerrequisitos

-   Node.js (versión 18 o superior recomendada)
-   npm, yarn, o pnpm

### Configuración

1.  **Clona el repositorio:**
    ```bash
    git clone https://github.com/tu-usuario/asistente-claudia.git
    cd asistente-claudia
    ```

2.  **Instala las dependencias:**
    ```bash
    npm install
    ```

3.  **Configura tu Clave de API de Gemini:**
    -   Obtén tu clave de API desde [Google AI Studio](https://aistudio.google.com/app/apikey).
    -   Crea un archivo llamado `.env` en la raíz del proyecto.
    -   Añade tu clave de API al archivo `.env` de la siguiente manera:

    ```
    API_KEY=TU_API_KEY_DE_GEMINI_AQUI
    ```
    > **Importante:** La aplicación carga la clave desde `process.env.API_KEY`. Sin este paso, la aplicación mostrará un error.

### Ejecutar la Aplicación

Una vez configurado, inicia el servidor de desarrollo:

```bash
npm start
```

Abre tu navegador a la URL proporcionada por tu terminal. Deberás conceder permisos de micrófono cuando el navegador te lo solicite.

## ⚙️ ¿Cómo Funciona?

1.  **Captura de Audio:** Al hacer clic en el botón del micrófono, la aplicación utiliza la **Web Audio API** para capturar el audio. Un `AudioWorklet` se encarga de procesar este audio en un hilo separado para no bloquear la interfaz, empaquetándolo en fragmentos de 16 bits PCM.
2.  **Streaming a Gemini:** Estos fragmentos de audio se envían en tiempo real a la **API Live de Gemini** a través de una conexión WebSocket gestionada por el SDK `@google/genai`.
3.  **Procesamiento en la Nube:** Gemini procesa el audio, realiza la transcripción de voz a texto (STT) y genera una respuesta. Al mismo tiempo, devuelve la transcripción en tiempo real.
4.  **Respuesta de Gemini:** La respuesta de la IA se devuelve como fragmentos de audio (TTS) y su correspondiente transcripción.
5.  **Reproducción y Visualización:** La aplicación recibe los datos:
    -   Las transcripciones (tanto del usuario como del bot) se muestran en la interfaz.
    -   Los fragmentos de audio de la respuesta se decodifican y se reproducen secuencialmente usando `AudioContext`, asegurando una reproducción fluida y sin interrupciones.

## 🔮 Mejoras Futuras

-   [ ] **Guardar Conversaciones:** Implementar la lógica para guardar las interacciones en el almacenamiento local o en una base de datos.
-   [ ] **Integración Real de Herramientas:** Conectar las `function calls` a APIs reales (búsqueda de Google, calendario, etc.) en lugar de usar datos simulados.
-   [ ] **Autenticación con Google:** Implementar un flujo de OAuth 2.0 para un acceso seguro a los datos del usuario (usando el componente `AuthScreen.tsx` existente).
-   [ ] **Gestión de Proyectos Completa:** Implementar la funcionalidad de crear, editar, eliminar, importar y exportar proyectos.
