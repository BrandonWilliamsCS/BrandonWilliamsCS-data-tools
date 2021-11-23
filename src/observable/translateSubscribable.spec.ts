import { Subject } from ".";
import {
  SubscribableTranslator,
  translateSubscribable,
} from "./translateSubscribable";

describe("translateSubscribable", () => {
  it("emits a value when the translator maps a base value", async () => {
    // Arrange
    const baseSubscribable = new Subject();
    const translator: SubscribableTranslator<number, string> = (n, emit) => {
      emit(n.toString());
    };
    const translatedSubscribable = translateSubscribable(
      baseSubscribable,
      translator,
    );
    const observer = { next: jest.fn() };
    translatedSubscribable.subscribe(observer);
    // Act
    baseSubscribable.next(5);
    // Assert
    expect(observer.next).toHaveBeenCalledWith("5");
  });
  it("emits no value when the translator ignores a base emission", async () => {
    // Arrange
    const baseSubscribable = new Subject();
    const translator: SubscribableTranslator<number, string> = (n, emit) => {};
    const translatedSubscribable = translateSubscribable(
      baseSubscribable,
      translator,
    );
    const observer = { next: jest.fn() };
    translatedSubscribable.subscribe(observer);
    // Act
    baseSubscribable.next(5);
    // Assert
    expect(observer.next).not.toHaveBeenCalled();
  });
  it("emits multiple values when the translator repeats a base emission", async () => {
    // Arrange
    const baseSubscribable = new Subject();
    const translator: SubscribableTranslator<number, string> = (n, emit) => {
      emit(n.toString());
      emit((-n).toString());
    };
    const translatedSubscribable = translateSubscribable(
      baseSubscribable,
      translator,
    );
    const observer = { next: jest.fn() };
    translatedSubscribable.subscribe(observer);
    // Act
    baseSubscribable.next(5);
    // Assert
    expect(observer.next).toHaveBeenCalledWith("5");
    expect(observer.next).toHaveBeenCalledWith("-5");
  });
  it("errors when the base errors", async () => {
    // Arrange
    const baseSubscribable = new Subject();
    const translator: SubscribableTranslator<number, string> = (n, emit) => {};
    const translatedSubscribable = translateSubscribable(
      baseSubscribable,
      translator,
    );
    const observer = { error: jest.fn() };
    translatedSubscribable.subscribe(observer);
    // Act
    baseSubscribable.error("error");
    // Assert
    expect(observer.error).toHaveBeenCalledWith("error");
  });
  it("completes when the base completes", async () => {
    // Arrange
    const baseSubscribable = new Subject();
    const translator: SubscribableTranslator<number, string> = (n, emit) => {};
    const translatedSubscribable = translateSubscribable(
      baseSubscribable,
      translator,
    );
    const observer = { complete: jest.fn() };
    translatedSubscribable.subscribe(observer);
    // Act
    baseSubscribable.complete();
    // Assert
    expect(observer.complete).toHaveBeenCalled();
  });
});
