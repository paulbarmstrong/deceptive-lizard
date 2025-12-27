import { Lobby, Player } from "common"

export function getGameStatusText(lobby: Lobby, player: Player | undefined) {
	if (player === undefined) return "Connecting..."
	if (lobby.category === undefined) return `Waiting for ${lobby.players[0].name} to pick a category...`
}