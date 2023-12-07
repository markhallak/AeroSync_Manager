import asyncio
import json
import logging
import os
import smtplib
from threading import Thread

import pika
from flask import Flask, render_template, request, redirect, session, jsonify, send_from_directory
from postgrest.types import CountMethod
from realtime.connection import Socket
from supabase import create_client
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZi" \
               "I6InBmd255eG1teGd5ZGtvaHlxcnRvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdC" \
               "I6MTY5OTcxODk2MywiZXhwIjoyMDE1Mjk0OTYzfQ.kwP3iq4l864G5fVXaFmMe33DsFrAgCebgeViDNKITp8"
SUPABASE_URL = "https://pfwnyxmmxgydkohyqrto.supabase.co"
SUPABASE_ID = "pfwnyxmmxgydkohyqrto"
app = Flask(__name__, template_folder="templates", static_folder="static")
app.secret_key = "akCFjVK8q+jiyAmayEDpabiUNp/ZcPfuA5Tdjmdprdjn/Ke51oJY0C92oHdDVXrtcf83e1357eefb8bdf1542850d66d8007d6" \
                 "20e4050b5715dc83f4a921d36ce9ce47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e"
app.config["SESSION_PERMANENT"] = True

try:
    client = create_client(SUPABASE_URL, SUPABASE_KEY)
except Exception as e:
    logging.exception("Cannot create client. ERROR:" + str(e))


@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static'),
                               'images/favicon.ico', mimetype='images/vnd.microsoft.icon')

@app.route('/flightInfo')
def info():
    return render_template('flight_info.html')


@app.route('/checkIfUserIsLoggedIn')
def check_sign_in():
    if 'accessToken' in session:
        return jsonify(email=session['email']), 200
    else:
        return 'User is not signed in', 412


@app.route('/addItemWishlist', methods=['POST'])
def addItemWishList():
    if 'email' in session:
        try:
            client.table('UserWishlist').insert(
                {"user_email": session['email'], "item_id": request.json.get('productID')}).execute()
        except Exception as E:
            logging.error("Cannot add to Wishlist. " + str(E))
            return 'Cannot add to Wishlist', 413

        return 'Added to Wishlist', 205
    else:
        return 'Cannot add to Wishlist', 413


@app.route('/removeItemWishlist', methods=['POST'])
def removeItemWishList():
    if 'email' in session:
        try:
            client.table('UserWishlist').delete().match(
                {"user_email": session['email'], "item_id": request.json.get('productID')}).execute()
        except Exception as E:
            logging.error("Cannot remove from Wishlist. " + str(E))
            return 'Cannot remove from Wishlist', 414

        return 'Removed from Wishlist', 206
    else:
        return 'Cannot remove from Wishlist', 414


@app.route('/login')
def login():
    return render_template('login.html')

@app.route('/logout')
def logout():
    if "email" in session:
        session.pop("email")
        print("LOGGED OUT")
        return redirect("/")
    else:
        return redirect("/login")


@app.route('/createAccount')
def signup():
    return render_template('signup.html')


@app.route('/auth/createAccount', methods=['GET', 'POST'])
def authCreateAccount():
    data = request.json
    username = str(data.get('username'))

    if 'email' in session:
        try:
            client.table('User').insert({"username": username, "email": str(session['email'])}).execute()
        except Exception as E:
            logging.exception("Cannot insert data to the database" + str(E))
            return "Cannot insert data to the database", 406

    return "Account created successfully", 201


@app.route('/signin', methods=['GET', 'POST'])
def authEmail():
    if request.method == 'POST':
        email = request.form.get('email-input')
        redirect_uri = request.url_root + 'auth/signin'

        try:
            client.auth.sign_in_with_otp({
                "email": email,
                "options": {
                    "email_redirect_to": redirect_uri
                }
            })
        except Exception as E:
            logging.exception("Problem with Signin with email otp. ERROR:" + str(E))
            return "Problem with Signin with email otp.", 410

        return redirect("/confirmEmail")

    return "Logging in..."


@app.route('/confirmEmail')
def confirmEmail():
    return "We have sent you an email. It will arrive shortly!"


@app.route('/signinWithGoogle')
def authGoogle():
    redirect_uri = request.url_root + 'auth/signin'
    return redirect(f'{SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to={redirect_uri}')


