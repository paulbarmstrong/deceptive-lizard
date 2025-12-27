import { Lobby, Player, WsUpdateRequestData } from "common"
import { BACKGROUND_SHADE_T1 } from "../../utilities/Constants"

interface Props {
	lobby: Lobby,
	player: Player | undefined,
	sendWsUpdate: (data: WsUpdateRequestData) => void
}

export function VotingPanel(props: Props) {
	return <div style={{display: "flex", justifyContent: "center", gap: 10}}>
		{props.lobby.players.map((player, playerIndex) => <div key={player.connectionId} style={{display: "flex", flexDirection: "column", padding: 10, backgroundColor: BACKGROUND_SHADE_T1, borderRadius: 4, gap: 5}}>
			<div style={{fontWeight: "bold"}}>{player.name}</div>
			<div>{props.lobby.players.filter(voter => voter.votePlayerIndex === playerIndex).length} votes</div>
		</div>)}
	</div>
}