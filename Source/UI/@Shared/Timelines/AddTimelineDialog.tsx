import {GetUser, GetUserID} from "../../../Store/firebase/users";
import {BoxController, ShowMessageBox} from "../../../Frame/UI/VMessageBox";
import Column from "../../../Frame/ReactComponents/Column";
import Row from "../../../Frame/ReactComponents/Row";
import TextInput from "../../../Frame/ReactComponents/TextInput";
import {Pre, GetInnerComp} from "../../../Frame/UI/ReactGlobals";
import {Term, TermType} from "../../../Store/firebase/terms/@Term";
import AddTerm from "../../../Server/Commands/AddTerm";
import {Map, MapType} from "../../../Store/firebase/maps/@Map";
import AddMap from "../../../Server/Commands/AddMap";
import {Layer} from "Store/firebase/layers/@Layer";
import TimelineDetailsUI from "./TimelineDetailsUI";
import AddTimeline from "../../../Server/Commands/AddTimeline";
import {Timeline} from "../../../Store/firebase/timelines/@Timeline";

export function ShowAddTimelineDialog(userID: string, mapID: number) {
	let newTimeline = new Timeline({
		name: "",
		creator: GetUserID(),
	});
	
	let error = null;
	let Change = (..._)=>boxController.UpdateUI();
	let boxController: BoxController = ShowMessageBox({
		title: `Add timeline`, cancelButton: true,
		messageUI: ()=> {
			boxController.options.okButtonClickable = error == null;
			return (
				<Column style={{padding: `10px 0`, width: 600}}>
					<TimelineDetailsUI baseData={newTimeline} forNew={true} onChange={(val, ui)=>Change(newTimeline = val, error = ui.GetValidationError())}/>
					{error && error != "Please fill out this field." && <Row mt={5} style={{color: "rgba(200,70,70,1)"}}>{error}</Row>}
				</Column>
			);
		},
		onOK: ()=> {
			new AddTimeline({mapID, timeline: newTimeline}).Run();
		}
	});
}