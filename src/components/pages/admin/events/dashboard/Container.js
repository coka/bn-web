import React, { Component } from "react";
import { Hidden, Typography, withStyles } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import { Link } from "react-router-dom";
import moment from "moment";
import PropTypes from "prop-types";
import { observer } from "mobx-react";
import classnames from "classnames";

import notifications from "../../../../../stores/notifications";
import Bigneon from "../../../../../helpers/bigneon";
import PageHeading from "../../../../elements/PageHeading";
import Card from "../../../../elements/Card";
import Button from "../../../../elements/Button";
import StyledLink from "../../../../elements/StyledLink";
import user from "../../../../../stores/user";
import ColorTag from "../../../../elements/ColorTag";
import VisitEventPage from "../../../../elements/VisitEventPage";
import Loader from "../../../../elements/loaders/Loader";
import Divider from "../../../../common/Divider";
import AffiliateLinkGeneratorDialog from "./links/AffiliateLinkGeneratorDialog";
import FBPixelDialog from "./marketing/FBPixelDialog";
import TagsContainer from "../../../../common/TagsContainer";

const isActiveReportMenu = type =>
	(window.location.pathname || "").endsWith(`/${type}`);

@observer
class EventDashboardContainer extends Component {
	constructor(props) {
		super(props);

		this.state = {
			event: null,
			anchorToolsEl: null,
			anchorReportsEl: null,
			anchorMarketingEl: null,
			anchorOrdersEl: null,
			showAffiliateLinkDialog: false,
			showFBPixelDialog: false
		};
	}

	componentDidMount() {
		this.loadEventDetails(this.props.eventId);
	}

	handleToolsMenu(event) {
		this.setState({ anchorToolsEl: event.currentTarget });
	}

	handleReportsMenu(event) {
		this.setState({ anchorReportsEl: event.currentTarget });
	}

	handleMarketingMenu(event) {
		this.setState({ anchorMarketingEl: event.currentTarget });
	}

	handleOrdersMenu(event) {
		this.setState({ anchorOrdersEl: event.currentTarget });
	}

	handleToolsMenuClose() {
		this.setState({ anchorToolsEl: null });
	}

	handleReportsMenuClose() {
		this.setState({ anchorReportsEl: null });
	}

	handleMarketingMenuClose() {
		this.setState({ anchorMarketingEl: null });
	}

	handleOrdersMenuClose() {
		this.setState({ anchorOrdersEl: null });
	}

	loadEventDetails(eventId) {
		Bigneon()
			.events.dashboard({ id: eventId })
			.then(response => {
				const { last_30_days, event } = response.data;

				this.setState({
					event
				});
			})
			.catch(error => {
				console.error(error);
				this.setState({ isSubmitting: false });

				notifications.showFromErrorResponse({
					defaultMessage: "Loading event details failed.",
					error
				});
			});
	}

	openAffiliateLinkDialog() {
		this.setState({ showAffiliateLinkDialog: true });
		this.handleToolsMenuClose();
	}

	openFBPixelDialog() {
		this.setState({ showFBPixelDialog: true });
		this.handleToolsMenuClose();
	}

