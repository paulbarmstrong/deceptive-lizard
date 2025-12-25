import { MouseEvent, useState } from "react"
import { BACKGROUND_SHADE_T1, TOPICS, MENU_WIDTH, TOPIC_HEIGHT, TOPIC_WIDTH, BACKGROUND_SHADE_T0 } from "../utilities/Constants"
import { DynamicWebappConfig } from "common"
import { http } from "../utilities/Http"
import { ChatPanel } from "./ChatPanel"
import { TopicsPanel } from "./TopicsPanel"
import { useWs } from "../hooks/useWs"

interface Props {
	config: DynamicWebappConfig
}

export function App(props: Props) {
	const [selectedTopic, setSelectedTopic] = useState<string | undefined>(undefined)

	useWs(props.config.wsApiEndpoint)

	return <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: 10, paddingTop: 10}}>
		<div style={{fontSize: "xxx-large"}}>Deceptive Lizard</div>
		<ChatPanel events={[{eventId: "22222", type: "chat-message", user: "Paul", text: "hello", timestamp: "2025-07-10T10:00:00Z"}]}/>
		<TopicsPanel/>
		<div style={{fontSize: "x-large", backgroundColor: BACKGROUND_SHADE_T1, borderRadius: 4, width: `calc((${MENU_WIDTH}) - 40px)`,
			height: TOPIC_HEIGHT, textAlign: "center", display: "flex", justifyContent: "center", alignItems: "center", padding: 20}}>
			{
				selectedTopic !== undefined ? (
					<span>The selected topic is <b>{selectedTopic}</b>.</span>
				) : (
					<span><b>You are the deceptive lizard.</b></span>
				)
			}
		</div>
	</div>
}