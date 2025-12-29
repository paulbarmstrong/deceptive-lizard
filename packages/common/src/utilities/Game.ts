import { cloneDeep } from "lodash"
import { Lobby, Player } from "./Types"

export function stripLobby(lobby: Lobby, player: Player | undefined): Lobby {
	const strippedLobby = cloneDeep(lobby)
	if (player?.isDeceptiveLizard !== false) {
		strippedLobby.selectedTopicIndex = undefined
	}
	if (player?.isDeceptiveLizard !== true) {
		strippedLobby.players.forEach(x => {
			if (x.connectionId !== player?.connectionId) x.isDeceptiveLizard = undefined
		})
	}
	return strippedLobby
}