@app.route('/auth/signin', methods=['GET', 'POST'])
def authCallback():
    accessToken = None
    refreshToken = None

    if request.method == "POST":
        data = request.json
        accessToken = data.get('accessToken')
        refreshToken = data.get('refreshToken')

    if accessToken is not None:
        try:
            sessionData = client.auth.set_session(accessToken, refreshToken)
            session['accessToken'] = accessToken
            session['refreshToken'] = refreshToken
            session['email'] = str(sessionData.user.email)
        except Exception as E:
            logging.exception("Cannot set session data. ERROR:" + str(E))
            return "Cannot fetch data from the database.", 407

        try:
            data, count = client.table('User').select('email', count=CountMethod.exact).eq('email',
                                                                                           str(sessionData.user.email)).execute()
        except Exception as E:
            logging.exception("Cannot fetch data from the database. ERROR:" + str(E))
            return "Cannot fetch data from the database.", 408

        if count[1] == 0:
            return "Account creation process is proceeding", 202
        else:
            return "Account already found", 409
    else:
        return render_template("waiting_page.html")


@app.route('/dining')
def dining():
    return render_template('dining.html')


@app.route('/perfume-haven')
def perfumeHaven():
    return render_template('perfume_haven.html')


@app.route('/shopping')
def shopping():
    return render_template('shopping.html')


@app.route('/trackFlight', methods=['POST'])
def trackFlight():
    flightID = request.json.get("flightID")
    flightNumber = request.json.get("flightNumber")

    if 'email' in session:
        try:
            data, count = client.table('User').select('*').eq('email', str(session['email'])).execute()

            if len(data[1]) != 0:
                client.table('TrackFlight').insert(
                    {"flight_id": int(flightID), "user_id": int(data[1][0]['id']), "flight_number": flightNumber,
                     "user_email": str(session['email'])}).execute()
            else:
                return "Error", 411

        except Exception as E:
            logging.error("ERROR with inserting track flight data into DB: " + str(E))
            return "Error", 411

        return "Success", 203

    return "Could not track flight. Please make sure that you are logged in.", 411


@app.route('/sendFeedback', methods=['POST'])
def sendFeedback():
    data = request.json

    if 'email' in session:
        try:
            a = {"rating": data.get("rating"), "comment": data.get("comment"), "user_email": session['email']}
            client.table("Feedback").insert(a).execute()
            return "Feedback added", 200
        except Exception as E:
            logging.error("Could not add feedback to database. " + str(E))
            return "Could not add feedback to database.", 415
    else:
        return "Could not add feedback to database.", 415


@app.route('/getWishlist')
def getWishlist():
    if 'email' in session:
        data1, count = client.table('UserWishlist').select('*').eq('user_email', session['email']).execute()
        products = []

        for record in data1[1]:
            data, count = client.table('ShopItem').select('*').eq('id', record['item_id']).execute()
            products.append(data[1][0])

        return jsonify(products=products), 200

    return "Could not get the wishlist", 416


@app.route('/wishlist')
def wishlist():
    if "email" in session:
        return render_template("wishlist.html")
    else:
        return "Cannot access this page. Make sure that you are logged in.", 417


@app.route('/')
def home():
    return render_template('index.html')


@app.route('/en=it')
def italianHome():
    return render_template('home.html')


def callback1(payload):
    if 'table' in payload and payload['table'] == "Flight" and (
            payload['type'] == 'UPDATE' or payload['type'] == 'UPSERT'):
        data, count = client.table("TrackFlight").select("*").eq("flight_id", payload['record']['id']).execute()

        for record in data[1]:
            connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
            channel = connection.channel()
            channel.queue_declare(queue='email_queue')
            json_payload = json.dumps(payload)
            message = f'{record["user_email"]};{json_payload}'
            channel.basic_publish(exchange='', routing_key='email_queue', body=message)
            connection.close()
    elif 'table' in payload and payload['table'] == 'Flight' and payload['type'] == 'DELETE':
        data, count = client.table("TrackFlight").select("*").eq("flight_id", payload['old_record']['id']).execute()
        flightNumber = data[1][0]['flight_number']
        data, count = client.table("TrackFlight").select("*").eq("flight_number", flightNumber).execute()

        for record in data[1]:
            connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
            channel = connection.channel()
            channel.queue_declare(queue='email_queue')
            a = {"flight_number": flightNumber}
            message = f'{record["user_email"]};{json.dumps(a)}'
            channel.basic_publish(exchange='', routing_key='email_queue', body=message)
            connection.close()

        data, count = client.table("TrackFlight").delete().eq("flight_number", data[1][0]['flight_number']).execute()


