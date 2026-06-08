--
-- PostgreSQL database dump
--

\restrict 3OPJ3HHxxOmayktAaB73gj6xStjc3HMs3Va3cGQQQUrc7sfEOLs3acheVGWYAh5

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

-- Started on 2026-06-07 00:27:35

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

DROP DATABASE IF EXISTS scanova;
--
-- TOC entry 4986 (class 1262 OID 24619)
-- Name: scanova; Type: DATABASE; Schema: -; Owner: -
--

CREATE DATABASE scanova WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'Bosnian (Latin)_Bosnia & Herzegovina.1252';


\unrestrict 3OPJ3HHxxOmayktAaB73gj6xStjc3HMs3Va3cGQQQUrc7sfEOLs3acheVGWYAh5
\connect scanova
\restrict 3OPJ3HHxxOmayktAaB73gj6xStjc3HMs3Va3cGQQQUrc7sfEOLs3acheVGWYAh5

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
-- TOC entry 864 (class 1247 OID 24660)
-- Name: booking_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.booking_status AS ENUM (
    'confirmed',
    'waitlisted',
    'cancelled'
);


--
-- TOC entry 882 (class 1247 OID 25073)
-- Name: event_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.event_status AS ENUM (
    'pending',
    'approved',
    'rejected',
    'cancelled'
);


--
-- TOC entry 861 (class 1247 OID 24653)
-- Name: user_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_role AS ENUM (
    'attendee',
    'organizer',
    'admin'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 226 (class 1259 OID 24722)
-- Name: bookings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bookings (
    id integer NOT NULL,
    user_id integer,
    ticket_type_id integer,
    status public.booking_status DEFAULT 'confirmed'::public.booking_status,
    qr_hash character varying(255),
    checked_in_at timestamp with time zone,
    booked_at timestamp with time zone DEFAULT now(),
    custom_responses jsonb DEFAULT '{}'::jsonb
);


--
-- TOC entry 225 (class 1259 OID 24721)
-- Name: bookings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.bookings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4987 (class 0 OID 0)
-- Dependencies: 225
-- Name: bookings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.bookings_id_seq OWNED BY public.bookings.id;


--
-- TOC entry 222 (class 1259 OID 24685)
-- Name: events; Type: TABLE; Schema: public; Owner: -
--

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
    cover_image character varying(255),
    speakers_data jsonb DEFAULT '[]'::jsonb,
    custom_fields jsonb DEFAULT '[]'::jsonb
);


--
-- TOC entry 221 (class 1259 OID 24684)
-- Name: events_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.events_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4988 (class 0 OID 0)
-- Dependencies: 221
-- Name: events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.events_id_seq OWNED BY public.events.id;


--
-- TOC entry 228 (class 1259 OID 24744)
-- Name: feedback; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.feedback (
    id integer NOT NULL,
    event_id integer,
    user_id integer,
    rating integer,
    comment text,
    submitted_at timestamp with time zone DEFAULT now(),
    CONSTRAINT feedback_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


--
-- TOC entry 227 (class 1259 OID 24743)
-- Name: feedback_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.feedback_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4989 (class 0 OID 0)
-- Dependencies: 227
-- Name: feedback_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.feedback_id_seq OWNED BY public.feedback.id;


--
-- TOC entry 224 (class 1259 OID 24705)
-- Name: ticket_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ticket_types (
    id integer NOT NULL,
    event_id integer,
    name character varying(50) NOT NULL,
    price numeric(10,2) DEFAULT 0.00,
    quantity_limit integer NOT NULL,
    tickets_sold integer DEFAULT 0
);


--
-- TOC entry 223 (class 1259 OID 24704)
-- Name: ticket_types_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ticket_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4990 (class 0 OID 0)
-- Dependencies: 223
-- Name: ticket_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ticket_types_id_seq OWNED BY public.ticket_types.id;


--
-- TOC entry 220 (class 1259 OID 24668)
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    full_name character varying(100) NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    role public.user_role DEFAULT 'attendee'::public.user_role,
    created_at timestamp with time zone DEFAULT now()
);


--
-- TOC entry 219 (class 1259 OID 24667)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4991 (class 0 OID 0)
-- Dependencies: 219
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 4795 (class 2604 OID 24725)
-- Name: bookings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings ALTER COLUMN id SET DEFAULT nextval('public.bookings_id_seq'::regclass);


--
-- TOC entry 4787 (class 2604 OID 24688)
-- Name: events id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events ALTER COLUMN id SET DEFAULT nextval('public.events_id_seq'::regclass);


--
-- TOC entry 4798 (class 2604 OID 24747)
-- Name: feedback id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feedback ALTER COLUMN id SET DEFAULT nextval('public.feedback_id_seq'::regclass);


