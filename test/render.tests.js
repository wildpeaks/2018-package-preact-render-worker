/* eslint-env node, browser, mocha */
'use strict';
const {strictEqual, deepStrictEqual} = require('assert');
const snapshot = require('@wildpeaks/snapshot-dom');
const sinon = require('sinon');
const render = require('..');


function test_missing_container(){
	deepStrictEqual(
		snapshot.toJSON(document.body),
		{
			tagName: 'body'
		},
		'Initial snapshot'
	);

	let thrown = false;
	try {
		render();
	} catch(e){
		thrown = true;
	}

	strictEqual(thrown, true, 'Throws an exception');
	deepStrictEqual(
		snapshot.toJSON(document.body),
		{
			tagName: 'body'
		},
		'Container contents have not changed'
	);
}


function test_missing_component(){
	deepStrictEqual(
		snapshot.toJSON(document.body),
		{
			tagName: 'body'
		},
		'Initial snapshot'
	);

	let thrown = false;
	try {
		render(document.body);
	} catch(e){
		thrown = true;
	}

	strictEqual(thrown, true, 'Throws an exception');
	deepStrictEqual(
		snapshot.toJSON(document.body),
		{
			tagName: 'body'
		},
		'Container contents have not changed'
	);
}


function test_missing_url(){
	deepStrictEqual(
		snapshot.toJSON(document.body),
		{
			tagName: 'body'
		},
		'Initial snapshot'
	);

	let thrown = false;
	try {
		render(document.body, 'article');
	} catch(e){
		thrown = true;
	}

	strictEqual(thrown, true, 'Throws an exception');
	deepStrictEqual(
		snapshot.toJSON(document.body),
		{
			tagName: 'body'
		},
		'Container contents have not changed'
	);
}


function test_missing_message(){
	deepStrictEqual(
		snapshot.toJSON(document.body),
		{
			tagName: 'body'
		},
		'Initial snapshot'
	);

	let thrown = false;
	try {
		render(document.body, 'article', 'fake.worker.js');
	} catch(e){
		thrown = true;
	}

	strictEqual(thrown, true, 'Throws an exception');
	deepStrictEqual(
		snapshot.toJSON(document.body),
		{
			tagName: 'body'
		},
		'Container contents have not changed'
	);
}


function test_no_props(){
	deepStrictEqual(
		snapshot.toJSON(document.body),
		{
			tagName: 'body'
		},
		'Initial snapshot'
	);
	strictEqual(global.workers.length, 0, 'No worker initially');

	let thrown = false;
	try {
		render(document.body, 'article', 'fake.worker.js', {hello: 123});
	} catch(e){
		thrown = true;
	}

	strictEqual(thrown, false, 'No exception');
	strictEqual(global.workers.length, 1, 'Only one Worker');

	const worker = global.workers[0];
	const scope = worker.scope;

	strictEqual(worker.url, 'fake.worker.js', 'Worker url');
	strictEqual(scope.postMessage.callCount, 1, 'postMessage called once');
	deepStrictEqual(scope.postMessage.getCall(0).args, [{hello: 123}], 'postMessage message');
	strictEqual(typeof scope.onmessage, 'function', 'onmessage listener');
	deepStrictEqual(
		snapshot.toJSON(document.body),
		{
			tagName: 'body',
			childNodes: [
				{
					tagName: 'div'
				}
			]
		},
		'A first child was added'
	);
}


function test_multiple_props(){
	deepStrictEqual(
		snapshot.toJSON(document.body),
		{
			tagName: 'body'
		},
		'Initial snapshot'
	);
	strictEqual(global.workers.length, 0, 'No worker initially');

	let thrown = false;
	try {
		render(document.body, 'article', 'fake.worker.js', {hello: 123});
	} catch(e){
		thrown = true;
	}

	strictEqual(thrown, false, 'No exception');
	strictEqual(global.workers.length, 1, 'Only one Worker');
	const worker = global.workers[0];
	const scope = worker.scope;
	const emit = scope.onmessage.bind(scope);

	strictEqual(worker.url, 'fake.worker.js', 'Worker url');
	strictEqual(scope.postMessage.callCount, 1, 'postMessage called once');
	deepStrictEqual(scope.postMessage.getCall(0).args, [{hello: 123}], 'postMessage message');
	strictEqual(typeof scope.onmessage, 'function', 'onmessage listener');
	deepStrictEqual(
		snapshot.toJSON(document.body),
		{
			tagName: 'body',
			childNodes: [
				{
					tagName: 'div'
				}
			]
		},
		'A first child was added'
	);

	emit({
		data: {
			class: 'first'
		}
	});
	deepStrictEqual(
		snapshot.toJSON(document.body),
		{
			tagName: 'body',
			childNodes: [
				{
					tagName: 'article',
					attributes: {
						class: 'first'
					}
				}
			]
		},
		'Render from first props'
	);

	emit({
		data: {
			class: 'second'
		}
	});
	deepStrictEqual(
		snapshot.toJSON(document.body),
		{
			tagName: 'body',
			childNodes: [
				{
					tagName: 'article',
					attributes: {
						class: 'second'
					}
				}
			]
		},
		'Render from second props'
	);
}


function test_replace_contents(){
	document.body.innerHTML = '<section class="hello"></section>';
	deepStrictEqual(
		snapshot.toJSON(document.body),
		{
			tagName: 'body',
			childNodes: [
				{
					tagName: 'section',
					attributes: {
						class: 'hello'
					}
				}
			]
		},
		'Initial snapshot'
	);
	strictEqual(global.workers.length, 0, 'No worker initially');

	const workerUrl = 'fake.worker.js';
	const initialMessage = {hello: 123};
	let thrown = false;
	try {
		render(document.body, 'article', workerUrl, initialMessage);
	} catch(e){
		thrown = true;
	}

	strictEqual(thrown, false, 'No exception');
	strictEqual(global.workers.length, 1, 'Only one Worker');

	const worker = global.workers[0];
	const scope = worker.scope;
	const emit = scope.onmessage.bind(scope);

	strictEqual(worker.url, workerUrl, 'Worker url');
	strictEqual(scope.postMessage.callCount, 1, 'postMessage called once');
	deepStrictEqual(scope.postMessage.getCall(0).args, [initialMessage], 'postMessage message');
	strictEqual(typeof scope.onmessage, 'function', 'onmessage listener');
	deepStrictEqual(
		snapshot.toJSON(document.body),
		{
			tagName: 'body',
			childNodes: [
				{
					tagName: 'section',
					attributes: {
						class: 'hello'
					}
				}
			]
		},
		'No first child had to be added'
	);

	emit({
		data: {
			class: 'first'
		}
	});
	deepStrictEqual(
		snapshot.toJSON(document.body),
		{
			tagName: 'body',
			childNodes: [
				{
					tagName: 'article',
					attributes: {
						class: 'first'
					}
				}
			]
		},
		'Render from first props'
	);
}


describe('@wildpeaks/preact-render-worker', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
		global.workers = [];
		global.Worker = function FakeWorker(url){
			this.postMessage = sinon.spy();
			global.workers.push({url, scope: this});
		};

		// @see https://github.com/developit/preact/issues/444#issuecomment-266472936
		global.SVGElement = global.Element;
	});
	afterEach(() => {
		delete global.workers;
		delete global.Worker;
	});
	it('Missing container', test_missing_container);
	it('Missing component', test_missing_component);
	it('Missing missing url', test_missing_url);
	it('Missing missing message', test_missing_message);
	it('No props', test_no_props);
	it('Multiple props', test_multiple_props);
	it('Replace contents', test_replace_contents);
});
