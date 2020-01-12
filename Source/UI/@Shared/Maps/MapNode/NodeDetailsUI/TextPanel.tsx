import {E, GetEntries, WaitXThenRun, DelIfFalsy} from "js-vextensions";
import {Button, Column, Div, DropDown, DropDownContent, DropDownTrigger, Pre, Row, Select, Text, TextArea, TextInput} from "react-vcomponents";
import {BaseComponent, BaseComponentPlus, RenderSource} from "react-vextensions";
import {AttachmentType, GetAttachmentType} from "Store/firebase/nodeRevisions/@AttachmentType";
import {TermAttachment} from "Store/firebase/nodeRevisions/@TermAttachment";
import {GetDisplayPolarity} from "Store/firebase/nodes/$node";
import {ChildEntry, ClaimForm, MapNodeL2} from "Store/firebase/nodes/@MapNode";
import {ArgumentType, GetArgumentTypeDisplayText, MapNodeRevision_titlePattern} from "Store/firebase/nodes/@MapNodeRevision";
import {MapNodeType} from "Store/firebase/nodes/@MapNodeType";
import {GetTerm, GetTermsByName, GetTermsByForm} from "Store/firebase/terms";
import {Term} from "Store/firebase/terms/@Term";
import {GetUser} from "Store/firebase/users";
import {ShowAddTermDialog} from "UI/Database/Terms/TermDetailsUI";
import {ES} from "Utils/UI/GlobalStyles";
import {Link, Observer, Validate, InfoButton} from "vwebapp-framework";
import {NodeDetailsUI_SharedProps} from "../NodeDetailsUI";
import {TermDefinitionPanel} from "../NodeUI/Panels/DefinitionsPanel";

export class TextPanel extends BaseComponent<NodeDetailsUI_SharedProps, {}> {
	render() {
		const {newData, newDataAsL2, newRevisionData, forNew, enabled, Change} = this.props;
		const attachmentType = GetAttachmentType(newDataAsL2);

		const sharedProps = this.props;
		return (
			<>
				{(attachmentType == AttachmentType.None || attachmentType == AttachmentType.References) &&
				<>
					<Title_Base {...sharedProps}/>
					{newData.type == MapNodeType.Claim &&
						<OtherTitles {...sharedProps}/>}
					{newData.type == MapNodeType.Argument &&
						<ArgumentInfo {...sharedProps}/>}
				</>}
				<Row mt={5}>
					<Text>Note: </Text>
					<TextInput enabled={enabled} style={{width: "100%"}}
						value={newRevisionData.note} onChange={val=>Change(newRevisionData.note = val)}/>
				</Row>
				{(attachmentType == AttachmentType.None || attachmentType == AttachmentType.References || attachmentType == AttachmentType.Equation) &&
					<NodeTermsUI {...sharedProps}/>}
			</>
		);
	}
}

class Title_Base extends BaseComponent<NodeDetailsUI_SharedProps, {}> {
	render() {
		const {forNew, enabled, newData, newDataAsL2, newRevisionData, newLinkData, Change} = this.props;
		const claimType = GetAttachmentType(newDataAsL2);

		return (
			<div>
				<Row center>
					<Text>Title (base): </Text>
					<TitleInput {...this.props} titleKey="base" innerRef={a=>a && forNew && this.lastRender_source == RenderSource.Mount && WaitXThenRun(0, ()=>a.DOM && a.DOM_HTML.focus())}/>
				</Row>
				{forNew && newData.type == MapNodeType.Argument &&
					<Row mt={5} style={{background: "rgba(255,255,255,.1)", padding: 5, borderRadius: 5}}>
						<Pre allowWrap={true}>{`
An argument title should be a short "key phrase" that gives the gist of the argument, for easy remembering/scanning.

Examples:
* Shadow during lunar eclipses
* May have used biased sources
* Quote: Socrates

The detailed version of the argument will be embodied in its premises/child-claims.
						`.trim()}
						</Pre>
					</Row>}
			</div>
		);
	}
}

function WillNodeUseQuestionTitleHere(node: MapNodeL2, linkData: ChildEntry) {
	return node.type == MapNodeType.Claim && !node.current.quote && linkData && linkData.form == ClaimForm.YesNoQuestion;
}

