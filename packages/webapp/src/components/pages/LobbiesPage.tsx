import { BACKGROUND_SHADE_T0, BACKGROUND_SHADE_T1, MENU_WIDTH, PLAYER_NAME_LOCAL_STORAGE_KEY } from "../../utilities/Constants"
import { DynamicWebappConfig, Lobby } from "common"
import { http } from "../../utilities/Http"
import { useRefState } from "../../hooks/useRefState"
import useInterval from "../../hooks/useInterval"
import { useError } from "../../hooks/useError"
import { LoadingSpinner } from "../LoadingSpinner"
import { Hovertip } from "../Hovertip"
import { usePersistentRefState } from "../../hooks/usePersistentRefState"
import { PlayersPanel } from "../panels/PlayersPanel"

interface Props {
	config: DynamicWebappConfig
}

export function LobbiesPage(props: Props) {
	const playerName = usePersistentRefState<string>({defaultValue: "", localStorageKey: PLAYER_NAME_LOCAL_STORAGE_KEY})
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

	useInterval(refreshLobbies, 2000, true, [])

	return <div style={{display: "flex", justifyContent: "center"}}>
		<div style={{display: "flex", flexDirection: "column", alignItems: "stretch", gap: 10, paddingTop: 10, width: MENU_WIDTH}}>
			<div style={{fontSize: "xx-large", textAlign: "center"}}>Deceptive Lizard</div>
			<div style={{textAlign: "left"}}>Player name:</div>
			<div style={{borderColor: BACKGROUND_SHADE_T1, borderStyle: "solid", display: "flex", justifyContent: "space-between", alignItems: "center", textAlign: "left", height: 40}}>
				<input value={playerName.current} onChange={e => playerName.current = e.target.value}
					style={{paddingLeft: 10, paddingRight: 10, flexGrow: 1, color: "white", fontSize: "large", backgroundColor: BACKGROUND_SHADE_T0, borderStyle: "none"}}
				/>
				{
					playerName.current.length < 3 ? (
						<Hovertip enabledOverride={true}>Please add your name</Hovertip>
					) : (
						undefined
					)
				}
			</div>
			<div style={{textAlign: "left"}}>Lobbies:</div>
			<div style={{display: "flex", gap: 10, flexDirection: "column", justifyContent: "stretch", flexWrap: "wrap"}}>
				{
					lobbies.current !== undefined ? (
						lobbies.current.map(lobby => <a key={lobby.id} href={`/lobbies/${lobby.id}`} style={{
							display: "flex", flexDirection: "column", justifyContent: "center", gap: 10, borderColor: BACKGROUND_SHADE_T1, borderStyle: "solid",
							borderRadius: 4, padding: 10
						}}>
							<div style={{fontSize: "x-large", textAlign: "center"}}>Lobby #{lobby.id}</div>
							{
								lobby.players.length > 0 ? (
									<PlayersPanel player={undefined} lobby={lobby} sendWsUpdate={() => undefined}/>
								) : (
									undefined
								)
							}
						</a>)
					) : (
						<LoadingSpinner/>
					)
				}
			</div>
			<div style={{cursor: "pointer", backgroundColor: BACKGROUND_SHADE_T1, borderRadius: 4, padding: 20, fontSize: "large", fontWeight: "bold", textAlign: "center"}} onClick={createLobby}>CREATE NEW LOBBY</div>
		</div>
	</div>
}