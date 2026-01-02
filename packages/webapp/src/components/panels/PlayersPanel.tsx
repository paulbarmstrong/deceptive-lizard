import { Lobby, Player, WsUpdateRequestData } from "common"
import { BACKGROUND_SHADE_T1 } from "../../utilities/Constants"
import { s } from "../../utilities/Misc"
import { Hovertip } from "../Hovertip"
import { getColor } from "../../utilities/Color"
import { PlayerBadge } from "../PlayerBadge"

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

	return <div style={{display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 10}}>
		{props.lobby.players.map((player, playerIndex) => {
			const numVotes = props.lobby.players.filter(voter => voter.votePlayerIndex === playerIndex).length
			return <div key={player.connectionId} style={{display: "flex", flexDirection: "column", alignItems: "center", padding: 10, backgroundColor: getColor(player.hue, 0), borderRadius: 4, gap: 5}}>
				<PlayerBadge playerName={player.name} playerHue={player.hue} playerIsRoundLeader={playerIndex === 0}/>
				<div>{player.topicHint !== undefined ? `"${player.topicHint}"` : "-"}</div>
				<div style={{display: "flex", alignItems: "center", gap: 10}}>
					<span style={{padding: 4}}>
						{numVotes} vote{s(numVotes)}
					</span>
					<span>
						<span className="material-symbols-outlined" onClick={() => changeVote(playerIndex)} style={{padding: 5, cursor: "pointer", userSelect: "none", fontVariationSettings: playerIndex === props.player?.votePlayerIndex ? "'FILL' 1" : undefined}}>
							thumb_up
						</span>
						{
							props.player !== undefined && props.lobby.players.find(x => x.topicHint === undefined) === undefined && props.player.votePlayerIndex === undefined ? (
								<Hovertip enabledOverride={true} inverted={true}><span style={{fontSize: "large"}}>Vote</span></Hovertip>
							) : (
								undefined
							)
						}
					</span>
				</div>
			</div>
		})}
	</div>
}