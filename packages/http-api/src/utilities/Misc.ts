import { lobbyZod } from "common"
import { Table } from "optimus-ddb-client"

export const lobbiesTable = new Table({
	tableName: "DeceptiveLizardLobbies",
	itemSchema: lobbyZod,
	partitionKey: "id"
})