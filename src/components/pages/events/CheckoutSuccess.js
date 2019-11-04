import React, { Component } from "react";
import { Dialog, Grid, Typography, withStyles } from "@material-ui/core";
import { observer } from "mobx-react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import Hidden from "@material-ui/core/Hidden";
import Slide from "@material-ui/core/Slide";
import CustomButton from "../../elements/Button";
import notifications from "../../../stores/notifications";
import selectedEvent from "../../../stores/selectedEvent";
import cart from "../../../stores/cart";
import EventDetailsOverlayCard from "../../elements/event/EventDetailsOverlayCard";
import {
	fontFamily,
	fontFamilyBold,
	fontFamilyDemiBold,
	secondaryHex,
	textColorPrimary
} from "../../../config/theme";
import Card from "../../elements/Card";
import AppButton from "../../elements/AppButton";
import SMSLinkForm from "../../elements/SMSLinkForm";
import Meta from "./Meta";
import Loader from "../../elements/loaders/Loader";
import PrivateEventDialog from "./PrivateEventDialog";
import NotFound from "../../common/NotFound";
import TwoColumnLayout from "./TwoColumnLayout";
import Button from "../../elements/Button";
import Divider from "../../common/Divider";
import user from "../../../stores/user";
import getUrlParam from "../../../helpers/getUrlParam";
import getPhoneOS from "../../../helpers/getPhoneOS";
import servedImage from "../../../helpers/imagePathHelper";
import Settings from "../../../config/settings";
import OrgAnalytics from "../../common/OrgAnalytics";
import Bigneon from "../../../helpers/bigneon";
import moment from "moment-timezone";
import MaintainAspectRatio from "../../elements/MaintainAspectRatio";
import { dollars } from "../../../helpers/money";

const heroHeight = 586;

const iPhone5MediaQuery = "@media (max-width:321px)";

