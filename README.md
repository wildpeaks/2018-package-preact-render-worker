# Render to DOM, using a Web Worker

[![Build Status](https://travis-ci.org/wildpeaks/package-preact-render-worker.svg?branch=master)](https://travis-ci.org/wildpeaks/package-preact-render-worker)

**Renders a Preact component** in the DOM,
and **listens to a Web Worker** for the props (similar to `@wildpeaks/react-render-worker`).

Used by the JSON Entry Loader, resulting applications can send Actions messages to the Worker
to modify its internal state, and emit new props.

Install:

	npm install @wildpeaks/preact-render-worker

