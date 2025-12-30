import { useEffect, useRef } from "react"
import { GameEvent, Lobby, Player, WsUpdateRequestData } from "common"
import useInterval from "../../hooks/useInterval"
import { getTimeElapsedString } from "../../utilities/Misc"
import { BACKGROUND_SHADE_T0, BACKGROUND_SHADE_T1, CHAT_HEIGHT } from "../../utilities/Constants"
import { useRefState } from "../../hooks/useRefState"
import { useOnKeyDown } from "../../hooks/useOnKeyDown"
import { Hovertip } from "../Hovertip"
import { PlayerBadge } from "../PlayerBadge"

interface Props {
	lobby: Lobby,
	player: Player | undefined,
	gameEvents: Array<GameEvent>,
	sendWsUpdate: (data: WsUpdateRequestData) => void
}

export function ChatPanel(props: Props) {
	const textDraft = useRefState<string>("")
	const resourceEventContainerRef = useRef<HTMLDivElement>(null)
	const dateRefreshIncr = useRefState<number>(0)
	const latestChatMessageTime = useRef<number>(0)

	const isChoosingCategory: boolean = props.player !== undefined && props.lobby.category === undefined 
		&& props.lobby.players.findIndex(x => x.connectionId === props.player!.connectionId) === 0

	const isSubmittingTopicHint: boolean = props.player !== undefined && props.lobby.category !== undefined && props.lobby.players
		.find(x => x.topicHint === undefined)?.connectionId === props.player.connectionId

	function onEnterChatMessage() {
		if (textDraft.current.length > 0) {
			if (isChoosingCategory) {
				props.sendWsUpdate({
					lobbyId: props.lobby.id,
					category: textDraft.current
				})
			} else if (isSubmittingTopicHint) {
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
		if (resourceEventContainerRef.current != null && props.gameEvents.length > 0 && new Date(props.gameEvents[props.gameEvents.length-1].timestamp).getTime() > latestChatMessageTime.current) {
			resourceEventContainerRef.current.scrollTop = resourceEventContainerRef.current.scrollHeight
			latestChatMessageTime.current = new Date(props.gameEvents[props.gameEvents.length-1].timestamp).getTime()
		}
	}, [resourceEventContainerRef, props.gameEvents])

	useInterval(() => dateRefreshIncr.current += 1, 60000, false, [])

	useOnKeyDown((event: globalThis.KeyboardEvent) => {
		if (event.key === "Enter" && !event.shiftKey && document.activeElement && document.activeElement.className === "TextChatInput") {
			event.preventDefault()
			onEnterChatMessage()
		}
	}, [textDraft, isChoosingCategory, isSubmittingTopicHint])

	return <div style={{display: "flex", flexDirection: "column", alignItems: "stretch"}}>
		<div ref={resourceEventContainerRef} style={{display: "flex", flexDirection: "column", alignItems: "stretch", borderStyle: "solid", 
			borderRadius: 4, borderBottomRightRadius: 0, borderBottomLeftRadius: 0, borderColor: BACKGROUND_SHADE_T1, gap: 3, padding: 3, height: CHAT_HEIGHT, 
			overflowY: "scroll"}}>
			{
				props.gameEvents.map(gameEvent => <div key={gameEvent.eventId} style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
					<div style={{display: "flex", alignItems: "center", gap: gameEvent.type === "chat" ? undefined: 4}}>
						<PlayerBadge playerName={gameEvent.playerName}/>
						{
							(() => {
								if (gameEvent.type === "chat") {
									return <span>: {gameEvent.text}</span>
								} else if (gameEvent.type === "join") {
									return <span>joined, triggering a fresh round.</span>
								} else if (gameEvent.type === "leave") {
									return <span>left, triggering a fresh round.</span>
								} else if (gameEvent.type === "topic-hint") {
									return <span>submitted topic hint "{gameEvent.text}".</span>
								} else if (gameEvent.type === "vote") {
									if (gameEvent.text !== undefined) {
										return <span>set their vote to {gameEvent.text}.</span>
									} else {
										return <span>cleared their vote.</span>
									}
								} else if (gameEvent.type === "round-end") {
									return <span>was the deceptive lizard. The lobby voted for {gameEvent.text}.</span>
								} else if (gameEvent.type === "round-reset") {
									return <span>reset the round.</span>
								} else if (gameEvent.type === "category") {
									return <span>set the category to "{gameEvent.text}".</span>
								} else if (gameEvent.type === "new-round-leader") {
									return <span> became the round leader.</span>
								}
							})()
						}
					</div>
					<div style={{padding: 4, fontSize: "medium", textAlign: "right"}}>{getTimeText(gameEvent.timestamp)}</div>
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
			{
				isChoosingCategory ? (
					<Hovertip enabledOverride={true}><span style={{fontSize: "large"}}>Submit a category</span></Hovertip>
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