	renderToolsMenu() {
		const { anchorToolsEl } = this.state;
		const open = Boolean(anchorToolsEl);
		const { event } = this.state;

		return (
			<Menu
				id="menu-appbar"
				anchorEl={anchorToolsEl}
				anchorOrigin={{
					vertical: "top",
					horizontal: "right"
				}}
				transformOrigin={{
					vertical: "top",
					horizontal: "right"
				}}
				open={open}
				onClose={this.handleToolsMenuClose.bind(this)}
			>
				{user.hasScope("hold:read") ? (
					<Link to={`/admin/events/${event.id}/dashboard/holds`}>
						<MenuItem onClick={this.handleToolsMenuClose.bind(this)}>
							Smart holds
						</MenuItem>
					</Link>
				) : (
					<span/>
				)}
				{user.hasScope("code:read") ? (
					<Link to={`/admin/events/${event.id}/dashboard/codes`}>
						<MenuItem onClick={this.handleToolsMenuClose.bind(this)}>
							Promo codes
						</MenuItem>
					</Link>
				) : (
					<span/>
				)}
				{user.hasScope("org:users") ? (
					<Link to={`/admin/events/${event.id}/external-access`}>
						<MenuItem onClick={this.handleToolsMenuClose.bind(this)}>
							Promoter access
						</MenuItem>
					</Link>
				) : (
					<span/>
				)}
				{user.hasScope("event:view-guests") ? (
					<a href={`/exports/events/${event.id}/guests`} target="_blank">
						<MenuItem onClick={this.handleToolsMenuClose.bind(this)}>
							Export guest list
						</MenuItem>
					</a>
				) : (
					<span/>
				)}
				{/*TODO remove this when new order management is live*/}
				{/*{user.hasScope("order:refund") ? (*/}
				{/*	<Link to={`/admin/events/${event.id}/manage-orders`}>*/}
				{/*		<MenuItem onClick={this.handleToolsMenuClose.bind(this)}>*/}
				{/*			Manage orders*/}
				{/*		</MenuItem>*/}
				{/*	</Link>*/}
				{/*) : (*/}
				{/*	<span/>*/}
				{/*)}*/}
				{user.hasEventAnnouncements ? ( //TODO use scope when API is ready
					<Link to={`/admin/events/${event.id}/fan-notifications`}>
						<MenuItem onClick={this.handleToolsMenuClose.bind(this)}>
							Fan Notifications
						</MenuItem>
					</Link>
				) : (
					<span/>
				)}
				{user.hasEventAnnouncements ? (
					<Link to={`/admin/events/${event.id}/announcements`}>
						<MenuItem onClick={this.handleToolsMenuClose.bind(this)}>
							Announcements
						</MenuItem>
					</Link>
				) : (
					<span/>
				)}
			</Menu>
		);
	}

	renderReportsMenu() {
		const { anchorReportsEl } = this.state;
		const { classes } = this.props;
		const open = Boolean(anchorReportsEl);
		const { event } = this.state;

		const {
			hasTransactionReports,
			hasEventSummaryReports,
			hasScanCountReports,
			hasTicketCountReports,
			hasEventAuditReports,
			hasEventSummaryAuditReports,
			hasEventPromoCodesReport
		} = user;
		const items = [];

		if (hasEventSummaryReports) {
			items.push(
				<Link
					key="summary"
					to={`/admin/events/${event.id}/dashboard/reports/summary`}
				>
					<MenuItem
						selected={isActiveReportMenu("summary")}
						onClick={this.handleReportsMenuClose.bind(this)}
					>
						Event summary
					</MenuItem>
				</Link>
			);
		}

		if (hasTransactionReports) {
			items.push(
				<Link
					key="tx"
					to={`/admin/events/${event.id}/dashboard/reports/transactions`}
				>
					<MenuItem
						selected={isActiveReportMenu("transactions")}
						onClick={this.handleReportsMenuClose.bind(this)}
					>
						Transaction detail report
					</MenuItem>
				</Link>
			);
		}

		if (hasTicketCountReports) {
			items.push(
				<Link
					key="ticket-counts"
					to={`/admin/events/${event.id}/dashboard/reports/ticket-counts`}
				>
					<MenuItem
						selected={isActiveReportMenu("ticket-counts")}
						onClick={this.handleReportsMenuClose.bind(this)}
					>
						Ticket counts report
					</MenuItem>
				</Link>
			);
		}

		if (hasScanCountReports) {
			items.push(
				<Link
					key="ticket-counts"
					to={`/admin/events/${event.id}/dashboard/reports/scan-counts`}
				>
					<MenuItem
						selected={isActiveReportMenu("scan-counts")}
						onClick={this.handleReportsMenuClose.bind(this)}
					>
						Scan count report
					</MenuItem>
				</Link>
			);
		}

		if (hasEventAuditReports) {
			items.push(
				<Link
					key="audit"
					to={`/admin/events/${event.id}/dashboard/reports/audit`}
				>
					<MenuItem
						selected={isActiveReportMenu("audit")}
						onClick={this.handleReportsMenuClose.bind(this)}
					>
						Event audit report
					</MenuItem>
				</Link>
			);
		}

		if (hasEventSummaryAuditReports) {
			items.push(
				<Link
					key="summary-audit"
					to={`/admin/events/${event.id}/dashboard/reports/summary-audit`}
				>
					<MenuItem
						selected={isActiveReportMenu("summary-audit")}
						onClick={this.handleReportsMenuClose.bind(this)}
					>
						Event summary audit report
					</MenuItem>
				</Link>
			);
		}

		if (hasEventPromoCodesReport) {
			items.push(
				<Link
					key="promo-codes"
					to={`/admin/events/${event.id}/dashboard/reports/promo-codes`}
				>
					<MenuItem
						selected={isActiveReportMenu("promo-codes")}
						onClick={this.handleReportsMenuClose.bind(this)}
					>
						Event promo codes report
					</MenuItem>
				</Link>
			);
		}

		if (items.length === 0) {
			items.push(
				<MenuItem key="none" onClick={this.handleReportsMenuClose.bind(this)}>
					No reports available
				</MenuItem>
			);
		}

		return (
			<Menu
				id="menu-appbar"
				anchorEl={anchorReportsEl}
				anchorOrigin={{
					vertical: "top",
					horizontal: "right"
				}}
				transformOrigin={{
					vertical: "top",
					horizontal: "right"
				}}
				open={open}
				onClose={this.handleReportsMenuClose.bind(this)}
				MenuListProps={{
					className: classes.menuDropdownContainer
				}}
			>
				{items}
			</Menu>
		);
	}

