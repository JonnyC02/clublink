--
-- PostgreSQL database dump
--

-- Dumped from database version 17.2 (Debian 17.2-1.pgdg120+1)
-- Dumped by pg_dump version 17.2 (Debian 17.2-1.pgdg120+1)

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
-- Name: club_type_enum; Type: TYPE; Schema: public; Owner: ClubLinkDeveloper
--

CREATE TYPE public.club_type_enum AS ENUM (
    'Club',
    'Society'
);


ALTER TYPE public.club_type_enum OWNER TO "ClubLinkDeveloper";

--
-- Name: clubtype_enum_old; Type: TYPE; Schema: public; Owner: ClubLinkDeveloper
--

CREATE TYPE public.clubtype_enum_old AS ENUM (
    'Sports',
    'Society'
);


ALTER TYPE public.clubtype_enum_old OWNER TO "ClubLinkDeveloper";

--
-- Name: member_status_enum; Type: TYPE; Schema: public; Owner: ClubLinkDeveloper
--

CREATE TYPE public.member_status_enum AS ENUM (
    'Active',
    'Pending',
    'Expired'
);


ALTER TYPE public.member_status_enum OWNER TO "ClubLinkDeveloper";

--
-- Name: member_type_enum; Type: TYPE; Schema: public; Owner: ClubLinkDeveloper
--

CREATE TYPE public.member_type_enum AS ENUM (
    'Member',
    'Committee'
);


ALTER TYPE public.member_type_enum OWNER TO "ClubLinkDeveloper";

--
-- Name: member_type_num; Type: TYPE; Schema: public; Owner: ClubLinkDeveloper
--

CREATE TYPE public.member_type_num AS ENUM (
    'Member',
    'Committee'
);


ALTER TYPE public.member_type_num OWNER TO "ClubLinkDeveloper";

--
-- Name: request_type_enum; Type: TYPE; Schema: public; Owner: ClubLinkDeveloper
--

CREATE TYPE public.request_type_enum AS ENUM (
    'Approved',
    'Pending',
    'Denied',
    'Cancelled'
);


ALTER TYPE public.request_type_enum OWNER TO "ClubLinkDeveloper";

--
-- Name: ticket_expiry_enum; Type: TYPE; Schema: public; Owner: ClubLinkDeveloper
--

CREATE TYPE public.ticket_expiry_enum AS ENUM (
    'Academic',
    'Yearly'
);


ALTER TYPE public.ticket_expiry_enum OWNER TO "ClubLinkDeveloper";

--
-- Name: ticket_flag_enum; Type: TYPE; Schema: public; Owner: ClubLinkDeveloper
--

CREATE TYPE public.ticket_flag_enum AS ENUM (
    'Student',
    'Associate'
);


ALTER TYPE public.ticket_flag_enum OWNER TO "ClubLinkDeveloper";

--
-- Name: ticket_type_enum; Type: TYPE; Schema: public; Owner: ClubLinkDeveloper
--

CREATE TYPE public.ticket_type_enum AS ENUM (
    'Membership',
    'Event'
);


ALTER TYPE public.ticket_type_enum OWNER TO "ClubLinkDeveloper";

--
-- Name: transaction_status_enum; Type: TYPE; Schema: public; Owner: ClubLinkDeveloper
--

CREATE TYPE public.transaction_status_enum AS ENUM (
    'processing',
    'succeeded',
    'failed',
    'cancelled',
    'refunded',
    'disputed'
);


ALTER TYPE public.transaction_status_enum OWNER TO "ClubLinkDeveloper";

--
-- Name: transaction_type_enum; Type: TYPE; Schema: public; Owner: ClubLinkDeveloper
--

CREATE TYPE public.transaction_type_enum AS ENUM (
    'Card',
    'Cash'
);


ALTER TYPE public.transaction_type_enum OWNER TO "ClubLinkDeveloper";

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: auditlog; Type: TABLE; Schema: public; Owner: ClubLinkDeveloper
--