const styles = theme => {
	return {
		root: {
			backgroundColor: "#FFFFFF"
		},
		mobileContent: {
			flex: 1,
			flexDirection: "column",
			background: "linear-gradient(180deg, #9C2D82 0%, #3965A6 100%)",
			display: "flex"
		},
		mobileTopContent: {
			flex: 1,
			display: "flex",
			flexDirection: "column",
			justifyContent: "center",
			paddingLeft: 22,
			paddingRight: 22,
			[iPhone5MediaQuery]: {
				paddingLeft: 16,
				paddingRight: 16
			}
		},
		mobileHeaderRow: {
			height: 50,
			display: "flex",
			justifyContent: "space-between",
			alignItems: "flex-end",
			paddingLeft: 22,
			paddingRight: 22,
			[iPhone5MediaQuery]: {
				paddingLeft: 16,
				paddingRight: 16
			}
		},
		mobileHeaderIcon: {
			width: 18,
			height: "auto"
		},
		mobilePopupCard: {
			backgroundColor: "#FFFFFF",
			borderRadius: "15px 15px 0 0",
			paddingTop: 35,
			paddingBottom: 20,
			textAlign: "left",
			paddingLeft: 22,
			paddingRight: 22,
			[iPhone5MediaQuery]: {
				paddingLeft: 16,
				paddingRight: 16
			}
		},
		mobileSuccessHeading: {
			fontSize: 22,
			color: "#FFFFFF",
			lineHeight: 1,
			fontFamily: fontFamilyDemiBold,
			[iPhone5MediaQuery]: {
				fontSize: theme.typography.fontSize * 1.5
			}
		},
		mobileSuccessText: {
			marginTop: 8,
			fontSize: theme.typography.fontSize * 1.065,
			color: "#FFFFFF"
		},
		mobileCardTitle: {
			fontFamily: fontFamilyDemiBold,
			fontSize: theme.typography.fontSize * 1.3125,
			marginBottom: 28
		},
		mobileExplainerText: {
			lineHeight: 0.95
		},
		cardSpacer: {
			marginTop: 100,
			[iPhone5MediaQuery]: {
				marginTop: 80
			}
		},
		highlightText: {
			fontFamily: fontFamilyDemiBold,
			color: secondaryHex
		},
		buttonContainer: {
			marginTop: 27,
			marginBottom: 27
		},
		mobileFooterText: {
			color: textColorPrimary
		},
		desktopHeroContent: {
			display: "flex",
			flexDirection: "column",
			justifyContent: "center",
			paddingBottom: theme.spacing.unit * 2,
			height: heroHeight
		},
		desktopEventPromoImg: {
			height: "140px",
			width: "273px",
			borderRadius: "3px",
			backgroundImage: "linear-gradient(255deg, #e53d96, #5491cc)",
			backgroundRepeat: "no-repeat",
			backgroundSize: "cover",
			boxShadow: "0 4px 15px 2px rgba(0,0,0,0.15)",
			backgroundPosition: "center"
		},
		desktopCardContent: {
			paddingRight: theme.spacing.unit * 4,
			paddingLeft: theme.spacing.unit * 4,
			textAlign: "center"
		},
		mobileCardContent: {
			paddingRight: theme.spacing.unit,
			paddingLeft: theme.spacing.unit,
			textAlign: "left"
		},
		desktopCoverImage: {
			height: heroHeight,
			width: "100%",
			backgroundRepeat: "no-repeat",
			backgroundSize: "cover",
			backgroundPosition: "center",
			position: "absolute",
			marginBottom: theme.spacing.unit * 2,
			background: "linear-gradient(180deg, #9C2D82 0%, #3965A6 100%)"
		},
		desktopHeroTopLine: {
			color: "#FFFFFF",
			fontSize: 26,
			lineHeight: "30px",
			fontFamily: fontFamilyBold
		},
		desktopHeroOrderTag: {
			marginTop: theme.spacing.unit * 2,
			marginBottom: theme.spacing.unit * 2,
			color: "#FFFFFF",
			fontSize: 15,
			lineHeight: "23px",
			fontFamily: fontFamily
		},
		desktopOverlayCardHeader: {
			background: "linear-gradient(-135deg, #9C2D82 0%, #3965A6 100%)",
			height: 167,
			padding: theme.spacing.unit,
			paddingLeft: 65,
			paddingRight: 65,
			display: "flex",
			alignItems: "center",
			[theme.breakpoints.down("md")]: {
				paddingLeft: 25,
				paddingRight: 25
			}
		},
		desktopEventDetailContainer: {
			paddingTop: 4
		},
		desktopEventDetailText: {
			color: "#FFFFFF",
			fontSize: 15,
			lineHeight: "18px"
		},
		desktopEventDetailsRow: {
			display: "flex",
			justifyContent: "flex-start",
			marginBottom: 30
		},
		desktopIconContainer: {
			marginRight: 12
		},
		desktopIcon: {
			width: 22,
			height: "auto"
		},
		boldText: {
			fontFamily: fontFamilyDemiBold,
			fontSize: 17,
			lineHeight: "21px"
		},
		link: {
			color: secondaryHex
		},
		desktopSuccessTitle: {
			fontFamily: fontFamilyDemiBold,
			fontSize: theme.typography.fontSize * 1.75,
			color: "#FFFFFF",
			lineHeight: 1,
			[theme.breakpoints.down("md")]: {
				fontSize: theme.typography.fontSize * 1.52
			}
		},
		desktopFooterText: {
			color: "#3C383F",
			fontSize: 17,
			lineHeight: "20px",
			fontFamily: fontFamilyDemiBold
		},
		desktopCardFooterContainer: {
			padding: 10,
			paddingRight: 10,
			paddingLeft: 10,
			textAlign: "center",
			[theme.breakpoints.down("md")]: {
				textAlign: "left"
			}
		},
		greyTitleBold: {
			color: "#8885B8",
			textTransform: "uppercase",
			fontFamily: fontFamilyBold,
			fontSize: 15,
			marginTop: "25px",
			lineHeight: "18px",
			[theme.breakpoints.down("md")]: {
				fontSize: 14,
				fontFamily: fontFamilyDemiBold,
				lineHeight: "16px"
			}
		},
		greyTitleDemiBold: {
			color: "#6A7C94",
			textTransform: "uppercase",
			fontFamily: fontFamilyDemiBold,
			marginBottom: theme.spacing.unit,
			fontSize: 15,
			lineHeight: "18px",
			opacity: "0.6",
			[theme.breakpoints.down("md")]: {
				fontSize: 14,
				lineHeight: "16px",
				marginBottom: 4
			}
		},
		iconText: {
			display: "flex",
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "flex-start"
		},
		iconHolder: {
			width: 26,
			marginRight: theme.spacing.unit * 2
		},
		icon: {
			maxWidth: 24
		},
		heartLogo: {
			height: 55,
			width: 53,
			marginTop: theme.spacing.unit * 2,
			marginBottom: theme.spacing.unit * 2
		},
		cardLargeText: {
			color: "#3C383F",
			fontSize: 24,
			fontFamily: fontFamilyBold,
			lineHeight: "28px",
			[theme.breakpoints.down("md")]: {
				fontSize: 17,
				fontFamily: fontFamilyBold,
				lineHeight: "19px"
			}
		},
		cardMedText: {
			color: "#3C383F",
			fontSize: 18,
			fontFamily: fontFamilyBold,
			lineHeight: "21px",
			marginTop: theme.spacing.unit * 2,
			marginBottom: theme.spacing.unit * 2
		},
		btnContainer: {
			display: "flex",
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "space-between",
			marginTop: theme.spacing.unit * 2,
			marginBottom: theme.spacing.unit * 2
		},
		purchaseInfoBlock: {
			padding: theme.spacing.unit * 4,
			maxWidth: 796,
			borderRadius: 10,
			backgroundColor: "rgba(89,83,155,0.05)",
			display: "flex",
			flexDirection: "column",
			margin: "0 auto"
		},
		purchaseInfo: {
			display: "flex",
			flexDirection: "row",
			justifyContent: "space-between"
		},
		purchaseText: {
			color: "#000",
			fontSize: 15,
			lineHeight: "18px"
		},
		purchaseTicketText: {
			color: "#3C383F",
			fontSize: 17,
			lineHeight: "19px",
			fontFamily: fontFamilyDemiBold,
			textAlign: "right",
			[theme.breakpoints.down("md")]: {
				textAlign: "left"
			}
		},
		divider: {
			height: 1,
			width: "100%",
			opacity: "0.2",
			backgroundColor: "rgba(0,0,0,0.3)",
			marginTop: theme.spacing.unit * 2,
			marginBottom: theme.spacing.unit * 2
		},
		leftColumn: {
			display: "flex",
			width: "45%"
		},
		rightColumn: {
			display: "flex",
			flexDirection: "row",
			justifyContent: "space-between",
			width: "55%"
		},
		orderTotalTitle: {
			color: "#3C383F",
			fontSize: 17,
			fontFamily: fontFamilyBold,
			lineHeight: "19px"
		},
		orderTotalValue: {
			color: "#3C383F",
			fontSize: 24,
			fontFamily: fontFamilyDemiBold,
			lineHeight: "24px"
		},
		mobiBoldOrder: {
			color: "#6A7C94",
			fontSize: 17,
			fontFamily: fontFamilyBold,
			lineHeight: "19px"
		},
		plainGreyText: {
			opacity: " 0.4",
			color: "#3C383F",
			fontSize: 16,
			lineHeight: "23px"
		},
		questionsText: {
			fontSize: 17,
			color: "#3C383F",
			fontFamily: fontFamilyDemiBold,
			lineHeight: "19px",
			maxWidth: 420,
			textAlign: "center",
			margin: "-80px auto 20px auto",
			[theme.breakpoints.down("md")]: {
				marginTop: theme.spacing.unit * 2,
				textAlign: "left",
				marginBottom: theme.spacing.unit * 2

			}
		},
		pinkSpan: {
			color: secondaryHex,
			fontSize: 17,
			fontFamily: fontFamilyDemiBold,
			textDecoration: "none",
			lineHeight: "19px"
		}
	};
};

