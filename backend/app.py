from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
import pandas as pd
import time
import datetime
from datetime import datetime as dt, timezone
import threading
from waitress import serve

# Connect to MongoDB
client = MongoClient('mongodb://localhost:27017/')
db = client['mock_database']
snapshot_collection_name = 'snapshots'
df = pd.read_csv('sample.csv')

app = Flask(__name__)
CORS(app)

def create_snapshot():
    current_time = dt.now().time()
    market_open = datetime.time(9, 15)
    market_close = datetime.time(18, 30)

    df = pd.read_csv('sample.csv')
    df['timestamp'] = int(time.time())  # Store the timestamp as epoch time in seconds
    df.drop('_id', axis=1, inplace=True)

    # Get data from MongoDB
    # cursor = db[collection_name].find()
    # df = pd.DataFrame(list(cursor))

    if market_open <= current_time <= market_close:
        data_snapshot = df.to_dict('records')
        db[snapshot_collection_name].insert_many(data_snapshot)
        print("Snapshot saved at:", current_time)

def wait_until_next_minute():
    now = dt.now()
    next_minute = (now + datetime.timedelta(minutes=1)).replace(second=0, microsecond=0)
    sleep_duration = (next_minute - now).total_seconds()
    time.sleep(sleep_duration)

def snapshot_loop():
    while True:
        create_snapshot()
        wait_until_next_minute()

@app.route('/', methods=['GET'])
def index():
    return "Hello, world!"

@app.route('/distinct_values', methods=['GET'])
def get_distinct_values():
    distinct_algonames = df['algoname'].unique().tolist()
    distinct_clientIDs = df['clientID'].unique().tolist()
    distinct_symbols = df['symbol'].unique().tolist()

    response = {
        'distinct_algonames': distinct_algonames,
        'distinct_clientIDs': distinct_clientIDs,
        'distinct_symbols': distinct_symbols
    }

    return jsonify(response)

@app.route('/user_pnl', methods=['POST'])
def get_user_pnl():
    algoname = request.json.get('algoname')
    clientID = request.json.get('clientID')
    symbol = request.json.get('symbol')
    from_datetime_str = request.json.get('fromDateTime')
    to_datetime_str = request.json.get('toDateTime')

    # print(request.json)

    # Convert fromDateTime and toDateTime to Unix epoch time
    from_datetime = int(dt.strptime(from_datetime_str, '%Y-%m-%dT%H:%M:%S.%fZ')
                        .replace(tzinfo=timezone.utc).timestamp())
    to_datetime = int(dt.strptime(to_datetime_str, '%Y-%m-%dT%H:%M:%S.%fZ')
                        .replace(tzinfo=timezone.utc).timestamp())

    # print(from_datetime, to_datetime)
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




    try:
        # Execute the aggregation pipeline
        cursor = db[snapshot_collection_name].aggregate(pipeline)

        # Convert the cursor result to a list of dictionaries
        pnl_data = list(cursor)

        return jsonify({'user_pnl': pnl_data})

    except Exception as error:
        print("hello ", error)
        return jsonify({'error': error})
    

@app.route('/live_pnl', methods=['POST'])
def get_live_pnl():
    algoname = request.json.get('algoname')
    clientID = request.json.get('clientID')
    symbol = request.json.get('symbol')


    print(request.json)

    from_datetime = dt.now().replace(hour=6, minute=0, second=0, microsecond=0, tzinfo=timezone.utc)
    # print(from_datetime)
    # print(from_datetime, to_datetime)
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

    try:
        # Execute the aggregation pipeline
        cursor = db[snapshot_collection_name].aggregate(pipeline)

        # Convert the cursor result to a list of dictionaries
        pnl_data = list(cursor)

        return jsonify({'live_pnl': pnl_data})

    except Exception as error:
        print("hello ", error)
        return jsonify({'error': error})




if __name__ == '__main__':
    # Run the Flask app and schedule the snapshot creation in a separate thread
    threading.Thread(target=snapshot_loop).start()

    print("hello hello!")
    serve(app, host='0.0.0.0', port=5001)
