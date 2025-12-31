import { getColor } from "../utilities/Color"

export function PlayerBadge(props: {playerName: string, playerHue: number}) {
	return <div style={{borderRadius: 4, padding: 4, backgroundColor: getColor(props.playerHue, 0)}}>{props.playerName}</div>
}