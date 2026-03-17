const env = require('./env.config');
const prisma = require('./database');
const constants = require('./constants');

module.exports = {
  env,
  prisma,
  ...constants,
};
