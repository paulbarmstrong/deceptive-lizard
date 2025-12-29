import { ApiGatewayManagementApiClient } from "@aws-sdk/client-apigatewaymanagementapi"
import { OptimusDdbClient } from "optimus-ddb-client"
import { Json } from "common"
import { draftGameEvent, lobbiesTable, resetRound, sendWsResponse, updateLobbyTtl } from "src/utilities/Misc"
import { WsApiEvent } from "src/utilities/Types"

export default async function(event: WsApiEvent, optimus: OptimusDdbClient, apiGatewayManagementClient: ApiGatewayManagementApiClient)
		: Promise<Json> {

	const [lobbies] = await optimus.scanItems({index: lobbiesTable})
	
	for (const lobby of lobbies) {
		const player = lobby.players.find(player => player.connectionId === event.connectionId)
		if (player !== undefined) {
			lobby.players = lobby.players.filter(player => player.connectionId !== event.connectionId)
			resetRound(lobby)

			const leftEvent = draftGameEvent(optimus, {
				lobbyId: lobby.id,
				type: "leave",
				playerName: player.name
			})

			await optimus.commitItems({items: [updateLobbyTtl(lobby), leftEvent]})
			await sendWsResponse(lobby, {lobby}, apiGatewayManagementClient)
		}
	}

	return undefined
}
