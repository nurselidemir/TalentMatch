import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv

load_dotenv()

MAIL_USER = os.getenv("MAIL_USER")
MAIL_PASS = os.getenv("MAIL_PASS")

def send_match_email(to_email, job_desc, match_score):
    subject = "TalentMatch: A job opportunity that matches your profile"
    body = f"""
Hello,

Your profile matches the following job posting:

 Job Description:
{job_desc[:300]}...

 Match Score: {round(match_score * 100)}%

Best regards,
TalentMatch Team
"""

    msg = MIMEMultipart()
    msg["From"] = MAIL_USER
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(MAIL_USER, MAIL_PASS)
            server.sendmail(MAIL_USER, to_email, msg.as_string())
        print(f" Email sent to: {to_email}")
    except Exception as e:
        print(f" Failed to send email to: {to_email}\n{e}")
