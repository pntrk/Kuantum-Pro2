import { Worker } from 'worker_threads';
const worker = new Worker('./dist/assets/quantum-*.js', { type: 'module' }); // Oh wait, vite compiles the worker.
