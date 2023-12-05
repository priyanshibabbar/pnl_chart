from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
import pandas as pd
import time
import datetime
from datetime import datetime as dt, timezone
import threading
from waitress import serve
import configparser
import logging  # Import the logging module
from logging.handlers import TimedRotatingFileHandler
import os

app = Flask(__name__)
CORS(app)

# Set up logging configuration with a TimedRotatingFileHandler
log_folder = 'logs'
if not os.path.exists(log_folder):
    os.makedirs(log_folder)

log_file_path = os.path.join(log_folder, 'app.log')

# Set up logging configuration
logging.basicConfig(level=logging.INFO)
# Set up logging configuration with a TimedRotatingFileHandler
log_formatter = logging.Formatter('%(asctime)s [%(levelname)s] %(message)s')
log_handler = TimedRotatingFileHandler('logs/app.log', when='midnight', backupCount=7)
log_handler.setLevel(logging.INFO)
log_handler.setFormatter(log_formatter)
logging.getLogger().addHandler(log_handler)

config = configparser.ConfigParser()
try:
    config.read('config.ini')
except Exception as e:
    logging.error(f"Error reading config.ini: {e}")
    raise

# Flask app host and port configuration
HOST = config['App'].get('HOST', '0.0.0.0')
PORT = config['App'].getint('PORT', 5001)

# Flask app configuration
try:
    app.config['SECRET_KEY'] = config['General']['SECRET_KEY']
    app.config['DEBUG'] = config.getboolean('General', 'DEBUG')
except Exception as e:
    logging.error(f"Error configuring Flask app: {e}")
    raise

# MongoDB configuration
try:
    DB_HOST = config['Database']['DB_HOST']
    DB_PORT = config.getint('Database', 'DB_PORT')
    DB_NAME = config['Database']['DB_NAME']
    SNAPSHOT_COLLECTION_NAME = config['Database']['SNAPSHOT_COLLECTION_NAME']
    COLLECTION_NAME = config['Database']['COLLECTION_NAME']
except Exception as e:
    logging.error(f"Error configuring MongoDB: {e}")
    raise

# Connect to MongoDB using MongoClient
try:
    client = MongoClient(f'mongodb://{DB_HOST}:{DB_PORT}/')
    db = client[DB_NAME]
except Exception as e:
    logging.error(f"Error connecting to MongoDB: {e}")
    raise

def create_snapshot():
    try:
        current_time = dt.now().time()
        market_open = datetime.time(9, 15)
        market_close = datetime.time(18, 30)

        # Get data from MongoDB
        cursor = db[COLLECTION_NAME].find()
        df = pd.DataFrame(list(cursor))
        df['timestamp'] = int(time.time())  # Store the timestamp as epoch time in seconds
        df.drop('_id', axis=1, inplace=True)

        if market_open <= current_time <= market_close:
            data_snapshot = df.to_dict('records')
            db[SNAPSHOT_COLLECTION_NAME].insert_many(data_snapshot)
            logging.info(f"Snapshot saved at: {current_time}")

    except Exception as e:
        logging.error(f"Error creating snapshot: {e}")

def wait_until_next_minute():
    try:
        now = dt.now()
        next_minute = (now + datetime.timedelta(minutes=1)).replace(second=0, microsecond=0)
        sleep_duration = (next_minute - now).total_seconds()
        time.sleep(sleep_duration)

    except Exception as e:
        logging.error(f"Error waiting until next minute: {e}")

def snapshot_loop():
    try:
        while True:
            create_snapshot()
            wait_until_next_minute()

    except Exception as e:
        logging.error(f"Error in snapshot loop: {e}")

@app.route('/', methods=['GET'])
def index():
    return "Hello, world!"

