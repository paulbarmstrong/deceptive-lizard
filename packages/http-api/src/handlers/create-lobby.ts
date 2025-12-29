import { DateTime, Json, stripLobbyForDeceptiveLizard } from "common"
import { OptimusDdbClient } from "optimus-ddb-client"
import { lobbiesTable } from "../utilities/Misc"
import { HttpApiEvent } from "../utilities/Http"

const TOPICS = [
	"George Washington",
	"Abraham Lincoln",
	"Thomas Jefferson",
	"Franklin D. Roosevelt",
	"Theodore Roosevelt",
	"John F. Kennedy",
	"Barack Obama",
	"Ronald Reagan",
	"Donald Trump",
	"Joe Biden",
	"Woodrow Wilson",
	"Harry S. Truman",
	"Dwight D. Eisenhower",
	"Andrew Jackson",
	"James Madison",
	"Ulysses S. Grant",
	"Richard Nixon",
	"Lyndon B. Johnson",
	"John Adams",
	"James Monroe"
]

export async function createLobby(event: HttpApiEvent, optimus: OptimusDdbClient): Promise<Json> {
	const lobby = optimus.draftItem({table: lobbiesTable, item: {
		id: Math.floor(10000 * Math.random()),
		turnPlayerIndex: 0,
		players: [],
		category: "Presidents",
		topics: TOPICS,
		selectedTopicIndex: 0,
		ttl: Math.floor(DateTime.now.plusHours(1).getMillis / 1000)
	}})
	await optimus.commitItems({items: [lobby]})
	return {lobby: stripLobbyForDeceptiveLizard(lobby)}
}