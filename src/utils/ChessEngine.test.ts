import { IChessEngine } from "./ChessEngine";

describe("IChessEngine (Abstract Base Class)", () => {
  let IChessEngineClass: typeof IChessEngine;

  beforeAll(async () => {
    const module = await import("./ChessEngine");
    IChessEngineClass = module.IChessEngine;
  });

  test("should throw TypeError when instantiated directly", () => {
    expect(() => {
      // @ts-expect-error - Testing direct instantiation of abstract class
      new IChessEngineClass("/path/to/engine");
    }).toThrow(TypeError);
  });

  test("should accept subclass instantiation", () => {
    class ConcreteEngine extends IChessEngine {
      async init(): Promise<void> {}
      async analyze(): Promise<any> {
        return {};
      }
      async stop(): Promise<void> {}
      async destroy(): Promise<void> {}
      getStatus(): unknown {
        return {};
      }
    }

    const engine = new ConcreteEngine("/path/to/engine");
    expect(engine).toBeInstanceOf(IChessEngine);
    expect(engine.path).toBe("/path/to/engine");
  });

  test("should require subclass to implement init()", async () => {
    // @ts-expect-error - Testing incomplete implementation
    class IncompleteEngine extends IChessEngine {}
    const engine = new IncompleteEngine("/path") as any;

    await expect(engine.init()).rejects.toThrow("init() must be implemented by subclass");
  });

  test("should require subclass to implement analyze()", async () => {
    // @ts-expect-error - Testing incomplete implementation
    class IncompleteEngine extends IChessEngine {}
    const engine = new IncompleteEngine("/path") as any;

    await expect(engine.analyze("start")).rejects.toThrow("analyze() must be implemented by subclass");
  });

  test("should require subclass to implement stop()", async () => {
    // @ts-expect-error - Testing incomplete implementation
    class IncompleteEngine extends IChessEngine {}
    const engine = new IncompleteEngine("/path") as any;

    await expect(engine.stop()).rejects.toThrow("stop() must be implemented by subclass");
  });

  test("should require subclass to implement destroy()", async () => {
    // @ts-expect-error - Testing incomplete implementation
    class IncompleteEngine extends IChessEngine {}
    const engine = new IncompleteEngine("/path") as any;

    await expect(engine.destroy()).rejects.toThrow("destroy() must be implemented by subclass");
  });

  test("should require subclass to implement getStatus()", () => {
    // @ts-expect-error - Testing incomplete implementation
    class IncompleteEngine extends IChessEngine {}
    const engine = new IncompleteEngine("/path") as any;

    expect(() => engine.getStatus()).toThrow("getStatus() must be implemented by subclass");
  });

  test("should store engine path in constructor", () => {
    class ConcreteEngine extends IChessEngine {
      async init(): Promise<void> {}
      async analyze(): Promise<any> {
        return {};
      }
      async stop(): Promise<void> {}
      async destroy(): Promise<void> {}
      getStatus(): unknown {
        return {};
      }
    }

    const testPath = "/usr/local/bin/engine";
    const engine = new ConcreteEngine(testPath);

    expect(engine.path).toBe(testPath);
  });

  test("should initialize process to null", () => {
    class ConcreteEngine extends IChessEngine {
      async init(): Promise<void> {}
      async analyze(): Promise<any> {
        return {};
      }
      async stop(): Promise<void> {}
      async destroy(): Promise<void> {}
      getStatus(): unknown {
        return {};
      }
    }

    const engine = new ConcreteEngine("/path");
    expect(engine.process).toBeNull();
  });
});
