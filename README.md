# Data Tools

The data "model" layer of applications written in Typescript tend to have similar or repeated needs. This library provides a place to maintain simple, pure tools and utilities that help simplify these common situations.

## Observables

The RxJS library provides an immensely powerful paradigm for modelling the flow of data and changes. The library is large and fully-featured, however, and may be overkill in certain contexts. For situations where RxJS observables are too heavyweight, we provide a bare-bones, API-compatible version of a few key utilities and types.

1. Observer - this interface represents an entity that wishes to be notified of each of a sequence of "emissions". It may also provide behavior for reacting to errors and a "complete" signal.
1. Subscribable - also known as an observable, this interface represents what an observer may observe. When an observer subscribes to a subscribable, its callback functions are called with any new values as they are emitted. The subscription returns an Unsubscribable, which allows the subscriber to free up resources by removing itself from the subscriber.
1. BehaviorSubject - a "Subject", in RxJS terms, is both an Observer and a Subscribable that allows a consumer to emit values to all subscribers as a black box. A BehaviorSubject in particular is one that maintains a reference to its "current" value for direct access and so that consumers may always have one to reference.

## Promise Tracking

JavaScript promises do not offer direct, immediate access to status and results. One must manually "track" the status of a promise from pending to resolved or rejected states. Included are structures and logic that simplify that work for you.
