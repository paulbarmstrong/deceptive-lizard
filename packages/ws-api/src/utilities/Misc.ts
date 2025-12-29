import { ApiGatewayManagementApiClient, PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi"
import { DateTime, GameEventType, gameEventZod, Lobby, lobbyZod, stripLobbyForDeceptiveLizard, WsResponse } from "common"
import { OptimusDdbClient, Table } from "optimus-ddb-client"
import { ulid } from "ulidx"

export const lobbiesTable = new Table({
	tableName: "DeceptiveLizardLobbies",
	itemSchema: lobbyZod,
	partitionKey: "id"
})

export const gameEventsTable = new Table({
	tableName: "DeceptiveLizardGameEvents",
	itemSchema: gameEventZod,
	partitionKey: "lobbyId",
	sortKey: "eventId"
})

export function draftGameEvent(optimus: OptimusDdbClient, data: {lobbyId: number, playerName: string, text?: string, type: GameEventType}) {
	return optimus.draftItem({
		table: gameEventsTable,
		item: {
			eventId: ulid(),
			timestamp: DateTime.now.toISOString(),
			ttl: Math.floor(DateTime.now.plusHours(1).getMillis / 1000),
			...data
		}
	})
}

export async function sendWsResponse(lobby: Lobby, res: WsResponse, apiGatewayManagementClient: ApiGatewayManagementApiClient) {
	try {
		await Promise.all(lobby.players.map(async player => {
			try {
				if (res.lobby !== undefined && player.isDeceptiveLizard === true) {
					res.lobby = stripLobbyForDeceptiveLizard(res.lobby)
				}
				await apiGatewayManagementClient.send(new PostToConnectionCommand({
					ConnectionId: player.connectionId,
					Data: JSON.stringify(res)
				}))
			} catch (error) {
				if ((error as Error).name !== "GoneException") throw error
			}
		}))
	} catch (error) {
		console.error(`Error updating resource connections: ${error}\n${(error as Error).stack}`)
	}
}
