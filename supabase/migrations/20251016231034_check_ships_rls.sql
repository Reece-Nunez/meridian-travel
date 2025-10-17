create type "public"."ActivityType" as enum ('NOTE', 'CALL', 'EMAIL', 'MEETING', 'TASK');

create type "public"."InvoiceStatus" as enum ('DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED');

create type "public"."PaymentStatus" as enum ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

create type "public"."PipelineStage" as enum ('LEAD', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST', 'CHURNED');

create type "public"."ProjectStatus" as enum ('PLANNING', 'IN_PROGRESS', 'REVIEW', 'COMPLETED', 'ON_HOLD');

create type "public"."UserRole" as enum ('ADMIN', 'CLIENT');

create table "public"."Account" (
    "id" text not null,
    "userId" text not null,
    "type" text not null,
    "provider" text not null,
    "providerAccountId" text not null,
    "refresh_token" text,
    "access_token" text,
    "expires_at" integer,
    "token_type" text,
    "scope" text,
    "id_token" text,
    "session_state" text
);


create table "public"."Activity" (
    "id" text not null,
    "clientId" text,
    "projectId" text,
    "type" "ActivityType" not null,
    "title" text,
    "body" text,
    "createdById" text,
    "createdAt" timestamp(3) without time zone not null default CURRENT_TIMESTAMP,
    "nextActionAt" timestamp(3) without time zone
);


create table "public"."Client" (
    "id" text not null,
    "name" text not null,
    "email" text not null,
    "phone" text,
    "company" text,
    "address" text,
    "city" text,
    "state" text,
    "zipCode" text,
    "website" text,
    "industry" text,
    "notes" text,
    "totalPaid" double precision not null default 0,
    "totalOwed" double precision not null default 0,
    "stage" "PipelineStage" not null default 'LEAD'::"PipelineStage",
    "leadSource" text,
    "dealValue" double precision,
    "probability" integer,
    "nextActionAt" timestamp(3) without time zone,
    "ownerId" text,
    "domain" text,
    "brandPrimary" text,
    "brandSecondary" text,
    "brandAccent" text,
    "brandNotes" text,
    "tags" text[],
    "createdAt" timestamp(3) without time zone not null default CURRENT_TIMESTAMP,
    "updatedAt" timestamp(3) without time zone not null
);


create table "public"."Contact" (
    "id" text not null,
    "clientId" text not null,
    "name" text not null,
    "email" text,
    "phone" text,
    "title" text,
    "isPrimary" boolean not null default false,
    "createdAt" timestamp(3) without time zone not null default CURRENT_TIMESTAMP,
    "updatedAt" timestamp(3) without time zone not null
);


create table "public"."EmailMessage" (
    "id" text not null,
    "clientId" text,
    "projectId" text,
    "toEmail" text not null,
    "fromEmail" text not null,
    "subject" text not null,
    "html" text,
    "text" text,
    "provider" text,
    "providerId" text,
    "status" text,
    "createdAt" timestamp(3) without time zone not null default CURRENT_TIMESTAMP
);


create table "public"."Invoice" (
    "id" text not null,
    "invoiceNumber" text not null,
    "title" text not null,
    "description" text,
    "subtotal" double precision not null,
    "taxRate" double precision default 0,
    "taxAmount" double precision default 0,
    "total" double precision not null,
    "status" "InvoiceStatus" not null default 'DRAFT'::"InvoiceStatus",
    "issueDate" timestamp(3) without time zone not null default CURRENT_TIMESTAMP,
    "dueDate" timestamp(3) without time zone not null,
    "sentDate" timestamp(3) without time zone,
    "paidDate" timestamp(3) without time zone,
    "clientId" text not null,
    "projectId" text,
    "userId" text,
    "createdAt" timestamp(3) without time zone not null default CURRENT_TIMESTAMP,
    "updatedAt" timestamp(3) without time zone not null
);


create table "public"."InvoiceItem" (
    "id" text not null,
    "description" text not null,
    "quantity" double precision not null default 1,
    "rate" double precision not null,
    "amount" double precision not null,
    "invoiceId" text not null,
    "createdAt" timestamp(3) without time zone not null default CURRENT_TIMESTAMP
);


create table "public"."Payment" (
    "id" text not null,
    "amount" double precision not null,
    "status" "PaymentStatus" not null default 'PENDING'::"PaymentStatus",
    "method" text,
    "reference" text,
    "notes" text,
    "paymentDate" timestamp(3) without time zone not null default CURRENT_TIMESTAMP,
    "clientId" text not null,
    "projectId" text,
    "invoiceId" text,
    "userId" text,
    "createdAt" timestamp(3) without time zone not null default CURRENT_TIMESTAMP,
    "updatedAt" timestamp(3) without time zone not null
);


create table "public"."Project" (
    "id" text not null,
    "title" text not null,
    "description" text,
    "status" "ProjectStatus" not null default 'PLANNING'::"ProjectStatus",
    "estimatedHours" double precision,
    "hourlyRate" double precision,
    "totalEstimate" double precision,
    "actualHours" double precision default 0,
    "totalPaid" double precision default 0,
    "startDate" timestamp(3) without time zone,
    "endDate" timestamp(3) without time zone,
    "deadline" timestamp(3) without time zone,
    "clientId" text not null,
    "assignedUserId" text,
    "clientUserId" text,
    "stage" "PipelineStage",
    "createdAt" timestamp(3) without time zone not null default CURRENT_TIMESTAMP,
    "updatedAt" timestamp(3) without time zone not null
);


create table "public"."ProjectTask" (
    "id" text not null,
    "title" text not null,
    "description" text,
    "status" text not null default 'pending'::text,
    "estimatedHours" double precision,
    "actualHours" double precision default 0,
    "dueDate" timestamp(3) without time zone,
    "projectId" text not null,
    "createdAt" timestamp(3) without time zone not null default CURRENT_TIMESTAMP,
    "updatedAt" timestamp(3) without time zone not null
);


create table "public"."Session" (
    "id" text not null,
    "sessionToken" text not null,
    "userId" text not null,
    "expires" timestamp(3) without time zone not null
);


create table "public"."TimeEntry" (
    "id" text not null,
    "projectId" text not null,
    "taskId" text,
    "userId" text,
    "minutes" integer not null default 0,
    "billable" boolean not null default true,
    "rate" double precision,
    "note" text,
    "startedAt" timestamp(3) without time zone,
    "loggedAt" timestamp(3) without time zone not null default CURRENT_TIMESTAMP
);


create table "public"."User" (
    "id" text not null,
    "name" text,
    "email" text not null,
    "emailVerified" timestamp(3) without time zone,
    "image" text,
    "password" text,
    "role" "UserRole" not null default 'CLIENT'::"UserRole",
    "firstName" text,
    "lastName" text,
    "phone" text,
    "company" text,
    "clientId" text,
    "createdAt" timestamp(3) without time zone not null default CURRENT_TIMESTAMP,
    "updatedAt" timestamp(3) without time zone not null
);


create table "public"."VerificationToken" (
    "identifier" text not null,
    "token" text not null,
    "expires" timestamp(3) without time zone not null
);


create table "public"."_prisma_migrations" (
    "id" character varying(36) not null,
    "checksum" character varying(64) not null,
    "finished_at" timestamp with time zone,
    "migration_name" character varying(255) not null,
    "logs" text,
    "rolled_back_at" timestamp with time zone,
    "started_at" timestamp with time zone not null default now(),
    "applied_steps_count" integer not null default 0
);


CREATE UNIQUE INDEX "Account_pkey" ON public."Account" USING btree (id);

CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON public."Account" USING btree (provider, "providerAccountId");

CREATE INDEX "Activity_clientId_idx" ON public."Activity" USING btree ("clientId");

CREATE INDEX "Activity_createdById_idx" ON public."Activity" USING btree ("createdById");

CREATE UNIQUE INDEX "Activity_pkey" ON public."Activity" USING btree (id);

CREATE INDEX "Activity_projectId_idx" ON public."Activity" USING btree ("projectId");

CREATE UNIQUE INDEX "Client_email_key" ON public."Client" USING btree (email);

CREATE UNIQUE INDEX "Client_pkey" ON public."Client" USING btree (id);

CREATE INDEX "Contact_clientId_idx" ON public."Contact" USING btree ("clientId");

CREATE UNIQUE INDEX "Contact_pkey" ON public."Contact" USING btree (id);

CREATE INDEX "EmailMessage_clientId_idx" ON public."EmailMessage" USING btree ("clientId");

CREATE UNIQUE INDEX "EmailMessage_pkey" ON public."EmailMessage" USING btree (id);

CREATE INDEX "EmailMessage_projectId_idx" ON public."EmailMessage" USING btree ("projectId");

CREATE UNIQUE INDEX "InvoiceItem_pkey" ON public."InvoiceItem" USING btree (id);

CREATE UNIQUE INDEX "Invoice_invoiceNumber_key" ON public."Invoice" USING btree ("invoiceNumber");

CREATE UNIQUE INDEX "Invoice_pkey" ON public."Invoice" USING btree (id);

CREATE UNIQUE INDEX "Payment_pkey" ON public."Payment" USING btree (id);

CREATE UNIQUE INDEX "ProjectTask_pkey" ON public."ProjectTask" USING btree (id);

CREATE UNIQUE INDEX "Project_pkey" ON public."Project" USING btree (id);

CREATE UNIQUE INDEX "Session_pkey" ON public."Session" USING btree (id);

CREATE UNIQUE INDEX "Session_sessionToken_key" ON public."Session" USING btree ("sessionToken");

CREATE UNIQUE INDEX "TimeEntry_pkey" ON public."TimeEntry" USING btree (id);

CREATE INDEX "TimeEntry_projectId_idx" ON public."TimeEntry" USING btree ("projectId");

CREATE INDEX "TimeEntry_taskId_idx" ON public."TimeEntry" USING btree ("taskId");

CREATE INDEX "TimeEntry_userId_idx" ON public."TimeEntry" USING btree ("userId");

CREATE UNIQUE INDEX "User_clientId_key" ON public."User" USING btree ("clientId");

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);