	renderMarketingMenu() {
		const { anchorMarketingEl } = this.state;
		const open = Boolean(anchorMarketingEl);
		const { event } = this.state;

		const items = [];

		//TODO use facebook scope
		if (user.hasScope("event:write")) {
			items.push(
				<Link
					key="fb-events"
					to={`/admin/events/${event.id}/dashboard/marketing/fb-events`}
				>
					<MenuItem
						selected={isActiveReportMenu("fb-events")}
						onClick={this.handleMarketingMenuClose.bind(this)}
					>
						Facebook Events
					</MenuItem>
				</Link>
			);
		}
		if (user.hasScope("event:write")) {
			items.push(
				<MenuItem
					key="affiliate-link"
					onClick={this.openAffiliateLinkDialog.bind(this)}
				>
					Affiliate Tracking Links
				</MenuItem>
			);
		}
		if (user.hasScope("event:write")) {
			items.push(
				<MenuItem key="pixel-id" onClick={this.openFBPixelDialog.bind(this)}>
					Facebook Pixel ID
				</MenuItem>
			);
		}

		if (items.length === 0) {
			items.push(
				<MenuItem key="none" onClick={this.handleMarketingMenuClose.bind(this)}>
					No marketing available
				</MenuItem>
			);
		}

		return (
			<Menu
				id="menu-appbar"
				anchorEl={anchorMarketingEl}
				anchorOrigin={{
					vertical: "top",
					horizontal: "right"
				}}
				transformOrigin={{
					vertical: "top",
					horizontal: "right"
				}}
				open={open}
				onClose={this.handleMarketingMenuClose.bind(this)}
			>
				{items}
			</Menu>
		);
	}

	renderOrdersMenu() {
		const { anchorOrdersEl } = this.state;
		const open = Boolean(anchorOrdersEl);
		const { event } = this.state;

		const items = [];

		if (user.hasScope("order:read")) {
			items.push(
				<Link
					key="manage-orders"
					to={`/admin/events/${event.id}/dashboard/orders/manage`}
				>
					<MenuItem onClick={this.handleOrdersMenuClose.bind(this)}>
						Manage orders
					</MenuItem>
				</Link>
			);
		}

		//TODO this scope will probably be something else later
		// if (user.hasScope("order:read")) {
		// 	items.push(
		// 		<Link
		// 			key="orders-activity"
		// 			to={`/admin/events/${event.id}/dashboard/orders/activity`}
		// 		>
		// 			<MenuItem onClick={this.handleOrdersMenuClose.bind(this)}>
		// 				Event activity
		// 			</MenuItem>
		// 		</Link>
		// 	);
		// }

		if (items.length === 0) {
			items.push(
				<MenuItem key="none" onClick={this.handleOrdersMenuClose.bind(this)}>
					No options available
				</MenuItem>
			);
		}

		return (
			<Menu
				id="menu-appbar"
				anchorEl={anchorOrdersEl}
				anchorOrigin={{
					vertical: "top",
					horizontal: "right"
				}}
				transformOrigin={{
					vertical: "top",
					horizontal: "right"
				}}
				open={open}
				onClose={this.handleOrdersMenuClose.bind(this)}
			>
				{items}
			</Menu>
		);
	}

