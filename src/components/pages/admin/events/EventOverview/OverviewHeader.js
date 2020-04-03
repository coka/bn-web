import { Typography } from "@material-ui/core";
import React from "react";
import Card from "../../../../elements/Card";
import optimizedImageUrl from "../../../../../helpers/optimizedImageUrl";
import Divider from "@material-ui/core/Divider";
import servedImage from "../../../../../helpers/imagePathHelper";
import ColorTag from "../../../../elements/ColorTag";
import moment from "moment-timezone";
import TagsContainer from "../../../../common/TagsContainer";

const OverviewHeader = ({ classes, event, artists, venue, timezoneAbbr }) => {
	const {
		name,
		cancelled_at,
		is_external,
		displayEventStartTime,
		displayDoorTime,
		shortDate,
		isPublished,
		isOnSale,
		eventEnded,
		publish_date,
		status,
		publishedDateAfterNowAndNotDraft,
		override_status
	} = event;

	const promo_image_url = event.promo_image_url
		? optimizedImageUrl(event.promo_image_url)
		: null;
	const promoImgStyle = {};
	if (promo_image_url) {
		promoImgStyle.backgroundImage = `url(${promo_image_url})`;
	}

	function renderArtistSubtitle() {
		if (artists.length > 1) {
			return (
				<Typography className={classes.headerSupportingSubtitle}>
					With&nbsp;
					{artists.map(({ artist }, index) => {
						if (artist.name != name) {
							return (
								<span key={index}>
									{artist.name}
									{artists.length === index + 1 ? "" : " and "}
								</span>
							);
						}
					})}
				</Typography>
			);
		} else {
			return <div>&nbsp;</div>;
		}
	}

	return (
		<Card className={classes.eventHeaderInfo}>
			<div className={classes.headerImage} style={promoImgStyle}/>
			<div className={classes.headerInfo}>
				<Typography className={classes.headerTitle}>{name}</Typography>
				<div className={classes.justifyBetween}>
					{renderArtistSubtitle()}
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
				<Divider className={classes.dividerStyle}/>
				<div className={classes.headerEventDateInfo}>
					<div className={classes.dateInfoContainer}>
						<img
							alt="Calendar Icon"
							className={classes.icon}
							src={servedImage("/icons/events-black.svg")}
						/>
						<div className={classes.infoSmallContainer}>
							<Typography className={classes.infoSmallTitle}>
								{shortDate}
							</Typography>
							<Typography className={classes.infoSmallText}>
								{`Doors open at ${displayDoorTime} ${timezoneAbbr}`}
							</Typography>
							<Typography className={classes.infoSmallText}>
								{`Show starts at ${displayEventStartTime} ${timezoneAbbr}`}
							</Typography>
						</div>
					</div>
					<div className={classes.venueInfoContainer}>
						<img
							alt="Location Icon"
							className={classes.icon}
							src={servedImage("/icons/location-black.svg")}
						/>
						<div className={classes.infoSmallContainer}>
							<Typography className={classes.infoSmallTitle}>
								{venue.name}
							</Typography>
							<Typography className={classes.infoSmallText}>
								{venue.address}
							</Typography>
							<Typography className={classes.infoSmallText}>
								{venue.city}, {venue.state} {venue.postal_code}
							</Typography>
						</div>
					</div>
				</div>
			</div>
		</Card>
	);
};
export default OverviewHeader;
