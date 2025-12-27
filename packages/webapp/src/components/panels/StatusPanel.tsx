import { Lobby, Player } from "common"
import { BACKGROUND_SHADE_T1, MENU_WIDTH } from "../../utilities/Constants"


export function StatusPanel(props: {
	lobby: Lobby,
	player: Player | undefined
}) {
	return <div style={{width: `calc((${MENU_WIDTH}) - 40px)`, padding: 20, backgroundColor: BACKGROUND_SHADE_T1, borderRadius: 4, fontSize: "large", textAlign: "center", display: "flex", justifyContent: "center", alignItems: "center", gap: 10}}>
		{(() => {
			if (props.player === undefined) return "Connecting..."
			if (props.lobby.category === undefined) return `Waiting for ${props.lobby.players[0].name} to pick a category...`
			const playerSubmittingHint = props.lobby.players.find(player => player.topicHint === undefined)
			if (playerSubmittingHint !== undefined) return `Waiting for ${props.lobby.players[0].name} to submit a topic hint...`
			const playersVoting = props.lobby.players.filter(player => player.votePlayerIndex === undefined)
			if (playersVoting.length > 0) return `Waiting for ${playersVoting.map(x => x.name).join(", ")} to vote...`
			return "Waiting for tie to be broken"
		})()}
	</div>
}