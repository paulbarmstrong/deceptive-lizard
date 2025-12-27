import { useEffect } from "react"
import { useConst } from "./useConst"
import { DeceptiveLizardEvent, Lobby, WsResponse, WsUpdateRequestData } from "common"
import { useRefState } from "./useRefState"

export function useLobby(wsApiEndpoint: string, playerName: string, originalLobby: Lobby, setError: (error: Error | undefined) => void): [Lobby, Array<DeceptiveLizardEvent>, (data: WsUpdateRequestData) => void] {
	const webSocket = useConst<WebSocket>(() => new WebSocket(wsApiEndpoint))
	const lobby = useRefState<Lobby>(originalLobby)
	const events = useRefState<Array<DeceptiveLizardEvent>>([])

	useEffect(() => {
		// get events
	}, [])

	function sendWsUpdate(data: WsUpdateRequestData) {
		webSocket.send(JSON.stringify({action: "update", data}))
	}

	function onWebSocketOpen() {
		sendWsUpdate({lobbyId: originalLobby.id, playerName})
	}

	function onWebSocketMessage(event: MessageEvent) {
		try {
			const rawRes = JSON.parse(event.data)
			if (rawRes !== undefined && rawRes.statusCode >= 400) {
				setError(new Error(rawRes.message))
			}
			const res = rawRes as WsResponse
			if (res.lobby !== undefined) {
				lobby.current = res.lobby
			}
			if (res.event !== undefined) {
				events.current = [...events.current, res.event]
			}
		} catch (error) {
			setError(error as Error)
		}
	}

	useEffect(() => {
		webSocket.addEventListener("open", onWebSocketOpen)
		webSocket.addEventListener("message", onWebSocketMessage)
		return () => {
			webSocket.removeEventListener("open", onWebSocketOpen)
			webSocket.removeEventListener("message", onWebSocketMessage)
			webSocket.close()
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return [lobby.current, events.current, sendWsUpdate]
}