import { OptimusDdbClient } from "optimus-ddb-client"
import { lobbiesTable } from "../utilities/Misc"
import { HttpApiEvent } from "../utilities/Http"
import { stripLobby } from "common"

export async function listLobbies(event: HttpApiEvent, optimus: OptimusDdbClient) {
	const [lobbies] = await optimus.scanItems({index: lobbiesTable})
	return {lobbies: lobbies.map(lobby => stripLobby(lobby, undefined))}
}