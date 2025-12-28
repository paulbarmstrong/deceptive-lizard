import { OptimusDdbClient } from "optimus-ddb-client"
import { gameEventsTable } from "../utilities/Misc"
import { ClientError, HttpApiEvent } from "../utilities/Http"
import { lobbyIdZod, zodValidate } from "common"
import { z } from "zod"

const bodyZod = z.strictObject({
	lobbyId: lobbyIdZod
})

export async function listGameEvents(event: HttpApiEvent, optimus: OptimusDdbClient) {
	const body = zodValidate({schema: bodyZod, data: event.body, errorMapping: e => new ClientError(e.message)})
	const [gameEvents] = await optimus.queryItems({index: gameEventsTable, partitionKeyCondition: ["lobbyId", "=", body.lobbyId]})
	return {gameEvents}
}