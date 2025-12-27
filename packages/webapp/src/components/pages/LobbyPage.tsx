import { BACKGROUND_SHADE_T1, MENU_WIDTH, TOPIC_HEIGHT } from "../../utilities/Constants"
import { DynamicWebappConfig, Lobby } from "common"
import { useLobby } from "../../hooks/useLobby"
import { ChatPanel } from "../ChatPanel"
import { TopicsPanel } from "../TopicsPanel"
import { useError } from "../../hooks/useError"
import { LoadingSpinner } from "../LoadingSpinner"
import { countBy } from "lodash"

interface Props {
	config: DynamicWebappConfig,
	originalLobby: Lobby
}

export function LobbyPage(props: Props) {
	const [error, setError, withError] = useError()
	const [lobby, player, events, sendWsUpdate] = useLobby(props.config.wsApiEndpoint, "Paul", props.originalLobby, setError)

	return <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: 10, paddingTop: 10}}>
		<div style={{fontSize: "xxx-large"}}>Deceptive Lizard</div>
		<div style={{width: `calc((${MENU_WIDTH}) - 40px)`, padding: 20, backgroundColor: BACKGROUND_SHADE_T1, borderRadius: 4, fontSize: "large", textAlign: "center", display: "flex", justifyContent: "center", alignItems: "center", gap: 10}}>
			{(() => {
				if (player === undefined) return "Connecting..."
				if (lobby.category === undefined) return `Waiting for ${lobby.players[0].name} to pick a category...`
				const playerSubmittingHint = lobby.players.find(player => player.topicHint === undefined)
				if (playerSubmittingHint !== undefined) return `Waiting for ${lobby.players[0].name} to submit a topic hint...`
				const playersVoting = lobby.players.filter(player => player.votePlayerIndex === undefined)
				if (playersVoting.length > 0) return `Waiting for ${playersVoting.map(x => x.name).join(", ")} to vote...`
				return "Waiting for tie to be broken"
			})()}
		</div>
		<ChatPanel lobby={lobby} player={player} events={[{eventId: "22222", type: "chat-message", user: "Paul", text: "hello", timestamp: "2025-07-10T10:00:00Z"}]} sendWsUpdate={sendWsUpdate}/>
		<TopicsPanel lobby={lobby}/>
		<div style={{fontSize: "x-large", backgroundColor: BACKGROUND_SHADE_T1, borderRadius: 4, width: `calc((${MENU_WIDTH}) - 40px)`,
			height: TOPIC_HEIGHT, textAlign: "center", display: "flex", justifyContent: "center", alignItems: "center", padding: 20}}>
			{
				player?.isDeceptiveLizard !== undefined ? (
					player?.isDeceptiveLizard ? (
						<span><b>You are the deceptive lizard.</b></span>
					) : (
						<span>The selected topic is <b>{lobby.topics[lobby.selectedTopicIndex!]}</b>.</span>
					)
				) : (
					<LoadingSpinner/>
				)
			}
		</div>
	</div>
}