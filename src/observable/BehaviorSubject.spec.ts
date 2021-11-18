import { BehaviorSubject } from "./BehaviorSubject";

describe("BehaviorSubject", () => {
  it("transmits observed values to subscribers", async () => {
    // Arrange
    const observer = { next: jest.fn() };
    const subject = new BehaviorSubject("start");
    subject.subscribe(observer);
    // Act
    subject.next("next");
    // Assert
    expect(observer.next).toHaveBeenCalledWith("next");
  });
  it("transmits observed errors to subscribers", async () => {
    // Arrange
    const observer = { error: jest.fn() };
    const subject = new BehaviorSubject("start");
    subject.subscribe(observer);
    // Act
    subject.error("error");
    // Assert
    expect(observer.error).toHaveBeenCalledWith("error");
  });
  it("transmits observed complete to subscribers", async () => {
    // Arrange
    const observer = { complete: jest.fn() };
    const subject = new BehaviorSubject("start");
    subject.subscribe(observer);
    // Act
    subject.complete();
    // Assert
    expect(observer.complete).toHaveBeenCalled();
  });
  it("emits current value to new subscribers", async () => {
    // Arrange
    const observer = { next: jest.fn() };
    const subject = new BehaviorSubject("start");
    // Act
    subject.subscribe(observer);
    // Assert
    expect(observer.next).toHaveBeenCalledWith("start");
  });
  it("doesn't emit current value to new subscribers if instructed", async () => {
    // Arrange
    const observer = { next: jest.fn() };
    const subject = new BehaviorSubject("start");
    // Act
    subject.subscribe(observer, false);
    // Assert
    expect(observer.next).not.toHaveBeenCalled();
  });
  it("doesn't transmit anything after unsubscribe", async () => {
    // Arrange
    const observer = { next: jest.fn(), error: jest.fn(), complete: jest.fn() };
    const subject = new BehaviorSubject("start");
    const unsubscriber = subject.subscribe(observer);
    // Act
    unsubscriber.unsubscribe();
    subject.next("next");
    subject.error("error");
    subject.complete();
    // Assert
    expect(observer.next).not.toHaveBeenCalledWith("next");
    expect(observer.error).not.toHaveBeenCalled();
    expect(observer.complete).not.toHaveBeenCalled();
  });
  it("doesn't transmit anything after complete", async () => {
    // Arrange
    const observer = { next: jest.fn(), error: jest.fn(), complete: jest.fn() };
    const subject = new BehaviorSubject("start");
    subject.subscribe(observer);
    subject.complete();
    // Act
    subject.next("next");
    subject.error("error");
    subject.complete();
    // Assert
    expect(observer.next).not.toHaveBeenCalledWith("next");
    expect(observer.error).not.toHaveBeenCalled();
    expect(observer.complete).toHaveBeenCalledTimes(1);
  });
  it("completes to new subscribers once complete", async () => {
    // Arrange
    const observer = { complete: jest.fn() };
    const subject = new BehaviorSubject("start");
    subject.complete();
    // Act
    subject.subscribe(observer);
    // Assert
    expect(observer.complete).toHaveBeenCalled();
  });
});
