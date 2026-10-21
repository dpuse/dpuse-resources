// ── External Dependencies & Registrations
import { dpuseESLintConfig } from '@dpuse/eslint-config-dpuse';
import globals from 'globals';

// ── ESLint Configuration ─────────────────────────────────────────────────────────────────────────────────────────────

/** @type {import('eslint').Linter.Config[]} */
const config = [
    ...dpuseESLintConfig({
        ignores: ['rust/**'],
        rules: {}
    }),
    // The plain JavaScript scripts run in Node, which the shared config does not say for '.js' files. Their unused
    // functions are kept for reference, so they warn rather than fail.
    {
        files: ['scripts/**/*.js'],
        languageOptions: { globals: globals.node },
        rules: { 'no-unused-vars': 'warn' }
    }
];

export default config;
