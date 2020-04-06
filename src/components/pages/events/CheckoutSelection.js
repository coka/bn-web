import React, { Component } from "react";
import { withStyles } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import Hidden from "@material-ui/core/Hidden";
import { observer } from "mobx-react";
import PropTypes from "prop-types";
import moment from "moment-timezone";
import { Redirect, Link } from "react-router-dom";

import OrgAnalytics from "../../common/OrgAnalytics";
import Button from "../../elements/Button";
import notifications from "../../../stores/notifications";
import TicketSelection from "./TicketSelection";
import selectedEvent from "../../../stores/selectedEvent";
import cart from "../../../stores/cart";
import user from "../../../stores/user";
import EventHeaderImage from "../../elements/event/EventHeaderImage";
import { fontFamilyDemiBold, secondaryHex } from "../../../config/theme";
import EventDetailsOverlayCard from "../../elements/event/EventDetailsOverlayCard";
import InputWithButton from "../../common/form/InputWithButton";
import Meta from "./Meta";
import Loader from "../../elements/loaders/Loader";
import PrivateEventDialog from "./PrivateEventDialog";
import optimizedImageUrl from "../../../helpers/optimizedImageUrl";
import Divider from "../../common/Divider";
import TwoColumnLayout from "./TwoColumnLayout";
import EventDescriptionBody from "./EventDescriptionBody";
import getUrlParam from "../../../helpers/getUrlParam";
import analytics from "../../../helpers/analytics";
import getAllUrlParams from "../../../helpers/getAllUrlParams";
import ellipsis from "../../../helpers/ellipsis";
import FormattedAdditionalInfo from "./FormattedAdditionalInfo";
import autoAddQuantity from "../../../helpers/autoAddQuantity";
import replaceCart from "../../../helpers/replaceCart";
import TicketTypes from "./TicketTypes";

@observer
class CheckoutSelection extends Component {
	constructor(props) {
		super(props);

		this.eventId = this.props.match.params.id;

		this.state = {
			errors: {},
			ticketSelection: null,
			isSubmitting: false,
			isSubmittingPromo: false,
			overlayCardHeight: 600,
			promoCodeError: null
		};
	}

	componentDidMount() {
		const code = getUrlParam("code");
		code ? (selectedEvent.currentlyAppliedCode = code) : null;

		//If we have a current cart in the store already, load that right away
		if (cart.items && cart.items.length > 0) {
			this.setTicketSelectionFromExistingCart(cart.items);
		} else {
			//Else if we don't have any items in the cart, refresh to make sure
			cart.refreshCart(
				() => {
					this.setTicketSelectionFromExistingCart(cart.items);
				},
				error => {
					//If they're not logged in, assume an empty cart
					if (user.isAuthenticated) {
						notifications.showFromErrorResponse({
							defaultMessage: "Failed add to existing cart items.",
							error
						});
					}

					if (!this.state.ticketSelection) {
						this.setState({ ticketSelection: {} });
					}
				}
			);
		}

		if (this.eventId) {
			selectedEvent.refreshResult(
				this.eventId,
				errorMessage => {
					notifications.show({
						message: errorMessage,
						variant: "error"
					});
				},
				() => {
					const { id: selectedEventId } = selectedEvent.event;

					analytics.viewContent([selectedEventId], getAllUrlParams());
				}
			);
		} else {
			//TODO return 404
		}
	}

	setTicketSelectionFromExistingCart(items) {
		const ticketSelection = {};
		const { id } = this.props.match.params;
		if (items && items.length > 0) {
			items.forEach(({ ticket_type_id, quantity, redemption_code }) => {
				if (ticket_type_id) {
					ticketSelection[ticket_type_id] = {
						quantity: ticketSelection[ticket_type_id]
							? ticketSelection[ticket_type_id].quantity + quantity
							: quantity,
						redemption_code: redemption_code
					};
				}
			});
		}

		//Auto add one ticket if there is only one
		const { ticket_types } = selectedEvent;
		if (items === undefined || items.length === 0) {
			if (ticket_types && ticket_types.length > 1) {
				ticket_types.forEach((type, index) => {
					const type_id = type.id;

					if (!ticketSelection[type_id]) {
						ticketSelection[type_id] = {
							quantity: autoAddQuantity(index, ticket_types)
						};
					}
				});

				this.setState({ ticketSelection });
			} else {
				selectedEvent.refreshResult(
					id,
					errorMessage => {
						notifications.show({
							message: errorMessage,
							variant: "error"
						});
					},
					types => {
						if (types && types.length) {
							for (let i = 0; i < types.length; i++) {
								const type_id = types[i].id;

								//Auto add a ticket after refreshing the event tickets
								if (!ticketSelection[type_id]) {
									ticketSelection[type_id] = {
										quantity: autoAddQuantity(i, types)
									};
								}
							}
						}
						this.setState({ ticketSelection });
					}
				);
			}
		} else {
			this.setState({ ticketSelection });
		}
	}

