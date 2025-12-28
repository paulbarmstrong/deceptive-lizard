import { Lobby, Player, WsUpdateRequestData } from "common"
import { BACKGROUND_SHADE_T1 } from "../../utilities/Constants"

interface Props {
	lobby: Lobby,
	player: Player | undefined,
	sendWsUpdate: (data: WsUpdateRequestData) => void
}

export function PlayersPanel(props: Props) {
	function changeVote(clickedIndex: number) {
		if (props.player !== undefined) {
			const newVotePlayerIndex = clickedIndex === props.player?.votePlayerIndex ? undefined : clickedIndex
			console.log(newVotePlayerIndex)
			props.sendWsUpdate({
				lobbyId: props.lobby.id,
				votePlayerIndex: newVotePlayerIndex,
				clearVotePlayerIndex: newVotePlayerIndex === undefined
			})
		}
	}

	return <div style={{display: "flex", justifyContent: "center", gap: 10}}>
		{props.lobby.players.map((player, playerIndex) => <div key={player.connectionId} style={{display: "flex", flexDirection: "column", alignItems: "center" , padding: 10, backgroundColor: BACKGROUND_SHADE_T1, borderRadius: 4, gap: 5}}>
			<div style={{fontWeight: "bold"}}>{player.name}</div>
			<div>{player.topicHint !== undefined ? `"${player.topicHint}"` : "-"}</div>
			<div style={{display: "flex", alignItems: "center", gap: 10}}>
				<span style={{padding: 4}}>
					{props.lobby.players.filter(voter => voter.votePlayerIndex === playerIndex).length} votes
				</span>
				<span className="material-symbols-outlined" onClick={() => changeVote(playerIndex)} style={{padding: 5, cursor: "pointer", fontVariationSettings: playerIndex === props.player?.votePlayerIndex ? "'FILL' 1" : undefined}}>thumb_up</span>
			</div>
		</div>)}
	</div>
}