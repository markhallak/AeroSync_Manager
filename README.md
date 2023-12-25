# AeroSync Manager
  In today’s interconnected world, the aviation
  industry plays a vital role in global travel, the need
  for our software translates through the following:
  - Sharing flight information in an accurate and
  timely manner.
  - Enhancing passengers’ airport experience.
  - Facilitating travel
  - and much more!

# Features
1. Real-time Information Changes

The website updates information automatically without manual page refreshes. This is essential for displaying up-to-date, reliable data, especially for time-sensitive content. The Supabase JS client facilitates real-time updates by monitoring database changes, enhancing the site's interactivity and responsiveness. On the backend, since the Supabase Python client doesn't support real-time listening, an alternative approach using a socket connection to the database was implemented to track updates, particularly in flight data.

2. Flight Tracking

Users have the option to track any flight to stay informed about changes or cancellations. The system uses Pika, a direct implementation of the Advanced Message Queuing Protocol (AMQP), to efficiently send emails to recipients without heavily using system resources.

2. Passwordless Signin

A passwordless sign-in method has been introduced, allowing users to access the site either through their email or Google sign-in. For both new account creation and existing account access, a one-time-use verification link is sent to the registered email, streamlining the login or account verification process.

3. SMTP Server

Due to Supabase's email server limitation, "Brevo" email service provider (configurable) is being used allowing us to offer 9,000 verification emails every month, for free, forever.

4. Security

Passwordless sign-in methods enhance security compared to hashed password systems. Row Level Security Policies have been activated in the database for added protection. Data validation occurs on the backend, and a rate limit has been set for verification emails to guard against potential system-overloading attacks.

Other features include:
- Currency converter
- Weather information
- Booking flights, hotels and parking slots
- Showcasing popular events and deals

# Improvements to be made
- Work on handling errors more gracefully on the front end and keep the system working as best as possible.
- Validate the session every time the user uses the system.
- Validate the http request sender
- Handle cases where http requests fail to get sent to the server.
- Implement CSRF Tokens.
- Create friendly interfaces for the admin users to handle the data.
- Refactor the code into modules making it more possible to host such system on Vercel.

# Limitations
- Hard to host for free since the system uses multithreading in the backend(for the flask app, the email service, and the socket connection) and socket connections to listen to database changes.

# Frameworks & Libraries
  Flask, Pika, Supabase, Realtime, and Postgrest.

# Installation
  1. Clone this repo
  2. `pip install -r requirements.txt`
  3. Download RabbitMQ from [`bbitmq.com/install-windows.html#installer`](bbitmq.com/install-windows.html#installer) and make sure the service is running
  4. Download Erlang from [`https://www.erlang.org/downloads`](https://www.erlang.org/downloads)
  5. Run the `app.py` using the terminal
  6. Enjoy!
     
