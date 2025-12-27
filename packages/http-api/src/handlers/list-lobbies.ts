import { OptimusDdbClient } from "optimus-ddb-client"
import { lobbiesTable } from "../utilities/Misc"
import { HttpApiEvent } from "../utilities/Http"

export async function listLobbies(event: HttpApiEvent, optimus: OptimusDdbClient) {
	const [lobbies] = await optimus.scanItems({index: lobbiesTable})
	return {lobbies}
}