package pages.components.admin.events;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import pages.BaseComponent;

public class ArtistEventPageComponent extends BaseComponent {
	
	private WebElement container;
	//relative to container
	
	private String relativeHeadlineActTitleXpath = ".//span[contains(text(),'Headline act')]";
	
	private String relativeHeadlineCheckboxXpath = ".//div[p[contains(text(),'Headline act')]]/div";
	
	private String relativeDeleteArtistButtonXpath = ".//div/button/span[img[@alt='Delete']]";

	public ArtistEventPageComponent(WebDriver driver, WebElement container) {
		super(driver);
		this.container = container;
	}
	
	private By relativeArtistNameXpath(String artistName) {
		return By.xpath(".//h2[contains(text(),'" + artistName + "')]");
	}
	
	public boolean isArtistName(String artistName) {
		return getAccessUtils()
				.isChildElementVisibleFromParentLocatedBy(container, relativeArtistNameXpath(artistName));
			
	}
	
	public boolean isHeadlineAct() {
		return getAccessUtils()
		.isChildElementVisibleFromParentLocatedBy(container, By.xpath(relativeHeadlineActTitleXpath));
	}
	
	public void deleteArtist() {
		WebElement deleteButton = getAccessUtils()
				.getChildElementFromParentLocatedBy(container, By.xpath(relativeDeleteArtistButtonXpath));
		waitVisibilityAndBrowserCheckClick(deleteButton);
	}
}