package model;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import org.testng.asserts.SoftAssert;

import com.fasterxml.jackson.annotation.JsonProperty;

import model.interfaces.IAssertable;
import model.interfaces.IAssertableField;

public class TicketType implements Serializable,IAssertable<TicketType> {
	
	private static final long serialVersionUID = 4807652309876731369L;
	@JsonProperty("ticket_type_name")
	private String ticketTypeName;
	@JsonProperty("capacity")
	private String capacity;
	@JsonProperty("price")
	private String price;
	@JsonProperty("additional_options")
	private AdditionalOptionsTicketType additionalOptions;
	
	public enum TicketTypeField implements IAssertableField{
		TICKET_TYPE_NAME,
		CAPACITY,
		PRICE,
		ADDITIONAL_OPTIONS;
	}
	
	@Override
	public void assertEquals(SoftAssert sa, Object obj, Map<Class,List<IAssertableField>> mapListFilds) {
		TicketType other = isCorrectType(obj);
		assertEquals(sa, other, mapListFilds.get(TicketType.class));
		if (this.getAdditionalOptions() != null && other.getAdditionalOptions() != null) {
			this.getAdditionalOptions().assertEquals(sa, other.getAdditionalOptions(), mapListFilds.get(AdditionalOptionsTicketType.class));
		}
	}
	
	@Override
	public void assertEquals(SoftAssert sa, Object obj, List<IAssertableField> fields) {
		TicketType other = isCorrectType(obj);
		if (fields != null) {
			for (IAssertableField fieldEnum : fields) {
				switch ((TicketTypeField) fieldEnum) {
				case TICKET_TYPE_NAME:
					assertEquals(sa, fieldEnum, this.getTicketTypeName(), other.getTicketTypeName());
					break;
				case CAPACITY:
					assertEquals(sa, fieldEnum, this.getCapacity(), other.getCapacity());
					break;
				case PRICE:
					BigDecimal thisPriceBD = new BigDecimal(this.getPrice());
					BigDecimal otherPriceBD = new BigDecimal(other.getPrice());
					assertEquals(sa, fieldEnum, thisPriceBD.doubleValue(), otherPriceBD.doubleValue());
					break;
				default:
					break;
				}
			}
		}
	}
		
	public TicketType(String ticketTypeName, String capacity, String price) {
		super();
		this.ticketTypeName = ticketTypeName;
		this.capacity = capacity;
		this.price = price;
	}
	public TicketType() {
		super();
	}
	public String getTicketTypeName() {
		return ticketTypeName;
	}
	public void setTicketTypeName(String ticketTypeName) {
		this.ticketTypeName = ticketTypeName;
	}
	public String getCapacity() {
		return capacity;
	}
	public void setCapacity(String capacity) {
		this.capacity = capacity;
	}
	public String getPrice() {
		return price;
	}
	public void setPrice(String price) {
		this.price = price;
	}
	public AdditionalOptionsTicketType getAdditionalOptions() {
		return additionalOptions;
	}
	public void setAdditionalOptions(AdditionalOptionsTicketType additionalOptions) {
		this.additionalOptions = additionalOptions;
	}
	
	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + ((ticketTypeName == null) ? 0 : ticketTypeName.hashCode());
		return result;
	}
	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		TicketType other = (TicketType) obj;
		if (ticketTypeName == null) {
			if (other.ticketTypeName != null)
				return false;
		} else if (!ticketTypeName.equals(other.ticketTypeName))
			return false;
		return true;
	}
	
}
