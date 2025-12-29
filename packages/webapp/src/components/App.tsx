import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { DynamicWebappConfig } from "common"
import { LobbiesPage } from "./pages/LobbiesPage"
import { LobbyPageUnloaded } from "./pages/LobbyPageUnloaded"

interface Props {
	config: DynamicWebappConfig
}

export function App(props: Props) {
	return <BrowserRouter>
		<Routes>
			<Route path="/" element={<Navigate to="/lobbies" replace />} />
			<Route path="/lobbies" element={<LobbiesPage config={props.config}/>}/>
			<Route path="/lobbies/:lobbyId" element={<LobbyPageUnloaded config={props.config}/>}/>
		</Routes>
	</BrowserRouter>
}