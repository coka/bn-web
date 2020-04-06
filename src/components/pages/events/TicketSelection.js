import React, { Component } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import { Typography } from "@material-ui/core";
import classnames from "classnames";

import { fontFamilyDemiBold, secondaryHex } from "../../../config/theme";
import Divider from "../../common/Divider";
import NumberSelect from "../../elements/form/NumberSelect";
import nl2br from "../../../helpers/nl2br";
import { dollars } from "../../../helpers/money";
import ColorTag from "../../elements/ColorTag";
import cartValidateFields from "../../../helpers/cartValidateFields";

class TicketSelection extends Component {
	constructor(props) {
		super(props);

		this.state = {
			showDescription: false
		};
	}

	readMoreLess() {
		this.setState(({ showDescription }) => ({
			showDescription: !showDescription
		}));
	}

	render() {
		const {
			ticketsAvailable,
			classes,
			error,
			name,
			description,
			price_in_cents,
			amount,
			subTotal,
			increment,
			available,
			onNumberChange,
			limitPerPerson,
			discount_in_cents,
			discount_as_percentage,
			redemption_code,
			eventIsCancelled,
			submitAttempted,
			ticketSelection,
			checkOut
		} = this.props;
		let { status } = this.props;
		status = eventIsCancelled ? "Cancelled" : status;
		const { showDescription } = this.state;

		// const incrementText =
		// 	increment > 1 ? `(Tickets must be bought in groups of ${increment})` : "";

		const lppText =
			limitPerPerson && amount == limitPerPerson
				? `there is a ${limitPerPerson} ticket limit`
				: "";

		let calculatedPriceInCents;
		if (!isNaN(price_in_cents)) {
			calculatedPriceInCents =
				redemption_code && discount_in_cents
					? price_in_cents - discount_in_cents
					: price_in_cents;
		}

		let discount_message = "";
		if (discount_as_percentage) {
			discount_message = discount_as_percentage + "% Discount applied";
		} else if (discount_in_cents) {
			discount_message = dollars(discount_in_cents) + " Discount applied";
		}

		let priceActive = ticketsAvailable;
		let priceDisplay = null;
		if (!isNaN(calculatedPriceInCents)) {
			priceDisplay = `${dollars(calculatedPriceInCents, true)}`;
		}

		//They can't select more than is available (This will be fixed in the API soon hopefully)
		if (available < increment) {
			status = "SoldOut";
			priceActive = false;
		}

		let unavailableLabel = null;
		switch (status) {
			case "SoldOut":
				unavailableLabel = (
					<ColorTag size="small" variant="disabled">
						Sold out
					</ColorTag>
				);
				break;
			case "NoActivePricing":
			case "Cancelled":
			case "Deleted":
				unavailableLabel = (
					<ColorTag size="small" variant="disabled">
						Unavailable
					</ColorTag>
				);
				break;
			case "SaleEnded":
				unavailableLabel = (
					<ColorTag size="small" variant="disabled">
						Sale ended
					</ColorTag>
				);
				break;
			case "OnSaleSoon":
				unavailableLabel = (
					<ColorTag size="small" variant="green">
						On sale soon
					</ColorTag>
				);
				priceActive = true;
				break;
			case "Published":
				break;
		}

		if(checkOut) {
			return (
				<div>
					<Grid
						alignItems="center"
						className={classes.container}
						container
					>
						{redemption_code ? (
							<Grid item xs={12} sm={12} md={12} lg={12}>
								<Typography className={classes.promoAppliedText}>
									{discount_message ? discount_message : "Code applied"}
								</Typography>
							</Grid>
						) : null}

						<Grid
							item
							xs={6}
							sm={6}
							md={2}
							lg={2}
							className={classes.ticketSelectionContainer}
						>
							<NumberSelect
								onIncrement={() => {
									const currentAmount = amount ? amount : 0;
									let newAmount = Number(currentAmount) + increment;

									if (limitPerPerson && newAmount > limitPerPerson) {
										newAmount = limitPerPerson;
									}

									if (newAmount <= available) {
										onNumberChange(newAmount);
									}
								}}
								onDecrement={() => {
									const currentAmount = amount ? amount : 0;
									let newAmount = Number(currentAmount) - increment;
									if (newAmount < 0) {
										newAmount = 0;
									}
									onNumberChange(newAmount);
								}}
								available={amount < available}
							>
								{amount}
							</NumberSelect>
						</Grid>
						<Grid
							item
							xs={3}
							sm={3}
							md={5}
							lg={6}
							className={classes.detailContainer}
						>
							{description ? (
								<Typography className={classes.name}>
									{description}
								</Typography>
							) : null}
							<Typography variant="caption" style={{ color: "red" }}>
								{lppText}
							</Typography>
						</Grid>
						<Grid item xs={3} sm={3} md={2} lg={2}>
							<Typography
								className={classnames({
									[classes.lineEntryText]: true
								})}
							>
								{priceDisplay}
							</Typography>
						</Grid>
						<Grid item xs={3} sm={3} md={3} lg={2}>
							<Typography
								className={classnames({
									[classes.lineEntryText]: true
								})}
							>
								{subTotal}
							</Typography>
						</Grid>
					</Grid>

					<Divider style={{ margin: 0 }}/>
				</div>
			);
		} else {
			return (
				<div>
					<Grid alignItems="center" className={classes.container} container>
						{redemption_code ? (
							<Grid item xs={12} sm={12} md={12} lg={12}>
								<Typography className={classes.promoAppliedText}>
									{discount_message ? discount_message : "Code applied"}
								</Typography>
							</Grid>
						) : null}

						<Grid item xs={3} sm={3} md={4} lg={3}>
							<Typography
								className={classnames({
									[classes.price]: true,
									[classes.priceActive]: true
								})}
							>
								{priceDisplay}
							</Typography>
						</Grid>
						<Grid
							item
							xs={5}
							sm={6}
							md={5}
							lg={6}
							className={classes.detailContainer}
						>
							<Typography className={classes.name}>{name}</Typography>
							<Typography variant="caption" style={{ color: "red" }}>
								{lppText}
							</Typography>
							{description && !discount_in_cents ? (
								<Typography
									className={classes.readMoreLessText}
									onClick={this.readMoreLess.bind(this)}
								>
									{showDescription ? "Read Less" : "Read More"}
								</Typography>
							) : null}
						</Grid>

						<Grid
							item
							xs={4}
							sm={3}
							md={3}
							lg={3}
							className={classes.ticketSelectionContainer}
						>
							<NumberSelect
								onIncrement={() => {
									const currentAmount = amount ? amount : 0;
									let newAmount = Number(currentAmount) + increment;

									if (limitPerPerson && newAmount > limitPerPerson) {
										newAmount = limitPerPerson;
									}

									onNumberChange(newAmount);
									cartValidateFields(submitAttempted, ticketSelection);
								}}
								onDecrement={() => {
									const currentAmount = amount ? amount : 0;
									let newAmount = Number(currentAmount) - increment;
									if (newAmount < 0) {
										newAmount = 0;
									}

									onNumberChange(newAmount);
									cartValidateFields(submitAttempted, ticketSelection);
								}}
								available={amount < available}
							>
								{amount}
							</NumberSelect>
						</Grid>
					</Grid>

					{showDescription ? (
						<Grid justify="flex-end" alignItems="flex-end" container>
							<Grid
								item
								xs={9}
								sm={9}
								md={8}
								lg={9}
								className={classes.detailContainer}
							>
								{description ? (
									<Typography className={classes.description}>
										{nl2br(description)}
									</Typography>
								) : null}
							</Grid>
						</Grid>
					) : null}

					<Divider style={{ margin: 0 }}/>
				</div>
			);
		}
	}
}

