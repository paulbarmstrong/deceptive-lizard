import { BACKGROUND_SHADE_T1, MENU_WIDTH } from "../../utilities/Constants"
import { DynamicWebappConfig, Lobby } from "common"
import { useLobby } from "../../hooks/useLobby"
import { ChatPanel } from "../panels/ChatPanel"
import { TopicsPanel } from "../panels/TopicsPanel"
import { useError } from "../../hooks/useError"
import { StatusPanel } from "../panels/StatusPanel"
import { PlayersPanel } from "../panels/PlayersPanel"
import { PlayerInfoPanel } from "../panels/PlayerInfoPanel"
import { Toast } from "../Toast"

interface Props {
	config: DynamicWebappConfig,
	originalLobby: Lobby
}

export function LobbyPage(props: Props) {
	const [error, setError, withError] = useError()
	const [lobby, player, gameEvents, sendWsUpdate] = useLobby(props.config, props.originalLobby, setError)

	return <div style={{display: "flex", justifyContent: "center"}}>
		<div style={{width: MENU_WIDTH, display: "flex", flexDirection: "column", alignItems: "stretch", gap: 10, paddingTop: 10}}>
			<div style={{fontSize: "xx-large", textAlign: "center"}}>Deceptive Lizard: Lobby {lobby.id}</div>
			{error !== undefined ? <Toast message={error.message} onClose={() => setError(undefined)}/> : undefined}
			<div style={{textAlign: "left"}}>Game status:</div>
			<StatusPanel lobby={lobby} player={player}/>
			<div style={{textAlign: "left"}}>Players:</div>
			<PlayersPanel lobby={lobby} player={player} sendWsUpdate={sendWsUpdate}/>
			<div style={{textAlign: "left"}}>Chat:</div>
			<ChatPanel lobby={lobby} player={player} gameEvents={gameEvents} sendWsUpdate={sendWsUpdate}/>
			<div style={{textAlign: "left"}}>Topics:</div>
			<TopicsPanel lobby={lobby}/>
			<div style={{textAlign: "left"}}>Player information:</div>
			<PlayerInfoPanel lobby={lobby} player={player}/>
		</div>
	</div>
}