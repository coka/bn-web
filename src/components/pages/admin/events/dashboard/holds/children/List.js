import React, { Component } from "react";
import { Typography, withStyles, CardMedia, Hidden } from "@material-ui/core";

import notifications from "../../../../../../../stores/notifications";
import Button from "../../../../../../elements/Button";
import Bigneon from "../../../../../../../helpers/bigneon";
import Divider from "../../../../../../common/Divider";
import HoldRow from "./ChildRow";
import ChildDialog, { HOLD_TYPES } from "./ChildDialog";
import Container from "../../Container";
import Loader from "../../../../../../elements/loaders/Loader";
import user from "../../../../../../../stores/user";
import Dialog from "../../../../../../elements/Dialog";
import copyToClipboard from "../../../../../../../helpers/copyToClipboard";
import { action } from "mobx";

const styles = theme => ({
	root: {},
	desktopHeadingRow: {
		display: "flex",
		paddingLeft: theme.spacing.unit * 2,
		paddingRight: theme.spacing.unit * 2
	}
});

class ChildrenList extends Component {
	constructor(props) {
		super(props);

		this.eventId = this.props.match.params.id;
		this.parentHoldId = this.props.match.params.holdId;

		this.state = {
			activeHoldId: null, //TODO check this is not used and remove if not
			showDialog: null,
			ticketTypes: [],
			children: [],
			holdDetails: {},
			holdType: HOLD_TYPES.NEW,
			showHoldDialog: null,
			deleteId: null,
			expandRowId: null,
			codes: [],
			linkCopiedId: null,
			linkIsCopied: false,
			holdId: this.props.match.params.holdId
		};
	}

	componentDidMount() {
		this.loadEventDetails();

		Bigneon()
			.holds.read({ id: this.state.holdId })
			.then(response => {
				const holdDetails = response.data;
				this.setState({ holdDetails }, () => this.refreshChildren());
			})
			.catch(error => {
				notifications.showFromErrorResponse({
					error,
					defaultMessage: "Failed to load holds."
				});
			});
	}

	loadEventDetails() {
		Bigneon()
			.events.availability({ id: this.eventId })
			.then(response => {
				const { ticket_types } = response.data;
				this.setState({
					ticketTypes: ticket_types
				});
			})
			.catch(error => {
				console.error(error);
				this.setState({ isSubmitting: false });

				notifications.showFromErrorResponse({
					error,
					defaultMessage: "Loading event details failed."
				});
			});
	}

	refreshChildren() {
		if (this.eventId && this.state.holdId) {
			Bigneon()
				.holds.children.index({ hold_id: this.parentHoldId })
				.then(response => {
					//TODO Pagination
					this.setState({ children: response.data.data });
				})
				.catch(error => {
					notifications.showFromErrorResponse({
						error,
						defaultMessage: "Refreshing holds failed."
					});
				});
		}
	}

	deleteChild(id) {
		Bigneon()
			.holds.delete({ id })
			.then(response => {
				this.refreshChildren();
				notifications.show({ message: "Hold deleted.", variant: "success" });
			})
			.catch(error => {
				console.error(error);
				this.setState({ isSubmitting: false });

				notifications.showFromErrorResponse({
					error,
					defaultMessage: "Failed to delete hold."
				});
			});
	}

	onAddHold() {
		this.setState({
			holdType: HOLD_TYPES.NEW,
			activeHoldId: null,
			showDialog: true
		});
	}

	renderDeleteDialog() {
		const { deleteId } = this.state;

		const onClose = () => this.setState({ deleteId: null });

		return (
			<Dialog title={"Delete hold?"} open={!!deleteId} onClose={onClose}>
				<div>
					<Typography>Are you sure you want to delete this hold?</Typography>

					<br/>
					<br/>
					<div style={{ display: "flex" }}>
						<Button style={{ flex: 1, marginRight: 5 }} onClick={onClose}>
							Cancel
						</Button>
						<Button
							style={{ flex: 1, marginLeft: 5 }}
							onClick={() => {
								this.deleteChild(deleteId);
								onClose();
							}}
						>
							Delete
						</Button>
					</div>
				</div>
			</Dialog>
		);
	}

	renderShareableLink() {
		const { showShareableLinkId } = this.state;
		const { classes } = this.props;

		const onClose = () => this.setState({ showShareableLinkId: null });

		const { children } = this.state;

		let url = null;
		if (showShareableLinkId) {
			const hold = children.find(c => c.id === showShareableLinkId);
			const { redemption_code, event_id } = hold;

			url = `${window.location.protocol}//${
				window.location.host
			}/events/${event_id}/tickets?code=${redemption_code}`;
		}

		return (
			<Dialog
				iconUrl={"/icons/link-white.svg"}
				title={"Shareable link"}
				open={!!showShareableLinkId}
				onClose={onClose}
			>
				<div>
					<div className={classes.shareableLinkContainer}>
						<a
							href={url}
							target={"_blank"}
							className={classes.shareableLinkText}
						>
							{url}
						</a>
					</div>
					<div style={{ display: "flex" }}>
						<Button style={{ flex: 1 }} onClick={onClose}>
							Done
						</Button>
					</div>
				</div>
			</Dialog>
		);
	}

