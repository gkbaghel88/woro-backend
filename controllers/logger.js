const { createLogger, transports, format } = require("winston");

const newLog = createLogger({
  transports: [
    new transports.File({
      filename: "logs.log",
      level: "info",
      format: format.combine(format.timestamp(), format.json()),
    }),
  ],
});

module.exports = { newLog };
