--
-- PostgreSQL database dump
--

\restrict fDnytAllhTsEjHwjurHuiJntpxPgJgCgtd0d1JBuNTSY8iwtdwYTGAL57YWqh2t

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

-- Started on 2026-04-27 18:53:24

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

DROP DATABASE scanova;
--
-- TOC entry 4981 (class 1262 OID 24619)
-- Name: scanova; Type: DATABASE; Schema: -; Owner: -
--

CREATE DATABASE scanova WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'Bosnian (Latin)_Bosnia & Herzegovina.1252';


\unrestrict fDnytAllhTsEjHwjurHuiJntpxPgJgCgtd0d1JBuNTSY8iwtdwYTGAL57YWqh2t
\connect scanova
\restrict fDnytAllhTsEjHwjurHuiJntpxPgJgCgtd0d1JBuNTSY8iwtdwYTGAL57YWqh2t

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
    booked_at timestamp with time zone DEFAULT now()
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
-- TOC entry 4982 (class 0 OID 0)
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
    created_at timestamp with time zone DEFAULT now()
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
-- TOC entry 4983 (class 0 OID 0)
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
-- TOC entry 4984 (class 0 OID 0)
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
-- TOC entry 4985 (class 0 OID 0)
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
-- TOC entry 4986 (class 0 OID 0)
-- Dependencies: 219
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 4790 (class 2604 OID 24725)
-- Name: bookings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings ALTER COLUMN id SET DEFAULT nextval('public.bookings_id_seq'::regclass);


--
-- TOC entry 4784 (class 2604 OID 24688)
-- Name: events id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events ALTER COLUMN id SET DEFAULT nextval('public.events_id_seq'::regclass);


--
-- TOC entry 4793 (class 2604 OID 24747)
-- Name: feedback id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feedback ALTER COLUMN id SET DEFAULT nextval('public.feedback_id_seq'::regclass);


--
-- TOC entry 4787 (class 2604 OID 24708)
-- Name: ticket_types id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket_types ALTER COLUMN id SET DEFAULT nextval('public.ticket_types_id_seq'::regclass);


--
-- TOC entry 4781 (class 2604 OID 24671)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 4973 (class 0 OID 24722)
-- Dependencies: 226
-- Data for Name: bookings; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.bookings (id, user_id, ticket_type_id, status, qr_hash, checked_in_at, booked_at) VALUES (1, 3, 1, 'confirmed', 'SCAN-XYZ-111', NULL, '2026-04-26 15:16:49.170259+02');
INSERT INTO public.bookings (id, user_id, ticket_type_id, status, qr_hash, checked_in_at, booked_at) VALUES (2, 4, 1, 'confirmed', 'SCAN-ABC-222', NULL, '2026-04-26 15:16:49.170259+02');
INSERT INTO public.bookings (id, user_id, ticket_type_id, status, qr_hash, checked_in_at, booked_at) VALUES (3, 3, 3, 'confirmed', 'SCAN-LMN-333', NULL, '2026-04-26 15:16:49.170259+02');


--
-- TOC entry 4969 (class 0 OID 24685)
-- Dependencies: 222
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.events (id, organizer_id, title, description, location, event_date, total_capacity, agenda_data, created_at) VALUES (1, 2, 'Tech Innovation Summit', 'A deep dive into 2024 tech trends.', 'Main Hall A', '2024-11-15 10:00:00+01', 100, '[{"time": "09:00", "title": "Opening", "speaker": "Amina B."}, {"time": "11:00", "title": "AI Future", "speaker": "Dr. Smith"}]', '2026-04-26 15:16:32.774744+02');
INSERT INTO public.events (id, organizer_id, title, description, location, event_date, total_capacity, agenda_data, created_at) VALUES (2, 2, 'Postgres Workshop', 'Hands-on database design session.', 'Lab 302', '2024-12-01 15:00:00+01', 30, '[{"time": "14:00", "title": "Setup", "speaker": "Berin S."}, {"time": "15:30", "title": "Optimization", "speaker": "Expert Joe"}]', '2026-04-26 15:16:32.774744+02');
INSERT INTO public.events (id, organizer_id, title, description, location, event_date, total_capacity, agenda_data, created_at) VALUES (3, 2, 'Student Networking Gala', 'Mix and mingle with industry leaders.', 'Grand Ballroom', '2024-12-20 19:00:00+01', 200, '[{"time": "18:00", "title": "Welcome Drinks", "speaker": "Admin"}]', '2026-04-26 15:16:32.774744+02');


--
-- TOC entry 4975 (class 0 OID 24744)
-- Dependencies: 228
-- Data for Name: feedback; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.feedback (id, event_id, user_id, rating, comment, submitted_at) VALUES (1, 1, 3, 5, 'Amazing insights into the future of tech!', '2026-04-26 15:16:59.483608+02');
INSERT INTO public.feedback (id, event_id, user_id, rating, comment, submitted_at) VALUES (2, 1, 4, 4, 'Very well organized, though the coffee break was short.', '2026-04-26 15:16:59.483608+02');
INSERT INTO public.feedback (id, event_id, user_id, rating, comment, submitted_at) VALUES (3, 2, 3, 5, 'Great hands-on practice with the DB schema.', '2026-04-26 15:16:59.483608+02');


