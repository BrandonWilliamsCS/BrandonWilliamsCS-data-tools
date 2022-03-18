# Data Tools

The data "model" layer of applications written in Typescript tend to have similar or repeated needs. This library provides a place to maintain simple, pure tools and utilities that help simplify these common situations.

## Promise Tracking

JavaScript promises do not offer direct, immediate access to status and results. One must manually "track" the status of a promise from pending to resolved or rejected states. Included are structures and logic that simplify that work for you.
