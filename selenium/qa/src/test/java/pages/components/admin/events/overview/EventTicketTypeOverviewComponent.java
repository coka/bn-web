package pages.components.admin.events.overview;

import org.openqa.selenium.By;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import model.AdditionalOptionsTicketType;
import model.AdditionalOptionsTicketType.SaleEnd;
import model.AdditionalOptionsTicketType.SaleStart;
import model.TicketType;
import pages.BaseComponent;
import utils.ProjectUtils;

public class EventTicketTypeOverviewComponent extends BaseComponent {

	private WebElement container;
	private String relativeTicketNameXpath = ".//div[p[contains(text(),'Ticket name')]]/following-sibling::div/p[1]";
	private String relativeQuantityXpath = ".//div[p[contains(text(),'Quantity')]]/following-sibling::div/p[2]";
	private String relativePriceXpath = ".//div[p[contains(text(),'Price')]]/following-sibling::div/p[3]";
	private String relativeSalesStartXpath = ".//div[p[contains(text(),'Sales start')]]/following-sibling::div/p[4]";
	private String relativeTypeOrSaleTimeXpath = ".//div[p[contains(text(),'start time')] or p[contains(text(),'Ticket type')]]/following-sibling::div/p[1]";

	private String relativeSalesEndXpath = ".//div[p[contains(text(),'sales end')]]/following-sibling::div";
	private String relativeEndTimeXpath = ".//div[p[contains(text(),'end time')]]/following-sibling::div";

	public EventTicketTypeOverviewComponent(WebDriver driver, WebElement container) {
		super(driver);
		this.container = container;
	}

	public TicketType getTicketTypeData() {
		TicketType type = new TicketType();
		AdditionalOptionsTicketType options = new AdditionalOptionsTicketType();
		String name = getTicketName();
		String quantity = getQuantity();
		String price = getPrice();

		setSaleStartOptions(options);
		setSaleEndOptions(options);
		type.setTicketTypeName(name);
		type.setCapacity(quantity);
		type.setPrice(price);

		type.setAdditionalOptions(options);
		return type;
	}

	private void setSaleStartOptions(AdditionalOptionsTicketType options) {
		SaleStart saleStart = getSalesStartType();
		if (saleStart.equals(SaleStart.WHEN_SALES_END_FOR)) {
			options.setStartSaleTicketType(getTicketTypeOrStartTime());
		} else if (saleStart.equals(SaleStart.AT_SPECIFIC_TIME)) {
			options.setStartSaleTime(getTicketTypeOrStartTime());
			options.setStartSaleDate(getSaleStartDate());
		}
		options.setSaleStart(saleStart);
	}

	private void setSaleEndOptions(AdditionalOptionsTicketType options) {
		SaleEnd saleEnd = getSalesEnd();
		if (SaleEnd.AT_SPECIFIC_TIME.equals(saleEnd)) {
			options.setEndSaleTime(getEndTime());
			options.setEndSaleDate(getEndDate());
		}
		options.setSaleEnd(saleEnd);
	}

	public String getTicketName() {
		WebElement el = getAccessUtils().getChildElementFromParentLocatedBy(container,
				By.xpath(relativeTicketNameXpath));
		return el.getText().trim();
	}

	public String getQuantity() {
		WebElement el = getAccessUtils().getChildElementFromParentLocatedBy(container, By.xpath(relativeQuantityXpath));
		return el.getText().trim();
	}

	public String getPrice() {
		WebElement el = getAccessUtils().getChildElementFromParentLocatedBy(container, By.xpath(relativePriceXpath));
		return ProjectUtils.getTextForElementAndReplace(el, "$", "");
	}