const EventDetail = ({ classes, children, iconUrl }) => (
	<div className={classes.desktopEventDetailsRow}>
		<div className={classes.desktopIconContainer}>
			<img className={classes.desktopIcon} src={servedImage(iconUrl)}/>
		</div>

		<div className={classes.desktopEventDetailContainer}>{children}</div>
	</div>
);

const Hero = ({
	classes,
	event,
	venue,
	order,
	firstName,
	qty,
	promoImgStyle,
	displayEventStartDate
}) => {
	return (
		<div className={classes.desktopCoverImage}>
			<TwoColumnLayout
				col1={(
					<div className={classes.desktopHeroContent}>
						<Typography className={classes.desktopHeroTopLine}>
							{firstName}, <br/> Your Big Neon order is confirmed!
						</Typography>
						<Typography className={classes.desktopHeroOrderTag}>
							Order #{order.order_number} |&nbsp;{qty} Tickets
						</Typography>

						{promoImgStyle ? (
							<div
								className={classes.desktopEventPromoImg}
								style={promoImgStyle}
							/>
						) : null}

						<Typography className={classes.greyTitleBold}>Event</Typography>

						<Typography className={classes.desktopEventDetailText}>
							<span className={classes.boldText}>{event.name}</span>
							<br/>
							{displayEventStartDate}
						</Typography>

						<Typography className={classes.greyTitleBold}>Location</Typography>

						<Typography className={classes.desktopEventDetailText}>
							<span className={classes.boldText}>{venue.name}</span>
							<br/>
							{venue.address}
						</Typography>
					</div>
				)}
			/>
		</div>
	);
};

