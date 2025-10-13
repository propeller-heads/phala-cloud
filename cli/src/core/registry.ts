import type { CommandDefinition, CommandGroup, CommandPath } from "./types";

interface CommandNode {
	readonly name: string | null;
	command?: CommandDefinition;
	group?: CommandGroup;
	readonly children: Map<string, CommandNode>;
	readonly aliasMap: Map<string, string>;
}

function createNode(name: string | null): CommandNode {
	return {
		name,
		children: new Map(),
		aliasMap: new Map(),
	};
}

export class CommandRegistry {
	private readonly root: CommandNode = createNode(null);

	registerGroup(group: CommandGroup): void {
		const node = this.ensurePath(group.path);
		node.group = group;

		const parent = this.getParentNode(group.path);
		if (parent && group.meta.aliases) {
			const canonical = group.path[group.path.length - 1];
			for (const alias of group.meta.aliases) {
				parent.aliasMap.set(alias, canonical);
			}
		}
	}

	registerCommand(definition: CommandDefinition): void {
		const node = this.ensurePath(definition.path);
		node.command = definition;

		const parent = this.getParentNode(definition.path);
		if (parent && definition.meta.aliases) {
			const canonical = definition.path[definition.path.length - 1];
			for (const alias of definition.meta.aliases) {
				parent.aliasMap.set(alias, canonical);
			}
		}
	}

	resolveCommand(segments: readonly string[]) {
		let node = this.root;
		let lastMatch: { node: CommandNode; depth: number } | undefined;

		for (let index = 0; index < segments.length; index += 1) {
			const segment = segments[index];
			const nextNode = this.getChild(node, segment);
			if (!nextNode) {
				break;
			}
			node = nextNode;
			if (node.command) {
				lastMatch = { node, depth: index + 1 };
			}
		}

		if (!lastMatch) {
			return undefined;
		}

		const consumed = segments.slice(0, lastMatch.depth);
		const rest = segments.slice(lastMatch.depth);

		const command = lastMatch.node.command;
		if (!command) {
			return null;
		}

		return {
			definition: command,
			consumed,
			remaining: rest,
		};
	}

	getChildren(path: CommandPath = []): readonly CommandNode[] {
		const node = this.getNode(path);
		if (!node) {
			return [];
		}
		return [...node.children.values()];
	}

	getNode(path: CommandPath): CommandNode | undefined {
		let current = this.root;
		for (const segment of path) {
			const next = this.getChild(current, segment);
			if (!next) {
				return undefined;
			}
			current = next;
		}
		return current;
	}

	private ensurePath(path: CommandPath): CommandNode {
		let current = this.root;
		for (const segment of path) {
			let child = current.children.get(segment);
			if (!child) {
				child = createNode(segment);
				current.children.set(segment, child);
			}
			current = child;
		}
		return current;
	}

	private getParentNode(path: CommandPath): CommandNode | undefined {
		if (path.length === 0) {
			return undefined;
		}
		return this.getNode(path.slice(0, -1));
	}

	private getChild(
		node: CommandNode,
		segment: string,
	): CommandNode | undefined {
		const direct = node.children.get(segment);
		if (direct) {
			return direct;
		}
		const alias = node.aliasMap.get(segment);
		if (!alias) {
			return undefined;
		}
		return node.children.get(alias);
	}
}
