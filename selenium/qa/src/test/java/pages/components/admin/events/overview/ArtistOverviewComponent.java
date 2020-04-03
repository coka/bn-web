package pages.components.admin.events.overview;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import pages.BaseComponent;

public class ArtistOverviewComponent extends BaseComponent {

	private WebElement container;

	private final String relativeHeadlinerXpath = ".//h6[contains(text(),'HEADLINER')]";
	private final String relativeArtistNameXpath = ".//p";

	public ArtistOverviewComponent(WebDriver driver, WebElement container) {
		super(driver);
		this.container = container;
	}

	public boolean isHeadliner() {
		return getAccessUtils().isChildElementVisibleFromParentLocatedBy(container, By.xpath(relativeHeadlinerXpath));
	}

	public String getArtistName() {
		By by = By.xpath(relativeArtistNameXpath);
		String text = null;
		if (getAccessUtils()
				.isChildElementVisibleFromParentLocatedBy(container, by)) {
			text = getAccessUtils().getChildElementFromParentLocatedBy(container, by).getText().trim();
		}
		return text;
	}
}
