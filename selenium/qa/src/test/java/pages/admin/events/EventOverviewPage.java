package pages.admin.events;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindAll;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.ui.ExpectedConditions;

import model.Artist;
import model.Event;
import model.TicketType;
import model.Venue;
import pages.BasePage;
import pages.components.GenericDropDown;
import pages.components.admin.events.overview.ArtistOverviewComponent;
import pages.components.admin.events.overview.EventDetailsOverviewComponent;
import pages.components.admin.events.overview.EventDetailsOverviewComponent.BasicDetailInfo;
import pages.components.admin.events.overview.EventDetailsOverviewComponent.TimeDetailInfo;
import pages.components.admin.events.overview.EventOverviewTopComponent;
import pages.components.admin.events.overview.EventPublishOverviewComponent;
import pages.components.admin.events.overview.EventTicketTypeOverviewComponent;
import utils.Constants;
import utils.ProjectUtils;

public class EventOverviewPage extends BasePage {

	private String eventName;

	@FindAll(@FindBy(xpath = "//div[div[p[contains(text(),'Artists')]]]/div[1]/div"))
	private List<WebElement> artistList;

	@FindAll(@FindBy(xpath = "//div[p[contains(text(),'Ticketing')]]/div"))
	private List<WebElement> ticketList;

	@FindBy(xpath = "//div[div[div[img]/p[contains(text(),'Event')]]]/following-sibling::div//button")
	private WebElement optionDropDownActivate;

	@FindBy(id = "long-menu")
	private WebElement optionDropDownContainer;

	public static final String DD_MENU_EDIT_EVENT = "Edit event";

	private EventOverviewTopComponent topComponent;
	private EventPublishOverviewComponent publishOptionsComponent;

	public EventOverviewPage(WebDriver driver, String eventName) {
		super(driver);
		this.eventName = eventName;
	}

	@Override
	public void presetUrl() {

	}

	@Override
	public boolean isAtPage() {
		return explicitWait(15, ExpectedConditions.urlMatches(Constants.getAdminEvents() + "/*.*/event-overview"));
	}

	public boolean isTitleCorrect() {
		if (eventName != null && !eventName.isEmpty()) {
			return isExplicitlyWaitVisible(By.xpath("//div[img]/p[contains(text(),'" + eventName + "')]"));
		} else {
			return false;
		}
	}

	public Event getAllEventInfo() {
		Event event = new Event();
		composeEventInfoFromTopComponent(event);
		composeEventInfoFromArtists(event);
		composeEventInfoFromDetails(event);
		composeEventInfoFromTicketType(event);
		return event;
	}

	public void selectOptionFromDD(String label) {
		GenericDropDown dropDown = new GenericDropDown(driver, optionDropDownActivate, optionDropDownContainer);
		dropDown.selectElementFromDropDownNoValueCheck(By.xpath("//ul//li[div[span[contains(text(),'" + label + "')]]]"));
	}

	public void composeEventInfoFromTopComponent(Event event) {
		if (event == null) {
			event = new Event();
		}
		Venue venue = getTopComponent().getVenue();
		LocalDate startDate = getTopComponent().getTimeInfo().getEventStartDate();
		LocalTime startTIme = getTopComponent().getTimeInfo().getShowStartTime();
		LocalTime doorTime = getTopComponent().getTimeInfo().getDoorTime();
		event.setStartDate(ProjectUtils.formatDate(ProjectUtils.DATE_FORMAT, startDate));
		event.setStartTime(ProjectUtils.formatTime(ProjectUtils.TIME_FORMAT, startTIme));
		event.setComparableDoorTime(ProjectUtils.formatTime(ProjectUtils.TIME_FORMAT, doorTime));
		event.setVenue(venue);
	}

	public void composeEventInfoFromArtists(Event event) {
		if (event == null) {
			event = new Event();
		}
		explicitWait(15, ExpectedConditions.visibilityOfAllElements(artistList));
		List<ArtistOverviewComponent> artComponents= artistList.stream()
				.map(el-> new ArtistOverviewComponent(driver, el)).collect(Collectors.toList());
		for(ArtistOverviewComponent comp : artComponents) {
			Artist artist = new Artist();
			artist.setName(comp.getArtistName());
			event.addArtist(artist);
		}
	}

	public void composeEventInfoFromDetails(Event event) {
		if (event == null) {
			event = new Event();
		}
		//compare info on page if the same
		EventDetailsOverviewComponent detailsComponent = new EventDetailsOverviewComponent(driver);
		LocalDate startDate = detailsComponent.getDateValue(TimeDetailInfo.START_DATE);
		LocalDate endDate = detailsComponent.getDateValue(TimeDetailInfo.END_DATE);

		event.setEventName(detailsComponent.getStringValue(BasicDetailInfo.EVENT_NAME));
		event.setStartTime(detailsComponent.getStringValue(TimeDetailInfo.START_TIME));
		event.setEndTime(detailsComponent.getStringValue(TimeDetailInfo.END_TIME));
		event.setComparableDoorTime(detailsComponent.getStringValue(TimeDetailInfo.DOOR_TIME));
		event.setStartDate(ProjectUtils.formatDate(ProjectUtils.DATE_FORMAT, startDate));
		event.setEndDate(ProjectUtils.formatDate(ProjectUtils.DATE_FORMAT, endDate));
	}

	public void composeEventInfoFromTicketType(Event event) {
		if (event == null) {
			event = new Event();
		}
		List<TicketType> ticketTypes = new ArrayList<TicketType>();
		explicitWait(15, ExpectedConditions.visibilityOfAllElements(ticketList));
		for(WebElement container : ticketList) {
			EventTicketTypeOverviewComponent ticketTypeComponent = new EventTicketTypeOverviewComponent(driver, container);
			ticketTypes.add(ticketTypeComponent.getTicketTypeData());
		}
		event.setTicketTypes(ticketTypes);

	}

	public EventOverviewTopComponent getTopComponent() {
		if (this.topComponent == null || !this.eventName.equals(this.topComponent.getInternaleEventName())) {
			this.topComponent = new EventOverviewTopComponent(driver, this.eventName);
		}
		return this.topComponent;
	}

	public EventPublishOverviewComponent getPublishOptionsComponent() {
		if (this.publishOptionsComponent == null) {
			this.publishOptionsComponent = new EventPublishOverviewComponent(driver);
		}
		return this.publishOptionsComponent;
	}


}