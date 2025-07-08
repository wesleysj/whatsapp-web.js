module.exports = {
  createReadStream: require('fs').createReadStream,
  createWriteStream: require('fs').createWriteStream,
  copy: async () => {},
  mkdirSync: () => {},
  promises: {
    rm: async () => {},
    unlink: async () => {},
    readdir: async () => [],
    lstat: async () => ({ isDirectory: () => false }),
    access: async () => {},
    mkdir: async () => {},
  },
};
