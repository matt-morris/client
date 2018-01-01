import {MapNode} from "../../../Store/firebase/nodes/@MapNode";
import {MapNodeType} from "../../../Store/firebase/nodes/@MapNodeType";
import {ShowMessageBox} from "react-vmessagebox";
import {MapType, Map} from "../../../Store/firebase/maps/@Map";
import UserExtraInfo from "../../../Store/firebase/userExtras/@UserExtraInfo";
import {FirebaseData} from "../../../Store/firebase";

// Note: This is currently not used, and probably doesn't even work atm.

//export default async function ResetCurrentDBRoot(database: firebase.Database) {
export default async function ResetCurrentDBRoot() {
	let firebase = store.firebase.helpers;

	/*await firebase.DBRef("nodes").remove();
	let rootNode: MapNode = {
		type: MapNodeType.Category,
		title: "Root",
		agrees: 0, degree: 0, disagrees: 0, weight: 0, // averages, generated by server
		creator: null,
		approved: true,
		accessLevel: 0, voteLevel: 0,
		supportChildren: {},
		opposeChildren: {},
		talkChildren: {},
	};
	await firebase.DBRef(`nodes/${1}`).set(rootNode);
	ShowMessageBox({message: "Done!"});*/

	let data = {} as FirebaseData;
	let _ = true; // placeholder, for prop-less objects, which we want to still be saved

	// general
	// ==========

	/*data.general = {
		lastMapID: 99,
		lastTermID: 0,
		lastTermComponentID: 0,
		lastImageID: 0,
		lastNodeID: 99,
	};*/

	// users
	// ==========

	//let user1Keys = {dev: "Ecq3r7NvgahaMwQQ3PsdgqAFirD2", prod: "EElUKWc2RFNacoSrdgqKbrksQnA3"};
	let user1Key = devEnv ? "Ecq3r7NvgahaMwQQ3PsdgqAFirD2" : "EElUKWc2RFNacoSrdgqKbrksQnA3";
	data.users = {
		[user1Key]: {
			avatarUrl: "https://lh6.googleusercontent.com/-CeOB1puP1U8/AAAAAAAAAAI/AAAAAAAAAZA/nk51qe4EF8w/photo.jpg",
			displayName: "Stephen Wicklund",
			email: "venryx@gmail.com",
			providerData: [
				{
					displayName: "Stephen Wicklund",
					email: "venryx@gmail.com",
					photoURL: "https://lh6.googleusercontent.com/-CeOB1puP1U8/AAAAAAAAAAI/AAAAAAAAAZA/nk51q4EF8w/photo.jpg",
					providerId: "google.com",
					uid: "108415649882206100036"
				}
			]
		},
	}
	data.userExtras = {
		[user1Key]: new UserExtraInfo({
			joinDate: Date.now(),
			permissionGroups: {basic: true, verified: true, mod: true, admin: true},
		}),
	}

	// maps
	// ==========

	data.maps = {
		1: {
			name: "Global",
			type: MapType.Global,
			rootNode: 1
		} as Map,
	};
	data.nodes = {
		1: new MapNode({
			type: MapNodeType.Category, titles: {base: "Root"},
			creator: user1Key, approved: true, votingDisabled: true,
			//agrees: 1, degree: .7, disagrees: 0, weight: 0, // totals/averages, generated by server
			children: {2: {_}, 3: {_}, 4: {_}, 5: {_}, 6: {_}, 7: {_}, 8: {_}, 9: {_}}, //talkRoot: null,
		}),
		2: new MapNode({
			type: MapNodeType.Category, titles: {base: "Science"}, parents: {1: {_}},
			creator: user1Key, approved: true,
		}),
		3: new MapNode({
			type: MapNodeType.Category, titles: {base: "Philosophy"}, parents: {1: {_}},
			creator: user1Key, approved: true,
		}),
		4: new MapNode({
			type: MapNodeType.Category, titles: {base: "Religion"}, parents: {1: {_}},
			creator: user1Key, approved: true,
		}),
		5: new MapNode({
			type: MapNodeType.Category, titles: {base: "History"}, parents: {1: {_}},
			creator: user1Key, approved: true,
		}),
		6: new MapNode({
			type: MapNodeType.Category, titles: {base: "Politics"}, parents: {1: {_}},
			creator: user1Key, approved: true,
		}),
		7: new MapNode({
			type: MapNodeType.Category, titles: {base: "Issues"}, parents: {1: {_}},
			creator: user1Key, approved: true,
		}),
		8: new MapNode({
			type: MapNodeType.Category, titles: {base: "Everyday"}, parents: {1: {_}},
			creator: user1Key, approved: true,
		}),
		9: new MapNode({
			type: MapNodeType.Category, titles: {base: "Others"}, parents: {1: {_}},
			creator: user1Key, approved: true,
		}),
	};
	data.nodeExtras = {//_,
		/*1: {
			/*title:{^}
				revisions:{^}
					1:{^}
						content:"If something in the universe has expanded, its age in years is at least half its expansion distance in [light years]"
						creator:"user123"
						date:"date123"
					2:{^}
						content:"Things that reach a length of X [light years] through expansion (in one direction) (from [negligible size]) are at least X years old"
						creator:"user123"
						date:"date123"
				termBindings:{^}
					"light years":{^}
						light-year-10:{^}
							upvoters:{^}
								user123:true*#/
			agrees: {
				Ecq3r7NvgahaMwQQ3PsdgqAFirD2: .7
			},
			disagrees: {
			}
	}*/
	};
	data.nodeRatings = {//_,
	} as any;

	await firebase.update(data);
	ShowMessageBox({message: "Done!"});
}