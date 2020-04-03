import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Divider from "@material-ui/core/Divider";
import { Typography } from "@material-ui/core";

import MenuItem from "../../../elements/menu/MenuItem";
import MobileSwitchOrgMenuItem from "./MobileSwitchOrgMenuItem";
import MobileBoxOfficeMenuItem from "./MobileBoxOfficeMenuItem";

const styles = theme => {
	return {};
};

const AdminList = props => {
	const { toggleDrawer, openMenuItem, changeOpenMenu } = props;

	return (
		<div>
			{/* <Divider className={classes.divider} /> */}
			<MenuItem
				onClick={toggleDrawer}
				shortLayout
				iconName="events"
				to="/admin/events"
			>
				Events
			</MenuItem>

			<MenuItem
				onClick={toggleDrawer}
				shortLayout
				iconName="my-events"
				to="/admin/fans"
			>
				Fans
			</MenuItem>

			<MenuItem
				onClick={toggleDrawer}
				shortLayout
				iconName="artists"
				to="/admin/artists"
			>
				Artists
			</MenuItem>

			<MenuItem
				onClick={toggleDrawer}
				shortLayout
				iconName="chart"
				to="/admin/reports"
			>
				Reports
			</MenuItem>

			<MenuItem
				onClick={toggleDrawer}
				shortLayout
				iconName="megaphone"
				to={"/admin/marketing"}
			>
				Marketing
			</MenuItem>
			<MenuItem
				onClick={toggleDrawer}
				shortLayout
				iconName="account"
				to={"/admin/organizations/current"}
			>
				Settings
			</MenuItem>

			<Divider style={{ marginTop: 10, marginBottom: 10 }}/>

			<Typography
				style={{
					textAlign: "center"
				}}
				variant="caption"
			>
				Super Admin
			</Typography>
			<MenuItem
				onClick={toggleDrawer}
				shortLayout
				iconName="account"
				to="/admin/organizations/"
			>
				Organizations
			</MenuItem>
			<MenuItem
				onClick={toggleDrawer}
				shortLayout
				iconName="venues"
				to="/admin/venues"
			>
				Venues
			</MenuItem>
			<MenuItem
				onClick={toggleDrawer}
				shortLayout
				iconName="account"
				to="/admin/regions"
			>
				Regions
			</MenuItem>
			<MenuItem
				onClick={toggleDrawer}
				shortLayout
				iconName="account"
				to="/admin/slugs"
			>
				Slugs
			</MenuItem>
			<MenuItem
				onClick={toggleDrawer}
				shortLayout
				iconName="megaphone"
				to={"/admin/announcements"}
			>
				Announcements
			</MenuItem>
			<MobileSwitchOrgMenuItem/>
			<MobileBoxOfficeMenuItem onClick={toggleDrawer}/>
		</div>
	);
};

AdminList.propTypes = {
	classes: PropTypes.object.isRequired,
	toggleDrawer: PropTypes.func.isRequired,
	openMenuItem: PropTypes.string,
	changeOpenMenu: PropTypes.func.isRequired
};

export default withStyles(styles)(AdminList);
