import { Lobby } from "common"
import { BACKGROUND_SHADE_T1, MENU_WIDTH, TOPIC_HEIGHT, TOPIC_WIDTH, TOPICS } from "../utilities/Constants"

export function TopicsPanel(props: {lobby: Lobby}) {
	return <div style={{
		display: "grid",
		width: MENU_WIDTH,
		gridTemplateColumns: `repeat(auto-fit, minmax(${TOPIC_WIDTH}, 1fr))`,
		gap: 10
	}}>
		{TOPICS.map(topic => <div key={topic} style={{
			height: TOPIC_HEIGHT, padding: 20, backgroundColor: BACKGROUND_SHADE_T1, fontSize: "large",
			display: "flex", justifyContent: "center", alignItems: "center", textAlign: "center", borderRadius: 4
		}}>{topic}</div>)}
	</div>
}