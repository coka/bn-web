import React, { Component } from "react";
import { Link } from "react-router-dom";
import {
	Typography,
	withStyles,
	IconButton,
	Menu,
	MenuItem,
	ListItemIcon,
	ListItemText
} from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import MoreHorizIcon from "@material-ui/icons/MoreHoriz";
import DashboardIcon from "@material-ui/icons/Dashboard";
import EditIcon from "@material-ui/icons/Edit";
import ViewIcon from "@material-ui/icons/Link";
import CancelIcon from "@material-ui/icons/Cancel";
import RemoveRedEye from "@material-ui/icons/RemoveRedEye";
import moment from "moment";
import notifications from "../../../../stores/notifications";
import Button from "../../../elements/Button";
import StyledLink from "../../../elements/StyledLink";
import DeleteCancelEventDialog from "./DeleteCancelEventDialog";
import Bigneon from "../../../../helpers/bigneon";
import PageHeading from "../../../elements/PageHeading";
import EventSummaryCard from "./EventSummaryCard";
import user from "../../../../stores/user";
import Card from "../../../elements/Card";
import Loader from "../../../elements/loaders/Loader";
import CloneEventDialog from "./CloneEventDialog";
import { LibraryAdd } from "@material-ui/icons";
import { Pagination, urlPageParam } from "../../../elements/pagination";
import Settings from "../../../../config/settings";

class EventsList extends Component {
	constructor(props) {
		super(props);

		this.state = {
			events: null,
			isDelete: false,
			deleteCancelEventId: null,
			eventMenuSelected: null,
			cloneIsOpen: null,
			eventSlug: null,
			optionsAnchorEl: null,
			upcomingOrPast: this.props.match.params.upcomingOrPast || "upcoming",
			paging: null
		};

		this.expandCardDetails = this.expandCardDetails.bind(this);
	}

	componentDidUpdate() {
		const { upcomingOrPast } = this.state;
		if (
			upcomingOrPast !== (this.props.match.params.upcomingOrPast || "upcoming")
		) {
			this.setState(
				{
					upcomingOrPast: this.props.match.params.upcomingOrPast || "upcoming"
				},
				() => this.updateEvents()
			);
		}
	}

	componentDidMount() {
		this.updateEvents("", 0);
	}

	componentWillUnmount() {
		if (this.timeout) {
			clearTimeout(this.timeout);
		}
	}

	handleMenuClick = event => {
		this.setState({ optionsAnchorEl: event.currentTarget });
	};

	handleOptionsClose = () => {
		this.setState({ optionsAnchorEl: null });
	};

	changePage(page = urlPageParam()) {
		this.updateEvents("", page);
	}

	updateEvents(query = "", page = urlPageParam()) {
		//A bit of a hack, we might not have set the current org ID yet for this admin so keep checking
		if (!user.currentOrganizationId) {
			this.timeout = setTimeout(this.updateEvents.bind(this), 100);
			return;
		}

		const pageLimit = Settings().defaultPageLimit;

		this.setState({ events: null, paging: null }, () => {
			const { upcomingOrPast } = this.state;
			Bigneon()
				.organizations.events.index({
					organization_id: user.currentOrganizationId,
					past_or_upcoming: upcomingOrPast,
					page,
					limit: pageLimit
				})
				.then(eventResponse => {
					const { data, paging } = eventResponse.data;
					this.setState({ events: data, paging });
				})
				.catch(error => {
					console.error(error);

					notifications.showFromErrorResponse({
						defaultMessage: "Loading events failed.",
						error
					});
				});
		});
	}

	expandCardDetails(expandedCardId) {
		this.setState({ expandedCardId });
	}

	get cancelMenuItemDisabled() {
		const { events, eventMenuSelected } = this.state;

		const selectedEvent = events.find(e => e.id === eventMenuSelected);

		if (selectedEvent) {
			if (selectedEvent.cancelled_at) {
				return true;
			}
		}

		return false;
	}

