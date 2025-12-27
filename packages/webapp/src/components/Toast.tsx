import { MENU_WIDTH, RED_SHADE_T0 } from "../utilities/Constants"

interface Props {
	message: string,
	onClose: () => void
}

export function Toast(props: Props) {
	return <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", textAlign: "center", backgroundColor: RED_SHADE_T0, borderRadius: 4, width: MENU_WIDTH}}>
		<span className="material-symbols-outlined"
			style={{padding: 10, opacity: 0}}
			onClick={props.onClose}>cancel</span>
		<div style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
			<span>{props.message}</span>
		</div>
		<span className="material-symbols-outlined"
			style={{padding: 10, userSelect: "none", cursor: "pointer"}}
			onClick={props.onClose}>cancel</span>
	</div>
}