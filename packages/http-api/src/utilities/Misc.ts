import { gameEventZod, Lobby, lobbyZod } from "common"
import { Table } from "optimus-ddb-client"

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

export function stripLobby(lobby: Lobby): Lobby {
	lobby.selectedTopicIndex = undefined
	lobby.players.forEach(player => player.isDeceptiveLizard = undefined)
	return lobby
}