import React, { Component } from "react";
import { Hidden, Typography, withStyles } from "@material-ui/core";
import moment from "moment-timezone";

import notifications from "../../../../../../stores/notifications";
import Button from "../../../../../elements/Button";
import Bigneon from "../../../../../../helpers/bigneon";
import Divider from "../../../../../common/Divider";
import Container from "../Container";
import Dialog from "../../../../../elements/Dialog";
import Loader from "../../../../../elements/loaders/Loader";
import user from "../../../../../../stores/user";
import CodeRow from "./CodeRow";
import CodeDialog, { CODE_TYPES } from "./CodeDialog";
import {
	fontFamilyDemiBold,
	secondaryHex
} from "../../../../../../config/theme";
import copyToClipboard from "../../../../../../helpers/copyToClipboard";

class CodeList extends Component {
	constructor(props) {
		super(props);

		this.eventId = this.props.match.params.id;

		this.state = {
			showCodeDialogId: null,
			redemptionCodes: [],
			ticketTypes: {},
			codes: [],
			deleteId: null,
			expandRowId: null
		};

		this.onActionRow = this.onActionRow.bind(this);
	}

	componentDidMount() {
		this.loadEventDetails(this.eventId);

		this.refreshCodes();
	}

	loadEventDetails(id) {
		Bigneon()
			.events.ticketTypes.index({ event_id: id })
			.then(response => {
				const { data } = response.data;

				const ticketTypes = {};
				data.forEach(ticketType => {
					if (ticketType.status !== "Cancelled") {
						ticketTypes[ticketType.id] = ticketType;
					}
				});

				this.setState({ ticketTypes });
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

	refreshCodes() {
		Bigneon()
			.events.codes.index({ event_id: this.eventId })
			.then(response => {
				//TODO Pagination

				//Set 'active' value based on the start and end date for code
				const codes = response.data.data;
				const now = moment.utc();
				codes.forEach(c => {
					const { start_date, end_date } = c;
					c.active =
						moment.utc(start_date).isBefore(now) &&
						moment.utc(end_date).isAfter(now);
				});

				this.setState({ codes });
			});
	}

	onAddCode(type) {
		if (type === "discount") {
			this.setState({
				showCodeDialogId: true,
				codeType: CODE_TYPES.NEW_DISCOUNT
			});
		} else {
			this.setState({
				showCodeDialogId: true,
				codeType: CODE_TYPES.NEW_ACCESS
			});
		}
	}

	copyToClipboard(id, type) {
		this.setState({ linkCopiedId: null, codeCopiedId: null });

		const autoClose = () =>
			setTimeout(() => {
				const { linkCopiedId, codeCopiedId } = this.state;
				if (
					(type === "link" && id === linkCopiedId) ||
					(type === "code" && id === codeCopiedId)
				) {
					this.setState({ linkCopiedId: null, codeCopiedId: null });
				}
			}, 2000);

		const { codes } = this.state;
		const code = codes.find(c => c.id === id);

		if (type === "link") {
			if (code.link) {
				copyToClipboard(code.link);
				this.setState({ linkCopiedId: id });
				autoClose();
			} else {
				Bigneon()
					.codes.link({ id })
					.then(response => {
						const { link } = response.data;
						copyToClipboard(link);
						this.setState({ linkCopiedId: id });
						autoClose();
						code.link = link;
					})
					.catch(error => {
						notifications.showFromErrorResponse({
							error,
							defaultMessage: "Failed to fetch link."
						});
					});
			}
		} else {
			if (code && code.redemption_codes) {
				copyToClipboard(code.redemption_codes[0]); //TODO only works with first code. When multiple codes are uploaded, this will have to become a dialog of codes
				this.setState({ codeCopiedId: id });
				autoClose();
			}
		}
	}

	deleteCode(id) {
		Bigneon()
			.codes.del({ id })
			.then(response => {
				this.refreshCodes();
				notifications.show({ message: "Code deleted.", variant: "success" });
			})
			.catch(error => {
				console.error(error);
				this.setState({ isSubmitting: false });

				notifications.showFromErrorResponse({
					error,
					defaultMessage: "Failed to delete code."
				});
			});
	}

	onActionRow(id, action) {
		if (action === "EditDiscount") {
			return this.setState({
				showCodeDialogId: id,
				codeType: CODE_TYPES.EDIT_DISCOUNT
			});
		}

		if (action === "EditAccess") {
			return this.setState({
				showCodeDialogId: id,
				codeType: CODE_TYPES.EDIT_ACCESS
			});
		}

		if (action === "Delete") {
			return this.setState({ deleteId: id });
		}

		if (action === "CopyLink") {
			return this.copyToClipboard(id, "link");
		}

		if (action === "CopyCode") {
			return this.copyToClipboard(id, "code");
		}
	}

	renderDesktopHeadings() {
		const { classes } = this.props;
		const headings = [
			"Name",
			"Code",
			"Ticket Type",
			"Type",
			"Times Used",
			"Discount",
			" "
		];

		const columnStyles = [
			{ flex: 4 },
			{ flex: 3 },
			{ flex: 2 },
			{ flex: 2 },
			{ flex: 2 },
			{ flex: 2 },
			{ flex: 3 }
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
			codes,
			ticketTypes,
			linkCopiedId,
			codeCopiedId,
			expandRowId
		} = this.state;
		const { classes } = this.props;

		if (codes === null) {
			return <Loader/>;
		}

		if (codes && codes.length > 0) {
			return (
				<div>
					<Hidden smDown>{this.renderDesktopHeadings()}</Hidden>
					{codes.map((c, index) => {
						const {
							id,
							name,
							redemption_codes,
							ticket_type_ids,
							discount_in_cents,
							discount_as_percentage,
							max_uses,
							available,
							code_type,
							active,
							total_uses
						} = c;

						const ticketTypesList = [];
						if (Object.keys(ticketTypes).length > 0) {
							ticket_type_ids.forEach(id => {
								// Ticket type might have been cancelled, in which case
								// don't show it

								if (ticketTypes[id]) {
									const { name, status } = ticketTypes[id];
									ticketTypesList.push({ name, status });
								}
							});
							ticketTypesList.sort();
						}

						let type;
						if (code_type === "Discount") {
							type = "Discount";
						} else {
							type = "Access";
						}

						let discountText = "None";
						if (discount_in_cents) {
							discountText = `$${(discount_in_cents / 100).toFixed(2)}`;
						} else if (discount_as_percentage) {
							discountText = `${discount_as_percentage}%`;
						}

						return (
							<CodeRow
								id={id}
								name={name}
								codes={redemption_codes}
								ticketTypes={ticketTypesList}
								available={available}
								maxUses={max_uses}
								discountText={discountText}
								gray={!(index % 2)}
								type={type}
								key={id}
								hasWriteAccess={user.hasScope("code:write")}
								onAction={this.onActionRow}
								linkIsCopied={linkCopiedId === id}
								codeIsCopied={codeCopiedId === id}
								active={active}
								expanded={expandRowId === id}
								onExpand={() =>
									this.setState({ expandRowId: expandRowId === id ? null : id })
								}
								totalUses={total_uses}
							/>
						);
					})}
				</div>
			);
		} else {
			return <Typography variant="body1">No codes created yet</Typography>;
		}
	}

	renderDialog() {
		const { ticketTypes, showCodeDialogId, codeType } = this.state;

		return (
			<CodeDialog
				codeType={codeType}
				eventId={this.eventId}
				codeId={showCodeDialogId}
				ticketTypes={Object.values(ticketTypes)}
				onSuccess={id => {
					this.refreshCodes();
					this.setState({ showCodeDialogId: null });
				}}
				onClose={() => this.setState({ showCodeDialogId: null })}
			/>
		);
	}

	renderDeleteDialog() {
		const { deleteId } = this.state;

		const onClose = () => this.setState({ deleteId: null });

		return (
			<Dialog title={"Delete code?"} open={!!deleteId} onClose={onClose}>
				<div>
					<Typography>Are you sure you want to delete this code?</Typography>

					<br/>
					<br/>
					<div style={{ display: "flex" }}>
						<Button style={{ flex: 1, marginRight: 5 }} onClick={onClose}>
							Cancel
						</Button>
						<Button
							style={{ flex: 1, marginLeft: 5 }}
							onClick={() => {
								this.deleteCode(deleteId);
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

	// renderShareableLinkDialog() {
	// 	const { showShareableLinkId } = this.state;
	// 	const { classes } = this.props;
	//
	// 	const onClose = () => this.setState({ showShareableLinkId: null });
	//
	// 	const { codes } = this.state;
	//
	// 	const urls = [];
	// 	if (showShareableLinkId) {
	// 		const code = codes.find(c => c.id === showShareableLinkId);
	//
	// 		const { redemption_codes, event_id } = code;
	// 		redemption_codes.forEach(c => {
	// 			urls.push(
	// 				`${window.location.protocol}//${
	// 					window.location.host
	// 				}/events/${event_id}/tickets?code=${c}`
	// 			);
	// 		});
	// 	}
	//
	// 	return (
	// 		<Dialog
	// 			iconUrl={"/icons/link-white.svg"}
	// 			title={`Shareable link${urls.length > 1 ? "s" : ""}`}
	// 			open={!!showShareableLinkId}
	// 			onClose={onClose}
	// 		>
	// 			<div>
	// 				{urls.length > 0
	// 					? urls.map((url, index) => (
	// 						<div key={index} className={classes.shareableLinkContainer}>
	// 							<a
	// 								href={url}
	// 								target={"_blank"}
	// 								className={classes.shareableLinkText}
	// 							>
	// 								{url}
	// 							</a>
	// 						</div>
	// 					  ))
	// 					: null}
	// 				<div style={{ display: "flex" }}>
	// 					<Button style={{ flex: 1 }} onClick={onClose}>
	// 						Done
	// 					</Button>
	// 				</div>
	// 			</div>
	// 		</Dialog>
	// 	);
	// }

	renderMobileContent(createButtonsArray) {
		const { classes } = this.props;

		return (
			<Container
				eventId={this.eventId}
				subheading={"tools"}
				layout={"childrenOutsideNoCard"}
			>
				<div className={classes.mobilePageTitleContainer}>
					<Typography className={classes.pageTitle}>Promo Codes</Typography>
				</div>

				<div style={{ display: "flex" }}>{createButtonsArray}</div>

				{this.renderList()}
			</Container>
		);
	}

	renderDesktopContent(createButtonsArray) {
		const { classes } = this.props;

		return (
			<Container
				eventId={this.eventId}
				subheading={"tools"}
				layout={"childrenInsideCard"}
				additionalDesktopMenuContent={(
					<div className={classes.desktopCTAButtonContainer}>
						{createButtonsArray}
					</div>
				)}
			>
				<div style={{ display: "flex", justifyContent: "space-between" }}>
					<div>
						<Typography className={classes.pageSubTitle}>Promotions</Typography>
						<Typography className={classes.pageTitle}>Promo Codes</Typography>
					</div>
					{/*TODO search box*/}
				</div>

				<Divider style={{ marginBottom: 40 }}/>

				{this.renderList()}
			</Container>
		);
	}

	render() {
		const createButtonsArray = [
			user.hasScope("code:write") ? (
				<Button
					key={"discount"}
					variant={"secondary"}
					onClick={e => this.onAddCode("discount")}
					style={{ marginRight: 5, flex: 1 }}
				>
					New&nbsp;Discount&nbsp;Code
				</Button>
			) : null,
			user.hasScope("code:write") ? (
				<Button
					key={"access"}
					variant={"secondary"}
					onClick={e => this.onAddCode("access")}
					style={{ marginLeft: 5, flex: 1 }}
				>
					New&nbsp;Access&nbsp;Code
				</Button>
			) : null
		];

		return (
			<div>
				{this.renderDialog()}
				{this.renderDeleteDialog()}

				<Hidden smDown>{this.renderDesktopContent(createButtonsArray)}</Hidden>

				<Hidden mdUp>{this.renderMobileContent(createButtonsArray)}</Hidden>
			</div>
		);
	}
}

const styles = theme => ({
	root: {},
	shareableLinkContainer: {
		marginTop: theme.spacing.unit * 2,
		marginBottom: theme.spacing.unit * 2
	},
	shareableLinkText: {
		color: secondaryHex,
		fontSize: theme.typography.fontSize * 0.9
	},
	pageSubTitle: {
		fontFamily: fontFamilyDemiBold,
		fontSize: theme.typography.fontSize * 0.75,
		textTransform: "uppercase",
		color: secondaryHex
	},
	pageTitle: {
		fontFamily: fontFamilyDemiBold,
		fontSize: theme.typography.fontSize * 1.75
	},
	mobilePageTitleContainer: {
		marginTop: theme.spacing.unit * 2,
		marginBottom: theme.spacing.unit * 2
	},
	desktopHeadingRow: {
		display: "flex",
		paddingLeft: theme.spacing.unit * 2,
		paddingRight: theme.spacing.unit * 2
	},
	desktopHeadingText: {
		fontFamily: fontFamilyDemiBold
	},
	desktopCTAButtonContainer: {
		display: "flex"
	}
});

export default withStyles(styles)(CodeList);