const PurchaseDetails = ({
	classes,
	event,
	venue,
	order,
	displayEventStartDate
}) => {
	const items = order.items;
	let subTotal = 0;
	let allFees = 0;
	for (let i = 0; i < items.length; i++) {
		if (
			items[i].item_type === "PerUnitFees" ||
			items[i].item_type === "EventFees"
		) {
			allFees = allFees + items[i].unit_price_in_cents * items[i].quantity;
		}
	}
	return (
		<div className={classes.purchaseInfoBlock}>
			<Hidden mdDown>
				<div className={classes.purchaseInfo}>
					<Typography className={classes.boldText}>{event.name}</Typography>
					<Typography className={classes.boldText}>
						{order.order_number}
					</Typography>
				</div>
				<div className={classes.purchaseInfo}>
					<Typography className={classes.purchaseText}>
						{displayEventStartDate}
					</Typography>
					<Typography className={classes.greyTitleDemiBold}>
						Order no.
					</Typography>
				</div>
			</Hidden>
			<Hidden smUp>
				<Typography className={classes.greyTitleDemiBold}>Order no.</Typography>
				<Typography className={classes.mobiBoldOrder}>
					{order.order_number}
				</Typography>
				<br/>
				<Typography className={classes.boldText}>{event.name}</Typography>
				<Typography className={classes.purchaseText}>
					{displayEventStartDate}
				</Typography>
			</Hidden>
			<br/>
			<Typography className={classes.boldText}>{venue.name}</Typography>
			<Typography className={classes.purchaseText}>{venue.address}</Typography>
			<div className={classes.divider}/>
			<Typography className={classes.greyTitleDemiBold}>Purchaser</Typography>
			<Typography className={classes.boldText}>
				{user.firstName} {user.lastName}
			</Typography>
			<div className={classes.purchaseInfo}>{user.email}</div>
			<br/>
			<Hidden mdDown>
				<div className={classes.purchaseInfo}>
					<div className={classes.leftColumn}>
						<Typography className={classes.greyTitleDemiBold}>
							Ticket type
						</Typography>
					</div>
					<div className={classes.rightColumn}>
						<Typography className={classes.greyTitleDemiBold}>
							Ticket price
						</Typography>
						<Typography className={classes.greyTitleDemiBold}>Qty</Typography>{" "}
						<Typography className={classes.greyTitleDemiBold}>
							Ticket total
						</Typography>
					</div>
				</div>
				<div className={classes.divider}/>
			</Hidden>
			{items
				? items.map((item, index) => {
					if (item.item_type !== "Tickets") {
						return null;
					}
					subTotal = subTotal + item.unit_price_in_cents * item.quantity;
					return (
						<div key={index}>
							<Hidden mdDown>
								<div className={classes.purchaseInfo}>
									<div className={classes.leftColumn}>
										<Typography className={classes.purchaseTicketText}>
											{item.description}
										</Typography>
									</div>
									<div className={classes.rightColumn}>
										<Typography className={classes.purchaseTicketText}>
											{dollars(item.unit_price_in_cents)}
										</Typography>{" "}
										<Typography className={classes.purchaseTicketText}>
											{item.quantity}
										</Typography>{" "}
										<Typography className={classes.purchaseTicketText}>
											{dollars(item.unit_price_in_cents * item.quantity)}
										</Typography>
									</div>
								</div>
							</Hidden>
							<Hidden smUp>
								<Typography className={classes.greyTitleDemiBold}>
										Ticket type
								</Typography>
								<Typography className={classes.purchaseTicketText}>
									{item.description}
								</Typography>
								<br/>
								<div className={classes.purchaseInfo}>
									<Typography className={classes.greyTitleDemiBold}>
											Ticket price
									</Typography>
									<Typography className={classes.greyTitleDemiBold}>
											Qty
									</Typography>
									<Typography className={classes.greyTitleDemiBold}>
											Ticket total
									</Typography>
								</div>
								<div className={classes.purchaseInfo}>
									<Typography className={classes.purchaseTicketText}>
										{dollars(item.unit_price_in_cents)}
									</Typography>{" "}
									<Typography className={classes.purchaseTicketText}>
										{item.quantity}
									</Typography>{" "}
									<Typography className={classes.purchaseTicketText}>
										{dollars(item.unit_price_in_cents * item.quantity)}
									</Typography>
								</div>
								<br/>
								<div className={classes.divider}/>
							</Hidden>
						</div>
					);
				  })
				: null}
			<div className={classes.purchaseInfo}>
				<Typography className={classes.greyTitleDemiBold}>Subtotal</Typography>
				<Typography className={classes.greyTitleDemiBold}>
					{dollars(subTotal)}
				</Typography>
			</div>
			<br/>
			<div className={classes.purchaseInfo}>
				<Typography className={classes.greyTitleDemiBold}>
					Fees Total
				</Typography>
				<Typography className={classes.greyTitleDemiBold}>
					{dollars(allFees)}
				</Typography>
			</div>
			<div className={classes.divider}/>
			<div className={classes.purchaseInfo}>
				<Typography className={classes.orderTotalTitle}>Order Total</Typography>
				<Typography className={classes.orderTotalValue}>
					{dollars(order.total_in_cents)}
				</Typography>
			</div>
		</div>
	);
};