CREATE UNIQUE INDEX "User_pkey" ON public."User" USING btree (id);

CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON public."VerificationToken" USING btree (identifier, token);

CREATE UNIQUE INDEX "VerificationToken_token_key" ON public."VerificationToken" USING btree (token);

CREATE UNIQUE INDEX _prisma_migrations_pkey ON public._prisma_migrations USING btree (id);

alter table "public"."Account" add constraint "Account_pkey" PRIMARY KEY using index "Account_pkey";

alter table "public"."Activity" add constraint "Activity_pkey" PRIMARY KEY using index "Activity_pkey";

alter table "public"."Client" add constraint "Client_pkey" PRIMARY KEY using index "Client_pkey";

alter table "public"."Contact" add constraint "Contact_pkey" PRIMARY KEY using index "Contact_pkey";

alter table "public"."EmailMessage" add constraint "EmailMessage_pkey" PRIMARY KEY using index "EmailMessage_pkey";

alter table "public"."Invoice" add constraint "Invoice_pkey" PRIMARY KEY using index "Invoice_pkey";

alter table "public"."InvoiceItem" add constraint "InvoiceItem_pkey" PRIMARY KEY using index "InvoiceItem_pkey";

alter table "public"."Payment" add constraint "Payment_pkey" PRIMARY KEY using index "Payment_pkey";