@app.route('/distinct_values', methods=['GET'])
def get_distinct_values():
    try:
        # Get data from MongoDB
        cursor = db[COLLECTION_NAME].find()
        df = pd.DataFrame(list(cursor))

        distinct_algonames = df['algoname'].unique().tolist()
        distinct_clientIDs = df['clientID'].unique().tolist()
        distinct_symbols = df['symbol'].unique().tolist()

        response = {
            'distinct_algonames': distinct_algonames,
            'distinct_clientIDs': distinct_clientIDs,
            'distinct_symbols': distinct_symbols
        }

        logging.info("Distinct values retrieved successfully")
        return jsonify(response)

    except Exception as e:
        logging.error(f"Error in get_distinct_values: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/user_pnl', methods=['POST'])
def get_user_pnl():
    try:
        algoname = request.json.get('algoname')
        clientID = request.json.get('clientID')
        symbol = request.json.get('symbol')
        from_datetime_str = request.json.get('fromDateTime')
        to_datetime_str = request.json.get('toDateTime')

        if not all([algoname, clientID, symbol, from_datetime_str, to_datetime_str]):
            raise ValueError("Missing required input data")

        # Convert fromDateTime and toDateTime to Unix epoch time
        from_datetime = int(dt.strptime(from_datetime_str, '%Y-%m-%dT%H:%M:%S.%fZ')
                            .replace(tzinfo=timezone.utc).timestamp())
        to_datetime = int(dt.strptime(to_datetime_str, '%Y-%m-%dT%H:%M:%S.%fZ')
                            .replace(tzinfo=timezone.utc).timestamp())

        # Use aggregation pipeline to filter and project the data based on the time range
        pipeline = [
            {
                '$match': {
                    'algoname': algoname,
                    'clientID': clientID,
                    'symbol': symbol,
                    'timestamp': {'$gte': from_datetime, '$lte': to_datetime}
                }
            },
            {
                '$project': {
                    'sum': 1,
                    'timestamp': {
                        '$dateToString': {
                            'format': '%Y-%m-%d %H:%M:%S',
                            'date': {
                                '$add': [
                                    {
                                        '$toDate': {
                                            '$multiply': ['$timestamp', 1000]
                                        }
                                    },
                                    {
                                        '$multiply': [5 * 60 * 60 * 1000 + 30 * 60 * 1000, 1]  # Add 5 hours and 30 minutes in milliseconds
                                    }
                                ]
                            }
                        }
                    },
                    '_id': 0
                }
            }
        ]

        # Execute the aggregation pipeline
        cursor = db[SNAPSHOT_COLLECTION_NAME].aggregate(pipeline)

        # Convert the cursor result to a list of dictionaries
        pnl_data = list(cursor)

        return jsonify({'user_pnl': pnl_data})

    except ValueError as ve:
        logging.error(f"Invalid input data: {ve}")
        return jsonify({'error': 'Invalid input data'}), 400
    except Exception as e:
        logging.error(f"Error in get_user_pnl: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/live_pnl', methods=['POST'])
def get_live_pnl():
    try:
        algoname = request.json.get('algoname')
        clientID = request.json.get('clientID')
        symbol = request.json.get('symbol')

        if not all([algoname, clientID, symbol]):
            raise ValueError("Missing required input data")

        from_datetime = dt.now().replace(hour=6, minute=0, second=0, microsecond=0, tzinfo=timezone.utc)

        # Use aggregation pipeline to filter and project the data based on the time range
        pipeline = [
            {
                '$match': {
                    'algoname': algoname,
                    'clientID': clientID,
                    'symbol': symbol,
                    # 'timestamp': {'$gte': from_datetime}
                }
            },
            {
                '$project': {
                    'sum': 1,
                    'timestamp': {
                        '$dateToString': {
                            'format': '%Y-%m-%d %H:%M:%S',
                            'date': {
                                '$add': [
                                    {
                                        '$toDate': {
                                            '$multiply': ['$timestamp', 1000]
                                        }
                                    },
                                    {
                                        '$multiply': [5 * 60 * 60 * 1000 + 30 * 60 * 1000, 1]  # Add 5 hours and 30 minutes in milliseconds
                                    }
                                ]
                            }
                        }
                    },
                    '_id': 0
                }
            }
        ]

        # Execute the aggregation pipeline
        cursor = db[SNAPSHOT_COLLECTION_NAME].aggregate(pipeline)

        # Convert the cursor result to a list of dictionaries
        pnl_data = list(cursor)

        return jsonify({'live_pnl': pnl_data})

    except ValueError as ve:
        logging.error(f"Invalid input data: {ve}")
        return jsonify({'error': 'Invalid input data'}), 400
    except Exception as e:
        logging.error(f"Error in get_live_pnl: {e}")
        return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    # Run the Flask app and schedule the snapshot creation in a separate thread
    threading.Thread(target=snapshot_loop).start()

    logging.info(f"Running on http://{HOST}:{PORT}")
    serve(app, host=HOST, port=PORT)