--
-- TOC entry 4971 (class 0 OID 24705)
-- Dependencies: 224
-- Data for Name: ticket_types; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.ticket_types (id, event_id, name, price, quantity_limit, tickets_sold) VALUES (1, 1, 'Standard Access', 0.00, 80, 2);
INSERT INTO public.ticket_types (id, event_id, name, price, quantity_limit, tickets_sold) VALUES (2, 1, 'VIP Backstage', 50.00, 20, 0);
INSERT INTO public.ticket_types (id, event_id, name, price, quantity_limit, tickets_sold) VALUES (3, 2, 'Workshop Pass', 10.00, 30, 1);
INSERT INTO public.ticket_types (id, event_id, name, price, quantity_limit, tickets_sold) VALUES (4, 3, 'Early Bird', 5.00, 50, 0);


--
-- TOC entry 4967 (class 0 OID 24668)
-- Dependencies: 220
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.users (id, full_name, email, password_hash, role, created_at) VALUES (1, 'System Admin', 'admin@scanova.com', 'hashed_pass_123', 'admin', '2026-04-26 15:16:23.432641+02');
INSERT INTO public.users (id, full_name, email, password_hash, role, created_at) VALUES (2, 'Amina Brković', 'amina@organizer.com', 'hashed_pass_456', 'organizer', '2026-04-26 15:16:23.432641+02');
INSERT INTO public.users (id, full_name, email, password_hash, role, created_at) VALUES (3, 'Berin Šurković', 'berin@student.com', 'hashed_pass_789', 'attendee', '2026-04-26 15:16:23.432641+02');
INSERT INTO public.users (id, full_name, email, password_hash, role, created_at) VALUES (4, 'John Doe', 'john.doe@gmail.com', 'hashed_pass_000', 'attendee', '2026-04-26 15:16:23.432641+02');


--
-- TOC entry 4987 (class 0 OID 0)
-- Dependencies: 225
-- Name: bookings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.bookings_id_seq', 3, true);


--
-- TOC entry 4988 (class 0 OID 0)
-- Dependencies: 221
-- Name: events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.events_id_seq', 3, true);


--
-- TOC entry 4989 (class 0 OID 0)
-- Dependencies: 227
-- Name: feedback_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.feedback_id_seq', 3, true);


--
-- TOC entry 4990 (class 0 OID 0)
-- Dependencies: 223
-- Name: ticket_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.ticket_types_id_seq', 4, true);


--
-- TOC entry 4991 (class 0 OID 0)
-- Dependencies: 219
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 4, true);


--
-- TOC entry 4805 (class 2606 OID 24730)
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (id);


--
-- TOC entry 4807 (class 2606 OID 24732)
-- Name: bookings bookings_qr_hash_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_qr_hash_key UNIQUE (qr_hash);


--
-- TOC entry 4801 (class 2606 OID 24698)
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- TOC entry 4810 (class 2606 OID 24756)
-- Name: feedback feedback_event_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feedback
    ADD CONSTRAINT feedback_event_id_user_id_key UNIQUE (event_id, user_id);


--
-- TOC entry 4812 (class 2606 OID 24754)
-- Name: feedback feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feedback
    ADD CONSTRAINT feedback_pkey PRIMARY KEY (id);


--
-- TOC entry 4803 (class 2606 OID 24715)
-- Name: ticket_types ticket_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket_types
    ADD CONSTRAINT ticket_types_pkey PRIMARY KEY (id);


--
-- TOC entry 4797 (class 2606 OID 24683)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4799 (class 2606 OID 24681)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4808 (class 1259 OID 24767)
-- Name: idx_qr_hash; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_qr_hash ON public.bookings USING btree (qr_hash);


--
-- TOC entry 4815 (class 2606 OID 24738)
-- Name: bookings bookings_ticket_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_ticket_type_id_fkey FOREIGN KEY (ticket_type_id) REFERENCES public.ticket_types(id) ON DELETE CASCADE;


--
-- TOC entry 4816 (class 2606 OID 24733)
-- Name: bookings bookings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4813 (class 2606 OID 24699)
-- Name: events events_organizer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_organizer_id_fkey FOREIGN KEY (organizer_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4817 (class 2606 OID 24757)
-- Name: feedback feedback_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feedback
    ADD CONSTRAINT feedback_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- TOC entry 4818 (class 2606 OID 24762)
-- Name: feedback feedback_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feedback
    ADD CONSTRAINT feedback_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4814 (class 2606 OID 24716)
-- Name: ticket_types ticket_types_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket_types
    ADD CONSTRAINT ticket_types_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


-- Completed on 2026-04-27 18:53:24

--
-- PostgreSQL database dump complete
--

\unrestrict fDnytAllhTsEjHwjurHuiJntpxPgJgCgtd0d1JBuNTSY8iwtdwYTGAL57YWqh2t

