import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Collapse from "@material-ui/core/Collapse";
import moment from "moment-timezone";
import { Link } from "react-router-dom";

import { fontFamilyDemiBold, secondaryHex } from "../../../../config/theme";
import ColorTag from "../../../elements/ColorTag";
import Card from "../../../elements/Card";
import HorizontalBreakdownBar from "../../../elements/charts/HorizontalBreakdownBar";
import TicketTypeSalesBarChart from "../../../elements/charts/TicketTypeSalesBarChart";
import DateFlag from "../../../elements/event/DateFlag";
import servedImage from "../../../../helpers/imagePathHelper";
import optimizedImageUrl from "../../../../helpers/optimizedImageUrl";
import TagsContainer from "../../../common/TagsContainer";

const Total = ({ children, color, value, classes }) => (
	<div>
		<Typography className={classes.totalHeading} style={{ color }}>
			{children}
		</Typography>
		<Typography className={classes.totalValue}>{value}</Typography>
	</div>
);

const EventSummaryCard = props => {
	const {
		classes,
		id,
		imageUrl,
		name,
		isExternal,
		venueName,
		menuButton,
		isPublished,
		isOnSale,
		eventDate,
		totalSold,
		totalOpen,
		totalHeld,
		totalCapacity,
		totalSalesInCents,
		isExpanded,
		onExpandClick,
		ticketTypes,
		cancelled,
		eventEnded,
		publishDate,
		status,
		overrideStatus
	} = props;

	const mediaStyle = imageUrl
		? { backgroundImage: `url(${optimizedImageUrl(imageUrl)})` }
		: {};

	const displayEventStartDate = eventDate.format("dddd, MMMM Do YYYY h:mm A");
	const publishedDateAfterNowAndNotDraft = moment.utc(publishDate).isAfter(moment.utc()) && status !== "Draft";

	return (
		<Card variant="block">
			<Grid container spacing={0}>
				<Grid item xs={12} sm={5} lg={4}>
					<Link to={`/admin/events/${id}/dashboard`}>
						<div className={classes.media} style={mediaStyle}>
							{eventDate ? <DateFlag date={eventDate} size="medium"/> : null}
						</div>
					</Link>
				</Grid>

				<Grid
					item
					xs={12}
					sm={7}
					lg={8}
					className={classes.eventDetailsContainer}
				>
					<div className={classes.topRow}>
						<div className={classes.bottomPadding}>
							<Link to={`/admin/events/${id}/dashboard`}>
								<Typography className={classes.eventName}>{name}</Typography>
							</Link>
							<Typography className={classes.venueName}>{venueName}</Typography>
							<Typography className={classes.eventDate}>
								{displayEventStartDate}
							</Typography>
						</div>
						<div>{menuButton}</div>
					</div>
					<Grid container spacing={0} alignItems="center">
						<Grid
							item
							xs={12}
							sm={12}
							md={5}
							lg={5}
							className={classes.bottomPadding}
						>
							<TagsContainer
								cancelled={cancelled}
								isOnSale={isOnSale}
								eventEnded={eventEnded}
								overrideStatus={overrideStatus}
								isPublished={isPublished}
								publishedDateAfterNowAndNotDraft={publishedDateAfterNowAndNotDraft}
								isExternal={isExternal}
							/>
						</Grid>

						<Grid
							item
							xs={12}
							sm={12}
							md={7}
							lg={7}
							className={classes.bottomPadding}
						>
							{!isExternal ? (
								<div className={classes.totalsContainer}>
									<Total
										classes={classes}
										value={totalSold === null ? "-" : totalSold}
										color={"#707ced"}
									>
										Sold
									</Total>

									<div className={classes.totalsDivider}/>

									<Total
										classes={classes}
										value={totalOpen === null ? "-" : totalOpen}
										color={"#afc6d4"}
									>
										Open
									</Total>

									<div className={classes.totalsDivider}/>

									<Total
										classes={classes}
										value={totalHeld === null ? "-" : totalHeld}
										color={"#ff22b2"}
									>
										Held
									</Total>

									<div className={classes.totalsDivider}/>

									<Total
										classes={classes}
										value={totalCapacity === null ? "-" : totalCapacity}
									>
										Capacity
									</Total>

									<div className={classes.totalsDivider}/>

									<Total
										classes={classes}
										value={
											totalSalesInCents === null
												? "-"
												: `$${(totalSalesInCents / 100).toFixed(2)}`
										}
									>
										Sales
									</Total>
								</div>
							) : (
								<div className={classes.totalsContainer}>
									<Typography variant="caption">Externally Ticketed</Typography>
								</div>
							)}
						</Grid>
					</Grid>
					<div>
						{!isExternal && totalSold !== null ? (
							<div className={classes.progressBarContainer}>
								<HorizontalBreakdownBar
									title="Ticket progress"
									values={[
										{ label: "Tickets sold", value: totalSold },
										{ label: "Tickets open", value: totalOpen },
										{ label: "Tickets held", value: totalHeld }
									]}
								/>
							</div>
						) : null}
						<div className={classes.expandIconRowPlaceholder}>&nbsp;</div>
					</div>
				</Grid>
			</Grid>
		</Card>
	);
};

