package pages.components.admin.orders.manage;

import java.math.BigDecimal;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import model.User;
import model.Venue;
import pages.BaseComponent;
import pages.components.dialogs.IssueRefundDialog.RefundReason;
import utils.SeleniumUtils;
import utils.formatter.VenueFormatter;

public class ActivityItem extends BaseComponent {

	private WebElement container;

	// relative to container
	private String relativeShowDetailsButtonsXpath = ".//div[p[span[contains(text(),'Show Details')]]]";

	// relative to container
	private String relativeRowContentXpath = ".//div[1]/span[3]";

	private String relativeUserNameXpath = relativeRowContentXpath + "/p/span[1]";

	private String relativeStatusXpath = relativeRowContentXpath + "/p/span[2]";

	private String relativeRefundedRefundeeXpath = relativeRowContentXpath + "/p/span[4]";

	private String relativeQuantityAndEventNameContentXpath = relativeRowContentXpath + "/p/span[3]";

	private String relativeEventNameXpath = relativeRowContentXpath + "/p/span[3]/span";

	private String relativeOrderNumberLinkXpath = relativeRowContentXpath + "//a[span[contains(text(),'Order')]]";
	// relative to container
	private String relativeExpandedContentXpath = ".//div[2][contains(@style,'height: auto')]";

	public ActivityItem(WebDriver driver, WebElement container) {
		super(driver);
		this.container = container;
	}

	public boolean isUserNameEqualTo(String userName) {
		String elementUserName = getUserName();
		boolean retVal = elementUserName.equals(userName);
		return retVal;
	}

	public boolean isRefundedItemRowInfoValid(User refunder, User refundee) {
		String elRefunderName = getUserName();
		String elRefundeeName = getRefundeeName();
		return refunder.getFullNameFL().equals(elRefunderName) && refundee.getFullNameFL().equals(elRefundeeName);
	}

	public boolean isPurchasedItemRowInfoValid(String fullUserName, String eventName, Integer numberOfTickets) {
		String elementUserName = getUserName();
		Integer elementNoTickets = getNumberOfPurchases();
		String elementEventName = getEventName();
		return fullUserName.equals(elementUserName) && elementNoTickets.equals(numberOfTickets)
				&& elementEventName.equals(eventName);
	}

	public String getUserName() {
		WebElement element = SeleniumUtils.getChildElementFromParentLocatedBy(container,
				By.xpath(relativeUserNameXpath), driver);
		String userName = element.getText();
		return userName.trim();
	}

	public String getRefundeeName() {
		WebElement element = SeleniumUtils.getChildElementFromParentLocatedBy(container,
				By.xpath(relativeRefundedRefundeeXpath), driver);
		String text = element.getText();
		String[] tokens = text.split(" ");
		return tokens[1] + " " + tokens[2];
	}

	public void clickOnShowDetailsLink() {
		WebElement showDetailsButton = SeleniumUtils.getChildElementFromParentLocatedBy(container,
				By.xpath(relativeShowDetailsButtonsXpath), driver);
		waitVisibilityAndBrowserCheckClick(showDetailsButton);
		waitForTime(1500);
	}

	public String getEventName() {
		WebElement eventNameElement = SeleniumUtils.getChildElementFromParentLocatedBy(container,
				By.xpath(relativeEventNameXpath), driver);
		String text = eventNameElement != null ? eventNameElement.getText() : null;
		return text.trim();
	}

	public Integer getNumberOfPurchases() {
		WebElement el = SeleniumUtils.getChildElementFromParentLocatedBy(container,
				By.xpath(relativeQuantityAndEventNameContentXpath), driver);
		String text = el.getText();
		String[] arr = text.split(" ");
		Integer numberOfPuchases = Integer.parseInt(arr[0]);
		return numberOfPuchases;
	}

	public void clickOnOrderNumberLink() {
		WebElement element = getOrderNumberLinkElement();
		waitVisibilityAndBrowserCheckClick(element);
	}

