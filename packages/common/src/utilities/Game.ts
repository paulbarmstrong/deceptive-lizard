import { cloneDeep } from "lodash"
import { Lobby } from "./Types"

export function stripLobbyForDeceptiveLizard(lobby: Lobby): Lobby {
	const strippedLobby = cloneDeep(lobby)
	strippedLobby.selectedTopicIndex = undefined
	strippedLobby.players.forEach(player => player.isDeceptiveLizard = undefined)
	return strippedLobby
}