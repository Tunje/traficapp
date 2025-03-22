## API Keys Setup

This application requires API keys for OpenWeather, Trafikverket and Google Maps services. To set up:

1. Copy [src/components/config.example.ts](src/components/config.example.ts) to `src/components/config.ts`. Alternately, you can create a `.env.local` file in your root directory.
2. Replace the placeholder values in `config.ts` with your actual API keys:
   - Get an OpenWeather API key from [OpenWeather](https://openweathermap.org/api)
   - Get a Google Maps API key from [Google Cloud Platform](https://console.cloud.google.com/)
   - Get a Trafikverket API key from [Trafiklab](https://www.trafiklab.se/api/trafiklab-apis/trafikverket/) or [Trafikverket](https://www.trafikverket.se/e-tjanster/trafikverkets-oppna-api-for-trafikinformation/)

Note: The `config.ts` file as well as .env files are gitignored to prevent exposing your API keys.

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ["./tsconfig.node.json", "./tsconfig.app.json"],
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    "react-x": reactX,
    "react-dom": reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs["recommended-typescript"].rules,
    ...reactDom.configs.recommended.rules,
  },
});
```
