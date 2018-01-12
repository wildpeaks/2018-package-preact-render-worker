/* eslint-env browser */
import {h, render as preactRender} from 'preact';

declare global {
	interface Window {
		dispatch: any;
	}
}

export function render<Props>(
	container: Element,
	ComponentClass: preact.ComponentConstructor<Props, any> | preact.FunctionalComponent<Props> | string,
	workerUrl: string,
	workerMessage: any
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
	worker.postMessage(workerMessage);
}
