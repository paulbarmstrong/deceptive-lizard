import { ApiGatewayManagementApiClient, PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi"
import { DateTime, GameEvent, GameEventType, gameEventZod, Lobby, lobbyZod, stripLobby, WsResponse } from "common"
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

export function updateLobbyTtl(lobby: Lobby): Lobby {
	lobby.ttl = Math.floor(DateTime.now.plusHours(1).getMillis / 1000)
	return lobby
}

export function resetRound(optimus: OptimusDdbClient, lobby: Lobby, gameEvents: Array<GameEvent>, rotateRoundLeader: boolean = true) {
	lobby.players.forEach(player => {
		player.topicHint = undefined
		player.votePlayerIndex = undefined
		player.isDeceptiveLizard = undefined
	})
	if (rotateRoundLeader && lobby.players.length > 0) {
		lobby.players.push(lobby.players.shift()!)
		gameEvents.push(draftGameEvent(optimus, {
			lobbyId: lobby.id,
			playerName: lobby.players[0].name,
			playerHue: lobby.players[0].hue,
			playerIsRoundLeader: true,
			type: "new-round-leader"
		}))
	}
	lobby.category = undefined
	lobby.topics = undefined
	lobby.selectedTopicIndex = undefined
}

export function draftGameEvent(optimus: OptimusDdbClient, data: {
	lobbyId: number,
	playerName: string,
	playerHue: number,
	playerIsRoundLeader: boolean,
	text?: string,
	type: GameEventType
}) {
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

export async function sendWsResponse(optimus: OptimusDdbClient, lobby: Lobby, res: WsResponse, apiGatewayManagementClient: ApiGatewayManagementApiClient) {
	try {
		await Promise.all(lobby.players.map(async player => {
			try {
				await apiGatewayManagementClient.send(new PostToConnectionCommand({
					ConnectionId: player.connectionId,
					Data: JSON.stringify({
						...res,
						lobby: res.lobby !== undefined ? stripLobby(lobby, player) : undefined
					})
				}))
			} catch (error) {
				if ((error as Error).name === "GoneException") {
					console.log(`Removing player ${player.connectionId} due to GoneException...`)
					lobby.players = lobby.players.filter(x => x.connectionId !== player.connectionId)
					await optimus.commitItems({items: [lobby]})
				} else {
					throw error
				}
			}
		}))
	} catch (error) {
		console.error(`Error updating resource connections: ${error}\n${(error as Error).stack}`)
	}
}