	renderEvents() {
		const {
			events,
			expandedCardId,
			upcomingOrPast,
			eventMenuSelected
		} = this.state;
		const eventEnded = upcomingOrPast === "past";
		const { slug } = this.props;
		const { optionsAnchorEl } = this.state;

		if (events === null) {
			return <Loader/>;
		}

		if (events && events.length > 0) {
			return events.map(eventData => {
				const { venue, ...event } = eventData;
				const { id, name, promo_image_url, cancelled_at } = event;

				const eventOptions = [
					{
						text: "Dashboard",
						onClick: () =>
							this.props.history.push(
								`/admin/events/${eventMenuSelected}/dashboard`
							),
						MenuOptionIcon: DashboardIcon
					},
					{
						text: "Edit event",
						disabled: eventEnded || !user.hasScope("event:write"),
						onClick: () =>
							this.props.history.push(
								`/admin/events/${eventMenuSelected}/edit`
							),
						MenuOptionIcon: EditIcon
					},
					{
						text: "View event",
						onClick: () =>
							this.props.history.push(`/tickets/${eventMenuSelected}`),
						// onClick: () =>
						// 	this.props.history.push(`/events/${eventMenuSelected}`),
						MenuOptionIcon: ViewIcon
					},
					{
						text: "Event overview",
						disabled: !user.hasScope("event:write"),
						onClick: () =>
							this.props.history.push(
								`/admin/events/${eventMenuSelected}/event-overview`
							),
						MenuOptionIcon: RemoveRedEye
					},
					{
						text: "Clone event",
						disabled: !user.hasScope("event:write"),
						onClick: () =>
							this.setState({
								cloneEventId: eventMenuSelected
							}),
						MenuOptionIcon: LibraryAdd
					},
					{
						text: "Cancel event",
						disabled:
							!user.hasScope("event:write") || this.cancelMenuItemDisabled,
						onClick: () =>
							this.setState({
								deleteCancelEventId: eventMenuSelected,
								isDelete: false
							}),
						MenuOptionIcon: CancelIcon
					},
					{
						text: "Delete event",
						disabled: !user.hasScope("event:write"),
						onClick: () =>
							this.setState({
								deleteCancelEventId: eventMenuSelected,
								isDelete: true
							}),
						MenuOptionIcon: CancelIcon
					}
				];

				const MenuButton = (
					<div>
						<IconButton
							onClick={e => {
								this.setState({ eventMenuSelected: id });
								this.handleMenuClick(e);
							}}
						>
							<MoreHorizIcon fontSize={"large"} nativeColor="#9da3b4"/>
						</IconButton>

						<Menu
							// id="long-menu"
							anchorEl={optionsAnchorEl}
							open={Boolean(optionsAnchorEl) && eventMenuSelected === id}
							onClose={this.handleOptionsClose}
						>
							{eventOptions.map(
								({ text, onClick, MenuOptionIcon, disabled }) => {
									return (
										<MenuItem
											key={text}
											onClick={() => {
												this.handleOptionsClose();
												onClick();
											}}
											disabled={disabled}
										>
											<ListItemIcon>
												<MenuOptionIcon/>
											</ListItemIcon>
											<ListItemText inset primary={text}/>
										</MenuItem>
									);
								}
							)}
						</Menu>
					</div>
				);

				const { timezone } = venue;
				const isPublished = moment
					.utc(event.publish_date)
					.isBefore(moment.utc());

				return (
					<Grid key={id} item xs={12} sm={12} lg={12}>
						<EventSummaryCard
							cancelled={!!cancelled_at}
							id={id}
							imageUrl={promo_image_url}
							name={name}
							isExternal={event.is_external}
							venueName={venue.name || "Unknown Venue"}
							eventDate={moment.utc(event.event_start).tz(timezone)}
							menuButton={MenuButton}
							isPublished={isPublished}
							isOnSale={
								isPublished && moment.utc(event.on_sale).isBefore(moment.utc())
							}
							totalSold={event.sold_held + event.sold_unreserved}
							totalOpen={event.tickets_open}
							totalHeld={event.tickets_held - event.sold_held}
							totalCapacity={event.total_tickets}
							totalSalesInCents={event.sales_total_in_cents}
							isExpanded={expandedCardId === id}
							onExpandClick={this.expandCardDetails}
							ticketTypes={event.ticket_types}
							eventEnded={eventEnded}
							publishDate={event.publish_date}
							status={event.status}
							overrideStatus={event.override_status}
						/>
					</Grid>
				);
			});
		} else {
			return (
				<Grid item xs={12} sm={12} lg={12}>
					<Typography variant="body1">No events yet</Typography>
				</Grid>
			);
		}
	}

	render() {
		const {
			deleteCancelEventId,
			upcomingOrPast,
			isDelete,
			cloneEventId,
			paging
		} = this.state;
		const { classes } = this.props;

		return (
			<div>
				<DeleteCancelEventDialog
					id={deleteCancelEventId}
					isDelete={isDelete}
					onClose={() =>
						this.setState(
							{ deleteCancelEventId: null, isDelete: false },
							this.updateEvents.bind(this)
						)
					}
				/>
				<CloneEventDialog
					id={cloneEventId}
					onClose={() =>
						this.setState({ cloneEventId: null }, this.updateEvents.bind(this))
					}
				/>
				<Grid container spacing={0} alignItems="center">
					<Grid item xs={6} sm={6} lg={6}>
						<PageHeading iconUrl="/icons/events-multi.svg">Events</PageHeading>
					</Grid>
					<Grid
						item
						xs={6}
						sm={6}
						lg={6}
						style={{
							display: "flex",
							justifyContent: "flex-end"
						}}
					>
						{user.hasScope("event:write") ? (
							<div className={classes.actionButtons}>
								<Link to={"/admin/events/create"}>
									<Button variant="callToAction">New event</Button>
								</Link>
							</div>
						) : (
							<div/>
						)}
					</Grid>
				</Grid>

				<Grid container spacing={16}>
					<Grid item xs={12} sm={12} lg={12}>
						<Card variant="block" style={{ borderRadius: "6px 6px 0 0" }}>
							<div className={classes.menuContainer}>
								<Typography className={classes.menuText}>
									<StyledLink
										underlined={upcomingOrPast === "upcoming"}
										to={`/admin/events/upcoming`}
									>
										Upcoming
									</StyledLink>
								</Typography>

								<Typography className={classes.menuText}>
									<StyledLink
										underlined={upcomingOrPast === "past"}
										to={`/admin/events/past`}
									>
										Past
									</StyledLink>
								</Typography>
							</div>
						</Card>
					</Grid>

					{this.renderEvents()}
					{paging !== null ? (
						<Pagination
							isLoading={false}
							paging={paging}
							onChange={this.changePage.bind(this)}
						/>
					) : (
						<div/>
					)}
				</Grid>
			</div>
		);
	}
}

const styles = theme => ({
	paper: {
		display: "flex"
	},
	cardContent: {
		padding: theme.spacing.unit * 2,
		marginBottom: theme.spacing.unit,
		flex: "1 0 auto"
	},
	actionButtons: {
		padding: theme.spacing.unit
	},
	rightHeaderOptions: {
		display: "flex",
		justifyContent: "flex-end",
		alignContent: "center"
	},
	menuContainer: {
		display: "flex",
		padding: theme.spacing.unit * 2.5
	},
	menuText: {
		marginRight: theme.spacing.unit * 4
	}
});

export default withStyles(styles)(EventsList);