CREATE TABLE public.auditlog (
    id integer NOT NULL,
    clubid integer,
    memberid integer,
    userid integer,
    actiontype character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.auditlog OWNER TO "ClubLinkDeveloper";

--
-- Name: auditlog_id_seq; Type: SEQUENCE; Schema: public; Owner: ClubLinkDeveloper
--

CREATE SEQUENCE public.auditlog_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.auditlog_id_seq OWNER TO "ClubLinkDeveloper";

--
-- Name: auditlog_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ClubLinkDeveloper
--

ALTER SEQUENCE public.auditlog_id_seq OWNED BY public.auditlog.id;


--
-- Name: clubs; Type: TABLE; Schema: public; Owner: ClubLinkDeveloper
--

CREATE TABLE public.clubs (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(100),
    description text,
    shortdescription character varying(255),
    image text,
    university character varying(5),
    longitude numeric(9,6),
    latitude numeric(9,6),
    clubtype public.club_type_enum DEFAULT 'Society'::public.club_type_enum,
    headerimage text,
    ratio numeric(6,4)
);


ALTER TABLE public.clubs OWNER TO "ClubLinkDeveloper";

--
-- Name: clubs_id_seq; Type: SEQUENCE; Schema: public; Owner: ClubLinkDeveloper
--

CREATE SEQUENCE public.clubs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.clubs_id_seq OWNER TO "ClubLinkDeveloper";

--
-- Name: clubs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ClubLinkDeveloper
--

ALTER SEQUENCE public.clubs_id_seq OWNED BY public.clubs.id;


--
-- Name: events; Type: TABLE; Schema: public; Owner: ClubLinkDeveloper
--

CREATE TABLE public.events (
    id integer NOT NULL,
    clubid integer,
    name character varying(100) NOT NULL,
    date timestamp without time zone,
    latitude numeric(9,6),
    longitude numeric(9,6),
    "time" timestamp without time zone
);


ALTER TABLE public.events OWNER TO "ClubLinkDeveloper";

--
-- Name: events_id_seq; Type: SEQUENCE; Schema: public; Owner: ClubLinkDeveloper
--

CREATE SEQUENCE public.events_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.events_id_seq OWNER TO "ClubLinkDeveloper";

--
-- Name: events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ClubLinkDeveloper
--

ALTER SEQUENCE public.events_id_seq OWNED BY public.events.id;


--
-- Name: memberlist; Type: TABLE; Schema: public; Owner: ClubLinkDeveloper
--

CREATE TABLE public.memberlist (
    id integer NOT NULL,
    memberid integer,
    clubid integer,
    membertype public.member_type_enum,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    status public.member_status_enum DEFAULT 'Pending'::public.member_status_enum
);


ALTER TABLE public.memberlist OWNER TO "ClubLinkDeveloper";

--
-- Name: memberlist_id_seq; Type: SEQUENCE; Schema: public; Owner: ClubLinkDeveloper
--

CREATE SEQUENCE public.memberlist_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.memberlist_id_seq OWNER TO "ClubLinkDeveloper";

--
-- Name: memberlist_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ClubLinkDeveloper
--

ALTER SEQUENCE public.memberlist_id_seq OWNED BY public.memberlist.id;


--
-- Name: requests; Type: TABLE; Schema: public; Owner: ClubLinkDeveloper
--

CREATE TABLE public.requests (
    id integer NOT NULL,
    clubid integer,
    memberid integer,
    status public.request_type_enum DEFAULT 'Pending'::public.request_type_enum,
    approverid integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone
);


ALTER TABLE public.requests OWNER TO "ClubLinkDeveloper";

--
-- Name: requests_id_seq; Type: SEQUENCE; Schema: public; Owner: ClubLinkDeveloper
--

CREATE SEQUENCE public.requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.requests_id_seq OWNER TO "ClubLinkDeveloper";

--
-- Name: requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ClubLinkDeveloper
--

ALTER SEQUENCE public.requests_id_seq OWNED BY public.requests.id;


--
-- Name: tickets; Type: TABLE; Schema: public; Owner: ClubLinkDeveloper
--

CREATE TABLE public.tickets (
    id integer NOT NULL,
    eventid integer,
    name character varying(100) NOT NULL,
    price numeric(10,2) NOT NULL,
    tickettype public.ticket_type_enum DEFAULT 'Event'::public.ticket_type_enum,
    clubid integer,
    ticketflag public.ticket_flag_enum DEFAULT 'Associate'::public.ticket_flag_enum,
    ticketexpiry public.ticket_expiry_enum DEFAULT 'Yearly'::public.ticket_expiry_enum,
    cashenabled boolean DEFAULT true,
    date character varying
);


ALTER TABLE public.tickets OWNER TO "ClubLinkDeveloper";

--
-- Name: tickets_id_seq; Type: SEQUENCE; Schema: public; Owner: ClubLinkDeveloper
--

CREATE SEQUENCE public.tickets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tickets_id_seq OWNER TO "ClubLinkDeveloper";

--
-- Name: tickets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ClubLinkDeveloper
--

ALTER SEQUENCE public.tickets_id_seq OWNED BY public.tickets.id;


--
-- Name: transactions; Type: TABLE; Schema: public; Owner: ClubLinkDeveloper
--

CREATE TABLE public.transactions (
    id integer NOT NULL,
    memberid integer,
    ticketid integer,
    amount numeric(5,2),
    status character varying(100),
    type public.transaction_type_enum,
    "time" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone
);


ALTER TABLE public.transactions OWNER TO "ClubLinkDeveloper";

--
-- Name: transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: ClubLinkDeveloper
--

CREATE SEQUENCE public.transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.transactions_id_seq OWNER TO "ClubLinkDeveloper";

--
-- Name: transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ClubLinkDeveloper
--

ALTER SEQUENCE public.transactions_id_seq OWNED BY public.transactions.id;


--
-- Name: universities; Type: TABLE; Schema: public; Owner: ClubLinkDeveloper
--

CREATE TABLE public.universities (
    id integer NOT NULL,
    acronym character varying(5) NOT NULL,
    name character varying(100) NOT NULL,
    superadminids json NOT NULL,
    email character varying(255) NOT NULL,
    image text,
    studentverification character varying(30)
);


ALTER TABLE public.universities OWNER TO "ClubLinkDeveloper";

--
-- Name: universities_id_seq; Type: SEQUENCE; Schema: public; Owner: ClubLinkDeveloper
--

CREATE SEQUENCE public.universities_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.universities_id_seq OWNER TO "ClubLinkDeveloper";

--
-- Name: universities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ClubLinkDeveloper
--

ALTER SEQUENCE public.universities_id_seq OWNED BY public.universities.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: ClubLinkDeveloper
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    password character varying(255) NOT NULL,
    isactive boolean DEFAULT false,
    isstudent boolean DEFAULT false,
    studentnumber character varying(10),
    university character varying(50),
    issuperadmin boolean DEFAULT false,
    verifiedstudent boolean
);


