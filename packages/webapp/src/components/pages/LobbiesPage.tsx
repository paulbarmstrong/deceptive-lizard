import { BACKGROUND_SHADE_T1, MENU_WIDTH, TOPIC_WIDTH } from "../../utilities/Constants"
import { DynamicWebappConfig, Lobby } from "common"
import { http } from "../../utilities/Http"
import { useRefState } from "../../hooks/useRefState"
import useInterval from "../../hooks/useInterval"
import { useError } from "../../hooks/useError"
import { LoadingSpinner } from "../LoadingSpinner"

interface Props {
	config: DynamicWebappConfig
}

export function LobbiesPage(props: Props) {
	const [error, setError, withError] = useError()
	const lobbies = useRefState<Array<Lobby> | undefined>(undefined)

	async function refreshLobbies() {
		if (!document.hidden) {
			await withError(async () => {
				lobbies.current = ((await http(`${props.config.httpApiEndpoint}/list-lobbies`, {method: "POST"})) as any).lobbies
			})
		}
	}

	async function createLobby() {
		await withError(async () => {
			await http(`${props.config.httpApiEndpoint}/create-lobby`, {method: "POST"})
		})
		await refreshLobbies()
	}

	useInterval(refreshLobbies, 10000, true, [])

	return <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: 10, paddingTop: 10}}>
		<div style={{fontSize: "xxx-large"}}>Deceptive Lizard</div>
		<div style={{cursor: "pointer", backgroundColor: BACKGROUND_SHADE_T1, borderRadius: 4, padding: 20, fontSize: "large", fontWeight: "bold", width: MENU_WIDTH, textAlign: "center"}} onClick={createLobby}>CREATE LOBBY</div>
		<div style={{width: MENU_WIDTH, display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap"}}>
			{
				lobbies.current !== undefined ? (
					lobbies.current.map(lobby => <a key={lobby.id} href={`/lobbies/${lobby.id}`} style={{
						display: "flex", flexDirection: "column", gap: 10, backgroundColor: BACKGROUND_SHADE_T1,
						borderRadius: 4, padding: 20, fontSize: "large", width: TOPIC_WIDTH
					}}>
						<div style={{fontSize: "large", textAlign: "center"}}>{lobby.id}</div>
						{lobby.players.length > 0 ? (
							<div style={{display: "flex", flexDirection: "column", gap: 3}}>{
								lobby.players.map(player => <span key={player.connectionId}>{player.name}</span>)
							}</div>
						) : (
							undefined
						)}
					</a>)
				) : (
					<LoadingSpinner/>
				)
			}
		</div>
	</div>
}