@observer
class CheckoutSuccess extends Component {
	constructor(props) {
		super(props);

		this.state = {
			mobileDialogOpen: true,
			mobileCardSlideIn: true,
			order_id: null,
			order: null,
			phoneOS: getPhoneOS()
		};
	}

	componentDidMount() {
		cart.emptyCart(); //TODO move this to after they've submitted the final form

		if (
			this.props.match &&
			this.props.match.params &&
			this.props.match.params.id
		) {
			const { id } = this.props.match.params;

			selectedEvent.refreshResult(id, errorMessage => {
				notifications.show({
					message: errorMessage,
					variant: "error"
				});
			});

			const order_id = getUrlParam("order_id");

			if (order_id) {
				this.setState({ order_id }, () => {
					this.getOrderInformation();
				});
			}
		} else {
			//TODO return 404
		}
	}

	getOrderInformation() {
		const { order_id } = this.state;

		Bigneon()
			.orders.read({ id: order_id })
			.then(response => {
				const { data } = response;
				const { date, is_box_office, items, user_id } = data;

				const { timezone } = this.props;

				const platform = is_box_office ? "Box office" : data.platform || "";

				let fees_in_cents = 0;
				items.forEach(({ item_type, unit_price_in_cents, quantity }) => {
					//Only include fee type items
					if (
						["CreditCardFees", "PerUnitFees", "EventFees"].indexOf(item_type) >
						-1
					) {
						fees_in_cents += unit_price_in_cents * quantity;
					}
				});

				this.setState({
					order: { ...data, platform, fees_in_cents }
				});
			})
			.catch(error => {
				console.error(error);

				notifications.showFromErrorResponse({
					defaultMessage: "Loading order failed.",
					error
				});
			});
	}

