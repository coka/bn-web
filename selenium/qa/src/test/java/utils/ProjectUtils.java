package utils;

import java.io.File;
import java.math.BigDecimal;
import java.math.MathContext;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeFormatterBuilder;
import java.time.temporal.ChronoField;
import java.util.Arrays;
import java.util.List;
import java.util.Random;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.WebElement;

import pages.interfaces.Visible;

public class ProjectUtils {

	public static final String DATE_FORMAT = "MM/dd/yyyy";
	public static final String TIME_FORMAT = "h:mm a";
	public static final String TIME_FORMAT_FULL = "hh:mm a";
	public static final String EVENT_OVERVIEW_TIME_FORMAT = "h:mm a z";
	public static final String EVENT_OVERVIEW_PUBLISHED_ON_DATE_TIME_FORMAT = "MM/dd/yyyy h:mm a z";
	public static final String CONCATINATED_DATE_FORMAT = "MMddyyyy";
	public static final String ADMIN_EVENT_DATE_TIME_FORMAT = "EEEE, MMMM d yyyy h:mm a";
	public static final String ADMIN_EVENT_MANAGE_ORDERS_ORDER_ROW = "MM/dd/yyyy h:mm a";
	public static final String EVENT_RESULT_SUMMARY_DATE_TIME_FORMAT = "MMM d EEE, h:mm a";
	public static final String SUCCESS_PURCHASE_PAGE_DATE_FORMAT = "EEE, MMM d, yyyy h:mm a z";
	public static final String MANAGE_ORDER_HISTORY_ITEM_DATE_FORMAT = "EEE, MMM d, yyyy h:mm a";
	public static final String EVENT_OVERVIEW_DATE_FORMAT = "EEE, MMM d, yyyy";
	public static final String REPORTS_BOX_OFFICE_TITLE_DATE_FORMAT = "MMM dd, yyyy";
	public static final String REPORTS_BOX_OFFICE_OPERATOR_TABLE_DATE = "MM/dd/yyyy h:mm a, z";
	public static final String DATE_PICKER_MONTH_YEAR_FORMAT = "MMMM yyyy";
	public static final String RESOURCE_IMAGE_PATH = "src/test/resources/images/";
	public static final String CSS_REQUIRED_FIELD_COLOR = "rgba(244, 67, 54, 1)";
	public static final String CSS_REQUIRED_FIELD_COLOR_RGBA = "rgb(244, 67, 54)";

	public static Integer generateRandomInt(int size) {
		Random random = new Random();
		return random.nextInt(size);
	}

	public static String[] getDatesWithSpecifiedRangeInDays(int spanInDays) {
		return getDatesWithSpecifiedRangeInDaysWithStartOffset(1, spanInDays);
	}

	public static String[] getDatesWithSpecifiedRangeInDaysWithStartOffset(int daysOffset, int spanInDays) {
		DateRange range = getDateRangeWithSpecifiedRAngeInDaysWithStartOffset(daysOffset, spanInDays);
		DateTimeFormatter formater = DateTimeFormatter.ofPattern(DATE_FORMAT);
		String firstDate = formater.format(range.getStartDate());
		String secondDate = formater.format(range.getEndDate());
		String[] retVal = { firstDate, secondDate };
		return retVal;
	}

	public static String[] getAllDatesWithinGivenRangeAndOffset(int daysOffset, int spanInDays) {
		DateRange dateRange = getDateRangeWithSpecifiedRAngeInDaysWithStartOffset(daysOffset, spanInDays);
		DateTimeFormatter formater = DateTimeFormatter.ofPattern(DATE_FORMAT);
		List<String> dates = dateRange.toStringList(formater);
		return dates.toArray(new String[dates.size()]);
	}

	public static DateRange getDateRangeWithSpecifiedRAngeInDaysWithStartOffset(int daysOffset, int spanInDays) {
		LocalDate now = LocalDate.now();
		LocalDate newDay = now.plusDays(daysOffset);
		LocalDate nextDate = newDay.plusDays(spanInDays);
		return new DateRange(newDay, nextDate);
	}

