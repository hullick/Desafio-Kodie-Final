import { defineConfig } from 'vitest/config';

// Testes das functions (integração contra o Postgres e o Mailpit do compose).
// Rodar dentro do container app: docker compose exec app npm test
export default defineConfig({
  test: {
    include: ['netlify/**/*.spec.ts'],
    setupFiles: ['netlify/testes/ambiente.ts'],
    fileParallelism: false,
    testTimeout: 20_000,
    hookTimeout: 30_000,
  },
});