	clearAppliedPromoCodes() {
		//Remove codes from selected tickets to not apply them when adding to cart
		this.setState(
			({ ticketSelection }) => {
				if (ticketSelection) {
					Object.keys(ticketSelection).forEach(id => {
						if (ticketSelection[id]) {
							delete ticketSelection[id].redemption_code;
						}
					});
				}

				return { ticketSelection };
			},
			() => {
				//Remove from ticket types in store
				selectedEvent.removePromoCodesFromTicketTypes();

				//Update the ticket types so limit details with no promo code applied are used
				selectedEvent.refreshResult(
					this.eventId,
					errorMessage => {
						notifications.show({
							message: errorMessage,
							variant: "error"
						});
					},
					() => {}
				);
			}
		);

		//Clear promo code error
		this.setState( { promoCodeError: null });
	}

	onSubmitPromo(code) {
		if (!code) {
			return notifications.show({
				message: "Enter a promo code first.",
				variant: "warning"
			});
		}

		this.setState({ isSubmittingPromo: true }, () => {
			selectedEvent.applyRedemptionCode(
				code,
				null,
				appliedCodes => {
					//after applying, update redemption_code in ticketSelection
					if (appliedCodes && Object.keys(appliedCodes).length > 0) {
						this.setState(({ ticketSelection }) => {
							Object.keys(appliedCodes).forEach(id => {
								if (ticketSelection[id]) {
									ticketSelection[id].redemption_code = appliedCodes[id];
								}
							});

							return { ticketSelection, isSubmittingPromo: false };
						});
					}
				},
				error => {
					this.setState({
						isSubmittingPromo: false,
						promoCodeError: error ? error.code : null
					});
				}
			);
		});
	}

	onSubmit() {
		const { ticketSelection } = this.state;
		this.submitAttempted = true;
		const history = this.props.history;
		this.setState({ isSubmitting: true });
		const addToCart = replaceCart(
			true,
			ticketSelection,
			history,
			"selection"
		);
		this.setState({ isSubmitting: addToCart });
	}

	onOverlayCardHeightChange(overlayCardHeight) {
		this.setState({ overlayCardHeight });
	}

	renderTicketPricing() {
		const { ticketSelection, errors } = this.state;

		return (
			<TicketTypes
				ticketSelection={ticketSelection}
				errors={errors}
			/>
		);
	}

