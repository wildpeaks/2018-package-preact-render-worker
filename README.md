# Render to DOM, using a Web Worker

[![Build Status](https://travis-ci.org/wildpeaks/package-preact-render-worker.svg?branch=master)](https://travis-ci.org/wildpeaks/package-preact-render-worker)

**Renders a Preact component** in the DOM,
and **listens to a Web Worker** for the props (similar to `@wildpeaks/react-render-worker`).

Install:

	npm install @wildpeaks/preact-render-worker

Example:
````ts
import {h, Component} from 'preact';
import {render} from '@wildpeaks/preact-render-worker';

interface MyProps {
	href: string;
}
interface MyState {
	example: boolean;
}
class MyComponent extends Component<MyProps, MyState> {
	render(props: MyProps) {
		return h('a', props);
	}
}

let throws = false;
const container = document.createElement('div');

// This will render the computer in container everytime the Web Worker emits nes props.
render<MyProps>(container, MyComponent, 'myworker.js');

// Forwards a message to the Web Worker to trigger a change in the Web Worker.
window.dispatch({action: 'example'});
````
