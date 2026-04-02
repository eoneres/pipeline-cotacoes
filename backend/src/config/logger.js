// Sistema de logging centralizado
const logger = {
    info: (message, data = null) => {
        console.log(`[INFO] ${new Date().toISOString()} - ${message}`);
        if (data) console.log(data);
    },

    error: (message, error = null) => {
        console.error(`[ERROR] ${new Date().toISOString()} - ${message}`);
        if (error) console.error(error);
    },

    warn: (message, data = null) => {
        console.warn(`[WARN] ${new Date().toISOString()} - ${message}`);
        if (data) console.warn(data);
    },

    debug: (message, data = null) => {
        if (process.env.NODE_ENV === 'development') {
            console.debug(`[DEBUG] ${new Date().toISOString()} - ${message}`);
            if (data) console.debug(data);
        }
    }
};

module.exports = logger;