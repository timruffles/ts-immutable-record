import { is } from "./is";

export interface Update {
	title?: string
}

const fields = ["title"];

export default class TestRecord {
	constructor(
		public title: string
	) {
	}

	derive(update: Update): TestRecord {
		const get = f => f in update ? update[f] : this[f];

		let empty = true;
		for(const p in update) {
			const v = update[p];
			if(!is(this[p], v)) {
				empty = false;
				break;
			}
		}

		if(empty) {
			return this;
		}

		return new TestRecord(get("title"));
	}

	equals(other: TestRecord): boolean {
		if(this === other) {
			return true;
		}

		if(!(other instanceof TestRecord)) {
			return false;
		} else {
			return fields.every(f => is(this[f], other[f]));
		}
	}

	is(other: TestRecord): boolean {
		return this.equals(other);
	}
};