	render() {
		const { event, showAffiliateLinkDialog, showFBPixelDialog } = this.state;
		const {
			classes,
			children,
			subheading,
			layout,
			additionalDesktopMenuContent,
			removeCardSidePadding
		} = this.props;
		const organizationId = user.currentOrganizationId;

		if (!event) {
			return <Loader/>;
		}

		const { id, publish_date, on_sale, localized_times, status, override_status, cancelled_at, is_external } = event;
		const isPublished = moment.utc(publish_date).isBefore(moment.utc());
		const isOnSale = isPublished && moment.utc(on_sale).isBefore(moment.utc());

		let eventEnded = false;
		if (localized_times && localized_times.event_end) {
			const endDate = moment.utc(localized_times.event_end);
			const now = moment.utc();
			if (endDate.diff(now) < 0) {
				eventEnded = true;
			}
		}

		const publishedDateAfterNowAndNotDraft =
			moment.utc(publish_date).isAfter(moment.utc()) && status !== "Draft";

		return (
			<div>
				<AffiliateLinkGeneratorDialog
					eventId={id}
					open={showAffiliateLinkDialog}
					onClose={() => this.setState({ showAffiliateLinkDialog: false })}
				/>
				<FBPixelDialog
					eventId={id}
					organizationId={organizationId}
					open={showFBPixelDialog}
					onClose={() => this.setState({ showFBPixelDialog: false })}
				/>
				<Grid container className={classes.headerContainer}>
					<Grid item xs={12} sm={12} lg={8}>
						<PageHeading iconUrl="/icons/events-multi.svg">
							{event.name}
						</PageHeading>
					</Grid>
					<Grid
						item
						xs={12}
						sm={12}
						lg={4}
						className={classes.rightHeaderOptions}
					>
						<div className={classes.tagsContainer}>
							<TagsContainer
								cancelled={cancelled_at}
								isOnSale={isOnSale}
								eventEnded={eventEnded}
								overrideStatus={override_status}
								isPublished={isPublished}
								publishedDateAfterNowAndNotDraft={publishedDateAfterNowAndNotDraft}
								isExternal={is_external}
							/>
						</div>
						{!eventEnded && user.hasScope("event:write") ? (
							<Link to={`/admin/events/${event.id}/edit`}>
								<Button variant="callToAction">Edit event</Button>
							</Link>
						) : null}
					</Grid>
				</Grid>

				<Card variant="block" className={classes.card}>
					<div className={classes.menuContainer}>
						<Typography className={classes.menuText}>
							<StyledLink
								underlined={subheading === "summary"}
								to={`/admin/events/${event.id}/dashboard`}
							>
								Dashboard
							</StyledLink>
						</Typography>

						{!event.is_external ? (
							<React.Fragment>
								<Typography className={classes.menuText}>
									{this.renderToolsMenu()}
									<StyledLink
										underlined={subheading === "tools"}
										onClick={this.handleToolsMenu.bind(this)}
									>
										Tools
									</StyledLink>
								</Typography>
								<Typography className={classes.menuText}>
									{this.renderOrdersMenu()}
									<StyledLink
										underlined={subheading === "orders"}
										onClick={this.handleOrdersMenu.bind(this)}
									>
										Orders
									</StyledLink>
								</Typography>
								<Typography className={classes.menuText}>
									{this.renderReportsMenu()}
									<StyledLink
										underlined={subheading === "reports"}
										onClick={this.handleReportsMenu.bind(this)}
									>
										Reports
									</StyledLink>
								</Typography>
							</React.Fragment>
						) : null}

						{!event.is_external ? (
							<Typography className={classes.menuText}>
								{this.renderMarketingMenu()}
								<StyledLink
									underlined={subheading === "marketing"}
									onClick={this.handleMarketingMenu.bind(this)}
								>
									Marketing
								</StyledLink>
							</Typography>
						) : null}

						<Hidden smDown>
							<div className={classes.additionalDesktopMenuContent}>
								{additionalDesktopMenuContent}
							</div>
						</Hidden>
					</div>

					{layout === "childrenInsideCard" ? (
						<div>
							<div className={classes.menuDividerContainer}>
								<Divider/>
							</div>
							<div
								className={classnames({
									[classes.container]: true,
									[classes.innerCardContainer]: true,
									[classes.noSidePaddingContainer]: removeCardSidePadding
								})}
							>
								{children}
							</div>
						</div>
					) : null}
				</Card>

				{layout === "childrenOutsideWithCard" ? (
					<Card variant={"block"}>
						<div
							className={classnames({
								[classes.container]: true,
								[classes.noSidePaddingContainer]: removeCardSidePadding
							})}
						>
							{children}
						</div>
					</Card>
				) : null}

				{layout === "childrenOutsideNoCard" ? children : null}

				{event ? (
					<VisitEventPage
						id={event.slug || event.id}
						style={{ marginTop: 40, marginBottom: 20 }}
					/>
				) : null}
			</div>
		);
	}
}

