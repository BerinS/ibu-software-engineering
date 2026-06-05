--
-- PostgreSQL database dump
--

\restrict 9BrwolI878Dez7v1EDqrq8KN28Mc5xUXEKpZyLySIybEGjb1Bhjo5IdxOfAbF8i

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

-- Started on 2026-06-05 19:37:01

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


\unrestrict 9BrwolI878Dez7v1EDqrq8KN28Mc5xUXEKpZyLySIybEGjb1Bhjo5IdxOfAbF8i
\connect scanova
\restrict 9BrwolI878Dez7v1EDqrq8KN28Mc5xUXEKpZyLySIybEGjb1Bhjo5IdxOfAbF8i

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
    'rejected'
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
    status public.event_status DEFAULT 'pending'::public.event_status
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

INSERT INTO public.events (id, organizer_id, title, description, location, event_date, total_capacity, agenda_data, created_at, category, status) VALUES (1, 2, 'Tech Innovation Summit', 'A deep dive into 2024 tech trends.', 'Main Hall A', '2024-11-15 10:00:00+01', 100, '[{"time": "09:00", "title": "Opening", "speaker": "Amina B."}, {"time": "11:00", "title": "AI Future", "speaker": "Dr. Smith"}]', '2026-04-26 15:16:32.774744+02', 'Technology', 'pending');
INSERT INTO public.events (id, organizer_id, title, description, location, event_date, total_capacity, agenda_data, created_at, category, status) VALUES (2, 2, 'Postgres Workshop', 'Hands-on database design session.', 'Lab 302', '2024-12-01 15:00:00+01', 30, '[{"time": "14:00", "title": "Setup", "speaker": "Berin S."}, {"time": "15:30", "title": "Optimization", "speaker": "Expert Joe"}]', '2026-04-26 15:16:32.774744+02', 'Workshop', 'pending');
INSERT INTO public.events (id, organizer_id, title, description, location, event_date, total_capacity, agenda_data, created_at, category, status) VALUES (3, 2, 'Student Networking Gala', 'Mix and mingle with industry leaders.', 'Grand Ballroom', '2024-12-20 19:00:00+01', 200, '[{"time": "18:00", "title": "Welcome Drinks", "speaker": "Admin"}]', '2026-04-26 15:16:32.774744+02', 'Networking', 'pending');
INSERT INTO public.events (id, organizer_id, title, description, location, event_date, total_capacity, agenda_data, created_at, category, status) VALUES (4, 2, 'AI & Machine Learning Conference', 'Explore cutting-edge AI trends with industry leaders and researchers.', 'Innovation Center', '2026-07-12 09:00:00+02', 300, '[{"time": "09:00", "title": "Keynote: AI Today", "speaker": "Dr. Elena Kovač"}, {"time": "11:00", "title": "ML in Production", "speaker": "Tom Bright"}]', '2026-06-04 11:28:28.463625+02', 'Technology', 'pending');
INSERT INTO public.events (id, organizer_id, title, description, location, event_date, total_capacity, agenda_data, created_at, category, status) VALUES (5, 2, 'Digital Marketing Bootcamp', 'Hands-on workshop covering SEO, social media strategy, and paid ads.', 'Room 101, Business Center', '2026-08-05 10:00:00+02', 40, '[{"time": "10:00", "title": "SEO Fundamentals", "speaker": "Sara Lund"}, {"time": "13:00", "title": "Paid Ads Deep Dive", "speaker": "Mark Wells"}]', '2026-06-04 11:28:28.463625+02', 'Workshop', 'pending');
INSERT INTO public.events (id, organizer_id, title, description, location, event_date, total_capacity, agenda_data, created_at, category, status) VALUES (6, 2, 'Jazz Night at the Grand', 'An evening of live jazz featuring local and international artists.', 'Grand Hotel Sarajevo', '2026-09-20 20:00:00+02', 180, '[{"time": "20:00", "title": "Opening Set", "speaker": "The Blue Note Trio"}, {"time": "22:00", "title": "Headliner", "speaker": "Sofia Ensemble"}]', '2026-06-04 11:28:28.463625+02', 'Music', 'pending');
INSERT INTO public.events (id, organizer_id, title, description, location, event_date, total_capacity, agenda_data, created_at, category, status) VALUES (7, 2, 'Startup Pitch Competition', 'Entrepreneurs pitch to a panel of investors for seed funding opportunities.', 'Startup Hub, Floor 3', '2026-10-03 14:00:00+02', 120, '[{"time": "14:00", "title": "Intro & Rules", "speaker": "Host"}, {"time": "15:00", "title": "Pitch Round 1", "speaker": "Various"}]', '2026-06-04 11:28:28.463625+02', 'Business', 'pending');
INSERT INTO public.events (id, organizer_id, title, description, location, event_date, total_capacity, agenda_data, created_at, category, status) VALUES (8, 2, 'Photography Masterclass', 'Learn composition, lighting, and post-processing from a professional photographer.', 'Art Studio 7', '2026-11-15 10:00:00+01', 25, '[{"time": "10:00", "title": "Composition Basics", "speaker": "Ines Halilović"}, {"time": "12:30", "title": "Lightroom Workflow", "speaker": "Ines Halilović"}]', '2026-06-04 11:28:28.463625+02', 'Arts', 'pending');
INSERT INTO public.events (id, organizer_id, title, description, location, event_date, total_capacity, agenda_data, created_at, category, status) VALUES (9, 2, 'Annual Sports & Wellness Expo', 'Discover the latest in sports tech, nutrition, and fitness with live demos.', 'City Sports Arena', '2026-12-06 08:00:00+01', 500, '[{"time": "08:00", "title": "Expo Opens", "speaker": "Admin"}, {"time": "10:00", "title": "Future of Fitness", "speaker": "Coach Rivera"}]', '2026-06-04 11:28:28.463625+02', 'Sports', 'pending');
INSERT INTO public.events (id, organizer_id, title, description, location, event_date, total_capacity, agenda_data, created_at, category, status) VALUES (10, 2, 'UX Design Intensive', 'Two-day intensive on user research, wireframing, and prototyping in Figma.', 'Design Lab, Tech Park', '2027-01-22 09:00:00+01', 35, '[{"time": "09:00", "title": "User Research Methods", "speaker": "Mia Chen"}, {"time": "14:00", "title": "Prototyping with Figma", "speaker": "Mia Chen"}]', '2026-06-04 11:28:28.463625+02', 'Workshop', 'pending');


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