	goHome() {
		this.setState({ mobileCardSlideIn: false }, () => {
			setTimeout(() => {
				this.setState({ mobileDialogOpen: false }, () => {
					setTimeout(() => {
						this.props.history.push("/");
					}, 80);
				});
			}, 200);
		});
	}

	render() {
		const { classes } = this.props;
		const { event, venue, artists, organization } = selectedEvent;
		const firstName = user.firstName;
		const {
			mobileDialogOpen,
			mobileCardSlideIn,
			order,
			order_id,
			phoneOS
		} = this.state;

		if (event === null || order === null) {
			return (
				<div>
					<PrivateEventDialog/>
					<Loader style={{ height: 400 }}/>
				</div>
			);
		}

		if (event === false) {
			return <NotFound>Event not found.</NotFound>;
		}

		const {
			name,
			displayEventStartDate,
			additional_info,
			top_line_info,
			promo_image_url,
			displayDoorTime,
			displayShowTime,
			eventStartDateMoment,
			tracking_keys
		} = event;

		const eventDateFormatted = moment
			.utc(eventStartDateMoment)
			.tz(venue.timezone)
			.format("llll z");

		const ticketItem = order.items.filter(item => item.item_type === "Tickets");
		const promoImageStyle = {};
		if (promo_image_url) {
			promoImageStyle.backgroundImage = `url(${promo_image_url})`;
		}
		let qty = 0;
		if (ticketItem.length > 0) {
			for (let i = 0; i < ticketItem.length; i++) {
				qty = qty + ticketItem[i].quantity;
			}
		}

		return (
			<div className={classes.root}>
				<OrgAnalytics trackingKeys={tracking_keys}/>
				<Meta
					{...event}
					venue={venue}
					artists={artists}
					additional_info={additional_info}
					organization={organization}
					doorTime={displayDoorTime}
					showTime={displayShowTime}
					type={"success"}
				/>

				{/*DESKTOP*/}
				<Hidden smDown>
					<div style={{ height: heroHeight * 1.2 }}>
						<Hero
							order_id={order_id}
							order={order}
							promoImg={promo_image_url}
							venue={venue}
							firstName={firstName}
							qty={qty}
							classes={classes}
							promoImgStyle={promoImageStyle}
							displayEventStartDate={eventDateFormatted}
							event={event}
						/>
						<TwoColumnLayout
							containerClass={classes.desktopHeroContent}
							containerStyle={{ minHeight: heroHeight }}
							style={{ maxWidth: 1600, margin: "0 auto" }}
							col1={null}
							col2={(
								<EventDetailsOverlayCard
									// className={classes.desktopHeroContent}
									style={{
										minWidth: "390px",
										// top: 150,
										position: "relative"
									}}
								>
									<div>
										<div className={classes.desktopCardContent}>
											<img
												alt="Bigneon Logo"
												className={classes.heartLogo}
												src={servedImage(
													"/site/images/big-neon-heart-logo.png"
												)}
											/>
											<Typography className={classes.cardLargeText}>
												Get your tickets now by downloading the Big Neon App
											</Typography>
											<div className={classes.btnContainer}>
												<AppButton
													color="pinkBackground"
													variant="ios"
													href={process.env.REACT_APP_STORE_IOS}
													style={{ marginRight: 5 }}
												>
													APP STORE
												</AppButton>
												<AppButton
													color="pinkBackground"
													variant="android"
													href={process.env.REACT_APP_STORE_ANDROID}
													style={{ marginRight: 5 }}
												>
													GOOGLE PLAY
												</AppButton>
											</div>
											<Typography className={classes.cardMedText}>
												(or just bring your photo ID to the door)
											</Typography>
										</div>

										<Divider/>

										<div className={classes.desktopCardFooterContainer}>
											<Typography className={classes.desktopFooterText}>
												You’ll need the Big Neon App to:
											</Typography>
											<br/>
											<div className={classes.iconText}>
												<div className={classes.iconHolder}>
													<img
														alt="Emoji Icon"
														className={classes.icon}
														src={servedImage("/icons/dance-emoji-icon.png")}
													/>
												</div>
												<Typography className={classes.desktopFooterText}>
													Transfer tickets to friends
												</Typography>
											</div>
											<div className={classes.iconText}>
												<div className={classes.iconHolder}>
													<img
														alt="Emoji Icon"
														className={classes.icon}
														src={servedImage("/icons/envelope-emoji-icon.png")}
													/>
												</div>
												<Typography className={classes.desktopFooterText}>
													Get pre-sale access to future events
												</Typography>
											</div>
											<div className={classes.iconText}>
												<div className={classes.iconHolder}>
													<img
														alt="Emoji Icon"
														className={classes.icon}
														src={servedImage("/icons/drink-emoji-icon.png")}
													/>
												</div>
												<Typography className={classes.desktopFooterText}>
													Receive special perks at event
												</Typography>
											</div>
										</div>
									</div>
								</EventDetailsOverlayCard>
							)}
						/>
					</div>
					<Typography className={classes.questionsText}>
						Questions about your purchase? Please contact&nbsp;
						<span>
							<a
								className={classes.pinkSpan}
								href="https://support.bigneon.com/hc/en-us/requests/new"
							>
								Big Neon Customer Support
							</a>
						</span>
						&nbsp; or&nbsp;
						<span>
							<a
								className={classes.pinkSpan}
								href="https://support.bigneon.com/hc/en-us/sections/360003586272-Frequently-Asked-Questions"
							>
								see our FAQ
							</a>
						</span>
					</Typography>
					<PurchaseDetails
						displayEventStartDate={eventDateFormatted}
						order={order}
						event={event}
						venue={venue}
						classes={classes}
					/>
				</Hidden>

				{/*MOBILE*/}
				<Hidden mdUp>
					<div style={{ marginBottom: 500 }}/>
					<Dialog
						fullScreen
						aria-labelledby="dialog-title"
						onEntering={() => {}}
						onExiting={() => {}}
						open={mobileDialogOpen}
					>
						<div className={classes.mobileContent}>
							<div className={classes.mobileHeaderRow}>
								{/*TODO once my-events is mobile friendly redirect there?*/}
								<div onClick={this.goHome.bind(this)}>
									<img
										className={classes.mobileHeaderIcon}
										alt="close"
										src={servedImage("/icons/close-white.svg")}
									/>
								</div>
								<div>
									{/*<img className={classes.mobileHeaderIcon} alt="share" src={servedImage("/icons/share-white.svg")}/>*/}
								</div>
							</div>

							<div className={classes.mobileTopContent}>
								<Typography className={classes.mobileSuccessHeading}>
									{user.firstName},<br/>
									Your Big Neon order is confirmed!
								</Typography>
								<Typography className={classes.mobileSuccessText}>
									Order #{order.order_number} |&nbsp;{qty} Tickets
								</Typography>
								<br/>
								{promoImageStyle ? (
									<div
										className={classes.desktopEventPromoImg}
										style={promoImageStyle}
									/>
								) : null}

								<Typography className={classes.greyTitleBold}>Event</Typography>

								<Typography className={classes.desktopEventDetailText}>
									<span className={classes.boldText}>{event.name}</span>
									<br/>
									{displayEventStartDate}
								</Typography>

								<Typography className={classes.greyTitleBold}>
									Location
								</Typography>

								<Typography className={classes.desktopEventDetailText}>
									<span className={classes.boldText}>{venue.name}</span>
									<br/>
									{venue.address}
								</Typography>
							</div>
							<div>
								<Slide direction="up" in={mobileCardSlideIn}>
									<div className={classes.mobilePopupCard}>
										<div className={classes.mobileCardContent}>
											<Typography className={classes.cardLargeText}>
												Get your tickets now by downloading the Big Neon App
											</Typography>
											<div className={classes.btnContainer}>
												<Link
													to={
														phoneOS === "ios"
															? process.env.REACT_APP_STORE_IOS
															: process.env.REACT_APP_STORE_ANDROID
													}
												>
													<CustomButton
														variant="secondary"
														style={{ width: "80vw" }}
													>
														Download the Big Neon App
													</CustomButton>
												</Link>
											</div>
											<Typography className={classes.cardMedText}>
												(or just bring your photo ID to the door)
											</Typography>
										</div>

										<Divider/>

										<div className={classes.desktopCardFooterContainer}>
											<Typography className={classes.desktopFooterText}>
												You’ll need the Big Neon App to:
											</Typography>
											<br/>
											<div className={classes.iconText}>
												<div className={classes.iconHolder}>
													<img
														alt="Emoji Icon"
														className={classes.icon}
														src={servedImage("/icons/dance-emoji-icon.png")}
													/>
												</div>
												<Typography className={classes.desktopFooterText}>
													Transfer tickets to friends
												</Typography>
											</div>
											<div className={classes.iconText}>
												<div className={classes.iconHolder}>
													<img
														alt="Emoji Icon"
														className={classes.icon}
														src={servedImage("/icons/envelope-emoji-icon.png")}
													/>
												</div>
												<Typography className={classes.desktopFooterText}>
													Get pre-sale access to future events
												</Typography>
											</div>
											<div className={classes.iconText}>
												<div className={classes.iconHolder}>
													<img
														alt="Emoji Icon"
														className={classes.icon}
														src={servedImage("/icons/drink-emoji-icon.png")}
													/>
												</div>
												<Typography className={classes.desktopFooterText}>
													Receive special perks at event
												</Typography>
											</div>
										</div>
										<Divider/>

										<Typography className={classes.questionsText}>
											Questions about your purchase? Please contact&nbsp;
											<span>
												<a
													className={classes.pinkSpan}
													href="https://support.bigneon.com/hc/en-us/requests/new"
												>
													Big Neon Customer Support
												</a>
											</span>
											&nbsp; or&nbsp;
											<span>
												<a
													className={classes.pinkSpan}
													href="https://support.bigneon.com/hc/en-us/sections/360003586272-Frequently-Asked-Questions"
												>
													see our FAQ
												</a>
											</span>
										</Typography>
										<PurchaseDetails
											displayEventStartDate={eventDateFormatted}
											order={order}
											event={event}
											venue={venue}
											classes={classes}
										/>
										<Typography className={classes.plainGreyText}>
											Receipt has been sent to {user.email}
										</Typography>
									</div>
								</Slide>
							</div>
						</div>
					</Dialog>
				</Hidden>
			</div>
		);
	}
}

CheckoutSuccess.propTypes = {
	match: PropTypes.object.isRequired,
	classes: PropTypes.object.isRequired,
	history: PropTypes.object.isRequired
};

export default withStyles(styles)(CheckoutSuccess);
