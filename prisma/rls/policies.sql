-- Browser and PostgREST requests run as `authenticated` and are filtered here.
-- The Next.js server uses a bypass-capable database role: it MUST enforce
-- authorization in code and scope every query by organization. RLS is the
-- second wall, not a substitute for server-side authorization.

CREATE SCHEMA IF NOT EXISTS app;

CREATE OR REPLACE FUNCTION app.is_org_member(org uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM "OrganizationMember"
    WHERE "userId" = auth.uid()
      AND "organizationId" = org
  );
$$;

CREATE OR REPLACE FUNCTION app.is_staff()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM "StaffMember"
    WHERE "userId" = auth.uid()
  );
$$;

REVOKE ALL ON FUNCTION app.is_org_member(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION app.is_staff() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION app.is_org_member(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION app.is_staff() TO authenticated;

ALTER TABLE "Organization" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrganizationMember" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StaffMember" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Address" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Lead" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Quote" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "QuoteVersion" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "QuoteLine" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "QuoteApproval" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrderLine" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrderStatusEvent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ArtworkAsset" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "FileScanResult" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PaymentAttempt" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Payment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "GatewayEvent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Invoice" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TaxSnapshot" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditEvent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OutboxEvent" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT INSERT, UPDATE ON "Lead", "Quote", "QuoteVersion", "QuoteLine", "Order", "OrderLine", "Invoice", "TaxSnapshot", "Payment", "PaymentAttempt", "OutboxEvent", "ArtworkAsset", "FileScanResult" TO authenticated;
GRANT INSERT ON "QuoteApproval" TO authenticated;

DROP POLICY IF EXISTS organization_select ON "Organization";
CREATE POLICY organization_select ON "Organization" FOR SELECT TO authenticated
  USING (app.is_org_member("id") OR app.is_staff());

DROP POLICY IF EXISTS organization_member_select ON "OrganizationMember";
CREATE POLICY organization_member_select ON "OrganizationMember" FOR SELECT TO authenticated
  USING (app.is_org_member("organizationId") OR app.is_staff());

DROP POLICY IF EXISTS staff_member_select ON "StaffMember";
CREATE POLICY staff_member_select ON "StaffMember" FOR SELECT TO authenticated
  USING ("userId" = auth.uid());

DROP POLICY IF EXISTS gateway_event_select ON "GatewayEvent";
CREATE POLICY gateway_event_select ON "GatewayEvent" FOR SELECT TO authenticated
  USING (app.is_staff());

DROP POLICY IF EXISTS address_select ON "Address";
CREATE POLICY address_select ON "Address" FOR SELECT TO authenticated USING (app.is_org_member("organizationId") OR app.is_staff());
DROP POLICY IF EXISTS lead_select ON "Lead";
CREATE POLICY lead_select ON "Lead" FOR SELECT TO authenticated USING (("organizationId" IS NOT NULL AND app.is_org_member("organizationId")) OR app.is_staff());
DROP POLICY IF EXISTS quote_select ON "Quote";
CREATE POLICY quote_select ON "Quote" FOR SELECT TO authenticated USING (app.is_org_member("organizationId") OR app.is_staff());
DROP POLICY IF EXISTS quote_version_select ON "QuoteVersion";
CREATE POLICY quote_version_select ON "QuoteVersion" FOR SELECT TO authenticated USING (app.is_org_member("organizationId") OR app.is_staff());
DROP POLICY IF EXISTS quote_line_select ON "QuoteLine";
CREATE POLICY quote_line_select ON "QuoteLine" FOR SELECT TO authenticated USING (app.is_org_member("organizationId") OR app.is_staff());
DROP POLICY IF EXISTS quote_approval_select ON "QuoteApproval";
CREATE POLICY quote_approval_select ON "QuoteApproval" FOR SELECT TO authenticated USING (app.is_org_member("organizationId") OR app.is_staff());
DROP POLICY IF EXISTS order_select ON "Order";
CREATE POLICY order_select ON "Order" FOR SELECT TO authenticated USING (app.is_org_member("organizationId") OR app.is_staff());
DROP POLICY IF EXISTS order_line_select ON "OrderLine";
CREATE POLICY order_line_select ON "OrderLine" FOR SELECT TO authenticated USING (app.is_org_member("organizationId") OR app.is_staff());
DROP POLICY IF EXISTS order_status_event_select ON "OrderStatusEvent";
CREATE POLICY order_status_event_select ON "OrderStatusEvent" FOR SELECT TO authenticated USING (app.is_org_member("organizationId") OR app.is_staff());
DROP POLICY IF EXISTS artwork_asset_select ON "ArtworkAsset";
CREATE POLICY artwork_asset_select ON "ArtworkAsset" FOR SELECT TO authenticated USING (app.is_org_member("organizationId") OR app.is_staff());
DROP POLICY IF EXISTS file_scan_result_select ON "FileScanResult";
CREATE POLICY file_scan_result_select ON "FileScanResult" FOR SELECT TO authenticated USING (app.is_org_member("organizationId") OR app.is_staff());
DROP POLICY IF EXISTS payment_attempt_select ON "PaymentAttempt";
CREATE POLICY payment_attempt_select ON "PaymentAttempt" FOR SELECT TO authenticated USING (app.is_org_member("organizationId") OR app.is_staff());
DROP POLICY IF EXISTS payment_select ON "Payment";
CREATE POLICY payment_select ON "Payment" FOR SELECT TO authenticated USING (app.is_org_member("organizationId") OR app.is_staff());
DROP POLICY IF EXISTS invoice_select ON "Invoice";
CREATE POLICY invoice_select ON "Invoice" FOR SELECT TO authenticated USING (app.is_org_member("organizationId") OR app.is_staff());
DROP POLICY IF EXISTS tax_snapshot_select ON "TaxSnapshot";
CREATE POLICY tax_snapshot_select ON "TaxSnapshot" FOR SELECT TO authenticated USING (app.is_org_member("organizationId") OR app.is_staff());
DROP POLICY IF EXISTS audit_event_select ON "AuditEvent";
CREATE POLICY audit_event_select ON "AuditEvent" FOR SELECT TO authenticated USING (app.is_org_member("organizationId") OR app.is_staff());
DROP POLICY IF EXISTS outbox_event_select ON "OutboxEvent";
CREATE POLICY outbox_event_select ON "OutboxEvent" FOR SELECT TO authenticated USING (app.is_org_member("organizationId") OR app.is_staff());

-- Foreign keys do not enforce tenancy, so every member-writable table checks that the
-- rows it references belong to the same organisation. Subqueries run under the caller's
-- RLS, so a row of another tenant is invisible and the check fails.
DROP POLICY IF EXISTS quote_approval_member_insert ON "QuoteApproval";
CREATE POLICY quote_approval_member_insert ON "QuoteApproval" FOR INSERT TO authenticated
  WITH CHECK (
    app.is_org_member("QuoteApproval"."organizationId")
    AND "QuoteApproval"."actorId" = auth.uid()
    AND EXISTS (
      SELECT 1 FROM "QuoteVersion" v
      WHERE v."id" = "QuoteApproval"."quoteVersionId"
        AND v."organizationId" = "QuoteApproval"."organizationId"
    )
  );

-- Members may only upload artwork in its initial state; scanning and approval are staff/server steps.
DROP POLICY IF EXISTS artwork_asset_member_insert ON "ArtworkAsset";
CREATE POLICY artwork_asset_member_insert ON "ArtworkAsset" FOR INSERT TO authenticated
  WITH CHECK (
    app.is_org_member("ArtworkAsset"."organizationId")
    AND "ArtworkAsset"."status" = 'uploaded'
    AND ("ArtworkAsset"."quoteId" IS NULL OR EXISTS (
      SELECT 1 FROM "Quote" q
      WHERE q."id" = "ArtworkAsset"."quoteId" AND q."organizationId" = "ArtworkAsset"."organizationId"))
    AND ("ArtworkAsset"."orderId" IS NULL OR EXISTS (
      SELECT 1 FROM "Order" o
      WHERE o."id" = "ArtworkAsset"."orderId" AND o."organizationId" = "ArtworkAsset"."organizationId"))
    AND ("ArtworkAsset"."leadId" IS NULL OR EXISTS (
      SELECT 1 FROM "Lead" l
      WHERE l."id" = "ArtworkAsset"."leadId" AND l."organizationId" = "ArtworkAsset"."organizationId"))
  );

DROP POLICY IF EXISTS lead_staff_write ON "Lead";
CREATE POLICY lead_staff_write ON "Lead" FOR ALL TO authenticated USING (app.is_staff()) WITH CHECK (app.is_staff());
DROP POLICY IF EXISTS quote_staff_write ON "Quote";
CREATE POLICY quote_staff_write ON "Quote" FOR ALL TO authenticated USING (app.is_staff()) WITH CHECK (app.is_staff());
DROP POLICY IF EXISTS quote_version_staff_write ON "QuoteVersion";
CREATE POLICY quote_version_staff_write ON "QuoteVersion" FOR ALL TO authenticated USING (app.is_staff()) WITH CHECK (app.is_staff());
DROP POLICY IF EXISTS quote_line_staff_write ON "QuoteLine";
CREATE POLICY quote_line_staff_write ON "QuoteLine" FOR ALL TO authenticated USING (app.is_staff()) WITH CHECK (app.is_staff());
DROP POLICY IF EXISTS order_staff_write ON "Order";
CREATE POLICY order_staff_write ON "Order" FOR ALL TO authenticated USING (app.is_staff()) WITH CHECK (app.is_staff());
DROP POLICY IF EXISTS order_line_staff_write ON "OrderLine";
CREATE POLICY order_line_staff_write ON "OrderLine" FOR ALL TO authenticated USING (app.is_staff()) WITH CHECK (app.is_staff());
DROP POLICY IF EXISTS invoice_staff_write ON "Invoice";
CREATE POLICY invoice_staff_write ON "Invoice" FOR ALL TO authenticated USING (app.is_staff()) WITH CHECK (app.is_staff());
DROP POLICY IF EXISTS tax_snapshot_staff_write ON "TaxSnapshot";
CREATE POLICY tax_snapshot_staff_write ON "TaxSnapshot" FOR ALL TO authenticated USING (app.is_staff()) WITH CHECK (app.is_staff());
DROP POLICY IF EXISTS payment_staff_write ON "Payment";
CREATE POLICY payment_staff_write ON "Payment" FOR ALL TO authenticated USING (app.is_staff()) WITH CHECK (app.is_staff());
DROP POLICY IF EXISTS payment_attempt_staff_write ON "PaymentAttempt";
CREATE POLICY payment_attempt_staff_write ON "PaymentAttempt" FOR ALL TO authenticated USING (app.is_staff()) WITH CHECK (app.is_staff());
DROP POLICY IF EXISTS outbox_event_staff_write ON "OutboxEvent";
CREATE POLICY outbox_event_staff_write ON "OutboxEvent" FOR ALL TO authenticated USING (app.is_staff()) WITH CHECK (app.is_staff());
DROP POLICY IF EXISTS artwork_asset_staff_write ON "ArtworkAsset";
CREATE POLICY artwork_asset_staff_write ON "ArtworkAsset" FOR ALL TO authenticated USING (app.is_staff()) WITH CHECK (app.is_staff());
DROP POLICY IF EXISTS file_scan_result_staff_write ON "FileScanResult";
CREATE POLICY file_scan_result_staff_write ON "FileScanResult" FOR ALL TO authenticated USING (app.is_staff()) WITH CHECK (app.is_staff());

CREATE OR REPLACE FUNCTION app.reject_mutation()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  RAISE EXCEPTION '% is append-only', TG_TABLE_NAME;
END;
$$;

CREATE OR REPLACE FUNCTION app.allow_gateway_processed_at_update()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  IF (to_jsonb(OLD) - 'processedAt') IS DISTINCT FROM (to_jsonb(NEW) - 'processedAt') THEN
    RAISE EXCEPTION 'GatewayEvent is immutable except for processedAt';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS audit_event_reject_mutation ON "AuditEvent";
CREATE TRIGGER audit_event_reject_mutation BEFORE UPDATE OR DELETE ON "AuditEvent" FOR EACH ROW EXECUTE FUNCTION app.reject_mutation();
DROP TRIGGER IF EXISTS order_status_event_reject_mutation ON "OrderStatusEvent";
CREATE TRIGGER order_status_event_reject_mutation BEFORE UPDATE OR DELETE ON "OrderStatusEvent" FOR EACH ROW EXECUTE FUNCTION app.reject_mutation();
DROP TRIGGER IF EXISTS quote_version_reject_mutation ON "QuoteVersion";
CREATE TRIGGER quote_version_reject_mutation BEFORE UPDATE OR DELETE ON "QuoteVersion" FOR EACH ROW EXECUTE FUNCTION app.reject_mutation();
DROP TRIGGER IF EXISTS tax_snapshot_reject_mutation ON "TaxSnapshot";
CREATE TRIGGER tax_snapshot_reject_mutation BEFORE UPDATE OR DELETE ON "TaxSnapshot" FOR EACH ROW EXECUTE FUNCTION app.reject_mutation();
-- Order lines are copied from QuoteLine rows, so those rows must be as immutable as the hashed version.
DROP TRIGGER IF EXISTS quote_line_reject_mutation ON "QuoteLine";
CREATE TRIGGER quote_line_reject_mutation BEFORE UPDATE OR DELETE ON "QuoteLine" FOR EACH ROW EXECUTE FUNCTION app.reject_mutation();
DROP TRIGGER IF EXISTS quote_approval_reject_mutation ON "QuoteApproval";
CREATE TRIGGER quote_approval_reject_mutation BEFORE UPDATE OR DELETE ON "QuoteApproval" FOR EACH ROW EXECUTE FUNCTION app.reject_mutation();
DROP TRIGGER IF EXISTS gateway_event_reject_mutation ON "GatewayEvent";
CREATE TRIGGER gateway_event_reject_mutation BEFORE UPDATE OR DELETE ON "GatewayEvent" FOR EACH ROW EXECUTE FUNCTION app.allow_gateway_processed_at_update();
