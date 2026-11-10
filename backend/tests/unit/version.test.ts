describe("readAppVersion", () => {
  afterEach(() => {
    jest.resetModules();
    jest.dontMock("node:fs");
  });

  it("lit la version de package.json", () => {
    jest.isolateModules(() => {
      const { readAppVersion } = require("../../src/config/version");
      expect(readAppVersion()).toBe(require("../../package.json").version);
    });
  });

  it("retourne 'unknown' si package.json est illisible", () => {
    jest.isolateModules(() => {
      jest.doMock("node:fs", () => ({
        readFileSync: () => {
          throw new Error("introuvable");
        },
      }));
      const { readAppVersion } = require("../../src/config/version");
      expect(readAppVersion()).toBe("unknown");
    });
  });

  it("retourne 'unknown' si package.json n'a pas de champ version", () => {
    jest.isolateModules(() => {
      jest.doMock("node:fs", () => ({ readFileSync: () => "{}" }));
      const { readAppVersion } = require("../../src/config/version");
      expect(readAppVersion()).toBe("unknown");
    });
  });
});
