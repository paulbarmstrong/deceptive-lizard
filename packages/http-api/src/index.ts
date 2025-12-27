import { OptimusDdbClient } from "optimus-ddb-client"
import { ClientError, translateForHttp } from "./utilities/Http"
import { createLobby } from "./handlers/create-lobby"
import { listLobbies } from "./handlers/list-lobbies"
import { getLobby } from "./handlers/get-lobby"

const optimus: OptimusDdbClient = new OptimusDdbClient()

export const handler = translateForHttp(async (event) => {
	if (event.path === "/create-lobby") return await createLobby(event, optimus)
	if (event.path === "/list-lobbies") return await listLobbies(event, optimus)
	if (event.path === "/get-lobby") return await getLobby(event, optimus)
	throw new ClientError("Bad request.")
})