ALTER TABLE public.users OWNER TO "ClubLinkDeveloper";

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: ClubLinkDeveloper
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO "ClubLinkDeveloper";

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ClubLinkDeveloper
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: auditlog id; Type: DEFAULT; Schema: public; Owner: ClubLinkDeveloper
--

ALTER TABLE ONLY public.auditlog ALTER COLUMN id SET DEFAULT nextval('public.auditlog_id_seq'::regclass);


--
-- Name: clubs id; Type: DEFAULT; Schema: public; Owner: ClubLinkDeveloper
--

ALTER TABLE ONLY public.clubs ALTER COLUMN id SET DEFAULT nextval('public.clubs_id_seq'::regclass);


--
-- Name: events id; Type: DEFAULT; Schema: public; Owner: ClubLinkDeveloper
--

ALTER TABLE ONLY public.events ALTER COLUMN id SET DEFAULT nextval('public.events_id_seq'::regclass);


--
-- Name: memberlist id; Type: DEFAULT; Schema: public; Owner: ClubLinkDeveloper
--

ALTER TABLE ONLY public.memberlist ALTER COLUMN id SET DEFAULT nextval('public.memberlist_id_seq'::regclass);


--
-- Name: requests id; Type: DEFAULT; Schema: public; Owner: ClubLinkDeveloper
--

