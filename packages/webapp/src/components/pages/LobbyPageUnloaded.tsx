import { useEffect } from "react"
import { useError } from "../../hooks/useError"
import { http } from "../../utilities/Http"
import { DynamicWebappConfig, Lobby } from "common"
import { useRefState } from "../../hooks/useRefState"
import { LobbyPage } from "./LobbyPage"
import { LoadingSpinner } from "../LoadingSpinner"
import { Toast } from "../Toast"

export function LobbyPageUnloaded(props: {config: DynamicWebappConfig}) {
	const [error, setError, withError] = useError()
	const lobby = useRefState<Lobby | undefined>(undefined)
	useEffect(() => {
		withError(async () => {
			const lobbyId = parseInt(window.location.pathname.split("/")[2])
			lobby.current = ((await http(`${props.config.httpApiEndpoint}/get-lobby`, {method: "POST", body: JSON.stringify({id: lobbyId})})) as any).lobby
		})
	}, [])
	
	if (lobby.current !== undefined) {
		return <LobbyPage config={props.config} originalLobby={lobby.current}/>
	} else {
		return <div style={{display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", marginTop: 10, gap: 10}}>
			{error !== undefined ? <Toast message={error.message} onClose={() => setError(undefined)}/> : undefined}
			<LoadingSpinner/>
		</div>
	}
}