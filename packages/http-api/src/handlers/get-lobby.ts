import { OptimusDdbClient } from "optimus-ddb-client"
import { lobbiesTable } from "../utilities/Misc"
import { ClientError, HttpApiEvent } from "../utilities/Http"
import { lobbyIdZod, stripLobbyForDeceptiveLizard, zodValidate } from "common"
import { z } from "zod"

export async function getLobby(event: HttpApiEvent, optimus: OptimusDdbClient) {
	const body = zodValidate({
		schema: z.strictObject({id: lobbyIdZod}),
		data: event.body,
		errorMapping: e => new ClientError(e.message)
	})
	const lobby = await optimus.getItem({
		table: lobbiesTable,
		key: {id: body.id},
		itemNotFoundErrorOverride: e => new ClientError("Not found")
	})
	return {lobby: stripLobbyForDeceptiveLizard(lobby)}
}