INSERT INTO public.ticket_types (id, event_id, name, price, quantity_limit, tickets_sold) VALUES (1, 1, 'Standard Access', 0.00, 80, 2);
INSERT INTO public.ticket_types (id, event_id, name, price, quantity_limit, tickets_sold) VALUES (2, 1, 'VIP Backstage', 50.00, 20, 0);
INSERT INTO public.ticket_types (id, event_id, name, price, quantity_limit, tickets_sold) VALUES (3, 2, 'Workshop Pass', 10.00, 30, 1);
INSERT INTO public.ticket_types (id, event_id, name, price, quantity_limit, tickets_sold) VALUES (4, 3, 'Early Bird', 5.00, 50, 0);
INSERT INTO public.ticket_types (id, event_id, name, price, quantity_limit, tickets_sold) VALUES (5, 4, 'General Admission', 25.00, 200, 180);
INSERT INTO public.ticket_types (id, event_id, name, price, quantity_limit, tickets_sold) VALUES (6, 4, 'VIP Access', 75.00, 100, 95);
INSERT INTO public.ticket_types (id, event_id, name, price, quantity_limit, tickets_sold) VALUES (7, 5, 'Workshop Seat', 30.00, 40, 12);
INSERT INTO public.ticket_types (id, event_id, name, price, quantity_limit, tickets_sold) VALUES (8, 6, 'Standard Ticket', 15.00, 130, 45);
INSERT INTO public.ticket_types (id, event_id, name, price, quantity_limit, tickets_sold) VALUES (9, 6, 'VIP Table', 60.00, 50, 10);
INSERT INTO public.ticket_types (id, event_id, name, price, quantity_limit, tickets_sold) VALUES (10, 7, 'Attendee Pass', 0.00, 100, 68);
INSERT INTO public.ticket_types (id, event_id, name, price, quantity_limit, tickets_sold) VALUES (11, 7, 'Investor Pass', 150.00, 20, 17);
INSERT INTO public.ticket_types (id, event_id, name, price, quantity_limit, tickets_sold) VALUES (12, 8, 'Masterclass Seat', 80.00, 25, 22);
INSERT INTO public.ticket_types (id, event_id, name, price, quantity_limit, tickets_sold) VALUES (13, 9, 'Day Pass', 10.00, 400, 89);
INSERT INTO public.ticket_types (id, event_id, name, price, quantity_limit, tickets_sold) VALUES (14, 9, 'VIP Experience', 45.00, 100, 12);
INSERT INTO public.ticket_types (id, event_id, name, price, quantity_limit, tickets_sold) VALUES (15, 10, 'Bootcamp Seat', 120.00, 35, 5);


--
-- TOC entry 4972 (class 0 OID 24668)
-- Dependencies: 220
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.users (id, full_name, email, password_hash, role, created_at) VALUES (1, 'System Admin', 'admin@scanova.com', 'hashed_pass_123', 'admin', '2026-04-26 15:16:23.432641+02');
INSERT INTO public.users (id, full_name, email, password_hash, role, created_at) VALUES (2, 'Amina Brković', 'amina@organizer.com', 'hashed_pass_456', 'organizer', '2026-04-26 15:16:23.432641+02');
INSERT INTO public.users (id, full_name, email, password_hash, role, created_at) VALUES (5, 'John Smith', 'john.smith@scanova.com', '$2b$10$PFamvieF7RheeFy3zwWNeeJXuUtAPglMQI.Dg/g/f2gNyeM8hk3vm', 'admin', '2026-06-05 18:18:35.475693+02');
INSERT INTO public.users (id, full_name, email, password_hash, role, created_at) VALUES (7, 'Berin Surkovic', 'berin.surkovic@gmail.com', '$2b$10$OZyIqaArk.Aql.AUVyxZUuLbaGAhPP.zj4wXCW9gw.1yV019cZhoq', 'attendee', '2026-06-05 18:59:55.365383+02');


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

SELECT pg_catalog.setval('public.events_id_seq', 4, true);


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

SELECT pg_catalog.setval('public.ticket_types_id_seq', 4, true);


--
-- TOC entry 4996 (class 0 OID 0)
-- Dependencies: 219
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 7, true);


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


-- Completed on 2026-06-05 19:37:01

--
-- PostgreSQL database dump complete
--

\unrestrict 9BrwolI878Dez7v1EDqrq8KN28Mc5xUXEKpZyLySIybEGjb1Bhjo5IdxOfAbF8i

