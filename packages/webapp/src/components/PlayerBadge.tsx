import { getColor } from "../utilities/Color"
import { Hovertip } from "./Hovertip"

export function PlayerBadge(props: {playerName: string, playerHue: number, playerIsRoundLeader: boolean}) {
	return <div style={{borderRadius: 4, padding: 4, backgroundColor: getColor(props.playerHue, 0), display: "flex", alignItems: "center", gap: 3}}>
		{props.playerIsRoundLeader ? (
			<div style={{display: "flex"}}>
				<span style={{fontSize: "large", userSelect: "none"}} className="material-symbols-outlined">crown</span>
				<Hovertip><span style={{fontSize: "large"}}>Round leader</span></Hovertip>
			</div>
		) : (
			undefined
		)}
		<span style={{fontSize: "medium", fontWeight: "bold"}}>{props.playerName}</span>
	</div>
}