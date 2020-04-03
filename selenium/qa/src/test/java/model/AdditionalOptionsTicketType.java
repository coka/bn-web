package model;

import java.io.Serializable;
import java.util.Arrays;
import java.util.List;

import org.testng.asserts.SoftAssert;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

import model.interfaces.IAssertable;
import model.interfaces.IAssertableField;

public class AdditionalOptionsTicketType implements Serializable,IAssertable<AdditionalOptionsTicketType> {

	@JsonFormat(shape = JsonFormat.Shape.OBJECT)
	public enum SaleStart {
		IMMEDIATELY("Immediately","immediately"), AT_SPECIFIC_TIME("At a specific time","custom"), WHEN_SALES_END_FOR("When sales end for...","parent");

		private String label;
		private String value;

		private SaleStart(String label, String value) {
			this.label = label;
			this.value = value;
		}

		public String getLabel() {
			return label;
		}

		public String getValue() {
			return value;
		}
		
		@JsonCreator
		static SaleStart findValue(@JsonProperty("label") String label, @JsonProperty("value") String value) {
			return Arrays.stream(SaleStart.values()).filter(se -> se.label.equals(label) && se.value.equals(value)).findFirst().get();
		}

	}
	@JsonFormat(shape = JsonFormat.Shape.OBJECT)
	public enum SaleEnd {
		DOOR_TIME("Door Time","door"), EVENT_START("Event Start","start"), EVENT_END("Event End","close"),
		AT_SPECIFIC_TIME("At a specific time","custom");
		
		private String label;
		private String value;

		private SaleEnd(String label, String value) {
			this.label = label;
			this.value = value;
		}

		public String getLabel() {
			return label;
		}
		
		public String getValue() {
			return value;
		}
		
		@JsonCreator
		static SaleEnd findValue(@JsonProperty("label") String label, @JsonProperty("value") String value) {
			return Arrays.stream(SaleEnd.values()).filter(se -> se.label.equals(label) && se.value.equals(value)).findFirst().get();
		}
	}
	
	private static final long serialVersionUID = -3276023451403139476L;
	@JsonProperty("sale_start")
	private SaleStart saleStart;
	@JsonProperty("sale_end")
	private SaleEnd saleEnd;

	@JsonProperty("start_sale_date")
	private String startSaleDate;
	@JsonProperty("start_sale_time")
	private String startSaleTime;
	@JsonProperty("start_sale_ticket_type")
	private String startSaleTicketType;

	@JsonProperty("end_sale_date")
	private String endSaleDate;
	@JsonProperty("end_sale_time")
	private String endSaleTime;
	@JsonProperty("max_tickets_per_customer")
	private String maxTicketsPerCustomer;
	
	public enum AdditionalOptionsField implements IAssertableField {
		SALE_START,
		SALE_END,
		START_SALE_DATE,
		START_SALE_TIME,
		START_SALE_TICKET_TYPE,
		END_SALE_DATE,
		END_SALE_TIME,
		MAX_TICKETS_PER_CUST;
	}
	
	@Override
	public void assertEquals(SoftAssert sa, Object obj, List<IAssertableField> fields) {
		isCorrectType(obj);
		AdditionalOptionsTicketType other = (AdditionalOptionsTicketType)obj;
		for(IAssertableField field : fields) {
			switch((AdditionalOptionsField)field) {
				case SALE_START:
					assertEquals(sa, field, this.getSaleStart(), other.getSaleStart());
					break;
				case SALE_END:
					assertEquals(sa, field, this.getSaleEnd() , other.getSaleEnd());
					break;
				case START_SALE_DATE:
					assertEquals(sa, field, this.getStartSaleDate() , other.getStartSaleDate());
					break;
				case START_SALE_TIME:
					assertEquals(sa, field, this.getStartSaleTime(), other.getStartSaleTime());
					break;
				case START_SALE_TICKET_TYPE:
					assertEquals(sa, field, this.getStartSaleTicketType(), other.getStartSaleTicketType());
					break;
				case END_SALE_DATE:
					assertEquals(sa, field, this.getEndSaleDate(), other.getEndSaleDate());
					break;
				case END_SALE_TIME:
					assertEquals(sa, field, this.getEndSaleTime(), other.getEndSaleTime());
					break;
//				case MAX_TICKETS_PER_CUST:
//					assertEquals(sa, field, this.getMaxTicketsPerCustomer(), other.getMaxTicketsPerCustomer());
				default:
					break;
			}
		}
	}
	
	public SaleStart getSaleStart() {
		return saleStart;
	}

	public void setSaleStart(SaleStart saleStart) {
		this.saleStart = saleStart;
	}

	public SaleEnd getSaleEnd() {
		return saleEnd;
	}

	public void setSaleEnd(SaleEnd saleEnd) {
		this.saleEnd = saleEnd;
	}

	public String getStartSaleDate() {
		return startSaleDate;
	}

	public void setStartSaleDate(String startSaleDate) {
		this.startSaleDate = startSaleDate;
	}

	public String getStartSaleTime() {
		return startSaleTime;
	}

	public void setStartSaleTime(String startSaleTime) {
		this.startSaleTime = startSaleTime;
	}

	public String getStartSaleTicketType() {
		return startSaleTicketType;
	}

	public void setStartSaleTicketType(String startSaleTicketType) {
		this.startSaleTicketType = startSaleTicketType;
	}

	public String getEndSaleDate() {
		return endSaleDate;
	}

	public void setEndSaleDate(String endSaleDate) {
		this.endSaleDate = endSaleDate;
	}

	public String getEndSaleTime() {
		return endSaleTime;
	}

	public void setEndSaleTime(String endSaleTime) {
		this.endSaleTime = endSaleTime;
	}

	public String getMaxTicketsPerCustomer() {
		return maxTicketsPerCustomer;
	}

	public void setMaxTicketsPerCustomer(String maxTicketsPerCustomer) {
		this.maxTicketsPerCustomer = maxTicketsPerCustomer;
	}
}
