import React, { Component } from "react";
import PropTypes from "prop-types";
import { Typography, withStyles } from "@material-ui/core";
import announcements from "../../../stores/announcements";
import { fontFamilyDemiBold } from "../../../config/theme";
import { observer } from "mobx-react";
import user from "../../../stores/user";

@observer
class AnnouncementBanner extends Component {
	constructor(props) {
		super(props);
	}

	componentDidMount() {
		this.checkForAnnouncements();
	}

	checkForAnnouncements() {
		if (user.currentOrganizationId) {
			announcements.getOrgAnnouncements();
		} else {
			setTimeout(() => {
				this.checkForAnnouncements();
			}, 500);
		}
	}

	render() {
		const { classes } = this.props;
		const { messages } = announcements;
		return (
			<div className={classes.root}>
				{messages.length ? (
					<div className={classes.bannerContainer}>
						{messages.map((message, i) => {
							return (
								<Typography key={i} className={classes.bannerText}>
									{message.message}
								</Typography>
							);
						})}

					</div>
				) : null}
			</div>
		);
	}
}

const styles = theme => ({
	root: {},
	bannerContainer: {
		paddingLeft: theme.spacing.unit,
		paddingRight: theme.spacing.unit,
		paddingBottom: theme.spacing.unit * 2,
		borderBottom: "1px solid #ececec",
		marginBottom: theme.spacing.unit * 2
	},
	bannerText: {
		fontFamily: fontFamilyDemiBold,
		fontSize: 18
	}
});

AnnouncementBanner.propTypes = {
	classes: PropTypes.object.isRequired,
	heading: PropTypes.bool,
	shaded: PropTypes.bool
};

export default withStyles(styles)(AnnouncementBanner);
