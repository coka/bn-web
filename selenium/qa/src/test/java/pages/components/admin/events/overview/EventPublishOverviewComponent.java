package pages.components.admin.events.overview;

import java.time.ZonedDateTime;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

import pages.BaseComponent;
import utils.ProjectUtils;

public class EventPublishOverviewComponent extends BaseComponent {

	@FindBy(xpath = "//p[contains(text(),'Publish Options')]/following-sibling::div/div")
	private WebElement container;

	private String relativeStatusXpath = "./div[2]/p[1]";
	private String relativeDateXpath = "./div[2]/p[2]";

	public EventPublishOverviewComponent(WebDriver driver) {
		super(driver);
	}

	public String getStatus() {
		explicitWaitForVisiblity(container);
		WebElement statusEl = getAccessUtils().getChildElementFromParentLocatedBy(container,
				By.xpath(relativeStatusXpath));
		return statusEl.getText().trim();
	}

	public ZonedDateTime getPublishedOn() {
		explicitWaitForVisiblity(container);
		WebElement zdtEl = getAccessUtils().getChildElementFromParentLocatedBy(container,
				By.xpath(relativeDateXpath));
		String text = zdtEl.getText().trim();
		ZonedDateTime zdt = ProjectUtils.parseZonedDateTime(
				ProjectUtils.EVENT_OVERVIEW_PUBLISHED_ON_DATE_TIME_FORMAT, text);
		return zdt;
	}
}