	public AdditionalOptionsTicketType.SaleStart getSalesStartType() {
		if (getAccessUtils().isChildElementVisibleFromParentLocatedBy(container, By.xpath(relativeSalesStartXpath))) {
			WebElement salesTypeElement = getAccessUtils().getChildElementFromParentLocatedBy(container,
					By.xpath(relativeSalesStartXpath));
			String text = salesTypeElement.getText().trim();
			if (text.equalsIgnoreCase(SaleStart.IMMEDIATELY.getLabel())) {
				return SaleStart.IMMEDIATELY;
			} else if (text.equalsIgnoreCase(SaleStart.WHEN_SALES_END_FOR.getLabel())) {
				return SaleStart.WHEN_SALES_END_FOR;
			} else {
				return SaleStart.AT_SPECIFIC_TIME;
			}
		} else {
			throw new NoSuchElementException(
					"Element Sale Start with relative xpath: " + relativeSalesStartXpath + " not found");
		}
	}

	public String getTicketTypeOrStartTime() {
		WebElement ticketTypeEl = getAccessUtils().getChildElementFromParentLocatedBy(container,
				By.xpath(relativeTypeOrSaleTimeXpath));
		String text = ticketTypeEl.getText().trim();
		return text;
	}

	public String getSaleStartDate() {
		WebElement el = getAccessUtils().getChildElementFromParentLocatedBy(container,
				By.xpath(relativeSalesStartXpath));
		return el.getText().trim();
	}

	public String getEndTime() {
		SaleEnd saleEnd = getSalesEnd();
		SaleStart saleStart = getSalesStartType();
		String relativeXpath = null;
		if (saleEnd.equals(SaleEnd.AT_SPECIFIC_TIME)) {
			if (SaleStart.IMMEDIATELY.equals(saleStart)) {
				relativeXpath = relativeEndTimeXpath + "/p[2]";
			} else {
				relativeXpath = relativeEndTimeXpath + "/p[3]";
			}
			WebElement el = getAccessUtils().getChildElementFromParentLocatedBy(container, By.xpath(relativeXpath));
			return el.getText().trim();
		} else {
			return null;
		}
	}

	public String getEndDate() {
		SaleEnd saleEnd = getSalesEnd();
		SaleStart saleStart = getSalesStartType();
		String relativeXpath = null;
		if (saleEnd.equals(SaleEnd.AT_SPECIFIC_TIME)) {
			if (SaleStart.IMMEDIATELY.equals(saleStart)) {
				relativeXpath = relativeEndTimeXpath + "/p[1]";
			} else {
				relativeXpath = relativeEndTimeXpath + "/p[2]";
			}
			WebElement el = getAccessUtils().getChildElementFromParentLocatedBy(container, By.xpath(relativeXpath));
			return el.getText().trim();
		} else {
			return null;
		}
	}

	public SaleEnd getSalesEnd() {
		WebElement element = getSalesEndElement();
		String text = element.getText().trim();
		if (SaleEnd.EVENT_END.getLabel().equalsIgnoreCase(text)) {
			return SaleEnd.EVENT_END;
		} else if (SaleEnd.EVENT_START.getLabel().equalsIgnoreCase(text)) {
			return SaleEnd.EVENT_START;
		} else if (SaleEnd.DOOR_TIME.getLabel().equalsIgnoreCase(text)) {
			return SaleEnd.DOOR_TIME;
		} else if (!text.isEmpty()) {
			return SaleEnd.AT_SPECIFIC_TIME;
		} else {
			throw new RuntimeException();
		}
	}

	public WebElement getSalesEndElement() {
		SaleStart saleStart = getSalesStartType();
		String relativeXpath = null;
		if (saleStart.equals(SaleStart.IMMEDIATELY)) {
			relativeXpath = relativeSalesEndXpath + "/p[1]";
		} else {
			relativeXpath = relativeSalesEndXpath + "/p[2]";
		}
		if (getAccessUtils().isChildElementVisibleFromParentLocatedBy(container, By.xpath(relativeXpath))) {
			WebElement element = getAccessUtils().getChildElementFromParentLocatedBy(container,
					By.xpath(relativeXpath));
			return element;
		} else {
			throw new NoSuchElementException(
					"No element for sale end found for relative xpath: " + relativeXpath + " found");
		}
	}
	}
