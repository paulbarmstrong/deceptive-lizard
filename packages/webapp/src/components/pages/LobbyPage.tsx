import { BACKGROUND_SHADE_T1, MENU_WIDTH, TOPIC_HEIGHT } from "../../utilities/Constants"
import { DynamicWebappConfig, Lobby } from "common"
import { useLobby } from "../../hooks/useLobby"
import { ChatPanel } from "../ChatPanel"
import { TopicsPanel } from "../TopicsPanel"
import { useError } from "../../hooks/useError"

interface Props {
	config: DynamicWebappConfig,
	originalLobby: Lobby
}

export function LobbyPage(props: Props) {
	const [error, setError, withError] = useError()
	const [lobby, events, sendWsUpdate] = useLobby(props.config.wsApiEndpoint, "Paul", props.originalLobby, setError)

	return <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: 10, paddingTop: 10}}>
		<div style={{fontSize: "xxx-large"}}>Deceptive Lizard</div>
		<ChatPanel events={[{eventId: "22222", type: "chat-message", user: "Paul", text: "hello", timestamp: "2025-07-10T10:00:00Z"}]}/>
		<TopicsPanel lobby={lobby}/>
		<div style={{fontSize: "x-large", backgroundColor: BACKGROUND_SHADE_T1, borderRadius: 4, width: `calc((${MENU_WIDTH}) - 40px)`,
			height: TOPIC_HEIGHT, textAlign: "center", display: "flex", justifyContent: "center", alignItems: "center", padding: 20}}>
			{
				lobby.selectedTopicIndex !== undefined ? (
					<span>The selected topic is <b>{lobby.topics[lobby.selectedTopicIndex]}</b>.</span>
				) : (
					<span><b>You are the deceptive lizard.</b></span>
				)
			}
		</div>
	</div>
}