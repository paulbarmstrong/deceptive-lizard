import { useEffect } from "react"
import { useConst } from "./useConst"
import { DynamicWebappConfig, GameEvent, Lobby, Player, WsResponse, WsUpdateRequestData } from "common"
import { useRefState } from "./useRefState"
import { useNavigate } from "react-router-dom"
import { usePersistentRefState } from "./usePersistentRefState"
import { PLAYER_HUE_LOCAL_STORAGE_KEY, PLAYER_NAME_LOCAL_STORAGE_KEY } from "../utilities/Constants"
import { http } from "../utilities/Http"
import { getRandomHue } from "../utilities/Color"
import { useBeforeUnloadAlert } from "./useBeforeUnloadAlert"

export function useLobby(config: DynamicWebappConfig, originalLobby: Lobby, setError: (error: Error | undefined) => void): [Lobby, Player | undefined, Array<GameEvent>, (data: WsUpdateRequestData) => void] {
	const playerName = usePersistentRefState<string>({defaultValue: "", localStorageKey: PLAYER_NAME_LOCAL_STORAGE_KEY})
	const playerHue = usePersistentRefState<number>({defaultValue: getRandomHue(), localStorageKey: PLAYER_HUE_LOCAL_STORAGE_KEY})
	const webSocket = useConst<WebSocket>(() => new WebSocket(config.wsApiEndpoint))
	const lobby = useRefState<Lobby>(originalLobby)
	const connectionId = useRefState<string | undefined>(undefined)
	const gameEvents = useRefState<Array<GameEvent>>([])
	const player = lobby.current.players.find(player => player.connectionId === connectionId.current)
	const navigate = useNavigate()
	useBeforeUnloadAlert(webSocket.readyState === webSocket.OPEN)
	
	useEffect(() => {
		if (playerName.current.length < 3) navigate("/")
	}, [])

	useEffect(() => {
		(async () => {
			try {
				gameEvents.current = ((await http(`${config.httpApiEndpoint}/list-game-events`, {method: "POST", body: JSON.stringify({lobbyId: lobby.current.id})})) as any).gameEvents
			} catch (error) {
				setError(error as Error)
			}
		})()
	}, [])

	function sendWsUpdate(data: WsUpdateRequestData) {
		webSocket.send(JSON.stringify({action: "update", data}))
	}

	function onWebSocketOpen() {
		sendWsUpdate({lobbyId: originalLobby.id, playerName: playerName.current, playerHue: playerHue.current})
	}

	function onWebSocketClose() {
		setError(new Error("WebSocket failed"))
	}

	function onWebSocketMessage(event: MessageEvent) {
		try {
			const rawRes = JSON.parse(event.data)
			if (rawRes?.error?.statusCode >= 400) {
				setError(new Error(rawRes.error.message))
			}
			const res = rawRes as WsResponse
			if (res.lobby !== undefined) {
				lobby.current = res.lobby
			}
			if (res.gameEvent !== undefined) {
				gameEvents.current = [...gameEvents.current, res.gameEvent]
			}
			if (res.connectionId !== undefined) {
				connectionId.current = res.connectionId
			}
		} catch (error) {
			setError(error as Error)
		}
	}

	useEffect(() => {
		webSocket.addEventListener("open", onWebSocketOpen)
		webSocket.addEventListener("message", onWebSocketMessage)
		webSocket.addEventListener("close", onWebSocketClose)
		webSocket.addEventListener("error", onWebSocketClose)
		return () => {
			webSocket.removeEventListener("open", onWebSocketOpen)
			webSocket.removeEventListener("message", onWebSocketMessage)
			webSocket.removeEventListener("close", onWebSocketClose)
			webSocket.removeEventListener("error", onWebSocketClose)
			webSocket.close()
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return [lobby.current, player, gameEvents.current, sendWsUpdate]
}