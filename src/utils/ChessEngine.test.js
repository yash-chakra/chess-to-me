describe("IChessEngine (Abstract Base Class)", () => {
  let IChessEngine;

  beforeAll(async () => {
    const module = await import("./ChessEngine");
    IChessEngine = module.IChessEngine;
  });
  test("should throw TypeError when instantiated directly", () => {
    expect(() => {
      new IChessEngine("/path/to/engine");
    }).toThrow(TypeError);
  });

  test("should accept subclass instantiation", () => {
    class ConcreteEngine extends IChessEngine {
      async init() {}
      async analyze() {}
      async stop() {}
      async destroy() {}
      getStatus() {}
    }

    const engine = new ConcreteEngine("/path/to/engine");
    expect(engine).toBeInstanceOf(IChessEngine);
    expect(engine.path).toBe("/path/to/engine");
  });

  test("should require subclass to implement init()", async () => {
    class IncompleteEngine extends IChessEngine {}
    const engine = new IncompleteEngine("/path");

    await expect(engine.init()).rejects.toThrow("init() must be implemented by subclass");
  });

  test("should require subclass to implement analyze()", async () => {
    class IncompleteEngine extends IChessEngine {}
    const engine = new IncompleteEngine("/path");

    await expect(engine.analyze()).rejects.toThrow("analyze() must be implemented by subclass");
  });

  test("should require subclass to implement stop()", async () => {
    class IncompleteEngine extends IChessEngine {}
    const engine = new IncompleteEngine("/path");

    await expect(engine.stop()).rejects.toThrow("stop() must be implemented by subclass");
  });

  test("should require subclass to implement destroy()", async () => {
    class IncompleteEngine extends IChessEngine {}
    const engine = new IncompleteEngine("/path");

    await expect(engine.destroy()).rejects.toThrow("destroy() must be implemented by subclass");
  });

  test("should require subclass to implement getStatus()", () => {
    class IncompleteEngine extends IChessEngine {}
    const engine = new IncompleteEngine("/path");

    expect(() => engine.getStatus()).toThrow("getStatus() must be implemented by subclass");
  });

  test("should store engine path in constructor", () => {
    class ConcreteEngine extends IChessEngine {
      async init() {}
      async analyze() {}
      async stop() {}
      async destroy() {}
      getStatus() {}
    }

    const testPath = "/usr/local/bin/engine";
    const engine = new ConcreteEngine(testPath);

    expect(engine.path).toBe(testPath);
  });

  test("should initialize process to null", () => {
    class ConcreteEngine extends IChessEngine {
      async init() {}
      async analyze() {}
      async stop() {}
      async destroy() {}
      getStatus() {}
    }

    const engine = new ConcreteEngine("/path");
    expect(engine.process).toBeNull();
  });
});
