import React from "react";
import PropTypes from "prop-types";
import {
	withStyles,
	Typography,
	Hidden,
	Tooltip,
	Collapse
} from "@material-ui/core";
import classNames from "classnames";
import {
	fontFamilyDemiBold,
	secondaryHex,
	textColorPrimary
} from "../../../../../../config/theme";
import Card from "../../../../../elements/Card";
import ColorTag from "../../../../../elements/ColorTag";

import CustomTooltip from "../../../../../elements/Tooltip";
import Divider from "../../../../../common/Divider";
import servedImage from "../../../../../../helpers/imagePathHelper";

const getTagVariantFromTicketStatus = status => {
	switch (status) {
		case "SoldOut":
			return "secondary";
		case "NoActivePricing":
		case "Cancelled":
		case "Deleted":
		case "SaleEnded":
		case "OnSaleSoon":
			return "disabled";
		case "Published":
			return "green";
		default:
			return "disabled";
	}
};

const DesktopActionButtons = ({ actions, classes }) => {
	return (
		<span className={classes.desktopActionButtonGroup}>
			{actions.map(
				({ label, iconName, clicked, onClick, visible, tooltipText }) => {
					if (!visible) {
						return null;
					}

					const icon = (
						<span key={label} onClick={onClick}>
							<img
								alt={label}
								src={servedImage(
									`/icons/${iconName}-${clicked ? "active" : "gray"}.svg`
								)}
								className={classes.desktopIcon}
							/>
						</span>
					);

					if (tooltipText) {
						return (
							<CustomTooltip key={label} title={tooltipText} forceShow>
								{icon}
							</CustomTooltip>
						);
					} else {
						return icon;
					}
				}
			)}
		</span>
	);
};

const MobileActionButtons = ({ actions, classes }) => {
	return (
		<div className={classes.mobileActionButtonGroup}>
			{actions.map(
				({ label, iconName, clicked, onClick, visible, tooltipText }) => {
					if (!visible) {
						return null;
					}

					const icon = (
						<div
							key={label}
							onClick={onClick}
							className={classes.mobileActionButtonContainer}
						>
							<img
								alt={label}
								src={servedImage(`/icons/${iconName}-active.svg`)}
								className={classes.mobileIcon}
							/>
							<Typography className={classes.mobileActionLabel}>
								{label}
							</Typography>
						</div>
					);

					if (tooltipText) {
						return (
							<CustomTooltip key={label} title={tooltipText} forceShow>
								{icon}
							</CustomTooltip>
						);
					} else {
						return icon;
					}
				}
			)}
		</div>
	);
};

const StatusDot = ({ active, classes, style }) => {
	return (
		<div
			style={style}
			className={classNames({
				[classes.dot]: true,
				[classes.dotActive]: active
			})}
		/>
	);
};

const TicketTypeLabels = ({ ticketTypes, classes, mobile = false }) => {
	const limit = 2;

	const hiddenTypesCount = ticketTypes.length - limit;

	const additionalLabels =
		!mobile && hiddenTypesCount > 0 ? (
			<Tooltip
				classes={{
					popper: classes.tooltipPopper,
					tooltip: classes.tooltipContent
				}}
				PopperProps={{
					popperOptions: {
						modifiers: {
							arrow: {
								// enabled: Boolean(this.state.arrowRef),
								// element: this.state.arrowRef
							}
						}
					}
				}}
				title={(
					<React.Fragment>
						{ticketTypes.map((ticketType, index) => {
							if (index >= limit) {
								return (
									<div
										key={index}
										className={classes.ticketTypeContainer}
										style={{ paddingTop: 3, paddingBottom: 3 }}
									>
										<ColorTag
											size={"small"}
											variant={getTagVariantFromTicketStatus(ticketType.status)}
										>
											{ticketType.name}
										</ColorTag>
									</div>
								);
							}
						})}
					</React.Fragment>
				)}
			>
				<div
					className={classNames({
						[classes.ticketTypeContainer]: true,
						[classes.limitedWidthTicketTypeContainer]: true
					})}
				>
					<Typography className={classes.additionalTicketTypeText}>
						+ {hiddenTypesCount}
					</Typography>
				</div>
			</Tooltip>
		) : null;

	return (
		<div className={classes.ticketTypesContainer}>
			{ticketTypes.map((ticketType, index) => {
				if (mobile || index < limit) {
					return (
						<span
							key={index}
							className={classNames({
								[classes.ticketTypeContainer]: true,
								[classes.limitedWidthTicketTypeContainer]: true
							})}
							style={{ marginBottom: mobile ? 5 : 0 }}
						>
							<ColorTag
								size={"small"}
								variant={getTagVariantFromTicketStatus(ticketType.status)}
							>
								{ticketType.name}
							</ColorTag>
						</span>
					);
				}
			})}
			{additionalLabels}
		</div>
	);
};

