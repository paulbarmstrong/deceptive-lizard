import { Lobby, Player } from "common"
import { BACKGROUND_SHADE_T1 } from "../../utilities/Constants"
import { LoadingSpinner } from "../LoadingSpinner"

export function PlayerInfoPanel(props: {
	lobby: Lobby,
	player: Player | undefined
}) {
	return <div style={{fontSize: "large", backgroundColor: BACKGROUND_SHADE_T1, borderRadius: 4,
		textAlign: "center", display: "flex", justifyContent: "center", alignItems: "center", padding: 20}}>
		{
			props.player?.isDeceptiveLizard !== undefined ? (
				props.player?.isDeceptiveLizard ? (
					<span><b>You are the deceptive lizard.</b></span>
				) : (
					<span>The secret topic is <b>{props.lobby.topics![props.lobby.selectedTopicIndex!]}</b>.</span>
				)
			) : (
				<LoadingSpinner/>
			)
		}
	</div>
}