class OtherTitles extends BaseComponent<NodeDetailsUI_SharedProps, {}> {
	render() {
		const {newDataAsL2, newRevisionData, forNew, enabled, newLinkData, Change} = this.props;
		const willUseQuestionTitleHere = WillNodeUseQuestionTitleHere(newDataAsL2, newLinkData);
		return (
			<Div>
				<Row key={0} mt={5} style={{display: "flex", alignItems: "center"}}>
					<Pre>Title (negation): </Pre>
					<TitleInput {...this.props} titleKey="negation"/>
				</Row>
				<Row key={1} mt={5} style={{display: "flex", alignItems: "center"}}>
					<Pre>Title (question): </Pre>
					{/* <TextInput enabled={enabled} style={ES({flex: 1})} required={willUseQuestionTitleHere}
						value={newRevisionData.titles["yesNoQuestion"]} onChange={val=>Change(newRevisionData.titles["yesNoQuestion"] = val)}/> */}
					<TitleInput {...this.props} titleKey="yesNoQuestion"/>
				</Row>
				{willUseQuestionTitleHere && forNew &&
					<Row mt={5} style={{background: "rgba(255,255,255,.1)", padding: 5, borderRadius: 5}}>
						<Pre allowWrap={true}>At this location (under a category node), the node will be displayed with the (yes or no) question title.</Pre>
					</Row>}
			</Div>
		);
	}
}

class TitleInput extends BaseComponentPlus({} as {titleKey: string, innerRef?: any} & NodeDetailsUI_SharedProps & React.Props<TextArea>, {}) {
	render() {
		let {titleKey, newDataAsL2, newRevisionData, forNew, enabled, newLinkData, Change} = this.props;
		let extraProps = {};
		if (titleKey == "base") {
			//const hasOtherTitles = newDataAsL2.type == MapNodeType.Claim && newDataAsL2 == AttachmentType.None;
			const hasOtherTitlesEntered = newRevisionData.titles.negation || newRevisionData.titles.yesNoQuestion;
			const willUseYesNoTitleHere = WillNodeUseQuestionTitleHere(newDataAsL2, newLinkData);
			extraProps = {
				required: !hasOtherTitlesEntered && !willUseYesNoTitleHere,
				ref: this.props.innerRef, // if supplied
			};
		}
		return (
			//<TextInput enabled={enabled} style={ES({flex: 1})} value={newRevisionData.titles["negation"]} onChange={val=>Change(newRevisionData.titles["negation"] = val)}/>
			<TextArea
				enabled={enabled} allowLineBreaks={false} style={ES({flex: 1})} pattern={MapNodeRevision_titlePattern} autoSize={true}
				value={newRevisionData.titles[titleKey]} onChange={val=> {
					//let matches = val.Matches(/\{(.+?)\}(\[[0-9]+?\])?/);
					//let termNames = [];
					let cleanedVal = val ? val.replace(/\{(.+?)\}(\[[0-9]+?\])?/g, (m, g1, g2)=> {
						//termNames.push(g1);
						let termName = g1;
						if (newRevisionData.termAttachments == null) {
							newRevisionData.termAttachments = [];
						}
						if (!newRevisionData.termAttachments.Any(a=>a.id == termName)) {
							newRevisionData.termAttachments.push(new TermAttachment({id: termName}));
						}
						return g1;
					}) : null;
					newRevisionData.titles.VSet(titleKey, DelIfFalsy(cleanedVal));
					Change();
				}}
				// for "base" title-key
				{...extraProps}
			/>
		);
	}
}

class ArgumentInfo extends BaseComponent<NodeDetailsUI_SharedProps, {}> {
	render() {
		const {enabled, baseRevisionData, parent, newData, newDataAsL2, newRevisionData, newLinkData, Change} = this.props;

		const polarity = GetDisplayPolarity(newLinkData.polarity, newLinkData.form);

		return (
			<Row mt={5}>
				<Pre>Type: If </Pre>
				<Select options={GetEntries(ArgumentType, name=>GetArgumentTypeDisplayText(ArgumentType[name]))}
					enabled={enabled} value={newRevisionData.argumentType} onChange={val=>{
						Change(newRevisionData.argumentType = val);
					}}/>
				<Pre> premises are true, they impact the parent.</Pre>
			</Row>
		);
	}
}

