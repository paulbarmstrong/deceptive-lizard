import { useEffect } from "react"
import { useConst } from "./useConst"
import { WebSocketRes } from "common"

export function useWs(wsApiEndpoint: string) {
	const webSocket = useConst<WebSocket>(() => new WebSocket(wsApiEndpoint))

	const onWebSocketOpen = () => {
		webSocket.send(JSON.stringify({
			action: "update",
			data: {
				playerName: "Paul"
			}
		}))
	}

	const onWebSocketMessage = (event: MessageEvent) => {
		const res = JSON.parse(event.data) as WebSocketRes
		console.log(`WS message: ${JSON.stringify(res)}`)
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
}