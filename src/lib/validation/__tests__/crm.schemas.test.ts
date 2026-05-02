import { describe, it, expect } from "vitest";
import {
  CreateLeadSchema,
  UpdateLeadSchema,
  QualifyLeadSchema,
} from "../crm/lead.schemas";
import {
  UpdateAccountOwnerSchema,
} from "../crm/account.schemas";
import {
  CreateContactSchema,
  UpdateContactSchema,
} from "../crm/contact.schemas";
import {
  CreateActivitySchema,
  CompleteActivitySchema,
} from "../crm/activity.schemas";
import {
  CreateOpportunitySchema,
  UpdateOpportunityForecastSchema,
  MoveOpportunityStageSchema,
  MarkOpportunityLostSchema,
  MarkOpportunityWonSchema,
  OpportunityLineSchema,
} from "../crm/opportunity.schemas";

describe("CRM Validation Schemas", () => {
  describe("Lead Schemas", () => {
    describe("CreateLeadSchema", () => {
      it("validates correct lead data", () => {
        const data = {
          title: "New Lead",
          ownerUsername: "john.doe",
          source: "Website",
          contactName: "Jane Doe",
          contactEmail: "jane@example.com",
          contactPhone: "+1234567890",
        };
        expect(CreateLeadSchema.parse(data)).toEqual(data);
      });

      it("accepts optional fields as undefined", () => {
        const data = {
          title: "New Lead",
          ownerUsername: "john.doe",
        };
        expect(CreateLeadSchema.parse(data)).toEqual(data);
      });

      it("rejects missing required title", () => {
        const data = { ownerUsername: "john.doe" };
        expect(() => CreateLeadSchema.parse(data)).toThrow();
      });

      it("rejects missing required ownerUsername", () => {
        const data = { title: "New Lead" };
        expect(() => CreateLeadSchema.parse(data)).toThrow();
      });

      it("rejects title exceeding max length", () => {
        const data = {
          title: "a".repeat(256),
          ownerUsername: "john.doe",
        };
        expect(() => CreateLeadSchema.parse(data)).toThrow();
      });

      it("rejects invalid email format", () => {
        const data = {
          title: "New Lead",
          ownerUsername: "john.doe",
          contactEmail: "invalid-email",
        };
        expect(() => CreateLeadSchema.parse(data)).toThrow();
      });
    });

    describe("UpdateLeadSchema", () => {
      it("validates correct update data", () => {
        const data = {
          title: "Updated Lead",
          source: "Referral",
          contactName: "Jane Doe",
        };
        expect(UpdateLeadSchema.parse(data)).toEqual(data);
      });

      it("rejects missing required title", () => {
        const data = { source: "Website" };
        expect(() => UpdateLeadSchema.parse(data)).toThrow();
      });
    });

    describe("QualifyLeadSchema", () => {
      it("validates correct qualify data", () => {
        const data = { customerId: "cust-123" };
        expect(QualifyLeadSchema.parse(data)).toEqual(data);
      });

      it("rejects missing customerId", () => {
        expect(() => QualifyLeadSchema.parse({})).toThrow();
      });

      it("rejects empty customerId", () => {
        const data = { customerId: "" };
        expect(() => QualifyLeadSchema.parse(data)).toThrow();
      });
    });
  });

  describe("Account Schemas", () => {
    describe("UpdateAccountOwnerSchema", () => {
      it("validates correct owner update", () => {
        const data = { ownerUsername: "jane.smith" };
        expect(UpdateAccountOwnerSchema.parse(data)).toEqual(data);
      });

      it("rejects missing required ownerUsername", () => {
        expect(() => UpdateAccountOwnerSchema.parse({})).toThrow();
      });

      it("rejects empty ownerUsername", () => {
        const data = { ownerUsername: "" };
        expect(() => UpdateAccountOwnerSchema.parse(data)).toThrow();
      });

      it("rejects ownerUsername exceeding max length", () => {
        const data = { ownerUsername: "a".repeat(129) };
        expect(() => UpdateAccountOwnerSchema.parse(data)).toThrow();
      });
    });
  });

  describe("Contact Schemas", () => {
    describe("CreateContactSchema", () => {
      it("validates correct contact data", () => {
        const data = {
          accountId: "acc-123",
          fullName: "John Doe",
          email: "john@example.com",
          phone: "+1234567890",
          title: "CEO",
          isPrimary: true,
        };
        expect(CreateContactSchema.parse(data)).toEqual(data);
      });

      it("accepts optional isPrimary as undefined", () => {
        const data = {
          accountId: "acc-123",
          fullName: "John Doe",
        };
        expect(CreateContactSchema.parse(data)).toEqual(data);
      });

      it("rejects missing required accountId", () => {
        const data = { fullName: "John Doe" };
        expect(() => CreateContactSchema.parse(data)).toThrow();
      });

      it("rejects missing required fullName", () => {
        const data = { accountId: "acc-123" };
        expect(() => CreateContactSchema.parse(data)).toThrow();
      });

      it("rejects invalid email format", () => {
        const data = {
          accountId: "acc-123",
          fullName: "John Doe",
          email: "invalid-email",
        };
        expect(() => CreateContactSchema.parse(data)).toThrow();
      });

      it("rejects fullName exceeding max length", () => {
        const data = {
          accountId: "acc-123",
          fullName: "a".repeat(201),
        };
        expect(() => CreateContactSchema.parse(data)).toThrow();
      });

      it("rejects title exceeding max length", () => {
        const data = {
          accountId: "acc-123",
          fullName: "John Doe",
          title: "a".repeat(129),
        };
        expect(() => CreateContactSchema.parse(data)).toThrow();
      });
    });

    describe("UpdateContactSchema", () => {
      it("validates correct update data", () => {
        const data = {
          fullName: "John Smith",
          email: "new@example.com",
        };
        expect(UpdateContactSchema.parse(data)).toEqual(data);
      });

      it("rejects missing required fullName", () => {
        const data = { email: "new@example.com" };
        expect(() => UpdateContactSchema.parse(data)).toThrow();
      });
    });
  });

  describe("Activity Schemas", () => {
    describe("CreateActivitySchema", () => {
      it("validates correct activity data", () => {
        const data = {
          subject: "Meeting",
          type: "Call",
          dueAt: "2026-06-01",
          assignedToUsername: "john.doe",
        };
        expect(CreateActivitySchema.parse(data)).toEqual(data);
      });

      it("accepts optional fields as undefined", () => {
        const data = {
          subject: "Meeting",
          type: "Call",
          dueAt: "2026-06-01",
          assignedToUsername: "john.doe",
        };
        expect(CreateActivitySchema.parse(data)).toEqual(data);
      });

      it("rejects missing required subject", () => {
        const data = { type: "Call", dueAt: "2026-06-01", assignedToUsername: "john.doe" };
        expect(() => CreateActivitySchema.parse(data)).toThrow();
      });

      it("rejects missing required type", () => {
        const data = { subject: "Meeting", dueAt: "2026-06-01", assignedToUsername: "john.doe" };
        expect(() => CreateActivitySchema.parse(data)).toThrow();
      });

      it("rejects subject exceeding max length", () => {
        const data = {
          subject: "a".repeat(256),
          type: "Call",
          dueAt: "2026-06-01",
          assignedToUsername: "john.doe",
        };
        expect(() => CreateActivitySchema.parse(data)).toThrow();
      });

      it("accepts optional leadId", () => {
        const data = {
          subject: "Meeting",
          type: "Call",
          dueAt: "2026-06-01",
          assignedToUsername: "john.doe",
          leadId: "lead-123",
        };
        expect(CreateActivitySchema.parse(data)).toEqual(data);
      });

      it("accepts optional customerId", () => {
        const data = {
          subject: "Meeting",
          type: "Call",
          dueAt: "2026-06-01",
          assignedToUsername: "john.doe",
          customerId: "cust-123",
        };
        expect(CreateActivitySchema.parse(data)).toEqual(data);
      });
    });

    describe("CompleteActivitySchema", () => {
      it("validates correct complete data", () => {
        const data = { note: "Meeting notes" };
        expect(CompleteActivitySchema.parse(data)).toEqual(data);
      });

      it("accepts empty object", () => {
        expect(CompleteActivitySchema.parse({})).toEqual({});
      });

      it("rejects note exceeding max length", () => {
        const data = { note: "a".repeat(1001) };
        expect(() => CompleteActivitySchema.parse(data)).toThrow();
      });
    });
  });

  describe("Opportunity Schemas", () => {
    describe("CreateOpportunitySchema", () => {
      it("validates correct opportunity data", () => {
        const data = {
          name: "New Deal",
          ownerUsername: "john.doe",
          customerId: "cust-123",
        };
        expect(CreateOpportunitySchema.parse(data)).toEqual(data);
      });

      it("accepts optional leadId", () => {
        const data = {
          name: "New Deal",
          ownerUsername: "john.doe",
          customerId: "cust-123",
          leadId: "lead-123",
        };
        expect(CreateOpportunitySchema.parse(data)).toEqual(data);
      });

      it("rejects missing required name", () => {
        const data = { ownerUsername: "john.doe", customerId: "cust-123" };
        expect(() => CreateOpportunitySchema.parse(data)).toThrow();
      });

      it("rejects missing required ownerUsername", () => {
        const data = { name: "New Deal", customerId: "cust-123" };
        expect(() => CreateOpportunitySchema.parse(data)).toThrow();
      });

      it("rejects missing required customerId", () => {
        const data = { name: "New Deal", ownerUsername: "john.doe" };
        expect(() => CreateOpportunitySchema.parse(data)).toThrow();
      });

      it("rejects name exceeding max length", () => {
        const data = {
          name: "a".repeat(256),
          ownerUsername: "john.doe",
          customerId: "cust-123",
        };
        expect(() => CreateOpportunitySchema.parse(data)).toThrow();
      });
    });

    describe("UpdateOpportunityForecastSchema", () => {
      it("validates correct forecast update", () => {
        const data = {
          probability: 0.75,
          expectedAmount: 50000,
          expectedCloseDate: "2026-12-31",
        };
        expect(UpdateOpportunityForecastSchema.parse(data)).toEqual(data);
      });

      it("rejects missing required probability", () => {
        const data = { expectedAmount: 50000 };
        expect(() => UpdateOpportunityForecastSchema.parse(data)).toThrow();
      });

      it("rejects probability below 0", () => {
        const data = { probability: -0.1 };
        expect(() => UpdateOpportunityForecastSchema.parse(data)).toThrow();
      });

      it("rejects probability above 1", () => {
        const data = { probability: 1.5 };
        expect(() => UpdateOpportunityForecastSchema.parse(data)).toThrow();
      });

      it("accepts empty string as undefined for expectedAmount", () => {
        const data = { probability: 0.5, expectedAmount: "" };
        const result = UpdateOpportunityForecastSchema.parse(data);
        expect(result.expectedAmount).toBeUndefined();
      });

      it("rejects negative expectedAmount", () => {
        const data = { probability: 0.5, expectedAmount: -1000 };
        expect(() => UpdateOpportunityForecastSchema.parse(data)).toThrow();
      });

      it("rejects expectedCloseDate exceeding max length", () => {
        const data = { probability: 0.5, expectedCloseDate: "a".repeat(11) };
        expect(() => UpdateOpportunityForecastSchema.parse(data)).toThrow();
      });
    });

    describe("MoveOpportunityStageSchema", () => {
      it("validates correct stage move", () => {
        const data = { stage: "Proposal" };
        expect(MoveOpportunityStageSchema.parse(data)).toEqual(data);
      });

      it("rejects missing required stage", () => {
        expect(() => MoveOpportunityStageSchema.parse({})).toThrow();
      });

      it("rejects stage exceeding max length", () => {
        const data = { stage: "a".repeat(65) };
        expect(() => MoveOpportunityStageSchema.parse(data)).toThrow();
      });
    });

    describe("MarkOpportunityLostSchema", () => {
      it("validates correct lost reason", () => {
        const data = { reason: "Customer chose competitor" };
        expect(MarkOpportunityLostSchema.parse(data)).toEqual(data);
      });

      it("rejects missing required reason", () => {
        expect(() => MarkOpportunityLostSchema.parse({})).toThrow();
      });

      it("rejects reason exceeding max length", () => {
        const data = { reason: "a".repeat(501) };
        expect(() => MarkOpportunityLostSchema.parse(data)).toThrow();
      });
    });

    describe("MarkOpportunityWonSchema", () => {
      it("validates correct won data", () => {
        const data = { note: "Deal closed successfully", convertToQuote: true };
        expect(MarkOpportunityWonSchema.parse(data)).toEqual(data);
      });

      it("rejects missing required convertToQuote", () => {
        const data = { note: "Deal closed successfully" };
        expect(() => MarkOpportunityWonSchema.parse(data)).toThrow();
      });

      it("rejects convertToQuote not being boolean", () => {
        const data = { convertToQuote: "true" };
        expect(() => MarkOpportunityWonSchema.parse(data)).toThrow();
      });

      it("rejects note exceeding max length", () => {
        const data = { note: "a".repeat(501), convertToQuote: true };
        expect(() => MarkOpportunityWonSchema.parse(data)).toThrow();
      });
    });

    describe("OpportunityLineSchema", () => {
      it("validates correct line item", () => {
        const data = {
          description: "Service agreement",
          quantity: 10,
          unitPrice: 100,
          discountPercent: 0.1,
        };
        const result = OpportunityLineSchema.parse(data);
        expect(result.description).toBe(data.description);
        expect(result.quantity).toBe(data.quantity);
        expect(result.unitPrice).toBe(data.unitPrice);
        expect(result.discountPercent).toBe(data.discountPercent);
      });

      it("rejects missing required description", () => {
        const data = { quantity: 10, unitPrice: 100 };
        expect(() => OpportunityLineSchema.parse(data)).toThrow();
      });

      it("rejects quantity of 0", () => {
        const data = { description: "Test", quantity: 0, unitPrice: 100 };
        expect(() => OpportunityLineSchema.parse(data)).toThrow();
      });

      it("rejects negative unitPrice", () => {
        const data = { description: "Test", quantity: 1, unitPrice: -100 };
        expect(() => OpportunityLineSchema.parse(data)).toThrow();
      });

      it("rejects discountPercent above 1", () => {
        const data = { description: "Test", quantity: 1, unitPrice: 100, discountPercent: 1.5 };
        expect(() => OpportunityLineSchema.parse(data)).toThrow();
      });

      it("rejects description exceeding max length", () => {
        const data = { description: "a".repeat(501), quantity: 1, unitPrice: 100 };
        expect(() => OpportunityLineSchema.parse(data)).toThrow();
      });

      it("accepts optional productId", () => {
        const data = { description: "Test", quantity: 1, unitPrice: 100, productId: "prod-123" };
        const result = OpportunityLineSchema.parse(data);
        expect(result.productId).toBe("prod-123");
      });
    });
  });
});