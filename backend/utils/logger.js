const levelNames = {
    info: 'INFO',
    warn: 'WARN',
    error: 'ERROR',
    success: 'DONE',
    http: 'HTTP',
};

const formatMessage = (label, message) =>
    `[${new Date().toISOString()}] ${label.padEnd(5)} :: ${message}`;

const buildLogger = (method, label) => (message, ...meta) => {
    const printer = console[method] || console.log;
    printer(formatMessage(levelNames[label] || label, message), ...meta);
};

module.exports = {
    info: buildLogger('log', 'info'),
    warn: buildLogger('warn', 'warn'),
    error: buildLogger('error', 'error'),
    success: buildLogger('log', 'success'),
    http: buildLogger('log', 'http'),
};