EventDashboardContainer.defaultProps = {
	layout: "childrenOutsideWithCard",
	removeCardSidePadding: false
};

EventDashboardContainer.propTypes = {
	classes: PropTypes.object.isRequired,
	eventId: PropTypes.string.isRequired,
	children: PropTypes.oneOfType([PropTypes.element, PropTypes.array])
		.isRequired,
	subheading: PropTypes.string.isRequired,
	layout: PropTypes.oneOf([
		"childrenInsideCard",
		"childrenOutsideWithCard",
		"childrenOutsideNoCard"
	]),
	additionalDesktopMenuContent: PropTypes.element,
	removeCardSidePadding: PropTypes.bool
};

const styles = theme => {
	const defaultSidePadding = {
		paddingLeft: theme.spacing.unit * 8,
		paddingRight: theme.spacing.unit * 8
	};

	return {
		container: {
			paddingTop: theme.spacing.unit * 4,
			paddingBottom: theme.spacing.unit * 4,
			...defaultSidePadding,

			[theme.breakpoints.down("sm")]: {
				padding: theme.spacing.unit * 2
			}
		},
		noSidePaddingContainer: {
			paddingLeft: 0,
			paddingRight: 0
		},
		headerContainer: {
			marginBottom: theme.spacing.unit * 4,
			[theme.breakpoints.down("sm")]: {
				marginBottom: theme.spacing.unit
			}
		},
		card: {
			borderRadius: "6px 6px 0 0",
			[theme.breakpoints.down("sm")]: {
				borderRadius: 6
			}
		},
		innerCardContainer: {
			paddingBottom: theme.spacing.unit * 4
		},
		rightHeaderOptions: {
			display: "flex",
			justifyContent: "flex-end",
			alignContent: "center",
			alignItems: "center",
			[theme.breakpoints.down("md")]: {
				justifyContent: "space-between",
				marginBottom: theme.spacing.unit * 2
			}
		},
		innerCard: {
			padding: theme.spacing.unit * 5,
			[theme.breakpoints.down("md")]: {
				padding: theme.spacing.unit * 2
			}
		},
		menuContainer: {
			display: "flex",
			justifyContent: "flex-start",
			flexWrap: "wrap",
			alignItems: "center",

			paddingTop: theme.spacing.unit * 4,
			paddingBottom: theme.spacing.unit * 3,
			...defaultSidePadding,

			[theme.breakpoints.down("sm")]: {
				padding: theme.spacing.unit * 2,
				paddingBottom: theme.spacing.unit
			}
		},
		menuText: {
			marginRight: theme.spacing.unit * 4,
			marginBottom: theme.spacing.unit,

			[theme.breakpoints.down("sm")]: {
				marginRight: theme.spacing.unit * 2
			}
		},
		menuDividerContainer: {
			marginBottom: theme.spacing.unit * 3,
			marginTop: theme.spacing.unit * 2,

			...defaultSidePadding,

			[theme.breakpoints.down("sm")]: {
				paddingLeft: theme.spacing.unit * 2,
				paddingRight: theme.spacing.unit * 2
			}
		},
		tagsContainer: {
			display: "flex",
			justifyContent: "flex-start",
			marginRight: 10
		},
		menuDropdownContainer: {
			//borderStyle: "solid",
			boxShadow: "0 4px 15px 2px rgba(112, 124, 237, 0.17)"
		},
		additionalDesktopMenuContent: {
			flex: 1,
			display: "flex",
			justifyContent: "flex-end"
		}
	};
};

export default withStyles(styles)(EventDashboardContainer);
