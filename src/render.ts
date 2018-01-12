/* eslint-env browser */
/* eslint-disable indent */
import {h, render as preactRender} from 'preact';

declare global {
	interface Window {
		dispatch?: (message: any) => void;
	}
}


/**
 * Renders a Preact component in the DOM, and listens to a Web Worker for the props.
 * @param container DOM element to render into
 * @param ComponentClass Preact component class to render
 * @param workerUrl URL of the Web Worker
 */
export function render<Props>(
	container: Element,
	ComponentClass: preact.ComponentConstructor<Props, any> | preact.FunctionalComponent<Props> | string,
	workerUrl: string
): void {
	if (container.firstChild === null){
		container.appendChild(document.createElement('div'));
	}
	const worker = new Worker(workerUrl);
	window.dispatch = worker.postMessage.bind(worker);
	worker.onmessage = e => {
		if (e.data){
			const props = e.data as Props;
			// @ts-ignore
			const component: JSX.Element = h(ComponentClass, props);
			preactRender(component, container, container.firstChild as Element);
		}
	};
}
