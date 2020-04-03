import React from "react";
import { withStyles } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import ColorTag from "../elements/ColorTag";
import PropTypes from "prop-types";

class TagsContainer extends React.Component {
	render() {
		const {
			cancelled,
			isOnSale,
			eventEnded,
			overrideStatus,
			isPublished,
			publishedDateAfterNowAndNotDraft,
			isExternal
		} = this.props;

		let tags = null;
		if (cancelled) {
			tags = <ColorTag variant="disabled">Cancelled</ColorTag>;
		} else {
			let onSaleTag = null;
			let overrideTag = null;

			if (eventEnded) {
				onSaleTag = <ColorTag variant="disabled">Event ended</ColorTag>;
			} else if (isOnSale && !overrideStatus) {
				onSaleTag = <ColorTag variant="green">On sale</ColorTag>;
			} else if (isExternal) {
				onSaleTag = <ColorTag variant="green">External</ColorTag>;
			}

			if(overrideStatus) {
				if(overrideStatus === "PurchaseTickets") {
					overrideTag = <ColorTag variant="green">On Sale</ColorTag>;
				} else if(overrideStatus === "Rescheduled") {
					overrideTag = <ColorTag variant="disabled">Postponed</ColorTag>;
				} else if(overrideStatus === "Ended") {
					overrideTag = <ColorTag variant="disabled">Event Ended</ColorTag>;
				} else {
					overrideTag = <ColorTag variant="disabled">{overrideStatus}</ColorTag>;
				}
			}

			tags = (
				<div className={styles.statusContainer}>
					<ColorTag
						style={{ marginRight: 10 }}
						variant={isPublished || publishedDateAfterNowAndNotDraft ? "secondary" : "disabled"}
					>
						{isPublished
							? "Published"
							: publishedDateAfterNowAndNotDraft
								? "Scheduled"
								: "Draft"}
					</ColorTag>
					{onSaleTag}
					{overrideTag}
				</div>
			);
		}

		return tags;
	}
}

TagsContainer.propTypes = {
	cancelled: PropTypes.string.isRequired,
	isOnSale: PropTypes.bool.isRequired,
	eventEnded: PropTypes.bool.isRequired,
	overrideStatus: PropTypes.string,
	isPublished: PropTypes.bool.isRequired,
	publishedDateAfterNowAndNotDraft: PropTypes.bool.isRequired,
	isExternal: PropTypes.bool.isRequired
};

const styles = {

};

export default withStyles(styles)(TagsContainer);