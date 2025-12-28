import { BACKGROUND_SHADE_T1 } from "../utilities/Constants"

export function PlayerBadge(props: {playerName: string}) {
	return <div style={{backgroundColor: BACKGROUND_SHADE_T1, borderRadius: 4, padding: 4}}>{props.playerName}</div>
}