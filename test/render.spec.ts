/* eslint-env browser, mocha */
import {h, Component} from 'preact';
import {render} from '../src/render';
// @ts-ignore
import {JSDOM} from 'jsdom';
// @ts-ignore
import * as snapshot from '@wildpeaks/snapshot-dom';


declare type WorkerData = {
	url: string;
	scope: any;
};

declare global {
	namespace NodeJS {
		interface Global {
			window: any;
			document: any;
			Worker: any;
			workers: WorkerData[];
		}
	}
}

function FakeWorker(this: any, url: string) {
	this.onmessage = null;
	this.postMessage = jasmine.createSpy();
	global.workers.push({url, scope: this});
}


function test_detached_container(): void {
	const container = document.createElement('div');
	container.className = 'mycontainer';

	expect(snapshot.toJSON(document.body))
	.toEqual({
		tagName: 'body'
	});
	expect(snapshot.toJSON(container))
	.toEqual({
		tagName: 'div',
		attributes: {
			class: 'mycontainer'
		}
	});
	expect(global.workers.length).toBe(0);

	let throws = false;
	try {
		render(container, 'article', 'fake.worker.js');
	} catch(e){
		throws = e;
	}
	expect(throws).toBe(false);

	expect(global.workers.length).toBe(1);
	if (global.workers.length > 0){
		const worker = global.workers[0]; // eslint-disable-line prefer-destructuring
		expect(worker.url).toBe('fake.worker.js');

		const calls = worker.scope.postMessage.calls.all();
		expect(calls.length).toEqual(0);

		expect(snapshot.toJSON(document.body))
		.toEqual({
			tagName: 'body'
		});

		expect(typeof worker.scope.onmessage).toBe('function');
		const emit = worker.scope.onmessage.bind(worker.scope);

		emit({
			data: {
				class: 'first'
			}
		});
		expect(snapshot.toJSON(document.body))
		.toEqual({
			tagName: 'body'
		});
		expect(snapshot.toJSON(container))
		.toEqual({
			tagName: 'div',
			attributes: {
				class: 'mycontainer'
			},
			childNodes: [
				{
					tagName: 'article',
					attributes: {
						class: 'first'
					}
				}
			]
		});
	}
}


function test_multiple_messages(): void {
	expect(snapshot.toJSON(document.body))
	.toEqual({
		tagName: 'body'
	});
	expect(global.workers.length).toBe(0);

	let throws = false;
	try {
		render(document.body, 'article', 'fake.worker.js');
	} catch(e){
		throws = e;
	}
	expect(throws).toBe(false);

	expect(global.workers.length).toBe(1);
	if (global.workers.length > 0){
		const worker = global.workers[0]; // eslint-disable-line prefer-destructuring
		expect(worker.url).toBe('fake.worker.js');

		const calls = worker.scope.postMessage.calls.all();
		expect(calls.length).toEqual(0);

		expect(snapshot.toJSON(document.body))
		.toEqual({
			tagName: 'body',
			childNodes: [
				{
					tagName: 'div'
				}
			]
		});

		expect(typeof worker.scope.onmessage).toBe('function');
		const emit = worker.scope.onmessage.bind(worker.scope);

		emit({
			data: {
				class: 'first'
			}
		});
		expect(snapshot.toJSON(document.body))
		.toEqual({
			tagName: 'body',
			childNodes: [
				{
					tagName: 'article',
					attributes: {
						class: 'first'
					}
				}
			]
		});

		emit({
			data: {
				class: 'second'
			}
		});
		expect(snapshot.toJSON(document.body))
		.toEqual({
			tagName: 'body',
			childNodes: [
				{
					tagName: 'article',
					attributes: {
						class: 'second'
					}
				}
			]
		});
	}
}


function test_replace_contents(): void {
	document.body.innerHTML = '<section class="hello"></section>';
	expect(snapshot.toJSON(document.body))
	.toEqual({
		tagName: 'body',
		childNodes: [
			{
				tagName: 'section',
				attributes: {
					class: 'hello'
				}
			}
		]
	});
	expect(global.workers.length).toBe(0);

	let throws = false;
	try {
		render(document.body, 'article', 'fake.worker.js');
	} catch(e){
		throws = e;
	}
	expect(throws).toBe(false);

	expect(global.workers.length).toBe(1);
	if (global.workers.length > 0){
		const worker = global.workers[0]; // eslint-disable-line prefer-destructuring
		expect(worker.url).toBe('fake.worker.js');

		const calls = worker.scope.postMessage.calls.all();
		expect(calls.length).toEqual(0);

		expect(snapshot.toJSON(document.body))
		.toEqual({
			tagName: 'body',
			childNodes: [
				{
					tagName: 'section',
					attributes: {
						class: 'hello'
					}
				}
			]
		});

		expect(typeof worker.scope.onmessage).toBe('function');
		const emit = worker.scope.onmessage.bind(worker.scope);

		emit({
			data: {
				class: 'first'
			}
		});
		expect(snapshot.toJSON(document.body))
		.toEqual({
			tagName: 'body',
			childNodes: [
				{
					tagName: 'article',
					attributes: {
						class: 'first'
					}
				}
			]
		});
	}
}