TicketSelection.propTypes = {
	ticketsAvailable: PropTypes.bool,
	onNumberChange: PropTypes.func.isRequired,
	name: PropTypes.string.isRequired,
	description: PropTypes.string,
	price_in_cents: PropTypes.number,
	discount_in_cents: PropTypes.number,
	redemption_code: PropTypes.string,
	error: PropTypes.string,
	amount: PropTypes.number,
	increment: PropTypes.number.isRequired,
	available: PropTypes.number.isRequired,
	limitPerPerson: PropTypes.number,
	status: PropTypes.string.isRequired,
	classes: PropTypes.object.isRequired,
	eventIsCancelled: PropTypes.bool,
	submitAttempted: PropTypes.bool.isRequired,
	ticketSelection: PropTypes.object,
	subTotal: PropTypes.string,
	checkOut: PropTypes.bool
};

const styles = theme => ({
	container: {
		marginTop: theme.spacing.unit * 3,
		marginBottom: theme.spacing.unit
	},
	price: {
		fontSize: theme.typography.fontSize * 1.8,
		fontFamily: fontFamilyDemiBold,
		color: "#D1D1D1"
	},
	priceActive: {
		color: theme.palette.secondary.main
	},
	name: {
		fontSize: theme.typography.fontSize,
		fontFamily: fontFamilyDemiBold
	},
	unavailable: {
		fontSize: theme.typography.fontSize * 0.8,
		color: "gray",
		textAlign: "center"
	},
	description: {
		fontSize: theme.typography.fontSize * 0.75,
		color: "#9DA3B4"
	},
	detailContainer: {
		paddingLeft: theme.spacing.unit,
		paddingRight: theme.spacing.unit
	},
	readMoreLessText: {
		marginTop: theme.spacing.unit / 2,
		font: "inherit",
		color: secondaryHex,
		cursor: "pointer",
		fontSize: theme.typography.fontSize * 0.75
	},
	promoAppliedText: {
		backgroundColor: secondaryHex,
		color: "#FFFFFF",
		borderRadius: 4,
		paddingTop: 8,
		paddingBottom: 3,
		paddingLeft: 14,
		paddingRight: 14,
		display: "inline-block",
		marginBottom: 4,
		fontSize: theme.typography.fontSize * 0.8125,
		textTransform: "capitalize"
	},
	ticketSelectionContainer: {
		display: "flex",
		justifyContent: "flex-end"
	}
});

export default withStyles(styles)(TicketSelection);