def send_email(receiverEmail, payload):
    try:
        payload = json.loads(payload)
    except json.JSONDecodeError as e:
        logging.error(f"Error parsing JSON payload: {e}")
        return

    sender = "markhallak@outlook.com"
    message = MIMEMultipart("alternative")
    message['From'] = sender
    message['To'] = receiverEmail

    if "type" in payload and (payload["type"] == "UPDATE" or payload["type"] == "UPSERT"):
        message['Subject'] = "Change in the Flight"

        html = f"""
        <html>
        <body>
        Dear User,
        <br>
        <br>
        We are sad to inform you that there was some changes in the flight course.
        <br>
        <br>
        The <strong>new</strong> flight information is the following:
        <br>
        <br>
        <p><i>Flight number: </i> {payload['record']['flight_number']}</p>
        <p><i>Status: </i> {payload['record']['status']}</p>
        <p><i>Check In Row: </i> {payload['record']['check_in_row']}</p>
        <p><i>In-Flight Entertainment options: </i> {payload['record']['inflight_entertainment_option']}</p>
        <p><i>Meal Service: </i> {payload['record']['meal_service']}</p>
        <p><i>Scheduled Time: </i> {payload['record']['scheduled_time']}</p>
        <p>{("<i>Origin Location: </i> " + str(payload['record']['origin_location']) if payload['record']['isArriving'] is True else "<i>Destination Location: </i>" + str(str(payload['record']['destination_location'])))}</p>
        <p><i>Airline Name: </i> {payload['record']['airline_name']}</p>
        <p><i>Terminal Name: </i> {payload['record']['terminal_name']}</p>
        <p><i>Gate Name: </i> {payload['record']['gate_name']}</p>
        <p><i>Scheduled Day: </i> {payload['record']['scheduled_day']}</p>
        <br>
        <br>
        Best Regards,
        <br>
        ASM Team
        </body>
        </html>
        """

        message.attach(MIMEText(html, "html"))
    elif "flight_number" in payload:
        message['Subject'] = "Flight Deleted"
        html = f"""
        <html>
        <body>
        Dear User,
        <br>
        <br>
        Unfortunately, your flight <strong>#{payload['flight_number']}</strong> is not <strong>available</strong> anymore.
        <br>
        <br>
        Best Regards,
        <br>
        ASM Team
        """
        message.attach(MIMEText(html, "html"))

    try:
        smtpObj = smtplib.SMTP('smtp-mail.outlook.com', 587)
    except Exception as E:
        logging.exception("Error with sending email on port 587. " + str(E))
        smtpObj = smtplib.SMTP_SSL('smtp-mail.outlook.com', 465)

    try:
        smtpObj.ehlo()
        smtpObj.starttls()
        smtpObj.login('markhallak@outlook.com', "WRVRyt!@,.")
        smtpObj.sendmail('markhallak@outlook.com', receiverEmail, message.as_string())
        smtpObj.quit()
    except Exception as E:
        logging.error("Error with the SMTP Server. " + str(E))


def startFlaskApp():
    app.run(host='0.0.0.0', port=8000)


def startSocket():
    URL = f"wss://{SUPABASE_ID}.supabase.co/realtime/v1/websocket?apikey={SUPABASE_KEY}&vsn=1.0.0"

    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)

    try:
        flag = False

        while not flag:
            try:
                s = Socket(URL)
                flag = True
            except Exception as E:
                logging.error("Cannot initialize the realtime socket. " + str(E))

        flag = False

        while not flag:
            try:
                s.connect()
                flag = True
            except Exception as E:
                logging.error("Cannot connect socket. " + str(E))

        channel_1 = s.set_channel("realtime:*")
        channel_1.join().on("*", callback1)
        s.listen()

        loop.run_forever()
    finally:
        loop.close()


def parse_email_info(body):
    body_str = body.decode('utf-8')
    email_details = body_str.split(';')

    return {
        'receiverEmail': email_details[0],
        'payload': email_details[1]
    }


def start_pika_consumer():
    def callback(ch, method, properties, body):
        email_info = parse_email_info(body)
        send_email(email_info['receiverEmail'], email_info['payload'])

    connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
    channel = connection.channel()
    channel.queue_declare(queue='email_queue')
    channel.basic_consume(queue='email_queue', on_message_callback=callback, auto_ack=True)
    channel.start_consuming()


if __name__ == '__main__':
    t1 = Thread(target=startFlaskApp)
    t2 = Thread(target=startSocket)
    tp = Thread(target=start_pika_consumer)
    tp.start()
    t1.start()
    t2.start()
    logging.getLogger("pika").setLevel(logging.WARNING)
    tp.join()
    t1.join()
    t2.join()
