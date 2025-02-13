import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')     // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-')   // Replace multiple - with single -
    .trim();                  // Trim - from start and end
}

export const COPY_TEXT =
`
Lecture 3: Application-Layer Protocols, HTTP - Key Points
Application-Layer Protocols
Purpose:
Enable applications on different devices to communicate.
Examples: HTTP, SMTP, DNS.
Two Architectures:
Client-Server:
Servers handle requests and are always powered on.
Clients initiate requests but do not communicate directly with other clients.
Peer-to-Peer (P2P):
Peers share equal responsibilities (e.g., BitTorrent, Skype).
Scalable but challenging due to churn, IP changes, and upload limitations.

HTTP (HyperText Transfer Protocol)
Overview:
Client-server protocol built on top of TCP.
Stateless: Each request is independent and self-contained.
Key Features:
Request:
Includes a method (e.g., GET, POST), headers, and an optional body.
Response:
Includes a status code (e.g., 200 OK, 404 Not Found), headers, and an optional body.
HTTP Transaction:
Client opens a TCP socket to the server.
Sends an HTTP request.
Server processes the request and sends a response.
Client reads and processes the response.

HTTP Methods and Status Codes
Methods:
GET: Retrieve data.
POST: Send data to the server.
PUT: Create/replace a resource.
DELETE: Remove a resource.
HEAD: Retrieve headers only.
Status Codes:
2xx: Success (e.g., 200 OK).
3xx: Redirection (e.g., 301 Moved Permanently).
4xx: Client errors (e.g., 404 Not Found).
5xx: Server errors (e.g., 500 Internal Server Error).

Cookies
Purpose:
Maintain user state across stateless HTTP requests.
Process:
Server sends a Set-Cookie header in the HTTP response.
Client stores the cookie locally and includes it in subsequent requests.
Server identifies the user using the cookie.
Uses:
Authentication, session tracking, personalization.
Security Concerns:
Vulnerable to impersonation attacks (e.g., CSRF).
Best practices include setting SameSite attributes to prevent misuse.

HTTP Evolution and REST APIs
Evolution:
HTTP/1.0 (1991): Basic document fetching.
HTTP/1.1 (1997): Keep-alive connections.
HTTP/2 (2014): Binary framing and pipelining.
HTTP/3 (2022): Built on QUIC for better performance.
REST APIs:
Use HTTP for client-server communication.
Enable interaction with services via structured requests (e.g., GET, POST).
Often return JSON data for programmatic use.

SMTP (Simple Mail Transfer Protocol)
Purpose:
Enables email transfer between servers using TCP (port 25).
Process:
Stateful communication where the server remembers past interactions.
Commands like MAIL FROM, RCPT TO, and DATA establish and send messages.
Differences from HTTP:
SMTP is stateful, while HTTP is stateless.


Lecture 4: Domain Name Service (DNS) - Key Points
DNS: The Internet's Directory Service
Goals of DNS:
Translate human-readable domain names to machine-readable IP addresses (e.g., northwestern.edu → 129.105.136.48).
Provide portability by allowing domain names to remain constant even as server IP addresses change.
Distributed and Hierarchical Design:
Decentralized structure for scalability and fault tolerance.
Hierarchical levels:
Root Servers: Manage top-level domains (TLDs) like .com, .edu.
TLD Servers: Direct queries to authoritative servers.
Authoritative Servers: Store mappings for specific domains (e.g., example.com).

How DNS Works
Iterative Querying:
Queries traverse the hierarchy:
Client contacts the root server.
Root server directs the client to the TLD server.
TLD server points to the authoritative server.
Authoritative server provides the requested IP address.
Caching:
Local DNS resolvers cache responses to reduce query times and network traffic.
Cached records have a TTL (Time to Live) after which they expire.

DNS Records
Types of Resource Records (RRs):
A: Maps domain names to IPv4 addresses.
AAAA: Maps domain names to IPv6 addresses.
CNAME: Canonical name alias for another domain.
MX: Mail exchange records for email routing.
PTR: Reverse lookup, mapping IP to domain name.
TXT: Key-value pairs for arbitrary data (e.g., SPF, DKIM).
SRV: Defines servers for specific services.
`