import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import { Typography, Dialog } from "@material-ui/core";
// import Dialog from "../../elements/Dialog";
import { fontFamily, fontFamilyDemiBold } from "../../../config/theme";
import Button from "../../elements/Button";

class BigneonPerksDialog extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			name: "",
			isSubmitting: false
		};
	}

	render() {
		const { onClose, open, classes } = this.props;

		return (
			<Dialog open={open} onClose={onClose}>
				<div className={classes.root}>
					<div className={classes.modalContainer}>
						<Typography className={classes.dialogTitle}>
							Life is Better with the Big Neon App!
						</Typography>
						<Typography className={classes.lightGreyText}>
							The Big Neon app makes your tickets more secure and unlocks a
							richer experience at the event. Don’t want to use the app? Just
							bring your photo ID to the event instead.
						</Typography>
						<div className={classes.contentContainer}>
							<div className={classes.iconText}>
								<Typography className={classes.withBNtext}>
									With the Big Neon App you can:
								</Typography>
								<Typography className={classes.withBNtext}>
									<span className={classes.icon}>&#x1F46F;</span>
									Transfer tickets to friends
								</Typography>
								<Typography className={classes.withBNtext}>
									<span className={classes.icon}>&#x1F430;</span>
									Speed through the line
								</Typography>
								<Typography className={classes.withBNtext}>
									<span className={classes.icon}>&#x1F379;</span>
									Score presale access to events
								</Typography>
								<Typography
									style={{ alignSelf: "center" }}
									className={classes.withBNtext}
								>
									... and more.
								</Typography>
							</div>
						</div>
						<div className={classes.btnContainer}>
							<Button
								variant={"secondary"}
								style={{ width: "100%" }}
								onClick={onClose()}
							>
								Awesome
							</Button>
						</div>
					</div>
				</div>
			</Dialog>
		);
	}
}

BigneonPerksDialog.propTypes = {
	id: PropTypes.string,
	onClose: PropTypes.func.isRequired
};

const styles = theme => ({
	root: {
		width: 380,
		padding: 45
	},
	dialogTitle: {
		color: "#32383E",
		fontSize: 26,
		lineHeight: "30px",
		fontFamily: fontFamilyDemiBold,
		textAlign: "center"
	},
	btnStyle: {
		flex: 1,
		marginRight: theme.spacing.unit
	},
	nameText: {
		marginTop: theme.spacing.unit,
		fontFamily: fontFamilyDemiBold
	},
	lightGreyText: {
		fontSize: 16,
		color: "#9BA3B5",
		fontFamily: fontFamily,
		lineHeight: "18px",
		textAlign: "center",
		marginTop: theme.spacing.unit * 2,
		marginBottom: theme.spacing.unit * 2
	},
	modalContainer: {
		maxWidth: 400
	},
	customTitle: {
		fontSize: 26
	},
	withBNtext: {
		color: "#3C383F",
		fontSize: 15,
		lineHeight: "26px",
		marginTop: 10,
		fontFamily: fontFamilyDemiBold
	},
	icon: {
		marginRight: 5
	},
	iconText: {
		marginBottom: 15,
		display: "flex",
		flexDirection: "column",
		justifyContent: "flex-start",
		alignItems: "flex-start"
	},
	btnContainer: {
		display: "flex",
		justifyContent: "center",
		alignItems: "center"
	},
	contentContainer: {
		textAlign: "center",
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
		[theme.breakpoints.down("md")]: {
			textAlign: "left"
		}
	}
});

export default withStyles(styles)(BigneonPerksDialog);
