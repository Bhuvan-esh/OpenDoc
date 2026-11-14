# OpenDocs Voice

## Run the frontend

From the repository root:

```sh
npm install
npm run dev
```

Create a production build with `npm run build`.

## Code explanation

Open **Code Explanation** from the navigation or choose **Explain code** in the Code Playground. The current explanation service is a clearly labeled local demo: it uses simple source-code patterns and does not send code to an AI provider or execute it.

To connect a real AI provider later, add a server or serverless endpoint that holds the provider credential and update `frontend/src/services/codeExplanationService.js` to call it. Do not put private AI credentials in frontend code or `VITE_` environment variables.

## Error diagnosis

The Error to Documentation page runs locally. It gives focused guidance for common error families and general triage for other messages; it does not inspect project files or runtime state. More accurate explanations for arbitrary errors require an AI provider behind a backend or serverless proxy. Keep provider credentials on that server, not in frontend code or `VITE_` variables.