const styles = theme => {
	return {
		media: {
			minHeight: 250,
			height: "100%",
			width: "100%",
			backgroundImage: "linear-gradient(255deg, #e53d96, #5491cc)",
			backgroundRepeat: "no-repeat",
			backgroundSize: "cover",
			backgroundPosition: "center",
			paddingLeft: theme.spacing.unit * 2
		},
		eventDetailsContainer: {
			paddingLeft: theme.spacing.unit * 2,
			display: "flex",
			flexDirection: "column",
			justifyContent: "space-between"
		},
		topRow: {
			display: "flex",
			justifyContent: "space-between",
			paddingRight: theme.spacing.unit
		},
		eventName: {
			paddingTop: theme.spacing.unit * 2,
			textTransform: "capitalize",
			fontFamily: fontFamilyDemiBold,
			fontSize: theme.typography.fontSize * 1.6
		},
		venueName: {
			textTransform: "uppercase",
			fontFamily: fontFamilyDemiBold
		},
		eventDate: {
			color: "#9DA3B4"
		},
		totalsContainer: {
			display: "flex",
			justifyContent: "flex-start"
		},
		totalsDivider: {
			borderLeft: "1px solid",
			borderColor: "#9da3b4",
			opacity: 0.5,
			marginRight: theme.spacing.unit * 2,
			marginLeft: theme.spacing.unit * 2
		},
		totalHeading: {
			fontSize: theme.typography.fontSize * 0.9
		},
		totalValue: {
			fontSize: theme.typography.fontSize
		},
		statusContainer: {
			display: "flex"
		},
		bottomPadding: {
			paddingBottom: theme.spacing.unit * 2
		},
		progressBarContainer: {
			display: "flex",
			paddingRight: theme.spacing.unit * 2
		},
		expandIconRow: {
			display: "flex",
			justifyContent: "center",
			cursor: "pointer",
			paddingBottom: theme.spacing.unit * 2,
			paddingTop: theme.spacing.unit * 2
		},
		expandIconRowPlaceholder: {
			display: "flex",
			justifyContent: "center",
			paddingBottom: theme.spacing.unit * 2,
			paddingTop: theme.spacing.unit * 2
		},
		expandedViewContent: {
			paddingTop: theme.spacing.unit * 2,
			paddingRight: theme.spacing.unit * 3,
			paddingLeft: theme.spacing.unit * 3
		}
	};
};

EventSummaryCard.propTypes = {
	classes: PropTypes.object.isRequired,
	id: PropTypes.string.isRequired,
	imageUrl: PropTypes.string,
	name: PropTypes.string.isRequired,
	venueName: PropTypes.string.isRequired,
	eventDate: PropTypes.object.isRequired,
	menuButton: PropTypes.element.isRequired,
	isPublished: PropTypes.bool.isRequired,
	isOnSale: PropTypes.bool.isRequired,
	totalSold: PropTypes.number,
	totalOpen: PropTypes.number,
	totalHeld: PropTypes.number,
	totalCapacity: PropTypes.number,
	totalSalesInCents: PropTypes.number,
	isExpanded: PropTypes.bool.isRequired,
	onExpandClick: PropTypes.func.isRequired,
	ticketTypes: PropTypes.array.isRequired,
	cancelled: PropTypes.bool,
	eventEnded: PropTypes.bool,
	publishDate: PropTypes.string
};

export default withStyles(styles)(EventSummaryCard);
