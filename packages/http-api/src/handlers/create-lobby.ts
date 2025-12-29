import { DateTime, Json, stripLobby } from "common"
import { OptimusDdbClient } from "optimus-ddb-client"
import { lobbiesTable } from "../utilities/Misc"
import { HttpApiEvent } from "../utilities/Http"

export async function createLobby(event: HttpApiEvent, optimus: OptimusDdbClient): Promise<Json> {
	const lobby = optimus.draftItem({table: lobbiesTable, item: {
		id: Math.floor(10000 * Math.random()),
		turnPlayerIndex: 0,
		players: [],
		category: undefined,
		topics: undefined,
		selectedTopicIndex: 0,
		ttl: Math.floor(DateTime.now.plusHours(1).getMillis / 1000)
	}})
	await optimus.commitItems({items: [lobby]})
	return {lobby: stripLobby(lobby, undefined)}
}