alter table "public"."Project" add constraint "Project_pkey" PRIMARY KEY using index "Project_pkey";

alter table "public"."ProjectTask" add constraint "ProjectTask_pkey" PRIMARY KEY using index "ProjectTask_pkey";

alter table "public"."Session" add constraint "Session_pkey" PRIMARY KEY using index "Session_pkey";

alter table "public"."TimeEntry" add constraint "TimeEntry_pkey" PRIMARY KEY using index "TimeEntry_pkey";

alter table "public"."User" add constraint "User_pkey" PRIMARY KEY using index "User_pkey";

alter table "public"."_prisma_migrations" add constraint "_prisma_migrations_pkey" PRIMARY KEY using index "_prisma_migrations_pkey";

alter table "public"."Account" add constraint "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."Account" validate constraint "Account_userId_fkey";

alter table "public"."Activity" add constraint "Activity_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."Activity" validate constraint "Activity_clientId_fkey";

alter table "public"."Activity" add constraint "Activity_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."Activity" validate constraint "Activity_createdById_fkey";

alter table "public"."Activity" add constraint "Activity_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."Activity" validate constraint "Activity_projectId_fkey";

alter table "public"."Client" add constraint "Client_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."Client" validate constraint "Client_ownerId_fkey";

alter table "public"."Contact" add constraint "Contact_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."Contact" validate constraint "Contact_clientId_fkey";

