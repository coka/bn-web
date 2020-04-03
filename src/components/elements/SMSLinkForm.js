import React, { Component } from "react";
import { Card, Typography, withStyles } from "@material-ui/core";
import { observer } from "mobx-react";
import PropTypes from "prop-types";

import notifications from "../../stores/notifications";
import Button from "./Button";
import InputGroup from "../common/form/InputGroup";
import user from "../../stores/user";
import removePhoneFormatting from "../../helpers/removePhoneFormatting";
import Bigneon from "../../helpers/bigneon";
import { validPhone } from "../../validators";
import BigneonPerksDialog from "../pages/events/BigneonPerksDialog";
import { fontFamily, fontFamilyBold, secondaryHex } from "../../config/theme";

@observer
class SMSLinkForm extends Component {
	constructor(props) {
		super(props);

		this.state = {
			phone: "",
			isSubmitting: false,
			isSent: false,
			perksDialogOpen: false,
			showConfirm: false
		};
		this.togglePerksDialog = this.togglePerksDialog.bind(this);
		this.toggleConfirm = this.toggleConfirm.bind(this);
	}

	componentDidMount() {
		setTimeout(() => {
			const { phone } = user;
			if (phone) {
				this.setState({ phone });
			}
		}, 500);
	}

	togglePerksDialog(e) {
		e.preventDefault();
		this.setState(prevState => ({
			perksDialogOpen: !prevState.perksDialogOpen
		}));
	}

	toggleConfirm() {
		this.setState(prevState => ({
			showConfirm: !prevState.showConfirm
		}));
	}

	onSubmit(e) {
		e.preventDefault();
		const phone = removePhoneFormatting(this.state.phone);

		if (!validPhone(phone)) {
			return notifications.show({
				message: "Invalid phone number.",
				variant: "warning"
			});
		}

		this.setState({ isSubmitting: true });
		Bigneon()
			.sendDownloadLink.create({
				phone
			})
			.then(() => {
				this.setState({ isSubmitting: false, isSent: true });
				notifications.show({ message: "SMS sent!", variant: "success" });

				const { onSuccess } = this.props;
				onSuccess ? onSuccess() : null;
			})
			.catch(err => {
				this.setState({ isSubmitting: false });
				console.error(err);
				notifications.show({
					message: "Sorry, something went wrong.",
					variant: "error"
				});
			});
	}

	render() {
		const {
			phone,
			perksDialogOpen,
			isSent,
			showConfirm,
			isSubmitting
		} = this.state;
		const { classes, autoFocus } = this.props;

		const cardTitle = showConfirm
			? "Enter Your Phone Number"
			: "Please Confirm Your Number";
		const explainerText = showConfirm
			? "We want to make sure we send the text link to download the Big Neon app to the right person."
			: "We’ll send you a link to download the Big Neon App to View your Tickets. Don’t want to download the app? Just bring your photo ID to the event instead.";

		return (
			<div>
				<BigneonPerksDialog
					open={perksDialogOpen}
					onClose={() => this.togglePerksDialog}
				/>
				<div className={classes.contentHolder}>
					<Typography className={classes.cardTitle}>{cardTitle}</Typography>
					<Typography className={classes.cardExplainerText}>
						{explainerText}
					</Typography>
					<div className={classes.smsContainer}>
						<form
							noValidate
							autoComplete="off"
							onSubmit={this.onSubmit.bind(this)}
						>
							{showConfirm ? (
								<div>
									<Typography className={classes.numberText}>
										+1 {phone}
									</Typography>
									<div className={classes.btnContainer}>
										<Button
											type="submit"
											disabled={isSubmitting}
											variant="secondary"
											style={{ width: "100%", marginRight: 10 }}
											size={"mediumLarge"}
										>
											{isSubmitting ? "Sending..." : "Send text"}
										</Button>
										<Button
											disabled={isSubmitting}
											variant="plainWhite"
											style={{ width: "100%" }}
											size={"mediumLarge"}
											onClick={this.toggleConfirm}
										>
											Change Number
										</Button>
									</div>
								</div>
							) : (
								<div>
									<InputGroup
										autoFocus={autoFocus}
										label="Phone"
										value={phone}
										placeholder="+1"
										type="phone"
										name="phone"
										onChange={e => this.setState({ phone: e.target.value })}
									/>
									<Button
										disabled={isSubmitting}
										style={{ width: "100%" }}
										variant="secondary"
										size={"mediumLarge"}
										onClick={this.toggleConfirm}
									>
										{isSubmitting ? "Sending..." : "Continue"}
									</Button>
								</div>
							)}
						</form>
					</div>
					<div onClick={this.togglePerksDialog}>
						<Typography className={classes.pinkLink}>
							Why Life is Better with the Big Neon App
						</Typography>
					</div>
				</div>
			</div>
		);
	}
}

SMSLinkForm.propTypes = {
	classes: PropTypes.object.isRequired,
	autoFocus: PropTypes.bool,
	onSuccess: PropTypes.func
};

const styles = theme => ({
	smsContainer: {
		width: "100%"
	},
	pinkLink: {
		color: secondaryHex,
		fontSize: 16,
		fontFamily: fontFamily,
		textDecoration: "none",
		lineHeight: "18px",
		cursor: "pointer",
		marginTop: 20,
		textAlign: "center"
	},
	cardTitle: {
		color: "#2C3136",
		fontSize: 30,
		lineHeight: "34px",
		fontFamily: fontFamilyBold,
		marginTop: 20
	},
	numberText: {
		color: "#2C3136",
		fontSize: 26,
		lineHeight: "30px",
		fontFamily: fontFamilyBold,
		marginTop: 20,
		marginBottom: 20,
		textAlign: "center"
	},
	cardExplainerText: {
		fontSize: 16,
		color: "#9BA3B5",
		textAlign: "center",
		lineHeight: "18px",
		marginBottom: theme.spacing.unit * 2,
		marginTop: theme.spacing.unit * 2
	},
	contentHolder: {
		paddingLeft: theme.spacing.unit * 5,
		paddingRight: theme.spacing.unit * 5,
		paddingBottom: theme.spacing.unit * 5,
		display: "flex",
		flexDirection: "column",
		alignItems: "center"
	},
	btnContainer: {
		display: "flex"
	}
});

export default withStyles(styles)(SMSLinkForm);