	copyToClipboard(id) {
		const { linkCopiedId, children } = this.state;

		const autoClose = () =>
			setTimeout(() => {
				const { linkCopiedId } = this.state;
				if (id === linkCopiedId) {
					this.setState({ linkCopiedId: null });
				}
			}, 2000);

		let url = null;
		if (id) {
			const hold = children.find(c => c.id === id);
			const { redemption_code, event_id } = hold;

			url = `${window.location.protocol}//${
				window.location.host
			}/events/${event_id}/tickets?code=${redemption_code}`;
		}

		if (url) {
			copyToClipboard(url);
			this.setState({ linkCopiedId: id }, () => {
				this.setState({ linkIsCopied: true });
				autoClose();
			});
		}
	}

	renderDesktopHeadings() {
		const { classes } = this.props;
		const headings = [
			"Name",
			"Code",
			"Status",
			"Total Held",
			"Claimed",
			"Remaining",
			"Action"
		];

		const columnStyles = [
			{ flex: 3, textAlign: "left" },
			{ flex: 2, textAlign: "left" },
			{ flex: 3, textAlign: "center" },
			{ flex: 2, textAlign: "center" },
			{ flex: 2, textAlign: "center" },
			{ flex: 2, textAlign: "left" },
			{ flex: 2, textAlign: "right" }
		];

		return (
			<div className={classes.desktopHeadingRow}>
				{headings.map((heading, index) => (
					<Typography
						key={index}
						className={classes.desktopHeadingText}
						style={columnStyles[index]}
					>
						{heading}
					</Typography>
				))}
			</div>
		);
	}

	renderList() {
		const {
			children,
			hoverId,
			expandRowId,
			linkCopiedId,
			linkIsCopied
		} = this.state;
		const { classes } = this.props;

		if (children === null) {
			return <Loader/>;
		}

		if (children && children.length > 0) {
			const ths = [
				"Name",
				"Code",
				"Status",
				"Total Held",
				"Claimed",
				"Remaining",
				"Action"
			];

			const onAction = (id, action) => {
				if (action === "Edit") {
					return this.setState({
						holdId: id,
						showDialog: true,
						holdType: HOLD_TYPES.EDIT
					});
				}
				if (action === "Delete") {
					return this.setState({ deleteId: id });
				}

				if (action === "Link") {
					return this.copyToClipboard(id);
				}
			};

			return (
				<div>
					<Hidden smDown>{this.renderDesktopHeadings()}</Hidden>
					{children.map((ticket, index) => {
						const { id, name, redemption_code, quantity, available } = ticket;

						const claimed = quantity - available;
						const status = claimed === 0 ? "Unclaimed" : "Claimed";

						const tds = [
							name,
							redemption_code,
							status,
							quantity,
							claimed,
							`${quantity - claimed}`
						];

						const active = false; //Might use this later, right now no need to highlight
						const iconColor = active ? "white" : "gray";
						return (
							<HoldRow
								onMouseEnter={e => this.setState({ hoverId: id })}
								onMouseLeave={e => this.setState({ hoverId: null })}
								active={active}
								gray={!(index % 2)}
								key={id}
								actions={[
									{
										id: id,
										name: "Link",
										iconName: "link",
										tooltipText: linkCopiedId === id ? "Link Copied!" : null,
										onClick: onAction.bind(this)
									},
									{
										id: id,
										name: "Edit",
										iconName: "edit",
										onClick: onAction.bind(this)
									},
									{
										id: id,
										name: "Delete",
										iconName: "delete",
										onClick: onAction.bind(this)
									}
								]}
								expanded={expandRowId === id}
								onExpand={() =>
									this.setState({ expandRowId: expandRowId === id ? null : id })
								}
							>
								{tds}
							</HoldRow>
						);
					})}
				</div>
			);
		} else {
			return <Typography variant="body1">No names added yet</Typography>;
		}
	}

	renderDialog() {
		const { ticketTypes, activeHoldId, holdType, holdId } = this.state;
		const eventId = this.eventId;
		const parentHoldId = this.parentHoldId;
		return (
			<ChildDialog
				holdType={holdType}
				open={true}
				eventId={eventId}
				holdId={holdId}
				ticketTypes={ticketTypes}
				onSuccess={parentHoldId => {
					this.refreshChildren();
					this.setState({ showDialog: null });
				}}
				onClose={() => this.setState({ showDialog: null })}
			/>
		);
	}

	render() {
		const { showDialog, holdDetails } = this.state;
		const { classes } = this.props;

		return (
			<Container
				eventId={this.eventId}
				subheading={"tools"}
				layout={"childrenInsideCard"}
			>
				{showDialog && this.renderDialog()}
				{this.renderDeleteDialog()}
				{this.renderShareableLink()}

				<div style={{ display: "flex" }}>
					<Typography variant="title">{holdDetails.name}</Typography>
					<span style={{ flex: 1 }}/>
					{user.hasScope("hold:write") ? (
						<Button onClick={e => this.onAddHold()}>Assign Name To List</Button>
					) : (
						<span/>
					)}
				</div>

				<Divider style={{ marginBottom: 40 }}/>

				{this.renderList()}
			</Container>
		);
	}
}

export default withStyles(styles)(ChildrenList);
