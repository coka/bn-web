package pages.components.admin.events.overview;

import java.time.LocalDate;
import java.time.LocalTime;

import enums.EventStatus;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import model.Venue;
import pages.BaseComponent;
import utils.ProjectUtils;
import utils.formatter.VenueFormatter;

public class EventOverviewTopComponent extends BaseComponent {

	private WebElement container;
	private String eventName;

	private TimeInfoComponent timeComponent;

	private final String relativeVenueContainerXpath = "//div[img[contains(@alt,'Location Icon')]]/div";
	private final String relativeVenueNameXpath = relativeVenueContainerXpath + "/p[1]";
	private final String relativeVenueAdressXpath = relativeVenueContainerXpath + "/p[2]";
	private final String relativeVenueRestOfAddress = relativeVenueContainerXpath +"/p[3]";


	public EventOverviewTopComponent(WebDriver driver, String eventName) {
		super(driver);
		this.container = findContainerElement(eventName);
		this.eventName = eventName;
	}

	public String getInternaleEventName() {
		return this.eventName;
	}

	private WebElement findContainerElement(String eventName) {
		By by = By.xpath("//div[div[div[p[contains(text(),'" + eventName + "')]] and div[contains(@style,'background-image')]]]");
		if(isExplicitlyWaitVisible(by)) {
			return explicitWaitForVisibilityBy(by);
		} else {
			throw new IllegalArgumentException("Overview Header Component element with name: " + eventName + " can not be found");
		}
	}

	public boolean isStatusEqual(EventStatus status) {
		WebElement element = findPublishStatusElement(status.getValue());
		return element != null;
	}

	private WebElement findPublishStatusElement(String status) {
		By by = By.xpath("//div[p[contains(text(),'" + this.eventName + "')]]//div/p[contains(text(),'" + status + "')]");
		if (isExplicitlyWaitVisible(by)){
			return explicitWaitForVisibilityBy(by);
		}
		return null;
	}

	public TimeInfoComponent getTimeInfo() {
		if (timeComponent == null) {
			WebElement timeCompEl = getAccessUtils()
					.getChildElementFromParentLocatedBy(container,
							By.xpath(".//div[img[contains(@alt,'Calendar Icon')]]"));
			this.timeComponent = new TimeInfoComponent(driver, timeCompEl);
		}
		return timeComponent;
	}

	public Venue getVenue() {
		WebElement nameEl = getAccessUtils()
				.getChildElementFromParentLocatedBy(container, By.xpath(relativeVenueNameXpath));
		WebElement adressEl = getAccessUtils()
				.getChildElementFromParentLocatedBy(container, By.xpath(relativeVenueAdressXpath));
		WebElement cityStateZipEl = getAccessUtils()
				.getChildElementFromParentLocatedBy(container, By.xpath(relativeVenueRestOfAddress));
		String vName = nameEl.getText().trim();
		String vAddress = adressEl.getText().trim();
		String cityStateZip = cityStateZipEl.getText().trim();
		String[] tokens = cityStateZip.split(",");
		String[] stateZipTokens = tokens[1].trim().split(" ");

		VenueFormatter formater = new VenueFormatter("N, A, C, Sa, Z");
		Venue venue = formater.parse(vName + ", " + vAddress + ", " + tokens[0] + ", " + stateZipTokens[0] + ", " + stateZipTokens[1]);
		return venue;
	}

	public class TimeInfoComponent extends BaseComponent {

		private WebElement timeContainer;

		private final String relativeDateXpath = "./div/p[1]";
		private final String relativeDoorTimeXpath = "./div/p[2]";
		private final String relativeShowStartXpath = "./div/p[3]";

		public TimeInfoComponent(WebDriver driver, WebElement timeContainer) {
			super(driver);
			this.timeContainer = timeContainer;
		}

		public LocalDate getEventStartDate() {
			WebElement dateEl = getAccessUtils().getChildElementFromParentLocatedBy(timeContainer, By.xpath(relativeDateXpath));
			LocalDate startDate = ProjectUtils.parseDate(ProjectUtils.EVENT_OVERVIEW_DATE_FORMAT, dateEl.getText());
			return startDate;
		}

		public LocalTime getDoorTime() {
			WebElement timeEl =getAccessUtils().getChildElementFromParentLocatedBy(timeContainer, By.xpath(relativeDoorTimeXpath));
			String time =  timeEl.getText().split("at")[1].trim();
			return ProjectUtils.parseTime(ProjectUtils.EVENT_OVERVIEW_TIME_FORMAT, time);
		}

		public LocalTime getShowStartTime() {
			WebElement timeEl =getAccessUtils().getChildElementFromParentLocatedBy(timeContainer, By.xpath(relativeShowStartXpath));
			String time =  timeEl.getText().split("at")[1].trim();
			return ProjectUtils.parseTime(ProjectUtils.EVENT_OVERVIEW_TIME_FORMAT, time);
		}
	}
}
