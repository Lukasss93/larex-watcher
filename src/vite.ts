import path from 'path';
import type { UserConfig, ViteDevServer } from 'vite';
import fs from 'fs';
import { exec, execSync } from 'node:child_process';
import { styleText} from 'node:util';

interface PluginConfig {
    path: string;
    command: string;
    build: boolean;
    dev: boolean;
}

export default function larex(options?: PluginConfig) {
    const targetPath = options?.path || 'lang/localization.csv';
    const command = options?.command || 'composer run larex';
    const runOnBuild = options?.build || true;
    const runOnDev = options?.dev || true;

    let fileWatcher: fs.FSWatcher | null = null;
    let debounceTimer: NodeJS.Timeout | null = null;
    let isBuild = false;

    return {
        name: 'larex-watcher',
        config: (config: UserConfig, env: { mode: string; command: string }) => {
            isBuild = env.command === 'build';

            return {
                server: {
                    watch: {
                        ignored: [
                            '**/lang/**/*.php',
                            '**/resources/lang/**/*.php',
                            '**/' + targetPath,
                        ],
                    },
                },
            };
        },
        buildStart() {
            if (!isBuild || !runOnBuild) {
                return;
            }

            console.log(styleText(['bold', 'cyan'], '[larex] ') + styleText('yellow', 'Updating localization files...'));
            execSync(command);
            console.log(styleText(['bold', 'cyan'], '[larex] ') + styleText('green', 'Localization files updated successfully!'));
        },
        configureServer(server: ViteDevServer) {
            if(!runOnDev){
                return;
            }

            const targetFile = path.resolve(process.cwd(), targetPath);

            try {
                fileWatcher = fs.watch(targetFile, { persistent: true }, (eventType) => {
                    if (eventType !== 'change') {
                        return;
                    }

                    if (debounceTimer) {
                        clearTimeout(debounceTimer);
                    }

                    debounceTimer = setTimeout(() => {
                        console.log('');
                        console.log(styleText(['bold', 'cyan'], '[larex] ') + styleText('yellow', 'Updating localization files...'));

                        exec(command, (err, stdout, stderr) => {
                            if (err) {
                                console.error('Larex failed:', err, stderr);
                                return;
                            }

                            console.log(styleText(['bold', 'cyan'], '[larex] ') + styleText('green', 'Localization files updated successfully!'));
                            console.log('');

                            server.moduleGraph.invalidateAll();
                            server.ws.send({ type: 'full-reload' });
                        });
                    }, 200);
                });
            } catch (e) {
                console.error('Failed to watch localization file:', e);
            }

            server.httpServer?.once('close', () => {
                fileWatcher?.close();
            });
        },
    };
}