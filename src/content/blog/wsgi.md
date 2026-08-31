---
title: "Understanding WSGI, Gunicorn, Flask, and Nginx — the intuitive way"
date: 2026-08-31
description: "A walkthrough building up the full picture of how a Python web app serves HTTP, starting from nothing but a Linux box and a socket."
image: "/images/blog/wsgi.svg"
---

A walkthrough building up the full picture of how a Python web app serves HTTP, starting from nothing but a Linux box and a socket.

## 1. What is WSGI?
You have a linux box, a process can open a TCP socket, bind to port 80, and accept connections. When a browser connects, 
raw bytes come in over that socket, literally text like:
```text
GET /users/42 HTTP/1.1
```

That's all the OS gives you: a byte stream.

**The naive version:** your Python script opens the socket, reads the bytes, parses the HTTP request line and headers by hand,
figures out the path, runs your logic, then writes back more bytes `(HTTP/1.1 200 OK\r\n...)` and closes the connection.

This works, but you've now hand-rolled an HTTP parser and welded your application logic directly to socket-handling code.
You couldn't swap your slow server for a fast one without rewriting your app. 
You need to keep an eye on HTTP specifications changes. Even with a little experience you can tell that it's not a great idea. 

**WSGI is the contract that splits that single blob into two halves** that don't need to know each other's internals:

* **The server half** (Gunicorn, uWSGI, Waitress) owns the socket. It accepts connections, parses raw HTTP bytes, 
handles concurrency, keep-alive, etc. The messy network-facing part.
* **The application half** (your Flask/Django app) owns the logic. It never touches a socket. It receives an already-parsed
request and returns a response.

WSGI (PEP 3333) is the thin interface between these two. The whole contract: the application is a **callable** that takes two arguments.

```python
def app(environ, start_response) -> [bytes]:
    ...
```
- `environ`: a plain dict the server fills in with the parsed request.
  `environ['PATH_INFO']` is `/users/42`, `environ['REQUEST_METHOD']` is `GET`,
    plus headers, query string, and a file-like `wsgi.input` for the body.
- `start_response`: a function the server hands you; you call it with the
  status line and header list.
- You `return` an iterable of bytes, that's the body.


The application implements it as something like this:
```python
def app(environ, start_response):
    start_response('200 OK', [('Content-Type', 'text/plain')])
    return [b'Hello']
```

The server calls this callable once per request, takes what you returned, and
writes the actual HTTP bytes back over the socket. Neither side knows the
other's implementation, so you can put Gunicorn in front of any WSGI app, or run
your app behind a different server, with zero code changes. That swappable seam
is the entire point.

**Sync vs async:** WSGI is synchronous, one request occupies a worker(explained later) until it
returns. The async equivalent is **ASGI** (FastAPI/Starlette, served by
`uvicorn`), which adds a coroutine-based interface for websockets and `async`
handlers. Same mental model: a contract splitting the socket-owner from the
logic-owner.

---

## 2. What is Gunicorn ?

First, let's make sure we are on same page. **WSGI isn't a process.**

WSGI is just the contract (the
"app is a callable taking `environ` and `start_response`" rule). The *process*
that holds the socket is **Gunicorn**, the WSGI server. Gunicorn is a running program; WSGI is just the shape of the function it calls.

Now picture one single process running this loop:

```
accept a connection → read bytes → call app() → write bytes → repeat
```

That handles exactly **one request at a time**. While `app()` waits on a
database query, the whole process is blocked and a second visitor just sits in
the queue. One process = one request in flight. That's the problem workers solve.

**Gunicorn's master + workers model:**

- The **master** process starts up and **binds the socket** to the port. That's
  almost all it does — it does *not* handle requests. It owns the socket and
  supervises.
- The master `fork()`s N **worker** processes (say 4). Via `fork()`, every
  worker inherits the *same* listening socket, so all workers share the one
  bound port.
- Each worker runs the accept-loop independently, calling `accept()` on the
  shared socket. The kernel guarantees only one worker gets any given incoming
  connection. So 4 workers = 4 requests handled simultaneously; a 5th request
  waits until a worker frees up.

**A worker *is* a full copy of (accept-loop + your app)**, running as its own OS
process, so multiple requests run in parallel.

### How a worker interacts with the app

The worker and your app run in the **same process**; no network, no
serialization, no message-passing between Gunicorn and your app. When each worker
boots, it **imports your module** (`myapp:app`), so your app object lives in that
worker's own memory. Then "calling the app" is just a normal Python function call:

```python
# roughly what each worker does, per request:
environ = parse_http(raw_bytes_from_socket)   # build the dict
body = app(environ, start_response)           # <-- just a function call
socket.write(status + headers + b"".join(body))
```

Two consequences worth internalizing:

- **Each worker has its own separate copy of your app.** A global variable or
  in-memory cache set in one worker is invisible to the others — different
  processes, different memory. Shared state has to live somewhere external (Redis,
  a DB).
- **Concurrency = number of workers** (for the default sync worker). 4 workers →
  4 simultaneous requests. A common starting rule is `2 × CPU cores + 1`. For
  more concurrency per worker you switch worker *type* (thread-based or async),
  but the sync one-request-per-worker model is the clearest to hold first.

---

