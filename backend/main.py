import os
import snowflake.connector
import flask
from flask import request
import flask_cors
from dotenv import load_dotenv

load_dotenv()

app = flask.Flask(__name__)
cors = flask_cors.CORS(app, origins=["*"])

import ftplib
import os


FTP_HOST = "ftp.jaist.ac.jp"
FTP_USER = "anonymous"
FTP_PASS = ""


@app.route("/")
def hello():
    return "Hello, World!"


@app.route("/ftp/upload", methods=["POST", "GET"])
def ftp_upload():
    ftp = ftplib.FTP(FTP_HOST)
    ftp.encoding = "utf-8"
    ftp.login()
    print(ftp.cwd("/pub/Linux/ArchLinux/iso/latest/"))
    print(ftp.nlst())
    return ftp.getwelcome()


@app.route("/upload", methods=["POST"])
def upload():
    print(request.files)
    stage = request.form["stage"]
    file = request.files.get("file")
    ftpUrl = request.form.get("ftpUrl", "").replace(f"https://{FTP_HOST}/", "")

    tmp_folder = os.path.join(str(os.getcwd()), "tmp", str(stage))
    os.makedirs(tmp_folder, exist_ok=True)
    if not file and not ftpUrl:
        return "No file uploaded"
    elif ftpUrl:
        ftp = ftplib.FTP(FTP_HOST)
        ftp.encoding = "utf-8"
        ftp.login()
        path = os.path.join(tmp_folder, str(ftpUrl.split("/")[-1]))
        ftp.retrbinary("RETR %s" % ftpUrl, open(path, "wb").write)
    elif file:
        path = os.path.join(tmp_folder, str(file.filename))
        file.save(path)

    authorization = flask.request.headers["Authorization"].split(" ")[1]

    ctx = snowflake.connector.connect(
        host=os.environ["SNOWFLAKE_ACCOUNT_URL"],
        account=os.environ["SNOWFLAKE_ACCOUNT_ID"],
        authenticator="oauth",
        token=authorization,
        warehouse="COMPUTE_WH",
        database="TEST_APP_2",
        schema="TEST_SCHEMA",
        client_session_keep_alive=True,
    )
    cursor = ctx.cursor()

    data_upload = cursor.execute_async(f"PUT file://{path} @{stage}", _show_progress_bar=True)
    print(data_upload)
    ctx.commit()
    ctx.close()

    return "Success"


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=8000)
