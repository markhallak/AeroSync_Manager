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
1. Realtime Information Changes:

The website updates information automatically without manual page refreshes. This is essential for displaying up-to-date, reliable data, especially for time-sensitive content. The Supabase JS client facilitates real-time updates by monitoring database changes, enhancing the site's interactivity and responsiveness. On the backend, since the Supabase Python client doesn't support real-time listening, an alternative approach using a socket connection to the database was implemented to track updates, particularly in flight data.
3. Passwordless Signin:
A passwordless sign-in method has been introduced, allowing users to access the site either through their email or Google sign-in. For both new account creation and existing account access, a one-time-use verification link is sent to the registered email, streamlining the login or account verification process.
4. SMTP Server:
Due to Supabase's email server limitation, we decided to go with "Brevo" email service provider which allows us to offer 9,000 email every month, for free, forever.