const CodeRow = props => {
	const {
		classes,
		id,
		name,
		codes,
		ticketTypes,
		available,
		maxUses,
		discountText,
		hasWriteAccess,
		type,
		onAction,
		linkIsCopied,
		codeIsCopied,
		active,
		onExpand,
		expanded,
		totalUses
	} = props;

	const actions = [
		{
			label: "Copy Code",
			iconName: "copy",
			clicked: codeIsCopied,
			tooltipText: codeIsCopied ? "Code Copied!" : null,
			onClick: () => onAction(id, "CopyCode"),
			visible: true
		},
		{
			label: "Copy link",
			iconName: "link",
			clicked: linkIsCopied,
			tooltipText: linkIsCopied ? "Link Copied!" : null,
			onClick: () => onAction(id, "CopyLink"),
			visible: true
		},
		{
			label: "Edit",
			iconName: "edit",
			onClick: () =>
				onAction(id, type === "Access" ? "EditAccess" : "EditDiscount"),
			visible: hasWriteAccess
		},
		{
			label: "Delete",
			iconName: "delete",
			onClick: () => onAction(id, "Delete"),
			visible: hasWriteAccess
		}
	];

	const displayCode = codes[0]; //TODO eventually there'll be multiple codes

	const remaining = maxUses === 0 ? "Unlimited" : available;

	return (
		<React.Fragment>
			{/*DESKTOP*/}
			<Hidden smDown>
				<Card variant={"raisedLight"} className={classes.desktopCard}>
					<span className={classes.nameSpan}>
						<StatusDot
							active={active}
							classes={classes}
							style={{ marginRight: 10 }}
						/>
						<Typography className={classes.nameText}>{name}</Typography>
					</span>
					<Typography className={classes.codeText}>{displayCode}</Typography>
					<TicketTypeLabels classes={classes} ticketTypes={ticketTypes}/>
					<Typography className={classes.typeText}>{type}</Typography>
					<Typography
						className={classNames({
							[classes.timesUsedText]: true,
							[classes.timesUsedActiveText]: totalUses > 0
						})}
					>
						{totalUses}
					</Typography>
					<Typography className={classes.discountText}>
						{discountText}
					</Typography>
					<DesktopActionButtons actions={actions} classes={classes}/>
				</Card>
			</Hidden>

			{/*MOBILE*/}
			<Hidden mdUp>
				<Card variant={"block"} className={classes.mobileCard}>
					<div className={classes.mobileSummarySection} onClick={onExpand}>
						<div className={classes.mobileRow}>
							<span className={classes.nameSpan}>
								<Typography className={classes.nameText}>{name}</Typography>
								<StatusDot
									active={active}
									classes={classes}
									style={{ marginLeft: 10 }}
								/>
							</span>
							<Typography
								className={classes.mobileHeading}
								style={{ textAlign: "right" }}
							>
								Times used
							</Typography>
						</div>
						<div className={classes.mobileRow}>
							<Typography className={classes.codeTextMobile}>
								{displayCode}
							</Typography>
							<Typography
								className={classNames({
									[classes.timesUsedText]: true,
									[classes.timesUsedActiveText]: totalUses > 0,
									[classes.timesUsedActiveTextMobile]: true
								})}
							>
								{totalUses}
							</Typography>
						</div>
					</div>

					<Collapse in={expanded}>
						<Divider/>

						<div className={classes.mobileExpandedSection}>
							<div className={classes.mobileRow}>
								<div>
									<Typography className={classes.mobileHeading}>
										Type
									</Typography>
									<Typography className={classes.mobileValue}>
										{type}
									</Typography>
								</div>

								<div>
									<Typography className={classes.mobileHeading}>
										Discount
									</Typography>
									<Typography className={classes.mobileValue}>
										{discountText}
									</Typography>
								</div>

								<div>
									<Typography className={classes.mobileHeading}>
										Remaining
									</Typography>
									<Typography className={classes.mobileValue}>
										{remaining}
									</Typography>
								</div>
							</div>

							<div className={classes.mobileTicketTypesContainer}>
								<Typography className={classes.mobileHeading}>
									Ticket types
								</Typography>
								<TicketTypeLabels
									classes={classes}
									ticketTypes={ticketTypes}
									mobile
								/>
							</div>
						</div>

						<Divider/>

						<MobileActionButtons actions={actions} classes={classes}/>
					</Collapse>
				</Card>
			</Hidden>
		</React.Fragment>
	);
};

