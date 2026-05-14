CREATE TABLE "guests" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "guests_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"invitation_code" varchar(255),
	"is_attending" boolean DEFAULT false NOT NULL,
	"guest_type" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
