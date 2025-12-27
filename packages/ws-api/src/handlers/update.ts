import { ApiGatewayManagementApiClient } from "@aws-sdk/client-apigatewaymanagementapi"
import * as z from "zod"
import { OptimusDdbClient } from "optimus-ddb-client"
import { Json, wsUpdateRequestDataZod, zodValidate } from "common"
import { ClientError, WsApiEvent } from "src/utilities/Types"
import { lobbiesTable, sendWsResponse } from "src/utilities/Misc"

const bodyZod = z.strictObject({
	action: z.literal("update"),
	data: wsUpdateRequestDataZod
})

export default async function(event: WsApiEvent, optimus: OptimusDdbClient, apiGatewayManagementClient: ApiGatewayManagementApiClient)
		: Promise<Json> {
	const body = zodValidate({
		data: event.body,
		schema: bodyZod,
		errorMapping: e => new ClientError(e.message)
	})

	const lobby = await optimus.getItem({
		table: lobbiesTable,
		key: {id: body.data.lobbyId},
		itemNotFoundErrorOverride: e => new ClientError("Not found")
	})

	let player = lobby.players.find(player => player.connectionId === event.connectionId)

	if (player === undefined) {
		if (body.data.playerName === undefined) {
			throw new ClientError("New player must provide playerName")
		}
		player = {
			connectionId: event.connectionId,
			name: body.data.playerName
		}
		lobby.players.push(player)
	}

	if (body.data.topicHint) {
		// event
		player!.topicHint = body.data.topicHint
	}

	if (body.data.chatMessage) {
		// event
	}

	if (body.data.votePlayerIndex) {
		// event
		player!.votePlayerIndex = body.data.votePlayerIndex
		if (lobby.players.find(player => player.votePlayerIndex === undefined) === undefined) {
			// event
			lobby.players.forEach(player => {
				player.topicHint = undefined
				player.votePlayerIndex = undefined
			})
		}
	}

	await optimus.commitItems({items: [lobby]})

	await sendWsResponse(lobby, {lobby}, apiGatewayManagementClient)

	return undefined
}