	public static String formatDate(String pattern, LocalDate date) {
		DateTimeFormatter formatter = DateTimeFormatter.ofPattern(pattern);
		return formatter.format(date);
	}

	public static String formatTime(String pattern, LocalTime time) {
		DateTimeFormatter formatter = DateTimeFormatter.ofPattern(pattern);
		return formatter.format(time);
	}

	public static LocalDateTime parseDateTimeWithoutYear(String pattern, String dateTimeWithOutYear) {
		return parseDateTimeWithoutYear(pattern, dateTimeWithOutYear, LocalDate.now().getYear());
	}

	public static LocalDateTime parseDateTimeWithoutYear(String pattern, String dateTimeWithOutYear, Integer year) {
		DateTimeFormatter formatter = new DateTimeFormatterBuilder().appendPattern(pattern)
				.parseDefaulting(ChronoField.YEAR, year).toFormatter();
		LocalDateTime time = LocalDateTime.parse(dateTimeWithOutYear, formatter);
		return time;
	}

	public static LocalDateTime parseDateTime(String pattern, String dateTime) {
		if (dateTime == null || dateTime.isEmpty()) {
			return null;
		}
		String removedOrdinalsDate = dateTime.replaceAll("(?<=\\d)(st|nd|rd|th)", "");
		DateTimeFormatter formater = DateTimeFormatter.ofPattern(pattern);
		LocalDateTime localDateTime = LocalDateTime.parse(removedOrdinalsDate, formater);
		return localDateTime;
	}

	public static ZonedDateTime parseZonedDateTime(String pattern, String dateTime) {
		if (dateTime == null || dateTime.isEmpty()) {
			return null;
		}
		String removedOrdinalsDate = dateTime.replaceAll("(?<=\\d)(st|nd|rd|th)", "");
		DateTimeFormatter formater = DateTimeFormatter.ofPattern(pattern);
		ZonedDateTime localDateTime = ZonedDateTime.parse(removedOrdinalsDate, formater);
		return localDateTime;

	}

	public static <T extends Comparable<? super T>> boolean isListOrdered(List<T> list) {
		T previous = list.get(0);
		for(T current : list) {
			if(current.compareTo(previous) < 0) {
				return false;
			}
			previous = current;
		}
		return true;
	}

	public static LocalDateTime getLocalDateTime(String datePattern, String date, String timePattern, String time) {
		LocalDate localDate = ProjectUtils.parseDate(datePattern, date);
		LocalTime localTime = ProjectUtils.parseTime(timePattern, time);
		LocalDateTime ldt = LocalDateTime.of(localDate, localTime);
		return ldt;
	}

	/**
	 * Parses date using provided pattern, also it removes ordinals like in 1st,
	 * 2nd,.. 10th...
	 *
	 * @param pattern
	 * @param date
	 * @return
	 */
	public static LocalDate parseDate(String pattern, String date) {
		String removedOrdinalsDate = date.replaceAll("(?<=\\d)(st|nd|rd|th)", "");
		DateTimeFormatter formater = DateTimeFormatter.ofPattern(pattern);
		LocalDate localDate = LocalDate.parse(removedOrdinalsDate, formater);
		return localDate;
	}

	public static LocalDate parseDate(String pattern, String date, List<ChronoField> chronoFieldsToIgnore) {
		DateTimeFormatterBuilder builder = new DateTimeFormatterBuilder().appendPattern(pattern);
		if (chronoFieldsToIgnore != null) {
			for (ChronoField field : chronoFieldsToIgnore)
				builder.parseDefaulting(field, 1);
		}
		DateTimeFormatter formater = builder.toFormatter();
		return LocalDate.parse(date, formater);

	}

	public static LocalTime parseTime(String pattern, String time) {
		DateTimeFormatter formater = DateTimeFormatter.ofPattern(pattern);
		LocalTime localTime = LocalTime.parse(time, formater);
		return localTime;
	}

