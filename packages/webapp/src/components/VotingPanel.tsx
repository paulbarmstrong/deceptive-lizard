import { Lobby, Player } from "common"

interface Props {
	lobby: Lobby,
	player: Player
}

export function VotingPanel(props: Props) {
	<div style={{display: "flex", justifyContent: "center", gap: 10}}>
		{props.lobby.players.map((player, playerIndex) => <div key={player.connectionId} style={{display: "flex", flexDirection: "column"}}>
			<div>{player.name}</div>
			<div>{props.lobby.players.filter(voter => voter.votePlayerIndex === playerIndex).length} votes</div>
		</div>)}
	</div>
}