--
-- TOC entry 4792 (class 2604 OID 24708)
-- Name: ticket_types id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket_types ALTER COLUMN id SET DEFAULT nextval('public.ticket_types_id_seq'::regclass);


--
-- TOC entry 4784 (class 2604 OID 24671)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 4978 (class 0 OID 24722)
-- Dependencies: 226
-- Data for Name: bookings; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4974 (class 0 OID 24685)
-- Dependencies: 222
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.events (id, organizer_id, title, description, location, event_date, total_capacity, agenda_data, created_at, category, status, cover_image) VALUES (5, 7, 'React & Modern Frontend Summit', 'A full-day deep dive into React 19, server components, and the modern frontend ecosystem.', 'Tech Hub Sarajevo, Floor 4', '2026-09-15 09:00:00+02', 150, '[]', '2026-06-06 15:11:49.401022+02', 'Technology', 'pending', NULL);
INSERT INTO public.events (id, organizer_id, title, description, location, event_date, total_capacity, agenda_data, created_at, category, status, cover_image) VALUES (7, 7, 'Electronic Music Festival — Night 1', 'Three stages, twelve artists, one unforgettable night of electronic music.', 'Zetra Olympic Hall', '2026-10-10 21:00:00+02', 2000, '[]', '2026-06-06 15:11:49.401022+02', 'Music', 'pending', NULL);
INSERT INTO public.events (id, organizer_id, title, description, location, event_date, total_capacity, agenda_data, created_at, category, status, cover_image) VALUES (12, 7, 'Open Source Contributor Day', 'Collaborative coding sessions — bring your laptop and contribute to real open-source projects.', 'IBU Innovation Lab', '2026-07-20 10:00:00+02', 60, '[]', '2026-06-06 15:14:15.595335+02', 'Technology', 'approved', NULL);
INSERT INTO public.events (id, organizer_id, title, description, location, event_date, total_capacity, agenda_data, created_at, category, status, cover_image) VALUES (13, 7, 'Yoga & Mindfulness Retreat', 'A weekend of guided yoga, breathwork, and mindfulness sessions in a mountain setting.', 'Bjelašnica Mountain Resort', '2026-08-08 08:00:00+02', 30, '[]', '2026-06-06 15:14:15.595335+02', 'Sports', 'approved', NULL);
INSERT INTO public.events (id, organizer_id, title, description, location, event_date, total_capacity, agenda_data, created_at, category, status, cover_image) VALUES (16, 7, 'Open Source Contributor Day', 'Collaborative coding sessions — bring your laptop and contribute to real open-source projects.', 'IBU Innovation Lab', '2026-07-20 10:00:00+02', 60, '[]', '2026-06-06 15:14:38.193143+02', 'Technology', 'approved', NULL);
INSERT INTO public.events (id, organizer_id, title, description, location, event_date, total_capacity, agenda_data, created_at, category, status, cover_image) VALUES (18, 7, 'Pyramid Scheme Coaching Workshop', 'Learn exclusive wealth-building strategies.', 'Undisclosed Location', '2026-07-01 14:00:00+02', 500, '[]', '2026-06-06 15:14:46.020327+02', 'Business', 'rejected', NULL);
INSERT INTO public.events (id, organizer_id, title, description, location, event_date, total_capacity, agenda_data, created_at, category, status, cover_image) VALUES (6, 7, 'Balkan Entrepreneur Meetup', 'Monthly gathering of founders, investors, and operators building companies in the Western Balkans.', 'Startup Garage, Skenderija', '2026-08-22 18:00:00+02', 80, '[]', '2026-06-06 15:11:49.401022+02', 'Business', 'pending', NULL);
INSERT INTO public.events (id, organizer_id, title, description, location, event_date, total_capacity, agenda_data, created_at, category, status, cover_image) VALUES (19, 7, 'Test Event', 'This event was used to test the event creation form.', 'Sarajevo', '2026-10-21 05:50:00+02', 50, '[]', '2026-06-07 00:05:01.831571+02', 'Health & Wellness', 'pending', NULL);


