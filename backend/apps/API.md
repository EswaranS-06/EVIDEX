🧪 HOW TO TEST JWT AUTH USING POSTMAN (BEGINNER GUIDE)
🔴 BEFORE YOU START (VERY IMPORTANT)

Make sure:

    Django server is running

uv run python3 manage.py runserver

URL shown is:

    http://127.0.0.1:8000/

    You already created:

        A normal user

        Assigned a role via admin

🟢 STEP 1: OPEN POSTMAN & CREATE COLLECTION

    Open Postman

    Click Collections → New Collection

    Name it:

    EVIDEX – Phase 1

This keeps things clean.
🟢 STEP 2: TEST LOGIN API (MOST IMPORTANT)
➤ Create Request

    Inside collection → Add Request

    Name:

Login

Method: POST

URL:

    http://127.0.0.1:8000/api/auth/login/

➤ Set Headers

Click Headers tab → add:
Key	Value
Content-Type	application/json
➤ Set Body

    Click Body

    Select raw

    Select JSON

Paste this (replace username/password):

{
  "username": "your_username",
  "password": "your_password"
}

➤ Click Send
✅ SUCCESS RESPONSE (IMPORTANT)

You should see:

{
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

🎉 JWT LOGIN WORKS
🟢 STEP 3: SAVE ACCESS TOKEN (CRITICAL)

    Copy the access token

    Keep it safe (we’ll use it now)

⚠️ Do NOT use refresh token for APIs
🟢 STEP 4: TEST /me API (PROTECTED)
➤ Create Request

    Add new request

    Name:

Get Me

Method: GET

URL:

    http://127.0.0.1:8000/api/auth/me/

➤ Add Authorization Header (THIS IS KEY)

Go to Headers tab and add:
Key	Value
Authorization	Bearer YOUR_ACCESS_TOKEN

⚠️ It must be exactly:

Bearer <space> ACCESS_TOKEN

Example:

Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

➤ Click Send
✅ EXPECTED RESPONSE

{
  "id": 2,
  "username": "testuser",
  "email": "test@mail.com",
  "role": "Pentester"
}

🎉 This proves:

    JWT is valid

    User is authenticated

    Role is being returned

🟢 STEP 5: TEST SECURITY (WITHOUT TOKEN)

Now remove Authorization header completely.

Click Send again.
❌ EXPECTED RESPONSE

401 Unauthorized

✅ This means your backend is SECURE

1️⃣ Login as Admin

Get access token.
2️⃣ Create User

POST

http://127.0.0.1:8000/api/auth/register/

Headers:

Authorization: Bearer ADMIN_ACCESS_TOKEN
Content-Type: application/json

Body:

{
  "username": "pentester1",
  "email": "pentester1@test.com",
  "password": "test12345"
}

✅ Response

{
  "message": "User created successfully",
  "username": "pentester1",
  "role": "Pentester"
}

3️⃣ Login with new user

POST /api/auth/login/

✅ Works → user auto‑assigned as Pentester