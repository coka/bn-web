package test.facade.event.overview;

import enums.EventStatus;
import model.AdditionalOptionsTicketType;
import model.AdditionalOptionsTicketType.AdditionalOptionsField;
import model.Event;
import model.Event.EventField;
import model.TicketType;
import model.TicketType.TicketTypeField;
import model.Venue;
import model.Venue.VenueField;
import model.interfaces.IAssertableField;
import org.openqa.selenium.WebDriver;
import org.testng.asserts.SoftAssert;
import pages.admin.events.EventOverviewPage;
import test.facade.BaseFacadeSteps;
import utils.ProjectUtils;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class EventOverviewFacade extends BaseFacadeSteps {

	private EventOverviewPage eventOverviewPage;

	public EventOverviewFacade(WebDriver driver) {
		super(driver);
	}

	public Event whenUserRemembersEventInfoFromOverviewPage() {
		return this.eventOverviewPage.getAllEventInfo();
	}

	public void whenUserSelectsEditEvent() {
		getOverviewPage().selectOptionFromDD(EventOverviewPage.DD_MENU_EDIT_EVENT);
	}

	public void whenUserComparesInfoOnOverviewWithGivenEvent(Event data, SoftAssert sa) {
		data.setComparableDoorTime(data.calculateComparableDoorTime(ProjectUtils.TIME_FORMAT_FULL, data.getDoorTime()));
		Event preview = getOverviewPage().getAllEventInfo();
		IAssertableField[] eventFieldfields = new IAssertableField[]{
				EventField.EVENT_NAME, EventField.START_TIME, EventField.END_TIME,
				EventField.START_DATE, EventField.END_DATE, EventField.DOOR_TIME};

		IAssertableField[] ticketTypeFields = new IAssertableField[]{
				TicketTypeField.TICKET_TYPE_NAME, TicketTypeField.CAPACITY, TicketTypeField.PRICE};

		IAssertableField[] additionalOptionsFields = AdditionalOptionsField.values();

		IAssertableField[] venueTypeFields = new IAssertableField[]{
				VenueField.NAME, VenueField.ADDRESS, VenueField.CITY, VenueField.STATE_ABBR, VenueField.ZIP};

		Map<Class, List<IAssertableField>> mapListFields = new HashMap<>();
		mapListFields.put(Event.class, Arrays.asList(eventFieldfields));
		mapListFields.put(TicketType.class, Arrays.asList(ticketTypeFields));
		mapListFields.put(AdditionalOptionsTicketType.class, Arrays.asList(additionalOptionsFields));
		mapListFields.put(Venue.class, Arrays.asList(venueTypeFields));
		data.assertEquals(sa, preview, mapListFields);
	}

	public void thenEventStatusShouldBe(EventStatus status, SoftAssert sa) {
		boolean isStatus = getOverviewPage().getTopComponent().isStatusEqual(status);
		sa.assertTrue(isStatus, "Expected event status in top event overview header " + status + " was not found");
		String publishOptionsStatus = getOverviewPage().getPublishOptionsComponent().getStatus();
		sa.assertEquals(status.getValue(), publishOptionsStatus);
	}

	public void setEventOverviewPage(String eventName) {
		this.eventOverviewPage = new EventOverviewPage(driver, eventName);
		if (!eventOverviewPage.isAtPage() || !eventOverviewPage.isTitleCorrect()) {
			throw new IllegalArgumentException("event name: " + eventName + "does not correspond to url");
		}
	}

	public EventOverviewPage getOverviewPage() {
		if (this.eventOverviewPage == null) {
			throw new RuntimeException("Event page not initialized");
		}
		return this.eventOverviewPage;
	}

	public boolean thenUserIsAtOverviewPage() {
		return getOverviewPage().isAtPage() && getOverviewPage().isTitleCorrect();
	}

	@Override
	protected void setData(String key, Object value) {
	}

	@Override
	protected Object getData(String key) {
		return null;
	}

}