	public static LocalDateTime getDateTime(LocalDate date) {
		LocalDateTime dt = date.atTime(LocalTime.MIDNIGHT);
		return dt;
	}

	public static void appendField(String field, StringBuilder sb) {
		sb.append(field != null ? field + "; " : "");
	}

	public static void appendFields(String[] fields, StringBuilder sb) {
		for (String f : fields) {
			appendField(f, sb);
		}
	}

	public static boolean isNumberGreaterThan(Integer number, Integer greaterThan) {
		if (number != null && greaterThan != null) {
			if (number.compareTo(greaterThan) > 0) {
				return true;
			}
		}
		return false;
	}

	public static Object[] createAndFillArrayWithObject(int size, Object original) {
		Object[] dest = new Object[size];
		Arrays.fill(dest, original);
		return dest;
	}

	public static Object[][] composeData(Object[][] dest, Object[] src, int destinationColumn) {
		for (int i = 0; i < src.length; i++) {
			dest[i][destinationColumn] = src[i];
		}
		return dest;
	}

	public static Double getMoneyAmount(String textSeq) {
		textSeq = textSeq.trim();
		String replaced = textSeq.replace("$", "");
		return Double.parseDouble(replaced.trim());
	}

	public static BigDecimal getBigDecimalMoneyAmount(String textSeq) {
		textSeq = textSeq.trim();
		String replaced = textSeq.replace("$", "");
		return new BigDecimal(replaced.trim());
	}

	public static String getTextForElementAndReplace(WebElement element, String oldChar, String newChar) {
		String text = element.getText().trim();
		return text.replace(oldChar, newChar).trim();

	}

	public static String getImageAbsolutePath(String imageName) {
		File file = new File(RESOURCE_IMAGE_PATH + imageName);
		if (file.exists()) {
			return file.getAbsolutePath();
		} else {
			return null;
		}
	}

	/**
	 * It follows convention that suffix is last "_" found, that is discarder and
	 * replaced with current date sequence. If no "_" is found date is appended to
	 * given text parametar with "_" between date and text
	 *
	 * @param text
	 * @return
	 */
	public static String setSuffixDateOfText(String text) {
		int index = text.lastIndexOf("_");
		String baseName = text;
		if (index != -1) {
			baseName = text.substring(0, index);
		}
		LocalDate now = LocalDate.now();
		DateTimeFormatter formater = DateTimeFormatter.ofPattern(CONCATINATED_DATE_FORMAT);
		String date = now.format(formater);

		return baseName + "_" + date;
	}

	public static String getId(String urlPath, String match) {
		int index = urlPath.indexOf(match);
		String id = urlPath.substring(index + match.length());
		return id;
	}

	public static BigDecimal roundUp(BigDecimal initailValue, int precision) {
		MathContext mathContext = new MathContext(precision);
		BigDecimal returnValue = initailValue.round(mathContext);
		return returnValue;
	}

	public static Visible getVisibleComponent(Visible visible) {
		if (visible.isVisible()) {
			return visible;
		} else {
			throw new NoSuchElementException("Element for component:" + visible.getClass() + "not found");
		}
	}

	/**
	 * returns true if value is not null and not empty
	 *
	 * @param value
	 * @return
	 */
	public static boolean isStringValid(String value) {
		return value != null && !value.isEmpty();
	}

	public static String getImageUrlFromStyleAttribute(WebElement element) {
		String text = element.getAttribute("style");
		Pattern pattern = Pattern.compile("url\\(*.*\\)");
		Matcher matcher = pattern.matcher(text);
		String retVal = "";
		if(matcher.find()) {
			retVal = matcher.group();
			retVal = retVal.replace("url(\"", "");
			retVal = retVal.replace("\")","");
		}

		return retVal;
	}

	public static boolean isMatch(String pattern, String text) {
		Pattern p = Pattern.compile(pattern);
		Matcher matcher = p.matcher(text);
		return matcher.find();
	}
}
