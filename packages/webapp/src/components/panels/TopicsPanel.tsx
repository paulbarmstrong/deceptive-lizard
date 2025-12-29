import { Lobby } from "common"
import { BACKGROUND_SHADE_T1, TOPIC_HEIGHT, TOPIC_WIDTH } from "../../utilities/Constants"
import { LoadingSpinner } from "../LoadingSpinner"

export function TopicsPanel(props: {lobby: Lobby}) {
	return <div style={{
		display: "grid",
		gridTemplateColumns: `repeat(auto-fit, minmax(${TOPIC_WIDTH}, 1fr))`,
		gap: 10
	}}>
		{
			props.lobby.topics !== undefined ? (
				props.lobby.topics.map(topic => <div key={topic} style={{
					height: TOPIC_HEIGHT, padding: 20, backgroundColor: BACKGROUND_SHADE_T1, fontSize: "large",
					display: "flex", justifyContent: "center", alignItems: "center", textAlign: "center", borderRadius: 4
				}}>{topic}</div>)
			) : (
				<LoadingSpinner/>
			)
		}
	</div>
}