import { MouseEvent, useState } from "react"
import { BACKGROUND_SHADE_T1, TOPICS, MENU_WIDTH, TOPIC_HEIGHT, TOPIC_WIDTH } from "../utilities/Constants"
import { DynamicWebappConfig } from "common"
import { http } from "../utilities/Http"

interface Props {
	config: DynamicWebappConfig
}

export function App(props: Props) {
	const [selectedTopic, setSelectedTopic] = useState<string | undefined>(undefined)
	return <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: 20, paddingTop: 20}}>
		<div style={{fontSize: "xxx-large"}}>Deceptive Lizard</div>
		<div style={{
			display: "grid",
			width: `calc(${MENU_WIDTH} + 40px)`,
			gridTemplateColumns: `repeat(auto-fit, minmax(${TOPIC_WIDTH}, 1fr))`,
			gap: 20
		}}>
			{TOPICS.map(topic => <div key={topic} style={{
				height: TOPIC_HEIGHT, padding: 20, backgroundColor: BACKGROUND_SHADE_T1, fontSize: "x-large",
				display: "flex", justifyContent: "center", alignItems: "center", textAlign: "center", borderRadius: 4
			}}>{topic}</div>)}
		</div>
		<div style={{fontSize: "x-large", backgroundColor: BACKGROUND_SHADE_T1, padding: 20, borderRadius: 4, width: MENU_WIDTH,
			height: TOPIC_HEIGHT, textAlign: "center", display: "flex", justifyContent: "center", alignItems: "center"}}>
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