	render() {
		const { classes } = this.props;
		const { isSubmitting, isSubmittingPromo, ticketSelection, promoCodeError } = this.state;

		const { event, venue, artists, organization, id } = selectedEvent;
		const eventIsCancelled = !!(event && event.cancelled_at);

		if (event === null) {
			return (
				<div>
					<PrivateEventDialog/>
					<Loader style={{ height: 400 }}/>
				</div>
			);
		}

		if (event === false) {
			return <Typography variant="subheading">Event not found.</Typography>;
		}

		if (event.is_external) {
			return <Redirect to={`/events/${id}`}/>;
		}

		const {
			name,
			displayEventStartDate,
			additional_info,
			top_line_info,
			age_limit,
			displayDoorTime,
			displayShowTime,
			eventStartDateMoment,
			tracking_keys
		} = event;

		const promo_image_url = event.promo_image_url
			? optimizedImageUrl(event.promo_image_url)
			: null;

		const mobilePromoImageStyle = {};
		if (promo_image_url) {
			mobilePromoImageStyle.backgroundImage = `url(${promo_image_url})`;
		}

		const promoCodeApplied = !!selectedEvent.currentlyAppliedCode;

		let sharedContent;

		if (ticketSelection === null) {
			sharedContent = (
				<Loader style={{ marginTop: 40, marginBottom: 40 }}>
					Loading cart...
				</Loader>
			);
		} else {
			sharedContent = (
				<div>
					<Typography className={classes.mobileHeading}>
						Select tickets
					</Typography>

					<Divider style={{ margin: 0 }}/>

					{this.renderTicketPricing()}

					<InputWithButton
						value={selectedEvent.currentlyAppliedCode}
						clearText={"Remove"}
						onClear={this.clearAppliedPromoCodes.bind(this)}
						successState={promoCodeApplied}
						showClearButton={promoCodeApplied}
						iconUrl={promoCodeApplied ? "/icons/checkmark-active.svg" : null}
						iconStyle={{ height: 15, width: "auto" }}
						style={{ marginBottom: promoCodeError ? 10 : 20, marginTop: 20 }}
						name={"promoCode"}
						placeholder="Enter a promo code"
						buttonText="Apply"
						onSubmit={this.onSubmitPromo.bind(this)}
						disabled={isSubmittingPromo}
						inputDisabled={promoCodeApplied}
						toUpperCase
						promoCodeError={promoCodeError}
					/>

					<Button
						disabled={isSubmitting || eventIsCancelled}
						onClick={() => this.onSubmit()}
						size="large"
						style={{ width: "100%" }}
						variant="callToAction"
					>
						{isSubmitting
							? "Adding..."
							: eventIsCancelled
								? "Cancelled"
								: "Continue"}
					</Button>
				</div>
			);
		}

		//On mobile we need to move the description and artist details down. But we don't know how much space the overlayed div will take.
		const { overlayCardHeight } = this.state;
		const overlayCardHeightAdjustment = overlayCardHeight - 150;

		return (
			<div>
				<OrgAnalytics trackingKeys={tracking_keys}/>
				<Meta
					{...event}
					venue={venue}
					artists={artists}
					additional_info={additional_info}
					organization={organization}
					doorTime={displayDoorTime}
					showTime={displayShowTime}
					type={"selection"}
				/>
				{/*DESKTOP*/}
				<Hidden smDown>
					<EventHeaderImage
						{...event}
						artists={artists}
						organization={organization}
						venue={venue}
					/>
					<TwoColumnLayout
						containerClass={classes.desktopContent}
						containerStyle={{ minHeight: overlayCardHeightAdjustment }}
						col1={(
							<EventDescriptionBody
								organization={organization}
								eventIsCancelled={eventIsCancelled}
								artists={artists}
							>
								<FormattedAdditionalInfo>
									{additional_info}
								</FormattedAdditionalInfo>
							</EventDescriptionBody>
						)}
						col2={(
							<EventDetailsOverlayCard
								style={{
									width: "100%",
									top: -310,
									position: "relative"
								}}
								imageSrc={promo_image_url}
								onHeightChange={this.onOverlayCardHeightChange.bind(this)}
							>
								<div className={classes.desktopCardContent}>
									{sharedContent}
								</div>
							</EventDetailsOverlayCard>
						)}
					/>
				</Hidden>

				{/*MOBILE*/}
				<Hidden mdUp>
					<div className={classes.mobileContainer}>
						<div className={classes.mobileEventDetailsContainer}>
							<div
								className={classes.mobilePromoImage}
								style={{ backgroundImage: `url(${promo_image_url})` }}
							/>
							<div style={{ flex: 1 }}>
								<Typography
									noWrap
									variant={"display1"}
									className={classes.mobileEventName}
								>
									{ellipsis(name, 45)}
								</Typography>
								<div
									style={{
										display: "flex",
										justifyContent: "space-between",
										flex: 1
									}}
								>
									<div>
										<Typography className={classes.mobileVenueName}>
											{venue.name}
											{venue.city ? ` - ${venue.city}` : ""}
										</Typography>
										<Typography className={classes.mobileEventTime}>
											{displayEventStartDate} - {displayShowTime}
										</Typography>
									</div>
									<Link
										to={`/events/${id}`}
										style={{
											display: "flex",
											alignItems: "flex-end"
										}}
									>
										<Typography className={classes.mobileViewDetailsLinkText}>
											View details
										</Typography>
									</Link>
								</div>
							</div>
						</div>
						<div className={classes.mobileTicketSelectionContainer}>
							{sharedContent}
						</div>
					</div>
				</Hidden>
			</div>
		);
	}
}

CheckoutSelection.propTypes = {
	match: PropTypes.object.isRequired,
	classes: PropTypes.object.isRequired
};

const styles = theme => ({
	root: {},
	desktopContent: {
		backgroundColor: "#FFFFFF"
	},
	desktopCardContent: {
		padding: theme.spacing.unit * 2
	},
	mobileContainer: {
		background: "#FFFFFF"
	},
	mobileTicketSelectionContainer: {
		padding: theme.spacing.unit * 2,
		paddingBottom: theme.spacing.unit * 10
	},
	mobileHeading: {
		fontSize: theme.typography.fontSize * 1.25,
		fontFamily: fontFamilyDemiBold,
		marginTop: theme.spacing.unit,
		marginBottom: theme.spacing.unit
	},
	mobileEventDetailsContainer: {
		padding: theme.spacing.unit * 1.5,
		display: "flex",
		alignItems: "center",
		boxShadow: "0px 2px 10px 0px rgba(157, 163, 180, 0.2)"
	},
	mobilePromoImage: {
		width: 70,
		height: 70,
		backgroundRepeat: "no-repeat",
		backgroundSize: "cover",
		backgroundPosition: "center",
		marginRight: theme.spacing.unit,
		borderRadius: 6
	},
	mobileEventName: {
		fontFamily: fontFamilyDemiBold,
		fontSize: theme.typography.fontSize * 0.875,
		color: "#2c3136",
		overflow: "hidden",
		textOverflow: "ellipsis"
	},
	mobileVenueName: {
		fontFamily: fontFamilyDemiBold,
		fontSize: theme.typography.fontSize * 0.8125,
		color: "#9da3b4"
	},
	mobileEventTime: {
		fontSize: theme.typography.fontSize * 0.8125,
		color: "#9da3b4"
	},
	mobileViewDetailsLinkText: {
		fontFamily: fontFamilyDemiBold,
		fontSize: theme.typography.fontSize * 0.75,
		color: secondaryHex
	}
});

export default withStyles(styles)(CheckoutSelection);
