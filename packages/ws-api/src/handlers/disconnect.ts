import { ApiGatewayManagementApiClient } from "@aws-sdk/client-apigatewaymanagementapi"
import { OptimusDdbClient } from "optimus-ddb-client"
import { GameEvent, Json } from "common"
import { draftGameEvent, lobbiesTable, resetRound, sendWsResponse, updateLobbyTtl } from "src/utilities/Misc"
import { WsApiEvent } from "src/utilities/Types"

export default async function(event: WsApiEvent, optimus: OptimusDdbClient, apiGatewayManagementClient: ApiGatewayManagementApiClient)
		: Promise<Json> {

	const [lobbies] = await optimus.scanItems({index: lobbiesTable})
	
	for (const lobby of lobbies) {
		const player = lobby.players.find(player => player.connectionId === event.connectionId)
		if (player !== undefined) {
			const gameEvents: Array<GameEvent> = []

			lobby.players = lobby.players.filter(player => player.connectionId !== event.connectionId)
			
			gameEvents.push(draftGameEvent(optimus, {
				lobbyId: lobby.id,
				type: "leave",
				playerName: player.name,
				playerHue: player.hue
			}))

			resetRound(optimus, lobby, gameEvents)

			await optimus.commitItems({items: [updateLobbyTtl(lobby), ...gameEvents]})
			await sendWsResponse(optimus, lobby, {lobby}, apiGatewayManagementClient)
		}
	}

	return undefined
}
