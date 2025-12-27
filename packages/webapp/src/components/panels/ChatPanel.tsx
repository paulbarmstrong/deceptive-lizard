import { useEffect, useRef } from "react"
import { DeceptiveLizardEvent, Lobby, Player, WsUpdateRequestData } from "common"
import useInterval from "../../hooks/useInterval"
import { getTimeElapsedString } from "../../utilities/Misc"
import { BACKGROUND_SHADE_T0, BACKGROUND_SHADE_T1, MENU_WIDTH } from "../../utilities/Constants"
import { useRefState } from "../../hooks/useRefState"
import { useOnKeyDown } from "../../hooks/useOnKeyDown"
import { Hovertip } from "../Hovertip"

interface Props {
	lobby: Lobby,
	player: Player | undefined,
	events: Array<DeceptiveLizardEvent>,
	sendWsUpdate: (data: WsUpdateRequestData) => void
}

export function ChatPanel(props: Props) {
	const textDraft = useRefState<string>("")
	const resourceEventContainerRef = useRef<HTMLDivElement>(null)
	const dateRefreshIncr = useRefState<number>(0)
	const latestChatMessageTime = useRef<number>(0)

	const isSubmittingTopicHint: boolean = props.player !== undefined && props.lobby.players
		.find(x => x.topicHint === undefined)?.connectionId === props.player.connectionId

	function onEnterChatMessage() {
		if (textDraft.current.length > 0) {
			if (isSubmittingTopicHint) {
				props.sendWsUpdate({
					lobbyId: props.lobby.id,
					topicHint: textDraft.current
				})
			} else {
				props.sendWsUpdate({
					lobbyId: props.lobby.id,
					chatMessage: textDraft.current
				})
			}
			textDraft.current = ""
		}
	}
	
	useEffect(() => {
		if (resourceEventContainerRef.current != null && props.events.length > 0 && new Date(props.events[props.events.length-1].timestamp).getTime() > latestChatMessageTime.current) {
			resourceEventContainerRef.current.scrollTop = resourceEventContainerRef.current.scrollHeight
			latestChatMessageTime.current = new Date(props.events[props.events.length-1].timestamp).getTime()
		}
	}, [resourceEventContainerRef, props.events])

	useInterval(() => dateRefreshIncr.current += 1, 60000, false, [])

	useOnKeyDown((event: globalThis.KeyboardEvent) => {
		if (event.key === "Enter" && !event.shiftKey && document.activeElement && document.activeElement.className === "TextChatInput") {
			event.preventDefault()
			onEnterChatMessage()
		}
	}, [textDraft, isSubmittingTopicHint])

	return <div style={{display: "flex", flexDirection: "column", alignItems: "stretch", width: MENU_WIDTH}}>
		<div ref={resourceEventContainerRef} style={{display: "flex", flexDirection: "column", alignItems: "stretch", borderStyle: "solid", 
			borderRadius: 4, borderBottomRightRadius: 0, borderBottomLeftRadius: 0, borderColor: BACKGROUND_SHADE_T1, gap: 3, padding: 3, height: 120, 
			overflowY: "scroll"}}>
			{
				props.events.map(event => <div key={event.eventId} style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
					{
						<div style={{display: "flex", alignItems: "center"}}>
							<div style={{backgroundColor: BACKGROUND_SHADE_T1, borderRadius: 4, padding: 4}}>{event.user}</div>
							<div>: {event.text}</div>
						</div>
					}
					<div style={{padding: 4, fontSize: "medium"}}>{getTimeText(event.timestamp)}</div>
				</div>)
			}
		</div>
		<div style={{borderColor: BACKGROUND_SHADE_T1, borderStyle: "solid", borderRadius: 4, borderTopStyle: "none", borderTopLeftRadius: 0, borderTopRightRadius: 0, display: "flex", justifyContent: "space-between", alignItems: "center", textAlign: "left", height: 40}}>
			<input className="TextChatInput" value={textDraft.current} onChange={e => textDraft.current = e.target.value}
				style={{paddingLeft: 10, paddingRight: 10, flexGrow: 1, color: "white", fontSize: "large", backgroundColor: BACKGROUND_SHADE_T0, borderStyle: "none"}}
			/>
			<span className="material-symbols-outlined" onClick={onEnterChatMessage} style={{opacity: textDraft.current.length > 0 ? 1 : 0.5, padding: 5, cursor: textDraft.current.length > 0 ? "pointer" : undefined}}>send</span>
			{
				isSubmittingTopicHint ? (
					<Hovertip enabledOverride={true}><span style={{fontSize: "large"}}>Submit your topic hint</span></Hovertip>
				) : (
					undefined
				)
			}
		</div>
	</div>
}

function getTimeText(timestamp: string): string {
	const secondsSince = Math.floor((Date.now() - new Date(timestamp).getTime())/1000)
	if (secondsSince >= 60) {
		return `${getTimeElapsedString(secondsSince)} ago`
	} else {
		return "just now"
	}
}