	public String getOrderId() {
		WebElement element = getOrderNumberLinkElement();
		String href = element.getAttribute("href");
		String searchForExpression = "/manage/";
		int indexOfExpression = href.indexOf(searchForExpression);
		String id = href.substring(indexOfExpression + searchForExpression.length());
		return id;
	}

	private WebElement getOrderNumberLinkElement() {
		return getAccessUtils().getChildElementFromParentLocatedBy(container, By.xpath(relativeOrderNumberLinkXpath));
	}

	public ExpandedContent getExpandedContent() {
		WebElement expandedContentContainer = getExpandedElement();
		ExpandedContent content = new ExpandedContent(driver, expandedContentContainer);
		return content;
	}
	public RefundedExpandedContent getRefundedExpandedContent() {
		WebElement expandedContentContainer = getExpandedElement();
		RefundedExpandedContent content = new RefundedExpandedContent(driver, expandedContentContainer);
		return content;
	}
	public NoteExpandedContent getNoteExpandedContent() {
		WebElement noteContent = getExpandedElement();
		NoteExpandedContent content = new NoteExpandedContent(driver, noteContent);
		return content;
	}

	private WebElement getExpandedElement() {
		WebElement expandedContentContainer = SeleniumUtils.getChildElementFromParentLocatedBy(container,
				By.xpath(relativeExpandedContentXpath), driver);
		return expandedContentContainer;
	}

	public boolean isPruchased() {
		String text = getStatusElement().getText();
		if (text.contains("purchased")) {
			return true;
		} else {
			return false;
		}
	}

	public boolean isRefunded() {
		String text = getStatusElement().getText();
		if (text.contains("refunded")) {
			return true;
		} else {
			return false;
		}
	}
	public boolean isNoteItem() {
		String text = getStatusElement().getText();
		if (text.contains("added a note")) {
			return true;
		} else {
			return false;
		}
	}

	private WebElement getStatusElement() {
		WebElement element = SeleniumUtils.getChildElementFromParentLocatedBy(container, By.xpath(relativeStatusXpath),
				driver);
		return element;
	}

	public String getContent() {
		WebElement element = SeleniumUtils.getChildElementFromParentLocatedBy(container,
				By.xpath(relativeRowContentXpath), driver);
		String content = element.getText();
		return content;
	}

	public class NoteExpandedContent extends BaseComponent {

		private WebElement container;

		private String relativeNoteTextXpath = ".//div/p[contains(text(),'Note:')]/following-sibling::p/span";

		public NoteExpandedContent(WebDriver driver, WebElement container) {
			super(driver);
			this.container = container;
		}

		public String getNoteText() {
			return getNoteElement().getText();
		}

		private WebElement getNoteElement() {
			return SeleniumUtils.getChildElementFromParentLocatedBy(container, By.xpath(relativeNoteTextXpath), driver);
		}

	}

	public class RefundedExpandedContent extends BaseComponent {

		private WebElement container;

		private String relativeTicketsMoneyAmount = "./div/div/div/div[2]/div/p[contains(text(),'Tickets')]/span[1]";

		private String relativePerTicketFeeXpath = "./div/div/div/div[2]/div/p[contains(text(),'Tickets')]/span[2]";

		private String relativeRefundedReasonXpath = ".//div[p[contains(text(),'Reason')]]/following-sibling::div/p";

		public RefundedExpandedContent(WebDriver driver, WebElement container) {
			super(driver);
			this.container = container;
		}

		public boolean isDataVisible() {
			BigDecimal totalRefundMoney = getTotalRefundMoneyAmount();
			BigDecimal perTicketFee = getPerTicketFee();
			RefundReason refundReason = getRefundReason();
			return totalRefundMoney != null && perTicketFee != null && refundReason != null;
		}

		public BigDecimal getTotalRefundMoneyAmount() {
			Double amount = SeleniumUtils.getDoubleAmount(container, relativeTicketsMoneyAmount, driver);
			return new BigDecimal(amount);
		}

