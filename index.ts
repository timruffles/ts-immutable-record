export interface Create {
	name: string,
	generics?: string[],
	imports?: string,
	types?: string,
	isImportPath?: string,
	fields: { name: string, type: string }[]
};

module.exports = exports = create;

export default create;

function create({ name, generics = [], fields, types = "", imports = "", isImportPath = "" }: Create) {
	const prepared = {
		name,
		includedIs: isImportPath ? "" : getIs(),
		isImport: isImportPath ? `import { is } from "${isImportPath}";\n` : "",
		types: types ? types + "\n" : "",
		imports: imports ? imports + "\n" : "",
		generics: generics.length > 0 ? `<${generics.join(",")}>` : ``,
		unrestrictedGenerics: generics.length > 0 ? `<${generics.map(_ => '{}').join(",")}>` : ``,
		fieldLiterals: fields.map(setup => stringLiteral(setup.name)).join(", "),
		constructorParameters: fields.map(setup =>
			`public ${  setup.name }: ${ setup.type }`
		).join(",\n\t\t"),
		updateFields: fields.map(setup =>
			`${  setup.name }?: ${ setup.type }`
		).join("\n\t"),
		derivedSplatter: fields.map(setup => `get(${stringLiteral(setup.name)})`).join(", "),
		fieldValuePairs: fields.map(setup => `[${stringLiteral(setup.name)}, ${setup.type}]`).join(" | ")
	};

  return template();

	function template() {
		return `${ prepared.isImport }${ prepared.imports }${ prepared.types }
export interface Update${ prepared.generics } {
	${ prepared.updateFields }
}

const fields = [${ prepared.fieldLiterals }];

export default class ${ prepared.name }${ prepared.generics } {
	constructor(
		${ prepared.constructorParameters }
	) {
	}

	derive(update: Update${ prepared.generics }): ${ prepared.name }${ prepared.generics } {
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

		return new ${ prepared.name }(${prepared.derivedSplatter});
	}

	equals(other: ${ prepared.name }${ prepared.unrestrictedGenerics }): boolean {
		if(this === other) {
			return true;
		}

		if(!(other instanceof ${ prepared.name })) {
			return false;
		} else {
			return fields.every(f => is(this[f], other[f]));
		}
	}

	is(other: ${ prepared.name }${ prepared.unrestrictedGenerics }): boolean {
		return this.equals(other);
	}
};${ prepared.includedIs }
`
	}
}


// if we're importing is to save space
function getIs() {
	return `function is(valueA, valueB) {
  if (valueA === valueB || (valueA !== valueA && valueB !== valueB)) {
    return true;
  }
  if (!valueA || !valueB) {
    return false;
  }
  if (typeof valueA.valueOf === 'function' &&
      typeof valueB.valueOf === 'function') {
    valueA = valueA.valueOf();
    valueB = valueB.valueOf();
    if (valueA === valueB || (valueA !== valueA && valueB !== valueB)) {
      return true;
    }
    if (!valueA || !valueB) {
      return false;
    }
  }
  if (typeof valueA.equals === 'function' &&
      typeof valueB.equals === 'function' &&
      valueA.equals(valueB)) {
    return true;
  }
  return false;
}
`;
}


function stringLiteral(s: string) {
	return `"${s.replace(/"/g, '\\"')}"`;
}