## 3. What is Flask?

Flask is the thing that produces that `app` callable - the logic half.

You *could* write the raw WSGI callable by hand, but then every request you'd be
digging into `environ['PATH_INFO']`, matching it against strings, parsing the
query string, manually building status lines and headers. Flask is a library
that does all that grunt work for you.

```python
from flask import Flask
app = Flask(__name__)

@app.route('/users/<int:id>')
def get_user(id):
    return {'id': id, 'name': 'Vishal'}
```

That `app` object is the exact same `app` you point Gunicorn at
(recall Gunicorn imports `myapp:app`). When a Gunicorn worker calls `app(environ, start_response)`, Flask
takes over and does the work you'd otherwise do yourself:

- **Routing** — it reads `environ['PATH_INFO']` (`/users/42`) and figures out
  which of your functions matches. The `@app.route(...)` decorator registers
  "this path pattern → this function" in a table Flask consults per request. It
  even parses the `42` out of the URL and passes it as `id`.
- **Request object** — instead of reading the raw `environ` dict, Flask wraps it
  in a friendly `request` object (`request.args`, `request.json`,
  `request.headers`).
- **Response building** — you `return` a dict or string, and Flask converts it
  into the status line, headers, and bytes the WSGI contract demands. You never
  call `start_response` yourself.


## 4. Layering, bottom to top
**Gunicorn**(socket and workers) → the **WSGI contract** (the
calling convention) → **Flask** (turns that one raw callable into "a bunch of
small functions, each handling one route"). Flask is a *microframework* -- it does
routing and request/response wrapping and little else, leaving DB access, auth,
etc. to you or other libraries.

Flask ships with its own tiny dev server (`flask run` / `app.run()`) so you can
develop without Gunicorn, but that built-in server isn't meant for real traffic.
In production, you hand your Flask `app` to Gunicorn, like this:

```bash
gunicorn --workers 4 --bind 0.0.0.0:8000 myapp:app
```

## 5. What is NGINX ?
Instead of me defining what Nginx ("engine x") is, let's look at why we need it.

Well you don't strictly *need* it, Gunicorn serves HTTP directly. But on a real
public server nginx does the jobs Gunicorn is deliberately bad at. The theme is
**division of labor**: Gunicorn is optimized for running your Python; nginx is
optimized for the hostile, messy public internet.

```
public internet ── HTTPS ──▶ nginx ── plain HTTP ──▶ Gunicorn ──▶ workers ──▶ Flask
                          (edge/network)        (127.0.0.1:8000)
```


### 1. Serving static files
CSS, JS, images are just files on disk — no Python
needed. If Gunicorn serves them, every image request ties up a worker running
Python to copy a file. nginx serves files straight from disk, fast, without ever
bothering Gunicorn.

### 2. Absorbing slow clients
With sync workers, one worker = one
request, fully occupied until done. A client on bad mobile signal that takes 8
seconds to dribble in its bytes ties up a worker that whole time, doing no real
work. A handful of slow clients (accidental or the deliberate *Slowloris* attack)
can occupy all workers and take the site down. 

nginx fixes this by **buffering**. Built on an event loop, it holds thousands of
slow connections cheaply. It waits for the *complete* request, hands it to
Gunicorn in one fast local burst, takes the complete response instantly, then
dribbles it out to the slow client on its own time. Gunicorn workers only ever
see fast, complete, local requests.

### 3. TLS/HTTPS termination
nginx handles certificates and encryption in one place. 
Client talks HTTPS to nginx; nginx talks plain HTTP to Gunicorn on localhost.

### 4. Edge jobs generally
rate limits, blocking bad IPs, security headers, gzip, load-balancing, maintenance pages. 
All the public-facing concerns live in nginx, separate from your app.

### 5. Load balancing
"nginx" and "Gunicorn" can each be one process or many, and where they physically
sit is a separate decision from how balancing works.

**Small setup -- one machine.** nginx and Gunicorn on the same box. nginx listens
on 443, Gunicorn on `127.0.0.1:8000`, nginx forwards over localhost. Here nginx
isn't balancing across *machines* — and it doesn't even balance across workers:
it opens connections to `127.0.0.1:8000` and the **kernel** hands each to
whichever of the 4 workers is free (they share the bound socket). Worker-level
distribution is the kernel's job on a single box.

**Bigger setup -- separate machines.** You run Gunicorn on several machines (say 3
app servers, each with its own workers) and nginx on its own machine out front.
nginx forwards each public request to one of the app servers over the network.
*This* is where nginx does real load-balancing across machines.

```
                    ┌──▶ app-server-1  (Gunicorn + 4 workers)
internet ──▶ nginx ─┼──▶ app-server-2  (Gunicorn + 4 workers)
                    └──▶ app-server-3  (Gunicorn + 4 workers)
```

### When you can skip it
local development; internal services where something
else already handles TLS and traffic is trusted and fast (a load balancer, an API
gateway, or a platform like Heroku/Cloud Run that provides its own edge layer).
It's specifically the **exposed-to-the-raw-internet bare Linux box** that wants
nginx in front. nginx isn't the only choice for the role, Caddy (automatic HTTPS)
or a cloud load balancer fill the same slot. The *role* - an edge reverse proxy
is what matters.