		public BigDecimal getPerTicketFee() {
			WebElement el = getPerTicketFeeElement();
			String text = el.getText().trim();
			String[] tokens = text.split("-");
			String amount = tokens[1].trim();
			amount = amount.replace("$", "");
			return new BigDecimal(amount);
		}

		public RefundReason getRefundReason() {
			WebElement element = getRefundReasonElement();
			String text = element.getText();
			return RefundReason.getRefundReason(text);
		}

		private WebElement getPerTicketFeeElement() {
			return SeleniumUtils.getChildElementFromParentLocatedBy(container, By.xpath(relativePerTicketFeeXpath),
					driver);
		}

		private WebElement getRefundReasonElement() {
			return getAccessUtils().getChildElementFromParentLocatedBy(container,
					By.xpath(relativeRefundedReasonXpath));
		}
	}

	public class ExpandedContent extends BaseComponent {

		private WebElement container;

		private String relativeVenueLocationXpath = "./div/div/div/div/following-sibling::p/span[1]";

		private String relativeEventTimeAndDateXpath = "./div/div/div/div/following-sibling::p/span[2]";

		private String relativeCodeXpath = "./div/div/div/div[2]/span[2]";

		private String relativeQuantityXpath = "./div/div/div/div[2]/span[3]";

		private String relativeTotalMoneyAmountXpath = "./div/div/div/div[2]/span[4]";

		public ExpandedContent(WebDriver driver, WebElement container) {
			super(driver);
			this.container = container;
		}

		public boolean isDataVisible() {
			String venue = getVenueLocation();
			String dateTime = getEventDateAndTime();
			Integer qty = getQuantity();
			BigDecimal totalMoney = getTotalMoneyAmount();
			boolean isVenueVisible = venue == null ? false : !venue.isEmpty();
			boolean isDateTimeVisible = dateTime == null ? false : !dateTime.isEmpty();
			boolean isQtyVisible = qty == null ? false : true;
			boolean isTotalMoneyVisible = totalMoney == null ? false : true;
			return isVenueVisible && isDateTimeVisible && isQtyVisible && isTotalMoneyVisible;
		}

		public Venue getVenue() {
			return new VenueFormatter("A").parse(getVenueLocation().trim());
		}

		public String getVenueLocation() {
			return getVenueLocationElement().getText();
		}

		private WebElement getVenueLocationElement() {
			WebElement element = SeleniumUtils.getChildElementFromParentLocatedBy(container,
					By.xpath(relativeVenueLocationXpath), driver);
			return element;
		}

		public String getEventDateAndTime() {
			return getEventTimeAndDateXpath().getText();
		}

		private WebElement getEventTimeAndDateXpath() {
			WebElement element = SeleniumUtils.getChildElementFromParentLocatedBy(container,
					By.xpath(relativeEventTimeAndDateXpath), driver);
			return element;
		}

		public String getCode() {
			String text = getCodeElement().getText();
			if (text.trim().equals("-")) {
				return "";
			} else {
				return text.trim();
			}
		}

		private WebElement getCodeElement() {
			WebElement element = SeleniumUtils.getChildElementFromParentLocatedBy(container,
					By.xpath(relativeCodeXpath), driver);
			return element;
		}

		public Integer getQuantity() {
			String text = getQuantityElement().getText();
			if (text != null && !text.isEmpty()) {
				Integer retVal = Integer.parseInt(text.trim());
				return retVal;
			} else {
				return null;
			}
		}

		private WebElement getQuantityElement() {
			WebElement element = SeleniumUtils.getChildElementFromParentLocatedBy(container,
					By.xpath(relativeQuantityXpath), driver);
			return element;
		}

		public BigDecimal getTotalMoneyAmount() {
			BigDecimal retVal = getAccessUtils().getBigDecimalMoneyAmount(getTotalMoneyAmountElement(), "$", "");
			return retVal;
		}

		private WebElement getTotalMoneyAmountElement() {
			WebElement element = SeleniumUtils.getChildElementFromParentLocatedBy(container,
					By.xpath(relativeTotalMoneyAmountXpath), driver);
			return element;
		}
	}
}