import { ObserverBundle } from "./ObserverBundle";

describe("ObserverBundle", () => {
  it("broadcasts 'next' to all bundled observers", async () => {
    // Arrange
    const observer1 = { next: jest.fn() };
    const observer2 = { next: jest.fn() };
    const bundle = new ObserverBundle();
    bundle.add(observer1);
    bundle.add(observer2);
    // Act
    bundle.next("value");
    // Assert
    expect(observer1.next).toHaveBeenCalledWith("value");
    expect(observer2.next).toHaveBeenCalledWith("value");
  });
  it("broadcasts 'error' to all bundled observers", async () => {
    // Arrange
    const observer1 = { error: jest.fn() };
    const observer2 = { error: jest.fn() };
    const bundle = new ObserverBundle();
    bundle.add(observer1);
    bundle.add(observer2);
    // Act
    bundle.error("error");
    // Assert
    expect(observer1.error).toHaveBeenCalledWith("error");
    expect(observer2.error).toHaveBeenCalledWith("error");
  });
  it("broadcasts 'complete' to all bundled observers", async () => {
    // Arrange
    const observer1 = { complete: jest.fn() };
    const observer2 = { complete: jest.fn() };
    const bundle = new ObserverBundle();
    bundle.add(observer1);
    bundle.add(observer2);
    // Act
    bundle.complete();
    // Assert
    expect(observer1.complete).toHaveBeenCalled();
    expect(observer2.complete).toHaveBeenCalled();
  });
  it("doesn't broadcast to observer that has been removed", async () => {
    // Arrange
    const observer = { next: jest.fn(), error: jest.fn(), complete: jest.fn() };
    const bundle = new ObserverBundle();
    bundle.add(observer);
    bundle.remove(observer);
    // Act
    bundle.next("value");
    bundle.next("error");
    bundle.complete();
    // Assert
    expect(observer.next).not.toHaveBeenCalledWith();
    expect(observer.error).not.toHaveBeenCalledWith();
    expect(observer.complete).not.toHaveBeenCalledWith();
  });
  it("removes all observers on clear", async () => {
    // Arrange
    const observer = { next: jest.fn(), error: jest.fn(), complete: jest.fn() };
    const bundle = new ObserverBundle();
    bundle.add(observer);
    bundle.clear();
    // Act
    bundle.next("value");
    bundle.next("error");
    bundle.complete();
    // Assert
    expect(observer.next).not.toHaveBeenCalledWith();
    expect(observer.error).not.toHaveBeenCalledWith();
    expect(observer.complete).not.toHaveBeenCalledWith();
  });
});
