-- Scanova database schema + seed data for Docker
-- Generated from pg_dump; stripped of CREATE/DROP DATABASE and psql meta-commands

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Types
--

CREATE TYPE public.booking_status AS ENUM (
    'confirmed',
    'waitlisted',
    'cancelled'
);

CREATE TYPE public.event_status AS ENUM (
    'pending',
    'approved',
    'rejected'
);

CREATE TYPE public.user_role AS ENUM (
    'attendee',
    'organizer',
    'admin'
);

SET default_tablespace = '';
SET default_table_access_method = heap;

--
-- Tables
--

CREATE TABLE public.bookings (
    id integer NOT NULL,
    user_id integer,
    ticket_type_id integer,
    status public.booking_status DEFAULT 'confirmed'::public.booking_status,
    qr_hash character varying(255),
    checked_in_at timestamp with time zone,
    booked_at timestamp with time zone DEFAULT now()
);

CREATE SEQUENCE public.bookings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.bookings_id_seq OWNED BY public.bookings.id;

CREATE TABLE public.events (
    id integer NOT NULL,
    organizer_id integer,
    title character varying(255) NOT NULL,
    description text,
    location character varying(255),
    event_date timestamp with time zone NOT NULL,
    total_capacity integer NOT NULL,
    agenda_data jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    category character varying(50) DEFAULT 'General'::character varying NOT NULL,
    status public.event_status DEFAULT 'pending'::public.event_status,
    cover_image character varying(255)
);

CREATE SEQUENCE public.events_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.events_id_seq OWNED BY public.events.id;

CREATE TABLE public.feedback (
    id integer NOT NULL,
    event_id integer,
    user_id integer,
    rating integer,
    comment text,
    submitted_at timestamp with time zone DEFAULT now(),
    CONSTRAINT feedback_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);

CREATE SEQUENCE public.feedback_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.feedback_id_seq OWNED BY public.feedback.id;

CREATE TABLE public.ticket_types (
    id integer NOT NULL,
    event_id integer,
    name character varying(50) NOT NULL,
    price numeric(10,2) DEFAULT 0.00,
    quantity_limit integer NOT NULL,
    tickets_sold integer DEFAULT 0
);

CREATE SEQUENCE public.ticket_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.ticket_types_id_seq OWNED BY public.ticket_types.id;

CREATE TABLE public.users (
    id integer NOT NULL,
    full_name character varying(100) NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    role public.user_role DEFAULT 'attendee'::public.user_role,
    created_at timestamp with time zone DEFAULT now()
);

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;

--
-- Defaults
--

ALTER TABLE ONLY public.bookings ALTER COLUMN id SET DEFAULT nextval('public.bookings_id_seq'::regclass);
ALTER TABLE ONLY public.events ALTER COLUMN id SET DEFAULT nextval('public.events_id_seq'::regclass);
ALTER TABLE ONLY public.feedback ALTER COLUMN id SET DEFAULT nextval('public.feedback_id_seq'::regclass);
ALTER TABLE ONLY public.ticket_types ALTER COLUMN id SET DEFAULT nextval('public.ticket_types_id_seq'::regclass);
ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);

--
-- Seed data
--

INSERT INTO public.users (id, full_name, email, password_hash, role, created_at) VALUES (8, 'Admin', 'admin@scanova.com', '$2b$10$IpS88z30v.soq1aITTJ0K.W8vD6PIIVHOFHTS4B3SDEt4SLehRcXK', 'admin', '2026-06-06 14:27:27.096972+02');
INSERT INTO public.users (id, full_name, email, password_hash, role, created_at) VALUES (7, 'John Smith', 'john.smith@gmail.com', '$2b$10$bbQn7V9wfPwHKQ.3KNruRuv0h0gk8hrLuCjo8TY6yuOes8UX4Ud1y', 'organizer', '2026-06-06 15:06:58.535694+02');

