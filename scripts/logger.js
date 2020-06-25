export class Logger {
    static info(...args) {
        console.log("Token Action HUD |", ...args)
    }

    static error(...args) {
        console.error("Token Action HUD |", ...args)
    }

    static debug(...args) {
        if (game.settings.get('token-action-hud', 'debug'))
            Logger.info("debug:", ...args);
    }
}