alter table "public"."EmailMessage" add constraint "EmailMessage_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."EmailMessage" validate constraint "EmailMessage_clientId_fkey";

alter table "public"."EmailMessage" add constraint "EmailMessage_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."EmailMessage" validate constraint "EmailMessage_projectId_fkey";

alter table "public"."Invoice" add constraint "Invoice_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"(id) ON UPDATE CASCADE ON DELETE RESTRICT not valid;

alter table "public"."Invoice" validate constraint "Invoice_clientId_fkey";

alter table "public"."Invoice" add constraint "Invoice_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."Invoice" validate constraint "Invoice_projectId_fkey";

alter table "public"."Invoice" add constraint "Invoice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."Invoice" validate constraint "Invoice_userId_fkey";

alter table "public"."InvoiceItem" add constraint "InvoiceItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."InvoiceItem" validate constraint "InvoiceItem_invoiceId_fkey";

alter table "public"."Payment" add constraint "Payment_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"(id) ON UPDATE CASCADE ON DELETE RESTRICT not valid;

alter table "public"."Payment" validate constraint "Payment_clientId_fkey";

alter table "public"."Payment" add constraint "Payment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."Payment" validate constraint "Payment_invoiceId_fkey";

alter table "public"."Payment" add constraint "Payment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."Payment" validate constraint "Payment_projectId_fkey";

alter table "public"."Payment" add constraint "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."Payment" validate constraint "Payment_userId_fkey";

alter table "public"."Project" add constraint "Project_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "User"(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."Project" validate constraint "Project_assignedUserId_fkey";

alter table "public"."Project" add constraint "Project_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."Project" validate constraint "Project_clientId_fkey";

alter table "public"."Project" add constraint "Project_clientUserId_fkey" FOREIGN KEY ("clientUserId") REFERENCES "User"(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."Project" validate constraint "Project_clientUserId_fkey";

alter table "public"."ProjectTask" add constraint "ProjectTask_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."ProjectTask" validate constraint "ProjectTask_projectId_fkey";

alter table "public"."Session" add constraint "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."Session" validate constraint "Session_userId_fkey";

alter table "public"."TimeEntry" add constraint "TimeEntry_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."TimeEntry" validate constraint "TimeEntry_projectId_fkey";

alter table "public"."TimeEntry" add constraint "TimeEntry_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "ProjectTask"(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."TimeEntry" validate constraint "TimeEntry_taskId_fkey";

alter table "public"."TimeEntry" add constraint "TimeEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."TimeEntry" validate constraint "TimeEntry_userId_fkey";