INSERT INTO public.events (id, organizer_id, title, description, location, event_date, total_capacity, agenda_data, created_at, category, status, cover_image) VALUES (5, 7, 'React & Modern Frontend Summit', 'A full-day deep dive into React 19, server components, and the modern frontend ecosystem.', 'Tech Hub Sarajevo, Floor 4', '2026-09-15 09:00:00+02', 150, '[]', '2026-06-06 15:11:49.401022+02', 'Technology', 'pending', NULL);
INSERT INTO public.events (id, organizer_id, title, description, location, event_date, total_capacity, agenda_data, created_at, category, status, cover_image) VALUES (6, 7, 'Balkan Entrepreneur Meetup', 'Monthly gathering of founders, investors, and operators building companies in the Western Balkans.', 'Startup Garage, Skenderija', '2026-08-22 18:00:00+02', 80, '[]', '2026-06-06 15:11:49.401022+02', 'Business', 'pending', NULL);
INSERT INTO public.events (id, organizer_id, title, description, location, event_date, total_capacity, agenda_data, created_at, category, status, cover_image) VALUES (7, 7, 'Electronic Music Festival — Night 1', 'Three stages, twelve artists, one unforgettable night of electronic music.', 'Zetra Olympic Hall', '2026-10-10 21:00:00+02', 2000, '[]', '2026-06-06 15:11:49.401022+02', 'Music', 'pending', NULL);
INSERT INTO public.events (id, organizer_id, title, description, location, event_date, total_capacity, agenda_data, created_at, category, status, cover_image) VALUES (12, 7, 'Open Source Contributor Day', 'Collaborative coding sessions — bring your laptop and contribute to real open-source projects.', 'IBU Innovation Lab', '2026-07-20 10:00:00+02', 60, '[]', '2026-06-06 15:14:15.595335+02', 'Technology', 'approved', NULL);
INSERT INTO public.events (id, organizer_id, title, description, location, event_date, total_capacity, agenda_data, created_at, category, status, cover_image) VALUES (13, 7, 'Yoga & Mindfulness Retreat', 'A weekend of guided yoga, breathwork, and mindfulness sessions in a mountain setting.', 'Bjelašnica Mountain Resort', '2026-08-08 08:00:00+02', 30, '[]', '2026-06-06 15:14:15.595335+02', 'Sports', 'approved', NULL);
INSERT INTO public.events (id, organizer_id, title, description, location, event_date, total_capacity, agenda_data, created_at, category, status, cover_image) VALUES (16, 7, 'Open Source Contributor Day', 'Collaborative coding sessions — bring your laptop and contribute to real open-source projects.', 'IBU Innovation Lab', '2026-07-20 10:00:00+02', 60, '[]', '2026-06-06 15:14:38.193143+02', 'Technology', 'approved', NULL);
INSERT INTO public.events (id, organizer_id, title, description, location, event_date, total_capacity, agenda_data, created_at, category, status, cover_image) VALUES (18, 7, 'Pyramid Scheme Coaching Workshop', 'Learn exclusive wealth-building strategies.', 'Undisclosed Location', '2026-07-01 14:00:00+02', 500, '[]', '2026-06-06 15:14:46.020327+02', 'Business', 'rejected', NULL);
INSERT INTO public.events (id, organizer_id, title, description, location, event_date, total_capacity, agenda_data, created_at, category, status, cover_image) VALUES (19, 7, 'Test Event', 'This event was used to test the event creation form.', 'Sarajevo', '2026-10-21 05:50:00+02', 50, '[]', '2026-06-07 00:05:01.831571+02', 'Health & Wellness', 'pending', NULL);

INSERT INTO public.ticket_types (id, event_id, name, price, quantity_limit, tickets_sold) VALUES (6, 12, 'General Admission', 0.00, 50, 23);
INSERT INTO public.ticket_types (id, event_id, name, price, quantity_limit, tickets_sold) VALUES (8, 13, 'Retreat Pass', 120.00, 30, 18);
INSERT INTO public.ticket_types (id, event_id, name, price, quantity_limit, tickets_sold) VALUES (10, 12, 'General Admission', 0.00, 50, 23);
INSERT INTO public.ticket_types (id, event_id, name, price, quantity_limit, tickets_sold) VALUES (11, 16, 'General Admission', 0.00, 50, 23);
INSERT INTO public.ticket_types (id, event_id, name, price, quantity_limit, tickets_sold) VALUES (13, 13, 'Retreat Pass', 120.00, 30, 18);
INSERT INTO public.ticket_types (id, event_id, name, price, quantity_limit, tickets_sold) VALUES (15, 19, 'General Admission', 0.00, 20, 0);
INSERT INTO public.ticket_types (id, event_id, name, price, quantity_limit, tickets_sold) VALUES (16, 19, 'VIP', 20.00, 30, 0);

--
-- Sequence reset
--

SELECT pg_catalog.setval('public.bookings_id_seq', 3, true);
SELECT pg_catalog.setval('public.events_id_seq', 20, true);
SELECT pg_catalog.setval('public.feedback_id_seq', 3, true);
SELECT pg_catalog.setval('public.ticket_types_id_seq', 16, true);
SELECT pg_catalog.setval('public.users_id_seq', 9, true);

--
-- Primary keys and unique constraints
--

ALTER TABLE ONLY public.bookings ADD CONSTRAINT bookings_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.bookings ADD CONSTRAINT bookings_qr_hash_key UNIQUE (qr_hash);
ALTER TABLE ONLY public.events ADD CONSTRAINT events_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.feedback ADD CONSTRAINT feedback_event_id_user_id_key UNIQUE (event_id, user_id);
ALTER TABLE ONLY public.feedback ADD CONSTRAINT feedback_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.ticket_types ADD CONSTRAINT ticket_types_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.users ADD CONSTRAINT users_email_key UNIQUE (email);
ALTER TABLE ONLY public.users ADD CONSTRAINT users_pkey PRIMARY KEY (id);

CREATE INDEX idx_qr_hash ON public.bookings USING btree (qr_hash);

--
-- Foreign keys
--

ALTER TABLE ONLY public.bookings ADD CONSTRAINT bookings_ticket_type_id_fkey FOREIGN KEY (ticket_type_id) REFERENCES public.ticket_types(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.bookings ADD CONSTRAINT bookings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.events ADD CONSTRAINT events_organizer_id_fkey FOREIGN KEY (organizer_id) REFERENCES public.users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.feedback ADD CONSTRAINT feedback_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.feedback ADD CONSTRAINT feedback_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.ticket_types ADD CONSTRAINT ticket_types_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;