function test_stateless_component(): void {
	document.body.innerHTML = '<section class="hello"></section>';
	expect(snapshot.toJSON(document.body))
	.toEqual({
		tagName: 'body',
		childNodes: [
			{
				tagName: 'section',
				attributes: {
					class: 'hello'
				}
			}
		]
	});
	expect(global.workers.length).toBe(0);

	interface StatelessProps {
		href: string;
	}
	const Stateless: preact.FunctionalComponent<StatelessProps> = (props: StatelessProps) => h('a', props);

	let throws = false;
	try {
		render<StatelessProps>(document.body, Stateless, 'fake.worker.js');
	} catch(e){
		throws = e;
	}
	expect(throws).toBe(false);

	expect(global.workers.length).toBe(1);
	if (global.workers.length > 0){
		const worker = global.workers[0]; // eslint-disable-line prefer-destructuring
		expect(worker.url).toBe('fake.worker.js');

		const calls = worker.scope.postMessage.calls.all();
		expect(calls.length).toEqual(0);

		expect(snapshot.toJSON(document.body))
		.toEqual({
			tagName: 'body',
			childNodes: [
				{
					tagName: 'section',
					attributes: {
						class: 'hello'
					}
				}
			]
		});

		expect(typeof worker.scope.onmessage).toBe('function');
		const emit = worker.scope.onmessage.bind(worker.scope);

		emit({
			data: {
				href: 'modified'
			}
		});
		expect(snapshot.toJSON(document.body))
		.toEqual({
			tagName: 'body',
			childNodes: [
				{
					tagName: 'a',
					attributes: {
						href: 'modified'
					}
				}
			]
		});
	}
}


function test_stateful_component(): void {
	document.body.innerHTML = '<section class="hello"></section>';
	expect(snapshot.toJSON(document.body))
	.toEqual({
		tagName: 'body',
		childNodes: [
			{
				tagName: 'section',
				attributes: {
					class: 'hello'
				}
			}
		]
	});
	expect(global.workers.length).toBe(0);

	interface StatefulProps {
		href: string;
	}
	interface StatefulState {
		something: boolean;
	}
	class Stateful extends Component<StatefulProps, StatefulState> {
		render(props: StatefulProps) { // eslint-disable-line class-methods-use-this
			return h('a', props);
		}
	}

	let throws = false;
	try {
		render<StatefulProps>(document.body, Stateful, 'fake.worker.js');
	} catch(e){
		throws = e;
	}
	expect(throws).toBe(false);

	expect(global.workers.length).toBe(1);
	if (global.workers.length > 0){
		const worker = global.workers[0]; // eslint-disable-line prefer-destructuring
		expect(worker.url).toBe('fake.worker.js');

		const calls = worker.scope.postMessage.calls.all();
		expect(calls.length).toEqual(0);

		expect(snapshot.toJSON(document.body))
		.toEqual({
			tagName: 'body',
			childNodes: [
				{
					tagName: 'section',
					attributes: {
						class: 'hello'
					}
				}
			]
		});

		expect(typeof worker.scope.onmessage).toBe('function');
		const emit = worker.scope.onmessage.bind(worker.scope);

		emit({
			data: {
				href: 'modified'
			}
		});
		expect(snapshot.toJSON(document.body))
		.toEqual({
			tagName: 'body',
			childNodes: [
				{
					tagName: 'a',
					attributes: {
						href: 'modified'
					}
				}
			]
		});
	}
}


describe('render', () => {
	beforeEach(() => {
		const dom = new JSDOM(`<!DOCTYPE html>`);
		global.window = dom.window;
		global.document = dom.window.document;
		global.workers = [];
		global.Worker = FakeWorker;
	});
	afterEach(() => {
		delete global.window;
		delete global.document;
		delete global.workers;
		delete global.Worker;
	});
	it('Detached Container', test_detached_container);
	it('Multiple Messages', test_multiple_messages);
	it('Replace Contents', test_replace_contents);
	it('Stateless Component', test_stateless_component);
	it('Stateful Component', test_stateful_component);
});
