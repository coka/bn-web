package pages.tickets;

import java.math.BigDecimal;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.ui.ExpectedConditions;

import data.holders.DataHolder;
import data.holders.DataHolderProvider;
import model.Event;
import model.User;
import model.Venue;
import pages.BasePage;
import pages.components.tickets.DownloadAppComponent;
import pages.components.tickets.OrderDetailsComponent;
import utils.ProjectUtils;
import utils.formatter.VenueFormatter;

public class TicketsSuccesPage extends BasePage implements DataHolderProvider {

	@FindBy(id = "phone")
	private WebElement mobileNumberField;

	@FindBy(xpath = "//main//form//button[@type='submit']")
	private WebElement sendMeTextButton;

	@FindBy(xpath = "//p[contains(text(),'Order #')]")
	private WebElement orderNumberAndNumberOfTickets;

	@FindBy(xpath = "//p[contains(text(),'Event')]/following-sibling::p[1][span]")
	private WebElement eventInfo;

	@FindBy(xpath = "//p[contains(text(),'Location')]/following-sibling::p")
	private WebElement venueInfo;

	@FindBy(linkText = "Big Neon Customer Support")
	private WebElement bigNeonCustomerSupport;

	@FindBy(xpath = "//div[contains(@style,'background-image')]")
	private WebElement eventImage;

	private String linkToCustomerReportValue = "https://support.bigneon.com/hc/en-us/requests/new";

	private OrderDetailsComponent orderDetails;

	public TicketsSuccesPage(WebDriver driver) {
		super(driver);
	}

	@Override
	public void presetUrl() {
	}

	public boolean isAtPage() {
		return explicitWait(20, ExpectedConditions.urlContains("tickets/success"));
	}

	public OrderDetailsComponent getOrderDetails() {
		if (this.orderDetails == null) {
			this.orderDetails = new OrderDetailsComponent(driver);
		}
		return this.orderDetails;
	}

	public boolean checkValidityOfAppDownloadLinks() {
		DownloadAppComponent appComponent = new DownloadAppComponent(driver);
		return appComponent.isAppStoreButtonLinkValid() &&
				appComponent.isGooglePlayButtonLinkValid();
	}

	public boolean isCustomerSupportLinkCorrect() {
		explicitWaitForVisiblity(bigNeonCustomerSupport);
		String href = bigNeonCustomerSupport.getAttribute("href");
		return href.equals(linkToCustomerReportValue);
	}


	public boolean isTicketTotalEqualToOrderDetailsSubtotal() {
		return getOrderDetails().getSubtotal().compareTo(getOrderDetails().getTicketTotal()) == 0;
	}

	public boolean isTotalSumCalculationCorrect() {
		return getOrderDetails().isOrderTotalSumCorrect();
	}

	public boolean compareOrderNumberAndNumberOfTickets() {
		String orderNumber = getOrderNumber();
		BigDecimal numberOfTickets = getNumberOfTickets();
		String detailsOrderNumber = getOrderDetails().getOrderNumber();
		BigDecimal detailsNumberOfTickets = getOrderDetails().getTicketQty();
		return orderNumber.equals(detailsOrderNumber) &&
				numberOfTickets.compareTo(detailsNumberOfTickets) == 0;
	}

	@Override
	public DataHolder getDataHolder() {
		return getOrderDetails().getDataHolder();
	}

	public User getPurchasedUser() {
		return getOrderDetails().getPurchaserUser();
	}

	private String getOrderNumber() {
		explicitWaitForVisiblity(orderNumberAndNumberOfTickets);
		String text = orderNumberAndNumberOfTickets.getText();
		String[] arr = text.split("\\|");
		return arr[0].replace("Order #", "").trim();
	}

	private BigDecimal getNumberOfTickets() {
		explicitWaitForVisiblity(orderNumberAndNumberOfTickets);
		String text = orderNumberAndNumberOfTickets.getText();
		String[] arr = text.split("\\|");
		String numberOfTickets = arr[1].replace("Tickets", "").trim();
		return new BigDecimal(numberOfTickets);
	}

	public boolean compareOnPageVenueInfos() {
		Venue orderDetailsVenue =  getOrderDetails().getVenueInfo();
		Venue venue = getVenueInfo();
		return orderDetailsVenue.getName().equals(venue.getName())
				&& orderDetailsVenue.getAddress().equals(venue.getAddress());
	}

	public Venue getVenueInfo() {
		explicitWaitForVisiblity(venueInfo);
		String[] venueInformation = venueInfo.getText().split("\\n");
		String venueName = venueInformation[0];
		String venueLocation = venueInformation[1];
		Venue venue = new VenueFormatter("A").parse(venueLocation);
		venue.setName(venueName);
		return venue;
	}

	public boolean compareOnPageEventInformation() {
		Event orderDetails = getOrderDetails().getEventInfo();
		Event succesPage = getEventInfo();
		return orderDetails.getEventName().equals(succesPage.getEventName())
				&& orderDetails.getDate().compareTo(succesPage.getDate()) == 0;
	}

	public Event getEventInfo() {
		explicitWaitForVisiblity(eventInfo);
		String[] eventInformation = eventInfo.getText().split("\\n");
		String eventName = eventInformation[0];
		String eventDate = eventInformation[1];
		Event event = new Event();
		event.setEventName(eventName);
		event.setDate(ProjectUtils.parseDateTime(ProjectUtils.SUCCESS_PURCHASE_PAGE_DATE_FORMAT, eventDate));
		return event;
	}

	public void enterPhoneNumberAndClickSend(String phoneNumber) {
		waitVisibilityAndSendKeysSlow(mobileNumberField, phoneNumber);
		waitVisibilityAndClick(sendMeTextButton);
	}

	public String getImageUrl() {
		explicitWaitForVisiblity(eventImage);
		return ProjectUtils.getImageUrlFromStyleAttribute(eventImage);
	}

}