CodeRow.propTypes = {
	classes: PropTypes.object.isRequired,
	id: PropTypes.string.isRequired,
	name: PropTypes.string.isRequired,
	codes: PropTypes.arrayOf(PropTypes.string).isRequired,
	ticketTypes: PropTypes.arrayOf(
		PropTypes.shape({
			name: PropTypes.string.isRequired,
			status: PropTypes.string.isRequired
		})
	).isRequired,
	available: PropTypes.number,
	maxUses: PropTypes.number.isRequired,
	discountText: PropTypes.string.isRequired,
	hasWriteAccess: PropTypes.bool.isRequired,
	onAction: PropTypes.func.isRequired,
	linkIsCopied: PropTypes.bool,
	codeIsCopied: PropTypes.bool,
	type: PropTypes.oneOf(["Access", "Discount"]).isRequired,
	active: PropTypes.bool.isRequired,
	onExpand: PropTypes.func.isRequired,
	expanded: PropTypes.bool.isRequired,
	totalUses: PropTypes.number.isRequired
};

const styles = theme => {
	return {
		desktopCard: {
			display: "flex",
			height: 70,
			alignItems: "center",
			marginTop: theme.spacing.unit * 2,
			paddingLeft: theme.spacing.unit * 2,
			paddingRight: theme.spacing.unit * 2
		},
		desktopIcon: {
			marginLeft: theme.spacing.unit * 2,
			width: 14,
			height: 14,
			cursor: "pointer"
		},
		nameSpan: {
			flex: 4,
			display: "flex",
			alignItems: "center",
			maxWidth: "90%"
		},
		nameText: {
			fontFamily: fontFamilyDemiBold,
			textAlign: "left",
			overflow: "hidden",
			whiteSpace: "nowrap",
			textOverflow: "ellipsis",
			maxWidth: "80%"
		},
		codeText: {
			color: textColorPrimary,
			flex: 3,
			textAlign: "left",
			overflow: "hidden",
			textOverflow: "ellipsis",
			maxWidth: "80%"
		},
		desktopActionButtonGroup: {
			flex: 3,
			textAlign: "right"
		},
		typeText: {
			flex: 2
		},
		timesUsedText: {
			flex: 2,
			color: textColorPrimary
		},
		timesUsedActiveText: {
			flex: 2,
			color: secondaryHex
		},
		ticketTypesContainer: {
			flex: 2
		},
		ticketTypeContainer: {
			float: "left",
			marginRight: 5,
			display: "flex",
			flexDirection: "column",
			justifyContent: "center"
		},
		limitedWidthTicketTypeContainer: {
			maxWidth: 100,

			[theme.breakpoints.down("sm")]: {
				maxWidth: 200
			}
		},
		additionalTicketTypeText: {
			fontFamily: fontFamilyDemiBold,
			color: secondaryHex,
			cursor: "pointer"
		},
		tooltipPopper: {},
		tooltipContent: {
			backgroundColor: "#FFFFFF",
			boxShadow: "0px 4px 15px 0px rgba(112, 124, 237, 0.17)",
			display: "inline-block",
			maxWidth: 400,
			overflow: "hidden"
		},
		discountText: {
			flex: 2
		},
		dot: {
			backgroundColor: "#dfdfdf",
			width: 7,
			height: 7,
			borderRadius: 5,
			marginBottom: 4
		},
		dotActive: {
			backgroundColor: "#47c68a"
		},

		mobileCard: {
			borderRadius: 6,
			marginTop: theme.spacing.unit * 2,
			padding: theme.spacing.unit * 2
		},
		mobileSummarySection: {
			// display: "flex",
			// alignItems: "center"
		},
		mobileRow: {
			display: "flex",
			flex: 1,
			justifyContent: "space-between"
		},
		mobileHeading: {
			textTransform: "uppercase",
			fontSize: theme.typography.fontSize * 0.75,
			color: textColorPrimary
		},
		mobileValue: {
			fontSize: theme.typography.fontSize * 0.75,
			fontFamily: fontFamilyDemiBold
		},
		timesUsedActiveTextMobile: {
			textAlign: "right"
		},
		codeTextMobile: {
			color: textColorPrimary,
			overflow: "hidden",
			textOverflow: "ellipsis"
			// fontFamily: fontFamilyDemiBold
		},
		mobileExpandedSection: {
			paddingTop: theme.spacing.unit * 2
		},
		mobileTicketTypesContainer: {
			paddingTop: theme.spacing.unit
		},
		mobileActionButtonGroup: {
			flex: 1,
			display: "flex",
			justifyContent: "space-between",
			paddingTop: theme.spacing.unit * 2
		},
		mobileActionLabel: {
			fontFamily: fontFamilyDemiBold,
			fontSize: theme.typography.fontSize * 0.75,
			marginLeft: 4
		},
		mobileActionButtonContainer: {
			display: "flex"
		},
		mobileIcon: {
			width: 12,
			height: 12,
			cursor: "pointer"
		}
	};
};

export default withStyles(styles)(CodeRow);