--
-- TOC entry 4980 (class 0 OID 24744)
-- Dependencies: 228
-- Data for Name: feedback; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4976 (class 0 OID 24705)
-- Dependencies: 224
-- Data for Name: ticket_types; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.ticket_types (id, event_id, name, price, quantity_limit, tickets_sold) VALUES (6, 12, 'General Admission', 0.00, 50, 23);
INSERT INTO public.ticket_types (id, event_id, name, price, quantity_limit, tickets_sold) VALUES (8, 13, 'Retreat Pass', 120.00, 30, 18);
INSERT INTO public.ticket_types (id, event_id, name, price, quantity_limit, tickets_sold) VALUES (10, 12, 'General Admission', 0.00, 50, 23);
INSERT INTO public.ticket_types (id, event_id, name, price, quantity_limit, tickets_sold) VALUES (11, 16, 'General Admission', 0.00, 50, 23);
INSERT INTO public.ticket_types (id, event_id, name, price, quantity_limit, tickets_sold) VALUES (13, 13, 'Retreat Pass', 120.00, 30, 18);
INSERT INTO public.ticket_types (id, event_id, name, price, quantity_limit, tickets_sold) VALUES (15, 19, 'General Admission', 0.00, 20, 0);
INSERT INTO public.ticket_types (id, event_id, name, price, quantity_limit, tickets_sold) VALUES (16, 19, 'VIP', 20.00, 30, 0);


--
-- TOC entry 4972 (class 0 OID 24668)
-- Dependencies: 220
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.users (id, full_name, email, password_hash, role, created_at) VALUES (8, 'Admin', 'admin@scanova.com', '$2b$10$IpS88z30v.soq1aITTJ0K.W8vD6PIIVHOFHTS4B3SDEt4SLehRcXK', 'admin', '2026-06-06 14:27:27.096972+02');
INSERT INTO public.users (id, full_name, email, password_hash, role, created_at) VALUES (7, 'John Smith', 'john.smith@gmail.com', '$2b$10$bbQn7V9wfPwHKQ.3KNruRuv0h0gk8hrLuCjo8TY6yuOes8UX4Ud1y', 'organizer', '2026-06-06 15:06:58.535694+02');


--
-- TOC entry 4992 (class 0 OID 0)
-- Dependencies: 225
-- Name: bookings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.bookings_id_seq', 3, true);


--
-- TOC entry 4993 (class 0 OID 0)
-- Dependencies: 221
-- Name: events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.events_id_seq', 20, true);


--
-- TOC entry 4994 (class 0 OID 0)
-- Dependencies: 227
-- Name: feedback_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.feedback_id_seq', 3, true);


--
-- TOC entry 4995 (class 0 OID 0)
-- Dependencies: 223
-- Name: ticket_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.ticket_types_id_seq', 16, true);


--
-- TOC entry 4996 (class 0 OID 0)
-- Dependencies: 219
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 9, true);


--
-- TOC entry 4810 (class 2606 OID 24730)
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (id);


--
-- TOC entry 4812 (class 2606 OID 24732)
-- Name: bookings bookings_qr_hash_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_qr_hash_key UNIQUE (qr_hash);


--
-- TOC entry 4806 (class 2606 OID 24698)
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- TOC entry 4815 (class 2606 OID 24756)
-- Name: feedback feedback_event_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feedback
    ADD CONSTRAINT feedback_event_id_user_id_key UNIQUE (event_id, user_id);


--
-- TOC entry 4817 (class 2606 OID 24754)
-- Name: feedback feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feedback
    ADD CONSTRAINT feedback_pkey PRIMARY KEY (id);


--
-- TOC entry 4808 (class 2606 OID 24715)
-- Name: ticket_types ticket_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket_types
    ADD CONSTRAINT ticket_types_pkey PRIMARY KEY (id);


--
-- TOC entry 4802 (class 2606 OID 24683)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4804 (class 2606 OID 24681)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4813 (class 1259 OID 24767)
-- Name: idx_qr_hash; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_qr_hash ON public.bookings USING btree (qr_hash);


--
-- TOC entry 4820 (class 2606 OID 24738)
-- Name: bookings bookings_ticket_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_ticket_type_id_fkey FOREIGN KEY (ticket_type_id) REFERENCES public.ticket_types(id) ON DELETE CASCADE;


--
-- TOC entry 4821 (class 2606 OID 24733)
-- Name: bookings bookings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4818 (class 2606 OID 24699)
-- Name: events events_organizer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_organizer_id_fkey FOREIGN KEY (organizer_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4822 (class 2606 OID 24757)
-- Name: feedback feedback_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feedback
    ADD CONSTRAINT feedback_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- TOC entry 4823 (class 2606 OID 24762)
-- Name: feedback feedback_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feedback
    ADD CONSTRAINT feedback_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4819 (class 2606 OID 24716)
-- Name: ticket_types ticket_types_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket_types
    ADD CONSTRAINT ticket_types_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


-- Completed on 2026-06-07 00:27:35

--
-- PostgreSQL database dump complete
--

\unrestrict 3OPJ3HHxxOmayktAaB73gj6xStjc3HMs3Va3cGQQQUrc7sfEOLs3acheVGWYAh5

