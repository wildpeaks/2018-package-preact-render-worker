/* eslint-env browser */
'use strict';
const {h, render} = require('preact');

function required(){
	throw new Error('Missing required parameter');
}


/**
 * Renders a component using props emitted from a Web Worker (replaces contents of the container).
 * @param  {HTMLElement}  container      HTML tag to render into
 * @param  {PreactClass}  Component      Preact component to render
 * @param  {String}       workerUrl      URL of the Web Worker
 * @param  {Object}       workerMessage  Initial message sent to the Web Worker
 */
module.exports = function renderWorker(container = required(), Component = required(), workerUrl = required(), workerMessage = required()){
	if (container.firstChild === null){
		container.appendChild(document.createElement('div'));
	}
	const worker = new Worker(workerUrl);
	window.dispatch = worker.postMessage.bind(worker);
	worker.onmessage = e => {
		const component = h(Component, e.data);
		render(component, container, container.firstChild);
	};
	worker.postMessage(workerMessage);
};