@Observer
class NodeTermsUI extends BaseComponent<NodeDetailsUI_SharedProps, {}> {
	render() {
		const {enabled, baseRevisionData, parent, newData, newDataAsL2, newRevisionData, newLinkData, Change} = this.props;
		const terms = (newRevisionData.termAttachments || []).map(a=>(Validate("UUID", a.id) == null ? GetTerm(a.id) : null));

		return (
			<>
				<Row center mt={5}>
					<Text style={{fontWeight: "bold"}}>Context (terms):</Text>
					<InfoButton ml={5} text={`
						Context elements are basically term definitions; matching text become hoverable, showing the definition and some other details.

						To add an entry, press "+", type the term you want to define, then find a matching definition or create a new one.
						
						(An alternative is to type curly-brackets around the term in the title-input, creating a new context/term slot with the given name.)
					`.AsMultiline(0)}/>
					<Button ml={5} p="3px 7px" text="+" enabled={enabled} onClick={()=>{
						if (newRevisionData.termAttachments == null) newRevisionData.termAttachments = [];
						newRevisionData.termAttachments.push(new TermAttachment({id: ""}));
						Change();
					}}/>
				</Row>
				{(newRevisionData.termAttachments || []).map((termAttachment, index)=>{
					const term = terms[index];
					return (
						<Row key={index} mt={2}>
							<Text>{index + 1}:</Text>
							<Row ml={5} style={{width: 120}}>
								<TextInput placeholder="Term ID or name..." enabled={enabled} delayChangeTillDefocus={true} style={{width: "100%", fontSize: 13, borderRadius: "5px 0 0 5px"}}
									value={termAttachment.id} onChange={val=>Change(termAttachment.id = val)}/>
							</Row>
							<Row style={{position: "relative", flex: 1}}>
								<DropDown style={{flex: 1}}>
									<DropDownTrigger>
										<Button style={{height: "100%", borderRadius: null, display: "flex", whiteSpace: "normal", padding: 0, fontSize: 13}}
											text={term
												? `${term.name}${term.disambiguation ? ` (${term.disambiguation})` : ""}: ${term.definition}`
												: `(click to search/create)`}/>
									</DropDownTrigger>
									<DropDownContent style={{left: 0, width: 600, zIndex: 1, borderRadius: "0 5px 5px 5px", padding: term ? 10 : 0}}><Column>
										{term && <TermDefinitionPanel term={term} showID={false}/>}
										{!term &&
										<Column>
											<TermSearchOrCreateUI name={termAttachment.id} enabled={enabled} onSelect={id=>Change(termAttachment.id = id)}/>
										</Column>}
									</Column></DropDownContent>
								</DropDown>
							</Row>
							<Button text="X" enabled={enabled} style={{padding: "3px 5px", borderRadius: "0 5px 5px 0"}} onClick={()=>{
								newRevisionData.termAttachments.Remove(termAttachment);
								Change();
							}}/>
						</Row>
					);
				})}
			</>
		);
	}
}

@Observer
class TermSearchOrCreateUI extends BaseComponentPlus({} as {name: string, enabled: boolean, onSelect: (id: string)=>void}, {}) {
	render() {
		const {name, enabled, onSelect} = this.props;
		const termsWithMatchingForm = GetTermsByForm(name.toLowerCase());
		return (
			<>
				{termsWithMatchingForm.length == 0 && <Row style={{padding: 5}}>No terms found with the name/form "{name}".</Row>}
				{termsWithMatchingForm.map((term, index)=>{
					return <FoundTermUI key={term._key} term={term} index={index} enabled={enabled} onSelect={()=>onSelect(term._key)}/>;
				})}
				<Row mt={5} style={{
					//borderTop: `1px solid ${HSLA(0, 0, 1, .5)}`,
					background: termsWithMatchingForm.length % 2 == 0 ? "rgba(30,30,30,.7)" : "rgba(0,0,0,.7)",
					padding: 5,
					borderRadius: "0 0 5px 5px",
				}}>
					<Button text="Create new term" enabled={enabled} onClick={e=>{
						ShowAddTermDialog({name, forms: [name.toLowerCase()]}, onSelect);
					}}/>
				</Row>
			</>
		);
	}
}
export class FoundTermUI extends BaseComponentPlus({} as {term: Term, index: number, enabled: boolean, onSelect: ()=>void}, {}) {
	render() {
		const {term, index, enabled, onSelect} = this.props;
		const creator = GetUser(term.creator);
		return (
			<Row /*mt={index == 0 ? 0 : 5}*/ center
				style={E(
					{
						whiteSpace: "normal", //cursor: "pointer",
						background: index % 2 == 0 ? "rgba(30,30,30,.7)" : "rgba(0,0,0,.7)",
						padding: 5,
					},
					index == 0 && {borderRadius: "5px 5px 0 0"},
					//index > 0 && {borderTop: `1px solid ${HSLA(0, 0, 1, .5)}`},
				)}
				/*onClick={()=>{
				}}*/
			>
				<Link text={`${term._key}\n(by ${creator?.displayName ?? "n/a"})`} style={{fontSize: 13, whiteSpace: "pre"}}
					onContextMenu={e=>e.nativeEvent["passThrough"] = true}
					actionFunc={s=>{
						s.main.page = "database";
						s.main.database.subpage = "terms";
						s.main.database.selectedTermID = term._key;
					}}/>
				<Text ml={5} sel style={{fontSize: 13}}>{term.definition}</Text>
				<Button ml="auto" text="Select" enabled={enabled} style={{flexShrink: 0}} onClick={onSelect}/>
			</Row>
		);
	}
}