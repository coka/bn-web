package pages.components.tickets;

import java.math.BigDecimal;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

import data.holders.DataHolder;
import data.holders.DataHolderProvider;
import data.holders.ticket.order.OrderDetailsData;
import model.Event;
import model.User;
import model.Venue;
import pages.BaseComponent;
import utils.ProjectUtils;
import utils.formatter.VenueFormatter;

public class OrderDetailsComponent extends BaseComponent implements DataHolderProvider {

	@FindBy(xpath = "//p[contains(text(),'Any questions')]/following-sibling::div")
	private WebElement container;
	// relative to container
	private String relativeEventNameXpath = "./div[1]/p[1]";

	private String relativeOrderNumberXpath = "./div[1]/p[2]";

	private String relativeDateTimeXpath = "./div[2]/p[1]";

	private String relativeVenueNameXpath = "./p[1]";

	private String relativeVenueLocationXpath = "./p[2]";

	private String pruchaserParentXpath = "//p[contains(text(),'Purchaser')]/following-sibling::";

	private String firstLastNameXpath = pruchaserParentXpath + "p";
	private String emailXpath = pruchaserParentXpath + "div[1]";
	private String ticketTypeXpath = pruchaserParentXpath + "div[3]/div/div[1]/p";
	private String ticketPriceXpath = pruchaserParentXpath + "div[3]/div/div[2]/p[1]";
	private String ticketQty = pruchaserParentXpath + "div[3]/div/div[2]/p[2]";
	private String ticketTotal = pruchaserParentXpath + "div[3]/div/div[2]/p[3]";

	@FindBy(xpath = "//p[contains(text(),'Subtotal')]/following-sibling::p")
	private WebElement subtotalValue;

	@FindBy(xpath = "//p[contains(text(),'Fees Total')]/following-sibling::p")
	private WebElement totalFees;

	@FindBy(xpath = "//p[contains(text(),'Order Total')]/following-sibling::p")
	private WebElement orderTotal;

	public OrderDetailsComponent(WebDriver driver) {
		super(driver);
	}

	@Override
	public DataHolder getDataHolder() {
		OrderDetailsData data = new OrderDetailsData();
		data.setOrderNumber(getOrderNumber());
		data.setTicketType(getTicketType());
		data.setTicketPrice(getTicketPrice());
		data.setQty(getTicketQty());
		data.setTicketTotal(getTicketTotal());
		data.setSubtotal(getSubtotal());
		data.setFeesSubtotal(getTotalFees());
		data.setOrderTotal(getOrderTotal());
		data.setUser(getPurchaserUser());
		data.setVenue(getVenueInfo());
		data.setEvent(getEventInfo());
		return data;
	}

	public Event getEventInfo() {
		explicitWaitForVisiblity(container);
		WebElement eventName = getAccessUtils().getChildElementFromParentLocatedBy(container, By.xpath(relativeEventNameXpath));
		WebElement startDate = getAccessUtils().getChildElementFromParentLocatedBy(container, By.xpath(relativeDateTimeXpath));
		Event event = new Event();
		event.setEventName(eventName.getText().trim());
		event.setDate(ProjectUtils.parseDateTime(ProjectUtils.SUCCESS_PURCHASE_PAGE_DATE_FORMAT,
				startDate.getText().trim()));
		return event;
	}

	public Venue getVenueInfo() {
		 WebElement location = getAccessUtils().getChildElementFromParentLocatedBy(container, By.xpath(relativeVenueLocationXpath));
		 WebElement name= getAccessUtils().getChildElementFromParentLocatedBy(container, By.xpath(relativeVenueNameXpath));
		 Venue venue = new VenueFormatter("A").parse(location.getText().trim());
		 venue.setName(name.getText().trim());
		 return venue;
	}

	public User getPurchaserUser() {
		String fullName = getAccessUtils().getTextOfElemenyLocatedBy(By.xpath(firstLastNameXpath));
		String email = getAccessUtils().getTextOfElemenyLocatedBy(By.xpath(emailXpath));
		User user = new User(fullName);
		user.setEmailAddress(email);
		return user;
	}

	public boolean isOrderTotalSumCorrect() {
		BigDecimal total = new BigDecimal(0);
		total = total.add(getSubtotal());
		total = total.add(getTotalFees());
		BigDecimal orderTotal = getOrderTotal();
		return total.compareTo(orderTotal) == 0;
	}

	public String getOrderNumber() {
		WebElement orderNumberEl = getAccessUtils().getChildElementFromParentLocatedBy(container, By.xpath(relativeOrderNumberXpath));
		return orderNumberEl.getText();
	}

	public BigDecimal getSubtotal() {
		return getAccessUtils().getBigDecimalMoneyAmount(subtotalValue);
	}

	public BigDecimal getTotalFees() {
		return getAccessUtils().getBigDecimalMoneyAmount(totalFees);
	}

	public BigDecimal getOrderTotal() {
		return getAccessUtils().getBigDecimalMoneyAmount(orderTotal);
	}

	public BigDecimal getTicketQty() {
		return getAccessUtils().getBigDecimalMoneyAmount(ticketQty);
	}

	public BigDecimal getTicketTotal() {
		return getAccessUtils().getBigDecimalMoneyAmount(ticketTotal);
	}

	public BigDecimal getTicketPrice() {
		return getAccessUtils().getBigDecimalMoneyAmount(ticketPriceXpath);
	}

	public String getTicketType() {
		return getAccessUtils().getTextOfElemenyLocatedBy(By.xpath(ticketTypeXpath));
	}

}
