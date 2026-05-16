CREATE TABLE IF NOT EXISTS "auth" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
	"username" varchar(255) NOT NULL,
	"password_hash" varchar(512) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "auth_username_idx" ON "auth" USING btree ("username");
