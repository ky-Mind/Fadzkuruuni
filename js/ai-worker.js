/* js/ai-worker.js - Menjalankan AI offline (WebLLM) di Web Worker, terpisah dari tampilan,
   agar animasi dan gulir aplikasi tetap lancar saat AI mengunduh, memuat, atau menjawab. Dipakai oleh js/pages/ai.js. */
import { WebWorkerMLCEngineHandler } from 'https://cdn.jsdelivr.net/npm/@mlc-ai/web-llm@0.2.85/+esm';
const handler = new WebWorkerMLCEngineHandler();
self.onmessage = (m) => handler.onmessage(m);