ALTER TABLE ONLY public.requests ALTER COLUMN id SET DEFAULT nextval('public.requests_id_seq'::regclass);


--
-- Name: tickets id; Type: DEFAULT; Schema: public; Owner: ClubLinkDeveloper
--

ALTER TABLE ONLY public.tickets ALTER COLUMN id SET DEFAULT nextval('public.tickets_id_seq'::regclass);


--
-- Name: transactions id; Type: DEFAULT; Schema: public; Owner: ClubLinkDeveloper
--

ALTER TABLE ONLY public.transactions ALTER COLUMN id SET DEFAULT nextval('public.transactions_id_seq'::regclass);


--
-- Name: universities id; Type: DEFAULT; Schema: public; Owner: ClubLinkDeveloper
--

ALTER TABLE ONLY public.universities ALTER COLUMN id SET DEFAULT nextval('public.universities_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: ClubLinkDeveloper
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: auditlog; Type: TABLE DATA; Schema: public; Owner: ClubLinkDeveloper
--

COPY public.auditlog (id, clubid, memberid, userid, actiontype, created_at) FROM stdin;
3	1	2	2	APPROVE	2025-01-16 00:12:35.660828
4	1	2	2	APPROVE	2025-01-16 00:33:35.060321
5	1	\N	2	Edit Club Details	2025-01-17 14:11:30.571752
6	1	\N	2	Edit Club Details	2025-01-17 14:11:46.476444
7	1	13	2	activate membership	2025-02-03 14:33:34.07631
8	1	16	2	activate membership	2025-02-06 14:25:27.498545
11	1	2	\N	Edited Tickets	2025-02-07 15:54:55.142634
12	1	\N	2	Edit Club Details	2025-02-07 16:00:33.407699
13	1	2	\N	Edited Tickets	2025-02-19 14:22:20.751925
14	1	2	\N	Edited Tickets	2025-02-20 14:56:14.535693
15	1	2	\N	Edited Tickets	2025-02-20 15:03:20.28037
16	1	2	\N	Edited Tickets	2025-02-20 15:05:43.74687
17	1	2	13	Activate Membership	2025-02-24 14:26:49.246003
18	1	2	\N	Edited Tickets	2025-03-03 11:54:52.297609
19	1	2	16	Expire Membership	2025-03-05 11:08:23.540525
20	1	2	13	Activate Membership	2025-03-05 11:08:27.312282
21	1	2	13	Expire Membership	2025-03-05 11:25:28.322562
22	1	2	13	Activate Membership	2025-03-05 11:25:31.941945
23	1	2	13	Expire Membership	2025-03-05 12:06:25.190022
24	1	\N	13	Activate Membership	2025-03-05 16:15:43.855069
\.


--
-- Data for Name: clubs; Type: TABLE DATA; Schema: public; Owner: ClubLinkDeveloper
--

COPY public.clubs (id, name, email, description, shortdescription, image, university, longitude, latitude, clubtype, headerimage, ratio) FROM stdin;
3	Queen's Docs	docs@qub.ac.uk	The society for the Doctors and medics of Queen's University Belfast	Doctors of Queen's	https://club-images-dev.s3.us-east-1.amazonaws.com/doctor.jpg	QUB	\N	\N	Society	\N	\N
2	Queen's Computing Society	qcs@qub.ac.uk	\N	Test Value	https://club-images-dev.s3.us-east-1.amazonaws.com/qcs.jpg		\N	\N	Society	\N	\N
1	Queen's Fencing Club	fencing@qub.ac.uk	A 3 weapon club offering the sport of Olympic Fencing at Queen's University Belfast, we train 3 nights a week in the PEC and welcome beginners at all times of the year TEST	Olympic Fencing @ QUB	https://club-images-dev.s3.us-east-1.amazonaws.com/clubs/1/1737114512351_Blank diagram.webp	QUB	\N	\N	Club	https://club-images-dev.s3.us-east-1.amazonaws.com/clubs/1/1737123105539_fencing.webp	0.5000
\.


--
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: ClubLinkDeveloper
--

COPY public.events (id, clubid, name, date, latitude, longitude, "time") FROM stdin;
1	1	Fencing Membership	\N	\N	\N	\N
\.


--
-- Data for Name: memberlist; Type: TABLE DATA; Schema: public; Owner: ClubLinkDeveloper
--

COPY public.memberlist (id, memberid, clubid, membertype, created_at, status) FROM stdin;
1	2	1	Committee	2025-01-05 01:29:54.956305	Active
9	16	1	\N	2025-02-06 14:25:06.753143	Expired
26	13	1	\N	2025-03-03 13:38:58.946464	Active
\.


--
-- Data for Name: requests; Type: TABLE DATA; Schema: public; Owner: ClubLinkDeveloper
--

COPY public.requests (id, clubid, memberid, status, approverid, created_at, updated_at) FROM stdin;
3	1	3	Denied	2	2025-01-08 13:10:06.866955	2025-01-08 14:01:45.985
4	1	3	Approved	2	2025-01-08 14:05:39.193853	2025-01-08 14:05:56.75
5	1	3	Approved	2	2025-01-08 14:33:58.856675	2025-01-08 14:34:11.059
6	1	3	Approved	2	2025-01-10 11:25:22.656333	2025-01-10 11:25:43.117
9	1	13	Approved	2	2025-01-10 12:10:59.108758	2025-01-10 15:36:30.796
\.


--
-- Data for Name: tickets; Type: TABLE DATA; Schema: public; Owner: ClubLinkDeveloper
--

COPY public.tickets (id, eventid, name, price, tickettype, clubid, ticketflag, ticketexpiry, cashenabled, date) FROM stdin;
2	1	Student Membership	9.99	Membership	1	Student	Yearly	t	2025-12-27
1	1	Associate Membership	14.99	Membership	1	Associate	Academic	t	2028-01-16
\.


--
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: ClubLinkDeveloper
--

COPY public.transactions (id, memberid, ticketid, amount, status, type, "time", updated_at) FROM stdin;
1	2	1	\N	\N	\N	2025-03-05 15:14:01.811678	\N
2	2	1	\N	\N	\N	2025-03-05 15:14:01.811678	\N
3	2	1	\N	\N	\N	2025-03-05 15:14:01.811678	\N
4	2	1	\N	\N	\N	2025-03-05 15:14:01.811678	\N
5	2	1	\N	\N	\N	2025-03-05 15:14:01.811678	\N
6	2	1	\N	\N	\N	2025-03-05 15:14:01.811678	\N
7	2	1	\N	\N	\N	2025-03-05 15:14:01.811678	\N
8	2	1	\N	\N	\N	2025-03-05 15:14:01.811678	\N
9	2	1	\N	\N	\N	2025-03-05 15:14:01.811678	\N
10	2	1	\N	\N	\N	2025-03-05 15:14:01.811678	\N
11	2	1	\N	\N	\N	2025-03-05 15:14:01.811678	\N
12	2	1	\N	\N	\N	2025-03-05 15:14:01.811678	\N
13	2	1	\N	\N	\N	2025-03-05 15:14:01.811678	\N
14	2	1	\N	\N	\N	2025-03-05 15:14:01.811678	\N
15	2	1	\N	\N	\N	2025-03-05 15:14:01.811678	\N
16	2	1	\N	\N	\N	2025-03-05 15:14:01.811678	\N
17	2	1	\N	\N	\N	2025-03-05 15:14:01.811678	\N
18	2	1	\N	\N	\N	2025-03-05 15:14:01.811678	\N
19	2	1	\N	\N	\N	2025-03-05 15:14:01.811678	\N
20	2	1	\N	\N	\N	2025-03-05 15:14:01.811678	\N
21	2	1	\N	\N	\N	2025-03-05 15:14:01.811678	\N
22	2	1	\N	\N	\N	2025-03-05 15:14:01.811678	\N
23	2	1	\N	\N	\N	2025-03-05 15:14:01.811678	\N
24	2	1	\N	\N	\N	2025-03-05 15:14:01.811678	\N
25	2	1	\N	\N	\N	2025-03-05 15:14:01.811678	\N
26	2	1	\N	\N	\N	2025-03-05 15:14:01.811678	\N
27	2	1	\N	\N	\N	2025-03-05 15:14:01.811678	\N
28	2	1	\N	\N	\N	2025-03-05 15:14:01.811678	\N
29	2	1	\N	\N	\N	2025-03-05 15:14:01.811678	\N
30	2	1	\N	\N	\N	2025-03-05 15:14:01.811678	\N
31	2	1	\N	\N	\N	2025-03-05 15:14:01.811678	\N
32	13	2	\N	\N	\N	2025-03-05 15:14:01.811678	\N
33	13	2	\N	\N	\N	2025-03-05 15:14:01.811678	\N
34	13	2	\N	\N	\N	2025-03-05 15:14:01.811678	\N
35	13	2	\N	succeeded	\N	2025-03-05 15:15:33.601823	2025-03-05 15:15:37.17
36	13	2	\N	succeeded	\N	2025-03-05 15:16:45.771675	2025-03-05 15:16:48.158
37	13	2	\N	succeeded	\N	2025-03-05 15:19:34.360437	2025-03-05 15:19:36.847
38	13	2	\N	succeeded	\N	2025-03-05 15:21:43.562639	2025-03-05 15:21:46.081
39	13	2	\N	succeeded	\N	2025-03-05 15:28:10.260473	2025-03-05 15:28:12.677
40	13	2	\N	succeeded	\N	2025-03-05 15:30:58.577233	2025-03-05 15:31:01.049
41	13	2	\N	succeeded	\N	2025-03-05 15:36:52.360896	2025-03-05 15:36:55.677
42	13	2	\N	succeeded	\N	2025-03-05 15:38:22.436567	2025-03-05 15:38:24.898
43	13	2	\N	requires_payment_method	\N	2025-03-05 15:48:05.478788	2025-03-05 15:48:06.033
44	13	2	\N	requires_payment_method	\N	2025-03-05 15:49:18.262041	2025-03-05 15:49:18.792
45	13	2	\N	requires_payment_method	\N	2025-03-05 15:50:06.690838	2025-03-05 15:50:07.537
46	13	2	\N	requires_payment_method	\N	2025-03-05 15:50:49.031628	2025-03-05 15:50:49.602
47	13	2	9.99	requires_payment_method	Card	2025-03-05 16:14:45.746875	2025-03-05 16:14:46.315
48	13	2	9.99	requires_payment_method	Card	2025-03-05 16:15:23.314847	2025-03-05 16:15:23.876
49	13	2	9.99	succeeded	Card	2025-03-05 16:15:41.572885	2025-03-05 16:15:43.86
\.


--
-- Data for Name: universities; Type: TABLE DATA; Schema: public; Owner: ClubLinkDeveloper
--

COPY public.universities (id, acronym, name, superadminids, email, image, studentverification) FROM stdin;
2	QUB	Queen's University Belfast	[]	contact@qub.ac.uk	\N	@ads.qub.ac.uk
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: ClubLinkDeveloper
--

COPY public.users (id, name, email, password, isactive, isstudent, studentnumber, university, issuperadmin, verifiedstudent) FROM stdin;
3	Test User	test@example.com	$2a$10$o8fo.o8VyaDYAoqk3NtqlOiNewyxnLi22YIcKb.eJmhO7zYMECqqS	t	f	\N	\N	f	\N
15	Jonny	jconnery02@qub.ac.uk	$2a$10$SN3aPWY5FXegfuqoil2bIuEVVPKpmRcMj25QeT1KzZzSer9zRqL2O	t	f	40327976	QUB	f	\N
16	Kevin Stinks	test45@example.com	$2a$10$C4FSjRGVyxy4YFlFQ5ZS9eWiPp8l.85hV6MuNo/NEZqacgQq8/OAG	t	f	40327977	QUB	f	\N
13	Test User	test2@example.com	$2a$10$dJpRRNwU97.LnED362LNkO4bPxf97sIZfnfcBqxJa/vcgXMFKWuqa	t	f	40327971	\N	f	\N
2	Jonny C	conneryjonathan@gmail.com	$2a$10$mOrkTHQTw.8DVw/fuBFPn.oB7js/mNkRbBpMEUApONFVINOm9CGK2	t	f	\N	\N	f	\N
\.


--
-- Name: auditlog_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ClubLinkDeveloper
--

SELECT pg_catalog.setval('public.auditlog_id_seq', 24, true);


--
-- Name: clubs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ClubLinkDeveloper
--

SELECT pg_catalog.setval('public.clubs_id_seq', 3, true);


--
-- Name: events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ClubLinkDeveloper
--

SELECT pg_catalog.setval('public.events_id_seq', 1, true);


--
-- Name: memberlist_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ClubLinkDeveloper
--

SELECT pg_catalog.setval('public.memberlist_id_seq', 26, true);


--
-- Name: requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ClubLinkDeveloper
--

SELECT pg_catalog.setval('public.requests_id_seq', 9, true);


--
-- Name: tickets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ClubLinkDeveloper
--

SELECT pg_catalog.setval('public.tickets_id_seq', 2, true);


--
-- Name: transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ClubLinkDeveloper
--

SELECT pg_catalog.setval('public.transactions_id_seq', 49, true);


--
-- Name: universities_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ClubLinkDeveloper
--

SELECT pg_catalog.setval('public.universities_id_seq', 2, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ClubLinkDeveloper
--

SELECT pg_catalog.setval('public.users_id_seq', 16, true);


--
-- Name: auditlog auditlog_pkey; Type: CONSTRAINT; Schema: public; Owner: ClubLinkDeveloper
--

ALTER TABLE ONLY public.auditlog
    ADD CONSTRAINT auditlog_pkey PRIMARY KEY (id);


--
-- Name: clubs clubs_email_key; Type: CONSTRAINT; Schema: public; Owner: ClubLinkDeveloper
--

ALTER TABLE ONLY public.clubs
    ADD CONSTRAINT clubs_email_key UNIQUE (email);


--
-- Name: clubs clubs_pkey; Type: CONSTRAINT; Schema: public; Owner: ClubLinkDeveloper
--

ALTER TABLE ONLY public.clubs
    ADD CONSTRAINT clubs_pkey PRIMARY KEY (id);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: ClubLinkDeveloper
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: memberlist memberlist_pkey; Type: CONSTRAINT; Schema: public; Owner: ClubLinkDeveloper
--

ALTER TABLE ONLY public.memberlist
    ADD CONSTRAINT memberlist_pkey PRIMARY KEY (id);


--
-- Name: requests requests_pkey; Type: CONSTRAINT; Schema: public; Owner: ClubLinkDeveloper
--

ALTER TABLE ONLY public.requests
    ADD CONSTRAINT requests_pkey PRIMARY KEY (id);


--
-- Name: tickets tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: ClubLinkDeveloper
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_pkey PRIMARY KEY (id);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: ClubLinkDeveloper
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- Name: universities universities_acronym_key; Type: CONSTRAINT; Schema: public; Owner: ClubLinkDeveloper
--

ALTER TABLE ONLY public.universities
    ADD CONSTRAINT universities_acronym_key UNIQUE (acronym);


--
-- Name: universities universities_email_key; Type: CONSTRAINT; Schema: public; Owner: ClubLinkDeveloper
--

ALTER TABLE ONLY public.universities
    ADD CONSTRAINT universities_email_key UNIQUE (email);


--
-- Name: universities universities_name_key; Type: CONSTRAINT; Schema: public; Owner: ClubLinkDeveloper
--

ALTER TABLE ONLY public.universities
    ADD CONSTRAINT universities_name_key UNIQUE (name);


--
-- Name: universities universities_pkey; Type: CONSTRAINT; Schema: public; Owner: ClubLinkDeveloper
--

ALTER TABLE ONLY public.universities
    ADD CONSTRAINT universities_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: ClubLinkDeveloper
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: ClubLinkDeveloper
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: auditlog auditlog_clubid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ClubLinkDeveloper
--

ALTER TABLE ONLY public.auditlog
    ADD CONSTRAINT auditlog_clubid_fkey FOREIGN KEY (clubid) REFERENCES public.clubs(id) ON DELETE CASCADE;


--
-- Name: auditlog auditlog_memberid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ClubLinkDeveloper
--

ALTER TABLE ONLY public.auditlog
    ADD CONSTRAINT auditlog_memberid_fkey FOREIGN KEY (memberid) REFERENCES public.users(id);


--
-- Name: auditlog auditlog_userid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ClubLinkDeveloper
--

ALTER TABLE ONLY public.auditlog
    ADD CONSTRAINT auditlog_userid_fkey FOREIGN KEY (userid) REFERENCES public.users(id);


--
-- Name: events events_clubid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ClubLinkDeveloper
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_clubid_fkey FOREIGN KEY (clubid) REFERENCES public.clubs(id) ON DELETE CASCADE;


--
-- Name: memberlist memberlist_clubid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ClubLinkDeveloper
--

ALTER TABLE ONLY public.memberlist
    ADD CONSTRAINT memberlist_clubid_fkey FOREIGN KEY (clubid) REFERENCES public.clubs(id) ON DELETE CASCADE;


--
-- Name: memberlist memberlist_memberid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ClubLinkDeveloper
--

ALTER TABLE ONLY public.memberlist
    ADD CONSTRAINT memberlist_memberid_fkey FOREIGN KEY (memberid) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: requests requests_approverid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ClubLinkDeveloper
--

ALTER TABLE ONLY public.requests
    ADD CONSTRAINT requests_approverid_fkey FOREIGN KEY (approverid) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: requests requests_clubid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ClubLinkDeveloper
--

ALTER TABLE ONLY public.requests
    ADD CONSTRAINT requests_clubid_fkey FOREIGN KEY (clubid) REFERENCES public.clubs(id) ON DELETE CASCADE;


--
-- Name: requests requests_memberid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ClubLinkDeveloper
--

ALTER TABLE ONLY public.requests
    ADD CONSTRAINT requests_memberid_fkey FOREIGN KEY (memberid) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: tickets tickets_clubid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ClubLinkDeveloper
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_clubid_fkey FOREIGN KEY (clubid) REFERENCES public.clubs(id);


--
-- Name: transactions transactions_memberid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ClubLinkDeveloper
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_memberid_fkey FOREIGN KEY (memberid) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

