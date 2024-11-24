import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import type { Entities, EntityUpdate } from '~/types';
import events from '~/lib/events';
import path from 'node:path';


class Store {
	file = path.join(process.cwd(), 'persisted.json');
	store: Record<string, Entities>;
	charts: Record<string, string>;
	names: Record<string, string>;

	constructor() {
		events.on('store-updated', this.persist.bind(this));

		if (existsSync(this.file)) {
			try {
				const content = readFileSync(this.file, 'utf-8');
				const parsed = JSON.parse(content);

				this.store = parsed.store ?? {};
				this.charts = parsed.charts ?? {};
				this.names = parsed.names ?? {};
			} catch {
				this.store = {};
				this.charts = {};
				this.names = {};
			}
		} else {
			this.charts = {};
			this.store = {};
			this.names = {};
		}
	}

	addToKey(key: string, item: EntityUpdate) {
		const updates = this.store[key] ?? [];

		updates.push(item);
		this.set(key, updates);
	}

	delete(key: string) {
		delete this.store[key];
		events.emit('store-updated');
	}

	setChart(key: string, url: string) {
		this.charts[key] = url;
		events.emit('store-updated');
	}

	getName(key: string) {
		return this.names[key];
	}

	setName(key: string, name: string) {
		this.names[key] = name;
		events.emit('store-updated');
	}

	set(key: string, value: Entities) {
		const res = (this.store[key] = value);
		events.emit('store-updated');

		return res;
	}

	persist() {
		writeFileSync(this.file, JSON.stringify({
			store: this.store,
			charts: this.charts,
			names: this.names
		}, null, 2));
	}
}

const store = new Store();

export default store;