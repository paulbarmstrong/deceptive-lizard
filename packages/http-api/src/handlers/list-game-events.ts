import { OptimusDdbClient } from "optimus-ddb-client"
import { gameEventsTable } from "../utilities/Misc"
import { ClientError, HttpApiEvent } from "../utilities/Http"
import { lobbyIdZod, zodValidate } from "common"
import { z } from "zod"

export async function listGameEvents(event: HttpApiEvent, optimus: OptimusDdbClient) {
	const body = zodValidate({
		schema: z.strictObject({lobbyId: lobbyIdZod}),
		data: event.body,
		errorMapping: e => new ClientError(e.message)
	})
	const [gameEvents] = await optimus.queryItems({index: gameEventsTable, partitionKeyCondition: ["lobbyId", "=", body.lobbyId]})
	return {gameEvents}
}